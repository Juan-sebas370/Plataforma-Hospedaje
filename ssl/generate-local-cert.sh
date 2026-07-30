#!/usr/bin/env bash

set -euo pipefail

SSL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="${1:-localhost}"
DAYS="${2:-365}"

if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl no esta instalado en el sistema."
    exit 1
fi

echo "Generando certificado autofirmado para: ${DOMAIN}"

openssl req \
    -x509 \
    -nodes \
    -newkey rsa:2048 \
    -keyout "${SSL_DIR}/privkey.pem" \
    -out "${SSL_DIR}/fullchain.pem" \
    -days "${DAYS}" \
    -subj "/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"

chmod 600 "${SSL_DIR}/privkey.pem" || true
chmod 644 "${SSL_DIR}/fullchain.pem" || true

echo "Listo. Archivos creados:"
echo "- ${SSL_DIR}/fullchain.pem"
echo "- ${SSL_DIR}/privkey.pem"
