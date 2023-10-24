import { giveMePi } from "./madhava-leibniz";

onmessage = (event) => {
  const message = event.data;

  switch (message.type) {
    case "message":
      console.log(message.value);
      break;
    case "block":
      console.log("time to block");
      let guess = giveMePi(message.value);
      postMessage({ type: "piResult", result: guess });
      console.log("done Blocking");
      break;

    default:
      break;
  }
};
