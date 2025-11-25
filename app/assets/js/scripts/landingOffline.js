/**
 * Script para manejar cuentas offline en landing.ejs
 */

// Esperar a que DOM esté listo Y landing.js esté cargado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if(typeof OfflineAccountManager !== 'undefined' && typeof updateSelectedAccount === 'function') {
            const offlineAccount = OfflineAccountManager.getSelected()
            
            if(offlineAccount) {
                console.log('✅ Offline account loaded:', offlineAccount.username)
                updateSelectedAccount(null)
            }
        }
    }, 100)
})

// Ejecutar cuando el DOM está listo
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadOfflineAccount)
} else {
    loadOfflineAccount()
}
