import { giveMePi } from "./madhava-leibniz";

const ports = new Set();

const broadcastMessage = (message) => {
  ports.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      ports.delete(port);
    }
  });
};

onconnect = (connectEvent) => {
  const port = connectEvent.ports[0];
  port.onmessage = handleMessage;
  ports.add(port);
};

onerror = (errorEvent) => {
  console.error("Error in sharedWorker: ", errorEvent.message);
};

const handleMessage = (event) => {
  const message = event.data;
  broadcastMessage({ type: "setRunning" });
  let pi = giveMePi(message.value);
  broadcastMessage({ type: "piResult", value: pi });
};
