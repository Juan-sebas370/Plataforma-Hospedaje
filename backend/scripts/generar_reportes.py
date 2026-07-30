"""
Script para generar reportes de reservas del hotel
Soporta formatos: CSV, PDF, JSON
"""

import os
import sys
import json
import csv
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

try:
    from pymongo import MongoClient
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
except ImportError:
    print("Falta instalar dependencias. Ejecuta: pip install -r requirements.txt")
    sys.exit(1)


class ReservasReportGenerator:
    """Generador de reportes de reservas"""
    
    def __init__(self, mongo_uri: str = None, db_name: str = "hotel_sebastian"):
        """
        Inicializar generador
        
        Args:
            mongo_uri: URI de conexión MongoDB
            db_name: Nombre de la base de datos
        """
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = db_name
        self.client = None
        self.db = None
        self.output_dir = Path("reports")
        self.output_dir.mkdir(exist_ok=True)
    
    def conectar(self) -> bool:
        """Conectar a MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            # Verificar conexión
            self.db.command("ping")
            print(f"✓ Conectado a MongoDB: {self.db_name}")
            return True
        except Exception as e:
            print(f"✗ Error conectando a MongoDB: {e}")
            return False
    
    def obtener_reservas(self, filtro: Dict = None) -> List[Dict]:
        """Obtener reservas de la BD"""
        try:
            if not self.db:
                raise Exception("No hay conexión a BD")
            
            collection = self.db.get_collection("reservas")
            if collection is None:
                print("Colección 'reservas' no encontrada")
                return []
            
            reservas = list(collection.find(filtro or {}))
            # Convertir ObjectId a string para JSON
            for r in reservas:
                if "_id" in r:
                    r["_id"] = str(r["_id"])
            
            return reservas
        except Exception as e:
            print(f"Error obteniendo reservas: {e}")
            return []
    
    def generar_csv(self, reservas: List[Dict], nombre_archivo: str = None) -> str:
        """Generar reporte CSV"""
        if not reservas:
            print("Sin reservas para generar CSV")
            return ""
        
        nombre_archivo = nombre_archivo or f"reservas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        ruta = self.output_dir / nombre_archivo
        
        try:
            keys = ["_id", "cliente", "habitacion", "fecha_entrada", "fecha_salida", "total", "estado"]
            
            with open(ruta, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                for r in reservas:
                    fila = {k: r.get(k, "") for k in keys}
                    writer.writerow(fila)
            
            print(f"✓ CSV generado: {ruta}")
            return str(ruta)
        except Exception as e:
            print(f"Error generando CSV: {e}")
            return ""
    
    def generar_json(self, reservas: List[Dict], nombre_archivo: str = None) -> str:
        """Generar reporte JSON"""
        if not reservas:
            print("Sin reservas para generar JSON")
            return ""
        
        nombre_archivo = nombre_archivo or f"reservas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        ruta = self.output_dir / nombre_archivo
        
        try:
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(reservas, f, indent=2, ensure_ascii=False)
            
            print(f"✓ JSON generado: {ruta}")
            return str(ruta)
        except Exception as e:
            print(f"Error generando JSON: {e}")
            return ""
    
    def generar_pdf(self, reservas: List[Dict], nombre_archivo: str = None) -> str:
        """Generar reporte PDF"""
        if not reservas:
            print("Sin reservas para generar PDF")
            return ""
        
        nombre_archivo = nombre_archivo or f"reservas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        ruta = self.output_dir / nombre_archivo
        
        try:
            doc = SimpleDocTemplate(str(ruta), pagesize=letter)
            story = []
            styles = getSampleStyleSheet()
            
            # Título
            titulo = Paragraph("<b>Reporte de Reservas - Hotel Sebastian</b>", styles["Heading1"])
            story.append(titulo)
            story.append(Spacer(1, 12))
            
            # Fecha de generación
            fecha = Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", styles["Normal"])
            story.append(fecha)
            story.append(Spacer(1, 12))
            
            # Tabla de datos
            encabezados = ["ID", "Cliente", "Habitación", "Entrada", "Salida", "Total", "Estado"]
            datos = [encabezados]
            
            for r in reservas[:50]:  # Limitar a 50 para evitar tabla muy grande
                fila = [
                    str(r.get("_id", ""))[:10],
                    str(r.get("cliente", "")),
                    str(r.get("habitacion", "")),
                    str(r.get("fecha_entrada", ""))[:10],
                    str(r.get("fecha_salida", ""))[:10],
                    str(r.get("total", "")),
                    str(r.get("estado", ""))
                ]
                datos.append(fila)
            
            tabla = Table(datos, colWidths=[60, 80, 70, 80, 80, 70, 70])
            tabla.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
            ]))
            
            story.append(tabla)
            story.append(Spacer(1, 12))
            
            # Resumen
            total_reservas = len(reservas)
            total_ingresos = sum(float(r.get("total", 0)) for r in reservas if r.get("total"))
            resumen = Paragraph(
                f"<b>Total de reservas:</b> {total_reservas} | <b>Ingresos totales:</b> ${total_ingresos:,.2f}",
                styles["Normal"]
            )
            story.append(resumen)
            
            doc.build(story)
            print(f"✓ PDF generado: {ruta}")
            return str(ruta)
        except Exception as e:
            print(f"Error generando PDF: {e}")
            return ""
    
    def generar_todos(self, filtro: Dict = None) -> Dict[str, str]:
        """Generar reportes en todos los formatos"""
        reservas = self.obtener_reservas(filtro)
        
        if not reservas:
            print("No hay reservas para generar reportes")
            return {}
        
        print(f"\nGenerando reportes para {len(reservas)} reservas...")
        
        resultados = {
            "csv": self.generar_csv(reservas),
            "json": self.generar_json(reservas),
            "pdf": self.generar_pdf(reservas)
        }
        
        return resultados
    
    def cerrar(self):
        """Cerrar conexión a MongoDB"""
        if self.client:
            self.client.close()
            print("Conexión a MongoDB cerrada")


def main():
    """Ejecutar generador de reportes"""
    print("=== Generador de Reportes de Reservas ===\n")
    
    generator = ReservasReportGenerator()
    
    if not generator.conectar():
        print("No se pudo conectar a MongoDB")
        return
    
    # Generar reportes
    resultados = generator.generar_todos()
    
    if resultados:
        print("\n✓ Reportes generados exitosamente")
        print(f"Ubicación: {generator.output_dir.absolute()}")
    else:
        print("\n✗ No se generaron reportes")
    
    generator.cerrar()


if __name__ == "__main__":
    main()
