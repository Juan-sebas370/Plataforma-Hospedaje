package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.entity.TarifaReserva;
import com.hotelsebasitian.repository.TarifaReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Tarifas de reserva (editables desde SOGO) y cálculo del precio en el
 * servidor. El precio que envía el navegador se ignora: el total se calcula
 * aquí con las tarifas de la base de datos, para que nadie pueda pagar menos
 * manipulando la página.
 *
 * Regla (la misma que muestra la web): tarifa por persona de la temporada de
 * llegada × noches (pasadía / grupo: × 1 día). Adultos y niños de 11 años en
 * adelante pagan tarifa completa, de 4 a 10 años el 60 % y de 0 a 3 años no pagan.
 */
@Service
@RequiredArgsConstructor
public class TarifaService {

    private static final double FACTOR_NINOS_4_A_10 = 0.6;

    private final TarifaReservaRepository tarifas;
    private final CalendarioTemporadas calendario;

    @Transactional(readOnly = true)
    public List<TarifaReserva> listar() {
        return tarifas.findAll();
    }

    /**
     * Si la tabla está vacía (base nueva sin el script 19 de SOGO), crea las
     * tarifas iniciales para que la web pueda cotizar. SOGO las ajusta después.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void crearTarifasIniciales() {
        if (tarifas.count() > 0) return;
        LocalDateTime ahora = LocalDateTime.now();
        tarifas.saveAll(List.of(
                new TarifaReserva(null, "individual", "Hospedaje individual", 35000.0, 45000.0, 60000.0, ahora),
                new TarifaReserva(null, "familiar", "Familia o grupo", 35000.0, 45000.0, 60000.0, ahora),
                new TarifaReserva(null, "pasadia", "Pasadía", 35000.0, 45000.0, 60000.0, ahora),
                new TarifaReserva(null, "grupal", "Grupo de trabajo", 60000.0, 75000.0, 90000.0, ahora)));
    }

    /** Calcula y fija en la reserva: temporada, noches, precio por noche y total. */
    @Transactional(readOnly = true)
    public void aplicarPrecio(Reserva reserva) {
        String tipo = reserva.getTipoReserva() == null ? "individual" : reserva.getTipoReserva();
        TarifaReserva tarifa = tarifas.findByTipoReserva(tipo)
                .orElseThrow(() -> new RuntimeException("No hay tarifa configurada para el tipo de reserva " + tipo));
        if (reserva.getFechaIngreso() == null) {
            throw new RuntimeException("La reserva necesita fecha de ingreso");
        }

        String temporada = temporada(reserva.getFechaIngreso());
        double porPersona = tarifa.precioEn(temporada);
        int adultos = valor(reserva.getHuespedes());
        int ninos11 = valor(reserva.getNinos11());
        int ninos10 = valor(reserva.getNinos10());
        if (adultos < 1) throw new RuntimeException("Debe haber al menos un adulto en la reserva");

        double porNoche = (adultos + ninos11) * porPersona + ninos10 * porPersona * FACTOR_NINOS_4_A_10;
        boolean deDia = "pasadia".equals(tipo) || "grupal".equals(tipo);
        int noches = deDia ? 1 : Math.max(valor(reserva.getNoches()), 1);

        reserva.setTemporada(temporada);
        reserva.setNoches(noches);
        reserva.setPrecioNoche(porNoche);
        reserva.setPrecioTotal(porNoche * noches);
    }

    /** Temporada del día según el calendario que se gestiona en SOGO (Alojamiento › Tarifas y temporadas). */
    public String temporada(LocalDate d) {
        return calendario.temporada(d);
    }

    private int valor(Integer n) {
        return n == null ? 0 : Math.max(n, 0);
    }
}
