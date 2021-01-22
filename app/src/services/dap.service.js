import readXlsxFile from "read-excel-file/node";
import chalk from "chalk";
import _ from "lodash";
import path from "path";
import csv from "csvtojson";

const { TREE_CATEGORIES_PATH } = process.env;

const creatingDAP = async () => {
  let treeCategories = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(TREE_CATEGORIES_PATH);
  let [[, ...treeCategoriesHeaders], ...treeCategoriesRows] = treeCategories;
  const categoriesIndexs = treeCategoriesRows.map((item) => _.last(item));

  const levelDataInExcelFile = await readXlsxFile(excelPath);

  // ====================== BASELINE ====================
  const treesBaseLine = await _creatingTrees(levelDataInExcelFile);
  console.log(
    chalk.bgGreen.black("========== GENERATING DAP ............ ==============")
  );
  for (let i = 0; i < treesBaseLine.children.length; i++) {
    const tree = treesBaseLine.children[i];
    let headersForBaseLine = _.drop(_creatingHeadersForTree(tree));
    let recordsForBaseLine = {};

    const treesBaseLineTemp = (await _creatingTrees(levelDataInExcelFile))
      .children[i];

    for (let j = 0; j < categoriesIndexs.length; j++) {
      const categoriesIndex = categoriesIndexs[j];

      const folderName = await _getCategoryNameByIndex(categoriesIndex);

      let treeData = await _initDataForTreeBaseLine(
        treesBaseLineTemp,
        categoriesIndex
      );

      for (let k = 0; k < headersForBaseLine.length; k++) {
        const { id, title } = headersForBaseLine[k];

        let nodeHeader = _searchTree(treeData, title);

        if (!recordsForBaseLine[folderName])
          recordsForBaseLine[folderName] = {};
        recordsForBaseLine[folderName][id] = nodeHeader.value;
      }
    }

    folderCSVBaseLineOutput =
      path.dirname(mappingFunctionPath) + "/" + `DAP_${folderName}`;

    // =================== OVERWRITE CSV FILE ==============
    if (!folderName)
      folderName = _.last(path.dirname(mappingFunctionPath).split("/"));
    if (!pathFolder)
      path.dirname(mappingFunctionPath) + "/" + `buildtree_${folderName}`;

    await makeDir(folderCSVBaseLineOutput);

    for (const key in recordsForBaseLine) {
      const element = recordsForBaseLine[key];

      await makeDir(folderCSVBaseLineOutput + "/" + key);

      const pathOutPutBaseLineFile =
        folderCSVBaseLineOutput +
        "/" +
        key +
        "/" +
        `${tree.name}` +
        "_" +
        folderName +
        ".csv";
      const csvWriter = createCsvWriter({
        path: pathOutPutBaseLineFile,
        header: headersForBaseLine,
      });

      await csvWriter.writeRecords([element]);
    }
  }
  console.log(
    chalk.bgGreen.black(" ========== DONE GENERATING DAP ==============")
  );
};

const _creatingTrees = async (rows) => {
  // init trees
  let trees = {
    name: "Privacy",
    value: -1,
    children: [],
  };

  for (let i = 1; i < rows.length; i++) {
    const [
      ,
      ,
      ,
      firstLevel,
      secondLevel,
      thirdLevel,
      fourthLevel,
      detail,
      group,
      meaning,
    ] = rows[i];

    // exist
    if (firstLevel && firstLevel !== "Storage" && firstLevel !== "Time") {
      // ================== check existing (first) ==================
      var [firstLevelIsExist] = _checkExistingInTrees(
        trees,
        firstLevel,
        "first"
      );
      if (!firstLevelIsExist) {
        // push to children array
        trees.children.push({
          name: firstLevel,
          value: -1,
          children: [],
        });
      }

      // exist
      if (group) {
        // ================== check existing (second) ==================
        var [secondLevelIsExist, firstLevelIndex] = _checkExistingInTrees(
          trees,
          group,
          "second",
          firstLevel
        );

        if (!secondLevelIsExist) {
          // push to first level children array
          trees.children[firstLevelIndex]["children"].push({
            name: group,
            value: -1,
            children: [],
          });
        }
      }

      // exist
      if (fourthLevel) {
        // ================== check existing (third) ==================
        var [
          thirdLevelIsExist,
          firstLevelIndex,
          secondLevelIndex,
        ] = _checkExistingInTrees(
          trees,
          fourthLevel,
          "third",
          firstLevel,
          group
        );

        if (!thirdLevelIsExist) {
          // push to second level children array
          trees.children[firstLevelIndex]["children"][secondLevelIndex][
            "children"
          ].push({
            name: fourthLevel,
            value: -1,
          });
        }
      }
    }
  }
  return trees;
};

const _creatingHeadersForTree = (tree) => {
  let headers = [];

  // AppID
  headers.push({
    id: "AppID",
    title: "AppID",
  });

  let result = _getLabelsLevels(tree, {}, 0);

  for (const key in result) {
    let tempHeaders = result[key];

    headers.push(tempHeaders);
  }

  return _.flatten(headers);
};

const _getCategoryNameByIndex = async (index) => {
  let categoryNameData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(categoryNamePath);

  const [, ...categoryNameDataRows] = categoryNameData;

  const [, folderName] = categoryNameDataRows[index - 1];
  return folderName;
};

const _initDataForTreeBaseLine = async (tree, categoriesIndex) => {
  // get leaf nodes
  let leafNodes = _getLeafNodes(tree);

  // init data for leaf nodes
  await _initDataForLeafNodeBaseLine(leafNodes, tree, categoriesIndex);

  // tính các nút còn lại
  _countingNode(tree);

  return tree;
};

const _searchTree = (element, matchingTitle) => {
  if (element.name == matchingTitle) {
    return element;
  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = _searchTree(element.children[i], matchingTitle);
    }
    return result;
  }
  return null;
};

const _getLeafNodes = (tree, path = "") => {
  const nodes = [];
  const { name, children } = tree;

  // array is not empty
  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      let childrenNodes = _getLeafNodes(child, path + `.${i}`);

      // push array to nodes
      if (childrenNodes.length > 0) nodes.push(childrenNodes);
    }
  } else {
    nodes.push({
      name,
      path: _.trim(path, "."),
    });
  }

  return _.flatten(nodes);
};

const _initDataForLeafNodeBaseLine = async (
  leafNodes,
  tree,
  categoriesIndex
) => {
  let levelFile = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(treeCategoriesPath);

  let [[, ...levelFileHeaders], ...levelFileDataRows] = levelFile;
  levelFileDataRows = levelFileDataRows.filter(
    (item) => _.last(item) == categoriesIndex
  );

  for (let i = 0; i < leafNodes.length; i++) {
    const { path } = leafNodes[i];

    let arrayPaths = path.split(".");

    let node = tree;

    for (let j = 0; j < arrayPaths.length; j++) {
      const arrayPath = arrayPaths[j];

      node = node.children[arrayPath];
    }

    //
    const { name: nameOfNode } = node;

    const index = _.indexOf(levelFileHeaders, nameOfNode);

    const value = _getValueForBaseLine(index, levelFileDataRows);

    node.value = value;
  }
};

const _getValueForBaseLine = (index, levelFileDataRows) => {
  let array = _getValuesInArrayByIndex(index + 1, levelFileDataRows);
  array = _.map(array, (i) => Number(i));

  let countValues = _.countBy(array);

  const { 0: totalDigitalZero = 0, 1: totalDigitalOne = 0 } = countValues;

  return totalDigitalOne >= totalDigitalZero ? 1 : 0;
};

const _getValuesInArrayByIndex = (index, array) => {
  return array.map((element) => {
    return element[index];
  });
};

const _countingNode = (tree) => {
  if (
    tree.children &&
    tree.children.length > 0 &&
    _totalValuesInArray(tree.children) < 0
  ) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      _countingNode(child);
    }
  }
  if (tree.children.length > 0 && _totalValuesInArray(tree.children) === 0)
    tree.value = 0;
  else {
    if (tree.children.length > 0) {
      tree.value = _totalValuesInArray(tree.children) / tree.children.length;
    }
  }
};

const _totalValuesInArray = (arr) => {
  return _.sum(_.map(arr, "value").map((i) => Number(i)));
};

const _checkExistingInTrees = (
  trees,
  key,
  level,
  firstLevelKey = null,
  secondLevelKey = null
) => {
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

          if (!_.includes(secondLevelKeys, key)) return [false, i];
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
              children: sencondLevelchildren,
            } = firstLevelchildren[j];

            // finding second level position
            if (sencondLevelName === secondLevelKey) {
              const thirdLevelKeys = _.map(sencondLevelchildren, "name");

              if (!_.includes(thirdLevelKeys, key)) return [false, i, j];
            }
          }
        }
      }

      break;
    }
  }

  return [true, null];
};

const _getLabelsLevels = (tree, data, level) => {
  const { name, children } = tree;
  // init
  if (!data[level]) data[level] = [];

  data[level].push({
    id: slug(name),
    title: name,
  });

  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const subTree = children[i];

      data = _getLabelsLevels(subTree, data, level + 1);
    }
  }
  return data;
};
export default {
  creatingDAP,
};
