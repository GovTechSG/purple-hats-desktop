const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  shell,
  session,
} = require("electron");
const fs = require("fs");
const EventEmitter = require("events");
const constants = require("./constants");
const scanManager = require("./scanManager");
const updateManager = require("./updateManager");
const userDataManager = require("./userDataManager.js");
const userDataFormManager = require("./userDataFormManager");

const app = electronApp;

let launchWindow;
let mainWindow;

function createLaunchWindow() {
  launchWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });

  launchWindow.loadFile(constants.indexPath);
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(constants.indexPath);
  // mainWindow.loadURL(`http://localhost:3000`)
}

// TODO set ipcMain messages
app.on("ready", async () => {
  // create settings file if it does not exist
  await userDataManager.init();

  if (constants.proxy === null) {
    const launchWindowReady = new Promise((resolve) => {
      ipcMain.once("guiReady", () => {
        resolve();
      });
    });

    createLaunchWindow();
    await launchWindowReady;
    launchWindow.webContents.send("appStatus", "launch");

    // this is used for listening to messages that updateManager sends
    const updateEvent = new EventEmitter();

    updateEvent.on("settingUp", () => {
      launchWindow.webContents.send("launchStatus", "settingUp");
    });

    updateEvent.on("checking", () => {
      launchWindow.webContents.send("launchStatus", "checkingUpdates");
    });

    updateEvent.on("promptFrontendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptFrontendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("promptBackendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptBackendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("updatingFrontend", () => {
      launchWindow.webContents.send("launchStatus", "updatingFrontend");
    });

    updateEvent.on("updatingBackend", () => {
      launchWindow.webContents.send("launchStatus", "updatingBackend");
    });

    updateEvent.on("frontendDownloadComplete", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadComplete");
      ipcMain.once("launchInstaller", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("frontendDownloadCompleteMacOS", (userResponse) => {
      launchWindow.webContents.send(
        "launchStatus",
        "frontendDownloadCompleteMacOS"
      );
      ipcMain.once("restartAppAfterMacOSFrontendUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("installerLaunched", () => {
      app.exit();
    });

    updateEvent.on("restartTriggered", () => {
      app.relaunch();
      app.exit();
    });

    updateEvent.on("frontendDownloadFailed", () => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadFailed");
    });
    await updateManager.run(updateEvent);

    launchWindow.close();
  }

  const mainReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createMainWindow();
  scanManager.init();

  ipcMain.on("openLink", (_event, url) => {
    shell.openExternal(url);
  });

  await mainReady;

  mainWindow.webContents.send("appStatus", "ready");
  mainWindow.webContents.send("versionNumber", constants.appVersion);
  mainWindow.webContents.send("isProxy", constants.proxy);

  const userDataEvent = new EventEmitter();
  userDataEvent.on("userDataDoesNotExist", (setUserData) => {
    mainWindow.webContents.send("userDataExists", "doesNotExist");
    ipcMain.once("userDataReceived", (_event, data) => {
      setUserData(data);
    });
  });
  userDataEvent.on("userDataDoesExist", () => {
    mainWindow.webContents.send("userDataExists", "exists");
  });

  await userDataManager.setData(userDataEvent);
  await userDataFormManager.init();

  if (constants.proxy) {
    session.defaultSession.enableNetworkEmulation({
      offline: true,
    });
  }
});

app.on("quit", () => {
  updateManager.killChildProcess();
  scanManager.killChildProcess();
});
