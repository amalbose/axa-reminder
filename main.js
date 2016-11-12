const electron = require('electron')

const {app, BrowserWindow, Menu, Tray} = electron

const mTemplate = require('./js/menuTemplate.js')

app.on('ready', () => {
	let win = new BrowserWindow({
		width : 800,
		height: 600,
		frame : false
	})

	win.loadURL(`file://${__dirname}/main.html`)
	win.webContents.openDevTools()
	win.on('close', function () { win = null })
})

const menu = Menu.buildFromTemplate(mTemplate.template)
Menu.setApplicationMenu(menu)

// let tray = null
// app.on('ready', () => {
//   tray = new Tray('icon.png')
//   const contextMenu = Menu.buildFromTemplate([
//     {label: 'Item1', type: 'radio'},
//     {label: 'Item2', type: 'radio'},
//     {label: 'Item3', type: 'radio', checked: true},
//     {label: 'Item4', type: 'radio'}
//   ])
//   tray.setToolTip('This is my application.')
//   tray.setContextMenu(contextMenu)
// })