#!/bin/bash

# Script para iniciar el ambiente de desarrollo del backend Java

echo ""
echo "========================================"
echo "  Hospedaje Sebastian - Backend Java"
echo "========================================"
echo ""

# Verificar si existe pom.xml
if [ ! -f "pom.xml" ]; then
    echo "Error: Este script debe ejecutarse desde la carpeta backend"
    exit 1
fi

# Menu
menu() {
    echo ""
    echo "Selecciona una opción:"
    echo "1. Compilar el proyecto"
    echo "2. Ejecutar la aplicación"
    echo "3. Compilar y ejecutar"
    echo "4. Limpiar compilaciones"
    echo "5. Ver dependencias"
    echo "6. Salir"
    echo ""
    read -p "Ingresa el número de la opción: " choice
    
    case $choice in
        1)
            echo ""
            echo "Compilando proyecto..."
            mvn clean install
            menu
            ;;
        2)
            echo ""
            echo "Iniciando aplicación (puerto 3000)..."
            mvn spring-boot:run
            menu
            ;;
        3)
            echo ""
            echo "Compilando y ejecutando..."
            mvn clean install spring-boot:run
            menu
            ;;
        4)
            echo ""
            echo "Limpiando compilaciones..."
            mvn clean
            echo "Limpieza completada"
            menu
            ;;
        5)
            echo ""
            echo "Dependencias del proyecto:"
            mvn dependency:tree
            menu
            ;;
        6)
            echo "Hasta luego!"
            exit 0
            ;;
        *)
            echo "Opción inválida"
            menu
            ;;
    esac
}

menu
