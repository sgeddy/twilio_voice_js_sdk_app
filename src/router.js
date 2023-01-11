const Router = require("express").Router;
const { inbound, codeCheck, registerBind, sendNotification, test, recordStatus, startStream, stopStream, convert_status, addParticipant, tokenGenerator, voiceResponse, feedback, status, dialStatus, handleDialCallStatus, convert, record, conferenceStatus} = require("./handler");
const router = new Router();


// Convert keys to camelCase to conform with the twilio-node api definition contract
const camelCase = require('camelcase');
function camelCaseKeys(hashmap) {
  var newhashmap = {};
  Object.keys(hashmap).forEach(function(key) {
    var newkey = camelCase(key);
    newhashmap[newkey] = hashmap[key];
  });
  return newhashmap;
};


// ----- MEDIA STREAM ROUTES ----
router.post("/startStream", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(startStream(req));
});

router.post("/stopStream", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(stopStream(req));
});

// ----- NOTIFY ----

router.post('/register', (req, res) => {
  var content = camelCaseKeys(req.body);
  registerBind(content).then((data) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(data.status);
    res.send(data.data);
  });
});

router.post('/send-notification', (req, res) => {
  var content = camelCaseKeys(req.body);
  sendNotification(content).then((data) => {
    res.status(data.status);
    res.send(data.data);
  });
});

// ----- JS SDK ROUTES ----
router.get("/token", (req, res) => {
  res.send(tokenGenerator(req));
});

router.post("/voice", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(voiceResponse(req.body));
});

router.post("/test", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(test(req.body));
});

router.post("/record", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(record(req.body));
});

router.post("/convert", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(convert(req.body));
});

router.post("/convert_status", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(convert_status(req.body));
});

router.post("/addParticipant", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(addParticipant(req.body));
});

router.post("/feedback", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(feedback(req.body));
});

router.post("/status", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(status(req.body));
});

router.post("/recordStatus", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(recordStatus(req.body));
});

router.post("/dialStatus", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(dialStatus(req.body));
});

router.post("/handleDialCallStatus", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(handleDialCallStatus(req.body));
});

router.post("/conferenceStatus", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(conferenceStatus(req.body));
});

router.post("/inbound", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(inbound(req));
});


module.exports = router;
