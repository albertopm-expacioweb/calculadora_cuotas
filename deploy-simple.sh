#!/bin/bash
# Script de despliegue simplificado para GitHub Pages

echo "🚀 Construyendo aplicación..."
npm run build

echo "📁 Preparando archivos para GitHub Pages..."
cd dist

# Crear un index.html simplificado que funcione
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculadora de Cuotas de Comunidad</title>
    <script type="module" crossorigin src="./assets/index-D80cA41Y.js"></script>
    <link rel="stylesheet" href="./assets/index-CA5VT5DH.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

echo "✅ Archivos preparados correctamente"
echo "📝 Ahora necesitas:"
echo "1. Ir a tu repositorio en GitHub: https://github.com/albertopm-expacioweb/calculadora_cuotas"
echo "2. Ir a Settings > Pages"
echo "3. En Source, seleccionar 'Deploy from a branch'"
echo "4. Seleccionar la rama 'gh-pages' y carpeta '/ (root)'"
echo "5. Click en Save"
echo ""
echo "🌐 Tu aplicación estará disponible en: https://albertopm-expacioweb.github.io/calculadora_cuotas/"