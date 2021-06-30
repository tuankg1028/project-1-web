import AuthController from "./auth.controller";
import SurveyController from "./survey.controller";
import SurveyMicroWorkerController from "./survey-micro.controller";
class Controller {
  constructor() {
    this.Auth = new AuthController();
    this.Survey = new SurveyController();
    this.SurveyMicroWorker = new SurveyMicroWorkerController();
  }
}

export default new Controller();
