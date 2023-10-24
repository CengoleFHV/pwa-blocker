import { giveMePi } from "./modules/madhava-leibniz.js";

const TIME_FORMAT = Intl.DateTimeFormat("de-DE", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/* HTML element IDs */
const EXECUTION_MODE_ID = "executionMode";
const CLOCK_ID = "clock";
const COUNTER_ID = "counter";
const BLOCKER_ID = "blocker";
const INC_COUNTER_ID = "incCounter";
const RUN_BLOCKER_ID = "runBlocker";
const PI_ID = "pi";

var myDedicatedWorker;
var mySharedWorker;

if (window.Worker) {
  myDedicatedWorker = new Worker(new URL("./modules/dw.js", import.meta.url), {
    type: "module",
    name: "myDedicatedWorker",
  });

  mySharedWorker = new SharedWorker(
    new URL("data-url:./modules/sharedWorker.js", import.meta.url),
    {
      type: "module",
      name: "mySharedWorker",
    }
  );

  myDedicatedWorker.onmessage = (event) => {
    const message = event.data;
    switch (message.type) {
      case "piResult":
        signalIdleState(message.value);
        break;
      default:
        break;
    }
  };

  mySharedWorker.port.onmessage = (event) => {
    const message = event.data;

    switch (message.type) {
      case "setRunning":
        signalRunningState();
        break;
      case "piResult":
        signalIdleState(message.value);
        break;
      default:
        break;
    }
  };

  mySharedWorker.port.start();

  console.log("Registered Worker 'myDedicatedWorker': ", myDedicatedWorker);
  console.log("Registered Worker 'mySharedWorker': ", mySharedWorker);
} else {
  console.error("Your Webbrowser does not support Web Workers😒 based!");
}

/**
 * Update UI to state "running"
 */
function signalRunningState() {
  const blockerElem = document.getElementById(BLOCKER_ID);
  blockerElem.innerHTML = "running";
  blockerElem.className = "running";
}

/**
 * Show the approximate value for π and update UI to state "idle".
 * @param {*} guess
 */
function signalIdleState(guess) {
  console.log(
    `We know π ≅ ${guess.pi} bounded by [${guess.piMin}, ${guess.piMax}]`
  );

  //update UI
  const blockerElem = document.getElementById(BLOCKER_ID);
  const piElem = document.getElementById(PI_ID);
  blockerElem.innerHTML = "idle";
  blockerElem.className = "idle";
  piElem.innerHTML = `π ≅ ${guess.pi}`;
}

function incCounter() {
  var counter = document.getElementById(COUNTER_ID);
  var value = Number(counter.innerHTML) + 1;
  counter.innerHTML = value;
}

function runBlocker(seconds) {
  signalRunningState();
  setTimeout(() => {
    block(5.0);
  }, 100); /* 100ms seams to be a reasonable delay for the browser to update the blockerElem */
}

function block(seconds) {
  const execElem = document.getElementById(EXECUTION_MODE_ID);
  const executionMode = execElem.options[execElem.selectedIndex].text;

  if (executionMode === "shared worker") {
    mySharedWorker.port.postMessage({ type: "block", value: 5 });
  } else if (executionMode === "dedicated worker") {
    myDedicatedWorker.postMessage({ type: "block", value: 5 });
  } else {
    /* progressive degrade to single threaded behavior */
    let guess = giveMePi(5);
    signalIdleState(guess);
  }
}

//Implementation of a clock.
//The display of time fades in and out, which is realized by changing the css class.
var toggle = true;
var localTime = TIME_FORMAT.format(new Date());
function updateClock() {
  const now = TIME_FORMAT.format(new Date());
  if (now !== localTime) {
    localTime = now;
    const clockElem = document.getElementById(CLOCK_ID);
    clockElem.innerHTML = localTime;
    if (toggle) {
      clockElem.classList.add("fade");
    } else {
      clockElem.classList.remove("fade");
    }
    toggle = !toggle;
  }
}

/* set up to user interface */
document.getElementById(CLOCK_ID).innerHTML = localTime;
document.getElementById(INC_COUNTER_ID).addEventListener("click", incCounter);
document
  .getElementById(RUN_BLOCKER_ID)
  .addEventListener("click", () => runBlocker(5.0));

// run updateClock periodically
setInterval(updateClock, 19);
