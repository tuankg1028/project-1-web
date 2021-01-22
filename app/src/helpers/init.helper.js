require("../configs/env.config");
import Helpers from "./";
import path from "path";
import Models from "../models";
import readXlsxFile from "read-excel-file/node";
import Services from "../services";
import { isNumber } from "lodash";
import fs from "fs";
import pLimit from "p-limit";

const { MAPPING_FOLDER, SOURCE_APP } = process.env;

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
export default {
  initTreeOnDB,
  initAppsOnDB,
};
