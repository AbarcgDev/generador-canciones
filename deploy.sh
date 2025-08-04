#!/bin/bash
# NO EJECUTAR MANUALMENTE, SE ENVIA AL SERVICIO DE DESPLIEGUE EN DOCKER
# Salir inmediatamente si un comando falla
set -e

echo "Instalando dependencias..."
npm install

echo "Creando secreto SUNO_API_KEY..."
echo "$SUNO_API_KEY" | npx wrangler secret put SUNO_API_KEY

echo "Desplegando Worker..."
npx wrangler deploy