const {
  createPlaywrightContext, 
  userDataFormFields,
  deleteClonedProfiles,
} = require("./constants");
const { ipcMain, BrowserView } = require("electron");


const init = () => {
  ipcMain.on("submitFormViaBrowser", async (_event, formDetails) => {

    const { context, browserChannel } = await createPlaywrightContext(formDetails.browser, { width: 10, height: 10})

    const finalUrl = 
    `${formDetails.formUrl}?` 
    + `${userDataFormFields.websiteUrlField}=${formDetails.websiteUrl}&`  
    + `${userDataFormFields.scanTypeField}=${formDetails.scanType}&`
    + `${userDataFormFields.emailField}=${formDetails.email}&`
    + `${userDataFormFields.nameField}=${formDetails.name}`;

    const page = await context.newPage();
    await page.goto(finalUrl);

    await page.close();
    await context.close();

   deleteClonedProfiles(browserChannel);
  });
};

module.exports = {
  init
};