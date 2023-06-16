import { useState, useRef } from "react";
import Button from "../../common/components/Button";
import AdvancedScanOptions from "./AdvancedScanOptions";
import { scanTypes, viewportTypes, devices } from "../../common/constants";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";

const InitScanForm = ({ startScan, prevUrlErrorMessage }) => {
  const [openPageLimitAdjuster, setOpenPageLimitAdjuster] = useState(false);
  const pageLimitAdjuster = useRef();

  const [scanUrl, setScanUrl] = useState("https://");
  const [pageLimit, setPageLimit] = useState("100");

  const scanTypeOptions = Object.keys(scanTypes);
  const viewportOptions = viewportTypes;
  const deviceOptions = Object.keys(devices);

  const [advancedOptions, setAdvancedOptions] = useState({
    scanType: scanTypeOptions[0],
    viewport: viewportOptions[0],
    device: deviceOptions[0],
    viewportWidth: "320",
    scanInBackground: false,
  });

  const togglePageLimitAdjuster = () => {
    if (!openPageLimitAdjuster) {
      setOpenPageLimitAdjuster(true);
    } else {
      pageLimitAdjuster.current.style.animationName = "fade-out";
      setTimeout(() => setOpenPageLimitAdjuster(false), 200);
    }
  };

  const handleScanButtonClicked = () => {
    startScan({ scanUrl: scanUrl.trim(), pageLimit, ...advancedOptions });
  };

  // styles are in HomePage.scss
  return (
    <div id="init-scan-form">
      <label htmlFor="url-input" id="url-bar-label">
        Enter your URL to get started
      </label>
      <div id="url-bar-group">
        <div id="url-bar">
          <input
            id="url-input"
            type="text"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
          />
          {advancedOptions.scanType !== scanTypeOptions[2] && (
            <div>
              <Button
                type="transparent"
                id="page-limit-toggle-button"
                onClick={togglePageLimitAdjuster}
              >
                capped at{" "}
                <span className="purple-text">
                  {pageLimit} pages{" "}
                  {openPageLimitAdjuster ? (
                    <ButtonSvgIcon
                      className={`chevron-up-icon`}
                      svgIcon={<ChevronUpIcon />}
                    />
                  ) : (
                    // <i className="bi bi-chevron-up" />
                    <ButtonSvgIcon
                      className={`chevron-down-icon`}
                      svgIcon={<ChevronDownIcon />}
                    />
                    // <i className="bi bi-chevron-down" />
                  )}
                </span>
              </Button>
              {openPageLimitAdjuster && (
                <div id="page-limit-adjuster" ref={pageLimitAdjuster}>
                  <input
                    type="number"
                    id="page-limit-input"
                    step="10"
                    min="1"
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                    onBlur={(e) => {
                      if (Number(e.target.value) <= 0) {
                        setPageLimit(1);
                      }
                    }}
                  />
                  <label htmlFor="page-limit-input">pages</label>
                </div>
              )}
            </div>
          )}
          <Button type="primary" onClick={handleScanButtonClicked}>
            Scan
          </Button>
        </div>
        {prevUrlErrorMessage && (
          <span id="url-error-message" className="error-text">
            {prevUrlErrorMessage}
          </span>
        )}
      </div>
      <AdvancedScanOptions
        scanTypeOptions={scanTypeOptions}
        viewportOptions={viewportOptions}
        deviceOptions={deviceOptions}
        advancedOptions={advancedOptions}
        setAdvancedOptions={setAdvancedOptions}
      />
    </div>
  );
};

export default InitScanForm;
