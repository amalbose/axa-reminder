const electron = require('electron')
var AutoLaunch = require('auto-launch');

const {app, BrowserWindow, Menu, Tray, ipcMain} = electron

const mTemplate = require('./js/menuTemplate.js')

let tray = null;
let win = null;
let contextMenu = null;

app.on('ready', () => {
	win = new BrowserWindow({
		width : 800,
		height: 600,
		frame : false
	})

	win.loadURL(`file://${__dirname}/main.html`)
	win.webContents.openDevTools()
	win.on('close', function () { win = null })

    tray = new Tray('assets/icon.png')
    contextMenu = Menu.buildFromTemplate([
        {label: 'Show/Hide Window', click() { toggleApplication(); }},
        {label: 'Quit', click() { quitApp(); }}
    ])
    tray.setContextMenu(contextMenu)

    win.on('show', () => {
      tray.setHighlightMode('always')
    })
    win.on('hide', () => {
      tray.setHighlightMode('never')
    })

})

ipcMain.on('toggleApplication', (event, arg) => {
  toggleApplication();
});

function toggleApplication() {
  win.isVisible() ? win.hide() : win.show()
}

function quitApp(){
    app.quit();
}

const menu = Menu.buildFromTemplate(mTemplate.template)
Menu.setApplicationMenu(menu)


// Auto launch
 
var axareminderLauncher = new AutoLaunch({
    name: 'AxaReminder',
    isHidden: true,
});
 
axareminderLauncher.enable(); 
 
axareminderLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    axareminderLauncher.enable();
})
.catch(function(err){
    // handle error 
});