#!/usr/bin/env python3
"""
Script de verificación de requisitos para Chatbot API
Verifica si todo está configurado correctamente antes de iniciar
"""

import os
import sys
import subprocess
import requests
import json
from pathlib import Path

def print_header():
    print("\n" + "="*70)
    print("  ✓ VERIFICADOR DE REQUISITOS - CHATBOT API")
    print("="*70 + "\n")

def print_section(title):
    print(f"\n{'─'*70}")
    print(f"  📋 {title}")
    print(f"{'─'*70}")

def check(condition, message, required=True):
    """Mostrar resultado de verificación"""
    status = "✓" if condition else "✗"
    severity = "ERROR" if required and not condition else "AVISO"
    prefix = f"[{status}]" if condition else f"[{severity}]"
    print(f"  {prefix} {message}")
    return condition

def check_python():
    """Verificar Python"""
    print_section("Python")
    
    # Versión
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    ok = sys.version_info >= (3, 8)
    check(ok, f"Python {version} ({('✓ OK' if ok else '✗ REQUIERE 3.8+')})")
    return ok

def check_virtual_env():
    """Verificar entorno virtual"""
    print_section("Entorno Virtual")
    
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    check(in_venv, f"Entorno virtual {'✓ ACTIVO' if in_venv else '✗ NO ACTIVO'}")
    
    if not in_venv:
        print("    💡 Activar con: .venv\\Scripts\\activate (Windows)")
        print("    💡 O con: source .venv/bin/activate (Linux/Mac)")
    
    return in_venv

def check_dependencies():
    """Verificar dependencias Python instaladas"""
    print_section("Dependencias Python")
    
    required = ['fastapi', 'uvicorn', 'requests', 'pydantic', 'python-dotenv']
    all_ok = True
    
    for dep in required:
        try:
            __import__(dep.replace('-', '_'))
            check(True, f"{dep}")
        except ImportError:
            check(False, f"{dep} (no instalado)")
            all_ok = False
    
    if not all_ok:
        print("\n    💡 Instalar con: pip install -r ollama_api/requirements.txt\n")
    
    return all_ok

def check_ollama():
    """Verificar Ollama"""
    print_section("Ollama")
    
    # Verificar que está corriendo
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        ok_running = response.status_code == 200
        check(ok_running, "Ollama corriendo en http://localhost:11434")
        
        if ok_running:
            data = response.json()
            models = data.get('models', [])
            
            if models:
                check(True, f"Modelos instalados: {len(models)}")
                for model in models[:3]:  # Mostrar primeros 3
                    print(f"      └─ {model.get('name', 'unknown')}")
                if len(models) > 3:
                    print(f"      └─ ... y {len(models)-3} más")
                
                # Verificar Mistral
                has_mistral = any('mistral' in m.get('name', '').lower() for m in models)
                check(has_mistral, "Modelo 'mistral' disponible")
                return True
            else:
                check(False, "No hay modelos instalados")
                print("    💡 Instalar con: ollama pull mistral")
                return False
        else:
            return False
            
    except requests.exceptions.ConnectionError:
        check(False, "No se puede conectar a Ollama")
        print("    💡 Instalación: https://ollama.ai")
        print("    💡 Iniciar con: ollama serve")
        return False
    except Exception as e:
        check(False, f"Error verificando Ollama: {str(e)}")
        return False

def check_api_files():
    """Verificar archivos necesarios de la API"""
    print_section("Archivos de Configuración")
    
    api_dir = Path("ollama_api")
    
    files_to_check = [
        (api_dir / "main.py", "Archivo principal API"),
        (api_dir / "requirements.txt", "Dependencias"),
        (api_dir / ".env", "Configuración"),
    ]
    
    all_ok = True
    for file_path, name in files_to_check:
        ok = file_path.exists()
        check(ok, f"{name} (ollama_api/{file_path.name})")
        if not ok:
            all_ok = False
    
    return all_ok

def check_frontend_files():
    """Verificar archivos de Angular"""
    print_section("Archivos Frontend")
    
    frontend_dir = Path("frontend/src/app")
    
    files_to_check = [
        (frontend_dir / "services" / "chatbot.service.ts", "Servicio chatbot"),
        (frontend_dir / "components/chatbot/chatbot.component.ts", "Componente chatbot"),
        (frontend_dir / "components/chatbot/chatbot.component.html", "Template chatbot"),
        (frontend_dir / "components/chatbot/chatbot.component.css", "Estilos chatbot"),
    ]
    
    all_ok = True
    for file_path, name in files_to_check:
        ok = file_path.exists()
        rel_path = file_path.relative_to(Path.cwd()) if file_path.exists() or file_path.parent.exists() else file_path
        check(ok, f"{name}")
        if not ok:
            all_ok = False
    
    return all_ok

def check_docs():
    """Verificar documentación"""
    print_section("Documentación")
    
    docs = [
        ("COMIENZA_AQUI.txt", "Archivo de inicio"),
        ("CHAT_INICIO_RAPIDO.md", "Guía rápida"),
        ("INTEGRACION_CHATBOT_ANGULAR.md", "Integración Angular"),
        ("ARQUITECTURA_VISUAL.txt", "Diagramas"),
        ("ollama_api/README.md", "Documentación API"),
    ]
    
    all_ok = True
    for file_path, name in docs:
        ok = Path(file_path).exists()
        check(ok, f"{name}")
        if not ok:
            all_ok = False
    
    return all_ok

def check_env_file():
    """Verificar contenido del .env"""
    print_section("Variables de Entorno")
    
    env_file = Path("ollama_api/.env")
    
    if not env_file.exists():
        check(False, "Archivo .env no existe")
        return False
    
    try:
        with open(env_file) as f:
            content = f.read()
        
        checks = [
            ("OLLAMA_API_URL" in content, "OLLAMA_API_URL configurada"),
            ("OLLAMA_MODEL" in content, "OLLAMA_MODEL configurada"),
            ("API_PORT" in content, "API_PORT configurada"),
        ]
        
        for ok, msg in checks:
            check(ok, msg)
        
        return all(ok for ok, _ in checks)
    
    except Exception as e:
        check(False, f"Error leyendo .env: {str(e)}")
        return False

def print_summary(results):
    """Mostrar resumen"""
    print_section("RESUMEN")
    
    if all(results.values()):
        print("\n  ✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!\n")
        print("  Puedes iniciar la API con:")
        print("    python ollama_api/main.py\n")
        print("  Luego acceder a:")
        print("    http://localhost:8000/docs\n")
        return True
    else:
        print("\n  ⚠️  HAY ALGUNOS PROBLEMAS:\n")
        
        if not results.get("ollama"):
            print("  1. Instala Ollama:")
            print("     📥 https://ollama.ai\n")
        
        if not results.get("dependencies"):
            print("  2. Instala dependencias Python:")
            print("     pip install -r ollama_api/requirements.txt\n")
        
        if not results.get("venv"):
            print("  3. Activa entorno virtual:")
            print("     .venv\\Scripts\\activate (Windows)")
            print("     source .venv/bin/activate (Linux/Mac)\n")
        
        print("\n  Lee: COMIENZA_AQUI.txt para más detalles\n")
        return False

def main():
    """Ejecutar todas las verificaciones"""
    print_header()
    
    results = {
        "python": check_python(),
        "venv": check_virtual_env(),
        "dependencies": check_dependencies(),
        "api_files": check_api_files(),
        "frontend_files": check_frontend_files(),
        "docs": check_docs(),
        "env": check_env_file(),
        "ollama": check_ollama(),
    }
    
    ok = print_summary(results)
    
    print("="*70)
    print()
    
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
