const electron = require('electron')

const {app, BrowserWindow, Menu} = electron

const mTemplate = require('./js/menuTemplate.js')

app.on('ready', () => {
	let win = new BrowserWindow({
		width : 800,
		height: 600,
		frame : false
	})

	win.loadURL(`file://${__dirname}/index.html`)
	win.webContents.openDevTools()
	win.on('close', function () { win = null })
})

const menu = Menu.buildFromTemplate(mTemplate.template)
Menu.setApplicationMenu(menu)