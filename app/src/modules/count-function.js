require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import Helpers from "../helpers";
import slug from "slug";
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// stats();
async function stats() {
  let tree = [];
  const header = [
    {
      id: "appName",
      title: "",
    },
  ];
  const nodes = {};
  const rows = [];
  let apps = await Models.App.find({ nodesCount: { $exists: true } }).select(
    "appName nodesCount"
  );

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];

    let row = {
      appName: app.appName,
    };
    for (let j = 0; j < app.nodesCount.length; j++) {
      const node = app.nodesCount[j];

      let { parent: parentId } = node;
      let parent = tree.find((item) => item.id == parentId);
      if (!parent) {
        parent = await Models.Tree.findById(parentId);
        tree.push(parent);
      }

      const lastFunctionOfParent = parent.name;

      const key = slug(lastFunctionOfParent + "." + node.name);
      row[key] = node.count;

      if (nodes[key]) {
        nodes[key].count += node.count;
      } else {
        nodes[key] = {
          count: node.count,
          name: lastFunctionOfParent + "." + node.name,
        };
      }
    }

    rows.push(row);
  }

  const result = _.orderBy(
    Object.entries(nodes),
    (item) => item[1].count,
    "desc"
  );
  let catRow = {
    appName: "Business category",
  };
  result.forEach(([key, data]) => {
    catRow[key] = (data.count / apps.length).toFixed(2);
    header.push({ id: key, title: data.name });
  });
  rows.push(catRow);
  const csvWriterHas = createCsvWriter({
    path: "count-func&constant(Business category).csv",
    header,
  });

  await csvWriterHas.writeRecords(rows);

  console.log("DONE");
}
main();
async function main() {
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
    const lastFunctionOfParent = _.takeRight(parent.name.split("."), 2).join(
      "."
    );

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

  const runApp = async (app, leafNodes) => {
    try {
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
            isNodesCounted: true,
            nodesCount: leafNodesCount.filter((item) => item.count),
          },
        },
        {}
      );
    } catch (err) {
      console.log(err);
      console.log("NO");
    }
  };

  try {
    const limit = 5;
    let skip = 0;
    const contition = {
      // categoryName: "Business",
      isCompleted: true,
      isCompletedJVCode: true,
      $or: [{ isNodesCounted: false }, { isNodesCounted: { $exists: false } }],
    };
    let apps = await Models.App.find(contition)
      .limit(limit)
      .skip(skip)
      .populate("parent");

    do {
      await Promise.all(apps.map((app) => runApp(app, leafNodes)));

      skip += limit;
      apps = await Models.App.find(contition).limit(limit).skip(skip);
    } while (apps && apps.length);
  } catch (err) {
    console.log(err);
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
