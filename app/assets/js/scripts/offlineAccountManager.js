/**
 * Offline Account Manager
 * Integrado con ConfigManager para persistencia real
 */

const OfflineAccountManager = {
    addAccount(username) {
        try {
            if(typeof ConfigManager === 'undefined') return false
            
            const result = ConfigManager.addOfflineAccount(username)
            if(result) {
                this.setSelected(username)
                console.log('✅ Offline account added:', username)
                return true
            }
            return false
        } catch(e) {
            console.error('Error adding account:', e)
            return false
        }
    },

    getAccounts() {
        try {
            if(typeof ConfigManager === 'undefined') return []
            return ConfigManager.getOfflineAccounts()
        } catch(e) {
            console.error('Error loading accounts:', e)
            return []
        }
    },

    getSelected() {
        try {
            if(typeof ConfigManager === 'undefined') return null
            return ConfigManager.getSelectedOfflineAccount()
        } catch(e) {
            console.error('Error getting selected:', e)
            return null
        }
    },

    setSelected(username) {
        try {
            if(typeof ConfigManager === 'undefined') return false
            
            const result = ConfigManager.setSelectedOfflineAccount(username)
            if(result) {
                localStorage.setItem('offlineUsername', username)
                localStorage.setItem('offlineMode', 'true')
                console.log('✅ Selected offline account:', username)
            }
            return result
        } catch(e) {
            console.error('Error setting selected:', e)
            return false
        }
    },

    deleteAccount(username) {
        try {
            if(typeof ConfigManager === 'undefined') return false
            
            if(ConfigManager.removeOfflineAccount(username)) {
                localStorage.removeItem('offlineUsername')
                localStorage.removeItem('offlineMode')
                console.log('✅ Offline account deleted:', username)
                return true
            }
            return false
        } catch(e) {
            console.error('Error deleting account:', e)
            return false
        }
    },

    logout() {
        try {
            if(typeof ConfigManager === 'undefined') return false
            
            ConfigManager.setSelectedOfflineAccount(null)
            localStorage.removeItem('offlineUsername')
            localStorage.removeItem('offlineMode')
            console.log('✅ Offline logout')
            return true
        } catch(e) {
            console.error('Error logging out:', e)
            return false
        }
    },

    clearAll() {
        try {
            if(typeof ConfigManager === 'undefined') return false
            
            const accounts = this.getAccounts()
            accounts.forEach(acc => ConfigManager.removeOfflineAccount(acc.username))
            localStorage.removeItem('offlineUsername')
            localStorage.removeItem('offlineMode')
            
            console.log('✅ All offline accounts cleared')
            return true
        } catch(e) {
            console.error('Error clearing all:', e)
            return false
        }
    },

    isLoggedIn() {
        return this.getSelected() !== null
    }
}
