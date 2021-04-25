require("dotenv").config();
import "../configs/mongoose.config";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
import Models from "../models";
import _ from "lodash";
const categoryGroups = {
  Beauty: ["Beauty", "Lifestyle"],
  Business: ["Business"],
  Education: ["Education", "Educational"],
  Entertainment: ["Entertainment", "Photography"],
  Finance: [
    "Finance",
    "Events",
    "Action",
    "Action & Adventure",
    "Adventure",
    "Arcade",
    "Art & Design",
    "Auto & Vehicles",
    "Board",
    "Books & Reference",
    "Brain Games",
    "Card",
    "Casino",
    "Casual",
    "Comics",
    "Creativity",
    "House & Home",
    "Libraries & Demo",
    "News & Magazines",
    "Parenting",
    "Pretend Play",
    "Productivity",
    "Puzzle",
    "Racing",
    "Role Playing",
    "Simulation",
    "Strategy",
    "Trivia",
    "Weather",
    "Word",
  ],
  "Food & Drink": ["Food & Drink"],
  "Health & Fitness": ["Health & Fitness"],
  "Maps & Navigation": ["Maps & Navigation"],
  Medical: ["Medical"],
  "Music & Audio": [
    "Music & Audio",
    "Video Players & Editors",
    "Music & Video",
    "Music",
  ],
  Shopping: ["Shopping"],
  Social: ["Social", "Dating", "Communication"],
  Sports: ["Sports"],
  Tools: ["Tools", "Personalization"],
  "Travel & Local": ["Travel & Local"],
};
const categories = [
  "Beauty",
  "Lifestyle",
  "Business",
  "Education",
  "Educational",
  "Entertainment",
  "Photography",
  "Finance",
  "Events",
  "Action",
  "Action & Adventure",
  "Adventure",
  "Arcade",
  "Art & Design",
  "Auto & Vehicles",
  "Board",
  "Books & Reference",
  "Brain Games",
  "Card",
  "Casino",
  "Casual",
  "Comics",
  "Creativity",
  "House & Home",
  "Libraries & Demo",
  "News & Magazines",
  "Parenting",
  "Pretend Play",
  "Productivity",
  "Puzzle",
  "Racing",
  "Role Playing",
  "Simulation",
  "Strategy",
  "Trivia",
  "Weather",
  "Word",
  "Food & Drink",
  "Health & Fitness",
  "Maps & Navigation",
  "Medical",
  "Music & Audio",
  "Video Players & Editors",
  "Music & Video",
  "Music",
  "Shopping",
  "Social",
  "Dating",
  "Communication",
  "Sports",
  "Tools",
  "Personalization",
  "Travel & Local",
];
async function createTree(data, parent = null, path = "") {
  let result = [];
  const nodes = await Models.Tree.find({
    parent,
  })
    .limit(1)
    .cache(60 * 60 * 24 * 30);
  if (nodes && nodes.length === 0) return result;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    const children = await createTree(data, node.id, path + `${i}.`);
    result.push({
      ...JSON.parse(JSON.stringify(node)),
      mappingFunction: _.includes(data, node.name),
      children: children.length ? children : null,
      path,
    });
  }

  return result;
}

function initBaseLineForTree(treeChild, nodeNameData) {
  if (~nodeNameData.indexOf(treeChild.name)) treeChild.baseLine = 1;
  else treeChild.baseLine = 0;

  if (treeChild.children && treeChild.children.length)
    treeChild.children.forEach((item) =>
      initBaseLineForTree(item, nodeNameData)
    );
}
function getComparedNodes(comparingNode, tree) {
  const { name: nodeName, path: nodePath } = comparingNode;

  let arrayPaths = nodePath.split(".");

  let node = tree;

  for (let j = 0; j < arrayPaths.length; j++) {
    const arrayPath = arrayPaths[j];

    node = node.children[arrayPath];
  }

  // if (node.baseLine == 1) return { name: node.name, path: nodePath };

  return getComparedNodesBigValue(comparingNode, tree);
}
function getComparedNodesBigValue(comparingNode, tree) {
  const { path: nodePath } = comparingNode;

  if (nodePath !== undefined) {
    let arrayPaths = nodePath.split(".");

    let node = tree;

    for (let j = 0; j < arrayPaths.length - 1; j++) {
      const arrayPath = arrayPaths[j];

      node = node.children[arrayPath];
    }

    const childrenNodeValues = node.children.map((item) =>
      parseFloat(item.baseLine)
    );

    const bigValue = Math.max(...childrenNodeValues);

    if (bigValue != 0) {
      const indexOfBigValue = _.indexOf(childrenNodeValues, bigValue);

      const parentPath = arrayPaths.slice(0, arrayPaths.length - 1);
      parentPath.push(indexOfBigValue);

      return {
        name: node.children[indexOfBigValue].name,
        path: _.join(parentPath, "."),
      };
    } else {
      return getComparedNodesBigValue(node, tree);
    }
  }
}

function getFlattenTrees(trees, result) {
  if (trees.children) {
    trees.children.forEach((item) => getFlattenTrees(item, result));
  }
  delete trees.children;
  result.push(trees);
}

function getCommonNode(comparingNode, comparedNode, tree) {
  const { path: comparingPath } = comparingNode;
  const { path: comparedPath } = comparedNode;

  const comparingPathArray = comparingPath.split("."); // path
  const comparedPathArray = comparedPath.split("."); // path

  let deepLevelOfCommonNode;

  for (let i = 0; i < comparingPathArray.length; i++) {
    if (comparingPathArray[i] == comparedPathArray[i])
      deepLevelOfCommonNode = ++i;
    else break;
  }

  if (!deepLevelOfCommonNode) {
    return {
      name: tree.name,
      path: -1,
    };
  }

  // get common node by deep
  let commonNode = tree;
  for (let i = 0; i < deepLevelOfCommonNode; i++) {
    commonNode = commonNode.children[comparingPathArray[i]];
  }

  return {
    name: commonNode.name,
    path: commonNode.path,
  };
}

function getBaseLineVaLueOfNode(searchedNode, tree) {
  const { path: nodePath } = searchedNode;

  // node root
  if (nodePath == "" || nodePath == -1) return tree.baseLine;

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

async function computingDistance() {
  try {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      // GET DAP
      const dapCategory = await Models.CategoryMDroid.find({
        categoryName: category,
      }).cache(60 * 60 * 24 * 30);
      const trees = (await createTree(_.map(dapCategory.nodes, "name")))[0];

      // ============ LOOP TREES =============
      for (let j = 0; j < trees.children.length; j++) {
        const treeChild = trees.children[j];
        let flattenTree = [];
        getFlattenTrees({ ...treeChild }, flattenTree);

        const apps = await Models.App.find({
          categoryName: category,
          isCompleted: true,
        }).cache(60 * 60 * 24 * 30);
        for (let k = 0; apps.length < 1; k++) {
          const app = apps[k];
          const appNodes = app.nodes;
          initBaseLineForTree(treeChild, _.map(appNodes, "name"));

          // compareing nodes
          let comparingNodes = flattenTree.filter(
            (item) =>
              item.mappingFunction === 1 &&
              _.map(appNodes, "name").includes(item.name)
          );

          for (let g = 0; g < comparingNodes.length; g++) {
            const comparingNode = comparingNodes[g];
            const comparedNode = getComparedNodes(comparingNode, treeChild);

            let result;
            // if comparedNode exist
            if (comparedNode) {
              if (comparingNode.path === comparedNode.path) {
                result = 0;
              } else {
                const commonNode = getCommonNode(
                  comparingNode,
                  comparedNode,
                  treeChild
                );

                const vRoot = treeChild.baseLine;
                const vCaa = getBaseLineVaLueOfNode(commonNode, treeChild);

                const depthCaa = getDistanceToCommonNode(commonNode);

                const vN1 = getBaseLineVaLueOfNode(comparingNode, treeChild);

                const vN2 = getBaseLineVaLueOfNode(comparedNode, treeChild);

                const disN1 = getDistanceFromNodeToCommonNode(
                  comparingNode,
                  commonNode
                );

                const disN2 = getDistanceFromNodeToCommonNode(
                  comparedNode,
                  commonNode
                );

                result =
                  1 -
                  ((2 * (1 - vCaa) * depthCaa) /
                    ((1 - vN1) * disN1 * (1 - vCaa) +
                      (1 - vN2) * disN2 * (1 - vCaa) +
                      2 * (1 - vCaa) * depthCaa) || 0);

                // giai thuat ban đầu
                // const result =
                // 1 -
                // ((2 * (1 - vRoot) * (1 - vCaa) * depthCaa) /
                //   ((1 - vN1) * disN1 * (1 - vCaa) +
                //     (1 - vN2) * disN2 * (1 - vCaa) +
                //     2 * (1 - vRoot) * (1 - vCaa) * depthCaa) || 0);
              }
              // console.log(vRoot, vCaa, depthCaa, vN1, vN2, disN1, disN2, result);
            }
            // not exist
            else {
              result = 1; // khong co nut de so sanh
            }

            console.log(`App Id ${app.id}: ${result}`);
          }
        }
      }
    }
  } catch (err) {
    console.log("MAIN", err);
  }
}

computingDistance();
