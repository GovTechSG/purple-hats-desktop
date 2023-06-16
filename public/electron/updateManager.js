const os = require("os");
const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");
const axios = require("axios");
const {
  releaseUrl,
  enginePath,
  getEngineVersion,
  appPath,
  backendPath,
  updateBackupsFolder,
  scanResultsPath,
  phZipPath,
  createPlaywrightContext,
  deleteClonedProfiles
} = require("./constants");
const { silentLogger } = require("./logs");
const { readUserDataFromFile } = require("./userDataManager");

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const execCommand = async (command) => {
  let options = { cwd: appPath };

  const execution = new Promise((resolve) => {
    const process = exec(command, options, (err, _stdout, stderr) => {
      if (err) {
        console.log("error with running command:", command);
        silentLogger.error(stderr.toString());
      }
      currentChildProcess = null;
      resolve();
    });
    currentChildProcess = process;
  });

  await execution;
};

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    headers: {
      // 'X-Forwarded-For': 'xxx',
      "User-Agent": "axios",
    },
  }),
});

const getDownloadUrlFromReleaseData = (data) => {
  const osToUrl = {};

  data.assets.forEach((e) => {
    const url = e.browser_download_url;

    if (url.endsWith("windows.zip")) {
      osToUrl.win32 = url;
    } else {
      osToUrl.darwin = url;
    }
  });

  return osToUrl[os.platform()];
};

const backUpData = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `mkdir "${updateBackupsFolder}" &&\
    move "${scanResultsPath}" "${updateBackupsFolder}"`;
  } else {
    command = `mkdir '${updateBackupsFolder}' &&
    (mv '${scanResultsPath}' '${updateBackupsFolder}' || true)`;
  }

  await execCommand(command);
};

const cleanUpBackend = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `rmdir /s /q '${backendPath}'`;
  } else {
    command = `rm -rf '${backendPath}'`;
  }

  await execCommand(command);
};

const downloadBackend = async () => {
  // if (os.platform() === "win32"){
  //   return
  // }

  let downloadUrl;

  try {
    // const { data } = await axiosInstance.get(releaseUrl);
    const data = await getBackendData();
    downloadUrl = getDownloadUrlFromReleaseData(data);
  } catch (e) {
    console.log(
      "An error occured while trying to check for backend download URL\n",
      e.toString()
    );
    console.log("Attemping to download latest from GitHub directly");

    // if (os.platform() === "win32") {
    //   downloadUrl =
    //     "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-windows.zip";
    // } else {
    downloadUrl ="https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-mac.zip";
    //}
  }

  const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && mkdir '${backendPath}'`;

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    // command = `tar -xf "${phZipPath}" -C "${backendPath}" &&\
    // del "${phZipPath}" &&\
    command = `cd '${backendPath}' &&\
    ".\\hats_shell.cmd" echo "Initialise" 
    `;
  } else {
    command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    cd '${backendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;
  }

  await execCommand(command);
};

const isLatestBackendVersion = async () => {
  try {
    // const { data } = await axiosInstance.get(releaseUrl);
    const data = await getBackendData();

    const latestVersion = data.tag_name;
    const engineVersion = getEngineVersion();

    console.log("Engine version installed: ", engineVersion);
    console.log("Latest version found: ", latestVersion);

    return engineVersion === latestVersion;
  } catch (e) {
    console.log(`Unable to check latest version, skipping\n${e.toString()}`);
    return true;
  }
};

const parseResponse = (response) => {
  // Remove HTML tags using regular expressions
  const removedHTMLTags = response.replace(/<[^>]*>/g, ''); 
  const data = JSON.parse(removedHTMLTags);
  return data;
}

const getBackendData = async () => {
  const browser = readUserDataFromFile().browser;
  const {context, browserChannel} = await createPlaywrightContext(browser, { width: 10, height: 10}); 
  const page = await context.newPage(); 
  await page.goto(releaseUrl); 

  const response = await page.content(); 
  const data = parseResponse(response);

  await page.close();
  await context.close();

  deleteClonedProfiles(browserChannel);
  return data;
}

const run = async (updaterEventEmitter) => {
  const processesToRun = [];

  const isInterruptedUpdate = fs.existsSync(updateBackupsFolder);
  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);

  if (isInterruptedUpdate) {
    updaterEventEmitter.emit("updating");
    if (!backendExists) {
      processesToRun.push(downloadBackend, unzipBackendAndCleanUp);
    } else if (phZipExists) {
      processesToRun.push(unzipBackendAndCleanUp);
    } else {
      processesToRun.push(
        cleanUpBackend,
        downloadBackend,
        unzipBackendAndCleanUp
      );
    }
  } else {
    if (!backendExists) {
      updaterEventEmitter.emit("settingUp");
      processesToRun.push(downloadBackend, unzipBackendAndCleanUp);
    } else if (phZipExists) {
      updaterEventEmitter.emit("settingUp");
      processesToRun.push(unzipBackendAndCleanUp);
    } else  {
      if (os.platform() === "win32"){
        return
      }     

      updaterEventEmitter.emit("checking");
      let isUpdateAvailable;
      isUpdateAvailable = !(await isLatestBackendVersion());
      // if fetching of latest backend version from github api fails for any reason,
      // isUpdateAvailable will be set to false so that the app will just launch straightaway
      if (isUpdateAvailable) {
        const userResponse = new Promise((resolve) => {
          updaterEventEmitter.emit("promptUpdate", resolve);
        });

        const proceedUpdate = await userResponse;

        if (proceedUpdate) {
          updaterEventEmitter.emit("updating");
          processesToRun.push(
            backUpData,
            cleanUpBackend,
            downloadBackend,
            unzipBackendAndCleanUp
          );
        }
      }
    }
  }

  for (const proc of processesToRun) {
    await proc();
  }
};

module.exports = {
  killChildProcess,
  run,
};