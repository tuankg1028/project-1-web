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
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const EXCEL_PATH = __dirname + "/" + process.env.EXCEL_PATH;
const CATEGORY_NAME_PATH = __dirname + "/" + process.env.CATEGORY_NAME_PATH;
const DAP_PATH = __dirname + "/" + process.env.DAP_PATH;
main();
async function main() {
  // Category name data
  const categoryNameData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(CATEGORY_NAME_PATH);

  await makeDir("./answer-distances");

  // Level data
  const levelDataInExcelFile = await readXlsxFile(EXCEL_PATH);
  const data = [];
  const trees = await Utils.Function.creatingTrees(levelDataInExcelFile);

  const headers = Utils.Function.createHeaders(trees);

  let users = await Models.User.find().populate({
    path: "answers"
  });

  // loop users
  for (let i = 0; i < users.length; i++) {
    const { answers, _id: userId } = users[i];
    // loop answers
    for (let j = 0; j < answers.length; j++) {
      const { apps } = answers[j];
      const rows = await Utils.Function.createRowsDistance(apps, {
        categoryNameData,
        headers,
        trees,
        DAP_PATH
      });

      const path = `./answer-distances/${userId}-${j + 1}.csv`;
      const csvWriter = createCsvWriter({
        path,
        header: headers
      });
      await csvWriter.writeRecords(rows);
    }
  }

  console.log("=== DONE ===");
}
