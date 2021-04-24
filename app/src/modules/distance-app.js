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
async function createTree(data, parent = null) {
  let result = [];
  const nodes = await Models.Tree.find({
    parent,
  })
    .limit(1)
    .cache(60 * 60 * 24 * 30);
  if (nodes && nodes.length === 0) return result;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    const children = await createTree(data, node.id);
    result.push({
      ...JSON.parse(JSON.stringify(node)),
      children: children.length ? children : null,
    });
  }

  return result;
}
async function computingDistance() {
  try {
    for (let i = 0; i < 1; i++) {
      const category = categories[i];
      // GET DAP
      const dapCategory = await Models.CategoryMDroid.find({
        categoryName: category,
      });
      const trees = (await createTree(_.map(dapCategory.nodes, "name")))[0];

      // ============ LOOP TREES =============
      for (let j = 0; j < trees.children.length; j++) {
        const treeChild = trees.children[j];
        console.log(1, treeChild);
        return;

        const recordsForTree = [];

        // recordsForTree
        let buildTreeData = await csv({
          noheader: true,
          output: "csv",
        }).fromFile(getBuildTreeFile(treeChild.name, subFolderName));

        const apps = await Models.App.find({
          categoryName: category,
        });
        const [buildTreeHeaders, ...buildTreeRows] = buildTreeData;
        for (let k = 0; k < buildTreeRows.length; k++) {
          const buildTreeRow = buildTreeRows[k];

          // console.log(buildTreeRow);
          const recordForTree = {};

          recordForTree["AppID"] = buildTreeRow[0];
          // recordForTree["categories"] = subFolderName;

          initDistanceValueForTree(treeChild, buildTreeRow, buildTreeHeaders);

          // compareing nodes
          let comparingNodes = getComparingNodes(treeChild);
          comparingNodes = _.flattenDeep(comparingNodes);

          for (let g = 0; g < comparingNodes.length; g++) {
            const comparingNode = comparingNodes[g];
            const comparedNode = getComparedNodes(comparingNode, treeChild);

            // if comparedNode exist
            if (comparedNode) {
              if (comparingNode.path === comparedNode.path) {
                recordForTree[comparingNode.name] = 0;
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

                const result =
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

                if (!test[buildTreeRow[0]]) test[buildTreeRow[0]] = [];
                test[buildTreeRow[0]].push({
                  name: `${comparingNode.name}-${comparedNode.name}`,
                  distance: result,
                });

                recordForTree[slug(comparingNode.name)] = result;
              }
              // console.log(vRoot, vCaa, depthCaa, vN1, vN2, disN1, disN2, result);
            }
            // not exist
            else {
              recordForTree[slug(comparingNode.name)] = 1; // khong co nut de so sanh
            }
          }

          // record for big
          if (!recordsTemp[recordForTree["AppID"]]) {
            recordsTemp[recordForTree["AppID"]] = [];
          }
          recordsTemp[recordForTree["AppID"]].push(recordForTree);

          recordsForTree.push(recordForTree);
        }

        // ============== CREATING FILE ==============

        await makeDir(folderDistance);
        await makeDir(folderDistance + "/" + subFolderName);
        const pathOutputDistance =
          folderDistance +
          "/" +
          subFolderName +
          "/" +
          `${treeChild.name}` +
          "_" +
          folderName +
          ".csv";

        const csvWriter = createCsvWriter({
          path: pathOutputDistance,
          header: headersForTree,
        });

        await csvWriter.writeRecords(recordsForTree); // returns a promise
      }

      records.push(...creatingRecordsByObject(recordsTemp, i + 1));
    }

    const csvWriter = createCsvWriter({
      path: folderDistance + "/" + "distance_categories.csv",
      header: headers,
    });

    await csvWriter.writeRecords(records); // returns a promise
    // }

    let content = "";
    for (const appId in test) {
      const value = test[appId];

      content += `APP ID: ${appId} \n`;

      for (let i = 0; i < value.length; i++) {
        const item = value[i];

        content += `  + ${item.name}: ${item.distance} \n`;
      }
    }

    writeFileSync("./3apps.txt", content);
  } catch (err) {
    console.log("MAIN", err);
  }
}

computingDistance();
