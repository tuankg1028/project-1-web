require("dotenv").config();
import Helpers from "./";
import path from "path";
import Models from "../models";
import readXlsxFile from "read-excel-file/node";
import Services from "../services";
import { create, isNumber } from "lodash";
import fs from "fs";
import pLimit from "p-limit";
import rimraf from "rimraf";
import { v4 as uuidv4 } from "uuid";
const escapeStringRegexp = require("escape-string-regexp");
var gplay = require("google-play-scraper");

import _ from "lodash";

const { execSync } = require("child_process");

const { MAPPING_FOLDER, SOURCE_APP, APPS_CSV_PATH } = process.env;

const initTreeOnDB = async () => {
  await Models.Tree.deleteMany();
  let root = await Models.Tree.create({
    name: "root",
    left: 1,
    right: 2,
    parent: null,
  });

  Helpers.Logger.step("Step 1: Starting to init Tree on Database");

  Helpers.Logger.step("Step 2: Get mapping data");
  const mappingFilePaths = await Helpers.File.getFilesInFolderByPath(
    MAPPING_FOLDER
  ).catch((err) =>
    Helpers.Logger.error(`Can't get mapping folder ${err.message}`)
  );
  console.log(mappingFilePaths);

  for (let i = 0; i < mappingFilePaths.length; i++) {
    const mappingFilePath = mappingFilePaths[i];

    console.log(mappingFilePath);
    await _insertLv2(root, mappingFilePath);
  }
};

const _insertLv2 = async (root, mappingFilePath) => {
  try {
    // refesh root
    root = await Models.Tree.findById(root.id);
    // update position
    await _updatePositions(root.right);

    // insert lv 1
    const subTreeLv1Name = path.basename(mappingFilePath).split(".")[0];
    Helpers.Logger.info(`Insert Sub-Tree Lv1: ${subTreeLv1Name}`);
    const subTreeLv1 = await Models.Tree.create({
      name: subTreeLv1Name,
      left: root.right,
      right: root.right + 1,
      parent: root.id,
    });

    // insert lv 2
    const xlsxData = await readXlsxFile(
      MAPPING_FOLDER + "/" + mappingFilePath
    ).catch((err) =>
      Helpers.Logger.error(`Can't get mapping file of ${subTreeLv1Name}`)
    );

    for (let i = 0; i < xlsxData.length; i++) {
      Helpers.Logger.info(`Insert Data for ${subTreeLv1Name} at row ${i}`);

      const [
        stt,
        api,
        apiMeaning,
        classNane,
        classMeaning,
        functionName,
        functionMeaning,
      ] = xlsxData[i];
      if (!isNumber(stt)) continue;

      Helpers.Logger.info(`Insert Sub-Tree Lv2: ${api}`);
      // update position
      await _updatePositions(subTreeLv1.right);
      const subTreeLv2 = await Models.Tree.findOrCreate(
        {
          name: api,
          desc: apiMeaning,
        },
        {
          left: subTreeLv1.right,
          right: subTreeLv1.right + 1,
          parent: subTreeLv1.id,
        }
      );

      // insert lv 3
      Helpers.Logger.info(`Insert Sub-Tree Lv3: ${classNane}`);
      // update position
      await _updatePositions(subTreeLv2.doc.right);
      const subTreeLv3 = await Models.Tree.findOrCreate(
        {
          name: classNane,
          desc: classMeaning,
        },
        {
          left: subTreeLv2.doc.right,
          right: subTreeLv2.doc.right + 1,
          parent: subTreeLv2.doc.id,
        }
      );

      // insert lv 4
      Helpers.Logger.info(`Insert Sub-Tree Lv4: ${functionName}`);
      // update position
      await _updatePositions(subTreeLv3.doc.right);
      await Models.Tree.findOrCreate(
        {
          name: functionName,
          desc: functionMeaning,
        },
        {
          left: subTreeLv3.doc.right,
          right: subTreeLv3.doc.right + 1,
          parent: subTreeLv3.doc.id,
        }
      );
    }
  } catch (e) {
    console.error(e);
    Helpers.Logger.error(`Insert Sub-Tree Lv2 ERROR: ${e.message}`);
  }
};
const _updatePositions = async (rightOfParent) => {
  await Models.Tree.updateMany(
    {
      right: {
        $gte: rightOfParent,
      },
    },
    {
      $inc: { right: 2 },
    }
  );
  await Models.Tree.updateMany(
    {
      left: {
        $gt: rightOfParent,
      },
    },
    {
      $inc: { left: 2 },
    }
  );
};

const initAppsOnDB = async () => {
  const limit = pLimit(50);

  // await Models.App.deleteMany();
  const categoryFolders = Helpers.Folder.getDirectories(SOURCE_APP, true);

  const promises = [];
  for (let i = 0; i < categoryFolders.length; i++) {
    const categoryFolder = categoryFolders[i];
    const filesInFolder = await Helpers.File.getFilesInFolderByPath(
      SOURCE_APP + "/" + categoryFolder
    );

    for (let j = 0; j < filesInFolder.length; j++) {
      const fileInFolder = filesInFolder[j];

      const app = await Models.App.findOne({
        name: fileInFolder,
      });

      if (app) continue;
      // create app
      promises.push(limit(() => _createApp(fileInFolder, categoryFolder)));
    }
  }
  await Promise.all(promises);
  Helpers.Logger.info("END initAppsOnDB");
};

const _createApp = async (fileInFolder, categoryFolder) => {
  const tree = await Models.Tree.find();

  Helpers.Logger.info(
    `Running on ${categoryFolder} folder - ${fileInFolder} app`
  );
  try {
    const contents = fs.readFileSync(
      SOURCE_APP + "/" + categoryFolder + "/" + fileInFolder,
      "utf8"
    );
    const treeWithBaseline = await Services.BaseLine.initBaseLineForTree(
      tree,
      contents
    );
    const result = treeWithBaseline.filter((node) => {
      return node.right - node.left === 1 && node.baseLine == 1;
    });

    // create app
    await Models.App.create({
      name: fileInFolder,
      categoryName: categoryFolder,
      nodes: result.map((item) => {
        return {
          id: item._id,
          name: item.name,
          value: item.baseLine,
        };
      }),
    });
  } catch (err) {
    console.log(err);
    Helpers.Logger.error(
      `ERROR: ${SOURCE_APP + "/" + categoryFolder + "/" + fileInFolder} app`
    );
  }
};

const initAppsOnDBByCSV = async () => {
  try {
    const data = await readXlsxFile(APPS_CSV_PATH);

    const [, ...rows] = data;

    for (let i = 0; i < rows.length; i++) {
      const app = rows[i];

      if (!app) continue;
      const appDB = await Models.App.findOne({
        name: app[1],
      });
      if (appDB) null;

      await _createAppDB(app[1]);
    }
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: initAppsOnDBByCSV");
  }
};

const initeJavaSourceCode = async () => {
  console.log("Generating source code");
  let offset = 0;
  let apps = await Models.App.find({
    id: {
      $nin: ["6030b5fea690c37f3d2a6bf1"],
    },
    $or: [
      { isCompletedJVCode: { $exists: false } },
      {
        isCompletedJVCode: false,
      },
    ],
  }).limit(100);
  do {
    try {
      offset += 100;
      const promises = [];
      const limit = pLimit(10);
      console.log(`Total apps: ${apps.length}`);
      for (let i = 0; i < apps.length; i++) {
        Helpers.Logger.info(`Running ${i + 1}/${apps.length}`);
        console.log(`${i}/${apps.length}`);
        const app = apps[i];

        const isExisted = await Models.AppTemp.findOne({
          appName: app.appName,
          type: "36k",
        });

        if (isExisted) continue;
        promises.push(
          limit(() => _createAppDBOnFile(app.id).catch(console.log))
        );
      }

      apps = await Models.App.find({
        id: {
          $nin: ["6030b5fea690c37f3d2a6bf1"],
        },
        $or: [
          { isCompletedJVCode: { $exists: false } },
          {
            isCompletedJVCode: false,
          },
        ],
      })
        .skip(offset)
        .limit(100);

      await Promise.all(promises).then(console.log);
    } catch (err) {
      console.log(err);
    }
  } while (apps && apps.length);
};
const initAppsOnDB36K = async () => {
  try {
    const limit = pLimit(2);
    // let data = fs.readFileSync(
    //   path.join(__dirname, "../../", "data/app_names(36k).txt")
    // );
    // data = JSON.parse(data);

    const promises = [];
    // for (let i = 0; i < data.length; i++) {
    //   console.log(`APP Number ${i + 1}`);
    //   const appName = data[i];

    //   // check app run
    //   const isRun = await Models.AppTemp.findOne({
    //     appName,
    //     type: "36k",
    //   });
    //   if (isRun) continue;

    //   // await _createAppDB(appName);

    //   promises.push(limit(() => _createAppDB(appName)));
    // }

    // setInterval(() => {
    //   try {
    //     execSync(
    //       "rm -rf apkTemp && mkdir apkTemp &&  rm -rf sourceTemp && mkdir sourceTemp"
    //     );
    //   } catch (err) {
    //     console.log(err);
    //     Helpers.Logger.error("ERROR: remove folder");
    //   }
    // }, 1000 * 60 * 60 * 2);
    // temp
    let apps = await Models.App.find({
      // isCompleted: false,
    });
    apps = _.sampleSize(apps, apps.length);
    // const apps = [{ id: "60376a4192e2b52f3cf84d38" }];

    for (let i = 0; i < apps.length; i++) {
      Helpers.Logger.info(`Running ${i + 1}/${apps.length}`);
      const app = apps[i];

      // await _createAppDB(app.id);
      promises.push(limit(() => _createAppDBOnFile(app.id)));
    }

    await Promise.all(promises).then(console.log);
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: initAppsOnDB36K");
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const _createAppDBOnFile = async (appIdDB) => {
  // appName
  try {
    const _createNodes = async (appIdDB) => {
      let pathFileApk;
      let apkSourcePath;
      try {
        const app = await Models.App.findById(appIdDB).cache(60 * 60 * 24 * 30);
        Helpers.Logger.step("Step 1: Get apk file from source");
        pathFileApk = _getApkFileFromSource(appIdDB, app.appName);

        if (!pathFileApk) throw new Error("Cannot find apk file");
        Helpers.Logger.step("Step 2: Parse APK to Text files by jadx");

        // execSync(`jadx -d "${apkSourcePath}" "${pathFileApk}"`);
        apkSourcePath = `/data/JavaCode/${appIdDB}`;

        if (!fs.existsSync(apkSourcePath)) execSync(`mkdir ${apkSourcePath}`);
        const jadxScript = `sh ./jadx/build/jadx/bin/jadx -d "${apkSourcePath}" "${pathFileApk}"`;
        console.log("jadxScript", jadxScript);
        execSync(jadxScript, {
          timeout: 1000 * 60 * 5, // 5 mins
        });

        await Models.AppTemp.create({
          appName: app.appName,
          type: "36k",
        });
        await Models.App.updateOne(
          {
            isCompletedJVCode: true,
          },
          {
            id: appIdDB,
          }
        );
        // Helpers.Logger.step("Step 3: Get content APK from source code");
        // const contents = await Helpers.File.getContentOfFolder(
        //   `${apkSourcePath}/sources`
        // );

        // Helpers.Logger.step("Step 4: Get base line value for leaf nodes");
        // const leafNodeBaseLines = await Services.BaseLine.initBaseLineForTree(
        //   contents
        // );

        // const functionConstants = leafNodeBaseLines.filter((node) => {
        //   return node.right - node.left === 1 && node.baseLine === 1;
        // });
        // Helpers.Logger.info(
        //   `Node data: ${JSON.stringify(functionConstants, null, 2)}`
        // );

        // const appData = {
        //   isCompleted: true,
        //   nodes: functionConstants.map((item) => {
        //     return {
        //       id: item._id,
        //       name: item.name,
        //       value: item.baseLine,
        //       parent: item.parent._id,
        //     };
        //   }),
        // };

        // Helpers.Logger.info(`APP DATA: ${JSON.stringify(appData, null, 2)}`);
        // // create app
        // await Models.App.updateOne(
        //   {
        //     _id: appIdDB,
        //   },
        //   {
        //     $set: appData,
        //   },
        //   {},
        //   (err, data) =>
        //     Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
        // );

        // // remove file and folder

        // if (fs.existsSync(apkSourcePath)) {
        //   rimraf(apkSourcePath, function () {
        //     Helpers.Logger.info("folder removed");
        //   });
        // }

        return;
        // functionConstants;
      } catch (err) {
        // console.log(err);
        // remove file and folder
        // if (fs.existsSync(apkSourcePath)) {
        //   rimraf(apkSourcePath, function () {
        //     Helpers.Logger.info("folder removed");
        //   });
        // }

        Helpers.Logger.error(`ERROR: initAppsOnDB36K on ${err.message} app`);
      }
    };

    return _createNodes(appIdDB);
  } catch (err) {
    // console.log(err);
    Helpers.Logger.error(`ERROR: initAppsOnDB36K on ${err.message} app`);
  }
};

const _createAppDB = async (appIdDB) => {
  // appName
  try {
    const _createApp = async (appName) => {
      try {
        Helpers.Logger.step("Step 1: Search apps from APK Pure");
        const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
        if (!listAppIdsFromAPKPure || !listAppIdsFromAPKPure.length)
          throw new Error("No app found from APK Pure");

        const appAPKPureId = listAppIdsFromAPKPure[0];
        Helpers.Logger.step("Step 2: Get app info from APK pure");
        const { AppId: AppIdCHPlay } = await Services.APKPure.getInfoApp(
          appAPKPureId
        );

        const appInfo = await Services.CHPLAY.getInfoApp(AppIdCHPlay);
        if (!appInfo) return;

        let appDB = await Models.App.findOne({
          appName: { $regex: escapeStringRegexp(appInfo.appName) },
        });

        // await Models.AppTemp.create({
        //   appName,
        //   type: "36k",
        // });

        if (!appDB || (appDB && !appDB.isCompleted)) {
          // create app
          if (!appDB) {
            appDB = await Models.App.create({
              ...appInfo,
              appAPKPureId,
              isCompleted: false,
            });
          }

          const data = {
            ...appInfo,
            appAPKPureId,
            id: appDB.id,
          };

          Helpers.Logger.step("App Response: ", JSON.stringify(data, null, 2));
          return {
            data,
            isExisted: false,
          };
        }

        Helpers.Logger.info("The app was existed");
        appDB = appDB.toJSON();

        Helpers.Logger.step("App Response: ", JSON.stringify(appDB, null, 2));
        return {
          data: appDB,
          isExisted: true,
        };
      } catch (err) {
        console.error(err);
        Helpers.Logger.error(`${err.message}`);
      }
    };

    const _createNodes = async (appIdDB) => {
      let pathFileApk;
      let apkSourcePath;
      try {
        Helpers.Logger.step(
          "Step 0: Get nodes " + JSON.stringify(appIdDB, null, 2)
        );
        const appDB = await Models.App.findById(appIdDB);

        const { appAPKPureId, appName, id } = appDB;
        apkSourcePath = path.join(__dirname, `../../sourceTemp/${uuidv4()}`);

        Helpers.Logger.step("Step 1: Download apk");
        // download first app
        pathFileApk = await Services.APKPure.download(
          appName,
          appAPKPureId,
          id
        );
        if (!pathFileApk) throw new Error("Cannot download apk");
        Helpers.Logger.step("Step 2: Parse APK to Text files by jadx");

        // execSync(`jadx -d "${apkSourcePath}" "${pathFileApk}"`);
        execSync(
          `sh ./jadx/build/jadx/bin/jadx -d "${apkSourcePath}" "${pathFileApk}"`
        );
        Helpers.Logger.step("Step 3: Get content APK from source code");
        const contents = await Helpers.File.getContentOfFolder(
          `${apkSourcePath}/sources`
        );

        Helpers.Logger.step("Step 4: Get base line value for leaf nodes");
        const leafNodeBaseLines = await Services.BaseLine.initBaseLineForTree(
          contents
        );

        const functionConstants = leafNodeBaseLines.filter((node) => {
          return node.right - node.left === 1 && node.baseLine === 1;
        });
        Helpers.Logger.info(
          `Node data: ${JSON.stringify(functionConstants, null, 2)}`
        );

        const appData = {
          isCompleted: true,
          nodes: functionConstants.map((item) => {
            return {
              id: item._id,
              name: item.name,
              value: item.baseLine,
              parent: item.parent._id,
            };
          }),
        };

        Helpers.Logger.info(`APP DATA: ${JSON.stringify(appData, null, 2)}`);
        // create app
        await Models.App.updateOne(
          {
            _id: appIdDB,
          },
          {
            $set: appData,
          },
          {},
          (err, data) =>
            Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
        );

        // remove file and folder

        if (fs.existsSync(apkSourcePath)) {
          rimraf(apkSourcePath, function () {
            Helpers.Logger.info("folder removed");
          });
        }

        if (fs.existsSync(pathFileApk)) {
          fs.unlinkSync(pathFileApk);
        }
        return functionConstants;
      } catch (err) {
        // remove file and folder
        if (fs.existsSync(apkSourcePath)) {
          rimraf(apkSourcePath, function () {
            Helpers.Logger.info("folder removed");
          });
        }

        if (fs.existsSync(pathFileApk)) {
          fs.unlinkSync(pathFileApk);
        }

        Helpers.Logger.error(`ERROR: initAppsOnDB36K on ${appIdDB} app`);
      }
    };
    // const appDB = await _createApp(appName);
    // Helpers.Logger.info(`App data Created: ${JSON.stringify(appDB)}`);
    // if (!appDB.data.isCompleted) {
    //   await _createNodes(appDB.data.id);
    // }
    return _createNodes(appIdDB);
  } catch (err) {
    console.log(err);
    Helpers.Logger.error(`ERROR: initAppsOnDB36K on ${appIdDB} app`);
  }
};

const updateApps = async () => {
  const _updateData = async (app) => {
    const appName = app.appName;
    Helpers.Logger.step("Step 1: Search apps from APK Pure");
    const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
    if (!listAppIdsFromAPKPure || !listAppIdsFromAPKPure.length)
      throw new Error("No app found from APK Pure");

    const appAPKPureId = listAppIdsFromAPKPure[0];

    const {
      AppId: appIdCHPlay,
      CHPlayLink,
    } = await Services.APKPure.getInfoApp(appAPKPureId);

    await Models.App.updateOne(
      {
        _id: app.id,
      },
      {
        $set: {
          appIdCHPlay,
          CHPlayLink,
        },
      },
      {},
      (err, data) =>
        Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
    );
  };
  let apps = await Models.App.find({
    isCompleted: false,
  });

  for (let i = 0; i < apps.length; i++) {
    try {
      const app = apps[i];
      _updateData(app);
    } catch (err) {
      console.log(err);
      Helpers.Logger.error(`ERROR: initAppsOnDB36K on ${appIdDB} app`);
    }
  }
};

const changeCategoryOf36kApps = async () => {
  const appsText = await fs.readFileSync(
    path.join(__dirname, "../../data/app_names(36k).txt"),
    { encoding: "utf8" }
  );
  const apps = JSON.parse(appsText);

  for (let i = 0; i < 1; i++) {
    const appName = apps[i];
    updateCategoryOfApp(appName);
  }
};

const updateCategoryOfApp = async (appName) => {
  // Helpers.Logger.step("Step 1: Search apps from APK Pure");
  // const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
  // if (!listAppIdsFromAPKPure || !listAppIdsFromAPKPure.length)
  //   throw new Error("No app found from APK Pure");

  // const appAPKPureId = listAppIdsFromAPKPure[0];
  // Helpers.Logger.step("Step 2: Get app info from APK pure");
  // const { AppId: AppIdCHPlay } = await Services.APKPure.getInfoApp(
  //   appAPKPureId
  // );

  // const appInfo = await Services.CHPLAY.getInfoApp(AppIdCHPlay);

  // console.log(appInfo);

  gplay
    .search({
      term: appName,
      num: 1,
    })
    .then(console.log, console.log);
};

const getAppsUninstall = async () => {
  const apkFiles = ThroughDirectory(
    "/home/ha/snap/skype/common/apkpure_get/top_apps_Download"
  );

  console.log("apkFiles", apkFiles);
  let apps = await Models.App.find({
    isCompleted: false,
  });

  console.log("apps", apps.length);
  apps = apps.filter((app) => {
    for (let i = 0; i < apkFiles.length; i++) {
      const apkFile = apkFiles[i];

      if (apkFile.includes(app.id)) {
        return false;
      }
    }

    return true;
  });

  const appChunks = _.chunk(apps, 500);

  console.log("appChunks", appChunks.length);
  appChunks.forEach((chunk, index) => {
    console.log("chunk", index);
    let content = "";
    chunk.forEach((app) => {
      content += `${app.appName} - ${app.developer} == ${app.id} \n`;
    });

    fs.writeFile(`./top_apps/top_apps${index + 1}.txt`, content, () => {});
  });

  console.log("DONE getAppsUninstall");
};
function ThroughDirectory(Directory, Files = []) {
  fs.readdirSync(Directory).forEach((File) => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory())
      return ThroughDirectory(Absolute, Files);
    else Files.push(Absolute);
  });

  return Files;
}

function _getApkFileFromSource(appId, appName) {
  let apkPath = "";
  const apkFilesInFolder1 = ThroughDirectory(
    "/data/apkfile/new_top_apps_Download"
  );
  const apkFilesInFolder2 = ThroughDirectory("/data/apkfile/top_apps_Download");

  // find in folder 1
  for (let i = 0; i < apkFilesInFolder1.length; i++) {
    const apkFile = apkFilesInFolder1[i];

    if (apkFile.includes(appId) || apkFile.includes(appName)) {
      apkPath = apkFile;
      break;
    }
  }
  if (apkPath) return apkPath;

  // find in folder 1
  for (let i = 0; i < apkFilesInFolder2.length; i++) {
    const apkFile = apkFilesInFolder2[i];

    if (apkFile.includes(appId) || apkFile.includes(appName)) {
      apkPath = apkFile;
      break;
    }
  }

  return apkPath;
}
export default {
  initTreeOnDB,
  initAppsOnDB,
  initAppsOnDBByCSV,
  initAppsOnDB36K,
  updateApps,
  changeCategoryOf36kApps,
  getAppsUninstall,
  initeJavaSourceCode,
};
