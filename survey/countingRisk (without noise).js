import Models from "./src/models";
import fs from "fs";
import csv from "csvtojson";
import _ from "lodash";
import makeDir from "make-dir";
import path from "path";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const source = "./thirdFolder";
const trainingAndTestingPath = "./traningAndTesting";

main();
async function main() {
  await makeDir(trainingAndTestingPath);

  const files = await fs.readdirSync(source);

  let content = "";

  let totalTesting = 0;
  let totalCorrectRediction = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file === ".DS_Store") continue;
    // user id
    content += `ID-User         ${_.split(file, ".")[0]} \n`;

    const data = await csv({
      noheader: true,
      output: "csv"
    }).fromFile(source + "/" + file);

    const [, ...rows] = data;

    // convert array to json
    const dataJson = arrayToJson(rows);
    const setTraining = [];
    const setTesting = [];
    const groupCategory = _.groupBy(dataJson, "category");
    let totalTestingFile = 0;
    let totalCorrectRedictionFile = 0;

    for (const categoryName in groupCategory) {
      let dataOfCategory = groupCategory[categoryName];

      // get unique feed back values
      const clusters = _.sortBy(_.uniq(_.map(dataOfCategory, "feedBack")));

      // set training
      const setTrainingOfCategory = getSetTraining(dataOfCategory, clusters);
      setTraining.push(setTrainingOfCategory); // ***

      // set testing
      const setTestingOfCategory = getSetTesting(
        dataOfCategory,
        setTrainingOfCategory
      );

      // get value of ranges
      const { ranges: rangeOfValues, centroidOfClusters } = getValueOfRanges(
        setTrainingOfCategory
      );

      setTraining.push({
        appId: JSON.stringify(rangeOfValues),
        feedBack: JSON.stringify(centroidOfClusters)
      }); // ***

      // redicting
      const numberOfCorrentRediction = 0;
      for (let j = 0; j < setTestingOfCategory.length; j++) {
        let testing = setTestingOfCategory[j];
        let isCorrect = false; // ***
        const rangeOfDistance = getRangeOfClusterByDistance(
          testing.distance,
          rangeOfValues
        );

        // rangeOfDistance is a object (like: { '2': { start: 0, end: 1 } } )
        if (rangeOfDistance[testing.feedBack]) {
          numberOfCorrentRediction++;
          isCorrect = true; // ***
        }

        setTestingOfCategory[j] = {
          ...testing,
          risk_prediction: isCorrect
        };
      }

      setTesting.push(setTestingOfCategory); // ***
      setTesting.push({
        appId: `${numberOfCorrentRediction}/${
          setTestingOfCategory.length
        } (${(numberOfCorrentRediction / setTestingOfCategory.length) * 100}%)`
      }); // ***

      totalTestingFile += setTestingOfCategory.length; // ***
      totalCorrectRedictionFile += numberOfCorrentRediction; // ***

      // percent
      content += `${numberOfCorrentRediction}/${
        setTestingOfCategory.length
      }             ${(numberOfCorrentRediction / setTestingOfCategory.length) *
        100}% \n`; // ***
    }

    // percent
    content += `${totalCorrectRedictionFile}/${totalTestingFile} \n`; // ***

    totalTesting += totalTestingFile; // ***
    totalCorrectRediction += totalCorrectRedictionFile; // ***

    // save set traning and testing
    // console.log(setTesting);
    await saveSetData(_.flatten(setTesting), file, "testing"); // ***
    await saveSetData(_.flatten(setTraining), file, "traning"); // ***
  }

  // percent
  content += `--------------------------\n
  ${totalCorrectRediction}/${totalTesting} \n`; // ***

  fs.writeFileSync("./rediction.txt", content);
  console.log("DONE");
}

function getRangeOfClusterByDistance(distance, rangeOfValues) {
  for (let i = 0; i < rangeOfValues.length; i++) {
    const rangeOfValue = rangeOfValues[i];

    for (const cluster in rangeOfValue) {
      const range = rangeOfValue[cluster];

      if (_.inRange(distance, range.start, range.end)) {
        return rangeOfValue;
      }
    }
  }

  console.log("ERROR", "getRangeOfClusterByDistance", `distance: ${distance}`);
}
function getValueOfRanges(setTrainingOfCategory) {
  const ranges = [];

  const clusters = _.uniq(_.map(setTrainingOfCategory, "feedBack"));

  let centroidOfClusters = _.map(clusters, cluster => {
    return getValueOfCluster(cluster, setTrainingOfCategory);
  });
  centroidOfClusters = _.sortBy(centroidOfClusters);
  centroidOfClusters = [0, ...centroidOfClusters, 1];

  // create ranges
  let start = 0;
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const range = {};

    // if i = 2 then 1
    let end =
      i == clusters.length - 1
        ? 1
        : (parseFloat(centroidOfClusters[i + 1]) +
            parseFloat(parseFloat(centroidOfClusters[i + 2]))) /
          2;

    range[cluster] = {
      start,
      end
    };

    start = end;
    ranges.push(range);
  }

  return { ranges, centroidOfClusters };
}

function getValueOfCluster(cluter, setTrainingOfCategory) {
  const setTrainingOfCluster = _.filter(setTrainingOfCategory, item => {
    return item.feedBack == cluter;
  });
  switch (parseInt(cluter)) {
    case 1: {
      return parseFloat(_.maxBy(setTrainingOfCluster, "distance").distance);
      break;
    }
    case 2: {
      return parseFloat(_.maxBy(setTrainingOfCluster, "distance").distance);
      break;
    }

    case 3: {
      return parseFloat(_.maxBy(setTrainingOfCluster, "distance").distance);
      break;
    }
    case 4: {
      return parseFloat(_.minBy(setTrainingOfCluster, "distance").distance);
      break;
    }
    case 5: {
      return parseFloat(_.minBy(setTrainingOfCluster, "distance").distance);
      break;
    }
  }
}
async function saveSetData(data, file, setName) {
  const pathCSVFolder =
    trainingAndTestingPath + "/" + _.split(path.basename(file), ".")[0];
  await makeDir(pathCSVFolder);

  const headers = [
    {
      id: "AppId",
      title: "AppId"
    },
    {
      id: "average",
      title: "Average"
    },
    {
      id: "participant_of_feedback",
      title: "Participant of feedback"
    },
    {
      id: "time",
      title: "Time"
    },
    {
      id: "risk_prediction",
      title: "Risk prediction"
    },
    {
      id: "category",
      title: "Category"
    }
  ];

  const rows = _.map(data, item => {
    return {
      AppId: item.appId,
      average: item.distance,
      participant_of_feedback: item.feedBack,
      time: item.time,
      risk_prediction: item.risk_prediction,
      category: item.category
    };
  });

  // saveData Traing
  const csvWriter = createCsvWriter({
    path: pathCSVFolder + "/" + `${setName}.csv`,
    header: headers
  });
  await csvWriter.writeRecords(rows);
}
function getSetTesting(dataOfCategory, setTraining) {
  const setTraningAppIds = _.map(setTraining, "appId");
  return _.filter(dataOfCategory, item => {
    return !_.includes(setTraningAppIds, item.appId);
  });
}
function getSetTraining(dataOfCategory, clusters) {
  const apps = [];
  const retrictedAppId = [];
  const numberOfAppsNeeded = Math.floor((dataOfCategory.length / 100) * 60); // 5 or 6

  while (apps.length < numberOfAppsNeeded) {
    for (let i = 0; i < clusters.length; i++) {
      if (apps.length >= numberOfAppsNeeded) break;
      const cluster = clusters[i];

      const appWithCluster = _.filter(dataOfCategory, app => {
        return (
          app.feedBack == cluster && !_.includes(retrictedAppId, app.appId)
        );
      });

      if (appWithCluster.length > 0) {
        const selectedApp = appWithCluster[0];

        apps.push(selectedApp);
        retrictedAppId.push(selectedApp.appId);
      }
    }
  }
  return apps;
}

function arrayToJson(rows) {
  return _.map(rows, row => {
    return {
      appId: row[0],
      distance: row[1],
      feedBack: row[2],
      time: row[3],
      category: row[4]
    };
  });
}
