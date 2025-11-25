const { DistributionAPI } = require('helios-core/common')
const ConfigManager = require('./configmanager')

exports.REMOTE_DISTRO_URL = 'https://raw.githubusercontent.com/Ppkeash/Programa-git/main/distribution.json'

console.log('🟡 [DistroManager] Inicializando DistributionAPI...')
console.log('🟡 [DistroManager] URL:', exports.REMOTE_DISTRO_URL)

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null,
    null,
    exports.REMOTE_DISTRO_URL,
    false
)

console.log('🟡 [DistroManager] DistributionAPI inicializado')

// Intentar cargar la distribución inmediatamente
api.refreshDistributionOrFallback().then(() => {
    console.log('✅ [DistroManager] Distribution cargada exitosamente')
    const distro = api.getDistribution()
    if (distro && distro.servers) {
        console.log('✅ [DistroManager] Servidores disponibles:', distro.servers.length)
        distro.servers.forEach(server => {
            console.log(`   📌 ${server.name} (${server.id})`)
        })
    }
}).catch(err => {
    console.error('❌ [DistroManager] Error al cargar distribution:', err)
})

exports.DistroAPI = api
