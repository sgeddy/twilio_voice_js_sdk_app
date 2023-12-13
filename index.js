const https = require("https");
const fs = require('fs');
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const router = require("./src/router");

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

// Create http server and run it
const server = https.createServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem'),
}, app);
const port = process.env.PORT || 3000;

// Create WebSocket servers
const wss = new WebSocket.Server({ server });

/*
const io = require('socket.io')(server);


// ----- SOCKET.IO -----

// Websocket Events
io.on('connection', (socket) => {

  socket.emit('message', `A new user, ${Date.now()}, has connected`);

  socket.on('message', (message) => {
    console.log(`The new user's name is ${message.username}, and his message is: ${message.text}`);
  });

  socket.on('disconnect', () => {
    console.log('A user has disconnected.');
  });

});
*/

// ----- MEDIA STREAMS -----
//Include Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

//Configure Transcription Request
const request = {
  config: {
    encoding: "MULAW",
    sampleRateHertz: 8000,
    languageCode: "en-GB"
  },
  interimResults: true
};

// Handle Web Socket Connection
wss.on("connection", function connection(ws) {
console.log("New Connection Initiated");

 let recognizeStream = null;

  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case "connected":
        console.log(`A new stream has connected.`);

        // Create Stream to the Google Speech to Text API
        recognizeStream = client
          .streamingRecognize(request)
          .on("error", console.error)
          .on("data", data => {
            console.log(data.results[0].alternatives[0].transcript);
            wss.clients.forEach( client => {
                 if (client.readyState === WebSocket.OPEN) {
                   client.send(
                     JSON.stringify({
                     event: "interim-transcription",
                     text: data.results[0].alternatives[0].transcript
                   })
                 );
               }
             });
          });
        break;
      case "start":
        console.log(`Starting Media Stream ${msg.streamSid}`);
        break;
      case "media":
        // Write Media Packets to the recognize stream
        recognizeStream.write(msg.media.payload);
        break;
      case "stop":
        console.log(`Stream stopped.`);
        recognizeStream.destroy();
        break;
    }
  });
});

// --- START SERVER ---
server.listen(port, function () {
  console.log("Express server running on *:" + port);
});