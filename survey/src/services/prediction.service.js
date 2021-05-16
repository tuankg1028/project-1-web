import jwt from "jsonwebtoken";
import axios from "axios";
class Prediction {
  constructor() {
    this.API = axios.create({
      baseURL: "http://localhost:5000",
      timeout: 20000
    });
  }

  async getPredictEM(payload) {
    return await axios.post("/EM/predict", {
      data: payload,
      responseType: "stream"
    });
  }
}

export default Prediction;
