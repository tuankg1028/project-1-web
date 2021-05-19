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
    return await this.API.post("/EM/predict", payload).catch(console.error);
  }
}

export default Prediction;
