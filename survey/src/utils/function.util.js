import _ from "lodash";
import csv from "csvtojson";
import bluebird from "bluebird";
import path from "path";
import Logger from "./logger.util";
import readline from "linebyline";
import qs from "qs";
import slug from "slug";
import Models from "../models";
const dir = bluebird.promisifyAll(require("node-dir"));

function getDAPFile(treeName, subFolder) {
  return (
    folderCSVBaseLineOutput +
    "/" +
    subFolder +
    "/" +
    treeName +
    "_" +
    folderName +
    ".csv"
  );
}

async function getBaseLineByKey(key, firstLevelName, subFolderName) {
  let baseLineData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(getDAPFile(firstLevelName, subFolderName));

  const [headers, rows] = baseLineData;

  const index = _.indexOf(headers, key);

  return rows[index];
}

async function getAPIFromNode(node) {
  console.log("node", node.name)
  const parent = await Models.Tree.findById(node.parent);

  if (
    parent.name === "root" ||
    [
      "Connection",
      "Media",
      "Hardware",
      "Health&Fitness",
      "Location",
      "Telephony",
      "UserInfo",
    ].includes(parent.name)
  ) {
    return node;
  }
  return getAPIFromNode(parent);
}


async function creatingTrees(rows, DAP_PATH) {
  // init trees
  let trees = {
    name: "Privacy",
    children: []
  };

  for (let i = 1; i < rows.length; i++) {
    const [
      STT,
      ,
      ,
      firstLevel,
      secondLevel,
      thirdLevel,
      fourthLevel,
      detail,
      group,
      replacedName
    ] = rows[i];

    // exist
    if (firstLevel) {
      // ================== check existing (first) ==================
      var [firstLevelIsExist] = checkExistingInTrees(
        trees,
        firstLevel,
        "first"
      );
      if (!firstLevelIsExist) {
        const firstLevelIndex = trees.children.length;

        // push to children array
        trees.children.push({
          name: firstLevel,
          group,

          children: []
        });
      }

      // exist
      if (secondLevel) {
        // ================== check existing (second) ==================
        var [
          secondLevelIsExist,
          firstLevelIndex,
          secondLevelIndex
        ] = checkExistingInTrees(trees, secondLevel, "second", firstLevel);
        if (!secondLevelIsExist) {
          const details = detail ? [detail.trim()] : [];

          const secondLevelIndex =
            trees.children[firstLevelIndex]["children"].length;

          // push to first level children array
          trees.children[firstLevelIndex]["children"].push({
            name: secondLevel,
            group,
            details,
            replacedName,
            path: `${secondLevelIndex}`,
            children: []
          });
        } else {
          // add detail
          const details =
            trees.children[firstLevelIndex]["children"][secondLevelIndex]
              .details;

          // check detail exist
          if (detail && _.indexOf(details, detail) === -1) {
            details.push(detail);
          }
        }
      }

      // exist
      if (thirdLevel) {
        // ================== check existing (third) ==================
        var [
          thirdLevelIsExist,
          firstLevelIndex,
          secondLevelIndex,
          thirdLevelIndex
        ] = checkExistingInTrees(
          trees,
          thirdLevel,
          "third",
          firstLevel,
          secondLevel
        );
        if (!thirdLevelIsExist) {
          const details = detail ? [detail.trim()] : [];
          const thirdLevelIndex =
            trees.children[firstLevelIndex]["children"][secondLevelIndex][
              "children"
            ].length;
          // push to second level children array
          trees.children[firstLevelIndex]["children"][secondLevelIndex][
            "children"
          ].push({
            name: thirdLevel,
            group,
            details,
            replacedName,
            path: `${secondLevelIndex}.${thirdLevelIndex}`,
            children: []
          });
        } else {
          // add detail
          const details =
            trees.children[firstLevelIndex]["children"][secondLevelIndex][
              "children"
            ][thirdLevelIndex].details;

          // check detail exist
          if (detail && _.indexOf(details, detail) === -1) {
            details.push(detail);
          }
        }

        // exist
        if (fourthLevel) {
          // ================== check existing (third) ==================
          var [
            fourthLevelIsExist,
            firstLevelIndex,
            secondLevelIndex,
            thirdLevelIndex,
            fourthLevelIndex
          ] = checkExistingInTrees(
            trees,
            fourthLevel,
            "fourth",
            firstLevel,
            secondLevel,
            thirdLevel
          );
          if (!fourthLevelIsExist) {
            // add detail
            const details = detail ? [detail.trim()] : [];
            const fourthLevelIndex =
              trees.children[firstLevelIndex]["children"][secondLevelIndex][
                "children"
              ][thirdLevelIndex]["children"].length;

            // push to third level children array
            trees.children[firstLevelIndex]["children"][secondLevelIndex][
              "children"
            ][thirdLevelIndex]["children"].push({
              name: fourthLevel,
              details,
              group,
              replacedName,
              path: `${secondLevelIndex}.${thirdLevelIndex}.${fourthLevelIndex}`
              // children: []
            });
          } else {
            // add detail
            const details =
              trees.children[firstLevelIndex]["children"][secondLevelIndex][
                "children"
              ][thirdLevelIndex]["children"][fourthLevelIndex].details;

            // check detail exist
            if (detail && _.indexOf(details, detail) === -1) {
              details.push(detail);
            }
          }
        }
      }
    }
  }
  return trees;
}
async function creatingTreesWithGroup(rows, DAP_PATH) {
  // init trees
  let trees = {
    name: "Privacy",
    children: []
  };

  for (let i = 1; i < rows.length; i++) {
    const [
      STT,
      ,
      ,
      firstLevel,
      secondLevel,
      thirdLevel,
      fourthLevel,
      detail,
      group,
      replacedName
    ] = rows[i];

    // exist
    if (firstLevel) {
      // ================== check existing (first) ==================
      var [firstLevelIsExist] = checkExistingInTrees(
        trees,
        firstLevel,
        "first"
      );
      if (!firstLevelIsExist) {
        // push to children array
        trees.children.push({
          name: firstLevel,
          group,
          children: []
        });
      }

      // exist
      if (secondLevel) {
        // ================== check existing (second) ==================
        var [
          secondLevelIsExist,
          firstLevelIndex,
          secondLevelIndex
        ] = checkExistingInTrees(trees, secondLevel, "second", firstLevel);
        if (!secondLevelIsExist) {
          // push to first level children array
          trees.children[firstLevelIndex]["children"].push({
            name: secondLevel,
            group,
            children: []
          });
        }
      }

      // exist
      if (thirdLevel) {
        // ================== check existing (third) ==================
        var [
          thirdLevelIsExist,
          firstLevelIndex,
          secondLevelIndex,
          thirdLevelIndex
        ] = checkExistingInTrees(
          trees,
          thirdLevel,
          "third",
          firstLevel,
          secondLevel
        );
        if (!thirdLevelIsExist) {
          // push to second level children array
          trees.children[firstLevelIndex]["children"][secondLevelIndex][
            "children"
          ].push({
            name: thirdLevel,
            group,
            children: []
          });
        }

        // exist
        if (fourthLevel) {
          // ================== check existing (third) ==================
          var [
            fourthLevelIsExist,
            firstLevelIndex,
            secondLevelIndex,
            thirdLevelIndex,
            fourthLevelIndex
          ] = checkExistingInTrees(
            trees,
            fourthLevel,
            "fourth",
            firstLevel,
            secondLevel,
            thirdLevel
          );
          if (!fourthLevelIsExist) {
            // console.log(fourthLevel, group);
            // push to third level children array
            trees.children[firstLevelIndex]["children"][secondLevelIndex][
              "children"
            ][thirdLevelIndex]["children"].push({
              name: fourthLevel,
              group
              // children: []
            });
          }
        }
      }
    }
  }
  return trees;
}
function checkExistingInTrees(
  trees,
  key,
  level,
  firstLevelKey = null,
  secondLevelKey = null,
  thirdLevelKey = null
) {
  const { children } = trees;
  switch (level) {
    // first
    case "first": {
      const firstLevelKeys = _.map(trees.children, "name");

      if (!_.includes(firstLevelKeys, key)) return [false, null];

      break;
    }
    // second
    case "second": {
      // first loop
      for (let i = 0; i < children.length; i++) {
        const { name: firstLevelName, children: firstLevelchildren } = children[
          i
        ];

        // finding parent position
        if (firstLevelName === firstLevelKey) {
          const secondLevelKeys = _.map(firstLevelchildren, "name");

          if (!_.includes(secondLevelKeys, key)) {
            return [false, i];
          } else {
            return [true, i, _.indexOf(secondLevelKeys, key)];
          }
        }
      }

      break;
    }
    // third
    case "third": {
      // first loop
      for (let i = 0; i < children.length; i++) {
        const { name: firstLevelName, children: firstLevelchildren } = children[
          i
        ];

        // finding first level position
        if (firstLevelName === firstLevelKey) {
          for (let j = 0; j < firstLevelchildren.length; j++) {
            const {
              name: sencondLevelName,
              children: sencondLevelchildren
            } = firstLevelchildren[j];

            // finding second level position
            if (sencondLevelName === secondLevelKey) {
              const thirdLevelKeys = _.map(sencondLevelchildren, "name");

              if (!_.includes(thirdLevelKeys, key)) return [false, i, j];
              else {
                return [true, i, j, _.indexOf(thirdLevelKeys, key)];
              }
            }
          }
        }
      }

      break;
    }

    // third
    case "fourth": {
      // first loop
      for (let i = 0; i < children.length; i++) {
        const { name: firstLevelName, children: firstLevelchildren } = children[
          i
        ];

        // finding first level position
        if (firstLevelName === firstLevelKey) {
          for (let j = 0; j < firstLevelchildren.length; j++) {
            const {
              name: sencondLevelName,
              children: sencondLevelchildren
            } = firstLevelchildren[j];

            // finding second level position
            if (sencondLevelName === secondLevelKey) {
              for (let k = 0; k < sencondLevelchildren.length; k++) {
                const {
                  name: thirdLevelName,
                  children: thirdLevelchildren
                } = sencondLevelchildren[k];

                if (thirdLevelName === thirdLevelKey) {
                  const fourthLevelKeys = _.map(thirdLevelchildren, "name");

                  if (!_.includes(fourthLevelKeys, key))
                    return [false, i, j, k];
                  else {
                    return [true, i, j, k, _.indexOf(fourthLevelKeys, key)];
                  }
                }
              }
            }
          }
        }
      }

      break;
    }
  }

  return [true, null];
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getRootNamesInTree(tree) {
  return tree.children.map(item => item.name);
}

function getBuildTreeForQuestion(
  rootNames,
  buildTreeHeaders,
  buildTreeRowInApp
) {
  const results = [];
  // loop root names
  for (let i = 0; i < rootNames.length; i++) {
    const rootName = rootNames[i];
    // get index
    const index = _.indexOf(buildTreeHeaders, rootName);
    // get value
    const value = buildTreeRowInApp[index];

    if (value !== "" && value != 0) {
      results.push(
        `${rootName}: The coverage of personal information about ${rootName} is: “${value}”`
      );
    }
  }

  return results;
}

async function createQuestion(
  distanceHeaders,
  distanceRow,
  tree,
  appNameData,
  buildTreeData
) {
  // ================ DATA =======================
  // build tree
  const [buildTreeHeaders, ...buildTreeRows] = buildTreeData;

  const question = {};

  const appId = _.head(distanceRow);
  const appName = _.head(_.last(appNameData[appId]).split(".")); // remove .txt
  const buildTreeRowInApp = buildTreeRows[appId - 1];
  // title
  question.title = `App - ${appName}`;

  // root names in tree
  const rootNames = getRootNamesInTree(tree);

  // get build tree for question
  question.builTree = getBuildTreeForQuestion(
    rootNames,
    buildTreeHeaders,
    buildTreeRowInApp
  );

  // console.log(question.builTree);
  // console.log(rootNames);
  // console.log(question);
}
function getCategoryIdByAppId(appId, distanceRows) {
  const appDistanceRow = getDistanceRowByAppId(appId, distanceRows);
  return _.last(appDistanceRow);
}
function getDistanceRowByAppId(appId, distanceRows) {
  for (let i = 0; i < distanceRows.length; i++) {
    const distanceRow = distanceRows[i];

    const [appIdDT, ...data] = distanceRow;

    if (appId === appIdDT) {
      return data;
    }
  }

  return null;
}
function getCategoryNameByAppId(appId, distanceData, categoryNameData) {
  const categoryId = getCategoryIdByAppId(appId, distanceData);
  const categoryName = getCategoryNameById(categoryId, categoryNameData);

  return categoryName;
}

function getBuildTreeValueOfNodeName(nodeName, appId, buildTreeData) {
  const [buildTreeHeaders, ...buildTreeRows] = buildTreeData;

  for (let i = 0; i < buildTreeRows.length; i++) {
    const [appIdTemp, ...buildTreeRow] = buildTreeRows[i];
    // console.log(appIdTemp);
    if (appId == appIdTemp) {
      const index = _.indexOf(buildTreeHeaders, nodeName);
      return buildTreeRow[index - 1];
    }
  }
}

function getCategoryNameById(categoryId, categoryNameData) {
  const [, ...categoryNameRows] = categoryNameData;

  for (let i = 0; i < categoryNameRows.length; i++) {
    const categoryNameRow = categoryNameRows[i];

    const [categoryIdData, categoryName] = categoryNameRow;

    if (categoryId === categoryIdData) {
      return categoryName;
    }
  }

  return null;
}

async function getDAPValueOfNodeName(rootName, categoryName, DAP_PATH) {
  const filePaths = await dir.filesAsync(DAP_PATH + "/" + categoryName);
  // console.log(filePaths);

  const DAPPath = getFilePathByNodeName(rootName, filePaths);
  const DAPData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(DAPPath);

  const [DAPHeaders, DAPRows] = DAPData;

  const index = _.indexOf(DAPHeaders, rootName);

  return DAPRows[index];
}
function getFilePathByNodeName(rootName, filePaths) {
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const fileName = path.basename(filePath);
    if (fileName.includes(rootName)) return filePath;
  }
  return null;
}
function getIndexOfSubTree(name, tree) {
  const { children } = tree;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.name === name) return i;
  }

  return null;
}

function getDistanceValue(appId, nodeName, distanceHeaders, distanceRows) {
  const index = _.indexOf(distanceHeaders, nodeName);

  for (let i = 0; i < distanceRows.length; i++) {
    const [appIdTemp, ...distanceRow] = distanceRows[i];
    if (appIdTemp == appId) return distanceRow[index - 1];
  }
}

function getDAPValue(nodeName, distanceHeaders, distanceRows) {
  const index = _.indexOf(distanceHeaders, nodeName);

  return distanceRows[index];
}
function getLeafNodes(nodes, result = []) {
  for (var i = 0, length = nodes.length; i < length; i++) {
    if (!nodes[i].children || nodes[i].children.length === 0) {
      result.push(nodes[i]);
    } else {
      result = getLeafNodes(nodes[i].children, result);
    }
  }
  return result;
}
function getLeafNodesRequiredGroup(nodes, result = []) {
  for (var i = 0, length = nodes.length; i < length; i++) {
    if (!nodes[i].children || nodes[i].children.length === 0) {
      // check node have group
      if (nodes[i].group) {
        result.push(nodes[i]);
      }
    } else {
      result = getLeafNodesRequiredGroup(nodes[i].children, result);
    }
  }
  return result;
}
function getLeafNodesRequiredDetails(nodes, result = []) {
  for (var i = 0, length = nodes.length; i < length; i++) {
    if (!nodes[i].children || nodes[i].children.length === 0) {
      // check node have details
      if (nodes[i].details.length) {
        result.push(nodes[i]);
      }
    } else {
      result = getLeafNodesRequiredDetails(nodes[i].children, result);
    }
  }
  return result;
}
function getDataForLeafNodesDistance(
  appId,
  leafNodes,
  distanceHeaders,
  distanceRows
) {
  const data = [];

  for (let i = 0; i < leafNodes.length; i++) {
    const leafNode = leafNodes[i];
    const { name, details } = leafNode;

    const distanceValue = getDistanceValue(
      appId,
      name,
      distanceHeaders,
      distanceRows
    );

    if (
      details.length === 0 ||
      distanceValue === undefined ||
      distanceValue == 0
    )
      continue;

    data.push({
      name,
      details,
      distanceValue
    });
  }

  return data;
}

function getDataForLeafNodesBuilTree(
  appId,
  leafNodes,
  [distanceHeaders, ...distanceRows]
) {
  const data = [];

  for (let i = 0; i < leafNodes.length; i++) {
    const leafNode = leafNodes[i];
    const { name, details, group, replacedName } = leafNode;

    const buildTreeValue = getDistanceValue(
      appId,
      name,
      distanceHeaders,
      distanceRows
    );

    if (details.length === 0 || buildTreeValue == 0) continue;

    data.push({
      name,
      details,
      group,
      buildTreeValue,
      replacedName
    });
  }

  return data;
}
async function getDataForLeafNodesDAP(
  appId,
  leafNodes,
  rootName,
  categoryName,
  DAP_PATH
) {
  const data = [];

  const filePaths = await dir.filesAsync(DAP_PATH + "/" + categoryName);

  const DAPPath = getFilePathByNodeName(rootName, filePaths);
  const DAPData = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(DAPPath);

  const [DAPHeaders, DAPRows] = DAPData;

  for (let i = 0; i < leafNodes.length; i++) {
    const leafNode = leafNodes[i];
    const { name, details, group } = leafNode;

    const DAPValue = getDAPValue(name, DAPHeaders, DAPRows);

    if (details.length === 0 || DAPValue == 0) continue;

    data.push({
      name,
      details,
      group,
      DAPValue
    });
  }

  return data;
}

function getFileNameByAppId(appId, appNameRows) {
  for (let i = 0; i < appNameRows.length; i++) {
    const [appIdTemp, fileName] = appNameRows[i];

    if (appIdTemp === appId) return fileName;
  }
  return null;
}

function getContentTxtFile(txtFilePath) {
  try {
    let content = "";
    return new Promise((resolve, reject) => {
      let rl = readline(txtFilePath);
      rl.on("line", (line, lineCount, byteCount) => {
        content += line + "/n";
      })
        .on("end", () => {
          resolve(content);
        })
        .on("error", err => {
          reject(err);
        });
    });
  } catch (err) {
    Logger.error("Utils.Function.getContentTxtFile");
    Logger.error(err);
  }
}

async function getPermissions(
  appId,
  categoryName,
  appNameData,
  permissionDataInExcelFile,
  PERRMISSION_FOLDER_PATH
) {
  try {
    const permission = [];

    const [, ...appNameRows] = appNameData;
    const [, ...permissionRows] = permissionDataInExcelFile;
    const fileName = getFileNameByAppId(appId, appNameRows);
    if (!fileName) throw Error(`Cannot find out file by app id ${appId}`);

    const permissionFilePath =
      PERRMISSION_FOLDER_PATH + "/" + categoryName + "/" + fileName;

    let content = await getContentTxtFile(permissionFilePath);
    content = content.split("/n");

    for (let i = 0; i < permissionRows.length; i++) {
      const permissionRow = permissionRows[i];
      const [keyword, detail] = permissionRow;

      const isExisted = checkPermissionInContent(keyword, content);

      if (isExisted) {
        permission.push({
          keyword,
          detail
        });
      }
    }

    return permission;
  } catch (err) {
    console.log(appId);
    Logger.error("Utils.Function.getPermissions");
    Logger.error(err);
  }
}

function checkPermissionInContent(keyword, arrayContent) {
  for (let i = 0; i < arrayContent.length; i++) {
    const content = arrayContent[i].toLowerCase().trim();

    if (content.indexOf(keyword.toLowerCase().trim()) !== -1) return true;
  }
  return false;
}

function objectToArray(objects) {
  let queryString = "";
  for (const key in objects) {
    const value = objects[key];

    queryString += `${key}=${value}&`;
  }
  return qs.parse(queryString);
}
async function getContentGroup(path) {
  try {
    const content = await getContentTxtFile(path);
    const { keywordGroup, descGroup } = getKeywordByContent(content);
    return { keywordGroup, descGroup };
  } catch (err) {
    return { keywordGroup: "", descGroup: "" };
  }
}
function getKeywordByContent(content) {
  let keyword = null;
  let isFound = false;
  const arrayContent = content.split("/n");
  let length = arrayContent.length;
  while (!isFound && length >= 0) {
    const index = length - 1;
    if (
      arrayContent[index].includes("Keywork:") ||
      arrayContent[index].includes("keywork:") ||
      arrayContent[index].includes("Keyword:") ||
      arrayContent[index].includes("keyword:")
    ) {
      const keywordGroup = arrayContent[index]
        .replace("Keywork:", "")
        .replace("keywork:", "")
        .replace("Keyword:", "")
        .replace("keyword:", "")
        .trim();

      const arrayDesc = arrayContent.splice(index, 1);
      const descGroup = _.join(arrayContent, "/n");
      isFound = true;
      return { keywordGroup, descGroup };
    } else {
      length = length - 1;
    }
  }

  return { keywordGroup: "", descGroup: "" };
}
async function getDataForFirstLevel(rootNodeNames, FIRST_LEVEL_FOLDER_PATH) {
  const data = [];
  for (let i = 0; i < rootNodeNames.length; i++) {
    const rootNodeName = rootNodeNames[i];
    try {
      const path = FIRST_LEVEL_FOLDER_PATH + `/${rootNodeName}.txt`;
      const content = await getContentTxtFile(path);
      const { keywordGroup, descGroup } = getKeywordByContent(content);

      data.push({ node: rootNodeName, keywordGroup, descGroup });
    } catch (err) {
      data.push({ node: rootNodeName, keywordGroup: "", descGroup: "" });
    }
  }

  return data;
}
//
async function getDataForQuestion(appId, tree, buildTreeData, meta) {
  try {
    const { categoryName, DAP_PATH, dataForFirstLevel } = meta;
    console.log(appId); // root names in tree
    const nodeData = [];
    const rootNames = getRootNamesInTree(tree);
    for (let i = 0; i < rootNames.length; i++) {
      const rootName = rootNames[i];
      const dateForNode = _.filter(
        dataForFirstLevel,
        item => item.node == rootName
      )[0];

      const { keywordGroup: group, descGroup: description } = dateForNode;

      // get index of tree
      const indexOfTree = getIndexOfSubTree(rootName, tree);
      const subTree = tree.children[indexOfTree];
      // get leaf nodes

      const leafNodes = getLeafNodes(subTree.children);
      if (leafNodes.length === 0) {
        continue;
      }
      // get build tree value
      // const buidTreeValue = getBuildTreeValueOfNodeName(
      //   rootName,
      //   appId,
      //   buildTreeData
      // );

      // get DAP value
      // const DAPValue = await getDAPValueOfNodeName(
      //   rootName,
      //   categoryName,
      //   DAP_PATH
      // );

      // data for leaf nodes distance
      // const leafNodeDataDistance = getDataForLeafNodesDistance(
      //   appId,
      //   leafNodes,
      //   distanceHeaders,
      //   distanceRows
      // );

      // data for leaf nodes distance
      // const leafNodeDataDAP = await getDataForLeafNodesDAP(
      //   appId,
      //   leafNodes,
      //   rootName,
      //   categoryName,
      //   DAP_PATH
      // );
      // data for leaf nodes distance
      let leafNodeDataBuildTree = getDataForLeafNodesBuilTree(
        appId,
        leafNodes,
        buildTreeData
      );
      leafNodeDataBuildTree = _.uniqBy(leafNodeDataBuildTree, "replacedName");
      // console.log(leafNodeDataBuildTree);
      // node
      nodeData.push({
        name: rootName,
        group,
        description,
        // buidTreeValue,
        // DAPValue,
        leafNodeDataBuildTree
        // leafNodeDataDAP
        // leafNodeDataDistance
      });
    }

    return nodeData;
  } catch (err) {
    console.log(err);
  }
}

function createHeaders(trees) {
  let dataForHeaders = [
    {
      name: "AppId",
      group: ""
    }
  ];
  for (let i = 0; i < trees.children.length; i++) {
    const subTree = trees.children[i];

    if (subTree.name == "Time" || subTree.name == "Storage") continue;

    const leafNodes = getLeafNodesRequiredDetails(subTree.children);

    const leafNodeNames = _.map(leafNodes, "name");
    for (let j = 0; j < leafNodeNames.length; j++) {
      const leafNodeName = leafNodeNames[j];

      dataForHeaders.push({
        name: leafNodeName,
        group: slug(subTree.name)
      });
    }

    dataForHeaders.push({
      name: subTree.name,
      group: ""
    });
  }

  const data = dataForHeaders.map(item => {
    return {
      id: slug(item.name),
      title: item.name,
      group: item.group
    };
  });

  data.push({
    id: slug("categories"),
    title: "Categories",
    group: ""
  });

  data.push({
    id: slug("app"),
    title: "Labels",
    group: ""
  });

  return data;
}

async function createHeadersWithGroup(trees) {
  let dataForHeaders = [
    {
      name: "AppId",
      group: "",
      keyword: "AppId",
      firstLevelName: ""
    }
  ];
  for (let i = 0; i < trees.children.length; i++) {
    const subTree = trees.children[i];

    if (subTree.name == "Time" || subTree.name == "Storage") continue;
    const leafNodes = getLeafNodesRequiredGroup(subTree.children);

    const leafNodeGroups = _.groupBy(leafNodes, "group");

    for (const groupName in leafNodeGroups) {
      const groupData = await Models.Group.findOne({
        name: groupName
      }).cache(60 * 60 * 24 * 30);

      if (groupData && groupData.keyword) {
        dataForHeaders.push({
          name: groupName,
          group: groupName,
          keyword: groupData.keyword,
          firstLevelName: subTree.name
        });
      }
    }
  }

  const data = dataForHeaders.map(item => {
    return {
      id: slug(item.name),
      title: item.keyword,
      keyword: item.keyword,
      group: item.group,
      firstLevelName: item.firstLevelName
    };
  });

  data.push({
    id: slug("categories"),
    title: "Categories",
    group: ""
  });

  data.push({
    id: slug("app"),
    title: "Labels",
    group: ""
  });

  return data;
}
function getCategortIdByName(name, data) {
  for (let i = 0; i < data.length; i++) {
    const [stt, categoryName] = data[i];

    if (name === categoryName) return stt;
  }
  return false;
}
async function createRows(apps, categoryNameData, headers) {
  const rows = [];

  // loop app
  for (let i = 0; i < apps.length; i++) {
    const row = [];
    const { name: appName, nodes, appId, response: appValue } = apps[i];
    const appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30);
    const categoryId = getCategortIdByName(
      appData.categoryName,
      categoryNameData
    );

    row[slug("AppId")] = appData.appId;
    // loop leaf nodes
    for (let j = 0; j < nodes.length; j++) {
      const { name: nodeName, response: nodeValue, leafNodes } = nodes[j];

      // loop leaf nodes
      for (let k = 0; k < leafNodes.length; k++) {
        const { name: leafNodeName, response: leafNodeValue } = leafNodes[k];

        row[slug(leafNodeName)] = leafNodeValue / 5; // leaf nodes
      }
      row[slug(nodeName)] = nodeValue / 5; // first level

      // row[slug(nodeName)] =
      //   nodeValue == 1 || nodeValue == 2 ? 1 : nodeValue == 3 ? 2 : 3; // first level
    }
    row[slug("app")] =
      appValue == 1 || appValue == 2 ? 1 : appValue == 3 ? 2 : 3; // label
    row[slug("categories")] = categoryId; // categories

    rows.push(row);
  }
  const result = computeEmptyNodes(rows, headers);
  return result;
}
async function findGroupForLeafNode(nodeName, leafNodes) {
  const leafNodesWithGroup = [];
  for (let k = 0; k < leafNodes.length; k++) {
    const leafNode = leafNodes[k];

    const nodeData = await Models.Node.findOne({
      name: nodeName,
      "leafNodeDataBuildTree.name": leafNode.name
    }).cache(60 * 60 * 24 * 30);

    // get leafNodeData
    const leafNodeData = _.filter(nodeData.leafNodeDataBuildTree, item => {
      return item.name === leafNode.name;
    })[0];
    // get group data
    const groupData = await Models.Group.findById(leafNodeData.group).cache(
      60 * 60 * 24 * 30
    );

    leafNodesWithGroup.push({
      name: leafNode.name,
      response: leafNode.response,
      group: groupData.name
    });
  }

  return leafNodesWithGroup;
}
async function createRowsFirstLevelAndOneLeafNode(
  apps,
  categoryNameData,
  headers,
  isDefaultRange
) {
  const rows = [];

  const representNodeInGroup = [];
  // loop app
  for (let i = 0; i < apps.length; i++) {
    const row = [];
    const { name: appName, nodes, appId, response: appValue } = apps[i];
    const appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30);
    const categoryId = getCategortIdByName(
      appData.categoryName,
      categoryNameData
    );

    row[slug("AppId")] = appData.appId;
    // loop leaf nodes
    for (let j = 0; j < nodes.length; j++) {
      const { name: nodeName, response: nodeValue, leafNodes } = nodes[j];
      // loop leaf nodes

      const leafNodesWithGroup = await findGroupForLeafNode(
        nodeName,
        leafNodes
      );

      const leafNodeByGroups = _.groupBy(leafNodesWithGroup, "group");

      // loop group
      for (const groupName in leafNodeByGroups) {
        const leafNodeByGroupValues = leafNodeByGroups[groupName];

        row[slug(groupName)] = isDefaultRange
          ? leafNodeByGroupValues[0].response
          : leafNodeByGroupValues[0].response / 5;
      }

      // row[slug(nodeName)] =
      //   nodeValue == 1 || nodeValue == 2 ? 1 : nodeValue == 3 ? 2 : 3; // first level
    }
    // row[slug("app")] =
    //   appValue == 1 || appValue == 2 ? 1 : appValue == 3 ? 2 : 3; // label [1,3]

    row[slug("app")] = isDefaultRange ? appValue : appValue / 5;
    row[slug("categories")] = categoryId; // categories

    rows.push(row);
  }
  // const result = computeEmptyNodes(rows, headers);

  // first level undefined

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const groups = _.groupBy(headers, "group");

    for (const groupName in groups) {
      if (groupName) {
        // init value if node = undefind
        if (!row[slug(groupName)]) row[slug(groupName)] = 0;
      }
    }
  }
  return rows;
}

function computeEmptyNodes(rows, headers) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const groups = _.groupBy(headers, "group");

    for (const groupName in groups) {
      if (groupName) {
        const leafNodes = groups[groupName];
        let total = 0;

        // get total
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (row[id]) {
            total += row[id];
          }
        }

        const initValue = total / leafNodes.length;
        // assign value
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (!row[id]) {
            row[id] = initValue;
          }
        }

        // init value if node = undefind
        if (!row[slug(groupName)]) row[slug(groupName)] = 1;
      }
    }
  }
  return rows;
}

function computeEmptyNodesDistance(rows, headers) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const groups = _.groupBy(headers, "group");

    for (const groupName in groups) {
      if (groupName) {
        const leafNodes = groups[groupName];
        let total = 0;

        // get total
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (row[id]) {
            total += row[id];
          }
        }

        const initValue = total / (leafNodes.length + 1);
        // assign value
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (!row[id]) {
            row[id] = initValue;
          }
        }

        // firstLevel
        row[slug(groupName)] = initValue;
      }
    }

    // console.log(1, initValue, total, headers.length);
  }
  return rows;
}

function computeEmptyNodesDistanceFirstLevel(rows, headers) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const groups = _.groupBy(headers, "group");

    for (const groupName in groups) {
      if (groupName) {
        const leafNodes = groups[groupName];
        let total = 0;

        // get total
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (row[id]) {
            total += row[id];
          }
        }

        const initValue = total / (leafNodes.length + 1);
        // assign value
        for (let j = 0; j < leafNodes.length; j++) {
          const { id } = leafNodes[j];
          // row[id]: response of leafNode
          if (!row[id]) {
            row[id] = initValue;
          }
        }

        // firstLevel
        row[slug(groupName)] = initValue;
      }
    }

    // init value group
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let total = 0;
      let length = 0;

      const groups = _.groupBy(headers, "group");

      for (const groupName in groups) {
        if (groupName) {
          const value = row[groupName];

          length++;
          if (value) {
            total += value;
          }
        }
      }

      for (const groupName in groups) {
        if (groupName) {
          const value = row[groupName];

          if (!value) {
            row[groupName] = total / length;
          }
        }
      }
    }
    // console.log(1, initValue, total, headers.length);
  }
  return rows;
}

function getComparedNodes(comparingNode, tree) {
  const { name: nodeName, path: nodePath } = comparingNode;

  let arrayPaths = nodePath.split(".");

  let node = tree;

  for (let j = 0; j < arrayPaths.length; j++) {
    const arrayPath = arrayPaths[j];

    node = node.children[arrayPath];
  }

  // if = 1
  if (node && node.baseLine == 1) return { name: node.name, path: nodePath };

  return getComparedNodesBigValue(comparingNode, tree);
}
function getComparedNodesBigValue(comparingNode, tree) {
  const { path: nodePath } = comparingNode;

  if (nodePath && nodePath != "") {
    let arrayPaths = nodePath.split(".");

    let node = tree;

    for (let j = 0; j < arrayPaths.length - 1; j++) {
      const arrayPath = arrayPaths[j];

      node = node.children[arrayPath];
    }

    const childrenNodeValues = node.children.map(item =>
      parseFloat(item.baseLine)
    );

    const bigValue = Math.max(...childrenNodeValues);
    if (bigValue != 0) {
      const indexOfBigValue = _.indexOf(childrenNodeValues, bigValue);

      const parentPath = arrayPaths.slice(0, arrayPaths.length - 1);
      parentPath.push(indexOfBigValue);

      return {
        name: node.children[indexOfBigValue].name,
        path: _.join(parentPath, ".")
      };
    } else {
      return getComparedNodesBigValue(node, tree);
    }
  }
}
function searchTree(element, matchingTitle) {
  if (element.name == matchingTitle) {
    return element;
  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle);
    }
    return result;
  }
  return null;
}

function initBaseLineValueForTree(tree, baseLineData) {
  const [headers, data] = baseLineData;
  // get index
  let index = _.indexOf(headers, tree.name);

  // get value
  tree.baseLine = index == -1 ? 0 : data[index];

  if (tree.children && tree.children.length > 0) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      initBaseLineValueForTree(child, baseLineData);
    }
  }

  return tree;
}

function getCommonNode(comparingNode, comparedNode, tree) {
  const { path: comparingPath } = comparingNode;
  const { path: comparedPath } = comparedNode;

  // if (comparingPath === comparedPath) {
  //   // console.log(comparingNode, comparedNode);
  //   const pathArray = comparingPath.split(".");

  //   const parentPath = pathArray.slice(0, pathArray.length - 1);

  //   let node = tree;

  //   for (let j = 0; j < parentPath.length; j++) {
  //     const arrayPath = parentPath[j];

  //     node = node.children[arrayPath];
  //   }

  //   return {
  //     name: node.name,
  //     path: _.join(parentPath, ".")
  //   };
  // }
  const comparingPathArray = comparingPath.split("."); // path
  const comparedPathArray = comparedPath.split("."); // path

  // ['0', '0', '2']['0', '3', '0']
  // second
  if (
    comparingPathArray[0] &&
    comparedPathArray[0] &&
    comparingPathArray[0] == comparedPathArray[0]
  ) {
    // third
    if (
      comparingPathArray[1] &&
      comparedPathArray[1] &&
      comparingPathArray[1] == comparedPathArray[1]
    ) {
      // fourth
      if (
        comparingPathArray[2] &&
        comparedPathArray[2] &&
        comparingPathArray[2] == comparedPathArray[2]
      ) {
        return {
          name:
            tree.children[comparingPathArray[0]].children[comparingPathArray[1]]
              .children[comparingPathArray[2]].name,
          path: `${comparingPathArray[0]}.${comparingPathArray[1]}.${comparingPathArray[2]}`
        };
      } else {
        return {
          name:
            tree.children[comparingPathArray[0]].children[comparingPathArray[1]]
              .name,
          path: `${comparingPathArray[0]}.${comparingPathArray[1]}`
        };
      }
    } else {
      return {
        name: tree.children[comparingPathArray[0]].name,
        path: `${comparingPathArray[0]}`
      };
    }
  }

  return {
    name: tree.name,
    path: -1
  };
}

function getBaseLineVaLueOfNode(searchedNode, tree) {
  const { path: nodePath } = searchedNode;
  if (nodePath == -1) return tree.baseLine;
  // node root
  if (nodePath == "") return tree.baseLine;

  let arrayPaths = nodePath.split(".");

  let node = tree;

  for (let j = 0; j < arrayPaths.length; j++) {
    const arrayPath = arrayPaths[j];

    node = node.children[arrayPath];
  }

  return node.baseLine;
}

function getDistanceToCommonNode(node) {
  const { path } = node;

  if (path == -1) return 0;

  return path.split(".").length;
}
function getDistanceFromNodeToCommonNode(node, commonNode) {
  if (commonNode.path === -1) return node.path.split(".").length;

  return node.path.split(".").length - commonNode.path.split(".").length;
}
async function createRowsDistance(
  apps,
  { categoryNameData, headers, trees, DAP_PATH }
) {
  const rows = [];

  // loop app
  for (let i = 0; i < apps.length; i++) {
    const row = [];
    const { name: appName, nodes, appId, response: appValue } = apps[i];

    const appData = await Models.App.findById(appId).cache(60 * 60 * 24 * 30);
    const categoryId = getCategortIdByName(
      appData.categoryName,
      categoryNameData
    );

    row[slug("AppId")] = appData.appId;
    // loop leaf nodes
    for (let j = 0; j < nodes.length; j++) {
      const { name: nodeName, response: nodeValue, leafNodes } = nodes[j];

      const baseLineData = await csv({
        noheader: true,
        output: "csv"
      }).fromFile(
        DAP_PATH +
          "/" +
          appData.categoryName +
          "/" +
          nodeName +
          "_GenCSVFile4ML.csv"
      );

      const indexChildTree = _.findIndex(trees.children, ["name", nodeName]);
      const childTree = JSON.parse(
        JSON.stringify(trees.children[indexChildTree])
      );
      initBaseLineValueForTree(childTree, baseLineData);

      // loop leaf nodes
      for (let k = 0; k < leafNodes.length; k++) {
        const { name: leafNodeName } = leafNodes[k];
        let leafNodeValue;

        // comparing node
        const leafNodeInTree = searchTree(childTree, leafNodeName);
        // console.log(leafNodeName, leafNodeInTree, childTree.children[0]);
        const comparedNode = getComparedNodes(leafNodeInTree, childTree);

        if (comparedNode) {
          if (leafNodeInTree.path === comparedNode.path) {
            leafNodeValue = 0;
          } else {
            const commonNode = getCommonNode(
              leafNodeInTree,
              comparedNode,
              childTree
            );

            const vRoot = childTree.baseLine;
            const vCaa = getBaseLineVaLueOfNode(commonNode, childTree);
            const depthCaa = getDistanceToCommonNode(commonNode);
            const vN1 = getBaseLineVaLueOfNode(leafNodeInTree, childTree);
            const vN2 = getBaseLineVaLueOfNode(comparedNode, childTree);

            const disN1 = getDistanceFromNodeToCommonNode(
              leafNodeInTree,
              commonNode
            );
            const disN2 = getDistanceFromNodeToCommonNode(
              comparedNode,
              commonNode
            );

            leafNodeValue =
              (2 * (1 - vRoot) * (1 - vCaa) * depthCaa) /
              ((1 - vN1) * disN1 +
                (1 - vN2) * disN2 +
                2 * (1 - vRoot) * (1 - vCaa) * depthCaa);
            // recordForTree[slug(comparingNode.name)] = result;
          }
        } else {
          leafNodeValue = 1;
        }

        row[slug(leafNodeName)] = leafNodeValue; // leaf nodes
      }
      row[slug(nodeName)] = nodeValue / 5; // first level

      row[slug(nodeName)] =
        nodeValue == 1 || nodeValue == 2 ? 1 : nodeValue == 3 ? 2 : 3; // first level
    }
    row[slug("app")] = appValue; // label
    row[slug("categories")] = categoryId; // categories

    rows.push(row);
  }
  const result = computeEmptyNodesDistance(rows, headers);
  return result;
}

async function createRowsDistanceFirstLevel(
  apps,
  { categoryNameData, headers, trees, DAP_PATH }
) {
  const rows = [];

  // loop app
  for (let i = 0; i < apps.length; i++) {
    const row = [];
    const { name: appName, nodes, appId, response: appValue } = apps[i];

    const appData = await Models.App.findById(appId);
    const categoryId = getCategortIdByName(
      appData.categoryName,
      categoryNameData
    );

    row[slug("AppId")] = appData.appId;
    // loop leaf nodes
    for (let j = 0; j < nodes.length; j++) {
      const { name: nodeName, response: nodeValue, leafNodes } = nodes[j];

      const baseLineData = await csv({
        noheader: true,
        output: "csv"
      }).fromFile(
        DAP_PATH +
          "/" +
          appData.categoryName +
          "/" +
          nodeName +
          "_GenCSVFile4ML.csv"
      );

      const indexChildTree = _.findIndex(trees.children, ["name", nodeName]);
      const childTree = JSON.parse(
        JSON.stringify(trees.children[indexChildTree])
      );
      initBaseLineValueForTree(childTree, baseLineData);

      // loop leaf nodes
      for (let k = 0; k < leafNodes.length; k++) {
        const { name: leafNodeName } = leafNodes[k];
        let leafNodeValue;

        // comparing node
        const leafNodeInTree = searchTree(childTree, leafNodeName);
        // console.log(leafNodeName, leafNodeInTree, childTree.children[0]);
        const comparedNode = getComparedNodes(leafNodeInTree, childTree);

        if (comparedNode) {
          if (leafNodeInTree.path === comparedNode.path) {
            leafNodeValue = 0;
          } else {
            const commonNode = getCommonNode(
              leafNodeInTree,
              comparedNode,
              childTree
            );

            const vRoot = childTree.baseLine;
            const vCaa = getBaseLineVaLueOfNode(commonNode, childTree);
            const depthCaa = getDistanceToCommonNode(commonNode);
            const vN1 = getBaseLineVaLueOfNode(leafNodeInTree, childTree);
            const vN2 = getBaseLineVaLueOfNode(comparedNode, childTree);

            const disN1 = getDistanceFromNodeToCommonNode(
              leafNodeInTree,
              commonNode
            );
            const disN2 = getDistanceFromNodeToCommonNode(
              comparedNode,
              commonNode
            );

            leafNodeValue =
              (2 * (1 - vRoot) * (1 - vCaa) * depthCaa) /
              ((1 - vN1) * disN1 +
                (1 - vN2) * disN2 +
                2 * (1 - vRoot) * (1 - vCaa) * depthCaa);
            // recordForTree[slug(comparingNode.name)] = result;
          }
        } else {
          leafNodeValue = 1;
        }

        row[slug(leafNodeName)] = leafNodeValue; // leaf nodes
      }
      row[slug(nodeName)] = nodeValue / 5; // first level

      row[slug(nodeName)] =
        nodeValue == 1 || nodeValue == 2 ? 1 : nodeValue == 3 ? 2 : 3; // first level
    }
    row[slug("app")] = appValue; // label
    row[slug("categories")] = categoryId; // categories

    rows.push(row);
  }
  const result = computeEmptyNodesDistanceFirstLevel(rows, headers);
  return result;
}

const getAppsCategories = async appIds => {
  const result = [];
  for (let i = 0; i < appIds.length; i++) {
    const appId = appIds[i];

    const appData = await Models.App.findOne({
      appId
    })
      .select(["_id", "category"])
      .cache(60 * 60 * 24 * 30); // 1 month;

    result.push({
      appId,
      categoryId: appData.category
    });
  }

  return result;
};
export default {
  getAppsCategories,
  createRows,
  createRowsDistanceFirstLevel,
  createRowsDistance,
  createHeaders,
  getDataForFirstLevel,
  getContentGroup,
  getContentTxtFile,
  objectToArray,
  getCategoryNameByAppId,
  creatingTrees,
  checkExistingInTrees,
  createQuestion,
  cloneObject,
  getDataForQuestion,
  getPermissions,
  getLeafNodesRequiredDetails,
  createRowsFirstLevelAndOneLeafNode,
  creatingTreesWithGroup,
  createHeadersWithGroup,
  getLeafNodes,
  getAPIFromNode
};
