import axios from "axios";

const serviceToNetwork = {
  "mec-svc-1": "edge-net-1",
  "mec-svc-2": "edge-net-2",
};
const fogNodes = ["mec-svc-1", "mec-svc-2"];

const sendData = async (data) => {
  for (const fogNode of fogNodes) {
    await axios
      .post(`http://fogify_${fogNode}.${serviceToNetwork[fogNode]}:8000/`, data)
      .then(() => console.log("Cloud sent data to Edge"))
      .catch(() => {
        console.log(
          `NOT FOUND http://fogify_${fogNode}.${serviceToNetwork[fogNode]}:8000/`
        );
      });
  }
};

export default {
  sendData,
};
