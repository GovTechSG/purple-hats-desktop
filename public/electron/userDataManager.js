const fs = require("fs");
const {
    userDataFilePath 
} = require("./constants"); 
const { ipcMain } = require("electron");

const readUserDataFromFile = () => {
    return JSON.parse(fs.readFileSync(userDataFilePath));
}
const writeUserDataToFile = (userData) => {
    const data = readUserDataFromFile();
    data.name = userData.name; 
    data.email = userData.email;
    fs.writeFileSync(userDataFilePath, JSON.stringify(data));
}

const init = async () => {
    const userDataExists = fs.existsSync(userDataFilePath);
    if (!userDataExists) {
        const defaultSettings = {
            name: "", 
            email: "",
            autoSubmit: true, 
            event: false, 
            browser: "chrome", 
            autoUpdate: true
        }; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(defaultSettings));
    }

    ipcMain.handle("getUserData", (_event) => { 
        const data = readUserDataFromFile();
        return data;
    })

    ipcMain.on("editUserData", (_event, data) => {
        writeUserDataToFile(data);
    })
}

const setData = async (userDataEvent) => {
    const data = readUserDataFromFile();

    if (data.name === "" || data.email === "") {
        const userData = new Promise((resolve) => {
           userDataEvent.emit("userDataDoesNotExist", resolve);
        })
        const userDataReceived = await userData; 
        writeUserDataToFile(userDataReceived);
    } else {
        userDataEvent.emit("userDataDoesExist");
    }
}

module.exports = {
    init,
    setData, 
    readUserDataFromFile
}