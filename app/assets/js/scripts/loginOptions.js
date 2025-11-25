const loginOptionsCancelContainer = document.getElementById('loginOptionCancelContainer')
const loginOptionMicrosoft = document.getElementById('loginOptionMicrosoft')
const loginOptionMojang = document.getElementById('loginOptionMojang')
const loginOptionOffline = document.getElementById('loginOptionOffline')
const loginOptionsCancelButton = document.getElementById('loginOptionCancelButton')

let loginOptionsCancellable = false

let loginOptionsViewOnLoginSuccess
let loginOptionsViewOnLoginCancel
let loginOptionsViewOnCancel
let loginOptionsViewCancelHandler

function loginOptionsCancelEnabled(val){
    if(val){
        $(loginOptionsCancelContainer).show()
    } else {
        $(loginOptionsCancelContainer).hide()
    }
}

loginOptionMicrosoft.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
        ipcRenderer.send(
            MSFT_OPCODE.OPEN_LOGIN,
            loginOptionsViewOnLoginSuccess,
            loginOptionsViewOnLoginCancel
        )
    })
}

loginOptionMojang.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
        loginViewOnSuccess = loginOptionsViewOnLoginSuccess
        loginViewOnCancel = loginOptionsViewOnLoginCancel
        loginOptionsCancelEnabled(true)
    })
}

loginOptionOffline.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
        // Modo offline
        window.offlineMode = true
        
        // Ocultar campo de contraseña
        document.getElementById('loginPassword').parentElement.style.display = 'none'
        document.getElementById('loginPasswordError').style.display = 'none'
        
        // Cambiar placeholder y subheader
        document.getElementById('loginUsername').placeholder = Lang.queryJS('login.loginEmailPlaceholder')
        document.getElementById('loginSubheader').textContent = Lang.queryJS('login.loginOfflineSubheader')
        
        // Cambiar texto del botón
        document.getElementById('loginButton').textContent = Lang.queryJS('login.loginOfflineButtonText')
        
        loginViewOnSuccess = loginOptionsViewOnLoginSuccess
        loginViewOnCancel = loginOptionsViewOnLoginCancel
        loginOptionsCancelEnabled(true)
    })
}



loginOptionsCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
        // Clear login values (Mojang login)
        // No cleanup needed for Microsoft.
        loginUsername.value = ''
        loginPassword.value = ''
        if(loginOptionsViewCancelHandler != null){
            loginOptionsViewCancelHandler()
            loginOptionsViewCancelHandler = null
        }
    })
}