import os
import json
import hashlib
from pathlib import Path

# ⚙️ CONFIGURACIÓN CORRECTA PARA TUS DATOS
MINECRAFT_FOLDER = r"C:\Users\yeval\AppData\Roaming\.helioslauncher\instances\TECNILAND_OG"

# LA CARPETA EN DROPBOX ES:
# https://www.dropbox.com/scl/fo/o8liq7fwv718m222ukuxh/AAxzbp6Rb-TRhDXdY5CFV2Y
# Para acceder a archivos dentro, necesitas esta estructura:
DROPBOX_FOLDER_ID = "o8liq7fwv718m222ukuxh"
DROPBOX_FOLDER_HASH = "AAxzbp6Rb-TRhDXdY5CFV2Y"
DROPBOX_RLKEY = "i59j3jdgad9az24wkohecm7g6"

# URLs CORRECTAS PARA ARCHIVOS DENTRO DE LA CARPETA COMPARTIDA
DROPBOX_BASE_URL = f"https://www.dropbox.com/scl/fo/{DROPBOX_FOLDER_ID}/{DROPBOX_FOLDER_HASH}"

OUTPUT_FILE = "distribution_modules_fixed.json"

def get_md5(filepath):
    """Calcula MD5 de un archivo"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def get_file_size(filepath):
    """Obtiene tamaño de archivo en bytes"""
    return os.path.getsize(filepath)

def generate_modules():
    """Genera módulos para distribution.json"""
    modules = []
    
    # 1️⃣ PROCESAR MODS
    mods_path = os.path.join(MINECRAFT_FOLDER, "mods")
    if os.path.exists(mods_path):
        mod_files = sorted([f for f in os.listdir(mods_path) if f.endswith('.jar')])
        print(f"🔍 Encontrados {len(mod_files)} mods\n")
        
        for idx, mod_file in enumerate(mod_files, 1):
            filepath = os.path.join(mods_path, mod_file)
            size = get_file_size(filepath)
            md5 = get_md5(filepath)
            
            # URL CORRECTA PARA DROPBOX: /scl/fo/ (carpeta compartida)
            module = {
                "id": f"mod:tecniland:{mod_file.replace('.jar', '')}:1.0",
                "name": mod_file,
                "type": "ForgeMod",
                "required": {"value": True},
                "artifact": {
                    "size": size,
                    "MD5": md5,
                    "path": f"mods/{mod_file}",
                    "url": f"{DROPBOX_BASE_URL}/mods/{mod_file}?rlkey={DROPBOX_RLKEY}&dl=1"
                }
            }
            modules.append(module)
            print(f"✅ Mod {idx}/{len(mod_files)}: {mod_file}")
    
    # 2️⃣ PROCESAR CONFIGS
    print(f"\n🔍 Procesando archivos de configuración...\n")
    config_path = os.path.join(MINECRAFT_FOLDER, "config")
    config_files_to_include = [".toml", ".cfg", ".json", ".properties"]
    config_count = 0
    
    if os.path.exists(config_path):
        for root, dirs, files in os.walk(config_path):
            for file in files:
                if any(file.endswith(ext) for ext in config_files_to_include):
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, MINECRAFT_FOLDER)
                    size = get_file_size(filepath)
                    md5 = get_md5(filepath)
                    
                    module = {
                        "id": f"config:{file}:{config_count}",
                        "name": f"Config: {file}",
                        "type": "File",
                        "required": {"value": True},
                        "artifact": {
                            "size": size,
                            "MD5": md5,
                            "path": rel_path,
                            "url": f"{DROPBOX_BASE_URL}/{rel_path.replace(chr(92), '/')}?rlkey={DROPBOX_RLKEY}&dl=1"
                        }
                    }
                    modules.append(module)
                    config_count += 1
        print(f"✅ {config_count} archivos de configuración añadidos\n")
    
    # 3️⃣ PROCESAR SHADERPACKS
    print(f"🔍 Procesando shaderpacks...\n")
    shaderpacks_path = os.path.join(MINECRAFT_FOLDER, "shaderpacks")
    if os.path.exists(shaderpacks_path):
        shaderpack_files = [f for f in os.listdir(shaderpacks_path) if f.endswith('.zip')]
        if shaderpack_files:
            for shaderpack in shaderpack_files:
                filepath = os.path.join(shaderpacks_path, shaderpack)
                size = get_file_size(filepath)
                md5 = get_md5(filepath)
                
                module = {
                    "id": f"shader:{shaderpack.replace('.zip', '')}",
                    "name": f"Shaderpack: {shaderpack}",
                    "type": "File",
                    "required": {"value": False},
                    "artifact": {
                        "size": size,
                        "MD5": md5,
                        "path": f"shaderpacks/{shaderpack}",
                        "url": f"{DROPBOX_BASE_URL}/shaderpacks/{shaderpack}?rlkey={DROPBOX_RLKEY}&dl=1"
                    }
                }
                modules.append(module)
                print(f"✅ Shaderpack: {shaderpack}")
        else:
            print("ℹ️ No hay shaderpacks\n")
    
    # 4️⃣ PROCESAR ARCHIVOS IMPORTANTES EN RAÍZ
    print(f"\n🔍 Procesando archivos importantes...\n")
    important_files = ["minecraftinstance.json", "options.txt"]
    for file in important_files:
        filepath = os.path.join(MINECRAFT_FOLDER, file)
        if os.path.exists(filepath):
            size = get_file_size(filepath)
            md5 = get_md5(filepath)
            
            module = {
                "id": f"file:{file}",
                "name": file,
                "type": "File",
                "required": {"value": True},
                "artifact": {
                    "size": size,
                    "MD5": md5,
                    "path": file,
                    "url": f"{DROPBOX_BASE_URL}/{file}?rlkey={DROPBOX_RLKEY}&dl=1"
                }
            }
            modules.append(module)
            print(f"✅ Archivo: {file}")
    
    return modules

# EJECUTAR
print("=" * 80)
print("🚀 GENERANDO distribution_modules_fixed.json CON URLs CORRECTAS")
print("=" * 80)
print()

modules = generate_modules()

# GUARDAR
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(modules, f, indent=2, ensure_ascii=False)

print()
print("=" * 80)
print(f"✅ ¡LISTO! Total de módulos generados: {len(modules)}")
print(f"📄 Archivo guardado como: {OUTPUT_FILE}")
print("=" * 80)
print()
print("✅ TODAS LAS URLS AHORA USAN /scl/fo/ CORRECTAMENTE")
print("⏭️  PRÓXIMO PASO: Copia el contenido a distribution.json en GitHub")
print()
