import csv from "csvtojson";
const path = require("path");
const _ = require("lodash");
import chalk from "chalk";

// [ 'ID', 'Name', 'Level', 'Parent' ],
async function test() {
  const infoCollection = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/information collected-Table 1.csv"
    )
  );

  const permissions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/permission-Table 1.csv"
    )
  );

  const interactions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/interaction-Table 1.csv"
    )
  );

  const lv1Nodes = interactions.filter(item => item[3] === "null");

  const questions = [];
  lv1Nodes.forEach(([id]) => {
    const lv2Nodes = interactions.filter(item => item[3] === id);

    lv2Nodes.forEach(lv2Node => {
      const permission =
        permissions[Math.floor(Math.random() * permissions.length)];
      const collection =
        infoCollection[Math.floor(Math.random() * infoCollection.length)];

      let lv3 = interactions.find(([, , level, ...parentIds]) => {
        parentIds = parentIds[0].split(",");
        return level === "3" && _.includes(parentIds, lv2Node[0]);
      });

      questions.push({
        id: lv2Node[0],
        name: lv2Node[1],
        groupId: id,
        lv3,
        subItem: {
          ...permission,
          type: "permission"
        }
      });

      lv3 = interactions.find(([, , level, ...parentIds]) => {
        parentIds = parentIds[0].split(",");
        return level === "3" && _.includes(parentIds, lv2Node[0]);
      });
      questions.push({
        id: lv2Node[0],
        name: lv2Node[1],
        groupId: id,
        lv3,
        subItem: {
          ...collection,
          type: "collection"
        }
      });
    });
  });

  const groupQuestions = _.groupBy(questions, "groupId");
  //   subItem: {
  //     '0': '9',
  //     '1': 'steps',
  //     '2': '2',
  //     '3': '8',
  //     '4': '',
  //     type: 'collection'
  //   }
  for (const groupId in groupQuestions) {
    console.log("=========");
    const questions = groupQuestions[groupId];
    const group = interactions.find(item => item[0] === groupId);
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      //   console.log(question);

      //   if (groupId === "1") {
      if (question.subItem.type === "collection") {
        console.log(
          chalk.bgGreen.black(
            `You are playing ${question.name}. Do you allow to share your ${question.lv3[1]} to collect your ${question.subItem[1]}? (Information collected)`
          )
        );
      } else {
        console.log(
          chalk.bgBlue.black(
            `You are playing ${question.name}. Do you allow to share your ${question.lv3[1]} with you ${question.subItem[1]}? (permission)`
          )
        );
      }
      //   }
    }
  }
}
test();
