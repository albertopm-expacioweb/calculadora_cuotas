# Calculadora de Cuotas de Comunidad Vecinal

Aplicación web para calcular automáticamente las cuotas mensuales y anuales de cada propietario/a de una comunidad vecinal a partir de un archivo CSV con los gastos.

## 🚀 Características

- ✅ **Carga de archivos CSV** con gastos de la comunidad
- ✅ **Cálculo automático** con porcentajes de participación
- ✅ **Desglose detallado** por propietario y concepto
- ✅ **Exportación de resultados** en formato CSV
- ✅ **Interfaz moderna** y responsive

## 📊 Porcentajes de Participación

- **Garaje**: 20.67%
- **Bajo**: 20.67%
- **1A**: 11.56%
- **1B**: 9.08%
- **1C**: 8.54%
- **2A**: 13.16%
- **2B**: 12.86%
- **3A**: 12.27%
- **3B**: 11.84%

## 📋 Reglas de Cálculo

1. **Tabla 1 (General)**: Todos pagan según su porcentaje
2. **Tabla 2 (Garaje)**: Solo 7 propietarios (sin Bajo) pagan partes iguales
3. **Tabla 3 (Edificio)**: Todos excepto el garaje, proporcionalmente ajustado

## 🛠️ Tecnologías

- React + TypeScript
- Tailwind CSS
- Vite
- Lucide React (iconos)

## 📦 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview
```

## 📁 Archivo CSV de Ejemplo

El archivo CSV debe tener el formato:
```
concepto,importe
Administrador,494.40
Energía eléctrica edificio,600
Mantenimiento y reparaciones,43.26
```

## 🌐 Demo

La aplicación está disponible en: [URL de tu despliegue]
