import { useState, useRef } from "react";
import Button from "../../common/components/Button";
import SelectField from "./SelectField";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";

const AdvancedScanOptions = ({
  scanTypeOptions,
  viewportOptions,
  deviceOptions,
  advancedOptions,
  setAdvancedOptions,
}) => {
  const [openAdvancedOptionsMenu, setOpenAdvancedOptionsMenu] = useState(false);
  const [advancedOptionsDirty, setAdvancedOptionsDirty] = useState(false);
  const menu = useRef();

  const handleToggleMenu = () => {
    if (!openAdvancedOptionsMenu) {
      setOpenAdvancedOptionsMenu(true);
    } else {
      menu.current.style.animationName = "fade-out";
      setTimeout(() => setOpenAdvancedOptionsMenu(false), 200);
    }
  };

  /*
  by default, new value of the selected option will be set to event.target.value
  if the new value should be something else, provide a function to overrideVal that returns
  the intended value. Function should be in the format (event) => {...; return valueToBeReturned;}
  */
  const handleSetAdvancedOption =
    (option, overrideVal = null) =>
    (event) => {
      let val;
      if (overrideVal) {
        val = overrideVal(event);
      } else {
        val = event.target.value;
      }

      const newOptions = { ...advancedOptions };
      newOptions[option] = val;
      setAdvancedOptions(newOptions);

      if (
        newOptions.scanType === scanTypeOptions[0] &&
        newOptions.viewport === viewportOptions[0]
      ) {
        setAdvancedOptionsDirty(false);
      } else {
        setAdvancedOptionsDirty(true);
      }
    };

  return (
    <div>
      <div id="advanced-options-toggle-button">
        <Button
          type="transparent"
          className={"purple-text" + (advancedOptionsDirty ? " bold-text" : "")}
          onClick={handleToggleMenu}
        >
          Advanced scan options{" "}
          {openAdvancedOptionsMenu ? (
            <ButtonSvgIcon
              className={`chevron-up-icon`}
              svgIcon={<ChevronUpIcon />}
            />
          ) : (
            <ButtonSvgIcon
              className={`chevron-down-icon`}
              svgIcon={<ChevronDownIcon />}
            />
          )}
        </Button>
      </div>
      {openAdvancedOptionsMenu && (
        <div id="advanced-options-menu" ref={menu}>
          <SelectField
            id="scan-type-dropdown"
            label="Scan Type:"
            initialValue={advancedOptions.scanType}
            options={scanTypeOptions}
            onChange={handleSetAdvancedOption("scanType")}
          />
          <SelectField
            id="viewport-type-dropdown"
            label="Viewport:"
            initialValue={advancedOptions.viewport}
            options={viewportOptions}
            onChange={handleSetAdvancedOption("viewport")}
          />
          {advancedOptions.viewport === viewportOptions[2] && (
            <SelectField
              id="specific-device-dropdown"
              label="Device:"
              initialValue={advancedOptions.device}
              options={deviceOptions}
              onChange={handleSetAdvancedOption("device")}
            />
          )}
          {advancedOptions.viewport === viewportOptions[3] && (
            <div className="user-input-group">
              <label htmlFor="viewport-width-input" className="bold-text">
                Width (px)
              </label>
              <input
                type="number"
                id="viewport-width-input"
                className="input-field"
                step="10"
                min="320"
                max="1080"
                required
                onChange={handleSetAdvancedOption("viewportWidth")}
                onBlur={handleSetAdvancedOption("viewportWidth", (e) => {
                  if (Number(e.target.value) < 320) {
                    return 320;
                  }
                  if (Number(e.target.value) > 1080) {
                    return 1080;
                  }
                  return e.target.value;
                })}
                value={advancedOptions.viewportWidth}
              />
            </div>
          )}
          <hr />
          <div id="scan-in-background-toggle-group">
            <input
              type="checkbox"
              id="scan-in-background-toggle"
              checked={advancedOptions.scanInBackground}
              onChange={handleSetAdvancedOption(
                "scanInBackground",
                (e) => e.target.checked
              )}
            />
            <label htmlFor="scan-in-background-toggle">
              Scan in background
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedScanOptions;
