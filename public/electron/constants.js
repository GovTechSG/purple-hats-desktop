const path = require("path");
const os = require("os");
const fs = require("fs");
const { globSync } = require("glob");
const { get } = require("http");

const appPath =
  os.platform() === "win32"
    ? path.join(process.env.PROGRAMFILES, "Purple HATS Desktop")
    : path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Purple HATS"
      );

const releaseUrl =
  "https://api.github.com/repos/GovTechSG/purple-hats/releases/latest";

const resultsPath =
  os.platform() === "win32"
    ? path.join(process.env.APPDATA, "Purple HATS")
    : appPath;

const backendPath = path.join(appPath, "Purple HATS Backend");

const enginePath = path.join(backendPath, "purple-hats");

const getEngineVersion = () =>
  require(path.join(enginePath, "package.json")).version;

const appVersion = require(path.join(
  __dirname,
  "..",
  "..",
  "package.json"
)).version;

const preloadPath = path.join(__dirname, "preload.js");

const userDataFormPreloadPath = path.join(__dirname, "userDataFormPreload.js");

const indexPath = path.join(__dirname, "..", "..", "build", "index.html");

const playwrightBrowsersPath = path.join(backendPath, "ms-playwright");

const getPathVariable = () => {
  if (os.platform() === "win32") {
    const directories = [
      "nodejs-win",
      "purple-hats\\node_modules\\.bin",
      "ImageMagick\\bin",
    ];
    return `${directories.map((d) => path.join(backendPath, d)).join(";")};${
      process.env.PATH
    }`;
  } else {
    const directories = [
      `${os.arch() === "arm64" ? "nodejs-mac-arm64" : "nodejs-mac-x64"}/bin`,
      "purple-hats/node_modules/.bin",
    ];
    return `${process.env.PATH}:${directories
      .map((d) => path.join(backendPath, d))
      .join(":")}`;
  }
};

const scanResultsPath = path.join(resultsPath, "results");

const customFlowGeneratedScriptsPath = path.join(
  resultsPath,
  "custom_flow_scripts"
);

const updateBackupsFolder = path.join(
  appPath,
  "30789f0f-73f5-43bc-93a6-e499e4a20f7a"
);

const userDataFilePath =
  os.platform() === "win32"
    ? path.join(resultsPath, "userData.txt")
    : path.join(appPath, "userData.txt");

const phZipPath = path.join(appPath, "PHLatest.zip");

const browserTypes = {
  chrome: "chrome",
  edge: "msedge",
  chromium: "chromium",
};

const getDefaultChromeDataDir = () => {
  try {
    let defaultChromeDataDir = null;
    if (os.platform() === "win32") {
      defaultChromeDataDir = path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data"
      );
    } else if (os.platform() === "darwin") {
      defaultChromeDataDir = path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
    }
    if (defaultChromeDataDir && fs.existsSync(defaultChromeDataDir)) {
      return defaultChromeDataDir;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error in getDefaultChromeDataDir(): ${error}`);
  }
};

const getDefaultEdgeDataDir = () => {
  try {
    let defaultEdgeDataDir = null;
    if (os.platform() === "win32") {
      defaultEdgeDataDir = path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Microsoft",
        "Edge",
        "User Data"
      );
    } else if (os.platform() === "darwin") {
      defaultEdgeDataDir = path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Microsoft Edge"
      );
    }

    if (defaultEdgeDataDir && fs.existsSync(defaultEdgeDataDir)) {
      return defaultEdgeDataDir;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error in getDefaultEdgeDataDir(): ${error}`);
  }
};

const cloneChromeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  if (os.platform() === "win32") {
    profileCookiesDir = globSync("**/Network/Cookies", {
      ...options,
      ignore: ["Purple-HATS/**"],
    });
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === "darwin") {
    // maxDepth 2 to avoid copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync("**/Cookies", {
      ...options,
      ignore: "Purple-HATS/**",
    });
    profileNamesRegex = /Chrome\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map((dir) => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === "win32") {
          destProfileDir = path.join(destProfileDir, "Network");
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, "Cookies"))) {
          fs.copyFileSync(dir, path.join(destProfileDir, "Cookies"));
        }
      }
    });
  } else {
    console.error("Unable to find Chrome profile cookies file in the system.");
    return;
  }
};

const cloneEdgeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  // Ignores the cloned Purple-HATS directory if exists
  if (os.platform() === "win32") {
    profileCookiesDir = globSync("**/Network/Cookies", {
      ...options,
      ignore: "Purple-HATS/**",
    });
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === "darwin") {
    // Ignores copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync("**/Cookies", {
      ...options,
      ignore: "Purple-HATS/**",
    });
    profileNamesRegex = /Microsoft Edge\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map((dir) => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === "win32") {
          destProfileDir = path.join(destProfileDir, "Network");
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, "Cookies"))) {
          fs.copyFileSync(dir, path.join(destProfileDir, "Cookies"));
        }
      }
    });
  } else {
    console.error("Unable to find Edge profile cookies file in the system.");
    return;
  }
};

const cloneLocalStateFile = (options, destDir) => {
  const localState = globSync("**/*Local State", {
    ...options,
    maxDepth: 1,
  });

  if (localState.length > 0) {
    localState.map((dir) => {
      fs.copyFileSync(dir, path.join(destDir, "Local State"));
    });
  } else {
    console.error("Unable to find local state file in the system.");
    return;
  }
};

const cloneChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error("Unable to find Chrome data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneChromeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, "Purple-HATS");
};

const cloneEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error("Unable to find Edge data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneEdgeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, "Purple-HATS");
};

const deleteClonedChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error("Unable to find Chrome data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error(
      "Unable to find Purple-HATS directory in the Chrome data directory."
    );
    return;
  }
};

const deleteClonedEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error("Unable to find Edge data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error(
      "Unable to find Purple-HATS directory in the Edge data directory."
    );
    return;
  }
};

const deleteClonedProfiles = (browserChannel) => {
  if (browserChannel == browserTypes.chrome) {
    deleteClonedChromeProfiles();
  } else if (browserChannel == browserTypes.edge) {
    deleteClonedEdgeProfiles();
  }
};

const createPlaywrightContext = async (browser, screenSize) => {
  const playwrightPath = path.join(
    backendPath,
    "purple-hats",
    "node_modules",
    "playwright",
    "index.js"
  );
  const playwright = require(playwrightPath);
  const chromium = playwright.chromium;

  const chromeDataDir = getDefaultChromeDataDir();
  const edgeDataDir = getDefaultEdgeDataDir();

  let browserChannel;
  let userDataDir;

  if (browser == browserTypes.chrome && chromeDataDir) {
    browserChannel = browserTypes.chrome;
    userDataDir = cloneChromeProfiles();
  } else if (browser == browserTypes.edge && edgeDataDir) {
    browserChannel = browserTypes.edge;
    userDataDir = cloneEdgeProfiles();
  } else {
    hasUserProfile = false;
    browserChannel = null;
    userDataDir = "";
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    ignoreDefaultArgs: ["--use-mock-keychain"],
    ...(browserChannel && { channel: browserChannel }),
    headless: false,
    viewport: {
      width: screenSize.width,
      height: screenSize.height,
    },
    args: ["--window-size=10,10"],
  });

  return { context, browserChannel };
};

const userDataFormFields = {
  formUrl:
    "https://docs.google.com/forms/d/1tg8WYKWOgAo-DRsKNczZQF7OFeT00kjpmL1DPlL_VoI/formResponse",
  websiteUrlField: "entry.1562345227",
  scanTypeField: "entry.1148680657",
  emailField: "entry.52161304",
  nameField: "entry.1787318910",
};

module.exports = {
  appPath,
  releaseUrl,
  backendPath,
  enginePath,
  getEngineVersion,
  appVersion,
  preloadPath,
  userDataFormPreloadPath,
  indexPath,
  playwrightBrowsersPath,
  getPathVariable,
  scanResultsPath,
  customFlowGeneratedScriptsPath,
  updateBackupsFolder,
  phZipPath,
  resultsPath,
  userDataFilePath,
  userDataFormFields,
  browserTypes,
  getDefaultChromeDataDir,
  getDefaultEdgeDataDir,
  deleteClonedProfiles,
  createPlaywrightContext,
};
