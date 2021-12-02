import Models from "../models";
import _ from "lodash";
import replaceall from "replaceall";
import mongoose from "mongoose";
import rq from "request-promise";
import Utils from "../utils";
import Services from "../services";
import constants from "../utils/constants";

class SurveyController {
  async getSurvey(req, res, next) {
    try {
      const { email } = req.session.user || {};

      res.render("survey/templates/survey-intro", {
        email
      });
    } catch (error) {
      next(error);
    }
  }

  async handleIntroSurvey(req, res, next) {
    try {
      const { group } = req.body;
      const user = req.user;

      await Models.User.updateOne({ _id: user.id }, { group });

      res.redirect("/");
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
      const { type, slotId, id: userId } = user;
      const answers = await Models.Answer.findOne({
        userId
      });
      if (type === "microworker" && answers && answers.questions.length === 10)
        await rq({
          method: "PUT",
          uri: `https://ttv.microworkers.com/api/v2/slots/${slotId}/submitProof`,
          headers: {
            MicroworkersApiKey:
              "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
          },
          form: "{}"
        })
          .then(function(data) {
            Models.User.update(
              {
                _id: userId
              },
              {
                isPaid: true
              }
            );
          })
          .catch(function(err) {
            console.log(err);
          });

      return res.redirect("/success");
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req, res, next) {
    try {
      const user = req.user;
      let questionIdsForUser;

      if (!user.group) res.redirect("/group");

      const refreshUser = await Models.User.findById(user.id);
      if (refreshUser.questionIds && refreshUser.questionIds.length)
        questionIdsForUser = refreshUser.questionIds;
      else {
        const categories = constants.groupCategory[user.group];
        let questions = await Promise.all(
          categories.map(category =>
            Models.App.aggregate([
              {
                $match: {
                  isCompleted: true,
                  categoryName: category,
                  isExistedMobiPurpose: true
                }
              },
              { $sample: { size: 2 } },
              { $project: { _id: 1 } }
            ])
          )
        );

        questions = questions.reduce((acc, item) => {
          acc = [...acc, ...item];
          return acc;
        }, []);

        // const questions = await Models.App.find({
        //   appName: {
        //     $in: constants.groupQuestions[user.group]
        //   }
        // }).select("_id");

        questionIdsForUser = _.map(questions, "_id");

        await Models.User.updateOne(
          {
            _id: user.id
          },
          {
            $set: {
              questionIds: questionIdsForUser
            }
          },
          {}
        );
      }

      const questions = await Promise.all(
        questionIdsForUser.map(id => Models.App.findById(id))
      );

      questions.forEach(item => {
        try {
          console.log(item.categoryName);
        } catch (err) {
          console.log(item);
        }
      });

      console.log("questionIdsForUser", questionIdsForUser);
      const token = req.session.token;
      res.render("survey/templates/survey-question", {
        questions,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async handleQuestions(req, res, next) {
    try {
      const user = req.user;
      const { questions } = req.body;

      let awnser = await Models.Answer.findOne({
        userId: user.id
      });

      if (!awnser)
        awnser = await Models.Answer.create({
          userId: user.id,
          questions: []
        });

      const { questions: oldQuestions } = awnser;

      // get answers
      const newQuestions = [...oldQuestions];
      for (const questionId in questions) {
        const responses = questions[questionId];

        const answerData = [];
        for (const questionName in responses) {
          const answerValue = responses[questionName];

          answerData.push({
            name: questionName,
            value: answerValue
          });
        }
        const indexQuestion = newQuestions.findIndex(
          item => item.id.toString() === questionId
        );
        if (~indexQuestion) {
          newQuestions[indexQuestion].responses = answerData;
        } else {
          newQuestions.push({
            _id: questionId,
            responses: answerData
          });
        }
      }

      // update anwsers
      await Models.Answer.updateOne(
        {
          _id: awnser.id
        },
        {
          $set: {
            questions: newQuestions
          }
        },
        {}
      );

      if (user.type === "microworker" && newQuestions.length === 10)
        await rq({
          method: "PUT",
          uri: `https://ttv.microworkers.com/api/v2/slots/${slotId}/submitProof`,
          headers: {
            MicroworkersApiKey:
              "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
          },
          form: "{}"
        })
          .then(function(data) {
            Models.User.update(
              {
                _id: userId
              },
              {
                isPaid: true
              }
            );
          })
          .catch(function(err) {
            console.log(err);
          });

      res.json({});
    } catch (error) {
      next(error);
    }
  }
  async getQuestion(req, res, next) {
    try {
      await Utils.Function.retry(async () => {
        const user = req.user;
        const { id, index } = req.params;
        let question = await Models.App.findById(id);
        question = question.toJSON();
        question.PPModel = JSON.parse(question.PPModel || "{}");
        question.apisModel = JSON.parse(question.apisModel || "{}");

        const category = Object.entries(constants.categoryGroups).find(item => {
          const subCategories = item[1];

          if (subCategories.includes(question.categoryName)) return true;
          return false;
        })[0];

        // personalDataTypes
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
              personalDataTypeApiIds.map(id =>
                Models.Tree.findById(id).cache(60 * 60 * 24 * 30)
              )
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
          );
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

        question.collectionData = JSON.parse(question.collectionData || "[]");
        question.collectionData = question.collectionData.filter(
          item => item.children.length > 0
        );
        question.thirdPartyData = JSON.parse(question.thirdPartyData || "[]");
        question.thirdPartyData = question.thirdPartyData.filter(
          item => item.children.length > 0
        );

        question.retentionData = JSON.parse(question.retentionData || "[]");

        // Using all collected data to collection
        let collectionCollectedData = {
          name: "Purposes that apply to all the collected data",
          children: [],
          type: "all"
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
                  meanings: []
                });
              } else {
                collectionCollectedData.children.push({
                  name: `${category.name}`,
                  meanings: [{ groupKeyword: child.name, meanings: [] }]
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
          name: "Purposes that apply to all the collected data",
          children: [],
          type: "all"
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
                  meanings: []
                });
              } else {
                thirdPartyCollectedData.children.push({
                  name: `${category.name}`,
                  meanings: [{ groupKeyword: child.name, meanings: [] }]
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

        let ourPrediction;
        let userAnswer;
        // get answers from user
        const answer = await Models.Answer.findOne({
          userId: user.id
        });
        if (answer && answer.questions && answer.questions.length) {
          const questionData = answer.questions.find(
            questionItem => questionItem.id == question.id
          );
          if (questionData) {
            userAnswer = {};
            questionData.responses.forEach(item => {
              userAnswer[item.name] = item.value;
            });
          }
        }

        const refreshUser = await Models.User.findById(user.id);
        if (index > 10 && index <= 14) {
          const tranningAppIds = refreshUser.questionIds.slice(0, index - 1);
          const tranningApps = await Promise.all(
            tranningAppIds.map(appId => Models.App.findById(appId))
          );
          console.log("Get tranning apps", tranningAppIds);
          const traningSet = tranningApps.map(tranningApp => {
            let { PPModel, apisModel, id } = tranningApp;

            PPModel = JSON.parse(PPModel);
            apisModel = JSON.parse(apisModel);

            const userAnswerQuestion = answer.questions.find(
              question => question.id === id
            );
            let questionInstallation = userAnswerQuestion.responses.find(
              item => item.name === "install"
            );
            if (!questionInstallation)
              questionInstallation = userAnswerQuestion.responses.find(
                item => item.name === "agreePredict"
              );

            if (!questionInstallation) throw Error("Answer not found");
            const label = questionInstallation.value;

            return [
              ...Object.values(PPModel).map(item => item.toString()),
              ...Object.values(apisModel).map(item => item.toString()),
              label.toString()
            ];
          });

          const testSet = [
            [
              ...Object.values(question.PPModel).map(item => item.toString()),
              ...Object.values(question.apisModel).map(item => item.toString()),
              "-1"
            ]
          ];
          // get prediction
          ourPrediction = await Services.Prediction.getPredictEM({
            train: traningSet,
            test: testSet
          });
          ourPrediction = ourPrediction[0][0];
        } else if (index > 14 && index <= 18) {
          let tranningAppIds = [];
          if (index > 14 && index <= 16)
            tranningAppIds = [
              ...refreshUser.questionIds.slice(0, 5),
              ...refreshUser.questionIds.slice(14, index - 1)
            ];
          if (index > 16 && index <= 18)
            tranningAppIds = [
              ...refreshUser.questionIds.slice(5, 10),
              ...refreshUser.questionIds.slice(16, index - 1)
            ];
          console.log("Get tranning apps", tranningAppIds);
          const traningSet = await Utils.Function.getTranningData(
            tranningAppIds,
            answer
          );

          const testSet = [
            [
              ...Object.values(question.PPModel).map(item => item.toString()),
              ...Object.values(question.apisModel).map(item => item.toString()),
              "-1"
            ]
          ];

          // get prediction
          ourPrediction = await Services.Prediction.getPredictEM({
            train: traningSet,
            test: testSet
          });
          ourPrediction = ourPrediction[0][0];
        } else if (index > 18 && index <= 22) {
          const tranningAppIds = [
            ...refreshUser.questionIds.slice(0, 10),
            ...refreshUser.questionIds.slice(19 - 1, index - 1)
          ];
          console.log("Get tranning apps", tranningAppIds);
          ourPrediction = await Utils.Function.getOurPredictionApproach3(
            tranningAppIds,
            answer,
            question
          );
        } else if (index > 22 && index <= 26) {
          const tranningAppIds = [
            ...refreshUser.questionIds.slice(0, 10),
            ...refreshUser.questionIds.slice(23 - 1, index - 1)
          ];
          console.log("Get tranning apps", tranningAppIds);
          ourPrediction = await Utils.Function.getOurPredictionApproach4(
            tranningAppIds,
            answer,
            question
          );
        }

        Utils.Logger.info(`getQuestion Step 3:: Prediction: ${ourPrediction}`);
        question.categoryName = category;

        // map group static and dynamic
        question.dynamicGroup = JSON.parse(question.dynamicGroup || "{}");
        question.staticGroup = JSON.parse(question.staticGroup || "{}");
        question.personalDataTypes = question.personalDataTypes.map(
          personalDataType => {
            const dataType = personalDataType.name;

            let dynamicDataType =
              question.dynamicGroup.find(item => item.name === dataType) || {};
            const dynamicApis = (dynamicDataType.apis || []).filter(
              item => (item.subs || []).filter(item1 => !!item1).length
            );
            personalDataType.dynamicApis = dynamicApis;

            let staticDataType =
              question.staticGroup.find(item => item.name === dataType) || {};
            const staticApis = (staticDataType.apis || []).filter(
              item => (item.subs || []).filter(item1 => !!item1).length
            );
            personalDataType.staticApis = staticApis;

            return personalDataType;
          }
        );

        res.render("survey/templates/survey-question-ajax", {
          question,
          indexQuestion: index,
          userAnswer,
          isAnswered: !!userAnswer,
          ourPrediction
        });
      }, 3);
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
