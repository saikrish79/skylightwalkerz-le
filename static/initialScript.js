function forwardToClient() {
  $("#LoginSelection").hide();
  $("#optionforClients").show();
  var user = {
    type: "client",
    id: generateRandomID().toString(),
  };
  localStorage.setItem("user", JSON.stringify(user));
}

function handleTherapist() {
  $("#LoginSelection").hide();
  $("#optionforTherapists").show();
}

function forwardToTherapist() {
  var user = {
    type: "therapist",
    id: generateRandomID().toString(),
    name: $("#therapistName").val(),
  };
  localStorage.setItem("user", JSON.stringify(user));
  window.location = window.location.origin + "/chat";
}

function forwardToCrisis() {
  let user = JSON.parse(localStorage.getItem("user"));
  user.name = "Emergency";
  localStorage.setItem("user", JSON.stringify(user));
  window.location = window.location.origin + "/chat";
}

function forwardToCollectData(bool) {
  console.log("Boolean: " + bool);
  $("#initialBody").hide();
  $("#consentForm").show();
  if (bool === false) {
    $("#referrerName_1").hide();
    $("#relationship_1").hide();
  }
}

function handleCollectedData() {
  event.preventDefault();
  window.location = window.location.origin + "/counsellingService";
}

/* var user = {
    type: "client",
}
  localStorage.setItem("user", JSON.stringify(user));
    window.location = http.api+"/client"; */

function generateRandomID() {
  return Math.floor(Math.random() * 900000) + 100000;
}
