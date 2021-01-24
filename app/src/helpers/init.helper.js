require("dotenv").config();
import Helpers from "./";
import path from "path";
import Models from "../models";
import readXlsxFile from "read-excel-file/node";
import Services from "../services";
import { create, isNumber } from "lodash";
import fs from "fs";
import pLimit from "p-limit";
import url from "url";
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
    console.log(APPS_CSV_PATH);
    const data = await readXlsxFile(APPS_CSV_PATH);

    const [, ...rows] = data;

    let promises = rows.map(async (app) => {
      if (!app) return null;
      const appDB = await Models.App.findOne({
        name: app[1],
      });
      if (appDB) null;

      return _createAppByCSV(app);
    });

    const limit = pLimit(10);
    promises = promises.map((promise) => limit(() => promise));
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: initAppsOnDBByCSV");
  }
};

const _createAppByCSV = async (app) => {
  const [appId, appName, , chplayLink] = app;

  try {
    Helpers.Logger.step(`Step 0: Parsing ${appName} APP`);

    // get appId from url
    var urlParts = url.parse(chplayLink, true);
    var query = urlParts.query;
    const appIdOnCHPlay = query.id;

    const apkSourcePath = "./sourceTemp/" + appIdOnCHPlay;
    // download first app
    const pathFileApk = await Services.APKPure.download(
      appName,
      "apkpure/" + appIdOnCHPlay
    );
    return;
    Helpers.Logger.step("Step 1: Parse APK to Text files by jadx");
    execSync(`jadx -d "${apkSourcePath}" "${pathFileApk}"`);

    Helpers.Logger.step("Step 2: Get content APK from source code");
    const contents = await Helpers.File.getContentOfFolder(
      `${apkSourcePath}/sources`
    );
    Helpers.Logger.step("Step 3: Get tree");

    const tree = await Models.Tree.find().cache(60 * 60 * 24 * 30);
    // const leafNodes = tree.filter((node) => node.right - node.left === 1);
    Helpers.Logger.step("Step 4: Get base line value for leaf nodes");
    await Services.BaseLine.initBaseLineForTree(tree, contents);

    const result = tree.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    const {
      developer,
      categoryName,
      updatedDate,
      currentVersion,
      size,
      installs,
      privacyLink,
    } = await Services.CHPLAY.getInfoApp(appIdOnCHPlay);

    await Models.App.create({
      name: appName,
      developer,
      categoryName,
      updatedDate,
      currentVersion,
      size,
      installs,
      privacyLink,
      chplayLink,
      nodes: result.map((item) => {
        return {
          id: item._id,
          name: item.name,
          value: item.baseLine,
        };
      }),
    });

    fs.unlink(pathFileApk);
    fs.rmdir(apkSourcePath);
  } catch (err) {
    console.log(err);
    Helpers.Logger.error(`ERROR: failt _createAppByCSV on ${appName}`);
  }
};
export default {
  initTreeOnDB,
  initAppsOnDB,
  initAppsOnDBByCSV,
};
