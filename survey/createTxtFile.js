const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
import readXlsxFile from "read-excel-file/node";
import _ from "lodash";
import csv from "csvtojson";
import Utils from "./src/utils";
import "./src/configs/mongoose.config";
const fs = require("fs");

const EXCEL_PATH = __dirname + "/" + process.env.EXCEL_PATH;
const DISTANCE_CATEGORIES_PATH =
  __dirname + "/" + process.env.DISTANCE_CATEGORIES_PATH;
const APP_NAMES_PATH = __dirname + "/" + process.env.APP_NAMES_PATH;
const CATEGORY_NAME_PATH = __dirname + "/" + process.env.CATEGORY_NAME_PATH;
const BUILD_TREE_CATEGORIES_PATH =
  __dirname + "/" + process.env.BUILD_TREE_CATEGORIES_PATH;
const DAP_PATH = __dirname + "/" + process.env.DAP_PATH;
const PERRMISSION_FOLDER_PATH =
  __dirname + "/" + process.env.PERRMISSION_FOLDER_PATH;
const PERRMISSION_EXCEL_PATH =
  __dirname + "/" + process.env.PERRMISSION_EXCEL_PATH;
const INTERFACE_PATH = __dirname + "/" + process.env.INTERFACE_PATH;
const GROUP_FOLDER_PATH = __dirname + "/" + process.env.GROUP_FOLDER_PATH;
const FIRST_LEVEL_FOLDER_PATH =
  __dirname + "/" + process.env.FIRST_LEVEL_FOLDER_PATH;
const outputDir = "./output-apps";
async function createFile(question) {
  let {
    appId,
    appName,
    permissions,
    categoryName,
    developers,
    description,
    data
  } = question;

  // create group
  for (let j = 0; j < data.length; j++) {
    const { leafNodeDataBuildTree } = data[j];

    for (let k = 0; k < leafNodeDataBuildTree.length; k++) {
      const leafNode = leafNodeDataBuildTree[k];
      const groupName = leafNode.group;

      if (groupName !== null) {
        const { keywordGroup } = await Utils.Function.getContentGroup(
          GROUP_FOLDER_PATH + `/${groupName}.txt`
        );

        leafNode.group = groupName;
      }
    }
  }

  const app = {
    appId,
    name: appName,
    categoryName,
    category: {
      name: categoryName
    },
    developers,
    description,
    nodes: data
  };

  for (let j = 0; j < app.nodes.length; j++) {
    const node = app.nodes[j];

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

      groups.push({
        name: groupId,
        questionData: questionsNode[groupId]
      });
    }
    node.questions.groups = groups;
  }

  // content
  let content = "";
  for (let i = 0; i < app.nodes.length; i++) {
    const node = app.nodes[i];
    content += `* ${node.group} \n`;

    for (let j = 0; j < node.questions.groups.length; j++) {
      const group = node.questions.groups[j];

      content += ` - ${group.name} \n`;

      for (let k = 0; k < group.questionData.length; k++) {
        const leafNode = group.questionData[k];

        content += `  + ${leafNode.name} \n`;
      }
    }
  }
  const outputPath = `./${outputDir}/${appId}.txt`;

  fs.writeFileSync(outputPath, content);
  // console.log(app);
  console.log(`DONE ${appId}`);
}
getQuestions();
async function getQuestions() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const interfaceDataInExcelFile = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(INTERFACE_PATH);

  const [, ...interfaceRows] = interfaceDataInExcelFile;

  // Level data
  const levelDataInExcelFile = await readXlsxFile(EXCEL_PATH);
  // Tree level
  const trees = await Utils.Function.creatingTrees(levelDataInExcelFile);
  const rootNodeNames = _.map(trees.children, "name");

  const dataForFirstLevel = await Utils.Function.getDataForFirstLevel(
    rootNodeNames,
    FIRST_LEVEL_FOLDER_PATH
  );

  // Category name data
  const categoryNameData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(CATEGORY_NAME_PATH);
  // App name data
  const appNameData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(APP_NAMES_PATH);

  // permission excel data
  const permissionDataInExcelFile = await readXlsxFile(PERRMISSION_EXCEL_PATH);

  // Build tree Data
  const buildTreeData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(BUILD_TREE_CATEGORIES_PATH);

  // Question
  const promisses = [];
  // ============== LOOP ROWS IN DISTANCE ================
  for (let i = 0; i < interfaceRows.length; i++) {
    try {
      const [appId, appName, developers] = interfaceRows[i];

      // get category
      const categoryName = Utils.Function.getCategoryNameByAppId(
        appId,
        buildTreeData,
        categoryNameData
      );

      const treeClone = Utils.Function.cloneObject(trees);
      const data = await Utils.Function.getDataForQuestion(
        appId,
        treeClone,
        buildTreeData,
        { categoryName, DAP_PATH, dataForFirstLevel }
      );

      const question = {
        appId,
        appName,
        categoryName,
        data
      };
      // await createFile(question);
      promisses.push(createFile(question));
    } catch (err) {
      console.log(err);
      Utils.Logger.error(`ERROR App ${i}`);
    }
  }

  await Promise.all(promisses);
  console.log("========= DONE ===========");
  // await createCategories();
}
