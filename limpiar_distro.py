#!/usr/bin/env python3
"""
Script para limpiar distribution.json:
- Elimina módulos duplicados (mismo ID)
- Valida que todos los IDs sean únicos
- Genera un JSON limpio y válido
"""

import json
import sys

def clean_distribution_json(input_file, output_file):
    """Lee distribution.json y elimina duplicados"""
    
    print(f"🔍 Leyendo {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        distribution = json.load(f)
    
    # Acceder a los módulos
    servers = distribution.get('servers', [])
    total_removed = 0
    
    for server in servers:
        modules = server.get('modules', [])
        seen_ids = set()
        unique_modules = []
        
        print(f"\n📊 Analizando servidor: {server.get('id', 'Unknown')}")
        print(f"   Total de módulos antes: {len(modules)}")
        
        for idx, module in enumerate(modules):
            module_id = module.get('id', f'unknown_{idx}')
            
            if module_id in seen_ids:
                print(f"   ❌ DUPLICADO ELIMINADO: {module_id}")
                total_removed += 1
            else:
                seen_ids.add(module_id)
                unique_modules.append(module)
                print(f"   ✅ Módulo OK: {module_id}")
        
        server['modules'] = unique_modules
        print(f"   Total de módulos después: {len(unique_modules)}")
    
    print(f"\n{'='*60}")
    print(f"✅ DUPLICADOS ELIMINADOS: {total_removed}")
    print(f"{'='*60}\n")
    
    # Guardar JSON limpio
    print(f"💾 Guardando {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(distribution, f, indent=2, ensure_ascii=False)
    
    print(f"✅ ¡Listo! Archivo limpio guardado como: {output_file}")
    print(f"\n⏭️  PRÓXIMO PASO:")
    print(f"1. Copia TODO el contenido de {output_file}")
    print(f"2. Ve a GitHub y abre distribution.json")
    print(f"3. Reemplaza TODO el contenido")
    print(f"4. Commit y push")
    print(f"5. Recarga el launcher y prueba PLAY")

if __name__ == "__main__":
    # Por defecto, busca en la raíz
    input_json = "distribution.json"
    output_json = "distribution_cleaned.json"
    
    try:
        clean_distribution_json(input_json, output_json)
    except FileNotFoundError:
        print(f"❌ Error: No se encontró {input_json}")
        print(f"Asegúrate de que el archivo esté en la misma carpeta que el script")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error: El JSON está corrupto: {e}")
        sys.exit(1)
