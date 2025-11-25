const fs = require('fs-extra')
const path = require('path')

// ========================================
// CONFIGURACIÓN
// ========================================
const DIST_FILE = path.join(__dirname, 'distribution-local.json')
const BACKUP_FILE = path.join(__dirname, 'distribution-remote.backup')

console.log('🔧 Arreglando Forge en distribution-local.json...\n')

// ========================================
// VALIDACIONES
// ========================================

// 1. Verificar que existan los archivos
if(!fs.existsSync(DIST_FILE)) {
    console.error('❌ No se encontró distribution-local.json')
    console.log('💡 Ejecuta primero: node generate-local-dist.js')
    process.exit(1)
}

if(!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ No se encontró distribution-remote.backup')
    console.log('💡 Asegúrate de haber renombrado distribution.json a distribution-remote.backup')
    process.exit(1)
}

// ========================================
// CARGAR ARCHIVOS
// ========================================

console.log('📁 Cargando archivos...')
const dist = fs.readJsonSync(DIST_FILE)
const backup = fs.readJsonSync(BACKUP_FILE)

// ========================================
// BUSCAR FORGE EN BACKUP
// ========================================

console.log('🔍 Buscando Forge en distribution-remote.backup...\n')

const backupServer = backup.servers[0]
const forgeModule = backupServer.modules.find(m => {
    // Buscar por tipo ForgeHosted
    if(m.type === 'ForgeHosted') return true
    
    // O por ID que contenga 'forge'
    if(m.id && m.id.toLowerCase().includes('forge')) return true
    
    return false
})

if(!forgeModule) {
    console.error('❌ No se encontró módulo de Forge en distribution-remote.backup')
    console.log('\n🔍 Módulos encontrados en backup:')
    backupServer.modules.slice(0, 5).forEach(m => {
        console.log(`   - ${m.type}: ${m.id || m.name}`)
    })
    console.log('\n💡 El archivo distribution-remote.backup parece no tener Forge configurado')
    process.exit(1)
}

console.log('✅ Forge encontrado:')
console.log(`   ID: ${forgeModule.id}`)
console.log(`   Nombre: ${forgeModule.name}`)
console.log(`   Tipo: ${forgeModule.type}`)
console.log(`   URL: ${forgeModule.artifact.url.substring(0, 60)}...`)

// ========================================
// INSERTAR FORGE EN DISTRIBUTION LOCAL
// ========================================

console.log('\n📦 Procesando distribution-local.json...')

const localServer = dist.servers[0]

console.log(`   Módulos actuales: ${localServer.modules.length}`)

// Remover cualquier Forge existente (evitar duplicados)
const beforeCount = localServer.modules.length
localServer.modules = localServer.modules.filter(m => {
    if(m.type === 'ForgeHosted') return false
    if(m.id && m.id.toLowerCase().includes('forge')) return false
    return true
})

if(beforeCount !== localServer.modules.length) {
    console.log(`   ⚠️  Removidos ${beforeCount - localServer.modules.length} módulos Forge duplicados`)
}

// Insertar Forge al inicio
localServer.modules.unshift(forgeModule)

console.log('   ✅ Forge insertado como primer módulo')
console.log(`   📦 Total módulos final: ${localServer.modules.length}`)

// ========================================
// VERIFICAR ESTRUCTURA
// ========================================

console.log('\n🔍 Verificando estructura...')

// Verificar que Forge esté primero
if(localServer.modules[0].type !== 'ForgeHosted') {
    console.warn('⚠️  ADVERTENCIA: El primer módulo no es ForgeHosted')
}

// Contar tipos de módulos
const modTypes = {}
localServer.modules.forEach(m => {
    modTypes[m.type] = (modTypes[m.type] || 0) + 1
})

console.log('\n📊 Tipos de módulos:')
Object.entries(modTypes).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`)
})

// ========================================
// GUARDAR ARCHIVO
// ========================================

console.log('\n💾 Guardando cambios...')
fs.writeJsonSync(DIST_FILE, dist, { spaces: 2 })

console.log('✅ distribution-local.json actualizado correctamente')

// ========================================
// INSTRUCCIONES FINALES
// ========================================

console.log('\n' + '='.repeat(60))
console.log('🎉 ¡LISTO! Forge configurado correctamente')
console.log('='.repeat(60))
console.log('\n📋 PRÓXIMOS PASOS:')
console.log('   1. Asegúrate de tener distribution-local.json como distribution.json')
console.log('   2. Ejecuta: npm start')
console.log('   3. Login offline y presiona Play')
console.log('\n💡 Si hay errores, revisa los logs y compártelos\n')
