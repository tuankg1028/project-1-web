import Models from "./src/models";
import fs from "fs";
import csv from "csvtojson";
import _ from "lodash";
import makeDir from "make-dir";
import path from "path";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const source = "./thirdFolder";
const trainingAndTestingPath = "./traningAndTesting (centroid)";

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
    const setNoise = [];
    const groupCategory = _.groupBy(dataJson, "category");
    let totalTestingFile = 0;
    let totalCorrectRedictionFile = 0;

    for (const categoryName in groupCategory) {
      let dataOfCategory = groupCategory[categoryName];

      // get unique feed back values
      const clusters = _.sortBy(_.uniq(_.map(dataOfCategory, "feedBack")));

      // set ignore
      const setNoiseOfCategory = getSetNoise(dataOfCategory);
      setNoise.push(setNoiseOfCategory); // ***

      // remove setIgnore from dataOfCategory
      for (let i = 0; i < setNoiseOfCategory.length; i++) {
        const noise = setNoiseOfCategory[i];

        _.remove(dataOfCategory, noise);
      }

      // set training
      const setTrainingOfCategory = getSetTraining(dataOfCategory, clusters);
      setTraining.push(setTrainingOfCategory); // ***

      // set testing
      const setTestingOfCategory = getSetTesting(
        dataOfCategory,
        setTrainingOfCategory
      );

      // get value of ranges
      const distanceOfClusters = getSetDistanceOfClusters(
        setTrainingOfCategory
      );

      setTraining.push({
        appId: JSON.stringify(distanceOfClusters)
      }); // ***

      // redicting
      const numberOfCorrentRediction = 0;
      for (let j = 0; j < setTestingOfCategory.length; j++) {
        let testing = setTestingOfCategory[j];
        let isCorrect = false; // ***

        const closestClustertWithTesting = getClosestClusterWithTesting(
          testing.distance,
          distanceOfClusters
        );

        if (closestClustertWithTesting.cluster == testing.feedBack) {
          numberOfCorrentRediction++;
          isCorrect = true; // ***
        }

        setTestingOfCategory[j] = {
          ...testing,
          risk_prediction: closestClustertWithTesting.cluster,
          result: isCorrect
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
    await saveSetData(_.flatten(setNoise), file, "noise"); // ***
  }

  // percent
  content += `--------------------------\n
  ${totalCorrectRediction}/${totalTesting} (${(totalCorrectRediction /
    totalTesting) *
    100}%) \n`; // ***

  fs.writeFileSync("./prediction (centroid).txt", content);
  console.log("DONE");
}

function getSetNoise(dataOfCategory) {
  const setNoise = [];

  const ranges = [];
  const group = _.groupBy(dataOfCategory, "feedBack");

  const groupByFeedback = _.countBy(dataOfCategory, "feedBack"); // { '3': 1, '4': 3, '5': 6 }

  const clusterOneElement = [],
    clusterGreaterOneElement = [];

  // divide into two group
  for (const cluster in groupByFeedback) {
    const numberOfTimes = groupByFeedback[cluster];

    if (numberOfTimes == 1) {
      clusterOneElement.push(cluster);
    } else {
      clusterGreaterOneElement.push(cluster);
    }
  }

  // no clusterOneElement return []
  if (clusterOneElement.length == 0) return [];

  // counting range
  for (let i = 0; i < clusterGreaterOneElement.length; i++) {
    const cluster = clusterGreaterOneElement[i];

    const appsOfCluster = group[cluster];

    const start = _.minBy(appsOfCluster, "distance").distance;
    const end = _.maxBy(appsOfCluster, "distance").distance;

    ranges.push({
      start,
      end
    });
  }

  // loop clusterOneElement
  for (let i = 0; i < clusterOneElement.length; i++) {
    const cluster = clusterOneElement[i];
    const appOfCluster = group[cluster][0];

    for (let j = 0; j < ranges.length; j++) {
      const range = ranges[j];

      // in range
      if (_.inRange(appOfCluster.distance, range.start, range.end)) {
        setNoise.push(appOfCluster);
        break;
      }
    }
  }

  return setNoise;
}
function getClosestClusterWithTesting(distance, distanceOfClusters) {
  let closest = distanceOfClusters.sort(
    (a, b) => Math.abs(distance - a.distance) - Math.abs(distance - b.distance)
  )[0];

  return closest;
}
function getSetDistanceOfClusters(setTrainingOfCategory) {
  const centroidOfClusters = [];

  for (let i = 0; i < setTrainingOfCategory.length; i++) {
    const app = setTrainingOfCategory[i];

    centroidOfClusters.push({
      cluster: app.feedBack,
      distance: app.distance
    });
  }
  return centroidOfClusters;
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
      id: "result",
      title: "Result"
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
      result: item.result,
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
