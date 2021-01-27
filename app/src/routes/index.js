import express from "express";
import Services from "../services";
import Modesl from "../models";
import Helpers from "../helpers";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import fs from "fs";
const { execSync, spawn } = require("child_process");
const router = express.Router();

router.post("/transform", async (req, res) => {
  try {
    console.time("Download APK Pure");
    const { appName } = req.body;
    Helpers.Logger.step("Step 1: Search apps from APK Pure");
    const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
    if (!listAppIdsFromAPKPure.length)
      throw new Error("No app found from APK Pure");
    Helpers.Logger.step("Step 2: Download app from APK Pure");

    const appAPKPureId = listAppIdsFromAPKPure[0];

    const apkSourcePath = "./sourceTemp" + appAPKPureId;

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
      execSync(`sh ./jadx/build/jadx/bin/jadx ${apkSourcePath} ${pathFileApk}`);
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
    const tree = await Modesl.Tree.find().cache(60 * 60 * 24 * 30);
    // const leafNodes = tree.filter((node) => node.right - node.left === 1);
    Helpers.Logger.step("Step 6: Get base line value for leaf nodes");
    await Services.BaseLine.initBaseLineForTree(tree, contents);

    const functionConstants = tree.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    const treeResult = await buildTreeFromNodeBaseLine(functionConstants);

    res.render("pages/transform", { tree: treeResult });
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

    console.log(1, lv1.name, functionConstant.name);

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
