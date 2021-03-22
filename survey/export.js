const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
import Utils from "./src/utils";
import "./src/configs/mongoose.config";
import readXlsxFile from "read-excel-file/node";
import csv from "csvtojson";
import Models from "./src/models";
import slug from "slug";
import _ from "lodash";
const fs = require("fs");

const makeDir = require("make-dir");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const EXCEL_PATH = __dirname + "/" + process.env.EXCEL_PATH;
const CATEGORY_NAME_PATH = __dirname + "/" + process.env.CATEGORY_NAME_PATH;
test();
async function test() {
  const data = await readXlsxFile("/Users/a1234/Downloads/new_interface.xlsx");
  let text = "";
  for (let i = 0; i < data.length; i++) {
    const [appId] = data[i];
    text += appId + ",";
  }
  console.log(text);
}
// main();
async function main() {
  // Category name data
  const categoryNameData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(CATEGORY_NAME_PATH);
  await makeDir("./answers");

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

      const rows = await Utils.Function.createRows(
        apps,
        categoryNameData,
        headers
      );

      await makeDir("./answers/general");
      const path = `./answers/general/${userId}-${j + 1}.csv`;
      const csvWriter = createCsvWriter({
        path,
        header: headers
      });
      await csvWriter.writeRecords(rows);

      // ========= export by group ==========

      const groups = _.groupBy(headers, "group");
      for (const groupName in groups) {
        if (groupName) {
          // headers
          const groupHeaders = [
            {
              id: slug("AppId"),
              title: "AppId"
            }
          ];
          const groupRows = [];
          const leafNodes = groups[groupName];
          // headers
          for (let k = 0; k < leafNodes.length; k++) {
            const leafNode = leafNodes[k];
            // header
            groupHeaders.push({ id: leafNode.id, title: leafNode.title });
            // categories
          }
          groupHeaders.push({
            id: slug("categories"),
            title: "Categories"
          });
          // node
          groupHeaders.push({
            id: slug(groupName),
            title: groupName
          });

          // label
          groupHeaders.push({
            id: slug("app"),
            title: "Labels",
            group: ""
          });

          // DONE HEADERS

          //
          for (let k = 0; k < rows.length; k++) {
            const groupRow = {};
            const row = rows[k];
            groupRow["AppId"] = row["AppId"];

            for (let g = 0; g < leafNodes.length; g++) {
              const leafNode = leafNodes[g];

              // row
              groupRow[leafNode.id] = row[leafNode.id];
            }
            // categories
            groupRow[slug("categories")] = row[slug("categories")];
            // node
            groupRow[slug(groupName)] =
              row[slug(groupName)] * 5 == 1 || row[slug(groupName)] * 5 == 2
                ? 1
                : row[slug(groupName)] * 5 == 3
                ? 2
                : 3;
            // label
            groupRow[slug("app")] = row[slug("app")];
            // push rows
            groupRows.push(groupRow);
          }

          // create file
          await makeDir(`./answers/${groupName}`);
          const csvWriter = createCsvWriter({
            path: `./answers/${groupName}/${userId}-${j + 1}.csv`,
            header: groupHeaders
          });
          await csvWriter.writeRecords(groupRows);
        }
      }
    }
  }

  console.log("=== DONE ===");
}
async function createTxtFileContainGroupsInNode(headers) {
  const groupByFirstLevel = _.groupBy(headers, "firstLevelName");
  let content = "";
  // console.log(groupByFirstLevel);
  for (const firstLevelName in groupByFirstLevel) {
    if (firstLevelName !== "undefined") {
      const values = groupByFirstLevel[firstLevelName];

      content += `- ${firstLevelName} \n`;

      for (let i = 0; i < values.length; i++) {
        const node = values[i];
        content += `  + ${node.title}\n`;
      }
    }
  }

  fs.writeFileSync("./groupsInNode.txt", content);
}
// createRowsFirstLevelAndOneFiles();
async function createRowsFirstLevelAndOneFiles() {
  // Category name data
  const categoryNameData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(CATEGORY_NAME_PATH);
  await makeDir("./answers-firstLevelAndOneLeafNode(CASE 2)");
  await makeDir("./answers-firstLevelAndOneLeafNode(CASE 1)");
  // Level data
  const levelDataInExcelFile = await readXlsxFile(EXCEL_PATH);
  const data = [];
  const trees = await Utils.Function.creatingTreesWithGroup(
    levelDataInExcelFile
  );
  const headers = await Utils.Function.createHeadersWithGroup(trees);

  await createTxtFileContainGroupsInNode(headers);

  let users = await Models.User.find({
    _id: "5ead1f51609fa6158673bd55"
  }).populate({
    path: "answers"
  });

  // loop users
  for (let i = 0; i < users.length; i++) {
    const { answers, _id: userId } = users[i];
    console.log(1, answers.length);
    // loop answers
    for (let j = 0; j < answers.length; j++) {
      const { apps } = answers[j];

      const rows = await Utils.Function.createRowsFirstLevelAndOneLeafNode(
        apps,
        categoryNameData,
        headers,
        false
      );

      // const headerKeys = Object.keys(rows[0]);
      // const customHeaders = _.filter(headers, header => {
      //   return _.indexOf(headerKeys, header.id) >= 0;
      // });

      await makeDir("./answers-firstLevelAndOneLeafNode(CASE 2)/general");
      const path = `./answers-firstLevelAndOneLeafNode(CASE 2)/general/${userId}-${j +
        1}.csv`;
      const csvWriter = createCsvWriter({
        path,
        header: headers
      });
      await csvWriter.writeRecords(rows);

      // ========== CASE 1
      const rows2 = await Utils.Function.createRowsFirstLevelAndOneLeafNode(
        apps,
        categoryNameData,
        headers,
        true
      );

      // const headerKeys = Object.keys(rows[0]);
      // const customHeaders = _.filter(headers, header => {
      //   return _.indexOf(headerKeys, header.id) >= 0;
      // });

      await makeDir("./answers-firstLevelAndOneLeafNode(CASE 1)/general");
      const path2 = `./answers-firstLevelAndOneLeafNode(CASE 1)/general/${userId}-${j +
        1}.csv`;
      const csvWriter2 = createCsvWriter({
        path: path2,
        header: headers
      });
      await csvWriter2.writeRecords(rows2);
    }
  }

  console.log("=== DONE ===");
}
