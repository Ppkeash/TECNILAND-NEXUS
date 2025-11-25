const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

// ========================================
// CONFIGURACIÓN
// ========================================
const MODS_DIR = path.join(__dirname, 'localserver', 'instances', 'TECNILAND_OG', 'mods')
const OUTPUT_FILE = path.join(__dirname, 'distribution-local.json')
const ORIGINAL_DIST = path.join(__dirname, 'distribution.json')

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function calculateMD5(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath)
        const hashSum = crypto.createHash('md5')
        hashSum.update(fileBuffer)
        return hashSum.digest('hex')
    } catch(err) {
        console.error(`❌ Error calculando MD5 de ${filePath}:`, err.message)
        return '00000000000000000000000000000000' // MD5 dummy
    }
}

function generateModules() {
    const modules = []
    
    if(!fs.existsSync(MODS_DIR)) {
        console.error('❌ No se encontró la carpeta de mods en:', MODS_DIR)
        console.log('📁 Creando estructura de carpetas...')
        fs.ensureDirSync(MODS_DIR)
        console.log('✅ Carpetas creadas. Copia tus mods a:', MODS_DIR)
        process.exit(1)
    }
    
    const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.jar'))
    
    if(files.length === 0) {
        console.error('❌ No se encontraron archivos .jar en:', MODS_DIR)
        process.exit(1)
    }
    
    console.log(`\n📦 Procesando ${files.length} mods...`)
    
    for(const file of files) {
        const filePath = path.join(MODS_DIR, file)
        const stats = fs.statSync(filePath)
        const md5 = calculateMD5(filePath)
        
        // Convertir ruta de Windows a URL file://
        const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`
        
        const module = {
            id: `mod:tecniland:${file.replace('.jar', '')}:1.0`,
            name: file,
            type: 'ForgeMod',
            required: { value: true },
            artifact: {
                size: stats.size,
                MD5: md5,
                path: `mods/${file}`,
                url: fileUrl
            }
        }
        
        modules.push(module)
        console.log(`  ✅ ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
    }
    
    return modules
}

// ========================================
// SCRIPT PRINCIPAL
// ========================================

console.log('🚀 Generando distribution.json LOCAL para testing...\n')

// 1. Cargar distribution.json original
if(!fs.existsSync(ORIGINAL_DIST)) {
    console.error('❌ No se encontró distribution.json en:', ORIGINAL_DIST)
    process.exit(1)
}

const originalDist = fs.readJsonSync(ORIGINAL_DIST)

// 2. Validar estructura
if(!originalDist.servers || originalDist.servers.length === 0) {
    console.error('❌ distribution.json no tiene servidores configurados')
    process.exit(1)
}

const server = originalDist.servers[0]

console.log(`📋 Servidor: ${server.name}`)
console.log(`🎮 Versión Minecraft: ${server.minecraftVersion}`)
console.log(`🔨 Forge: ${server.mainServer ? 'Sí' : 'No'}`)

// 3. Generar módulos locales
const localModules = generateModules()

// 4. IMPORTANTE: Preservar módulos especiales (Forge, Libraries, Files)
const specialModules = server.modules.filter(m => 
    m.type === 'ForgeHosted' || 
    m.type === 'Library' || 
    m.type === 'File' ||
    m.type === 'VersionManifest'
)

console.log(`\n🔧 Módulos especiales detectados: ${specialModules.length}`)
specialModules.forEach(m => {
    console.log(`  - ${m.type}: ${m.name || m.id}`)
})

// 5. Combinar: Especiales primero, luego mods
const finalModules = [...specialModules, ...localModules]

// 6. Actualizar servidor
server.modules = finalModules

// 7. Guardar nueva distribución
fs.writeJsonSync(OUTPUT_FILE, originalDist, { spaces: 2 })

console.log(`\n✅ Distribution local generado: ${OUTPUT_FILE}`)
console.log(`📦 Total módulos: ${finalModules.length}`)
console.log(`   - Forge/Libraries: ${specialModules.length}`)
console.log(`   - Mods: ${localModules.length}`)

console.log('\n📋 PRÓXIMOS PASOS:')
console.log('   1. Renombra los archivos:')
console.log('      mv distribution.json distribution-remote.backup')
console.log('      mv distribution-local.json distribution.json')
console.log('   2. Ejecuta el launcher: npm start')
console.log('   3. Login offline y presiona Play')
