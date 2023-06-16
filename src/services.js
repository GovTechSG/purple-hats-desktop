/* This file provides methods that interfaces between the API functions exposed by the electron main process
and the renderer. The APIs are provided via the window.services object, as defined in ./public/preload.js
*/

import {
  scanTypes,
  // userDataFormDetails,
  viewportTypes,
  devices,
} from "./common/constants";

// for use in openUserDataForm
let currentScanUrl;
let currentScanType;

const startScan = async (scanDetails) => {
  const {
    scanType: selectedScanType,
    scanUrl,
    pageLimit,
    viewport,
    device,
    viewportWidth,
    scanInBackground,
    browser,
  } = scanDetails;

  currentScanUrl = scanUrl;
  currentScanType = selectedScanType;

  const scanArgs = {
    scanType: scanTypes[selectedScanType],
    url: scanUrl,
    headlessMode: scanInBackground,
    browser: browser,
  };

  if (selectedScanType !== Object.keys(scanTypes)[2]) {
    scanArgs.maxPages = pageLimit;
  }

  if (viewport === viewportTypes[1]) {
    scanArgs.customDevice = "Mobile";
  }
  
  if (viewport === viewportTypes[2]) {
    scanArgs.customDevice = devices[device];
  }

  if (viewport === viewportTypes[3]) {
    scanArgs.viewportWidth = viewportWidth;
  }

  const response = await window.services.startScan(scanArgs);
  return response;
};

const openReport = (scanId) => {
  window.services.openReport(scanId);
};

const downloadResults = async (scanId, includeScreenshots) => {
  const reportZip = await window.services.downloadResults(scanId, includeScreenshots);
  return reportZip;
};

const getUserData = async () => {
  const userData = await window.services.getUserData();
  return userData;
};

const getDataForForm = async () => {
  const userData = await getUserData();
  const email = userData["email"];
  const name = userData["name"];
  const autoSubmit = userData["autoSubmit"];
  const event = userData["event"];
  const browser = userData["browser"];
  return {
    websiteUrl: currentScanUrl,
    scanType: currentScanType,
    email: email,
    name: name,
    autoSubmit: autoSubmit,
    event: event,
    browser: browser,
  };
};

const isValidEmail = (email) => {
  let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
  return regex.test(email);
};

const services = {
  startScan,
  openReport,
  downloadResults,
  getUserData,
  getDataForForm,
  isValidEmail,
};

export default services;
