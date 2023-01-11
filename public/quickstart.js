$(function () {
  const speakerDevices = document.getElementById("speaker-devices");
  const ringtoneDevices = document.getElementById("ringtone-devices");
  const outputVolumeBar = document.getElementById("output-volume");
  const inputVolumeBar = document.getElementById("input-volume");
  const volumeIndicators = document.getElementById("volume-indicators");
  const callButton = document.getElementById("call");
  const conferenceButton = document.getElementById("check-conference");
  const recordButton = document.getElementById("check-record");
  const hangupButton = document.getElementById("hangup");
  const muteButton = document.getElementById("button-mute");
  const muteButtonLabel = document.getElementById("button-mute-label");
  const startStreamButton = document.getElementById("button-stream-start");
  const stopStreamButton = document.getElementById("button-stream-stop");
  const callControlsDiv = document.getElementById("call-controls");
  const audioSelectionDiv = document.getElementById("output-selection");
  const getAudioDevicesButton = document.getElementById("get-devices");
  const logDiv = document.getElementById("log");
  const incomingCallDiv = document.getElementById("incoming-call");
  const addParticipant = document.getElementById("add-participant");
  const transcriptionContainer = document.getElementById("transcription-container");

  // feedback API
  const feedbackDiv = document.getElementById("feedback");
  const qualityDiv = document.getElementById("quality");

  const feedbackButton1 = document.getElementById(
    "button-1"
  );
  const feedbackButton2 = document.getElementById(
    "button-2"
  );
  const feedbackButton3 = document.getElementById(
    "button-3"
  );
  const feedbackButton4 = document.getElementById(
    "button-4"
  );
  const feedbackButton5 = document.getElementById(
    "button-5"
  );
  const imperfectAudio = document.getElementById(
    "imperfect-audio"
  );
  const droppedCall = document.getElementById(
    "dropped-call"
  );
  const incorrectCallerId = document.getElementById(
    "incorrect-caller-id"
  );
  const postDialDelay = document.getElementById(
    "post-dial-delay"
  );
  const digitsNotCaptured = document.getElementById(
    "digits-not-captured"
  );
  const audioLatency = document.getElementById(
    "audio-latency"
  );
  const unsolicitedCall = document.getElementById(
    "unsolicited-call"
  );
  const oneWayAudio = document.getElementById(
    "one-way-audio"
  );
  const submitFeedbackButton = document.getElementById(
    "submitFeedback"
  );

  // incoming calls
  const incomingCallAcceptButton = document.getElementById(
    "button-accept-incoming"
  );
  const incomingCallRejectButton = document.getElementById(
    "button-reject-incoming"
  );
  const incomingCallHangupButton = document.getElementById(
    "hangup-incoming"
  );

  const phoneNumberInput = document.getElementById("phone-number");
  const incomingPhoneNumberEl = document.getElementById("incoming-number");
  const startupButton = document.getElementById("startup-button");

  // Regional elements
  const launchDiv = document.getElementById("launch-div");


  // ----- GLOBAL VARS -----

  let device;
  let call;
  let mute = false;
  let token;
  let feedbackScore;
  let feedbackQuality = [];
  let callType;
  let callOptions;
  let recordCheck = false;
  let callStarted = false;
  let conferenceEnabled = false;
  let recording = false;
  let incomingCallFlag = false;

  // ----- EVENT LISTENERS ----- 

  // Feedback
  feedbackButton1.onclick = (e) => {
    feedbackScore = '1';
  };
  feedbackButton2.onclick = (e) => {
    feedbackScore = '2';
  };
  feedbackButton3.onclick = (e) => {
    feedbackScore = '3';
  };
  feedbackButton4.onclick = (e) => {
    feedbackScore = '4';
  };
  feedbackButton5.onclick = (e) => {
    feedbackScore = '5';
  };

  // Start stream button
  startStreamButton.onclick = (e) => {
    startStream();
  };

  // Stop stream button
  stopStreamButton.onclick = (e) => {
    stopStream();
  };

/*
  // Record button click
  recordButton.onclick = (e) => {
    if (callStarted == true) record();
  };
*/
  var $radios = $('input[checkbox="radio"]');
  $radios.click(function () {
    var $this = $(this);
    if ($this.data('checked')) {
      this.checked = false;
    }
    var $otherRadios = $radios.not($this).filter('[name="' + $this.attr('name') + '"]');
    $otherRadios.prop('checked', false).data('checked', false);
    $this.data('checked', this.checked);
  });


  // Conference button click
  conferenceButton.onclick = (e) => {
    if (callType == "call") convert();
  };

  // Add Participant Button
  addParticipant.onclick = (e) => {
    let To = phoneNumberInput.value;
    addParticipantFront(To);
  };

  // Call button
  callButton.onclick = (e) => {
    e.preventDefault();
    hangupButton.classList.remove("hide");
    callButton.classList.add("hide");
    feedbackDiv.classList.add("hide");
    conferenceButton.disabled = true;
    recordButton.disabled = true;
    if(conferenceButton.checked == true) callType = "conference";
    else callType = "call";
    if(recordButton.checked == true) recordCheck = true;
    else recordCheck = false;
    muteButton.checked = false;
    muteButton.classList.remove("hide");
    muteButtonLabel.classList.remove("hide");
    makeOutgoingCall(callType, recordCheck);
  };

  // Digits button
  $(".digit").on('click', function() {
    var input = document.getElementById("phone-number");
    var current = input.value;
    var num = ($(this).clone().children().remove().end().text());
    input.value = current + num.trim();

    console.log(callStarted);
    if (callStarted == true) {
      var dtmf = num.trim();
      dtmf = dtmf.toString();
      console.log(dtmf);
      call.sendDigits(dtmf);
    }
  });

  // Mute button
  $(muteButton).click(function() {
        if (incomingCallFlag == false) {
          if (mute == true) {
          mute = false;
          log("Unmuted.");
          call.mute(mute);
        }
        else {
          mute = true;
          log("Muted.");
          call.mute(mute);
        }
      }   
  });
  
  $('.fa-long-arrow-left').on('click', function() {
    var input = document.getElementById("phone-number");
    var current = input.value;
    var newVal = current.slice(0, -1);
    input.value = newVal;
  });


  // Submit feedback
  submitFeedbackButton.onclick = (e) => {
    if(imperfectAudio.checked == true) feedbackQuality.push(imperfectAudio.value);
    if(droppedCall.checked == true) feedbackQuality.push(droppedCall.value);
    if(incorrectCallerId.checked == true) feedbackQuality.push(incorrectCallerId.value);
    if(postDialDelay.checked == true) feedbackQuality.push(postDialDelay.value);
    if(digitsNotCaptured.checked == true) feedbackQuality.push(digitsNotCaptured.value);
    if(audioLatency.checked == true) feedbackQuality.push(audioLatency.value);
    if(unsolicitedCall.checked == true) feedbackQuality.push(unsolicitedCall.value);
    if(oneWayAudio.checked == true) feedbackQuality.push(oneWayAudio.value);

    postFeedback(feedbackScore, feedbackQuality);
  };

  // Audio devices
  getAudioDevicesButton.onclick = getAudioDevices;
  speakerDevices.addEventListener("change", updateOutputDevice);
  ringtoneDevices.addEventListener("change", updateRingtoneDevice);
  hangupButton.onclick = hangup;

  // ---- NOTIFY ----
  $(function() {
    $('#sendNotificationButton').on('click', function() {
      $.post('/send-notification', {
        identity: $('#identityInput').val(),
        body: "Hello, world!",
        sound: "Exurb.mp3",
        priority: "low"
      }, function(response) {
        $('#identityInput').val('');
        $('#message').html(response.message);
        console.log(response);
      });
    });
  });

  // ----- DEVICE SETUP -----
  // SETUP STEP 1:
  // Browser client should be started after a user gesture
  // to avoid errors in the browser console re: AudioContext
  startupButton.addEventListener("click", startupClient);


  // SETUP STEP 2: Request an Access Token
  async function startupClient() {
    try {
        var region = "";
        if (document.getElementById('button-us1').checked) region = "us1";
        else if (document.getElementById('button-ie1').checked) region = "ie1";
        else if (document.getElementById('button-au1').checked) region = "au1";
        else if (document.getElementById('button-us2').checked) region = "us2";

        log("Requesting Access Token...");
        const data = await $.getJSON("/token?region=" + region);
        log("Got a token from region " + region + ". Token in browser console.");
        token = data.token;
        console.log("Token: " + token);
        setClientNameUI(data.identity);
        intitializeDevice();
        log("Device initialized in region " + region + ".");
        launchDiv.classList.add("hide");
    } catch (err) {
        console.log(err);
        log("An error occurred. See your browser console for more information.");
      }
  }

  // SETUP STEP 3:
  // Instantiate a new Twilio.Device
  function intitializeDevice() {
    logDiv.classList.remove("hide");
    log("Initializing device");
    const options = {
        allowIncomingWhileBusy: true,
        appName: "Sam's JS Client",
        appVersion: "v2.0",
        closeProtection: true,
        edge: ["ashburn", "dublin"],
        logLevel: 0,
        maxAverageBitrate: 51000,
        forceAggressiveIceNomination: true,
        // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
        // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
        codecPreferences: ["opus", "pcmu"],
        sounds: {
          incoming: 'Long_Winter.mp3', 
        },
        tokenRefreshMs: 30000,
      };
    try {
      device = new Twilio.Device(token, options);
    } catch (err) {
      console.log("An error occurred initializing device.")
    }

    /*
    // Update token
    const ttl = 600000; // 10 minutes seconds --> taken from src/handler.js
    const refreshBuffer = 30000; // 30 seconds

    setInterval(async () => {
      const newToken = await $.getJSON("/token");
      token = newToken.token;
      console.log("New Token: " + token);
      device.updateToken(token);
      console.log("Device succesfully updated with new token.");
    }, ttl - refreshBuffer); // Gives us a generous 30-second buffer
    */

    addDeviceListeners(device);
    console.log("Device listeners added.")
    // Device must be registered in order to receive incoming calls
    device.register();
    console.log("Device registered.");
    console.log(device);
  }

  // SETUP STEP 4:
  // Listen for Twilio.Device states
  function addDeviceListeners(device) {
    console.log("Adding device listeners.")
    device.on("registered", function () {
      console.log("Registered.")
      log("Twilio.Device Ready to make and receive calls!");
      callControlsDiv.classList.remove("hide");
    });

    device.on("error", function (error) {
      console.log("Twilio.Device Error: " + error.message);
    });

    device.on('tokenWillExpire', () => {
      console.log("tokenWillExpire event fired");
      return $.getJSON("/token").then(newToken => {
        console.log("New Token: " + newToken.token);
        device.updateToken(newToken.token);
        console.log("Device succesfully updated with new token.");
      });
    });

    device.on("incoming", handleIncomingCall);

    device.audio.on("deviceChange", updateAllAudioDevices.bind(device));

    // Show audio selection UI if it is supported by the browser.
    if (device.audio.isOutputSelectionSupported) {
      audioSelectionDiv.classList.remove("hide");
    }

  }

  // Add Participant
  async function addParticipantFront(To) {
    log("Adding participant to conference...");
    try {
      const data = await $.post("/addParticipant", {To: To});
      log("Call to new participant succesfully made.");
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
  }
  

  // Start media stream
  async function startStream() {
    console.log("Starting media stream live transcription...");
    try {
      const stream = await $.post("/startStream", {});
      log("Stream started.");
      //transcriptionContainer.remove("hide");
      startStreamButton.classList.add("hide");
      stopStreamButton.classList.remove("hide");
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
  }

  // Stop media stream
  async function stopStream() {
    console.log("Stopping media stream live transcription...");
    try {
      const stream = await $.post("/stopStream", {});
      log("Stream stopped.");
      startStreamButton.classList.remove("hide");
      stopStreamButton.classList.add("hide");
      transcriptionContainer.innerHTML = "";
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
  }

  // Convert Call
  async function convert() {
    console.log("Converting call to conference...");
    try {
      const convert = await $.post("/convert_status", {});
      const data = await $.post("/convert", {});
      log("Call successfully converted to conference.");
      callType = "conference";
      conferenceButton.disabled = true;
      addParticipant.classList.remove("hide");
      startStreamButton.classList.remove("hide");
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
  }

  // Enable recording
  async function record() {
    try {
      console.log ("recordButton.checked: " + recordButton.checked);
      const data = await $.post("/record", {record: recordButton.checked});
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
  }

  // Post Feedback
  async function postFeedback(feedbackScore, feedbackQuality) {
    log("Posting feedback...");
    const issues = JSON.stringify(feedbackQuality);
    console.log(issues);
    try {
      const data = await $.post("/feedback", { feedbackScore: feedbackScore, feedbackQuality: issues });
      log("Posted feedback.");
    } catch (err) {
      console.log(err);
      log("An error occurred. See your browser console for more information.");
    }
    feedbackDiv.classList.add("hide");
  }

  // MAKE AN OUTGOING CALL
  async function makeOutgoingCall(callType, recordCheck) {
    mute = false;

    var params = {
      // get the phone number to call from the DOM
      To: phoneNumberInput.value,
      From: "13312561485",
      Caller: "client:35",
      "callType": callType,
      "recordCheck": recordCheck
    };

    if (device) {
      log(`Attempting to call ${params.To} ...`);

      // Twilio.Device.connect() returns a Call object
      call = await device.connect({ params});
      // add listeners to the Call
      // "accepted" means the call has finished connecting and the state is now "open"
      call.addListener("accept", updateUIAcceptedCall);
      call.addListener("disconnect", updateUIDisconnectedCall);
      call.addListener("messageReceived", handleMessage);
      } 
    else {
      log("Unable to make call.");
    }
  }
  function handleMessage(call) {
    var serverMessage = call.content.message;
    console.log(serverMessage);
    log("Message from server: " + serverMessage);
  }

  function updateUIAcceptedCall(call) {
    callButton.disabled = true;
    recordButton.disabled = false;
    muteButton.disabled = false;
    volumeIndicators.classList.remove("hide");
    muteButton.classList.remove("hide");
    muteButtonLabel.classList.remove("hide");
    bindVolumeIndicators(call);

    if (callType == "call") {
      log("Call in progress ...");   
      conferenceButton.disabled = false;   
    }

    else if (callType == "conference") {
      log("Conference in progress ...");
      startStreamButton.classList.remove("hide");
      addParticipant.classList.remove("hide");
    }
    callStarted = true;
  }

  function updateUIDisconnectedCall() {
    
    callStarted = false;
    log("Call disconnected.");
    callButton.disabled = false;
    conferenceButton.disabled = false;
    recordButton.disabled = false;
    muteButton.disabled = true;
    muteButton.classList.add("hide");
    muteButtonLabel.classList.add("hide");
    mute = false;
    startStreamButton.classList.add("hide");
    stopStreamButton.classList.add("hide");
    volumeIndicators.classList.add("hide");
    feedbackDiv.classList.remove("hide");
    addParticipant.classList.add("hide");
    transcriptionContainer.innerHTML = "";
    callType = "";
    hangupButton.classList.add("hide");
    callButton.classList.remove("hide");
  }

  // HANG UP A CALL
  function hangup() {
    log("Hanging up ...");
    if (device) {
      device.disconnectAll();
    }
    callStarted = false;
    callType = "";
  }

  // HANDLE INCOMING CALL

  function handleIncomingCall(call) {
    mute = false;
    log(`Incoming call from ${call.parameters.From}`);

    //show incoming call div and incoming phone number
    incomingCallDiv.classList.remove("hide");

    incomingPhoneNumberEl.innerHTML = call.parameters.From;

    //add event listeners for Accept, Reject, and Hangup buttons
    incomingCallAcceptButton.onclick = () => {
      acceptIncomingCall(call);
    };

    incomingCallRejectButton.onclick = () => {
      rejectIncomingCall(call);
    };

    incomingCallHangupButton.onclick = () => {
      hangupIncomingCall(call);
    };

    // add event listener to call object
    call.addListener("cancel", handleDisconnectedIncomingCall);
  }

  

  // ACCEPT INCOMING CALL

  function acceptIncomingCall(call) {
    incomingCallFlag = true;
    callStarted = true;
    call.accept();
    console.log(muteButton);

    //update UI
    log("Accepted incoming call.");
    incomingCallAcceptButton.classList.add("hide");
    incomingCallRejectButton.classList.add("hide");
    incomingCallHangupButton.classList.remove("hide");
    callButton.classList.add("hide");
    muteButton.checked = false;
    muteButton.disabled = false;
    muteButton.classList.remove("hide");
    muteButtonLabel.classList.remove("hide");
    volumeIndicators.classList.remove("hide");
    bindVolumeIndicators(call);

    $(muteButton).click(function() {
        if (mute == true) {
          mute = false;
          log("Unmuted.");
          call.mute(mute);
        }
        else {
          mute = true;
          log("Muted.");
          call.mute(mute);
        }
      });
    
  }


  // REJECT INCOMING CALL
  function rejectIncomingCall(call) {
    call.reject();

    log("Rejected incoming call");
    resetIncomingCallUI();
  }

  // HANG UP INCOMING CALL
  function hangupIncomingCall() {
    callStarted = false;
    hangup();
    resetIncomingCallUI();
  }

  // HANDLE CANCELLED INCOMING CALL
  function handleDisconnectedIncomingCall(call) {
    console.log("CALL CANCELLED");
    callType = "";
    device.disconnectAll();
    log("Incoming call ended.");
    resetIncomingCallUI();
  }

  // MISC USER INTERFACE

  // Activity log
  function log(message) {
    logDiv.innerHTML += `<p class="log-entry">&gt;&nbsp; ${message} </p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  function setClientNameUI(clientName) {
    var div = document.getElementById("client-name");
    div.innerHTML = `<p style="color: #023B50;">Your client name: <strong>${clientName}</strong></p>`;
  }

  function resetIncomingCallUI() {
    incomingPhoneNumberEl.innerHTML = "";
    transcriptionContainer.innerHTML = "";
    incomingCallDiv.classList.add("hide");
    startStreamButton.classList.add("hide");
    stopStreamButton.classList.add("hide");
    muteButton.classList.add("hide");
    muteButton.checked = false;
    muteButton.disabled = true;
    mute = false;
    muteButtonLabel.classList.add("hide");
    incomingCallHangupButton.classList.add("hide");
    callButton.classList.remove("hide");
    volumeIndicators.classList.add("hide");
    incomingCallFlag = false;
  }

  // AUDIO CONTROLS

  async function getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    updateAllAudioDevices.bind(device);
  }

  function updateAllAudioDevices() {
    if (device) {
      updateDevices(speakerDevices, device.audio.speakerDevices.get());
      updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
    }
  }

  function updateOutputDevice() {
    const selectedDevices = Array.from(speakerDevices.children)
      .filter((node) => node.selected)
      .map((node) => node.getAttribute("data-id"));

    device.audio.speakerDevices.set(selectedDevices);
  }

  function updateRingtoneDevice() {
    const selectedDevices = Array.from(ringtoneDevices.children)
      .filter((node) => node.selected)
      .map((node) => node.getAttribute("data-id"));

    device.audio.ringtoneDevices.set(selectedDevices);
  }

  function bindVolumeIndicators(call) {
    call.on("volume", function (inputVolume, outputVolume) {
      var inputColor = "red";
      if (inputVolume < 0.5) {
        inputColor = "green";
      } else if (inputVolume < 0.75) {
        inputColor = "yellow";
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + "px";
      inputVolumeBar.style.background = inputColor;

      var outputColor = "red";
      if (outputVolume < 0.5) {
        outputColor = "green";
      } else if (outputVolume < 0.75) {
        outputColor = "yellow";
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + "px";
      outputVolumeBar.style.background = outputColor;
    });
  }

  // Update the available ringtone and speaker devices
  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = "";

    device.audio.availableOutputDevices.forEach(function (device, id) {
      var isActive = selectedDevices.size === 0 && id === "default";
      selectedDevices.forEach(function (device) {
        if (device.deviceId === id) {
          isActive = true;
        }
      });

      var option = document.createElement("option");
      option.label = device.label;
      option.setAttribute("data-id", id);
      if (isActive) {
        option.setAttribute("selected", "selected");
      }
      selectEl.appendChild(option);
    });
  }
});
