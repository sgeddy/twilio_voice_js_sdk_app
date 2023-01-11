const dotenv = require("dotenv");
const cfg = {};

if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: ".env" });
} else {
  dotenv.config({ path: ".env.example", silent: true });
}

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// Overall Account Info
cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;

// US1 Creds
cfg.authToken = process.env.TWILIO_AUTH_TOKEN;
cfg.twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
cfg.callerId = process.env.TWILIO_CALLER_ID;
cfg.apiKey = process.env.TWILIO_API_KEY;
cfg.apiSecret = process.env.TWILIO_API_SECRET;
cfg.notifySid = process.env.TWILIO_NOTIFICATION_SERVICE_SID;

// AU1 Creds
cfg.authTokenAU = process.env.AU1_AUTH_TOKEN;
cfg.twimlAppSidAU = process.env.AU1_TWIML_APP;
cfg.callerIdAU = process.env.AU1_CALLER_ID;
cfg.apiKeyAU = process.env.AU1_API_KEY;
cfg.apiSecretAU = process.env.AU1_API_SECRET;

// IE1 Creds
cfg.authTokenIE = process.env.IE1_AUTH_TOKEN;
cfg.twimlAppSidIE = process.env.IE1_TWIML_APP;
cfg.callerIdIE = process.env.IE1_CALLER_ID;
cfg.apiKeyIE = process.env.IE1_API_KEY;
cfg.apiSecretIE = process.env.IE1_API_SECRET;

// Export configuration object
module.exports = cfg;
