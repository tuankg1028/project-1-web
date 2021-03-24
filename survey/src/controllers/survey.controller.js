import Models from "../models";
import _ from "lodash";
import replaceall from "replaceall";
import mongoose from "mongoose";
import rq from "request-promise";
import Utils from "../utils";

class SurveyController {
  async handleIntroSurvey(req, res, next) {
    try {
      // const { id: userId, isAnswerd } = req.user;
      req.session.surveyApp = req.body;
      // const questions = [];
      // const surveyApp = req.session.surveyApp;
      // for (const key in surveyApp) {
      //   const surveyAppValue = surveyApp[key];

      //   if (key !== "categories" && key !== "groupSurvey") {
      //     questions.push({
      //       name: key,
      //       response: surveyAppValue
      //     });
      //   }
      // }

      // await Models.User.update(
      //   {
      //     _id: userId
      //   },
      //   {
      //     $set: {
      //       questions,
      //       isAnswerd: true,
      //       groupSurvey: req.body.groupSurvey
      //     }
      //   }
      // );

      res.redirect("/questions");
    } catch (error) {
      next(error);
    }
  }

  async getSuccess(req, res, next) {
    try {
      res.render("survey/templates/survey-success");
    } catch (error) {
      next(error);
    }
  }

  async handleAnswer(req, res, next) {
    try {
      const { _id: userId } = req.user;
      // get questions (intro)
      const data = JSON.parse(req.body.data);

      // const data = Utils.Function.objectToArray(req.body);
      const apps = [];
      for (const appId in data.questions) {
        // nodes
        const nodes = data.questions[appId];
        const { name: appName } = await Models.App.findById(appId).cache(
          60 * 60 * 24 * 30
        ); // 1 month

        // loop nodes
        const nodeData = [];
        for (const nodeName in nodes) {
          if (
            nodeName === "group" ||
            nodeName === "final" ||
            nodeName === "time"
          )
            continue;

          const leafNodes = nodes[nodeName];
          // leaf node
          const leafNodesData = [];
          for (const leafNodeName in leafNodes) {
            if (leafNodeName === "group" || leafNodeName === "final") continue;

            const leafNodeValue = leafNodes[leafNodeName];
            leafNodesData.push({
              name: leafNodeName,
              response: leafNodeValue
            });
          }

          nodeData.push({
            name: nodeName,
            // response: leafNodes.final,
            leafNodes: leafNodesData
          });
        }
        // data
        apps.push({
          name: appName,
          appId,
          time: nodes.time,
          nodes: nodeData,
          response: nodes.final
        });
      }

      // categories
      let categories = [];
      if (Array.isArray(data.categories)) {
        categories = data.categories;
      } else {
        categories = data.categories ? [data.categories] : [];
      }
      // create
      await Models.Answer.create({
        apps,
        userId,

        comment: data.comment,
        categories
      });

      res.json({
        message: "Created successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req, res, next) {
    try {
     
      // const { id: userId, isAnswerd, groupSurvey } = req.user;

      let questions = await Models.App.find().limit(20)
        .select("_id")
        .cache(60 * 60 * 24 * 30); // 1 month;


      

      const token = req.session.token;

      res.render("survey/templates/survey-question", {
        questions,
        token
      });
    } catch (error) {
      // next(error);
    }
  }

  async getQuestion(req, res, next) {
    try {
      const { id, index } = req.params;
      let question = await Models.App.findById(id)
        .cache(60 * 60 * 24 * 30); // 1 month;

      question = question.toJSON();

      if(!question.apis) {
        let apis = await Promise.all(question.nodes.map(Utils.Function.getAPIFromNode));
        apis = _.uniqBy(apis, "name")

        question.apis = apis
      }
      

      res.render("survey/templates/survey-question-ajax", {
        question,
        indexQuestion: index
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppComment(req, res, next) {
    try {
      let { data: apps } = req.body;
      apps = JSON.parse(apps);

      const questions = [];
      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        let question = await Models.App.findOne({
          appId: app.appId
        })
          .populate({
            path: "nodes",
            match: { name: { $nin: ["Storage", "Time"] } }
          })
          .cache(60 * 60 * 24 * 30); // 1 month;

        question = question.toJSON();

        question.description = replaceall("/n", "</br>", question.description);
        question.indexQuestion = app.indexQuestion;
        question.selectedLevel = app.selectedLevel;
        question.selectedLevelName =
          app.selectedLevel == 1
            ? "Very Low"
            : app.selectedLevel == 2
            ? "Low"
            : app.selectedLevel == 3
            ? "Neutral"
            : app.selectedLevel == 4
            ? "High"
            : app.selectedLevel == 5
            ? "Very High"
            : "";
        questions.push(question);
      }
      res.render("survey/templates/survey-app-comment-ajax", {
        questions
      });
      // res.json(data);
      // throw new Error();
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      let users = await Models.User.find({}, "email fullName").populate({
        path: "answers",
        select: { _id: 1 }
      });
      let content = "";
      for (let i = 0; i < users.length; i++) {
        const { email, fullName, answers } = users[i];

        if (answers.length > 0) {
          content += `<div>${fullName}-${email}</div>`;
        }
      }
      res.send(content);
    } catch (error) {
      next(error);
    }
  }
}
// (new SurveyController()).getQuestions()
export default SurveyController;
