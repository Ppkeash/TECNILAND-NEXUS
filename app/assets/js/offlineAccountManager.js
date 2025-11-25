/**
 * OfflineAccountManager
 * 
 * Maneja cuentas offline para usuarios sin cuenta Microsoft/Mojang
 */

const fs = require('fs-extra')
const path = require('path')
const ConfigManager = require('./configmanager')
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('OfflineAccountManager')

class OfflineAccountManager {
    
    static ACCOUNTS_FILE = 'offline_accounts.json'
    
    /**
     * Obtener ruta completa del archivo de cuentas
     */
    static getAccountsPath() {
        return path.join(ConfigManager.getDataDirectory(), this.ACCOUNTS_FILE)
    }
    
    /**
     * Cargar todas las cuentas offline
     * @returns {Array} Lista de cuentas offline
     */
    static getAccounts() {
        try {
            const accountsPath = this.getAccountsPath()
            if(fs.existsSync(accountsPath)) {
                const data = fs.readFileSync(accountsPath, 'utf-8')
                return JSON.parse(data)
            }
        } catch(err) {
            logger.error('Error loading offline accounts:', err)
        }
        return []
    }
    
    /**
     * Guardar cuentas en el archivo
     * @param {Array} accounts - Lista de cuentas
     */
    static saveAccounts(accounts) {
        try {
            const accountsPath = this.getAccountsPath()
            fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), 'utf-8')
            logger.info('Offline accounts saved successfully')
            return true
        } catch(err) {
            logger.error('Error saving offline accounts:', err)
            return false
        }
    }
    
    /**
     * Agregar una nueva cuenta offline
     * @param {string} username - Nombre de usuario
     * @returns {Object|null} La cuenta creada o null si falla
     */
    static addAccount(username) {
        if(!username || username.trim().length === 0) {
            logger.warn('Cannot add account: empty username')
            return null
        }
        
        username = username.trim()
        
        // Validar nombre de usuario (solo alfanumérico y guión bajo)
        if(!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            logger.warn('Invalid username format:', username)
            return null
        }
        
        const accounts = this.getAccounts()
        
        // Verificar si ya existe
        const existing = accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase())
        if(existing) {
            logger.info('Account already exists, selecting it:', username)
            this.setSelected(username)
            return existing
        }
        
        // Crear UUID simple para offline
        const uuid = 'offline-' + username.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        const newAccount = {
            username: username,
            uuid: uuid,
            displayName: username,
            type: 'offline',
            selected: true,
            dateAdded: new Date().toISOString()
        }
        
        // Deseleccionar otras cuentas
        accounts.forEach(acc => acc.selected = false)
        
        // Agregar nueva cuenta
        accounts.push(newAccount)
        
        if(this.saveAccounts(accounts)) {
            logger.info('Offline account created:', username)
            return newAccount
        }
        
        return null
    }
    
    /**
     * Obtener la cuenta seleccionada actualmente
     * @returns {Object|null} La cuenta seleccionada o null
     */
    static getSelected() {
        const accounts = this.getAccounts()
        return accounts.find(acc => acc.selected) || null
    }
    
    /**
     * Seleccionar una cuenta por nombre de usuario
     * @param {string} username - Nombre de usuario a seleccionar
     * @returns {boolean} true si se seleccionó correctamente
     */
    static setSelected(username) {
        const accounts = this.getAccounts()
        let found = false
        
        accounts.forEach(acc => {
            if(acc.username.toLowerCase() === username.toLowerCase()) {
                acc.selected = true
                found = true
            } else {
                acc.selected = false
            }
        })
        
        if(found) {
            return this.saveAccounts(accounts)
        }
        
        logger.warn('Account not found:', username)
        return false
    }
    
    /**
     * Verificar si hay una sesión offline activa
     * @returns {boolean}
     */
    static isLoggedIn() {
        return this.getSelected() !== null
    }
    
    /**
     * Cerrar sesión (deseleccionar cuenta actual)
     */
    static logout() {
        const accounts = this.getAccounts()
        let changed = false
        
        accounts.forEach(acc => {
            if(acc.selected) {
                acc.selected = false
                changed = true
            }
        })
        
        if(changed) {
            this.saveAccounts(accounts)
            logger.info('Offline session logged out')
        }
    }
    
    /**
     * Eliminar una cuenta offline
     * @param {string} username - Nombre de usuario a eliminar
     * @returns {boolean}
     */
    static removeAccount(username) {
        let accounts = this.getAccounts()
        const initialLength = accounts.length
        
        accounts = accounts.filter(acc => acc.username.toLowerCase() !== username.toLowerCase())
        
        if(accounts.length < initialLength) {
            this.saveAccounts(accounts)
            logger.info('Offline account removed:', username)
            return true
        }
        
        return false
    }
    
    /**
     * Obtener cuenta como objeto compatible con AuthManager
     * Para usar en ProcessBuilder
     * @returns {Object|null}
     */
    static getAuthUser() {
        const account = this.getSelected()
        if(!account) return null
        
        return {
            username: account.username,
            displayName: account.displayName || account.username,
            uuid: account.uuid,
            accessToken: 'offline-token-' + account.username,
            type: 'offline',
            offline: true
        }
    }
}

module.exports = OfflineAccountManager
