import authRouter from "./auth.router";
import Middlewares from "../middlewares";
import Controllers from "../controllers";
import microWrokerRouter from "./micro.router";
var express = require("express");
var router = express.Router();

router.use("/auth", authRouter);
router.use("/microworker", microWrokerRouter);
/* GET home page. */
// [Middlewares.Auth.isUser]
// router.get(
//   "/",
//   // [Middlewares.Auth.isUser],
//   Controllers.Survey.getSurvey
// );
router.get("/", [Middlewares.Auth.isUser], Controllers.Survey.getQuestions);
router.post(
  "/handle-questions",
  [Middlewares.Auth.isUser],
  Controllers.Survey.handleQuestions
);

router.get(
  "/question/:id/:index",
  [Middlewares.Auth.isUser],
  Controllers.Survey.getQuestion
);

router.get(
  "/group",
  [Middlewares.Auth.isUser],
  Controllers.Survey.getSurvey
);

router.get("/success", Controllers.Survey.getSuccess);

router.post(
  "/handle-intro",
  [Middlewares.Auth.isUser],
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
