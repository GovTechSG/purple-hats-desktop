import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import a11yLogo from "../../assets/a11y-logo.svg";
import appIllustration from "../../assets/app-illustration.svg";
import editIcon from "../../assets/edit-icon.png";
import InitScanForm from "./InitScanForm";
import "./HomePage.scss";
import services from "../../services";
import { cliErrorCodes, cliErrorTypes } from "../../common/constants";
import Modal from "../../common/components/Modal";
import { BasicAuthForm, BasicAuthFormFooter } from "./BasicAuthForm";
import EditUserDetailsModal from "./EditUserDetailsModal";

const HomePage = ({ appVersion, setCompletedScanId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUrlErrorMessage, setPrevUrlErrorMessage] = useState(
    location.state
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [browser, setBrowser] = useState(null);
  const [showBasicAuthModal, setShowBasicAuthModal] = useState(false);
  const [showEditDataModal, setShowEditDataModal] = useState(false);

  useEffect(() => {
    if (
      prevUrlErrorMessage !== null &&
      prevUrlErrorMessage.includes("Unauthorised Basic Authentication")
    ) {
      setShowBasicAuthModal(true);
    }
  }, [prevUrlErrorMessage]);

  useEffect(() => {
    const getUserData = async () => {
      const userData = await services.getUserData();
      setBrowser(userData["browser"]);
      const isEvent = userData["event"];
      if (!isEvent) {
        setEmail(userData["email"]);
        setName(userData["name"]);
        setAutoSubmit(userData["autoSubmit"]);
      }
    };

    getUserData();
  });

  const isValidHttpUrl = (input) => {
    const regexForUrl = new RegExp("^(http|https):/{2}.+$", "gmi");
    return regexForUrl.test(input);
  };

  const startScan = async (scanDetails) => {
    scanDetails.browser = browser;

    if (scanDetails.scanUrl.length === 0) {
      setPrevUrlErrorMessage("URL cannot be empty.");
      return;
    }
    if (!isValidHttpUrl(scanDetails.scanUrl)) {
      setPrevUrlErrorMessage("Invalid URL.");
      return;
    }
    if (!navigator.onLine) {
      setPrevUrlErrorMessage("No internet connection.");
      return;
    }

    window.localStorage.setItem("scanDetails", JSON.stringify(scanDetails));

    navigate("/scanning");
    const response = await services.startScan(scanDetails);
    console.log(response.success);

    if (response.success) {
      setCompletedScanId(response.scanId);
      navigate("/result");
      return;
    }

    if (cliErrorCodes.has(response.statusCode)) {
      let errorMessageToShow;
      switch (response.statusCode) {
        /* technically urlErrorTypes.invalidUrl is not needed since this case
        was handled above, but just for completeness */
        case cliErrorTypes.unauthorisedBasicAuth:
          errorMessageToShow = "Unauthorised Basic Authentication.";
          break;
        case cliErrorTypes.invalidUrl:
        case cliErrorTypes.cannotBeResolved:
        case cliErrorTypes.errorStatusReceived:
          errorMessageToShow = "Invalid URL.";
          break;
        case cliErrorTypes.notASitemap:
          errorMessageToShow = "Invalid sitemap.";
          break;
        case cliErrorTypes.profileDataCopyError:
          errorMessageToShow =
            "Error cloning browser profile data. Try closing your opened browser(s) before the next scan.";
          break;
        case cliErrorTypes.systemError:
        default:
          errorMessageToShow = "Something went wrong. Please try again later.";
      }
      console.log(`status error: ${response.statusCode}`);
      navigate("/", { state: errorMessageToShow });
      return;
    }
    /* When no pages were scanned (e.g. out of domain upon redirects when valid URL was entered),
    redirects user to error page to going to result page with empty result
    */
    navigate("/error");
    return;
  };

  const areUserDetailsSet = name != "" && email != "";

  const handleBasicAuthSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const scanDetails = JSON.parse(window.localStorage.getItem("scanDetails"));
    const splitUrl = scanDetails.scanUrl.split("://");
    scanDetails.scanUrl = `${splitUrl[0]}://${username}:${password}@${splitUrl[1]}`;
    startScan(scanDetails);
    setShowBasicAuthModal(false);
    return;
  };

  return (
    <div id="home-page">
      <div id="home-page-main">
        {autoSubmit && (
          <div>
            <button
              id="edit-user-details"
              onClick={() => setShowEditDataModal(true)}
            >
              Welcome <b>{name}</b> &nbsp;
              <img src={editIcon}></img>
            </button>
          </div>
        )}
        <img
          id="a11y-logo"
          src={a11yLogo}
          alt="Logo of the GovTech Accessibility Enabling Team"
        />
        <h1 id="app-title">Accessibility Site Scanner</h1>
        <InitScanForm
          startScan={startScan}
          prevUrlErrorMessage={prevUrlErrorMessage}
        />
      </div>
      <Modal
        id="basic-auth-modal"
        showHeader={true}
        showModal={showBasicAuthModal}
        setShowModal={setShowBasicAuthModal}
        modalTitle={"Basic Authentication Required"}
        modalBody={
          <>
            <BasicAuthForm handleBasicAuthSubmit={handleBasicAuthSubmit} />
            <p>
              The site you are trying to scan requires basic authentication.
              Please enter your credentials. Purple-HATS will not collect the
              information and only use it for this scan instance.
            </p>
          </>
        }
        modalFooter={
          <BasicAuthFormFooter setShowBasicAuthModal={setShowBasicAuthModal} />
        }
      />
      {areUserDetailsSet && (
        <>
          <EditUserDetailsModal
            formID={"edit-details-form"}
            showModal={showEditDataModal}
            setShowEditDataModal={setShowEditDataModal}
            initialName={name}
            initialEmail={email}
          />
        </>
      )}
      <div id="home-page-footer">
        <img
          id="app-illustration"
          src={appIllustration}
          alt="Illustration showing people with sight, hearing, motor and cognitive disabilities"
        />
        <span id="footer-text">
          Version {appVersion} | Built by GovTech Accessibility Enabling Team
        </span>
      </div>
    </div>
  );
};

export default HomePage;
