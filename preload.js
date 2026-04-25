const { contextBridge, ipcRenderer } = require('electron');

// Expose sichere APIs zur Renderer-Seite
contextBridge.exposeInMainWorld('electronAPI', {
    // API Calls
    apiCall: (endpoint, method, data, headers) => 
        ipcRenderer.invoke('api-call', { endpoint, method, data, headers }),
    
    // Storage
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
    storeDelete: (key) => ipcRenderer.invoke('store-delete', key),
    
    // Navigation
    navigate: (page) => ipcRenderer.invoke('navigate', page),
    logout: () => ipcRenderer.invoke('logout'),
    
    // Dialoge
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    
    // Menu Events
    onMenuNewProfile: (callback) => ipcRenderer.on('menu-new-profile', callback),
    onMenuGroups: (callback) => ipcRenderer.on('menu-groups', callback),
    onMenuExportPDF: (callback) => ipcRenderer.on('menu-export-pdf', callback),
    onMenuExportCSV: (callback) => ipcRenderer.on('menu-export-csv', callback),
    
    // Updates
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    restartApp: () => ipcRenderer.send('restart-app')
});