const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;


const nameGenerator = require("../name_generator");
const config = require("../config");
const accountSid = config.accountSid;

var authToken = config.authToken;
var apiKey = config.apiKey;
var apiSecret = config. apiSecret;
var callerId = config.callerId;
var twimlAppSid = config.twimlAppSid;
var region = "us1";

var identity;
let callSid = "";
let dialCallSid;
let conferenceSid;
let convert = "false";
let activeRecording = false;

var client = require('twilio')(accountSid, authToken);

// ngrok / server URL
let ngrok = "";

// ----- JS SDK FUNCTIONS -----

// status callback
exports.status = function status(requestBody) {
  callSid = requestBody.CallSid;
  console.log(callerId);
  return
};

// status callback
exports.recordStatus = function recordStatus(requestBody) {
  console.log(requestBody);
  console.log("Recording: " + requestBody.RecordingSid + ", " + requestBody.RecordingStatus);
  if (requestBody.RecordingStatus == "in-progress") activeRecording = true;
  else if (requestBody.RecordingStatus == "completed") activeRecording = false;
  return
};

// dial status callback
exports.dialStatus = function dialStatus(requestBody) {
  dialCallSid = requestBody.CallSid;
  console.log("Dial Staus Callback: " + requestBody.CallSid, requestBody.CallStatus);
  if (requestBody.CallStatus == "in-progress") {
      // Send userDefinedMessage
      client.calls(callSid)
          .userDefinedMessages
          .create({content: JSON.stringify({
             message: 'Hello from the server side!'
           })})
          .then(user_defined_message => console.log("userDefinedMessage response: " + user_defined_message.sid))
          .catch(e => {console.log('Got an error @userDefinedMessage:', e.code, e.message)});
  }
  return
};

// conference status callback
exports.conferenceStatus = function conferenceStatus(requestBody) {
  conferenceSid = requestBody.conferenceSid;
  console.log("Conference: " + conferenceSid + ", Status: " + requestBody.ConferenceStatus);
  return
};

// conference status callback
exports.test = function test(requestBody) {
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();
const dial = response.dial({
    callerId: requestBody.To
});
dial.number('+18652729437');
  // return twiml
  return response.toString();
};

// dial status callback
exports.inbound = function inbound(request) {
  const regionInbound = request.query.region;
  let twiml = new VoiceResponse();
  if (regionInbound == "AU") {
    const dial = twiml.dial();
    dial.client('Sam');
    console.log("Region = AU");
    console.log(request.body.CallSid);
  }
  else if (regionInbound == "IE") {
    const dial = twiml.dial();
    dial.client('Sam');
    console.log("Region = IE");
    console.log(request.body.CallSid);
  }
  else if (regionInbound == "US1") {
    const dial = twiml.dial();
    dial.client('Sam');
    console.log("Region = IE");
    console.log(request.body.CallSid);
  }
  else { 
    twiml.hangup();
  }
  
  // return twiml
  return twiml.toString();
};

// dial action URL
exports.handleDialCallStatus = function handleDialCallStatus(requestBody) {
  let twiml = new VoiceResponse();
  if (convert == "true") {
    convert = "false";
    dial = twiml.dial();
    dial.conference({startConferenceOnEnter: true}, 'Sam Conference');
  }
  else { 
    /*
    const say = twiml.say({voice: 'Polly.Geraint'});
    say.prosody({
      pitch: '10%',
      rate: '100%',
      volume: '6dB'
    }, 'This call is complete. Have a nice day!');
    */
    twiml.hangup();
  }
  
  // return twiml
  return twiml.toString();
};

// post feedback
exports.feedback = function feedback(requestBody) {
  var issues = requestBody.feedbackQuality.replace(/['""]+/g, '');
  issues = issues.replace(/[\[\]']+/g,'');
  issueArray = issues.split(",");      

 client.calls(callSid)
      .feedback()
      .update({qualityScore: requestBody.feedbackScore, issue: issueArray})
      .then(feedback => console.log(feedback))
      .catch(e => {console.log('Got an error:', e.code, e.message)});

  return
};

// token gen
exports.tokenGenerator = function tokenGenerator(req) {

  // Assign regional vars
  region = req.query.region;
  console.log("region = " + region);

    // Set for US1
    if (region == "us1") {
      authToken = config.authToken;
      apiKey = config.apiKey;
      apiSecret = config. apiSecret;
      callerId = config.callerId;
      twimlAppSid = config.twimlAppSid;
      client = require('twilio')(accountSid, authToken);
    }
    // Set for IE1
    else if (region == "ie1") {
      authToken = config.authTokenIE;
      apiKey = config.apiKeyIE;
      apiSecret = config. apiSecretIE;
      callerId = config.callerIdIE;
      twimlAppSid = config.twimlAppSidIE;

      client = require('twilio')(
        apiKey,
        apiSecret, {
            accountSid: accountSid,
            edge: 'dublin',
            region: region
        });
    }
    // Set for AU1
    else if (region == "au1") {
      authToken = config.authTokenAU;
      apiKey = config.apiKeyAU;
      apiSecret = config. apiSecretAU;
      callerId = config.callerIdAU;
      twimlAppSid = config.twimlAppSidAU;

      client = require('twilio')(
        apiKey,
        apiSecret, {
            accountSid: accountSid,
            edge: 'sydney',
            region: region
        });
    }

  // Set General vars
  identity = "voiceTSE";
  const ttl = 600;

  // Set Mobile Vars
  //const androidAppSid = '';
  //const androidCredSid = '';

  const accessToken = new AccessToken(
    accountSid,
    apiKey,
    apiSecret
  );

  accessToken.identity = identity;
  accessToken.ttl = ttl;
  accessToken.region = req.query.region;

  const grant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
};


// voice response
exports.voiceResponse = function voiceResponse(requestBody) {
  console.log(callerId);
  const toNumberOrClientName = requestBody.To;
  callSid = requestBody.CallSid;
  console.log("Parent callSid: " + callSid);
  const callType = requestBody.callType;
  const recordCheck = requestBody.recordCheck;
  let recordOption = "do-not-record";
  if (recordCheck === 'true') recordOption = "record-from-ringing-dual";
  console.log("Record option selected in UI: " + recordOption);

  console.log(callerId);

  let twiml = new VoiceResponse();

  // conference call
  if (callType == "conference") {
    client.calls
        .create({
           //machineDetection: 'DetectMessageEnd',
           //asyncAmd: 'true',
           //asyncAmdStatusCallback: 'https://async-amd-7537.twil.io/async_callback',
           //url: 'https://handler.twilio.com/twiml/EH09c47639badda624f4313069fd67c8f1',
           twiml: `<Response>
                          <Dial record='${recordOption}'>
                            <Conference
                            statusCallback='${ngrok}/conferenceStatus' 
                            statusCallbackEvent='start end join leave mute hold'>Sam Conference</Conference>
                          </Dial>
                        </Response>`,
           to: requestBody.To,
           from: callerId,
         })
        .then(call => {
          console.log("Outbound-API Call:" + call.sid);
          dialCallSid = call.sid;
        })
        .catch(e => {console.log('Got an error:', e.code, e.message)});
    if (requestBody.To) {
          dial = twiml.dial({ callerId: callerId });
          dial.conference({startConferenceOnEnter: true, record: 'record-from-start'}, 'Sam Conference');
    }
    else {
          twiml.say("Thanks for calling!");
    }
        // return twiml
        return twiml.toString();
    }

  // normal call use <Dial>
  if (callType == "call") {
    // If the request to the /voice endpoint is TO your Twilio Number, 
    // then it is an incoming call towards your Twilio.Device.
    /*
    if (requestBody.To == callerId) {
      
      dial = twiml.dial();

      // This will connect the caller with your Twilio.Device/client 
      dial.client(identity);

    } else 

    */
    console.log("CallType = call, hit /voice");
    if (requestBody.To) {
      // This is an outgoing call
      // set the callerId
      dial = twiml.dial({ 
        callerId: callerId,
        record: recordOption,
        recordingStatusCallback: '/recordStatus',
        recordingStatusCallbackEvent: ['in-progress completed absent'],
        answerOnBridge: 'true',
        action: '/handleDialCallStatus'
      });

      // Check if the 'To' parameter is a Phone Number or Client Name
      // in order to use the appropriate TwiML noun 
      const attr = isAValidPhoneNumber(toNumberOrClientName)
        ? "number"
        : "client";
      dial[attr]({
        statusCallbackEvent: 'initiated ringing answered completed',
        statusCallback: '/dialStatus',
        statusCallbackMethod: 'POST',
      }, toNumberOrClientName);

    } else {
      twiml.say("Thanks for calling!");
    }
    // return twiml
    return twiml.toString();
  }
};

// record call
exports.record = function record(requestBody) {
  // check if any in-progress recording for parent call
  if (activeRecording == false && requestBody.record === 'true') {
    client.calls(callSid)
      .recordings
      .create({
         recordingStatusCallback: `${ngrok}/recordStatus`,
         recordingStatusCallbackEvent: ['in-progress completed absent'],
         recordingChannels: 'dual'
       })
      .then(recording => {
        console.log("Recording enabled: " + recording.sid);
        activeRecording = true;
      })
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return
  }

  else if (activeRecording == true && requestBody.record === 'true') {
    client.calls(callSid)
      .recordings('Twilio.CURRENT')
      .update({status: 'in-progress'})
      .then(recording => {
        console.log("Recording resumed: " + recording.sid);
      })
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return
  }

  else if (activeRecording == true && requestBody.record === 'false') {
    client.calls(callSid)
      .recordings('Twilio.CURRENT')
      .update({status: 'paused'})
      .then(recording => {
        console.log("Recording paused: " + recording.sid);
      })
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return
  }
}


// convert call
exports.convert = function convert(requestBody) {
  convert = "true";
  client.calls(dialCallSid)
      .update({twiml: `<Response>
                          <Dial>
                            <Conference record='record-from-start'
                            recordingStatusCallback='/recordStatus'
                            statusCallback='/conferenceStatus' 
                            statusCallbackEvent='start end join leave mute hold'>Sam Conference</Conference>
                          </Dial>
                        </Response>`})
      .then(call => console.log("Converted."))
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return;
};

// Start Stream
exports.startStream = function startStream(req) {
  console.log("Starting Stream.");
  console.log("Host: " + req.headers.host);
  client.calls(dialCallSid)
      .update({twiml:`
          <Response>
            <Start>
              <Stream name="transcription" url="wss://${req.headers.host}/"/>
            </Start>
            <Dial><Conference statusCallback="https://${req.headers.host}/conferenceStatus" statusCallbackEvent="start end join leave mute hold">Sam Conference</Conference></Dial>
          </Response>
      `})
      .then(call => console.log("Start stream request sent."))
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return;
};

// Stop Stream
exports.stopStream = function stopStream(req) {
  console.log("Stopping Stream.");
  client.calls(dialCallSid)
      .update({twiml:`
          <Response>
            <Stop>
              <Stream name="transcription"/>
            </Stop>
            <Dial><Conference statusCallback="https://${req.headers.host}/conferenceStatus" statusCallbackEvent="start end join leave mute hold">Sam Conference</Conference></Dial>
          </Response>
      `})
      .then(call => console.log("Stop stream request sent."))
      .catch(e => {console.log('Got an error:', e.code, e.message)});
      return;
};

// convert call
exports.convert_status = function convert_status(requestBody) {
  convert = "true";
  console.log("Convert set to:" + convert);
};

// Add Participant
exports.addParticipant = function addParticipant(requestBody) {
  var To = requestBody.To;

  client.conferences("Sam Conference")
      .participants
      .create({
         label: 'customer',
         earlyMedia: true,
         beep: 'onEnter',
         from: callerId,
         to: To
       })
      .then(participant => console.log(participant.callSid))
      .catch(e => {console.log('Got an error:', e.code, e.message)});
  return;
};

// ---- NOTIFY ---- 
exports.registerBind = function registerBind(binding) {
  // Get a reference to the user notification service instance
  const service = client.notify.services(
    config.notifySid
  );

  return service.bindings.create(binding).then((binding) => {
    console.log(binding);
    // Send a JSON response indicating success
    return {
      status: 200,
      data: {message: 'Binding created!'},
    };
  }).catch((error) => {
    console.log(error);
    return {
      status: 500,
      data: {
        error: error,
        message: 'Failed to create binding: ' + error,
      },
    };
  });
};

// Notify - send a notification from a POST HTTP request
exports.sendNotification = function sendNotification(notification) {

  wait(5000);
  // Create a reference to the user notification service
  // Get a reference to the user notification service instance
  const service = client.notify.services(
    config.notifySid
  );

  // Send a notification
  return service.notifications.create(notification).then((message) => {
    console.log(message);
    return {
      status: 200,
      data: {message: 'Successful sending notification'},
    };
  }).catch((error) => {
    console.log(error);
    return {
      status: 500,
      data: {error: error},
    };
  });
};



// ----- MISC FUNCTIONS -----

// wait function used for testing
function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

/**
 * Checks if the given value is valid as phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}