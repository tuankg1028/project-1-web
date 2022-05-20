require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import Helpers from "../helpers";
const fs = require("fs");
const path = require("path");

main();
async function main() {
  let apps = await Models.App.find({
    categoryName: "Business",
    isCompleted: true,
    isCompletedJVCode: true,
  });

  let leafNodes = await Models.Tree.find({
    name: {
      $ne: null,
    },
    $where: function () {
      return this.right - this.left === 1;
    },
  }).populate("parent");
  leafNodes = leafNodes.map((leafNode) => {
    const { parent } = leafNode;
    const lastFunctionOfParent = parent.name.split(".").pop();

    let keyword =
      lastFunctionOfParent.toLowerCase() +
      "." +
      leafNode.name.toLowerCase().replace(/\([A-Za-z0-9_.<>, \[\]]*\)/i, "");
    keyword = keyword.split("(")[0].split(" ")[0];
    const regex = new RegExp(`${keyword}`, "g");
    return {
      ...leafNode.toJSON(),
      regex,
    };
  });
  for (let i = 0; i < apps.length; i++) {
    console.log(`Running ${i}`);
    try {
      const app = apps[i];
      const apkSourcePath = `/data/JavaCode/${app.id}`;

      console.log(apkSourcePath);
      let contents = await Helpers.File.getContentOfFolder(
        `${apkSourcePath}/sources`
      );
      contents = contents.toLowerCase();

      const leafNodesCount = leafNodes.map((leafNode) => {
        const count = (contents.match(leafNode.regex) || []).length;
        return {
          _id: leafNode._id,
          id: leafNode._id,
          name: leafNode.name,
          desc: leafNode.desc,
          left: leafNode.left,
          right: leafNode.right,
          parent: leafNode.parent,
          count,
        };
      });

      await Models.App.updateOne(
        {
          _id: app.id,
        },
        {
          $set: {
            nodesCount: leafNodesCount,
          },
        },
        {}
      );
    } catch (err) {
      console.log(err);
      console.log("NO");
    }
  }
}

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
  const apkFilesInFolder3 = ThroughDirectory("/data/apkfile/mobipurpose-apks");
  const apkFilesInFolder4 = ThroughDirectory(
    "/home/son/apkfile/mobipurpose-apks"
  );

  const apkFiles = [
    ...apkFilesInFolder1,
    ...apkFilesInFolder2,
    ...apkFilesInFolder3,
    ...apkFilesInFolder4,
  ];

  // find in folder
  for (let i = 0; i < apkFiles.length; i++) {
    const apkFile = apkFiles[i];

    if (apkFile.includes(appId) || apkFile.includes(appName)) {
      apkPath = apkFile;
      break;
    }
  }
  return apkPath;
}
