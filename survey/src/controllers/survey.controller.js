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

      let questions = await Models.App.find({
        appName: {
          $in: [
            "truecaller: phone caller id, spam blocking & chat",
            "mi music",
            "huawei backup",
            "file manager : free and easily",
            "tiktok",
            "linkedin: jobs, business news & social networking",
            "hicare",
            "microsoft teams",
            "spotify: listen to podcasts & find music you love",
            "zoom cloud meetings"
          ]
          // ["incredible health", "microsoft teams"],
        }
      });

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
      let question = await Models.App.findById(id);
      // .cache(60 * 60 * 24 * 30); // 1 month;
      question = question.toJSON();

      if (!question.personalDataTypes || !question.personalDataTypes.length) {
        let apis = await Promise.all(
          question.nodes.map(Utils.Function.getAPIFromNode)
        );
        apis = _.uniqBy(apis, "name");

        const groupApis = _.groupBy(apis, "parent");

        let personalDataTypes = [];
        for (const personalDataTypeId in groupApis) {
          const parent = await Models.Tree.findById(personalDataTypeId);

          const personalDataTypeApiIds = groupApis[personalDataTypeId];

          const personalDataTypeApis = await Promise.all(
            personalDataTypeApiIds.map(id => Models.Tree.findById(id))
          );

          personalDataTypes.push({
            name: parent.name,
            apis: personalDataTypeApis
          });
        }

        question.personalDataTypes = personalDataTypes;
        await Models.App.updateOne(
          { _id: id },
          { $set: { personalDataTypes } }
        ).then(console.log);
      }

      question.personalDataTypes = question.personalDataTypes.map(
        personalDataType => {
          const apis = personalDataType.apis.reduce((acc, item) => {
            const newAPi = Utils.Function.getGroupApi(item);
            if (newAPi) acc.push(newAPi);

            return acc;
          }, []);

          return {
            ...personalDataType,
            ...(Utils.Function.getPersonalDataType(personalDataType) || {}),
            apis: _.uniqBy(apis, "groupName"),
            originalApis: personalDataType.apis
          };
        }
      );

      question.personalDataTypes;

      question.collectionData = JSON.parse(question.collectionData);
      question.collectionData = question.collectionData.filter(
        item => item.children.length > 0
      );
      question.thirdPartyData = JSON.parse(question.thirdPartyData);
      question.thirdPartyData = question.thirdPartyData.filter(
        item => item.children.length > 0
      );

      question.retentionData = JSON.parse(question.retentionData);

      // Using all collected data to collection
      let collectionCollectedData = {
        name: "Using all collected data",
        children: []
      };
      question.collectionData.map(category => {
        category.children = category.children.filter(child => {
          if (child.meanings.length === 0) {
            const indexChild = collectionCollectedData.children.findIndex(
              item => item.name === category.name
            );
            if (~indexChild) {
              collectionCollectedData.children[indexChild].meanings.push({
                groupKeyword: child.name,
                type: "all",
                meanings: []
              });
            } else {
              collectionCollectedData.children.push({
                type: "all",
                name: `${category.name}`,
                meanings: [
                  { groupKeyword: child.name, meanings: [], type: "all" }
                ]
              });
            }

            return false;
          }
          return true;
        });
      });
      question.collectionData = question.collectionData.filter(
        category => category.children.length
      );
      if (collectionCollectedData.children.length) {
        question.collectionData.push(collectionCollectedData);
      }

      // Using all collected data to third party
      let thirdPartyCollectedData = {
        name: "Sharing all collected data",
        children: []
      };
      question.thirdPartyData.map(category => {
        category.children = category.children.filter(child => {
          if (child.meanings.length === 0) {
            const indexChild = thirdPartyCollectedData.children.findIndex(
              item => item.name === category.name
            );
            if (~indexChild) {
              thirdPartyCollectedData.children[indexChild].meanings.push({
                groupKeyword: child.name,
                type: "all",
                meanings: []
              });
            } else {
              thirdPartyCollectedData.children.push({
                name: `${category.name}`,
                meanings: [
                  { groupKeyword: child.name, meanings: [], type: "all" }
                ]
              });
            }
            return false;
          }
          return true;
        });
      });
      question.thirdPartyData = question.thirdPartyData.filter(
        category => category.children.length
      );
      if (thirdPartyCollectedData.children.length) {
        question.thirdPartyData.push(thirdPartyCollectedData);
      }

      // add "User profile" to personalDataTypes
      if (question.collectionData.length || question.thirdPartyData.length) {
        question.personalDataTypes.push({
          name: "User profile",
          mean:
            "By accessing this data, the app can collect basic user info (standard info, such as name, age, gender), or identity info, such as phone number, or user’s interests, such as sports, art, gaming, traveling.",
          originalApis: [
            {
              name: "com.google.android.gms.plus"
            },
            {
              name: "com.google.api.services.people.v1"
            },
            {
              name: "com.google.api.services.people.v1.model"
            }
          ],
          apis: [
            {
              groupName: "Account information",
              mean:
                "The app collects basic personal data such as full name, age, gender, etc, plus information on social network (e.g., work, education, friend list, family members),  or biometric data."
            }
          ]
        });
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
        let question = await Models.App.findById(app.appId).cache(
          60 * 60 * 24 * 30
        ); // 1 month;
        question = question.toJSON();

        if (!question.personalDataTypes || !question.personalDataTypes.length) {
          let apis = await Promise.all(
            question.nodes.map(Utils.Function.getAPIFromNode)
          );
          apis = _.uniqBy(apis, "name");

          const groupApis = _.groupBy(apis, "parent");

          let personalDataTypes = [];
          for (const personalDataTypeId in groupApis) {
            const parent = await Models.Tree.findById(personalDataTypeId);

            const personalDataTypeApiIds = groupApis[personalDataTypeId];

            const personalDataTypeApis = await Promise.all(
              personalDataTypeApiIds.map(id => Models.Tree.findById(id))
            );

            personalDataTypes.push({
              name: parent.name,
              apis: personalDataTypeApis
            });
          }

          question.personalDataTypes = personalDataTypes;
          await Models.App.updateOne(
            { _id: id },
            { $set: { personalDataTypes } }
          ).then(console.log);
        }

        questions.push({
          ...question,
          ...app
        });
      }
      res.render("survey/templates/survey-app-comment-ajax", {
        questions
      });
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
