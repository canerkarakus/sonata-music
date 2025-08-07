const { app, BrowserWindow, ipcMain, Menu, dialog, shell, protocol, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// Backend server
let backendServer = null;

// Ana pencere referansı
let mainWindow;

// Backend server başlatma
function startBackendServer() {
    try {
        console.log('🔄 Backend server başlatılıyor...');
        require('./server.js');
        console.log('✅ Backend server başlatıldı');
    } catch (error) {
        console.error('❌ Backend server başlatılamadı:', error);
        dialog.showErrorBox('Server Hatası', 
            'Backend server başlatılamadı. Uygulama giriş/kayıt sistemi çalışmayabilir.\n\nHata: ' + error.message
        );
    }
}

// Backend server durdurma
function stopBackendServer() {
    if (backendServer) {
        console.log('🔄 Backend server durduruluyor...');
        backendServer.close(() => {
            console.log('✅ Backend server durduruldu');
        });
        backendServer = null;
    }
}

// Uygulama hazır olduğunda çalışır
app.whenReady().then(() => {
    startBackendServer();
    createMainWindow();
    createMenu();
    setupIPC();
    
    // F12 tuş kısayolu için global shortcut kaydet
    globalShortcut.register('F12', () => {
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.toggleDevTools();
        }
    });
    
    // macOS için: dock icon'a tıklandığında pencere yoksa yeni pencere oluştur
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Uygulama kapatılırken
app.on('before-quit', () => {
    stopBackendServer();
    // Global shortcuts'u temizle
    globalShortcut.unregisterAll();
});

// Ana pencere oluşturma fonksiyonu
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        minWidth: 1200,
        minHeight: 800,
        frame: false, // Özel window controls kullanacağız
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false, // F12 developer tools için
            devTools: false // Developer tools kapalı
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false, // Başlangıçta gizli, hazır olduğunda göster
        backgroundColor: '#0a0a0a', // Uygulama teması ile uyumlu
        webSecurity: false,
        allowRunningInsecureContent: false
    });

    // HTML dosyasını yükle
    mainWindow.loadFile('index.html');

    // Pencere hazır olduğunda göster
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.maximize(); // Uygulama tam ekran başlasın
        
        // DevTools'u sadece geliştirme modunda aç
        if (process.argv.includes('--dev')) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Pencere kapatılma eventi
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // External linkler için varsayılan tarayıcıyı kullan
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Güvenlik: navigation'ı kontrol et
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
}

// Uygulama menüsünü oluştur
function createMenu() {
    const template = [
        {
            label: 'Dosya',
            submenu: [
                {
                    label: 'Yeni Çalma Listesi',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'new-playlist');
                    }
                },
                {
                    label: 'Şarkı Yükle',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'upload-song');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Çıkış',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Düzen',
            submenu: [
                { role: 'undo', label: 'Geri Al' },
                { role: 'redo', label: 'Yinele' },
                { type: 'separator' },
                { role: 'cut', label: 'Kes' },
                { role: 'copy', label: 'Kopyala' },
                { role: 'paste', label: 'Yapıştır' }
            ]
        },
        {
            label: 'Görünüm',
            submenu: [
                { role: 'reload', label: 'Yenile' },
                { role: 'forceReload', label: 'Zorla Yenile' },
                { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom Sıfırla' },
                { role: 'zoomIn', label: 'Yakınlaştır' },
                { role: 'zoomOut', label: 'Uzaklaştır' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Tam Ekran' }
            ]
        },
        {
            label: 'Oynatma',
            submenu: [
                {
                    label: 'Oynat/Duraklat',
                    accelerator: 'Space',
                    click: () => {
                        mainWindow.webContents.send('player-action', 'toggle-play');
                    }
                },
                {
                    label: 'Önceki Şarkı',
                    accelerator: 'CmdOrCtrl+Left',
                    click: () => {
                        mainWindow.webContents.send('player-action', 'previous');
                    }
                },
                {
                    label: 'Sonraki Şarkı',
                    accelerator: 'CmdOrCtrl+Right',
                    click: () => {
                        mainWindow.webContents.send('player-action', 'next');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Karıştır',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('player-action', 'shuffle');
                    }
                },
                {
                    label: 'Tekrarla',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.send('player-action', 'repeat');
                    }
                }
            ]
        },
        {
            label: 'Hesap',
            submenu: [
                {
                    label: 'Profil',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'profile');
                    }
                },
                {
                    label: 'Ayarlar',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'settings');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Oturumu Kapat',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'logout');
                    }
                }
            ]
        },
        {
            label: 'Yardım',
            submenu: [
                {
                    label: 'Sonata Hakkında',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Sonata Music Hakkında',
                            message: 'Sonata Music v1.0.0',
                            detail: 'Modern masaüstü müzik uygulaması\n\n© 2024 Sonata Music Team\nTüm hakları saklıdır.',
                            buttons: ['Tamam']
                        });
                    }
                },
                {
                    label: 'GitHub\'da Görüntüle',
                    click: () => {
                        shell.openExternal('https://github.com/sonata-music/sonata-desktop');
                    }
                }
            ]
        }
    ];

    // macOS için menüyü ayarla
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about', label: 'Sonata Hakkında' },
                { type: 'separator' },
                { role: 'services', label: 'Servisler' },
                { type: 'separator' },
                { role: 'hide', label: 'Sonata\'yı Gizle' },
                { role: 'hideothers', label: 'Diğerlerini Gizle' },
                { role: 'unhide', label: 'Tümünü Göster' },
                { type: 'separator' },
                { role: 'quit', label: 'Sonata\'dan Çık' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC (Inter-Process Communication) kurulumu
function setupIPC() {
    // Pencere kontrolü için IPC handlers
    ipcMain.handle('window-minimize', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    ipcMain.handle('window-maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.handle('window-close', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });

    ipcMain.handle('window-is-maximized', () => {
        return mainWindow ? mainWindow.isMaximized() : false;
    });

    // Dosya seçimi için dialog
    ipcMain.handle('show-open-dialog', async (event, options) => {
        const result = await dialog.showOpenDialog(mainWindow, options);
        return result;
    });

    ipcMain.handle('show-save-dialog', async (event, options) => {
        const result = await dialog.showSaveDialog(mainWindow, options);
        return result;
    });

    // Dosya işlemleri
    ipcMain.handle('read-file', async (event, filePath) => {
        try {
            const data = fs.readFileSync(filePath);
            return { success: true, data: data.toString('base64') };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('write-file', async (event, filePath, data) => {
        try {
            fs.writeFileSync(filePath, data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Uygulama bilgileri
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    ipcMain.handle('get-app-path', () => {
        return app.getAppPath();
    });



    // External links
    ipcMain.handle('open-external', (event, url) => {
        shell.openExternal(url);
    });
}

// Uygulama güvenlik ayarları
app.on('web-contents-created', (event, contents) => {
    // External navigation'ı engelle
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });

    // Yeni pencere açılmasını engelle
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});

// Sertifika hatalarını yoksay (geliştirme için)
app.commandLine.appendSwitch('ignore-certificate-errors');

// Hardware acceleration (isteğe bağlı olarak devre dışı bırakılabilir)
// app.disableHardwareAcceleration();

// Single instance uygulaması (sadece bir instance çalışabilir)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Ikinci instance açılmaya çalışıldığında mevcut pencereyi öne getir
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
} 