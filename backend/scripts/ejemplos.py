"""
Ejemplo simple de uso del generador de reportes
"""

from collections import Counter
from datetime import datetime

from generar_reportes import ReservasReportGenerator


def _parse_fecha(valor):
    """Intentar parsear fechas en formatos comunes."""
    if not valor:
        return None

    texto = str(valor).strip().replace("Z", "+00:00")
    formatos = ["%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S%z"]

    for formato in formatos:
        try:
            return datetime.strptime(texto, formato)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(texto)
    except ValueError:
        return None


def _barra(valor, maximo, ancho=28):
    """Barra horizontal simple para visualizar proporciones."""
    if maximo <= 0:
        return "-" * ancho

    llenos = int((valor / maximo) * ancho)
    vacios = ancho - llenos
    return "#" * llenos + "." * vacios


def _insights_inteligentes(total, ingresos, estados, reservas):
    """Reglas simples para producir recomendaciones tipo IA."""
    if total == 0:
        return ["No hay datos para analizar."]

    promedio = ingresos / total
    canceladas = estados.get("cancelada", 0) + estados.get("cancelado", 0)
    confirmadas = estados.get("confirmada", 0)
    ratio_cancelacion = canceladas / total
    ratio_confirmacion = confirmadas / total

    insights = []

    if ratio_cancelacion >= 0.20:
        insights.append("Alta cancelacion detectada: activa recordatorios y prepago parcial.")

    if ratio_confirmacion < 0.50:
        insights.append("Baja confirmacion: revisa tiempos de respuesta y automatiza seguimiento.")

    if promedio < 120:
        insights.append("Ticket promedio bajo: crea paquetes (desayuno + late checkout).")
    elif promedio > 280:
        insights.append("Ticket promedio alto: refuerza upselling premium y experiencias VIP.")

    fechas = sorted([_parse_fecha(r.get("fecha_entrada")) for r in reservas if r.get("fecha_entrada")])
    fechas = [f for f in fechas if f is not None]

    if len(fechas) >= 6:
        mitad = len(fechas) // 2
        primer_bloque = fechas[:mitad]
        segundo_bloque = fechas[mitad:]

        rango_1 = max((primer_bloque[-1] - primer_bloque[0]).days + 1, 1)
        rango_2 = max((segundo_bloque[-1] - segundo_bloque[0]).days + 1, 1)

        ritmo_1 = len(primer_bloque) / rango_1
        ritmo_2 = len(segundo_bloque) / rango_2

        if ritmo_2 > ritmo_1 * 1.15:
            insights.append("Tendencia creciente de reservas: considera ajustar tarifas dinamicas.")
        elif ritmo_2 < ritmo_1 * 0.85:
            insights.append("Tendencia a la baja: lanza campaña digital para fechas cercanas.")

    if not insights:
        insights.append("Operacion estable: mantén estrategia actual y monitorea semanalmente.")

    return insights


def ejemplo_ia_bonita():
    """Ejemplo visual con analisis inteligente en consola."""
    print("=" * 64)
    print("  IA BONITA - ANALISIS INTELIGENTE DE RESERVAS")
    print("=" * 64)

    generator = ReservasReportGenerator()

    if not generator.conectar():
        print("No se pudo conectar a MongoDB")
        return

    reservas = generator.obtener_reservas()

    if not reservas:
        print("No hay reservas para analizar")
        generator.cerrar()
        return

    total = len(reservas)
    ingresos = sum(float(r.get("total", 0) or 0) for r in reservas)
    promedio = ingresos / total if total else 0
    estados = Counter(str(r.get("estado", "desconocido")).lower() for r in reservas)
    top_clientes = Counter(str(r.get("cliente", "sin_nombre")) for r in reservas).most_common(3)

    print("\nMETRICAS CLAVE")
    print(f"- Reservas analizadas : {total}")
    print(f"- Ingresos totales    : ${ingresos:,.2f}")
    print(f"- Ticket promedio     : ${promedio:,.2f}")

    print("\nESTADOS DE RESERVA")
    maximo_estado = max(estados.values()) if estados else 0
    for estado, cantidad in estados.most_common():
        barra = _barra(cantidad, maximo_estado)
        print(f"- {estado:<12} [{barra}] {cantidad}")

    print("\nTOP CLIENTES")
    if top_clientes:
        for i, (cliente, repeticiones) in enumerate(top_clientes, start=1):
            print(f"{i}. {cliente} ({repeticiones} reservas)")
    else:
        print("Sin datos de clientes")

    print("\nRECOMENDACIONES IA")
    insights = _insights_inteligentes(total, ingresos, estados, reservas)
    for i, insight in enumerate(insights, start=1):
        print(f"{i}. {insight}")

    print("\n" + "=" * 64)
    print("Analisis completado")
    print("=" * 64)

    generator.cerrar()


def ejemplo_basico():
    """Ejemplo básico de generación de reportes"""
    print("=== Ejemplo: Generar Reportes Básicos ===\n")
    
    # Crear instancia del generador
    generator = ReservasReportGenerator()
    
    # Conectar a MongoDB
    if not generator.conectar():
        print("No se pudo conectar a MongoDB")
        return
    
    # Generar reportes en todos los formatos
    print("Generando reportes...")
    resultados = generator.generar_todos()
    
    # Mostrar resultados
    if resultados:
        print("\nReportes generados:")
        for formato, ruta in resultados.items():
            if ruta:
                print(f"  ✓ {formato.upper()}: {ruta}")
    
    # Cerrar conexión
    generator.cerrar()


def ejemplo_con_filtro():
    """Ejemplo con filtros personalizados"""
    print("=== Ejemplo: Generar Reportes Filtrados ===\n")
    
    generator = ReservasReportGenerator()
    
    if not generator.conectar():
        return
    
    # Obtener solo reservas confirmadas
    print("Obteniendo reservas confirmadas...")
    reservas = generator.obtener_reservas({"estado": "confirmada"})
    
    print(f"Se encontraron {len(reservas)} reservas confirmadas")
    
    # Generar solo CSV
    if reservas:
        generator.generar_csv(reservas, "reservas_confirmadas.csv")
    
    generator.cerrar()


def ejemplo_resumen_estadisticas():
    """Ejemplo: Mostrar estadísticas de reservas"""
    print("=== Ejemplo: Estadísticas de Reservas ===\n")
    
    generator = ReservasReportGenerator()
    
    if not generator.conectar():
        return
    
    reservas = generator.obtener_reservas()
    
    if not reservas:
        print("No hay reservas")
        return
    
    # Calcular estadísticas
    total = len(reservas)
    ingresos = sum(float(r.get("total", 0)) for r in reservas if r.get("total"))
    
    # Contar por estado
    estados = {}
    for r in reservas:
        estado = r.get("estado", "desconocido")
        estados[estado] = estados.get(estado, 0) + 1
    
    # Mostrar resultados
    print(f"Total de reservas: {total}")
    print(f"Ingresos totales: ${ingresos:,.2f}")
    print(f"Promedio por reserva: ${ingresos/total:,.2f}" if total > 0 else "N/A")
    print(f"\nReservas por estado:")
    for estado, count in estados.items():
        print(f"  - {estado}: {count}")
    
    generator.cerrar()


if __name__ == "__main__":
    # Descomenta el ejemplo que quieras ejecutar

    # Ejemplo 0: IA bonita
    ejemplo_ia_bonita()
    
    # Ejemplo 1: Básico
    # ejemplo_basico()
    
    # Ejemplo 2: Con filtros
    # ejemplo_con_filtro()
    
    # Ejemplo 3: Estadísticas
    # ejemplo_resumen_estadisticas()
