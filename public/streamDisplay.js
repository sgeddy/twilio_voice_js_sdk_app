document.addEventListener("DOMContentLoaded", event => {
  //const webSocket = io();
  webSocket = new WebSocket("ws://localhost:3000");

  webSocket.onmessage = function(msg) {
    const data = JSON.parse(msg.data);
    if (data.event === "interim-transcription") {
      document.getElementById("transcription-container").innerHTML =
        data.text;
    }
  };

/*
  // ---- SOCKET.IO ----
  
  webSocket.on('connect', () => {
    console.log('You have connected!');
    webSocket.send({
      username: 'Bob Loblaw',
      text: 'Check out my law blog.'
    });
  });

  webSocket.on('message', (message) => {
    console.log('Something came along on the "message" channel:', message);
    $( "section.messages" )
    .html( `<p>New message: ${message}</p>` );
  });
*/

});
