import { giveMePi } from "./madhava-leibniz";

onmessage = (event) => {
  const message = event.data;

  switch (message.type) {
    case "message":
      console.log(message.value);
      break;
    case "block":
      let guess = giveMePi(message.value);
      postMessage({ type: "piResult", value: guess });
      break;

    default:
      break;
  }
};
