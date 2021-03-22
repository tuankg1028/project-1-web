const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
import "./src/configs/mongoose.config";
import Models from "./src/models";
import _, { forIn } from "lodash";
import { response } from "express";
import rq from "request-promise";
const fs = require("fs");
import csv from "csvtojson";
import slug from "slug";
import moment from "moment";
import replaceall from "replaceall";
const readline = require("readline");

import surveyCampaignApps from "./surveyCampaignApps3";

var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const makeDir = require("make-dir");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const folderName = "./Accuracy_expert";

exportAccuracy();
async function exportAccuracy() {
  const surveyApps = [
    5189,
    5443,
    5541,
    5885,
    6522,
    6716,
    8567,
    8586,
    8645,
    10878,
    10904,
    10994,
    17511,
    17528,
    17603,
    9315,
    9557,
    9694,
    11528,
    11581,
    11637,
    14029,
    14280,
    14328,
    15597,
    15672,
    15831,
    17727,
    18010,
    19043,
    106,
    513,
    589,
    697,
    864,
    973,
    1946,
    1994,
    2270,
    3136,
    3144,
    3494,
    4737,
    4785,
    4786
  ];

  await makeDir(folderName);
  await main(surveyApps); // statistics.txt
  await main2(surveyApps); // statistics_2.csv
  await statisticByApps(surveyApps); // statisticsByApps.txt
  await statisticByCategories(surveyApps); // statisticsByCategories.txt
}

async function main(surveyApps) {
  let content = "";
  let result = {};
  const answers = await Models.Answer.find({
    _id: {
      $nin: ["5f0ec5ea9d41f07fe2c2c018"]
    },
    createdAt: {
      $gte: new Date("2020-07-12") // export expert
    }
  }).cache(60 * 60 * 24 * 30);

  // const surveyApps = [];
  // console.log(1);
  // for (let i = 0; i < answers.length; i++) {
  //   const { apps } = answers[i];

  //   for (let j = 0; j < apps.length; j++) {
  //     const app = apps[j];

  //     const appData = await Models.App.findById(app.appId).cache(
  //       60 * 60 * 24 * 30
  //     ); // 43
  //     console.log(appData.appId);
  //     const isExisted = _.findIndex(surveyApps, function(o) {
  //       return o == appData.appId;
  //     });
  //     console.log(isExisted);
  //     if (isExisted === -1) surveyApps.push(appData.appId);
  //   }
  // }
  // console.log(surveyApps);
  // return;

  for (let index = 0; index < answers.length; index++) {
    const { apps, workerId } = answers[index];

    for (let j = 0; j < apps.length; j++) {
      const app = apps[j];

      const appData = await Models.App.findById(app.appId).cache(
        60 * 60 * 24 * 30
      ); // 43

      if (!result[appData.appId]) result[appData.appId] = {};
      if (!result[appData.appId][app.response])
        result[appData.appId][app.response] = 0;

      result[appData.appId][app.response]++;
    }
  }

  for (const appId in result) {
    const data = result[appId];

    content += `AppId: ${appId}     [0.5182800745415123-0.5640734026009468]: ${data[1] ||
      0}      [0.5640734026009468-0.6098667306603814]: ${data[2] ||
      0}      [0.6098667306603814-0.655660058719816]: ${data[3] ||
      0}      [0.655660058719816-0.7014533867792506]: ${data[4] ||
      0}      [0.7014533867792506-0.7472467148386853]: ${data[5] || 0} \n`;
  }
  content += "-----------------------------------\n";

  const mapAppIdsAndDistanceAndDistance = [];
  for (let i = 0; i < surveyApps.length; i++) {
    const appId = surveyApps[i];
    // app data
    const appData = await Models.App.findOne({
      appId
    }).cache(60 * 60 * 24 * 30);

    mapAppIdsAndDistanceAndDistance.push({
      appId: appData.appId,
      distance: appData.distance,
      predictionLevel: appData.predictionLevel,
      total: 0
    });
  }

  for (let index = 0; index < answers.length; index++) {
    const { apps, workerId } = answers[index];
    for (let j = 0; j < apps.length; j++) {
      const app = apps[j];

      const appData = await Models.App.findById(app.appId).cache(
        60 * 60 * 24 * 30
      ); // 43

      const indexInMapping = _.findIndex(
        mapAppIdsAndDistanceAndDistance,
        item => item.appId == appData.appId
      );

      if (
        mapAppIdsAndDistanceAndDistance[indexInMapping].predictionLevel ==
        app.response
      ) {
        mapAppIdsAndDistanceAndDistance[indexInMapping].total++;
      }
    }
  }

  let totalApp = 0;
  for (let index = 0; index < mapAppIdsAndDistanceAndDistance.length; index++) {
    const element = mapAppIdsAndDistanceAndDistance[index];
    totalApp += element.total;

    let appData = await Models.App.findOne({ appId: element.appId }).cache(
      60 * 60 * 24 * 30
    ); // 1 month
    const totalAppByAppId = await Models.Answer.count({
      createdAt: {
        $gte: new Date("2020-07-12")
      },
      "apps.appId": appData.id
    }).cache(60 * 60 * 24 * 30); // 1 month;

    content += `AppId: ${element.appId}     distance: ${
      element.distance
    }     prediction level: ${element.predictionLevel}      total: ${
      element.total
    }     percentage: ${(element.total / totalAppByAppId) * 100}%\n`;
  }

  content += ` -------------------------------------- \n
  ${(totalApp / (15 * answers.length)) * 100}%\n`;

  fs.writeFileSync(folderName + "/statistics.txt", content);

  console.log("DONE");
}
// main2();
async function main2(surveyApps) {
  const header = [];
  const records = [];
  // header.push({
  //   id: "workerId",
  //   title: "Worker Ids"
  // });
  header.push({
    id: "email",
    title: "Email"
  });

  // createHeaderFromApps(header, apps);
  header.push({
    id: slug("Number of right feedback"),
    title: "Number of right feedback"
  });
  header.push({
    id: slug("Number of wrong feedback"),
    title: "Number of wrong feedback"
  });
  header.push({
    id: slug("Percentage"),
    title: "Percentage"
  });

  header.push({
    id: slug("Percentage of wrong answer"),
    title: "Percentage of wrong answer (less than 40s)"
  });

  const mapAppIdsAndDistanceAndDistance = [];
  for (let i = 0; i < surveyApps.length; i++) {
    const appId = surveyApps[i];
    // app data
    const appData = await Models.App.findOne({
      appId
    }).cache(60 * 60 * 24 * 30);

    mapAppIdsAndDistanceAndDistance.push({
      appId: appData.appId,
      distance: appData.distance,
      predictionLevel: appData.predictionLevel,
      total: 0
    });
  }

  // console.log(mapAppIdsAndDistanceAndDistance);
  const answers = await Models.Answer.find({
    _id: {
      $nin: ["5f0ec5ea9d41f07fe2c2c018"]
    },
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);

  for (let index = 0; index < answers.length; index++) {
    const { apps, workerId, basicInfo } = answers[index];
    const record = {};
    record["email"] = basicInfo ? basicInfo.email : null;
    // record["workerId"] = workerId;

    let totalCorrect = 0;
    let totalWrongLessThan40Seconds = 0;
    for (let j = 0; j < apps.length; j++) {
      const app = apps[j];
      const appData = await Models.App.findById(app.appId).cache(
        60 * 60 * 24 * 30
      ); // 43

      const indexInMapping = _.findIndex(
        mapAppIdsAndDistanceAndDistance,
        item => item.appId == appData.appId
      );

      if (
        mapAppIdsAndDistanceAndDistance[indexInMapping].predictionLevel ==
        app.response
      ) {
        totalCorrect++;
        record[slug(app.name)] = `${app.response}-(${moment
          .duration(app.time, "seconds")
          .format("mm:ss")} T)`;
      } else {
        record[slug(app.name)] = `${app.response}-(${moment
          .duration(app.time, "seconds")
          .format("mm:ss")} F)`;

        if (app.time < 40) {
          totalWrongLessThan40Seconds++;
        }
      }
    }
    record[slug("Number of right feedback")] = totalCorrect;
    record[slug("Number of wrong feedback")] = apps.length - totalCorrect;
    record[slug("Percentage")] = `${(totalCorrect / apps.length) * 100}%`;

    record[slug("Percentage of wrong answer")] = totalWrongLessThan40Seconds
      ? `${(totalWrongLessThan40Seconds / (apps.length - totalCorrect)) * 100}%`
      : "0%";

    records.push(record);
  }

  const csvWriter = createCsvWriter({
    path: folderName + "/statistics_2.csv",
    header
  });
  await csvWriter.writeRecords(records);

  console.log("DONE");
}

function createHeaderFromApps(header, apps) {
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];

    header.push({
      id: slug(app.name),
      title: app.name
    });
  }
}

// statisticByApps();
async function statisticByApps(surveyApps) {
  const mapAppIdsAndDistanceAndDistance = [];
  for (let i = 0; i < surveyApps.length; i++) {
    const appId = surveyApps[i];
    // app data
    const appData = await Models.App.findOne({
      appId
    }).cache(60 * 60 * 24 * 30);

    mapAppIdsAndDistanceAndDistance.push({
      appId: appData.appId,
      distance: appData.distance,
      predictionLevel: appData.predictionLevel,
      total: 0
    });
  }

  const result = {};
  const answers = await Models.Answer.find({
    _id: {
      $nin: ["5f0ec5ea9d41f07fe2c2c018"]
    },
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < answers.length; i++) {
    const { apps } = answers[i];

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const appId = app.appId;

      let appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30); // 1 month
      // console.log(appData);
      if (result[appData.appId] === undefined) {
        result[appData.appId] = 0;
      }

      const predictionLevelOfApp = _.filter(
        mapAppIdsAndDistanceAndDistance,
        item => item.appId == appData.appId
      )[0].predictionLevel;

      if (app.response == predictionLevelOfApp) {
        result[appData.appId]++;
      }
    }
  }

  let content = "";
  // result
  for (const appId in result) {
    const value = result[appId];

    let appData = await Models.App.findOne({ appId }).cache(60 * 60 * 24 * 30); // 1 month

    const totalApp = await Models.Answer.count({
      _id: {
        $nin: ["5f0ec5ea9d41f07fe2c2c018"]
      },
      createdAt: {
        $gte: new Date("2020-07-12")
      },
      "apps.appId": appData.id
    });

    content += `${appId} - ${(value / totalApp) * 100}% \n`;
  }

  fs.writeFileSync(folderName + "/statisticsByApps.txt", content);

  console.log("DONE statisticByApps");
}
// statisticByLastQuestionByApps();
async function statisticByLastQuestionByApps() {
  const result = {};
  const answers = await Models.Answer.find({
    // campaignId
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);
  for (let i = 0; i < answers.length; i++) {
    const { apps } = answers[i];

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const appId = app.appId;

      let appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30); // 1 month
      if (result[appData.appId] === undefined) {
        result[appData.appId] = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        };
      }

      result[appData.appId][app.response]++;
    }
  }

  let content = "";
  // result
  for (const appId in result) {
    const setValues = result[appId];

    let appData = await Models.App.findOne({ appId }).cache(60 * 60 * 24 * 30); // 1 month
    // const totalApp = 0;
    const totalApp = await Models.Answer.count({
      // campaignId,
      createdAt: {
        $gte: new Date("2020-07-12")
      },
      "apps.appId": appData.id
    });

    content += `App Id: ${appId} \n`;
    // content += `${appId} - ${(value / totalApp) * 100}% \n`;
    content += `   1: ${(setValues["1"] / totalApp) *
      100}%   |   2: ${(setValues["2"] / totalApp) *
      100}%    |   3: ${(setValues["3"] / totalApp) *
      100}%    |   4: ${(setValues["4"] / totalApp) *
      100}%    |   5: ${(setValues["5"] / totalApp) * 100}%\n`;
    content +=
      "---------------------------------------------------------------------- \n";
  }

  fs.writeFileSync("statisticsByQuestionByApps.txt", content);

  console.log("DONE statisticByApps");
}

// statisticByCategories();
async function statisticByCategories(surveyApps) {
  const mapAppIdsAndDistanceAndDistance = [];
  for (let i = 0; i < surveyApps.length; i++) {
    const appId = surveyApps[i];
    // app data
    const appData = await Models.App.findOne({
      appId
    }).cache(60 * 60 * 24 * 30);

    mapAppIdsAndDistanceAndDistance.push({
      appId: appData.appId,
      distance: appData.distance,
      predictionLevel: appData.predictionLevel,
      total: 0
    });
  }

  const result = {};
  const answers = await Models.Answer.find({
    _id: {
      $nin: ["5f0ec5ea9d41f07fe2c2c018"]
    },
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < answers.length; i++) {
    const { apps } = answers[i];

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const appId = app.appId;

      let appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30); // 1 month

      // console.log(appData);
      if (result[appData.categoryName] === undefined) {
        result[appData.categoryName] = {
          value: 0,
          total: 0
        };
      }

      const predictionLevelOfApp = _.filter(
        mapAppIdsAndDistanceAndDistance,
        item => item.appId == appData.appId
      )[0].predictionLevel;

      if (app.response == predictionLevelOfApp) {
        result[appData.categoryName].value++;
      }
      result[appData.categoryName].total++;
    }
  }

  let content = "";

  // result
  for (const categoryName in result) {
    const item = result[categoryName];

    // content += `${categoryName} - ${(value / (answers.length * 6)) * 100}% \n`;
    content += `${categoryName} - ${(item.value / item.total) * 100}% \n`;
  }

  fs.writeFileSync(folderName + "/statisticsByCategories.txt", content);

  console.log("DONE statisticByCategories");
}

// statisticByLastQuestionByCategories()
async function statisticByLastQuestionByCategories() {
  const result = {};
  const answers = await Models.Answer.find({
    // campaignId
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);
  for (let i = 0; i < answers.length; i++) {
    const { apps } = answers[i];

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const appId = app.appId;

      let appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30); // 1 month
      if (result[appData.appId] === undefined) {
        result[appData.appId] = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        };
      }

      result[appData.appId][app.response]++;
    }
  }

  let content = "";
  // result
  for (const appId in result) {
    const setValues = result[appId];

    let appData = await Models.App.findOne({ appId }).cache(60 * 60 * 24 * 30); // 1 month
    // const totalApp = 0;
    const totalApp = await Models.Answer.count({
      // campaignId,
      createdAt: {
        $gte: new Date("2020-07-12")
      },
      "apps.appId": appData.id
    }).cache(60 * 60 * 24 * 30); // 1 month;

    content += `App Id: ${appId} \n`;
    // content += `${appId} - ${(value / totalApp) * 100}% \n`;
    content += `   1: ${(setValues["1"] / totalApp) *
      100}%   |   2: ${(setValues["2"] / totalApp) *
      100}%    |   3: ${(setValues["3"] / totalApp) *
      100}%    |   4: ${(setValues["4"] / totalApp) *
      100}%    |   5: ${(setValues["5"] / totalApp) * 100}%\n`;
    content +=
      "---------------------------------------------------------------------- \n";
  }

  fs.writeFileSync("statisticsByQuestionByApps.txt", content);

  console.log("DONE statisticByApps");
}

// updateDistanc();
async function updateDistanc() {
  const distances = [
    {
      appId: 5189,
      distance: 0.16836734693877548,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 5443,
      distance: 0.19206349206349205,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 5541,
      distance: 0.2261904761904762,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 5885,
      distance: 0.17006802721088435,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 6522,
      distance: 0.30648754914809956,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 6716,
      distance: 0.1976190476190476,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 8567,
      distance: 0.2952380952380952,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 8586,
      distance: 0.2208333333333333,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 8645,
      distance: 0.2144901394901395,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 10878,
      distance: 0.13265306122448978,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 10904,
      distance: 0.13809523809523808,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 10994,
      distance: 0.2886243386243386,
      predictionLevel: 4,
      total: 0
    },
    {
      appId: 17511,
      distance: 0.22080498866213152,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 17528,
      distance: 0.21360544217687075,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 17603,
      distance: 0.16666666666666666,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 106,
      distance: 0.19567099567099566,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 513,
      distance: 0.22315421581476627,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 589,
      distance: 0.22315421581476627,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 697,
      distance: 0.331283422459893,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 864,
      distance: 0.3166666666666666,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 973,
      distance: 0.20844564240790656,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 1946,
      distance: 0.3305831423478482,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 1994,
      distance: 0.22712842712842715,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 2270,
      distance: 0.17261904761904762,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 3136,
      distance: 0.23048022314077363,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 3144,
      distance: 0.31071428571428567,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 3494,
      distance: 0.3270503197108701,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 4737,
      distance: 0.2476190476190476,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 4785,
      distance: 0.1759259259259259,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 4786,
      distance: 0.19387755102040813,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 9315,
      distance: 0.1976190476190476,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 9557,
      distance: 0.2937891364496869,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 9694,
      distance: 0.21360544217687075,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 11528,
      distance: 0.31137298915076694,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 11581,
      distance: 0.20396825396825397,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 11637,
      distance: 0.2126050420168067,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 14029,
      distance: 0.3207983193277311,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 14280,
      distance: 0.32130186886284445,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 14328,
      distance: 0.22712842712842715,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 15597,
      distance: 0.31071428571428567,
      predictionLevel: 5,
      total: 0
    },
    {
      appId: 15672,
      distance: 0.17195767195767195,
      predictionLevel: 1,
      total: 0
    },
    {
      appId: 15831,
      distance: 0.22910052910052908,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 17727,
      distance: 0.19404761904761905,
      predictionLevel: 2,
      total: 0
    },
    {
      appId: 18010,
      distance: 0.24509299132497034,
      predictionLevel: 3,
      total: 0
    },
    {
      appId: 19043,
      distance: 0.3305831423478482,
      predictionLevel: 5,
      total: 0
    }
  ];

  // let text = "";
  // for (let i = 0; i < distances.length; i++) {
  //   const item = distances[i];
  //   text += `App Id: ${item.appId} - ${item.predictionLevel} - ${item.distance} \n`;
  // }
  // fs.writeFileSync("./app-predictionLevel.txt", text);

  for (let i = 0; i < distances.length; i++) {
    const item = distances[i];
    await Models.App.updateMany(
      {
        appId: item.appId
      },
      {
        $set: {
          distance: item.distance,
          predictionLevel: item.predictionLevel
        }
      }
    );
  }
}

// getWorkers(); removed
async function getWorkers() {
  let header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("workerId"),
      title: "Worker Id"
    },
    {
      id: slug("country"),
      title: "Country"
    },
    {
      id: slug("time"),
      title: "Time"
    },
    {
      id: slug("times"),
      title: "Times"
    }
  ];

  let answers = await Models.Answer.find({
    // workerId: { $nin: workerIdRemoved },
    createdAt: {
      // $gte: new Date("2020-06-04"),
      // $lt: new Date("2020-06-22")
      $gte: new Date("2020-07-06"),
      $lt: new Date("2020-07-08")
    }
  }).cache(60 * 60 * 24 * 30);

  // group
  const groupAnswersByWorkerId = _.groupBy(answers, "workerId");

  const rows = [];
  let stt = 0;
  for (const workerId in groupAnswersByWorkerId) {
    console.log(workerId);
    const workerAnswers = groupAnswersByWorkerId[workerId];

    stt++;
    let worker = await rq({
      method: "GET",
      uri: `https://ttv.microworkers.com/api/v2/workers/${workerId}`,
      headers: {
        MicroworkersApiKey:
          "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
      }
    });
    worker = JSON.parse(worker);

    let totalTime = 0;
    for (let i = 0; i < workerAnswers.length; i++) {
      const workerAnswer = workerAnswers[i];

      totalTime += _.sumBy(workerAnswer.apps, "time");
    }
    totalTime = totalTime / workerAnswers.length;

    rows.push({
      stt,
      workerId,
      country: worker.location.country.name,
      time: moment.duration(totalTime, "seconds").format("mm:ss"),
      times: workerAnswers.length
    });
  }

  const csvWriter = createCsvWriter({
    path: "./workers.csv",
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE getWorkers");
}
// getWorkerInfosOnAnswer();
async function getWorkerInfosOnAnswer() {
  let header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("workerId"),
      title: "Worker Id"
    },
    {
      id: slug("age"),
      title: "age"
    },
    {
      id: slug("gender"),
      title: "gender"
    },
    {
      id: slug("education"),
      title: "education"
    },
    {
      id: slug("occupation"),
      title: "occupation"
    },
    {
      id: slug("fieldOfWork"),
      title: "fieldOfWork"
    },
    {
      id: slug("OSOfDevices"),
      title: "OSOfDevices"
    },
    {
      id: slug("email"),
      title: "Email"
    },
    {
      id: slug("country"),
      title: "Country"
    },
    {
      id: slug("country"),
      title: "Country"
    },
    {
      id: slug("percentage"),
      title: "Percentage"
    }
    // {
    //   id: slug("percentage1"),
    //   title: "Percentage exp1"
    // },
    // {
    //   id: slug("percentage2"),
    //   title: "Percentage exp2"
    // },
    // {
    //   id: slug("percentage3"),
    //   title: "Percentage exp3"
    // }
  ];
  let rows = [];

  let answers = await Models.Answer.find({
    createdAt: {
      $gte: new Date("2020-07-12")
    }
    // campaignId: { $in: ["b6a8a3ee770b", "18ed80c5dda5", "0db2ef5f76d2"] }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < answers.length; i++) {
    // const stt = i + 1;
    const {
      campaignId,
      workerId,
      apps,
      basicInfo: {
        age,
        gender,
        education,
        occupation,
        fieldOfWork,
        OSOfDevices,
        email
      }
    } = answers[i];

    // let worker = await rq({
    //   method: "GET",
    //   uri: `https://ttv.microworkers.com/api/v2/workers/${workerId}`,
    //   headers: {
    //     MicroworkersApiKey:
    //       "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
    //   }
    // });
    // worker = JSON.parse(worker);

    // get percentage
    let totalRight = 0;
    for (let j = 0; j < apps.length; j++) {
      const { response, appId } = apps[j];

      const appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30);

      if (response == appData.predictionLevel) totalRight++;
    }

    ////////////////////////////////////////////////////////////////
    // let answerTemp = await Models.Answer.findOne({
    //   workerId,
    //   basicInfo: {
    //     $ne: null
    //   }
    // }).cache(60 * 60 * 24 * 30);

    // let age, gender, education, occupation, fieldOfWork, OSOfDevices;

    // if (answerTemp) {
    //   age = answerTemp.basicInfo.age;
    //   gender = answerTemp.basicInfo.gender;
    //   education = answerTemp.basicInfo.education;
    //   occupation = answerTemp.basicInfo.occupation;
    //   fieldOfWork = answerTemp.basicInfo.fieldOfWork;
    //   OSOfDevices = answerTemp.basicInfo.OSOfDevices;
    // }

    const row = {
      // stt,
      // workerId,
      age,
      gender,
      education,
      occupation,
      fieldOfWork,
      // OSOfDevices,
      email
      // country: worker.location.country.name
    };
    // const sttCompaign =
    //   campaignId == "b6a8a3ee770b" ? 1 : campaignId == "18ed80c5dda5" ? 2 : 3;

    // row[`percentage${sttCompaign}`] = (totalRight / apps.length) * 100;

    row["percentage"] = (totalRight / apps.length) * 100;
    rows.push(row);
  }

  // rows = _.orderBy(
  //   rows,
  //   ["percentage1", "percentage2", "percentage3"],
  //   ["desc", "desc", "desc"]
  // );

  rows = _.orderBy(rows, ["percentage"], ["desc"]);

  rows = _.map(rows, (item, i) => {
    return {
      stt: i + 1,
      ...item
    };
  });

  console.log(rows);
  const csvWriter = createCsvWriter({
    path: "./workers.csv",
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE getWorkerInfosOnAnswer");
}
// get4QsWorkers();
async function get4QsWorkers() {
  let header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("workerId"),
      title: "Worker Id"
    },
    {
      id: "privacyIssue",
      title: "privacy issue"
    },
    {
      id: "satisfied",
      title: "satisfied"
    },
    {
      id: "relevantInformation",
      title: "relevant information"
    },
    {
      id: "interestedAccessingData",
      title: "interested accessing data"
    }
  ];
  const rows = [];

  let answers = await Models.Answer.find({
    campaignId: { $in: ["8d4bc8dd4e54", "577ee4cfd8ef", "15ae258569f2"] }
    // createdAt: {
    //   // $gte: new Date("2020-06-29"),
    //   // $lt: new Date("2020-07-05")
    //   $gte: new Date("2020-07-06"),
    //   $lt: new Date("2020-07-08")
    // }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < answers.length; i++) {
    const stt = i + 1;
    const {
      workerId,
      questions: [question1, question2, question3, question4]
    } = answers[i];

    rows.push({
      stt,
      workerId,
      privacyIssue: question1.response,
      satisfied: question2.response,
      relevantInformation: question3.response,
      interestedAccessingData: question4.response
    });
  }

  const csvWriter = createCsvWriter({
    path: "./workers4Q.csv",
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE getWorkerInfosOnAnswer");
}

// get4QsWorkersOverView();
async function get4QsWorkersOverView() {
  let answers = await Models.Answer.find({
    // campaignId: {
    //   $in: [
    //     "8d4bc8dd4e54",
    //     "577ee4cfd8ef",
    //     "15ae258569f2",
    //     "6f0ddec6a49b",
    //     "5556e83db68e",
    //     "2eb4190e612a",
    //     "0db2ef5f76d2",
    //     "18ed80c5dda5",
    //     "b6a8a3ee770b"
    //   ]
    // }
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);

  const result = {
    question1: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    question2: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    question3: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    question4: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  };
  for (let i = 0; i < answers.length; i++) {
    try {
      const stt = i + 1;
      const {
        workerId,
        questions: [question1, question2, question3, question4]
      } = answers[i];

      result["question1"][question1.response]++;
      result["question2"][question2.response]++;
      result["question3"][question3.response]++;
      result["question4"][question4.response]++;
    } catch (err) {
      console.log(1, answers);
    }
  }

  let content = `Number of participants: ${answers.length} \n`;
  for (const questionName in result) {
    const rows = result[questionName];

    content += `- ${questionName}: \n`;

    for (const answerKey in rows) {
      const value = rows[answerKey];
      content += `  + ${answerKey}: ${value} (${(value / answers.length) *
        100}%)\n`;
    }
  }
  fs.writeFileSync("./workers4Q-Overview(2020-07-12).txt", content);

  console.log("DONE get4QsWorkersOverView");
}

// getWorkersComments(); removed
async function getWorkersComments() {
  await makeDir("./comments");
  let header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("appId"),
      title: "App Id"
    },
    {
      id: slug("comment"),
      title: "Comment"
    }
  ];

  let answers = await Models.Answer.find({
    // workerId: { $nin: workerIdRemoved },
    // createdAt: {
    //   // $gte: new Date("2020-06-04"),
    //   // $lt: new Date("2020-06-22") // dot 3
    //   $gte: new Date("2020-07-06"),
    //   $lt: new Date("2020-07-08")
    // }
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);
  // group
  const groupAnswersByWorkerId = _.groupBy(answers, "workerId");
  // const groupAnswersByWorkerId = _.groupBy(answers, "email.basicInfo");

  for (const workerId in groupAnswersByWorkerId) {
    const workerAnswers = groupAnswersByWorkerId[workerId];
    let times = 0;
    let stt = 0;

    for (let i = 0; i < workerAnswers.length; i++) {
      const { apps } = workerAnswers[i];

      const rows = [];
      times++;
      for (let j = 0; j < apps.length; j++) {
        const app = apps[j];

        if (app.comment) {
          stt++;
          const appData = await Models.App.findById(app.appId).cache(
            60 * 60 * 24 * 30
          );

          rows.push({
            stt,
            appId: appData.appId,
            comment: app.comment
          });
        }
      }

      if (rows.length > 0) {
        const csvWriter = createCsvWriter({
          path: `./comments/${workerId} (${times}).csv`,
          header
        });
        csvWriter.writeRecords(rows);
      }
    }
  }

  console.log("DONE getWorkersComments");
}
// compareAnswers();
async function compareAnswers() {
  const header = [
    {
      id: "workerId",
      title: "Worker Id"
    },
    {
      id: "POSameV",
      title: "Percentage of same value"
    },
    {
      id: "PODiffentV",
      title: "Percentage of diffent value"
    },
    {
      id: "POPositiveV",
      title: "Percentage of positive value"
    },
    {
      id: "PONegativeV",
      title: "Percentage of negative value"
    }
  ];
  const records = [];

  // newAnswers
  const newAnswers = await Models.Answer.find({
    createdAt: {
      // $gte: new Date("2020-06-29"),
      // $lt: new Date("2020-07-04"),
      $gte: new Date("2020-07-06"),
      $lt: new Date("2020-07-08")
    }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < newAnswers.length; i++) {
    const { workerId, apps, campaignId, id } = newAnswers[i];

    const previousCampaignId = getPreviousCampaignId(campaignId);

    const previousAnswer = await getPreviousAnswer(
      workerId,
      previousCampaignId
    );

    // if answer not existed
    if (!previousAnswer) continue;

    let totalApps = 0,
      totalSameApps = 0,
      totalPositive = 0,
      totalPosNeApps = 0;

    // for apps of new answers
    for (let j = 0; j < apps.length; j++) {
      const { appId: appIdDB, response } = apps[j];

      const appData = await Models.App.findById(appIdDB).cache(
        60 * 60 * 24 * 30
      );

      const oldApp = _.filter(previousAnswer.apps, app => {
        return String(app.appId) == String(appIdDB);
      })[0];

      if (oldApp) {
        totalApps++;
        // check same
        if (oldApp.response == response) {
          totalSameApps++;
        } else {
          totalPosNeApps++;
          if (response == 3 || response == 2 || response == 1) {
            totalPositive++;
          }
        }
      }
    }

    // record
    records.push({
      workerId,
      POSameV: (totalSameApps / totalApps) * 100 + " %",
      PODiffentV: ((totalApps - totalSameApps) / totalApps) * 100 + " %",
      POPositiveV: (totalPositive / totalPosNeApps) * 100 + " %",
      PONegativeV:
        ((totalPosNeApps - totalPositive) / totalPosNeApps) * 100 + " %"
    });
  }

  const csvWriter = createCsvWriter({
    path: "./answer-comparations-exp2(3 vs 1).csv",
    header
  });
  await csvWriter.writeRecords(records);
  console.log("DONE compareAnswers");
}

function getPreviousCampaignId(campaignId) {
  let previousCampaignId;
  switch (campaignId) {
    // case "b6a8a3ee770b": // 1
    //   previousCampaignId = "2eb4190e612a";
    //   break;

    // case "18ed80c5dda5": // 2
    //   previousCampaignId = "5556e83db68e";
    //   break;

    // case "0db2ef5f76d2": // 3
    //   previousCampaignId = "6f0ddec6a49b";
    //   break;

    case "b6a8a3ee770b": // 1
      previousCampaignId = "8d4bc8dd4e54";
      break;

    case "18ed80c5dda5": // 2
      previousCampaignId = "577ee4cfd8ef";
      break;

    case "0db2ef5f76d2": // 3
      previousCampaignId = "15ae258569f2";
      break;
  }

  return previousCampaignId;
}
async function getPreviousAnswer(workerId, campaignId) {
  let previousAnswer;
  const previousAnswers = await Models.Answer.find({
    workerId,
    campaignId
  }).cache(60 * 60 * 24 * 30);

  // lay app co ti le chinh xac cao nhat
  // previousAnswers == 1
  if (previousAnswers.length == 1) {
    previousAnswer = previousAnswers[0];
  } else if (previousAnswers.length > 1) {
    let index = 0;
    let totalCorrentTemp = 0;
    // lay app co ti le chinh xac cao nhat
    for (let i = 0; i < previousAnswers.length; i++) {
      const previousAnswerData = previousAnswers[i];
      const totalCorrect = await totalCorrentApps(previousAnswerData);
      if (totalCorrect > totalCorrentTemp) {
        totalCorrentTemp = totalCorrect;
        index = i;
      }
    }
    previousAnswer = previousAnswers[index];
  } else {
    return null;
  }

  return previousAnswer;
}

async function getPreviousAnswerByCampaignId(workerId, campaignId) {
  let previousAnswer;
  const previousAnswers = await Models.Answer.find({
    workerId,
    campaignId
  }).cache(60 * 60 * 24 * 30);

  // lay app co ti le chinh xac cao nhat
  // previousAnswers == 1
  if (previousAnswers.length == 1) {
    previousAnswer = previousAnswers[0];
  } else if (previousAnswers.length > 1) {
    let index = 0;
    let totalCorrentTemp = 0;
    // lay app co ti le chinh xac cao nhat
    for (let i = 0; i < previousAnswers.length; i++) {
      const previousAnswerData = previousAnswers[i];
      const totalCorrect = await totalCorrentApps(previousAnswerData);
      if (totalCorrect > totalCorrentTemp) {
        totalCorrentTemp = totalCorrect;
        index = i;
      }
    }
    previousAnswer = previousAnswers[index];
  } else {
    return null;
  }

  return previousAnswer;
}
async function totalCorrentApps(answer) {
  const { apps, workerId } = answer;
  const record = {};
  record["workerId"] = workerId;

  let totalCorrect = 0;
  for (let j = 0; j < apps.length; j++) {
    const app = apps[j];
    const appData = await Models.App.findById(app.appId).cache(
      60 * 60 * 24 * 30
    );

    if (appData.predictionLevel == app.response) {
      totalCorrect++;
    }
  }

  return totalCorrect;
}

// workersComment10Apps();
async function workersComment10Apps() {
  const appIdsCap1 = [
    //
    5541,
    //
    //
    5189,
    //
    //
    6716,
    //
    //
    5885,
    //
    //
    8567,
    //
    //
    8586,
    //
    //
    10994,
    //
    //
    10878,
    //
    //
    17511,
    //
    //
    17528
    //
  ];
  const appIdsCap2 = [
    //
    513,
    //
    //
    589,
    //
    //
    864,
    //
    //
    697,
    //
    //
    2270,
    //
    //
    1994,
    //
    //
    3494,
    //
    //
    3136,
    //
    //
    4785,
    //
    //
    4737
    //
  ];
  const appIdsCap3 = [
    //
    9315,
    //
    //
    9694,
    //
    //
    11637,
    //
    //
    11581,
    //
    //
    14280,
    //
    //
    14029,
    //
    //
    15672,
    //
    //
    15597,
    //
    //
    18010,
    //
    //
    17727
    //
  ];

  const header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("workerId"),
      title: "Worker Id"
    }
  ];

  for (let i = 0; i < appIdsCap3.length; i++) {
    const appId = appIdsCap3[i];

    header.push({
      id: `rApp${appId}`,
      title: `Final Judgement ${appId}`
    });
    header.push({
      id: `cApp${appId}`,
      title: `Comment of ${appId}`
    });
    header.push({
      id: `catApp${appId}`,
      title: `Category of ${appId}`
    });
  }

  // console.log(header);
  let answers = await Models.Answer.find({
    campaignId: "0db2ef5f76d2"
    // createdAt: {
    //   $gte: new Date("2020-06-04"),
    //   $lt: new Date("2020-06-22")
    // }
  }).cache(60 * 60 * 24 * 30);

  const rows = [];
  for (let i = 0; i < answers.length; i++) {
    const { apps, workerId } = answers[i];
    const row = {
      stt: i + 1,
      workerId
    };

    for (let j = 0; j < apps.length; j++) {
      const { comment, response, appId } = apps[j];

      if (comment) {
        const appData = await Models.App.findById(appId).populate("category");

        row[`rApp${appData.appId}`] = response;
        row[`cApp${appData.appId}`] = comment;
        row[`catApp${appData.appId}`] = appData.category.name;
      }
    }

    rows.push(row);
  }

  const csvWriter = createCsvWriter({
    path: "./commentSurvey3.csv",
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE workersComment");
}

// compareAnswersByApps();
async function compareAnswersByApps() {
  const tenAppsOfSurvey1 = [
    5189,
    5443,
    5541,
    5885,
    6522,
    6716,
    8567,
    8586,
    8645,
    10878,
    10904,
    10994,
    17511,
    17528,
    17603
  ];

  const campaignIds = ["8d4bc8dd4e54", "577ee4cfd8ef", "15ae258569f2"];
  const campaignIdsCompared = ["b6a8a3ee770b", "18ed80c5dda5", "0db2ef5f76d2"];

  const header = [
    {
      id: "appId",
      title: "App Id"
    },
    {
      id: "POSameV",
      title: "Total of same value"
    },
    {
      id: "PODiffentV",
      title: "Total of diffent value"
    },
    {
      id: "POPositiveV",
      title: "Total of positive value"
    },
    {
      id: "PONegativeV",
      title: "Total of negative value"
    }
  ];

  const headerCategory = [
    {
      id: "categoryName",
      title: "Category Name"
    },
    {
      id: "POSameV",
      title: "Total of same value"
    },
    {
      id: "PODiffentV",
      title: "Total of diffent value"
    },
    {
      id: "POPositiveV",
      title: "Total of positive value"
    },
    {
      id: "PONegativeV",
      title: "Total of negative value"
    }
  ];

  const records = [];

  const result = {};
  // newAnswers
  const newAnswers = await Models.Answer.find({
    campaignId: {
      $in: campaignIds
    }
  }).cache(60 * 60 * 24 * 30);

  for (let i = 0; i < newAnswers.length; i++) {
    const { workerId, apps, campaignId: campaignIdAnswer, id } = newAnswers[i];

    // return;
    const campaignIdCompared =
      campaignIdsCompared[
        _.findIndex(campaignIds, campaignId => campaignId === campaignIdAnswer)
      ];
    const previousAnswer = await getPreviousAnswerByCampaignId(
      workerId,
      campaignIdCompared
    );

    // if answer not existed
    if (!previousAnswer) continue;

    let totalApps = 0,
      totalSameApps = 0,
      totalPositive = 0,
      totalPosNeApps = 0;

    // for apps of new answers
    for (let j = 0; j < apps.length; j++) {
      const { appId: appIdDB, response } = apps[j];

      const appData = await Models.App.findById(appIdDB).cache(
        60 * 60 * 24 * 30
      );

      // init
      if (!result[appData.appId]) {
        result[appData.appId] = {
          same: 0,
          diff: 0,
          pos: 0,
          neg: 0,
          total: 0
        };
      }

      // for (let k = 0; k < previousAnswer.apps.length; k++) {
      //   const element = previousAnswer.apps[k];

      //   const appData1 = await Models.App.findById(apps[k].appId).cache(
      //     60 * 60 * 24 * 30
      //   );
      //   console.log(3, appData1.appId);
      // }
      // return;
      const oldApp = _.filter(previousAnswer.apps, async app => {
        return String(app.appId) == String(appIdDB);
      })[0];

      if (oldApp) {
        // totalApps++;
        result[appData.appId].total++;
        // check same
        if (oldApp.response == response) {
          // totalSameApps++;
          result[appData.appId].same++;
        } else {
          // totalPosNeApps++;
          result[appData.appId].diff++;
          if (oldApp.response > response) {
            result[appData.appId].neg++;
          } else {
            result[appData.appId].pos++;
          }
        }
      }
    }
    // record
    // records.push({
    //   workerId,
    //   POSameV: (totalSameApps / totalApps) * 100 + " %",
    //   PODiffentV: ((totalApps - totalSameApps) / totalApps) * 100 + " %",
    //   POPositiveV: (totalPositive / totalPosNeApps) * 100 + " %",
    //   PONegativeV:
    //     ((totalPosNeApps - totalPositive) / totalPosNeApps) * 100 + " %"
    // });
  }

  for (const appId in result) {
    const value = result[appId];

    records.push({
      appId,
      POSameV: `${value.same} (${(value.same / value.total) * 100}%)`,
      PODiffentV: `${value.diff} (${(value.diff / value.total) * 100}%)`,
      POPositiveV: `${value.pos} (${(value.pos / (value.pos + value.neg)) *
        100}%)`,
      PONegativeV: `${value.neg} (${(value.neg / (value.pos + value.neg)) *
        100}%)`
    });
  }

  // const csvWriter = createCsvWriter({
  //   path: "./apps-exp-comparation(1 vs 2).csv",
  //   header
  // });
  // await csvWriter.writeRecords(records);

  // result for category
  let resultCategory = [];
  const recordsCategory = [];
  for (const appId in result) {
    const value = result[appId];

    const appData = await Models.App.findOne({
      appId
    }).cache(60 * 60 * 24 * 30);

    resultCategory.push({
      ...value,
      appId,
      categoryName: appData.categoryName
    });
  }
  resultCategory = _.groupBy(resultCategory, "categoryName");

  for (const categoryName in resultCategory) {
    const value = resultCategory[categoryName];

    let totalApps = _.sumBy(value, "total"),
      totalSameApps = _.sumBy(value, "same"),
      totalDiffApps = _.sumBy(value, "diff"),
      totalPositive = _.sumBy(value, "pos"),
      totalPosNeApps = _.sumBy(value, "neg");

    recordsCategory.push({
      categoryName,
      POSameV: `${totalSameApps} (${(totalSameApps / totalApps) * 100}%)`,
      PODiffentV: `${totalDiffApps} (${(totalDiffApps / totalApps) * 100}%)`,
      POPositiveV: `${totalPositive} (${(totalPositive /
        (totalPositive + totalPosNeApps)) *
        100}%)`,
      PONegativeV: `${totalPosNeApps} (${(totalPosNeApps /
        (totalPositive + totalPosNeApps)) *
        100}%)`
    });
  }

  // app
  const csvWriter = createCsvWriter({
    path: "./apps-exp-comparation(1 vs 3).csv",
    header
  });
  await csvWriter.writeRecords(records);
  // category
  const csvWriterCategory = createCsvWriter({
    path: "./category-exp-comparation(1 vs 3).csv",
    header: headerCategory
  });
  await csvWriterCategory.writeRecords(recordsCategory);
  console.log("DONE compareAnswersByApps");
}

// {createdAt: {  $gte: new Date("2020-07-12")}, apps: {$elemMatch: {appId: ObjectId('5e8dd82a8bbbaf3f50623548')} }}
// ramdomAnswers();
async function ramdomAnswers() {
  const groupSurvey = 3;
  const totalAnswers = 10;

  const appIds = appsOfSurvey1[`exp${groupSurvey}`];

  for (let f = 0; f < totalAnswers; f++) {
    const totalOfAppsWrong = _.random(0, 3); // 0 - 3
    const wrongAppIds = _.sampleSize(appIds, totalOfAppsWrong);
    // console.log(wrongAppIds);

    const appsData = [];
    for (let i = 0; i < appIds.length; i++) {
      const responses = [1, 2, 3, 4, 5];
      const appId = appIds[i];
      const appQuestionData = await getQuestion(appId);

      // predictionLevel
      const predictionLevel = appQuestionData.predictionLevel;
      // response
      let response = appQuestionData.predictionLevel;

      // is wrong app
      if (_.includes(wrongAppIds, appId)) {
        _.remove(responses, item => item == predictionLevel);

        response = _.sample(responses);
      }

      const nodesData = [];
      for (let j = 0; j < appQuestionData.nodes.length; j++) {
        const node = appQuestionData.nodes[j];

        const leafNodesData = [];
        for (let k = 0; k < node.leafNodeDataBuildTree.length; k++) {
          const leafNode = node.leafNodeDataBuildTree[k];

          leafNodesData.push({
            name: leafNode.name,
            response: _.random(1, 5)
          });
        }
        nodesData.push({
          name: node.name,
          response: _.random(1, 5),
          leafNodes: leafNodesData
        });
      }
      appsData.push({
        name: appQuestionData.name,
        appId: appQuestionData._id,
        response,
        time: _.random(200, 400),
        nodes: nodesData
      });
    }

    await Models.Answer.create({
      campaignId: "RD_SV1",
      apps: appsData,
      // userId,
      questions: [
        {
          name: "privacy issue",
          response: 5
        },
        {
          name: "satisfied",
          response: 1
        },
        {
          name: "relevant information",
          response: 4
        },
        {
          name: "interested accessing data",
          response: 5
        }
      ],
      // basicInfo,
      groupSurvey
      // categories
    });
  }
}

async function getQuestion(appId) {
  try {
    let question = await Models.App.findOne({
      appId
    })
      .populate({
        path: "nodes",
        match: { name: { $nin: ["Storage", "Time"] } }
      })
      .cache(60 * 60 * 24 * 30); // 1 month;

    question = question.toJSON();

    const nodes = [];
    for (let j = 0; j < question.nodes.length; j++) {
      const node = question.nodes[j];
      node.description = replaceall("/n", "</br>", node.description);
      const questionsNode = _.groupBy(node.leafNodeDataBuildTree, "group");
      const keysQuestion = Object.keys(questionsNode);
      node.questions = {};
      // group
      const keyIds = _.filter(keysQuestion, function(o) {
        return o !== "null";
      });
      const groups = [];
      for (let k = 0; k < keyIds.length; k++) {
        const groupId = keyIds[k];
        let group = await Models.Group.findById(groupId).cache(
          60 * 60 * 24 * 30
        ); // 1 month;
        group = group.toJSON();

        groups.push({
          ...group,
          questionData: questionsNode[groupId]
        });
      }
      node.questions.groups = groups;

      // add nodes if length group > 0
      if (groups.length > 0) {
        nodes.push(node);
      }
    }
    question.nodes = nodes;

    return question;
  } catch (error) {
    console.error(error);
  }
}

// expertComments();
async function expertComments() {
  const header = [
    {
      id: slug("stt"),
      title: "STT"
    },
    {
      id: slug("email"),
      title: "Email"
    },
    {
      id: slug("age"),
      title: "Age"
    },
    {
      id: slug("surveyId"),
      title: "Survey Id"
    }
  ];

  // for (let i = 0; i < appIdsCap3.length; i++) {
  //   const appId = appIdsCap3[i];

  //   header.push({
  //     id: `rApp${appId}`,
  //     title: `Final Judgement ${appId}`
  //   });
  //   header.push({
  //     id: `cApp${appId}`,
  //     title: `Comment of ${appId}`
  //   });
  //   header.push({
  //     id: `catApp${appId}`,
  //     title: `Category of ${appId}`
  //   });
  // }

  // console.log(header);
  let answers = await Models.Answer.find({
    // campaignId: "0db2ef5f76d2"
    // createdAt: {
    //   $gte: new Date("2020-06-04"),
    //   $lt: new Date("2020-06-22")
    // }
    createdAt: {
      $gte: new Date("2020-07-12")
    }
  }).cache(60 * 60 * 24 * 30);

  const rows = [];
  for (let i = 0; i < answers.length; i++) {
    const {
      apps,
      basicInfo: { email, age }
    } = answers[i];

    // appDataToCheck
    const appDataToCheck = await Models.App.findById(apps[0].appId).cache(
      60 * 60 * 24 * 30
    );
    const isSurvey1 = _.findIndex(appsOfSurvey1.exp1, function(item) {
      return item == appDataToCheck.appId;
    });
    let surveyId = 0;
    if (isSurvey1 != -1) {
      surveyId = 1;
    } else {
      const isSurvey2 = _.findIndex(appsOfSurvey1.exp2, function(item) {
        return item == appDataToCheck.appId;
      });

      if (isSurvey2 != -1) {
        surveyId = 2;
      } else {
        const isSurvey3 = _.findIndex(appsOfSurvey1.exp3, function(item) {
          return item == appDataToCheck.appId;
        });
        if (isSurvey3 != -1) {
          surveyId = 3;
        }
      }
    }
    // surveyId
    const row = {
      stt: 400 + i,
      email,
      age,
      surveyId
    };

    for (let j = 0; j < apps.length; j++) {
      const { comment, response, appId } = apps[j];

      const appData = await Models.App.findById(appId)
        .populate("category")
        .cache(60 * 60 * 24 * 30);
      const isExistedHeader = _.find(header, function(o) {
        return o.id == `rlApp${appData.appId}`;
      });
      if (!isExistedHeader) {
        header.push({
          id: `rlApp${appData.appId}`,
          title: `Risk level ${appData.appId}`
        });
        header.push({
          id: `cApp${appData.appId}`,
          title: `Comment of ${appData.appId}`
        });
      }

      // if (comment) {
      // row[`rApp${appData.appId}`] = response;
      row[`rlApp${appData.appId}`] = response;
      row[`cApp${appData.appId}`] = comment;
      // }
    }

    rows.push(row);
  }

  const csvWriter = createCsvWriter({
    path: "./expertComments.csv",
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE expertComments");
}
