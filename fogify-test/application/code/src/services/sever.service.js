import axios from "axios";

// const { CLOUD_SERVER_URL } = process.env;

// const API = axios.create({
//   baseURL: "",
//   timeout: 1000,
//   headers: { "X-Custom-Header": "foobar" },
// });

const sendData = async (data) => {
  return axios
    .post("http://fogify_cloud-server.internet:8000/", data)
    .then(() => console.log("Edge sent data to cloud"))
    .catch(console.log);
};

export default {
  sendData,
};
