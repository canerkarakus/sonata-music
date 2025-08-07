const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API'yi renderer process'e expose et
contextBridge.exposeInMainWorld('electronAPI', {
    // Pencere kontrolleri
    window: {
        minimize: () => ipcRenderer.invoke('window-minimize'),
        maximize: () => ipcRenderer.invoke('window-maximize'),
        close: () => ipcRenderer.invoke('window-close'),
        isMaximized: () => ipcRenderer.invoke('window-is-maximized')
    },
    
    // Dosya dialog'ları
    dialog: {
        showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
        showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options)
    },
    
    // Dosya işlemleri
    file: {
        read: (filePath) => ipcRenderer.invoke('read-file', filePath),
        write: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data)
    },
    
    // Uygulama bilgileri
    app: {
        getVersion: () => ipcRenderer.invoke('get-app-version'),
        getPath: () => ipcRenderer.invoke('get-app-path')
    },
    

    
    // External links
    shell: {
        openExternal: (url) => ipcRenderer.invoke('open-external', url)
    },
    
    // Event listeners
    on: (channel, func) => {
        const validChannels = [
            'menu-action',
            'player-action'
        ];
        
        if (validChannels.includes(channel)) {
            // Remove existing listeners to avoid duplicates
            ipcRenderer.removeAllListeners(channel);
            // Add new listener
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    
    // Remove event listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Platform bilgisi
contextBridge.exposeInMainWorld('platform', {
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux'
});

// Environment bilgisi
contextBridge.exposeInMainWorld('env', {
    isDev: process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
}); 