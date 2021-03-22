const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
import Utils from "./src/utils";
import "./src/configs/mongoose.config";
import readXlsxFile from "read-excel-file/node";
import csv from "csvtojson";
import Models from "./src/models";
import slug from "slug";
import _ from "lodash";
const makeDir = require("make-dir");
import moment from "moment";
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
main();
const data = [
  0.32640692640692637,
  0.3748798602009611,
  0.3669433522644532,
  0.5141074611662847,
  0.6285714285714287,
  0.32255166217430364,
  0.520409982174688,
  0.38679653679653686,
  0.3095238095238095,
  0.6251082251082251,
  0.43650793650793646,
  0.31292517006802717,
  0.6404761904761905,
  0.2698412698412698,
  0.5296296296296296
];
async function main() {
  await makeDir("./thirdFolder");

  const headers = [
    {
      id: "AppId",
      title: "AppId"
    },
    {
      id: "average",
      title: "Average"
    },
    {
      id: "participant_of_feedback",
      title: "Participant of feedback"
    },
    {
      id: "time",
      title: "Time"
    },
    {
      id: "category",
      title: "Category"
    }
  ];

  // const answers = await Models.Answer.find({
  //   createdAt: {
  //     $gte: new Date("2020-05-19T18:27:58.290+00:00"),
  //     $lt: new Date("2020-05-21T18:27:58.290+00:00")
  //   }
  // });
  const answers = await Models.Answer.find({
    createdAt: {
      $gte: new Date("2020-05-22T15:45:06.071+00:00"),
      $lt: new Date("2020-06-21T18:27:58.290+00:00")
    }
  }); // 43
  console.log(answers.length);
  for (let i = 0; i < answers.length; i++) {
    console.log(i);
    const { apps, workerId } = answers[i];
    let rows = [];

    for (let j = 0; j < apps.length; j++) {
      const { appId, response, time } = apps[j];

      const appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30);

      rows.push({
        AppId: appData.appId,
        average: data[j],
        participant_of_feedback: response,
        time: moment.duration(time, "seconds").format("mm:ss"),
        category: appData.categoryName
      });
    }

    const path = `./thirdFolder/${workerId}-${i + 1}.csv`;
    const csvWriter = createCsvWriter({
      path,
      header: headers
    });
    await csvWriter.writeRecords(rows);
  }
  console.log("DONE");
}
