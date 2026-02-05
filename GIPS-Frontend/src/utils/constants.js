// config.js

const domain = window.location.hostname;

// UAT variables
const UAT_CONFIG = {
  REACT_APP_API_BASE_URL: "https://gips-uat.testenvironment.tech/api",
  REACT_APP_DB_URL: "https://db.gips-uat.testenvironment.tech",
  REACT_APP_BASE_URL: "https://gips-uat.testenvironment.tech",
  REACT_APP_EMAIL_URL: "https://gips-uat.testenvironment.tech/api"
};

// Production variables
const PROD_CONFIG = {
  REACT_APP_API_BASE_URL: "https://applications.gips.ac.bw/api",
  REACT_APP_DB_URL: "https://applications.gips.ac.bw/db",
  REACT_APP_BASE_URL: "https://applications.gips.ac.bw",
  REACT_APP_EMAIL_URL: "https://applications.gips.ac.bw/api"

};

// Determine which config to export based on the hostname
const CONFIG = domain.includes("localhost") || domain.includes("uat") ? UAT_CONFIG  : PROD_CONFIG ;

export const {
  REACT_APP_API_BASE_URL,
  REACT_APP_DB_URL,
  REACT_APP_BASE_URL,
  REACT_APP_EMAIL_URL,
} = CONFIG;

export default CONFIG;
