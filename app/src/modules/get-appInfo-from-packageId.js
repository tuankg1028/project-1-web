require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import moment from "moment";
import _ from "lodash";
import csv from "csvtojson";
import Helpers from "../helpers";
import path from "path";
import fs from "fs";

var gplay = require("google-play-scraper");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

var categoryGroups = {
  Beauty: ["Beauty", "Lifestyle"],
  Business: ["Business"],
  Education: ["Education", "Educational"],
  Entertainment: ["Entertainment", "Photography"],
  Finance: [
    "Finance",
    "Events",
    "Action",
    "Action & Adventure",
    "Adventure",
    "Arcade",
    "Art & Design",
    "Auto & Vehicles",
    "Board",
    "Books & Reference",
    "Brain Games",
    "Card",
    "Casino",
    "Casual",
    "Comics",
    "Creativity",
    "House & Home",
    "Libraries & Demo",
    "News & Magazines",
    "Parenting",
    "Pretend Play",
    "Productivity",
    "Puzzle",
    "Racing",
    "Role Playing",
    "Simulation",
    "Strategy",
    "Trivia",
    "Weather",
    "Word",
  ],
  "Food & Drink": ["Food & Drink"],
  "Health & Fitness": ["Health & Fitness"],
  "Maps & Navigation": ["Maps & Navigation"],
  Medical: ["Medical"],
  "Music & Audio": [
    "Music & Audio",
    "Video Players & Editors",
    "Music & Video",
    "Music",
  ],
  Shopping: ["Shopping"],
  Social: ["Social", "Dating", "Communication"],
  Sports: ["Sports"],
  Tools: ["Tools", "Personalization"],
  "Travel & Local": ["Travel & Local"],
};

function getCategoryName(originalCategoryName) {
  for (const categoryName in categoryGroups) {
    const categoryMeannings = categoryGroups[categoryName];

    if (categoryMeannings.includes(originalCategoryName)) return categoryName;
  }
  return;
}

async function main() {
  // getInfoForApp();
  // await getLabelsAndKeyValueForApp();
  // update functions and apis for app
  // await getFunctionsApisForApps(); /////
  // update group static and dynamic
  // await updateGroupStaticAndDynamic();
  // await getHostPath();

  updateThirdPartyAndPurpose();
}
main();

async function updateThirdPartyAndPurpose() {
  console.log("RUNNING updateThirdPartyAndPurpose");
  const { DATA_COLLECTION_PURPOSE } = process.env;

  let labelData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/Downloads/Purpose_Third_party.csv");

  const appsHP = {};
  await new Promise((resolve, reject) => {
    var readline = require("linebyline"),
      rl = readline(DATA_COLLECTION_PURPOSE);
    rl.on("line", function (line, lineCount, byteCount) {
      // do something with the line of text
      const app = JSON.parse(line);

      if (app) {
        if (!appsHP[app.app]) appsHP[app.app] = [];

        const label = labelData.find(
          (item) => item[1] === app.host && item[2] === app.path
        );

        if (label) {
          appsHP[app.app].push({
            host: app.host,
            path: app.path,
            stt: label[3],
            thirdParty: label[4],
            purpose: label[5],
          });
        }
      }
    })
      .on("error", function (e) {})
      .on("close", function (e) {
        resolve();
      });
  });

  for (const appId in appsHP) {
    const rows = appsHP[appId];

    console.log(appId);
    await Models.App.updateOne(
      {
        appIdCHPlay: appId,
      },
      {
        thirdPartiesHP: _.uniq(_.map(rows, "thirdParty")),
        purposesHP: _.uniq(_.map(rows, "purpose")),
      }
    );
  }
  console.log("DONE");
}
async function updateGroupStaticAndDynamic() {
  console.log("Running");

  let apps = await Models.App.find({
    isExistedMobiPurpose: true,
    isCompleted: true,
    nodes: { $exists: true }, //
    dataTypes: { $exists: true }, //
  });

  let file2 = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/file2.csv"));

  const promises = [];
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];

    let groupStatic = [];
    let groupDynamic = [];

    // static
    app.staticApis.forEach((api) => {
      const apiRow = file2.find((item) => item[2] === api);

      if (apiRow) {
        const dataType = apiRow[1];
        const dataTypeInGroupIndex = groupStatic.findIndex(
          (item) => item.name === dataType
        );

        if (dataTypeInGroupIndex === -1) {
          groupStatic.push({
            name: dataType,
            apis: [
              {
                name: api,
                constants: [],
                subs: [],
              },
            ],
          });
        } else {
          groupStatic[dataTypeInGroupIndex].apis.push({
            name: api,
            constants: [],
            subs: [],
          });
        }
      }
    });

    app.staticFunctions.forEach((constant) => {
      const constantRow = file2.find(
        (item) => item[4] === constant && app.staticApis.includes(item[2])
      );

      if (constantRow) {
        const dataType = constantRow[1];

        const api = constantRow[2];

        const dataTypeInGroupIndex = groupStatic.findIndex(
          (item) => item.name === dataType
        );

        const dataTypeInGroup = groupStatic[dataTypeInGroupIndex];
        const apiInGroupIndex = dataTypeInGroup.apis.findIndex(
          (item) => item.name === api
        );
        groupStatic[dataTypeInGroupIndex].apis[apiInGroupIndex].constants.push(
          constant
        );
        groupStatic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs.push(
          constantRow[7]
        );
        groupStatic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs = _.uniq(
          groupStatic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs
        );
      }
    });

    // dynamic
    app.dynamicApis.forEach((api) => {
      const apiRow = file2.find((item) => item[2] === api);

      if (apiRow) {
        const dataType = apiRow[1];
        const dataTypeInGroupIndex = groupDynamic.findIndex(
          (item) => item.name === dataType
        );

        if (dataTypeInGroupIndex === -1) {
          groupDynamic.push({
            name: dataType,
            apis: [
              {
                name: api,
                constants: [],
                subs: [],
              },
            ],
          });
        } else {
          groupDynamic[dataTypeInGroupIndex].apis.push({
            name: api,
            constants: [],
            subs: [],
          });
        }
      }
    });

    app.dynamicFunctions.forEach((constant) => {
      const constantRow = file2.find(
        (item) => item[4] === constant && app.dynamicApis.includes(item[2])
      );

      if (constantRow) {
        const dataType = constantRow[1];

        const api = constantRow[2];

        const dataTypeInGroupIndex = groupDynamic.findIndex(
          (item) => item.name === dataType
        );

        const dataTypeInGroup = groupDynamic[dataTypeInGroupIndex];
        const apiInGroupIndex = dataTypeInGroup.apis.findIndex(
          (item) => item.name === api
        );
        groupDynamic[dataTypeInGroupIndex].apis[apiInGroupIndex].constants.push(
          constant
        );
        groupDynamic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs.push(
          constantRow[7]
        );
        groupDynamic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs = _.uniq(
          groupDynamic[dataTypeInGroupIndex].apis[apiInGroupIndex].subs
        );
      }
    });

    delete app.createdAt;
    delete app.updatedAt;
    const isExisted = await Models.AppFunction.findById(app.id);

    promises.push(
      Models.App.updateOne(
        {
          _id: app.id,
        },
        {
          dynamicGroup: JSON.stringify(groupDynamic),
          staticGroup: JSON.stringify(groupStatic),
        }
      )
    );
    if (isExisted) {
      promises.push(
        Models.AppFunction.updateOne(
          {
            _id: app.id,
          },
          {
            ...app.toJSON(),
            dynamicGroup: JSON.stringify(groupDynamic),
            staticGroup: JSON.stringify(groupStatic),
          }
        )
      );
    } else {
      promises.push(
        Models.AppFunction.create({
          _id: app.id,
          ...app.toJSON(),
          dynamicGroup: JSON.stringify(groupDynamic),
          staticGroup: JSON.stringify(groupStatic),
        })
      );
    }
  }

  await Promise.all(promises);
  console.log("DONE");
}
async function getInfoForApp() {
  console.log("RUNNING");

  let packageIds = require("../../data/packageIds.json");
  let packageIdsChunks = _.chunk(packageIds, 100);

  // packageIds = packageIds.slice(500, 600);
  console.log("Total package ids", packageIds.length);

  for (let i = 0; i < packageIdsChunks.length; i++) {
    console.log(`Running ${i}/${packageIdsChunks.length}`);
    const packageIdsChunk = packageIdsChunks[i];

    let apps = await Promise.all(
      packageIdsChunk.map((packageId) =>
        gplay.app({ appId: packageId.trim().toLowerCase() }).catch((_) => null)
      )
    );
    // filter not found app
    apps = apps.filter((app) => !!app);
    console.log("Total apps from CHPlay", apps.length);

    // get category
    apps = apps.map((app) => ({
      ...app,
      categoryName: getCategoryName(app.genre),
    }));
    console.log("Total app that has category", apps.length);

    // filter not found category
    apps = apps.filter((app) => !!app.categoryName);

    // check existed in db
    apps = await Promise.all(
      apps.map((app) =>
        Models.App.findOne({
          appName: app.title.toLowerCase(),
        }).then((appDB) => ({
          ...app,
          isExisted: !!appDB,
        }))
      )
    );

    apps = apps.filter((app) => app.isExisted);
    await Promise.all(
      apps.map((app) =>
        Models.App.updateOne(
          {
            appName: app.title.toLowerCase(),
          },
          { isExistedMobiPurpose: true, appIdCHPlay: app.appId }
        )
      )
    );
    // filter out not existed
    // apps = apps.filter((app) => !app.isExisted);
    // console.log("Total apps not in db", apps.length);
    // apps = apps.map((app) => ({
    //   appName: app.title.toLowerCase(),
    //   categoryName: app.categoryName,
    //   developer: app.developer,
    //   updatedDate: moment(app.updated).utc().format("MMMM DD, YYYY"),
    //   description: app.description,
    //   version: app.version,
    //   size: app.size,
    //   installs: app.installs,
    //   minInstalls: app.minInstalls,
    //   maxInstalls: app.maxInstalls,
    //   privacyLink: app.privacyPolicy,
    //   chplayLink: app.url,
    //   appIdCHPlay: app.appId,
    //   CHPlayLink: app.url,
    //   supplier: "mobipurpose",
    //   isCompleted: false,
    //   isCompletedJVCode: false,
    // }));

    // console.log("Creating apps into db");
    // await Promise.all(apps.map((app) => Models.App.create(app)));
  }
  console.log("Done");
}
// getInfoForApp();

async function getLabelsAndKeyValueForApp() {
  console.log("Running");
  let file2 = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/file2.csv"));
  const { DATA_COLLECTION_PURPOSE } = process.env;
  let file1 = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/file1-key-value-type.csv"));
  const appsKeyValues = {};

  await new Promise((resolve, reject) => {
    var readline = require("linebyline"),
      rl = readline(DATA_COLLECTION_PURPOSE);
    rl.on("line", function (line, lineCount, byteCount) {
      // do something with the line of text
      const app = JSON.parse(line);
      if (app && app.data) {
        for (const key in app.data) {
          const value = app.data[key];
          let valType = value.split("|");
          const valueOfKey = valType[0];

          valType.splice(0, 1);
          valType.splice(-1, 1);

          !appsKeyValues[app.app] && (appsKeyValues[app.app] = []);
          appsKeyValues[app.app].push(`${key.trim()}: ${valueOfKey.trim()}`);

          console.log(appsKeyValues);
        }
      }
    })
      .on("error", function (e) {})
      .on("close", function (e) {
        resolve();
      });
  });
  return;
  const apps = await Models.App.find({
    isExistedMobiPurpose: true,
    isCompleted: true,
    keyAndValue: { $exists: false },
  });

  for (let i = 0; i < apps.length; i++) {
    console.log(`Running ${i}/${apps.length}`);
    const app = apps[i];
    const { nodes } = app;
    const functionsInfiles = [];

    if (!appsKeyValues[app.appIdCHPlay]) continue;

    file2.forEach((item, index) => {
      const [, , , , functionItem] = item;
      if (index === 0 || !functionItem) return;

      if (_.map(nodes, "name").includes(functionItem)) {
        functionsInfiles.push(item);
      }
    });

    // label in file 2
    let lables = _.uniq(_.map(functionsInfiles, 7)).filter((item) => !!item);
    lables = lables.map((item) => item.trim());

    const keyValuesFile1 = file1.filter((item) => {
      if (!item[3]) return false;

      return appsKeyValues[app.appIdCHPlay].includes(item[3].trim());
    });

    // label in file 1
    const lablesInFile1 = _.uniq(_.map(keyValuesFile1, 4));

    // get in and out
    const result = { in: [], out: [] };
    lables.forEach((label) => {
      if (!label) return;
      lablesInFile1.includes(label)
        ? result.in.push(label)
        : result.out.push(label);
    });
    await Models.App.updateOne(
      {
        _id: app.id,
      },
      {
        $set: {
          dataTypes: lables,
          keyAndValue: _.uniq(appsKeyValues[app.appIdCHPlay]),
        },
      },
      {},
      (err, data) =>
        Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
    );
  }
  console.log("DONE");
  return;
}
// getLabelsAndKeyValueForApp();

// getFunctionsApisForApps();
async function getFunctionsApisForApps() {
  console.log("Running getFunctionsApisForApps");
  let file1 = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/file1-key-value-type.csv"));
  let file2 = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/file2.csv"));
  const apps = await Models.App.find({
    _id: {
      $in: [
        "602973a6163e554ddd9a7b5c",
        // "60297f85163e554ddd9aa45d",
        // "60299854163e554ddd9aeb0d",
      ],
    },
    isExistedMobiPurpose: true,
    isCompleted: true,
    nodes: { $exists: true }, //
    dataTypes: { $exists: true }, //
  }).limit(100);

  const dataTypeInFile1 = _.map(file1, 4).filter(
    (item) => !!(item || "").trim()
  );

  console.log("dataTypeInFile1", dataTypeInFile1);
  console.log("Total apps: {getFunctionsApisForApps}");
  const promises = [];
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    console.log(`Running ${i}/${apps.length}`);

    const { nodes, dataTypes } = app;
    let functionsInfiles = [];

    file2.forEach((item, index) => {
      const [, , , , functionItem] = item;
      if (index === 0 || !functionItem) return;

      if (_.map(nodes, "name").includes(functionItem.trim())) {
        functionsInfiles.push(item);
      }
    });

    const functionsInfiles2 = functionsInfiles.filter((item) =>
      dataTypes.includes(item[7].trim())
    );

    const functionsInfiles1 = functionsInfiles2.filter((item) =>
      dataTypeInFile1.includes(item[7].trim())
    );

    functionsInfiles2 = functionsInfiles2.filter((item) => {
      return !_.map(functionsInfiles1, 0).includes(item[0]);
    });

    const dynamicFunctions = _.uniq(_.map(functionsInfiles1, 4));
    const dynamicApis = _.uniq(_.map(functionsInfiles1, 2));

    const staticFunctions = _.uniq(_.map(functionsInfiles2, 4));
    const staticApis = _.uniq(_.map(functionsInfiles2, 2));

    delete app.createdAt;
    delete app.updatedAt;
    const isExisted = await Models.AppFunction.findById(app.id);

    console.log({ dynamicFunctions, dynamicApis, staticFunctions, staticApis });
    return;
    promises.push(
      Models.App.updateOne(
        {
          _id: app.id,
        },
        {
          $set: { dynamicFunctions, dynamicApis, staticFunctions, staticApis },
        },
        {},
        (err, data) =>
          Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
      )
    );

    if (isExisted) {
      promises.push(
        Models.AppFunction.updateOne(
          {
            _id: app.id,
          },
          {
            $set: {
              ...app,
              dynamicFunctions,
              dynamicApis,
              staticFunctions,
              staticApis,
            },
          },
          {},
          (err, data) =>
            Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
        )
      );
    } else {
      promises.push(
        Models.AppFunction.create({
          _id: app.id,
          ...app,
          dynamicFunctions,
          dynamicApis,
          staticFunctions,
          staticApis,
        })
      );
    }
  }

  await Promise.all(promises);
  console.log("Done");
}

async function getHostPath() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "host",
      title: "Host",
    },
    {
      id: "path",
      title: "Path",
    },
    {
      id: "count",
      title: "So luong apps",
    },
  ];
  let rows = [];

  const { DATA_COLLECTION_PURPOSE } = process.env;
  const result = [];

  await new Promise((resolve, reject) => {
    var readline = require("linebyline"),
      rl = readline(DATA_COLLECTION_PURPOSE);
    rl.on("line", function (line, lineCount, byteCount) {
      // do something with the line of text
      const app = JSON.parse(line);
      if (app) {
        const index = result.findIndex(
          (item) => item.host === app.host && item.path === app.path
        );

        if (~index) {
          result[index].count[app.app]
            ? null
            : (result[index].count[app.app] = 1);
        } else {
          result.push({
            host: app.host,
            path: app.path,
            count: {
              [app.app]: 1,
            },
          });
        }
      }
    })
      .on("error", function (e) {})
      .on("close", function (e) {
        resolve();
      });
  });

  rows = result.map((item, index) => {
    return {
      stt: index + 1,
      ...item,
      count: _.sum(Object.values(item.count)),
    };
  });

  const csvWriter = createCsvWriter({
    path: "./output/host-path.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE host path");
}
