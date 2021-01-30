import Helpers from "../helpers";
import Models from "../models";
const bluebird = require("bluebird");
const readXlsxFile = require("read-excel-file/node");
const dir = bluebird.promisifyAll(require("node-dir"));
const _ = require("lodash");
const path = require("path");
const readline = require("linebyline");
const csv = require("csvtojson");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
var slug = require("slug");
const { readdirSync } = require("fs");
import pLimit from "p-limit";
import parallel from "run-parallel";
let excelPath = "/Users/a1234/individual/abc/find-data/Mapping Function.xlsx"; // xlsx
let dirPath = __dirname + "/../../data/functions"; // txt files
let csvPath = "/Users/a1234/individual/abc/find-data/FunctionMapping.csv"; // csv file

// HEADERS FOR "file-names.csv"
let headersForFileNames = [
  {
    id: "stt",
    title: "STT",
  },
  {
    id: "filename",
    title: "FILE NAME",
  },
];

const initBaseLineForTree = async (tree, contents) => {
  // init baseLine with 0
  tree = tree.map((leafNode) => {
    return {
      ...leafNode.toJSON(),
      baseLine: 0,
    };
  });

  // const root = tree.filter((node) => !node.parent)[0];

  // let lv1Nodes = tree.filter((node) => node.parent == root.id);
  // lv1Nodes = await Promise.all(
  //   lv1Nodes.map((node) => _compureBaseLineForNode(node, tree, contents))
  // );

  await _compureBaseLineForNode(1, tree, contents);

  return tree;
};

const _compureBaseLineForNode = async (node, tree, contents) => {
  const limit = pLimit(5000);
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
  const leafNodes = await Models.Tree.find({
    $where: function () {
      return this.right - this.left === 1;
    },
  }).cache(60 * 60 * 24 * 30);

  contents = contents.toLowerCase();
  const promises = leafNodes.map((item) => {
    return limit(() =>
      _computeBaseLineLeafNode(item, contents).then((baseLine) => {
        if (baseLine) _updateBaseLineNodeInTree(item, baseLine, tree);
      })
    );
  });

  await Promise.all(promises);
  return;
};

const _updateBaseLineNodeInTree = (node, value, tree) => {
  const nodeInTree = tree.filter((item) => item.id === node.id)[0];

  nodeInTree.baseLine = value;
};
const _computeBaseLineLeafNode = async (leafNode, contents) => {
  // contents = contents.split("/n");
  // for (let j = 0; j < contents.length; j++) {
  //   console.log(j, leafNode.name);
  //   const line = contents[j];

  //   let text = line.trim().replace(";", "");

  //   // =================== CHECKING EACH LINES (TXT) IN EXCEL FILE ==============
  //   let isFound = getRecordByClassName(text, leafNode);
  //   if (isFound) return 1;
  // }

  if (!leafNode.name) return 0;
  const parent = await Models.Tree.findById(leafNode.parent).cache(
    60 * 60 * 24 * 30
  );
  const lastFunctionOfParent = parent.name.split(".").pop();

  return contents.includes(parent.name.toLowerCase().replace(/\s|;/g, "")) &&
    contents.includes(
      lastFunctionOfParent.toLowerCase() +
        "." +
        leafNode.name.toLowerCase().replace(/\([A-Za-z0-9_.<>, \[\]]*\)/i, "")
    )
    ? 1
    : 0;
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
