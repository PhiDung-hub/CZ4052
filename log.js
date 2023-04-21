function log(msg) {
  document.getElementById("log").innerHTML = msg;
}

function simulationLog(msg) {
  var logElem = document.getElementById("simulation-log");
  logElem.innerHTML = '<div class="simulation-log-message">' + msg + "</div>" + logElem.innerHTML;
}

function clearSimulationLog() {
  document.getElementById("simulation-log").innerHTML = "";
}

export { log, simulationLog, clearSimulationLog };
