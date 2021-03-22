import authRouter from "./auth.router";
import Middlewares from "../middlewares";
import Controllers from "../controllers";
var express = require("express");
var router = express.Router();

router.use("/auth", authRouter);
/* GET home page. */
// [Middlewares.Auth.isUser]
router.get(
  "/",
  // [Middlewares.Auth.isUser],
  Controllers.Survey.getQuestions
);
router.get(
  "/questions",
  // [Middlewares.Auth.isUser],
  Controllers.Survey.getQuestions
);

router.get("/question/:id/:index", Controllers.Survey.getQuestion);

router.get("/success", Controllers.Survey.getSuccess);

router.post(
  "/handle-intro",
  // [Middlewares.Auth.isUser],
  Controllers.Survey.handleIntroSurvey
);

router.post(
  "/handle-answer",
  [Middlewares.Auth.isUser],
  Controllers.Survey.handleAnswer
);

router.get("/users", Controllers.Survey.getUsers);
router.post("/question/app-invalid", Controllers.Survey.getAppComment);
module.exports = router;
