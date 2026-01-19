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
- **1A**: 8.61%
- **1B**: 6.13%
- **1C**: 5.59%
- **2A**: 10.21%
- **2B**: 9.91%
- **3A**: 9.32%
- **3B**: 8.89%

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

## 🌐 Demo y Despliegue

### GitHub Pages
Esta aplicación está configurada para desplegarse automáticamente en GitHub Pages.

### Pasos para desplegar:
1. Sube este repositorio a GitHub
2. Ve a Settings → Pages en tu repositorio
3. Selecciona "GitHub Actions" como source
4. El despliegue será automático al hacer push a la rama main

### Uso local
```bash
# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview
```
