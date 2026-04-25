const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Konfiguration
const store = new Store();
let mainWindow = null;
let splashWindow = null;

// Entwicklung vs. Produktion
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--debug');

// Auto-Updater konfigurieren
if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
}

/**
 * Splash Screen erstellen
 */
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'src', 'pages', 'splash.html'));
    
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.destroy();
        }
    }, 2000);
}

/**
 * Hauptfenster erstellen
 */
function createMainWindow() {
    // Fenstergröße aus Store laden oder Standard verwenden
    const windowBounds = store.get('windowBounds', {
        width: 1200,
        height: 800
    });

    mainWindow = new BrowserWindow({
        width: windowBounds.width,
        height: windowBounds.height,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
        show: false
    });

    // Hauptfenster laden (zuerst Login-Seite)
    const isLoggedIn = store.get('isLoggedIn', false);
    
    if (isLoggedIn && store.get('userId') && store.get('session')) {
        mainWindow.loadFile(path.join(__dirname, 'src', 'pages', 'main.html'));
    } else {
        mainWindow.loadFile(path.join(__dirname, 'src', 'pages', 'login.html'));
    }

    // Fensterposition speichern beim Schließen
    mainWindow.on('close', () => {
        const bounds = mainWindow.getBounds();
        store.set('windowBounds', bounds);
    });

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.destroy();
        }
        mainWindow.show();
        
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Menu erstellen
    const menuTemplate = createMenuTemplate();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    return mainWindow;
}

/**
 * Menu-Template erstellen
 */
function createMenuTemplate() {
    const template = [
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Neues Profil',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-profile');
                    }
                },
                {
                    label: 'Gruppen verwalten',
                    click: () => {
                        mainWindow.webContents.send('menu-groups');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exportieren',
                    submenu: [
                        {
                            label: 'Als PDF exportieren',
                            click: () => {
                                mainWindow.webContents.send('menu-export-pdf');
                            }
                        },
                        {
                            label: 'Als CSV exportieren',
                            click: () => {
                                mainWindow.webContents.send('menu-export-csv');
                            }
                        }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Beenden',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Wiederherstellen', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Alles auswählen', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                { label: 'Vergrößern', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Verkleinern', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Originalgröße', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'Vollbild', accelerator: 'F11', role: 'togglefullscreen' },
                { label: 'Entwicklertools', accelerator: 'F12', click: () => {
                    mainWindow.webContents.openDevTools();
                }}
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Dokumentation',
                    click: () => {
                        shell.openExternal('https://paul-koop.org/api/docs');
                    }
                },
                {
                    label: 'Über DÜSK',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Über DÜSK',
                            message: 'Düsseldorfer Schülerinventar',
                            detail: 'Version 1.0.0\n\n© 2024 DÜSK Team\n\nEine Anwendung zur Erfassung und Auswertung von Selbst- und Fremdeinschätzungen von Schülerkompetenzen.',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    return template;
}

/**
 * IPC-Handler für API-Kommunikation
 */
ipcMain.handle('api-call', async (event, { endpoint, method, data, headers }) => {
    const axios = require('axios');
    const baseURL = 'https://paul-koop.org/api/';
    
    try {
        const config = {
            method: method,
            url: baseURL + endpoint,
            headers: { 'Content-Type': 'application/json', ...headers },
            timeout: 30000
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            status: error.response?.status || 500,
            data: error.response?.data
        };
    }
});

/**
 * IPC-Handler für Speicherung
 */
ipcMain.handle('store-get', (event, key) => {
    return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
    return true;
});

ipcMain.handle('store-delete', (event, key) => {
    store.delete(key);
    return true;
});

/**
 * IPC-Handler für Dialoge
 */
ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});

/**
 * Navigation
 */
ipcMain.handle('navigate', (event, page) => {
    mainWindow.loadFile(path.join(__dirname, 'src', 'pages', `${page}.html`));
});

ipcMain.handle('logout', () => {
    store.delete('isLoggedIn');
    store.delete('userId');
    store.delete('session');
    mainWindow.loadFile(path.join(__dirname, 'src', 'pages', 'login.html'));
});

/**
 * App-Events
 */
app.whenReady().then(() => {
    if (!isDev) {
        createSplashWindow();
    }
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

// Auto-Updater Events
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
});