import Helpers from "../helpers";
import Models from "../models";
import os from "os";
import bluebird from "bluebird";
const _ = require("lodash");
const path = require("path");
const readline = require("linebyline");
var slug = require("slug");

const initBaseLineForTree = async (contents) => {
  // const root = tree.filter((node) => !node.parent)[0];

  // let lv1Nodes = tree.filter((node) => node.parent == root.id);
  // lv1Nodes = await Promise.all(
  //   lv1Nodes.map((node) => _compureBaseLineForNode(node, tree, contents))
  // );
  contents = contents.toLowerCase();
  let leafNodes = await Models.Tree.find({
    $where: function () {
      return this.right - this.left === 1;
    },
  }).populate("parent");
  leafNodes = JSON.parse(JSON.stringify(leafNodes));

  const cpuCount = os.cpus().length;
  const leafNodeChunks = _.chunk(leafNodes, cpuCount);
  // Helpers.Logger.info(`Running on: ${cpuCount} cpus`);
  const promises = leafNodeChunks.map((leafNodeChunks) => {
    return _computeBaseLineForNode(contents, leafNodeChunks);
  });

  const result = await Promise.all(promises);

  return _.flatten(result);
};

const _computeBaseLineForNode = async (contents, leafNodes) => {
  // const isLeafNode = node.right - node.left === 1;
  // let baseLine = 0;
  // // is leaf node
  // if (isLeafNode) {
  //   baseLine = await _computeBaseLineLeafNode(node, contents);
  // } else {
  //   const children = await Models.Tree.find({
  //     parent: node.id,
  //   }).cache(60 * 60 * 24 * 30);
  //   const childrenIds = children.map((item) => item._id.toString());
  //   // compute base line of children
  //   await Promise.all(
  //     children.map((child) => _compureBaseLineForNode(child, tree, contents))
  //   );
  //   const childrentInTree = tree.filter((item) => {
  //     return childrenIds.includes(item._id.toString());
  //   });
  //   // compute base line of node
  //   baseLine = _.sumBy(childrentInTree, "baseLine") / childrenIds.length;
  // }
  // if (baseLine) _updateBaseLineNodeInTree(node, baseLine, tree);

  // use workers
  // const { Worker } = require("worker_threads");
  // const result = await new Promise((resolve, reject) => {
  //   const worker = new Worker(
  //     path.join(__dirname, "../workers/computeBaseLineLeafNode.worker.js"),
  //     {
  //       workerData: {
  //         leafNodes,
  //         contents,
  //       },
  //     }
  //   );

  //   worker.on("message", resolve);
  //   worker.on("error", reject);
  //   worker.on("exit", (code) => {
  //     if (code !== 0)
  //       reject(new Error(`Worker stopped with exit code ${code}`));
  //   });
  // });

  const result = await _computeBaseLineLeafNode(leafNodes, contents);
  return result;
};

const _updateBaseLineNodeInTree = (node, value, tree) => {
  const nodeInTree = tree.filter((item) => item.id === node.id)[0];

  nodeInTree.baseLine = value;
};
const _computeBaseLineLeafNode = async (leafNodes, contents) => {
  const result = leafNodes.map((leafNode) => {
    try {
      const { parent } = leafNode;
      const lastFunctionOfParent = parent.name.split(".").pop();

      const baseLine =
        contents.includes(parent.name.toLowerCase().replace(/\s|;/g, "")) &&
        contents.includes(
          lastFunctionOfParent.toLowerCase() +
            "." +
            leafNode.name
              .toLowerCase()
              .replace(/\([A-Za-z0-9_.<>, \[\]]*\)/i, "")
        )
          ? 1
          : 0;
      return {
        _id: leafNode._id,
        id: leafNode._id,
        name: leafNode.name,
        desc: leafNode.desc,
        left: leafNode.left,
        right: leafNode.right,
        parent: leafNode.parent,
        baseLine,
      };
    } catch (e) {
      console.log(leafNode);
      console.log(e);
      Helpers.Logger.error(`ERROR _computeBaseLineLeafNode: ${e.message}`);
    }
  });
  return result;
};
function getTxtFilePaths(filePaths) {
  return _.filter(filePaths, (filePath) => path.extname(filePath) === ".txt");
}

function getContent(txtFilePath) {
  let content = "";
  return new Promise((resolve, reject) => {
    let rl = readline(txtFilePath);
    rl.on("line", (line, lineCount, byteCount) => {
      content += line + "/n";
    })
      .on("end", () => {
        resolve(content);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function createHeadersForCSVFile(arr) {
  let data = arr.map((item) => {
    return {
      id: slug(item),
      title: item,
    };
  });

  // =========== additional file name column ==================
  if (data[0].title) {
    if (data[0].id !== "AppID") {
      data.unshift({
        id: "AppID",
        title: "AppID",
      });
    }
  } else {
    data[0] = {
      id: "AppID",
      title: "AppID",
    };
  }

  return data;
}

function initRecord(index, headers) {
  // [
  //  { id: 'AppID', title: 'AppID' },
  //  {
  //    id: 'Available-Network',
  //    title: 'Available Network'
  //  }
  // ]
  let data = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    data[header.id] = 0;
  }
  data["AppID"] = index;

  return data;
}

function getRecordByClassName(text, leafNode) {
  try {
    if (!leafNode.name || leafNode.baseLine) return;
    let keyword = leafNode.name.toUpperCase();
    text = text.toUpperCase();

    if (text.includes(keyword)) {
      return leafNode;
    }
    return false;
  } catch (e) {
    console.log(e);
    Helpers.Logger.error(`ERROR getRecordByClassName: ${e.message}`);
  }
}

export default {
  initBaseLineForTree,
};
