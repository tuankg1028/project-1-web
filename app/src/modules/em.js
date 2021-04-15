const path = require("path");
const csv = require("csvtojson");
const _ = require("lodash");
var expectation_maximization = require("expectation-maximization");
const filePath = path.join(
  __dirname,
  "../../data/em/apps_categories_Test2.csv"
);
async function main() {
  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(filePath);

  const [, ...rows] = fileData;

  // group rows by category
  const rowsByCategories = _.groupBy(rows, (item) => item[2]);

  // unlabel, label
  const rowsUnLabel = [],
    rowsLabel = [];
  for (const categoryId in rowsByCategories) {
    const rowsByCategory = rowsByCategories[categoryId];

    rowsLabel.push(rowsByCategory[0]);
    rowsLabel.push(rowsByCategory[1]);
    rowsLabel.push(rowsByCategory[2]);

    rowsByCategory[3].splice(-1, 1);
    rowsUnLabel.push(rowsByCategory[3]);
    rowsByCategory[4].splice(-1, 1);
    rowsUnLabel.push(rowsByCategory[4]);
  }

  // label
  // console.log("Apps Label");
  // for (let i = 0; i < rowsLabel.length; i++) {
  //   const rowLabel = rowsLabel[i];
  //   rowLabel = _.map(rowLabel, Number);
  //   const groups = expectation_maximization(rowLabel, 1);
  //   console.log(`APP ID: ${rowLabel[0]} with Weight is ${groups[0].weight}`);
  // }

  // Unlabel
  console.log("Apps UnLabel");
  for (let i = 0; i < 1; i++) {
    let rowUnLabel = rowsUnLabel[i];
    rowUnLabel = _.map(rowUnLabel, Number);
    const groups = expectation_maximization(
      [
        [1, 2],
        [2, 3],
        [2, 4],
        [2, 4],
        [2, 4],
        [2, 4],

        [2, 4],
        [2, 4],
        [2, 4],

        [2, 4],
      ],
      3
    );
    console.log(1, groups[0]);
    console.log(1, groups[0].probability([1, 1, 2]));
    // console.log(`
    //   APP ID: ${rowUnLabel[0]} with Weight is ${groups[0].weight} \n
    //   * Groups:
    //   - 0: ${groups[0].probability([0, 1])}
    //   - 1: ${groups[1].probability(0, 1, 2)}
    //   - 2: ${groups[2].probability(0, 1, 2)}
    // `);
  }
}
main();
