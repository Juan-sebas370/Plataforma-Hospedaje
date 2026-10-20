package com.hotelsebasitian.service;

import com.hotelsebasitian.dto.WompiCheckoutResponse;
import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.HabitacionRepository;
import com.hotelsebasitian.repository.PagoRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservaService {

    /** Las fechas de las reservas son fechas de Colombia, aunque el servidor esté en otra zona. */
    private static final ZoneId ZONA_HOTEL = ZoneId.of("America/Bogota");
    private static final Set<String> TIPOS = Set.of("individual", "familiar", "pasadia", "grupal");
    private static final Set<String> MODOS = Set.of("habitaciones", "piso", "casa");
    private static final Set<String> ESTADOS = Set.of("PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA", "NO_PRESENTADA");
    private static final int MAX_NOCHES = 60;
    private static final int MAX_ANIOS_ANTICIPACION = 2;
    /** Mismas reglas que el paso "Tus datos" de la web (reserva-estado.ts). */
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final PagoRepository pagoRepository;
    private final CorreoReservaService correoReserva;
    private final WompiService wompiService;
    private final TarifaService tarifaService;

    // ── Consultas ─────────────────────────────────────────

    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    /**
     * Reserva que puede ver quien hace la petición: un administrador, el usuario
     * dueño de la reserva o quien tenga el código de acceso que se entregó al
     * crearla. En cualquier otro caso responde 404, igual que si no existiera,
     * para no revelar qué ids están ocupados.
     */
    public Reserva obtenerConAcceso(Long id, String codigo, boolean esAdmin, Long usuarioId) {
        Reserva reserva = obtenerPorId(id);
        boolean esDueno = usuarioId != null && usuarioId.equals(reserva.getUsuarioId());
        if (esAdmin || esDueno || codigoValido(reserva, codigo)) {
            return reserva;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
    }

    private static boolean codigoValido(Reserva reserva, String codigo) {
        if (codigo == null || reserva.getCodigoAcceso() == null) return false;
        return MessageDigest.isEqual(
                reserva.getCodigoAcceso().getBytes(StandardCharsets.UTF_8),
                codigo.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Arma el payload firmado que el Widget de Checkout de Wompi necesita
     * para cobrar una reserva. El monto sale siempre de precioTotal ya
     * calculado y validado en el servidor (ver {@link #crear}) — nunca se
     * confía en un monto que mande el cliente en este paso.
     */
    public WompiCheckoutResponse generarCheckoutWompi(Long reservaId) {
        if (!wompiService.estaConfigurado()) {
            throw new RuntimeException(
                "Los pagos en línea todavía no están configurados. Contacta al hotel para completar tu reserva.");
        }

        Reserva reserva = obtenerPorId(reservaId);

        if (!"PENDIENTE".equals(reserva.getEstado())) {
            throw new RuntimeException("Esta reserva no admite pago (estado: " + reserva.getEstado() + ")");
        }
        if (reserva.getPrecioTotal() == null || reserva.getPrecioTotal() <= 0) {
            throw new RuntimeException("La reserva no tiene un monto válido para cobrar");
        }

        String referencia = "HS-" + reserva.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        long montoEnCentavos = Math.round(reserva.getPrecioTotal() * 100);
        String moneda = "COP";
        String firma = wompiService.firmarIntegridad(referencia, montoEnCentavos, moneda);

        return WompiCheckoutResponse.builder()
                .publicKey(wompiService.getPublicKey())
                .reference(referencia)
                .amountInCents(montoEnCentavos)
                .currency(moneda)
                .signature(firma)
                .build();
    }

    public List<Reserva> obtenerPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    // ── Disponibilidad ────────────────────────────────────

    /**
     * Devuelve un mapa con:
     *   - habitacionesOcupadas: IDs de habitaciones con reserva activa en ese rango
     *   - pisosOcupados:        ["piso1", "piso2", "completo"] según corresponda
     *   - casaOcupada:          true si la casa completa no se puede reservar
     *   - mensaje:              texto descriptivo para mostrar en el frontend
     * Usa exactamente las mismas reglas que {@link #crear} para decidir choques.
     */
    public Map<String, Object> verificarDisponibilidad(LocalDate fechaIngreso, LocalDate fechaSalida) {
        if (fechaSalida != null && !fechaSalida.isAfter(fechaIngreso)) {
            throw new RuntimeException("La fecha de salida debe ser posterior a la de ingreso");
        }
        // Para pasadía fechaSalida puede ser null — usamos el mismo día como fin
        LocalDate fin = (fechaSalida != null) ? fechaSalida : fechaIngreso.plusDays(1);

        List<Reserva> reservasEnRango = reservaRepository.findReservasEnRango(fechaIngreso, fin);
        List<Habitacion> todas = habitacionRepository.findAll();

        Set<Long> habOcupadas = new HashSet<>();
        for (Reserva r : reservasEnRango) {
            habOcupadas.addAll(habitacionesBloqueadas(r, todas));
        }
        boolean piso1Ocupado = todas.stream().anyMatch(h -> Objects.equals(h.getPiso(), 1) && habOcupadas.contains(h.getId()));
        boolean piso2Ocupado = todas.stream().anyMatch(h -> Objects.equals(h.getPiso(), 2) && habOcupadas.contains(h.getId()));
        // La casa completa choca con cualquier reserva activa en esas fechas (también pasadías).
        boolean casaOcupada = !reservasEnRango.isEmpty();

        List<String> espaciosOcupados = new ArrayList<>();
        if (piso1Ocupado) espaciosOcupados.add("piso1");
        if (piso2Ocupado) espaciosOcupados.add("piso2");
        if (casaOcupada)  espaciosOcupados.add("completo");

        String mensaje = construirMensajeDisponibilidad(piso1Ocupado && piso2Ocupado, piso1Ocupado, piso2Ocupado,
                                                         habOcupadas, fechaIngreso, fechaSalida);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("habitacionesOcupadas", new ArrayList<>(habOcupadas));
        resultado.put("espaciosOcupados",     espaciosOcupados);
        resultado.put("piso1Ocupado",         piso1Ocupado);
        resultado.put("piso2Ocupado",         piso2Ocupado);
        resultado.put("casaOcupada",          casaOcupada);
        resultado.put("disponible",           habOcupadas.isEmpty() && !casaOcupada);
        resultado.put("mensaje",              mensaje);
        return resultado;
    }

    private String construirMensajeDisponibilidad(
            boolean casaOcupada, boolean piso1Ocupado, boolean piso2Ocupado,
            Set<Long> habOcupadas, LocalDate ingreso, LocalDate salida) {

        if (casaOcupada) {
            return "La casa completa no está disponible en las fechas seleccionadas (" +
                   ingreso + (salida != null ? " al " + salida : "") + "). " +
                   "Por favor elige otras fechas.";
        }
        List<String> bloqueados = new ArrayList<>();
        if (piso1Ocupado) bloqueados.add("el Piso 1");
        if (piso2Ocupado) bloqueados.add("el Piso 2");
        if (!bloqueados.isEmpty()) {
            return String.join(" y ", bloqueados) + " no está disponible en esas fechas. " +
                   "Puedes reservar las habitaciones disponibles del otro piso.";
        }
        if (!habOcupadas.isEmpty()) {
            return "Algunas habitaciones no están disponibles en las fechas seleccionadas. " +
                   "Las habitaciones marcadas en rojo ya tienen reserva activa.";
        }
        return "";
    }

    // ── Crear ─────────────────────────────────────────────

    /**
     * Serializa la creación y modificación de reservas: sin esto, dos solicitudes
     * simultáneas para las mismas fechas/espacio pueden pasar
     * {@link #validarDisponibilidad} antes de que cualquiera de las dos se guarde
     * (check-then-act). El guardado ocurre DENTRO del lock (sin @Transactional
     * envolvente, save() confirma al instante) para que la siguiente solicitud ya
     * vea la reserva. Alcanza porque la app corre como una única instancia; con
     * varias instancias haría falta bloqueo a nivel de base de datos.
     */
    private final ReentrantLock reservaLock = new ReentrantLock();

    /**
     * Crea una reserva desde la web. Todo lo que no sean las elecciones del
     * huésped lo fija el servidor: id, estado, precio, temporada, usuario y
     * código de acceso.
     *
     * @param usuarioId usuario con sesión iniciada, o null si reserva sin cuenta
     */
    public Reserva crear(Reserva reserva, Long usuarioId) {
        reserva.setId(null);
        reserva.setUsuarioId(usuarioId);
        reserva.setEstado("PENDIENTE");
        reserva.setCodigoAcceso(nuevoCodigo());
        validarNueva(reserva);

        Reserva guardada;
        reservaLock.lock();
        try {
            validarDisponibilidad(reserva);
            reserva.calcularNoches();   // desde las fechas, nunca el valor que manda el navegador
            // El precio lo calcula el servidor con las tarifas de la base de
            // datos (editables en SOGO); el que manda el navegador se ignora.
            tarifaService.aplicarPrecio(reserva);
            reserva.setFechaCreacion(LocalDateTime.now());
            reserva.setFechaModificacion(LocalDateTime.now());
            guardada = reservaRepository.save(reserva);
        } finally {
            reservaLock.unlock();
        }
        // Correo "recibimos tu reserva" con el enlace para pagar (se envía en segundo plano)
        try {
            correoReserva.reservaRecibida(guardada);
        } catch (RuntimeException e) {
            log.error("No se pudo preparar el correo de la reserva {}", guardada.getId(), e);
        }
        return guardada;
    }

    private static String nuevoCodigo() {
        byte[] bytes = new byte[24];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Reglas de una reserva nueva hecha desde la web; normaliza tipo, espacio y habitaciones. */
    private void validarNueva(Reserva r) {
        if (r.getTipoReserva() == null || !TIPOS.contains(r.getTipoReserva())) {
            throw new RuntimeException("Tipo de reserva no válido");
        }
        LocalDate hoy = LocalDate.now(ZONA_HOTEL);
        if (r.getFechaIngreso() == null) {
            throw new RuntimeException("La reserva necesita fecha de ingreso");
        }
        if (r.getFechaIngreso().isBefore(hoy)) {
            throw new RuntimeException("La fecha de ingreso no puede estar en el pasado");
        }
        if (r.getFechaIngreso().isAfter(hoy.plusYears(MAX_ANIOS_ANTICIPACION))) {
            throw new RuntimeException("Solo se reciben reservas con hasta " + MAX_ANIOS_ANTICIPACION + " años de anticipación");
        }

        if (esReservaDeDia(r)) {
            // Pasadía y grupo de trabajo: un solo día, áreas comunes, sin habitaciones.
            r.setFechaSalida(null);
            r.setModoEspacio(null);
            r.setEspacio(null);
            r.setHabitacionId(null);
            r.setHabitacionesIds(null);
        } else {
            validarFechasHospedaje(r);
            normalizarEspacio(r);
        }
        validarPersonas(r);
        validarContacto(r);
    }

    private void validarFechasHospedaje(Reserva r) {
        if (r.getFechaSalida() == null) {
            throw new RuntimeException("El hospedaje necesita fecha de salida");
        }
        if (!r.getFechaSalida().isAfter(r.getFechaIngreso())) {
            throw new RuntimeException("La fecha de salida debe ser posterior a la de ingreso");
        }
        if (ChronoUnit.DAYS.between(r.getFechaIngreso(), r.getFechaSalida()) > MAX_NOCHES) {
            throw new RuntimeException("La estadía máxima es de " + MAX_NOCHES + " noches. Para estadías más largas escríbenos");
        }
    }

    /**
     * La web y SOGO guardan `modoEspacio` (habitaciones | piso | casa) y en
     * `espacio` los pisos que toca (piso1 | piso2 | completo), incluso cuando se
     * reservan habitaciones sueltas. Aquí se valida esa combinación y se
     * recalcula `espacio` desde las habitaciones elegidas.
     */
    private void normalizarEspacio(Reserva r) {
        Set<Long> ids = idsSeleccionados(r);
        String modo = r.getModoEspacio();
        if (modo == null) {
            modo = !ids.isEmpty() ? "habitaciones" : "completo".equals(r.getEspacio()) ? "casa" : "piso";
        }
        if (!MODOS.contains(modo)) {
            throw new RuntimeException("Modo de espacio no válido");
        }
        r.setModoEspacio(modo);

        switch (modo) {
            case "casa" -> r.setEspacio("completo");
            case "piso" -> {
                if (!"piso1".equals(r.getEspacio()) && !"piso2".equals(r.getEspacio())) {
                    throw new RuntimeException("Elige el piso que quieres reservar");
                }
            }
            default -> {
                if (ids.isEmpty()) {
                    throw new RuntimeException("Elige al menos una habitación");
                }
                List<Habitacion> elegidas = habitacionRepository.findAllById(ids);
                if (elegidas.size() != ids.size()) {
                    throw new RuntimeException("Alguna de las habitaciones elegidas no existe");
                }
                Set<Integer> pisos = elegidas.stream().map(Habitacion::getPiso).filter(Objects::nonNull).collect(Collectors.toSet());
                r.setEspacio(pisos.size() > 1 ? "completo" : pisos.contains(2) ? "piso2" : "piso1");
            }
        }
        if (!ids.isEmpty()) {
            r.setHabitacionesIds(new ArrayList<>(ids));
            r.setHabitacionId(ids.size() == 1 ? ids.iterator().next() : null);
        }
    }

    private static void validarPersonas(Reserva r) {
        if (r.getHuespedes() == null || r.getHuespedes() < 1) {
            throw new RuntimeException("Debe haber al menos un adulto en la reserva");
        }
        for (Integer n : new Integer[]{r.getNinos3(), r.getNinos10(), r.getNinos11()}) {
            if (n != null && n < 0) {
                throw new RuntimeException("La cantidad de niños no puede ser negativa");
            }
        }
    }

    private static void validarContacto(Reserva r) {
        if (vacio(r.getNombreHuesped()) || vacio(r.getApellidoHuesped())) {
            throw new RuntimeException("Escribe el nombre y el apellido del huésped");
        }
        if (r.getEmailContacto() == null || !EMAIL.matcher(r.getEmailContacto().trim()).matches()) {
            throw new RuntimeException("Revisa el correo electrónico");
        }
        if (r.getTelefonoContacto() == null || r.getTelefonoContacto().replaceAll("\\D", "").length() < 7) {
            throw new RuntimeException("El teléfono debe tener al menos 7 dígitos");
        }
        r.setNombreHuesped(r.getNombreHuesped().trim());
        r.setApellidoHuesped(r.getApellidoHuesped().trim());
        r.setEmailContacto(r.getEmailContacto().trim());
    }

    private static boolean vacio(String s) {
        return s == null || s.isBlank();
    }

    /**
     * Lanza 409 si la reserva choca con otra activa en sus fechas. La casa
     * completa choca con todo; en los demás casos chocan si comparten alguna
     * habitación (un piso reservado bloquea todas sus habitaciones).
     */
    private void validarDisponibilidad(Reserva nueva) {
        LocalDate ingreso = nueva.getFechaIngreso();
        LocalDate salida  = nueva.getFechaSalida();
        LocalDate fin = (salida != null) ? salida : ingreso.plusDays(1);

        List<Habitacion> todas = habitacionRepository.findAll();
        Set<Long> habsNuevas = habitacionesBloqueadas(nueva, todas);
        boolean nuevaEsCasa = "completo".equals(alcance(nueva));
        String rango = ingreso + (salida != null ? " al " + salida : "");

        for (Reserva existente : reservaRepository.findReservasEnRango(ingreso, fin)) {
            if (existente.getId() != null && existente.getId().equals(nueva.getId())) continue;

            if (nuevaEsCasa || "completo".equals(alcance(existente))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La casa completa no está disponible del " + rango + ". Ya existe una reserva activa en esas fechas.");
            }
            Set<Long> interseccion = new HashSet<>(habsNuevas);
            interseccion.retainAll(habitacionesBloqueadas(existente, todas));
            if (!interseccion.isEmpty()) {
                String alcanceNuevo = alcance(nueva);
                if (alcanceNuevo != null) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El " + ("piso1".equals(alcanceNuevo) ? "Piso 1" : "Piso 2") +
                        " no está disponible del " + rango + ". Ya tiene habitaciones reservadas.");
                }
                List<String> nums = todas.stream().filter(h -> interseccion.contains(h.getId()))
                    .map(Habitacion::getNumero).sorted().collect(Collectors.toList());
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La(s) habitación(es) " + String.join(", ", nums) +
                    " no está(n) disponible(s) del " + rango + ". Por favor elige otras fechas u habitaciones.");
            }
        }
    }

    /**
     * Piso o casa completa que bloquea la reserva (piso1 | piso2 | completo), o
     * null si son habitaciones sueltas o una pasadía. Decide `modoEspacio`;
     * reservas antiguas sin modo se interpretan por `espacio`.
     */
    static String alcance(Reserva r) {
        String modo = r.getModoEspacio();
        if ("habitaciones".equals(modo)) return null;
        if ("casa".equals(modo)) return "completo";
        String espacio = r.getEspacio();
        return "piso1".equals(espacio) || "piso2".equals(espacio) || "completo".equals(espacio) ? espacio : null;
    }

    /** Ids de habitaciones que ocupa la reserva: las elegidas más las de su piso o casa. */
    private static Set<Long> habitacionesBloqueadas(Reserva r, List<Habitacion> todas) {
        Set<Long> ids = idsSeleccionados(r);
        String alcance = alcance(r);
        if (alcance != null) {
            Integer piso = "piso1".equals(alcance) ? Integer.valueOf(1) : "piso2".equals(alcance) ? Integer.valueOf(2) : null;
            todas.stream()
                .filter(h -> piso == null || piso.equals(h.getPiso()))
                .forEach(h -> ids.add(h.getId()));
        }
        return ids;
    }

    private static Set<Long> idsSeleccionados(Reserva r) {
        Set<Long> ids = new LinkedHashSet<>();
        if (r.getHabitacionesIds() != null) r.getHabitacionesIds().stream().filter(Objects::nonNull).forEach(ids::add);
        if (r.getHabitacionId() != null) ids.add(r.getHabitacionId());
        return ids;
    }

    // ── Actualizar (administración) ───────────────────────

    public Reserva actualizar(Long id, Reserva cambios) {
        reservaLock.lock();
        try {
            Reserva r = obtenerPorId(id);
            String estadoAnterior = r.getEstado();
            boolean recalcular = false;

            if (cambios.getFechaIngreso() != null) { r.setFechaIngreso(cambios.getFechaIngreso()); recalcular = true; }
            if (cambios.getFechaSalida()  != null) { r.setFechaSalida(cambios.getFechaSalida());   recalcular = true; }
            if (cambios.getHuespedes()    != null) { r.setHuespedes(cambios.getHuespedes());       recalcular = true; }
            if (cambios.getNinos3()       != null) { r.setNinos3(cambios.getNinos3());             recalcular = true; }
            if (cambios.getNinos10()      != null) { r.setNinos10(cambios.getNinos10());           recalcular = true; }
            if (cambios.getNinos11()      != null) { r.setNinos11(cambios.getNinos11());           recalcular = true; }
            if (cambios.getHabitacionesIds() != null) {
                r.setHabitacionesIds(new ArrayList<>(cambios.getHabitacionesIds()));
                r.setHabitacionId(cambios.getHabitacionesIds().size() == 1 ? cambios.getHabitacionesIds().get(0) : null);
                recalcular = true;
            }
            if (cambios.getNombreHuesped()    != null) r.setNombreHuesped(cambios.getNombreHuesped());
            if (cambios.getApellidoHuesped()  != null) r.setApellidoHuesped(cambios.getApellidoHuesped());
            if (cambios.getEmailContacto()    != null) r.setEmailContacto(cambios.getEmailContacto());
            if (cambios.getTelefonoContacto() != null) r.setTelefonoContacto(cambios.getTelefonoContacto());
            if (cambios.getObservaciones()    != null) r.setObservaciones(cambios.getObservaciones());
            if (cambios.getEstado() != null) {
                if (!ESTADOS.contains(cambios.getEstado())) {
                    throw new RuntimeException("Estado no válido. Usa uno de: " + String.join(", ", new TreeSet<>(ESTADOS)));
                }
                r.setEstado(cambios.getEstado());
            }

            if (recalcular) {
                if (!esReservaDeDia(r)) {
                    validarFechasHospedaje(r);
                    if (cambios.getHabitacionesIds() != null) normalizarEspacio(r);
                }
                validarPersonas(r);
                if (!"CANCELADA".equals(r.getEstado())) {
                    validarDisponibilidad(r);
                }
                r.calcularNoches();
                tarifaService.aplicarPrecio(r);
            }
            r.setFechaModificacion(LocalDateTime.now());
            Reserva guardada = reservaRepository.save(r);
            // Si el hotel la confirma a mano (p. ej. pago por transferencia), también se avisa al huésped
            if ("PENDIENTE".equals(estadoAnterior) && "CONFIRMADA".equals(guardada.getEstado())) {
                try {
                    correoReserva.reservaConfirmada(guardada);
                } catch (RuntimeException e) {
                    log.error("No se pudo preparar el correo de confirmación de la reserva {}", guardada.getId(), e);
                }
            }
            return guardada;
        } finally {
            reservaLock.unlock();
        }
    }

    // ── Cancelar / Eliminar ───────────────────────────────
    // La ocupación se calcula siempre desde las reservas por fecha; el `estado`
    // de la habitación es el estado operativo que maneja SOGO (limpieza,
    // mantenimiento…), por eso aquí no se toca.

    public Reserva cancelar(Long id) {
        Reserva reserva = obtenerPorId(id);
        reserva.setEstado("CANCELADA");
        reserva.setFechaModificacion(LocalDateTime.now());
        return reservaRepository.save(reserva);
    }

    public void eliminar(Long id) {
        Reserva reserva = obtenerPorId(id);
        if (!pagoRepository.findByReserva(reserva).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La reserva tiene pagos registrados y no se puede borrar. Cancélala en su lugar");
        }
        reservaRepository.delete(reserva);
    }

    // ── Helpers privados ──────────────────────────────────

    private static boolean esReservaDeDia(Reserva r) {
        return "pasadia".equals(r.getTipoReserva()) || "grupal".equals(r.getTipoReserva());
    }
}
