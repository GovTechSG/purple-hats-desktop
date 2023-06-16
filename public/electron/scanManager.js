const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { fork, spawnSync, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const { randomUUID } = require("crypto");
const {
  enginePath,
  getPathVariable,
  customFlowGeneratedScriptsPath,
  playwrightBrowsersPath,
  resultsPath,
} = require("./constants");
const {
  browserTypes,
  getDefaultChromeDataDir,
  getDefaultEdgeDataDir,
} = require("./constants");
const { env } = require("process");
const scanHistory = {};

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const getScanOptions = (details) => {
  const {
    scanType,
    url,
    customDevice,
    viewportWidth,
    maxPages,
    headlessMode,
    browser,
  } = details;
  const options = ["-c", scanType, "-u", url];

  if (customDevice) {
    options.push("-d", customDevice);
  }

  if (viewportWidth) {
    options.push("-w", viewportWidth);
  }

  if (maxPages) {
    options.push("-p", maxPages);
  }

  if (!headlessMode) {
    options.push("-h", "no");
  }

  if (browser) {
    options.push("-b", browser);
  }

  return options;
};

const startScan = async (scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  let useChromium = false;
  if (
    scanDetails.browser === browserTypes.chromium ||
    (!getDefaultChromeDataDir() && !getDefaultEdgeDataDir())
  ) {
    useChromium = true;
  }

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(enginePath, "cli.js"),
      getScanOptions(scanDetails),
      {
        silent: true,
        cwd: resultsPath,
        env: {
          ...process.env,
          RUNNING_FROM_PH_GUI: true,
          ...(useChromium && {
            PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
          }),
          PATH: getPathVariable(),
        },
      }
    );

    currentChildProcess = scan;

    scan.on("exit", (code) => {
      const stdout = scan.stdout.read().toString().trim();
      if (code === 0) {
        // Output from combine.js which prints the string "No pages were scanned" if crawled URL <= 0
        if (stdout.includes("No pages were scanned")) {
          resolve({ success: false });
        }

        const resultsPath = stdout
          .split("Results directory is at ")[1]
          .split(" ")[0];
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        resolve({ success: true, scanId });
      } else if (code === 2) {
        resolve({
          success: false,
          message: "An error has occurred when running the custom flow scan.",
        });
      } else {
        resolve({ success: false, statusCode: code, message: stdout });
      }
      currentChildProcess = null;

      if (fs.existsSync(customFlowGeneratedScriptsPath)) {
        fs.rm(customFlowGeneratedScriptsPath, { recursive: true }, (err) => {
          if (err) {
            console.error(
              `Error while deleting ${customFlowGeneratedScriptsPath}.`
            );
          }
        });
      }
    });
  });

  return response;
};

const getReportPath = (scanId) => {
  if (scanHistory[scanId]) {
    return path.join(
      resultsPath,
      scanHistory[scanId],
      "reports",
      "report.html"
    );
  }
  return null;
};

const getResultsZip = (scanId, includeScreenshots=false) => {
  if (!scanHistory[scanId]) return "";

  const scanResPath = path.join(resultsPath, scanHistory[scanId]);
  const reportsPath = path.join(scanResPath, "reports");
  const downloadResultsZipPath = path.join(os.tmpdir(), `${scanId}.zip`);

  if (os.platform() === 'win32') {
    if (includeScreenshots) {
      spawnSync('Compress-Archive', ['-Path', `'${reportsPath}\\report.html', '${reportsPath}\\passed_items.json', '${scanResPath}\\screenshots'`, '-DestinationPath', `'${downloadResultsZipPath}'`], {shell: 'powershell.exe'})
    } else {
      spawnSync('Compress-Archive', ['-Path', `'${reportsPath}\\report.html', '${reportsPath}\\passed_items.json'`, '-DestinationPath', `'${downloadResultsZipPath}'`], {shell: 'powershell.exe'})
    }
  } else {
    if (includeScreenshots) {
      spawnSync('zip', [`${reportsPath}/report.html`, `${reportsPath}/passed_items.json`, `${scanResPath}/screenshots/*`, '-j']);
    } else {
      spawnSync('zip', [`${reportsPath}/report.html`, `${reportsPath}/passed_items.json`, '-j']);
    }
  }

  const reportZip = fs.readFileSync(downloadResultsZipPath);
  fs.rmSync(downloadResultsZipPath);
  return reportZip;
};

function createReportWindow(contextWindow, reportPath) {
  let reportWindow = new BrowserWindow({
    parent: contextWindow,
  });
  reportWindow.maximize();
  reportWindow.loadFile(reportPath);
  reportWindow.on("close", () => reportWindow.destroy());
}

const init = (contextWindow) => {
  ipcMain.handle("startScan", async (_event, scanDetails) => {
    return await startScan(scanDetails);
  });

  ipcMain.on("openReport", (_event, scanId) => {
    const reportPath = getReportPath(scanId);
    if (!reportPath) return;
    createReportWindow(contextWindow, reportPath);
  });

  ipcMain.handle("downloadResults", (_event, scanId, includeScreenshots) => {
    return getResultsZip(scanId, includeScreenshots);
  });
};

module.exports = {
  init,
  killChildProcess,
};
