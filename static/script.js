const user = JSON.parse(localStorage.getItem("user"));

if (user.type == "therapist") {
  $("#therapistConnectBtn").hide();
}

var connectedId = "";

//connecting to our signaling server
const conn = io("http://127.0.0.1:5000");

conn.on("connect", () => {
  console.log("connected");
  conn.emit("register", user);
  initialize();
});

conn.on("disconnect", () => {
  console.log("disconnected");
  conn.emit("unregister", user);
});

conn.on("signal", (msg) => {
  console.log("Got message", msg);
  var content = JSON.parse(msg);
  var data = content.data;
  switch (content.event) {
    // when somebody wants to call us
    case "offer":
      handleOffer(data);
      break;
    case "answer":
      handleAnswer(content);
      break;
    // when a remote peer sends an ice candidate to us
    case "candidate":
      handleCandidate(data);
      break;
    default:
      break;
  }
});

function send(message) {
  conn.emit("signal", JSON.stringify(message));
}

var peerConnection;
var dataChannel;

var input = document.getElementById("messageInput");

function initialize() {
  var configuration = null;

  peerConnection = new RTCPeerConnection(configuration);

  // Setup ice handling
  peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      send({
        event: "candidate",
        data: event.candidate,
      });
    }
  };

  // creating data channel
  dataChannel = peerConnection.createDataChannel("dataChannel", {
    reliable: true,
    maxRetransmits: 7,
  });

  dataChannel.onerror = function (error) {
    console.log("Error occured on datachannel:", error);
  };

  // when we receive a message from the other peer, printing it on the console
  dataChannel.onmessage = function (event) {
    msg = JSON.parse(event.data);
    appendUserMessage(msg);
    console.log("message:", msg);
  };

  dataChannel.onclose = function () {
    console.log("data channel is closed");
  };

  peerConnection.ondatachannel = function (event) {
    dataChannel = event.channel;
  };
}

function connectToTherapist() {
  $.ajax({
    url: window.location.origin + "/checkAvailability",
    method: "GET",
    dataType: "json",
    success: function (response) {
      console.log(response);
      //val = JSON.parse(response);
      console.log(typeof response);
      if (response.value) {
        disableButton();
        createOffer();
      } else {
        updateInfo(false);
      }
    },
    error: function (xhr, status, error) {
      console.log("Error: " + error);
    },
  });
}

function updateInfo(bool) {
  if (bool) {
    $("#therapistInfo").text("Therapist is available");
    $("#therapistInfo").removeClass("text-danger").addClass("text-success");
  } else {
    $("#therapistInfo").text("Therapist is unavailable");
    $("#therapistInfo").removeClass("text-success").addClass("text-danger");
  }
  setTimeout(function () {
    $("#therapistInfo").text("");
  }, 3000);
}

function createOffer() {
  peerConnection.createOffer(
    function (offer) {
      send({
        event: "offer",
        data: offer,
      });
      peerConnection.setLocalDescription(offer);
    },
    function (error) {
      alert("Error creating an offer");
    }
  );
}

function handleOffer(offer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // create and send an answer to an offer
  peerConnection.createAnswer(
    function (answer) {
      peerConnection.setLocalDescription(answer);
      send({
        event: "answer",
        data: answer,
        user: user,
      });
    },
    function (error) {
      alert("Error creating an answer");
    }
  );
}

function handleCandidate(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(answer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer.data));
  connectedId = answer.user.id;
  disableButton();
  console.log("connection established successfully!! - " + answer);
}

function disableButton() {
  const button = $("#therapistConnectBtn");
  button.prop("disabled", true);
  button.removeClass("btn-primary").addClass("btn-success");
  button.text("Connected");
}

function checkDataChannelState() {
  if (dataChannel.readyState === "closed") {
    // execute your function here
    console.log("Data channel closed!");
  }
}

function sendMessage() {
  var msg = {
    data: input.value,
    from: user.name,
    to: connectedId,
  };
  if (dataChannel.readyState === "open") dataChannel.send(JSON.stringify(msg));
  else conn.emit("sendToID", JSON.stringify(msg));
  appendUserMessage(msg);
  input.value = "";
}

conn.on("message", (data) => {
  console.log("Got message", data);
  var msg = JSON.parse(data);
  appendUserMessage(msg);
});

function appendUserMessage(msg) {
  $("#chatbox").append(
    '<div class="divider d-flex align-items-center mb-4"><p>' +
      msg.from +
      ": " +
      msg.data +
      "</p><br>"
  );
}
