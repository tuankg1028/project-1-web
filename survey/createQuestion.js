const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
import Models from "./src/models";
import readXlsxFile from "read-excel-file/node";
import _ from "lodash";
import csv from "csvtojson";
import Utils from "./src/utils";
import "./src/configs/mongoose.config";

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
const DESC_FOLDER_PATH = __dirname + "/" + process.env.DESCRIPTION_FOLDER_PATH;
const GROUP_FOLDER_PATH = __dirname + "/" + process.env.GROUP_FOLDER_PATH;
const FIRST_LEVEL_FOLDER_PATH =
  __dirname + "/" + process.env.FIRST_LEVEL_FOLDER_PATH;
async function createQuestion(question) {
  let {
    appId,
    appName,
    permissions,
    categoryName,
    developers,
    description,
    data
  } = question;
  developers = _.map(developers.split(","), item => item.trim());
  const app = await Models.App.create({
    appId,
    name: appName,
    categoryName,
    developers,
    description
  });

  // create permissions
  // await Models.Permission.insertMany(
  //   permissions.map(permission => {
  //     const { keyword, detail } = permission;

  //     return {
  //       keyword,
  //       detail,
  //       appId: app.id
  //     };
  //   })
  // );

  // create group
  for (let j = 0; j < data.length; j++) {
    const { leafNodeDataBuildTree } = data[j];

    for (let k = 0; k < leafNodeDataBuildTree.length; k++) {
      const leafNode = leafNodeDataBuildTree[k];
      const groupName = leafNode.group;

      if (groupName !== null) {
        let group = await Models.Group.findOne({
          name: groupName
        });

        if (!group) {
          const {
            keywordGroup,
            descGroup
          } = await Utils.Function.getContentGroup(
            GROUP_FOLDER_PATH + `/${groupName}.txt`
          );

          group = await Models.Group.create({
            name: groupName,
            keyword: keywordGroup,
            description: descGroup
          });
        }

        leafNode.group = group._id;
      }
    }
  }
  // create node
  Models.Node.insertMany(
    _.map(data, item => {
      return {
        ...item,
        appId: app.id
      };
    })
  );

  const category = await Models.Category.findOrCreate({
    name: categoryName
  });

  await Models.App.updateOne(
    {
      _id: app._id
    },
    {
      $set: {
        category: category.doc._id
      }
    }
  );

  console.log(`DONE ${appId}`);
}
getQuestions();
async function getQuestions() {
  // await Models.App.deleteMany();
  // await Models.Category.deleteMany();
  // await Models.Permission.deleteMany();
  // await Models.Node.deleteMany();
  // await Models.Group.deleteMany();
  // await Models.Answer.deleteMany();
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

      const description = await Utils.Function.getContentTxtFile(
        DESC_FOLDER_PATH + "/" + `${appId}.txt`
      );

      // get category
      const categoryName = Utils.Function.getCategoryNameByAppId(
        appId,
        buildTreeData,
        categoryNameData
      );

      // get permissions
      // const permissions = await Utils.Function.getPermissions(
      //   appId,
      //   categoryName,
      //   appNameData,
      //   permissionDataInExcelFile.slice(),
      //   PERRMISSION_FOLDER_PATH
      // );

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
        // permissions,
        categoryName,
        developers,
        description,
        data
      };

      await createQuestion(question);
      // promisses.push(createQuestion(question));
    } catch (err) {
      console.log(err);
      Utils.Logger.error(`ERROR App ${i}`);
    }
  }
  console.log("========= DONE ===========");
  // await Promise.all(promisses);
  // await createCategories();
}
