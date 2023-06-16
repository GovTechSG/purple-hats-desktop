import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import { userDataFormInputFields } from "../../common/constants";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as CheckCircleIcon } from "../../assets/check-circle.svg";
import { ReactComponent as BoxArrowUpRightIcon } from "../../assets/box-arrow-up-right.svg";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";
import { ReactComponent as ReturnIcon } from "../../assets/return.svg";


const ResultPage = ({ completedScanId: scanId }) => {
  const [enableReportDownload, setEnableReportDownload] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [browser, setBrowser] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [event, setEvent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  
  // used for custom flow scans
  const [includeCustomFlowScreenshots, setIncludeCustomFlowScreenshots] = useState(false);

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setWebsiteUrl(data["websiteUrl"]);
      setScanType(data["scanType"]);
      setBrowser(data["browser"]);
      let isAutoSubmit = data["autoSubmit"];
      let isEvent = data["event"];

      if (isAutoSubmit && !isEvent) {
        setEmail(data["email"]);
        setName(data["name"]);
      } else {
        if (!isEvent) {
          setEnableReportDownload(true);
        }
      }

      setEvent(data["event"]);
      setAutoSubmit(data["autoSubmit"]);
    };

    getDataForForm();
  }, []);

  useEffect(() => {
    const submitForm = async () => {
      const formUrl = userDataFormInputFields.formUrl;

      try {
        await submitFormViaBrowser(formUrl);

        // axios
        // // Collect form data
        // const formData = new FormData();
        // formData.append(userDataFormInputFields.websiteUrlField, websiteUrl);
        // formData.append(userDataFormInputFields.scanTypeField, scanType);
        // formData.append(userDataFormInputFields.emailField, email);
        // formData.append(userDataFormInputFields.nameField, name);

        // // Send POST request to Google Form
        // await axios.post(formUrl, formData);

        // Form submission successful
        console.log("Form submitted successfully!");
      } catch (error) {
        // Handle error
        console.error("Form submission error:", error);
      }
    };
    if (autoSubmit) {
      submitForm();
      setEnableReportDownload(true);
    }
  }, [autoSubmit]);

  const handleDownloadResults = async () => {
    const data = await services.downloadResults(scanId, includeCustomFlowScreenshots);
    let blob = new Blob([data], { type: "application/zip" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "results.zip";
    link.click();
  };

  const handleViewReport = () => {
    services.openReport(scanId);
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    try {
      if (!services.isValidEmail(email)) {
        setErrorMessage("Please enter a valid email");
        return;
      }

      setEnableReportDownload(true);
      setEvent(false);
      const formUrl = userDataFormInputFields.formUrl;
      await submitFormViaBrowser(formUrl);

      // const formData = new FormData(event.target);
      // await axios.post(formUrl, formData);

      // Form submission successful
      console.log("Form submitted successfully!");
    } catch (error) {
      // Handle error
      console.error("Form submission error:", error);
      // Write to error log
    }
  };

  const submitFormViaBrowser = async (formUrl) => {
    const formDetails = {
      formUrl: formUrl,
      websiteUrl: websiteUrl,
      scanType: scanType,
      name: name,
      email: email,
      browser: browser,
    };
    await window.services.submitFormViaBrowser(formDetails);
  };

  return (
    <div id="result-page">
      <div id="main-container">
        <div id="main-contents">
          <ButtonSvgIcon
            className={`check-circle-icon`}
            svgIcon={<CheckCircleIcon />}
          />
          {/* <i className="bi bi-check-circle"></i> */}
          <h1>Scan completed</h1>
          {enableReportDownload && !event ? (
            <>
              <Button
                id="view-button"
                type="primary"
                className="bold-text"
                onClick={handleViewReport}
              >
                <ButtonSvgIcon
                  className={`box-arrow-up-right-icon`}
                  svgIcon={<BoxArrowUpRightIcon />}
                />
                {/* <i className="bi bi-box-arrow-up-right" /> */}
                View report
              </Button>
              <Button
                id="download-button"
                type="secondary"
                onClick={handleDownloadResults}
              >
                <ButtonSvgIcon
                  svgIcon={<DownloadIcon />}
                  className={`download-icon`}
                />
                {/* <i className="bi bi-download" /> */}
                Download results (.zip)
              </Button>
              { scanType === 'Custom flow' && <>
                <input
                type="checkbox"
                id="download-screenshots-checkbox"
                checked={includeCustomFlowScreenshots}
                onChange={() => setIncludeCustomFlowScreenshots(!includeCustomFlowScreenshots)}
              />
              <label htmlFor="download-screenshots-checkbox">
                Include screenshots of pages scanned
              </label>
              </> }
            </>
          ) : (
            <>
              <form
                id="form-container"
                className=""
                onSubmit={(e) => handleSubmitForm(e)}
              >
                <input
                  type="hidden"
                  id="form-website-url"
                  name={userDataFormInputFields.websiteUrlField}
                  value={websiteUrl}
                ></input>
                <input
                  type="hidden"
                  id="form-scan-type"
                  name={userDataFormInputFields.scanTypeField}
                  value={scanType}
                ></input>
                <label for="form-name">Name:</label>
                <input
                  type="text"
                  id="form-name"
                  name={userDataFormInputFields.nameField}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></input>
                <label for="form-email">Email:</label>
                <input
                  type="text"
                  id="form-email"
                  name={userDataFormInputFields.emailField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
                {errorMessage && <p className="error-text">{errorMessage}</p>}
                <Button type="submit">View Results</Button>
              </form>
            </>
          )}
          <hr />
          <Link id="scan-again" to="/">
            <ButtonSvgIcon svgIcon={<ReturnIcon/>} className={`return-icon`}/>
            Scan again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
