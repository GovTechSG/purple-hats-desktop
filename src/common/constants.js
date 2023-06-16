import boxRightArrow from "../assets/box-right-arrow.png";

export const scanTypes = {
  "Website crawl": "website",
  "Sitemap crawl": "sitemap",
  "Custom flow": "custom",
};

export const viewportTypes = [
  "Desktop",
  "Mobile",
  "Specific device...",
  "Custom width...",
];

// key is what will be displayed on the GUI, value is the internal value that Playwright recognises
export const devices = {
  "Blackberry PlayBook": "Blackberry PlayBook",
  "BlackBerry Z30": "BlackBerry Z30",
  "Samsung Galaxy Note 3": "Galaxy Note 3",
  "Samsung Galaxy Note II": "Galaxy Note II",
  "Samsung Galaxy S III": "Galaxy S III",
  "Samsung Galaxy S5": "Galaxy S5",
  "Samsung Galaxy S8": "Galaxy S8",
  "Samsung Galaxy S9+": "Galaxy S9+",
  "Samsung Galaxy Tab S4": "Galaxy Tab S4",
  "iPad (gen 6)": "iPad (gen 6)",
  "iPad (gen 7)": "iPad (gen 7)",
  "iPad Mini": "iPad Mini",
  "iPad Pro 11": "iPad Pro 11",
  "iPhone 6": "iPhone 6",
  "iPhone 6 Plus": "iPhone 6 Plus",
  "iPhone 7": "iPhone 7",
  "iPhone 7 Plus": "iPhone 7 Plus",
  "iPhone 8": "iPhone 8",
  "iPhone 8 Plus": "iPhone 8 Plus",
  "iPhone SE": "iPhone SE",
  "iPhone X": "iPhone X",
  "iPhone XR": "iPhone XR",
  "iPhone 11": "iPhone 11",
  "iPhone 11 Pro": "iPhone 11 Pro",
  "iPhone 11 Pro Max": "iPhone 11 Pro Max",
  "iPhone 12": "iPhone 12",
  "iPhone 12 Pro": "iPhone 12 Pro",
  "iPhone 12 Pro Max": "iPhone 12 Pro Max",
  "iPhone 12 Mini": "iPhone 12 Mini",
  "iPhone 13": "iPhone 13",
  "iPhone 13 Pro": "iPhone 13 Pro",
  "iPhone 13 Pro Max": "iPhone 13 Pro Max",
  "iPhone 13 Mini": "iPhone 13 Mini",
  "Kindle Fire HDX": "Kindle Fire HDX",
  "LG Optimus L70": "LG Optimus L70",
  "Microsoft Lumia 550": "Microsoft Lumia 550",
  "Microsoft Lumia 950": "Microsoft Lumia 950",
  "Google Nexus 4": "Nexus 4",
  "Google Nexus 5": "Nexus 5",
  "Google Nexus 5X": "Nexus 5X",
  "Google Nexus 6": "Nexus 6",
  "Google Nexus 6P": "Nexus 6P",
  "Google Nexus 7": "Nexus 7",
  "Google Nexus 10": "Nexus 10",
  "Nokia Lumia 520": "Nokia Lumia 520",
  "Nokia N9": "Nokia N9",
  "Google Pixel 2": "Pixel 2",
  "Google Pixel 2 XL": "Pixel 2 XL",
  "Google Pixel 3": "Pixel 3",
  "Google Pixel 4": "Pixel 4",
  "Google Pixel 4a (5G)": "Pixel 4a (5G)",
  "Google Pixel 5": "Pixel 5",
  "Motorola Moto G4": "Moto G4",
};

// exit codes returned by Purple HATS cli when there is an error with the URL provided
export const cliErrorCodes = new Set([11, 12, 13, 14, 15, 16, 21]);
export const cliErrorTypes = {
  invalidUrl: 11,
  cannotBeResolved: 12,
  errorStatusReceived: 13,
  systemError: 14,
  notASitemap: 15,
  unauthorisedBasicAuth: 16,
  profileDataCopyError: 21,
};

export const userDataFormDetails = {
  // production form
  // formUrl: "https://form.gov.sg/6453387735eb0c00128becdc",
  // dev form
  formUrl: "https://form.gov.sg/642c10f5d88e080012b6eb49",
  urlScannedField: "641d6f416e65530012b57e29",
  scanTypeField: "641d6fc6448fc900122f8684",
};

export const userDataFormInputFields = {
  formUrl:
    "https://docs.google.com/forms/d/1tg8WYKWOgAo-DRsKNczZQF7OFeT00kjpmL1DPlL_VoI/formResponse",
  websiteUrlField: "entry.1562345227",
  scanTypeField: "entry.1148680657",
  emailField: "entry.52161304",
  nameField: "entry.1787318910",
};

export const policyUrlElem = (
  <a
    role="link"
    className="link"
    href="#"
    onClick={(e) => {handleClickLink(e, "https://www.tech.gov.sg/privacy/")}}
  >
    GovTech's Privacy Policy
    <img id="box-arrow-right" src={boxRightArrow}></img>
  </a>
);

const handleClickLink = (e, url) => {
  e.preventDefault();
  window.services.openLink(url);
}
