import express from "express";
import Services from "../services";
import Modesl from "../models";
import Helpers from "../helpers";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import fs from "fs";
const escapeStringRegexp = require("escape-string-regexp");

const { execSync, spawn } = require("child_process");
const router = express.Router();

router.get("/app/:appName", async (req, res) => {
  try {
    console.time("Download APK Pure");
    const { appName } = req.params;

    let appDB = await Modesl.App.findOne({
      appName: { $regex: escapeStringRegexp(appName) },
    });

    if (!appDB || (appDB && !appDB.isCompleted)) {
      Helpers.Logger.step("Step 1: Search apps from APK Pure");
      const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
      if (!listAppIdsFromAPKPure.length)
        throw new Error("No app found from APK Pure");
      Helpers.Logger.step("Step 2: Download app from APK Pure");

      const appAPKPureId = listAppIdsFromAPKPure[0];

      const { AppId: AppIdCHPlay } = await Services.APKPure.getInfoApp(
        appAPKPureId
      );

      const appInfo = await Services.CHPLAY.getInfoApp(AppIdCHPlay);

      // create app
      if (!appDB) {
        appDB = await Modesl.App.create({
          ...appInfo,
          appAPKPureId,
          isCompleted: false,
        });
      }

      return res.json({
        data: {
          ...appInfo,
          appAPKPureId,
          id: appDB.id,
        },
        isExisted: false,
      });
    }

    Helpers.Logger.info("The app was existed");
    appDB = appDB.toJSON();
    appDB.tree = await buildTreeFromNodeBaseLine(appDB.nodes);

    return res.json({
      data: appDB,
      isExisted: true,
    });
  } catch (err) {
    console.error(err);
    Helpers.Logger.error(`${err.message}`);
  }
});

router.put("/app/:id/nodes", async (req, res) => {
  try {
    const { id: appIdDB } = req.params;
    const appDB = await Modesl.App.findById(appIdDB).cache(60 * 60 * 24 * 30);

    // await Modesl.App.updateOne(
    //   {
    //     _id: appIdDB,
    //   },
    //   {
    //     $set: {
    //       nodes: [
    //         {
    //           name: "abc1",
    //         },
    //       ],
    //     },
    //   },
    //   { multi: true }
    // )
    //   .then(console.log)
    //   .catch(console.error);

    const { appAPKPureId } = appDB;
    const apkSourcePath = "sourceTemp" + appAPKPureId;

    if (!fs.existsSync(apkSourcePath)) {
      // download first app
      const pathFileApk = await Services.APKPure.download(
        appName,
        appAPKPureId
      );

      console.timeEnd("Download APK Pure");
      console.time("Parse APK Pure");
      Helpers.Logger.step("Step 3: Parse APK to Text files by jadx");
      // execSync(`jadx -d ${apkSourcePath} ${pathFileApk}`);
      execSync(
        `sh ./jadx/build/jadx/bin/jadx -d ${apkSourcePath} ${pathFileApk}`
      );
    }
    // TODO: check folder existed
    Helpers.Logger.step("Step 4: Get content APK from source code");
    const contents = await Helpers.File.getContentOfFolder(
      `${apkSourcePath}/sources`
    );

    console.timeEnd("Parse APK Pure");

    console.time("Baseline");
    Helpers.Logger.step("Step 5: Get tree");

    let tree = await Modesl.Tree.find().cache(60 * 60 * 24 * 30);
    // const leafNodes = tree.filter((node) => node.right - node.left === 1);
    Helpers.Logger.step("Step 6: Get base line value for leaf nodes");
    tree = await Services.BaseLine.initBaseLineForTree(tree, contents);

    const functionConstants = tree.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    // data = {
    //   nodes: functionConstants,
    // };

    // create app
    await Modesl.App.updateOne(
      {
        _id: appIdDB,
      },
      {
        $set: {
          isCompleted: true,
          nodes: functionConstants.map((item) => {
            return {
              id: item._id,
              name: item.name,
              value: item.baseLine,
              parent: item.parent,
            };
          }),
        },
      }
    );

    const treeResult = await buildTreeFromNodeBaseLine(functionConstants);

    res.json(treeResult);
  } catch (err) {
    console.error(err);
    Helpers.Logger.error(`${err.message}`);
  }
});

router.post("/transform", async (req, res) => {
  try {
    const { appName } = req.body;

    res.render("pages/transform", { appName });
  } catch (err) {
    console.error(err);
    Helpers.Logger.error(`${err.message}`);
  }
});

router.post("/transform1", async (req, res) => {
  try {
    console.time("Download APK Pure");
    const { appName } = req.body;

    const appDB = await Modesl.App.findOne({
      name: { $regex: ".*" + appName + ".*" },
    });
    let data = {};
    if (!appDB) {
      Helpers.Logger.step("Step 1: Search apps from APK Pure");
      const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
      if (!listAppIdsFromAPKPure.length)
        throw new Error("No app found from APK Pure");
      Helpers.Logger.step("Step 2: Download app from APK Pure");

      const appAPKPureId = listAppIdsFromAPKPure[0];

      const { AppId: AppIdCHPlay } = await Services.APKPure.getInfoApp(
        appAPKPureId
      );
      const apkSourcePath = "sourceTemp" + appAPKPureId;

      if (!fs.existsSync(apkSourcePath)) {
        // download first app
        const pathFileApk = await Services.APKPure.download(
          appName,
          appAPKPureId
        );

        console.timeEnd("Download APK Pure");
        console.time("Parse APK Pure");
        Helpers.Logger.step("Step 3: Parse APK to Text files by jadx");
        // execSync(`jadx -d ${apkSourcePath} ${pathFileApk}`);
        execSync(
          `sh ./jadx/build/jadx/bin/jadx -d ${apkSourcePath} ${pathFileApk}`
        );
      }
      // TODO: check folder existed
      Helpers.Logger.step("Step 4: Get content APK from source code");
      const contents = await Helpers.File.getContentOfFolder(
        `${apkSourcePath}/sources`
      );

      console.timeEnd("Parse APK Pure");

      console.time("Baseline");
      Helpers.Logger.step("Step 5: Get tree");

      const startDAPTime = process.hrtime();
      let tree = await Modesl.Tree.find().cache(60 * 60 * 24 * 30);
      // const leafNodes = tree.filter((node) => node.right - node.left === 1);
      Helpers.Logger.step("Step 6: Get base line value for leaf nodes");
      tree = await Services.BaseLine.initBaseLineForTree(tree, contents);

      const functionConstants = tree.filter((node) => {
        return node.right - node.left === 1 && node.baseLine === 1;
      });

      const appInfo = await Services.CHPLAY.getInfoApp(AppIdCHPlay);

      data = {
        ...appInfo,
        nodes: functionConstants,
      };
      // create app
      await Modesl.App.create({
        ...appInfo,
        nodes: functionConstants.map((item) => {
          return {
            id: item._id,
            name: item.name,
            value: item.baseLine,
            parent: item.parent,
          };
        }),
      });
    } else {
      Helpers.Logger.info("The app was existed");
      data = appDB;
    }

    data.tree = await buildTreeFromNodeBaseLine(data.nodes);
    res.render("pages/transform", data);
  } catch (err) {
    console.error(err);
    Helpers.Logger.error(`${err.message}`);
  }
});

async function buildTreeFromNodeBaseLine(functionConstants) {
  const result = [];
  for (let i = 0; i < functionConstants.length; i++) {
    const functionConstant = functionConstants[i];
    // lv 3
    const lv3 = await Modesl.Tree.findById(functionConstant.parent).cache(
      60 * 60 * 24 * 30
    );

    const lv2 = await Modesl.Tree.findById(lv3.parent).cache(60 * 60 * 24 * 30);

    const lv1 = await Modesl.Tree.findById(lv2.parent).cache(60 * 60 * 24 * 30);

    let lv1InResult = result.filter((item) => item.id === lv1.id)[0];
    // check exist lv1
    if (!lv1InResult) {
      // total childrent of lv1

      const totalChildren = await Modesl.Tree.count({
        parent: lv1.id,
      });
      const data = {
        ...lv1.toJSON(),
        totalChildren,
        children: [],
      };

      result.push(data);
    }
    lv1InResult = result.filter((item) => item.id === lv1.id)[0];

    // check exist lv2
    let lv2InResult = lv1InResult.children.filter(
      (item) => item.id === lv2.id
    )[0];
    if (!lv2InResult) {
      const totalChildren = await Modesl.Tree.count({
        parent: lv2.id,
      });
      const data = {
        ...lv2.toJSON(),
        totalChildren,
        children: [],
      };

      lv1InResult.children.push(data);
    }
    lv2InResult = lv1InResult.children.filter((item) => item.id === lv2.id)[0];

    // check exist lv2
    const lv3InResult = lv2InResult.children.filter(
      (item) => item.id === lv3.id
    )[0];
    if (!lv3InResult) {
      const totalChildren = await Modesl.Tree.count({
        parent: lv3.id,
      });
      const data = {
        ...lv3.toJSON(),
        totalChildren,
        children: [functionConstant],
      };

      lv2InResult.children.push(data);
    } else {
      // push to lv 2
      lv3InResult.children.push(functionConstant);
    }
  }

  return result;
}
async function mainTest() {
  try {
    const appName = "facebook";
    Helpers.Logger.step("Step 1: Search apps from APK Pure");
    const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
    if (!listAppIdsFromAPKPure.length)
      throw new Error("No app found from APK Pure");
    Helpers.Logger.step("Step 2: Download app from APK Pure");
    // download first app
    const pathFileApk = await Services.APKPure.download(
      appName,
      listAppIdsFromAPKPure[0]
    );
    Helpers.Logger.step("Step 3: Parse APK to Text files by jadx");
    const apkSourcePath = "./sourceTemp/" + uuidv4();
    execSync(`jadx -d ${apkSourcePath} ${pathFileApk}`);
    Helpers.Logger.step("Step 4: Get content APK from source code");
    const contents = await Helpers.File.getContentOfFolder(
      `${apkSourcePath}/sources`
    );

    Helpers.Logger.step("Step 5: Get tree");
    const tree = await Modesl.Tree.find();

    Helpers.Logger.step("Step 6: Get base line value for leaf nodes");
    await Services.BaseLine.initBaseLineForTree(tree, contents);

    const result = tree.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    console.log(result);
  } catch (err) {
    console.error(err);
    Helpers.Logger.error(`${err.message}`);
  }
}
var elapsed_time = function (start) {
  console.log(process.hrtime(start));
  var precision = 3; // 3 decimal places
  var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli

  return process.hrtime(start)[0] + "s, " + elapsed.toFixed(precision) + " ms ";
};
// mainTest();
export default router;
