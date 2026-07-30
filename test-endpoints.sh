#!/bin/bash
# Script para probar los endpoints del sistema de recuperacion de contraseña

API_URL="http://localhost:3000/api"
EMAIL="test@example.com"
NEW_PASSWORD="NuevaPass456!"

echo "======================================"
echo "Testing Password Recovery System"
echo "======================================"
echo ""

# 1. Test: Crear usuario (Registro)
echo "[1/5] Testing Registro endpoint..."
REGISTER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "Test123!",
    "nombre": "Juan",
    "apellido": "Test",
    "telefono": "1234567890",
    "cedulaIdentidad": "12345678"
  }' \
  "$API_URL/auth/registro")

echo "Response: $REGISTER_RESPONSE"
echo ""

# 2. Test: Solicitar recuperacion
echo "[2/5] Testing Forgot Password endpoint..."
FORGOT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "'$EMAIL'"}' \
  "$API_URL/auth/forgot-password")

echo "Response: $FORGOT_RESPONSE"
echo ""

# 3. Test: Login (debe fallar con contraseña antigua)
echo "[3/5] Testing Login with current password..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "'$EMAIL'", "password": "Test123!"}' \
  "$API_URL/auth/login")

echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:20}..."
echo ""

# 4. Test: Validar token (necesitas obtener el token del email primero)
echo "[4/5] Testing Token Validation..."
echo "Para obtener el token, revisa el email enviado"
echo ""

# 5. Test: Reset Password (necesitas el token del email)
echo "[5/5] Testing Reset Password..."
echo "Para hacer reset, necesitas el token del email de recuperacion"
echo ""

echo "======================================"
echo "Tests completados!"
echo "======================================"
echo ""
echo "Sigue los pasos en GUIA_PRUEBAS.md para completar"
