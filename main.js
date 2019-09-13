"use strict";
// Import parts of electron to use
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");
// require("update-electron-app")();

app.commandLine.appendSwitch("ignore-gpu-blacklist", "js-flags", "--max-old-space-size=10240");
// app.disableHardwareAcceleration();
// app.enableSandbox();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;

if (
	process.defaultApp ||
	/[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
	/[\\/]electron[\\/]/.test(process.execPath)
) {
	dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === "win32") {
	app.commandLine.appendSwitch("high-dpi-support", "true");
	app.commandLine.appendSwitch("force-device-scale-factor", "1");
} else {
	app.setAboutPanelOptions({
		applicationName: "2PX",
		copyright: "Muhammed Burak Şentürk 2019@~",
		iconPath: path.join(__dirname + "/assets/icon.png"),
	});
}

function createWindow() {
	const splash = new BrowserWindow({
		width: 810,
		height: 610,
		transparent: true,
		titleBarStyle: "hidden",
		frame: false,
		alwaysOnTop: true,
	});
	splash.loadURL(`file://${__dirname}/Splash.html`);
	// BrowserWindow.addDevToolsExtension(
	//   path.join(
	//     os.homedir(),
	//     "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.0.5_0"
	//   )
	// );
	if (process.env.NODE_ENV === "development" || dev) {
		const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
		require("devtron").install();

		// Make sure you have the FULL path here or it won't work
		// installExtension(REACT_DEVELOPER_TOOLS)
		//   .then(name => console.log(`Added Extension:  ${name}`))
		//   .catch(err => console.log("An error occurred: ", err));
	}

	// Create the browser window.
	mainWindow = new BrowserWindow({
		minHeight: 720,
		minWidth: 1280,
		height: 1080,
		width: 1920,
		show: false,
		backgroundColor: "#111",
		darkTheme: true,
		icon: path.join(__dirname + "/assets/icon.png"),
		webPreferences: {
			devTools: dev,
			nodeIntegration: true,
			// offscreen: true,
			webSecurity: false,
      iscrollBounce: 
		},
	});
	mainWindow.webContents.on("new-window", (event, url, frameName, disposition, options, additionalFeatures) => {
		if (frameName === "modal") {
			// open window as modal
			event.preventDefault();
			Object.assign(options, {
				modal: true,
				parent: mainWindow,
				width: 100,
				height: 100,
			});
			event.newGuest = new BrowserWindow(options);
		}
	});

	// and load the index.html of the app.
	let indexPath;
	if (dev && process.argv.indexOf("--noDevServer") === -1) {
		indexPath = url.format({
			protocol: "http:",
			host: "localhost:8080",
			pathname: "index.html",
			slashes: true,
		});
	} else {
		indexPath = url.format({
			protocol: "file:",
			pathname: path.join(__dirname, "dist", "index.html"),
			slashes: true,
		});
	}

	mainWindow.loadURL(indexPath);

	// Don't show until we are ready and loaded
	mainWindow.once("ready-to-show", () => {
		splash.destroy();
		mainWindow.show();

		// Open the DevTools automatically if developing
		if (dev) {
			mainWindow.webContents.openDevTools();
		}
	});

	// Emitted when the window is closed.
	mainWindow.on("closed", function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});
const template = [
	// { role: 'appMenu' }
	...(process.platform === "darwin"
		? [
				{
					label: app.getName(),
					submenu: [
						{ role: "about" },
						{ type: "separator" },
						{ role: "services" },
						{ type: "separator" },
						{ role: "hide" },
						{ role: "hideothers" },
						{ role: "unhide" },
						{ type: "separator" },
						{ role: "quit" },
					],
				},
		  ]
		: []),
	// { role: 'fileMenu' }
	{
		label: "Dosya",
		submenu: [process.platform === "darwin" ? { role: "close" } : { role: "quit" }],
	},
	// { role: 'editMenu' }
	{
		label: "Düzenleme",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			...(process.platform === "darwin"
				? [
						{ role: "pasteAndMatchStyle" },
						{ role: "delete" },
						{ role: "selectAll" },
						{ type: "separator" },
						{
							label: "Speech",
							submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
						},
				  ]
				: [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
		],
	},
	// { role: 'viewMenu' }
	{
		label: "Görünüm",
		submenu: [
			...(dev ? [{ role: "reload" }, { role: "forcereload" }, { role: "toggledevtools" }] : []),
			{ type: "separator" },
			{ role: "resetzoom" },
			{ role: "zoomin" },
			{ role: "zoomout" },
			{ type: "separator" },
			{ role: "togglefullscreen" },
		],
	},
	// { role: 'windowMenu' }
	{
		label: "Window",
		submenu: [
			{ role: "minimize" },
			{ role: "zoom" },
			...(process.platform === "darwin"
				? [{ type: "separator" }, { role: "front" }, { type: "separator" }, { role: "window" }]
				: [{ role: "close" }]),
		],
	},
	// {
	//   role: "help",
	//   submenu: [
	//     {
	//       label: "Learn More",
	//       click: async () => {
	//         const { shell } = require("electron");
	//         await shell.openExternal("https://electronjs.org");
	//       },
	//     },
	//   ],
	// },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
