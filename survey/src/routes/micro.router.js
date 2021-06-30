import Controllers from "../controllers";
var express = require("express");
var router = express.Router();

router.get("/:email", Controllers.SurveyMicroWorker.getQuestions);
router.post(
  "/handle-questions/:email",
  Controllers.SurveyMicroWorker.handleQuestions
);

router.get(
  "/question/:email/:id/:index",
  Controllers.SurveyMicroWorker.getQuestion
);

router.get("/success", Controllers.SurveyMicroWorker.getSuccess);

router.post("/handle-answer", Controllers.SurveyMicroWorker.handleAnswer);

router.get("/users", Controllers.SurveyMicroWorker.getUsers);
router.post(
  "/question/app-invalid",
  Controllers.SurveyMicroWorker.getAppComment
);
module.exports = router;
