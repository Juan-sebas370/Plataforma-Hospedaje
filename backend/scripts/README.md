# Generador de Reportes de Reservas

Script Python para generar reportes de las reservas del hotel en múltiples formatos.

## Formatos soportados

- **CSV** - Tabla de valores separados por comas
- **JSON** - Formato JSON estructurado  
- **PDF** - Documento PDF con tabla y resumen

## Instalación

1. Asegurate de tener Python 3.8+ instalado
2. Instala las dependencias:

```bash
pip install -r requirements.txt
```

## Uso

### Ejecutar desde terminal

```bash
python generar_reportes.py
```

### Uso programático

```python
from generar_reportes import ReservasReportGenerator

# Crear generador
generator = ReservasReportGenerator()

# Conectar a MongoDB
if generator.conectar():
    # Generar todos los reportes
    resultados = generator.generar_todos()
    
    # O generar por formato específico
    reservas = generator.obtener_reservas()
    generator.generar_csv(reservas)
    generator.generar_pdf(reservas)
    generator.generar_json(reservas)
    
    # Cerrar conexión
    generator.cerrar()
```

## Variables de entorno

- `MONGODB_URI` - URI de conexión a MongoDB (por defecto: mongodb://localhost:27017)

Ejemplo en `.env`:
```
MONGODB_URI=mongodb://localhost:27017
```

## Estructura de datos esperada

La colección `reservas` debe tener documentos con esta estructura:

```json
{
  "_id": ObjectId,
  "cliente": "Nombre Cliente",
  "habitacion": "101",
  "fecha_entrada": "2025-03-01",
  "fecha_salida": "2025-03-05",
  "total": 500000,
  "estado": "confirmada"
}
```

## Salida

Los reportes se generan en la carpeta `reports/` con timestamp:
- `reservas_20250218_143022.csv`
- `reservas_20250218_143022.json`
- `reservas_20250218_143022.pdf`

## Personalización

Edita el archivo `generar_reportes.py` para:
- Cambiar filtros de reservas
- Agregar más campos a los reportes
- Modificar estilos del PDF
- Cambiar la ubicación de salida
