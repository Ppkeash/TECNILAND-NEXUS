const fs = require('fs-extra')
const path = require('path')

const DIST_FILE = path.join(__dirname, 'distribution.json')

console.log('🔧 Agregando VersionManifest a Forge...\n')

// 1. Cargar distribution.json
const dist = fs.readJsonSync(DIST_FILE)
const server = dist.servers[0]

// 2. Encontrar módulo Forge
const forgeModule = server.modules.find(m => m.type === 'ForgeHosted')

if(!forgeModule) {
    console.error('❌ No se encontró módulo ForgeHosted')
    process.exit(1)
}

console.log('✅ Forge encontrado:', forgeModule.id)

// 3. Verificar si ya tiene VersionManifest
if(forgeModule.subModules && forgeModule.subModules.length > 0) {
    const hasVersionManifest = forgeModule.subModules.some(m => m.type === 'VersionManifest')
    if(hasVersionManifest) {
        console.log('✅ VersionManifest ya existe, no se necesita agregar')
        process.exit(0)
    }
}

// 4. Agregar VersionManifest
if(!forgeModule.subModules) {
    forgeModule.subModules = []
}

forgeModule.subModules.push({
    "id": "1.20.1-forge-47.3.0",
    "name": "Minecraft Forge (version.json)",
    "type": "VersionManifest",
    "artifact": {
        "size": 14401,
        "MD5": "5f6cc71adb7eb5d7b6a0cd90c8804f71",
        "url": "https://maven.minecraftforge.net/net/minecraftforge/forge/1.20.1-47.3.0/forge-1.20.1-47.3.0-universal.jar"
    }
})

console.log('✅ VersionManifest agregado')

// 5. Guardar
fs.writeJsonSync(DIST_FILE, dist, { spaces: 2 })

console.log('\n✅ distribution.json actualizado')
console.log('\n🚀 Ahora ejecuta: npm start')
