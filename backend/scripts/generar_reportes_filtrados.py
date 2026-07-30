"""
Script para generar reportes filtrados de reservas
Permite filtrar por fechas, estado, cliente, etc.
"""

from datetime import datetime, timedelta
from generar_reportes import ReservasReportGenerator
import sys


def generar_reporte_por_fecha(fecha_inicio: str, fecha_fin: str):
    """Generar reporte de reservas en un rango de fechas"""
    try:
        # Parsear fechas
        inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fin = datetime.strptime(fecha_fin, "%Y-%m-%d")
        
        generator = ReservasReportGenerator()
        
        if not generator.conectar():
            return False
        
        # Filtro por fecha
        filtro = {
            "fecha_entrada": {"$gte": fecha_inicio, "$lte": fecha_fin}
        }
        
        print(f"\nGenerando reporte de {fecha_inicio} a {fecha_fin}...")
        resultados = generator.generar_todos(filtro)
        
        if resultados:
            print("✓ Reporte generado exitosamente")
        
        generator.cerrar()
        return True
        
    except ValueError:
        print("Formato de fecha inválido. Usa: YYYY-MM-DD")
        return False


def generar_reporte_por_estado(estado: str):
    """Generar reporte de reservas por estado"""
    generator = ReservasReportGenerator()
    
    if not generator.conectar():
        return False
    
    filtro = {"estado": estado.lower()}
    
    print(f"\nGenerando reporte de reservas con estado: {estado}...")
    resultados = generator.generar_todos(filtro)
    
    if resultados:
        print("✓ Reporte generado exitosamente")
    
    generator.cerrar()
    return True


def generar_reporte_mes_actual():
    """Generar reporte del mes actual"""
    hoy = datetime.now()
    inicio = hoy.replace(day=1).strftime("%Y-%m-%d")
    fin = hoy.strftime("%Y-%m-%d")
    
    return generar_reporte_por_fecha(inicio, fin)


def main():
    """Procesar argumentos y generar reportes"""
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python generar_reportes_filtrados.py mes_actual")
        print("  python generar_reportes_filtrados.py fecha 2025-03-01 2025-03-31")
        print("  python generar_reportes_filtrados.py estado confirmada")
        return
    
    comando = sys.argv[1]
    
    if comando == "mes_actual":
        generar_reporte_mes_actual()
    elif comando == "fecha" and len(sys.argv) == 4:
        generar_reporte_por_fecha(sys.argv[2], sys.argv[3])
    elif comando == "estado" and len(sys.argv) == 3:
        generar_reporte_por_estado(sys.argv[2])
    else:
        print("Comando no válido")


if __name__ == "__main__":
    main()
