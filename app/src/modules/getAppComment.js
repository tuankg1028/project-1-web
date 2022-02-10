require("dotenv").config();
import "../configs/mongoose.config";
import axios from "axios";
const fs = require("fs");
const path = require("path");
var parseString = require("xml2js").parseString;
const _ = require("lodash");
import Models from "../models";
import Helpers from "../helpers";
import natural from "natural";
const PorterStemmer = require('../../node_modules/natural/lib/natural/stemmers/porter_stemmer');

var bayesClassifier = new natural.BayesClassifier(PorterStemmer);
var logisticRegressionClassifier = new natural.LogisticRegressionClassifier(PorterStemmer);

import readXlsxFile from "read-excel-file/node";

var tokenizer = new natural.WordTokenizer();
var spellcheck = new natural.Spellcheck();
const csv = require("csvtojson");

const { execSync } = require("child_process");
var gplay = require("google-play-scraper");
const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();
const isEnglish = require("is-english");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

main();
async function main() {
  // getCommentFromCHplay()
  // statCommentsByApps()
  // statCommentsByUsers()
  // statCommentsUserByKeywords();
  // statCommentsUserByKeywordsV2()
  // statCommentsUserByKeywordsLabel();
  // trainningAndTesting();

  await test()
}

async function test() {
  // const fileData = await csv({
  //   noheader: true,
  //   output: "csv",
  // }).fromFile("/Users/xander/Downloads/TRAINING-TEST.csv");

  // let [, ...rows] = fileData;

  // const dataSet = rows.filter(row => row[6] === 'Y').reduce((acc, item) => {

  //   acc = [...acc, ...item[2].split(' ')]
  //   return acc
  // }, [])
  // console.log(dataSet.length )

  // function clearText(text) {
  //   return text
  //     .toLowerCase()
  //     .replace(/[^A-Za-zА-Яа-яЁёЇїІіҐґЄє0-9\-]|\s]/g, " ")
  //     .replace(/\s{2,}/g, " ");
  // }
  // const text = clearText(dataSet.join(" "))
  // fs.writeFileSync('./vector.txt', text)
  

  var w2v = require( 'word2vec' );
  w2v.word2vec('./', "vector.txt", { size: 300 }, () => {
    console.log("DONE");
  });
 
  // w2v.loadModel("./vector.txt", (error, model) => {
  //   console.log("SIZE: ", model.size);
  //   console.log("WORDS: ", model.words);
  //   console.log(model.mostSimilar(word, 20));
  // });
}
async function trainningAndTesting() {
  console.log("Running trainningAndTesting");
  const percentage = 60
  const result = {
    bayes: {
      TP: 0,
      TN: 0,
      FP: 0,
      FN: 0,
    },
    logistic: {
      TP: 0,
      TN: 0,
      FP: 0,
      FN: 0,
    },
  };
  const headerAccuracy = [
    {
      id: "name",
      title: "",
    },
    {
      id: "begin",
      title: "Bayesian",
    },
    {
      id: "malicious",
      title: "Logistic Regression",
    },
  ];

  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/xander/Downloads/TRAINING-TEST.csv");

  let [, ...rows] = fileData;

  const totalY = rows.filter(row => row[6] === 'Y').length
  const totalN = rows.filter(row => row[6] === 'N').length
  
  let rowsCSV = []
  
  rows = _.orderBy(rows, (row => row[6]), 'desc')
  const trainningY = rows.splice(0, Math.floor(totalY* (percentage / 100)));
  
  rows = _.orderBy(rows, (row => row[6]), 'asc')
  const trainningN = rows.splice(0, Math.floor(totalN* (percentage / 100)));
  

  const trainning = [...trainningY, ...trainningN]
  trainning.forEach((item, index) => {
    rowsCSV.push({
        userName: item[1],
        comment: item[2],
        appName: item[3],
        rating: item[4],
        thumbsUp: item[5],
        label: item[6],
    })
  })
  trainning.forEach(([, , text, , , , label]) => {
    bayesClassifier.addDocument(text, label);
    logisticRegressionClassifier.addDocument(text, label);
  });
  bayesClassifier.train();
  logisticRegressionClassifier.train();

  const testing = rows;
  testing.forEach((item) => {
      const [, , text, , , , label] = item
    const actualClassBayes = bayesClassifier.classify(text);

    if (label === "Y" && actualClassBayes == "Y") result.bayes.TP++;
    else if (label === "N" && actualClassBayes == "N") result.bayes.TN++;
    else if (label === "Y" && actualClassBayes == "N") result.bayes.FP++;
    else if (label === "N" && actualClassBayes == "Y") result.bayes.FN++;

    const actualClassLogistic = logisticRegressionClassifier.classify(text);
    if (label === "Y" && actualClassLogistic == "Y") result.logistic.TP++;
    else if (label === "N" && actualClassLogistic == "N") result.logistic.TN++;
    else if (label === "Y" && actualClassLogistic == "N") result.logistic.FP++;
    else if (label === "N" && actualClassLogistic == "Y") result.logistic.FN++;

    rowsCSV.push({
        userName: item[1],
        comment: item[2],
        appName: item[3],
        rating: item[4],
        thumbsUp: item[5],
        label: item[6],
        bayesian: actualClassBayes,
        logistic: actualClassLogistic
    })
  });

  // accuracy
  const PrecisionBenign = result.bayes.TP / (result.bayes.TP + result.bayes.FP);
  const PrecisionMalicious =
    result.logistic.TP / (result.logistic.TP + result.logistic.FP);

  const RecallBenign = result.bayes.TP / (result.bayes.TP + result.bayes.FN);
  const RecallMalicious =
    result.logistic.TP / (result.logistic.TP + result.logistic.FN);

  const F1Benign =
    (2 * (PrecisionBenign * RecallBenign)) / (PrecisionBenign + RecallBenign);
  const F1Malicious =
    (2 * (PrecisionMalicious * RecallMalicious)) /
    (PrecisionMalicious + RecallMalicious);

  const Accuracy =
    (result.bayes.TP + result.bayes.TN) /
    (result.bayes.TP + result.bayes.FP + result.bayes.FN + result.bayes.TN);
  const AccuracyMalicious =
    (result.logistic.TP + result.logistic.TN) /
    (result.logistic.TP +
      result.logistic.FP +
      result.logistic.FN +
      result.logistic.TN);

  const rowsAccuracy = [
    {
      name: "TP",
      begin: result.bayes.TP,
      malicious: result.logistic.TP,
    },
    {
      name: "TN",
      begin: result.bayes.TN,
      malicious: result.logistic.TN,
    },
    {
      name: "FP",
      begin: result.bayes.FP,
      malicious: result.logistic.FP,
    },
    {
      name: "FN",
      begin: result.bayes.FN,
      malicious: result.logistic.FN,
    },
    {
      name: "Percision",
      begin: PrecisionBenign,
      malicious: PrecisionMalicious,
    },
    {
      name: "Recall",
      begin: RecallBenign,
      malicious: RecallMalicious,
    },
    {
      name: "F1",
      begin: F1Benign,
      malicious: F1Malicious,
    },
    {
      name: "Accuracy",
      begin: Accuracy,
      malicious: AccuracyMalicious,
    },
  ];

  const csvWriterAccuracy = createCsvWriter({
    path: `./output/Bayesian-and-Logistic-Regression-Classifiers(${percentage}-${100 - percentage}).csv`,
    header: headerAccuracy,
  });
  await csvWriterAccuracy.writeRecords(rowsAccuracy);

  rowsCSV = rowsCSV.map((item, index) => {
    item.stt = index + 1
    return item
  })
  const csvWriter = createCsvWriter({
    path: `./output/TRAINING-TEST(${percentage}-${100 -percentage}).csv`,
    header: [
        {
          id: "stt",
          title: "#",
        },
        {
          id: "userName",
          title: "User Name",
        },
        {
          id: "comment",
          title: "Comment",
        },
        {
          id: "appName",
          title: "App Name",
        },
        {
          id: "rating",
          title: "Rating",
        },
        {
          id: "thumbsUp",
          title: "Thumbs Up",
        },
        {
            id: "label",
            title: "Label (Y/N)",
          },
        {
            id: "bayesian",
            title: "Bayesian",
        },
        {
            id: "logistic",
            title: "Logistic Regression",
        },
      ],
  });
  await csvWriter.writeRecords(rowsCSV);

  console.log("DONE");
}


async function statCommentsUserByKeywordsLabel() {
  let apps = await Models.App.find({
    isExistedMobiPurpose: true,
    isCompleted: true,
    nodes: { $exists: true }, //
    dataTypes: { $exists: true }, //
  })
    .limit(100)
    .select("appName");

  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "userName",
      title: "User Name",
    },
    {
      id: "comment",
      title: "Comment",
    },
    {
      id: "appName",
      title: "App Name",
    },
    {
      id: "rating",
      title: "Rating",
    },
    {
      id: "thumbsUp",
      title: "Thumbs Up",
    },
  ];
  let rows = [];

  let commentsSC = await Models.AppComment.aggregate([
    {
      $match: {
        appId: {
          $in: _.map(apps, "_id"),
        },
      },
    },
    {
      $match: {
        $or: [
          { text: { $regex: "Security", $options: "i" } },
          { text: { $regex: "privacy", $options: "i" } },
          { text: { $regex: "policy", $options: "i" } },
          { text: { $regex: "collection", $options: "i" } },
          { text: { $regex: "third-party", $options: "i" } },
          { text: { $regex: "share data", $options: "i" } },
          { text: { $regex: "collect data", $options: "i" } },

          { text: { $regex: "profile", $options: "i" } },
          { text: { $regex: "profiling", $options: "i" } },

          { text: { $regex: "analytics", $options: "i" } },
          { text: { $regex: "analysis", $options: "i" } },
          { text: { $regex: "analyze", $options: "i" } },
          { text: { $regex: "analyse", $options: "i" } },
          { text: { $regex: "analyzing", $options: "i" } },

          { text: { $regex: "statistical", $options: "i" } },
          { text: { $regex: "statistics", $options: "i" } },

          { text: { $regex: "ads", $options: "i" } },
          { text: { $regex: "advertising", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "advertisers", $options: "i" } },

          { text: { $regex: "maintain", $options: "i" } },
          { text: { $regex: "maintenance", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "maintained", $options: "i" } },

          { text: { $regex: "identifier", $options: "i" } },
          { text: { $regex: "identifying", $options: "i" } },
          { text: { $regex: "authentication", $options: "i" } },
          { text: { $regex: "authenticate", $options: "i" } },
          { text: { $regex: "authenticates", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "identities", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identifies", $options: "i" } },

          { text: { $regex: "troubleshooting", $options: "i" } },
          { text: { $regex: "tests", $options: "i" } },
          { text: { $regex: "testing", $options: "i" } },
          { text: { $regex: "troubleshoot", $options: "i" } },

          { text: { $regex: "purchase", $options: "i" } },
          { text: { $regex: "purchasing", $options: "i" } },
          { text: { $regex: "payment", $options: "i" } },

          { text: { $regex: "delivery", $options: "i" } },
          { text: { $regex: "shipping", $options: "i" } },
          { text: { $regex: "delivering", $options: "i" } },

          { text: { $regex: "contacting", $options: "i" } },
          { text: { $regex: "contacts", $options: "i" } },
          { text: { $regex: "contacted", $options: "i" } },
          { text: { $regex: "communications", $options: "i" } },

          { text: { $regex: "research", $options: "i" } },
          { text: { $regex: "researching", $options: "i" } },

          { text: { $regex: "survey", $options: "i" } },

          { text: { $regex: "treatment", $options: "i" } },

          { text: { $regex: "diagnostics", $options: "i" } },
          { text: { $regex: "diagnosis", $options: "i" } },

          { text: { $regex: "medical", $options: "i" } },
          { text: { $regex: "healthcare", $options: "i" } },
          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "care", $options: "i" } },
          { text: { $regex: "disease", $options: "i" } },

          { text: { $regex: "improve", $options: "i" } },
          { text: { $regex: "improving", $options: "i" } },
          { text: { $regex: "improvement", $options: "i" } },

          { text: { $regex: "name", $options: "i" } },
          { text: { $regex: "contact", $options: "i" } },
          { text: { $regex: "email", $options: "i" } },
          { text: { $regex: "account", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "social network", $options: "i" } },
          { text: { $regex: "behavioral", $options: "i" } },
          { text: { $regex: "behavior", $options: "i" } },
          { text: { $regex: "about you", $options: "i" } },
          { text: { $regex: "card", $options: "i" } },

          { text: { $regex: "location", $options: "i" } },
          { text: { $regex: "address", $options: "i" } },

          { text: { $regex: "media", $options: "i" } },
          { text: { $regex: "video", $options: "i" } },
          { text: { $regex: "audio", $options: "i" } },
          { text: { $regex: "picture", $options: "i" } },
          { text: { $regex: "image", $options: "i" } },

          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "fitness", $options: "i" } },
          { text: { $regex: "blood", $options: "i" } },
          { text: { $regex: "step", $options: "i" } },
          { text: { $regex: "activity", $options: "i" } },
          { text: { $regex: "activities", $options: "i" } },

          { text: { $regex: "camera", $options: "i" } },
          { text: { $regex: "IP address", $options: "i" } },
          { text: { $regex: "MAC address", $options: "i" } },
          { text: { $regex: "sensor", $options: "i" } },
          { text: { $regex: "accelerometer", $options: "i" } },
          { text: { $regex: "gyroscope", $options: "i" } },
          { text: { $regex: "microphone", $options: "i" } },
          { text: { $regex: "volumn", $options: "i" } },

          { text: { $regex: "Wifi", $options: "i" } },
          { text: { $regex: "Bluetooth", $options: "i" } },
          { text: { $regex: "NFC", $options: "i" } },
          { text: { $regex: "Cookie", $options: "i" } },
          { text: { $regex: "connections", $options: "i" } },
          { text: { $regex: "beacons", $options: "i" } },

          { text: { $regex: "call", $options: "i" } },
          { text: { $regex: "messager", $options: "i" } },
          { text: { $regex: "phone number", $options: "i" } },
          { text: { $regex: "phone calls", $options: "i" } },

          // { text: { $regex: "security", $options: "i" } },
          // { text: { $regex: "privacy", $options: "i" } },
          // { text: { $regex: "collect", $options: "i" } },
          // { text: { $regex: "share", $options: "i" } },
          // { text: { $regex: "transfer", $options: "i" } },
          // { text: { $regex: "access", $options: "i" } },
          // { text: { $regex: "send", $options: "i" } },
          // { text: { $regex: "sent", $options: "i" } },
          // { text: { $regex: "ads", $options: "i" } },
          // { text: { $regex: "advertising", $options: "i" } },
          // { text: { $regex: "advertisement", $options: "i" } },
          // { text: { $regex: "advertisers", $options: "i" } },
          // { text: { $regex: "third party", $options: "i" } },
          // { text: { $regex: "parties", $options: "i" } },
          // { text: { $regex: "get", $options: "i" } },
          // { text: { $regex: "gather", $options: "i" } },
          // { text: { $regex: "use", $options: "i" } },
          // { text: { $regex: "retain", $options: "i" } },
          // { text: { $regex: "store", $options: "i" } },
          // { text: { $regex: "disclose", $options: "i" } },
        ],
      },
    },
  ]);

  commentsSC = commentsSC.filter((item) => isEnglish(item.text));

  // tokenizer
  commentsSC = commentsSC.map((item) => {
    item.textTokenized = tokenizer.tokenize(item.text.toLowerCase());
    return item;
  });

  // remove stopword
  removeStopWords(commentsSC);

  // stemmer
  commentsSC = commentsSC.map((item) => {
    item.textTokenized = item.textTokenized.map((word) =>
      natural.PorterStemmer.stem(word)
    );
    return item;
  });

  const commonWords = getCommonWords(commentsSC);
  console.log("commonWords", commonWords);
  let commentsAD = await Models.AppComment.aggregate([
    {
      $match: {
        appId: {
          $in: _.map(apps, "_id"),
        },
      },
    },
    {
      $match: {
        $nor: [
          { text: { $regex: "Security", $options: "i" } },
          { text: { $regex: "privacy", $options: "i" } },
          { text: { $regex: "policy", $options: "i" } },
          { text: { $regex: "collection", $options: "i" } },
          { text: { $regex: "third-party", $options: "i" } },
          { text: { $regex: "share data", $options: "i" } },
          { text: { $regex: "collect data", $options: "i" } },

          { text: { $regex: "profile", $options: "i" } },
          { text: { $regex: "profiling", $options: "i" } },

          { text: { $regex: "analytics", $options: "i" } },
          { text: { $regex: "analysis", $options: "i" } },
          { text: { $regex: "analyze", $options: "i" } },
          { text: { $regex: "analyse", $options: "i" } },
          { text: { $regex: "analyzing", $options: "i" } },

          { text: { $regex: "statistical", $options: "i" } },
          { text: { $regex: "statistics", $options: "i" } },

          { text: { $regex: "ads", $options: "i" } },
          { text: { $regex: "advertising", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "advertisers", $options: "i" } },

          { text: { $regex: "maintain", $options: "i" } },
          { text: { $regex: "maintenance", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "maintained", $options: "i" } },

          { text: { $regex: "identifier", $options: "i" } },
          { text: { $regex: "identifying", $options: "i" } },
          { text: { $regex: "authentication", $options: "i" } },
          { text: { $regex: "authenticate", $options: "i" } },
          { text: { $regex: "authenticates", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "identities", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identifies", $options: "i" } },

          { text: { $regex: "troubleshooting", $options: "i" } },
          { text: { $regex: "tests", $options: "i" } },
          { text: { $regex: "testing", $options: "i" } },
          { text: { $regex: "troubleshoot", $options: "i" } },

          { text: { $regex: "purchase", $options: "i" } },
          { text: { $regex: "purchasing", $options: "i" } },
          { text: { $regex: "payment", $options: "i" } },

          { text: { $regex: "delivery", $options: "i" } },
          { text: { $regex: "shipping", $options: "i" } },
          { text: { $regex: "delivering", $options: "i" } },

          { text: { $regex: "contacting", $options: "i" } },
          { text: { $regex: "contacts", $options: "i" } },
          { text: { $regex: "contacted", $options: "i" } },
          { text: { $regex: "communications", $options: "i" } },

          { text: { $regex: "research", $options: "i" } },
          { text: { $regex: "researching", $options: "i" } },

          { text: { $regex: "survey", $options: "i" } },

          { text: { $regex: "treatment", $options: "i" } },

          { text: { $regex: "diagnostics", $options: "i" } },
          { text: { $regex: "diagnosis", $options: "i" } },

          { text: { $regex: "medical", $options: "i" } },
          { text: { $regex: "healthcare", $options: "i" } },
          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "care", $options: "i" } },
          { text: { $regex: "disease", $options: "i" } },

          { text: { $regex: "improve", $options: "i" } },
          { text: { $regex: "improving", $options: "i" } },
          { text: { $regex: "improvement", $options: "i" } },

          { text: { $regex: "name", $options: "i" } },
          { text: { $regex: "contact", $options: "i" } },
          { text: { $regex: "email", $options: "i" } },
          { text: { $regex: "account", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "social network", $options: "i" } },
          { text: { $regex: "behavioral", $options: "i" } },
          { text: { $regex: "behavior", $options: "i" } },
          { text: { $regex: "about you", $options: "i" } },
          { text: { $regex: "card", $options: "i" } },

          { text: { $regex: "location", $options: "i" } },
          { text: { $regex: "address", $options: "i" } },

          { text: { $regex: "media", $options: "i" } },
          { text: { $regex: "video", $options: "i" } },
          { text: { $regex: "audio", $options: "i" } },
          { text: { $regex: "picture", $options: "i" } },
          { text: { $regex: "image", $options: "i" } },

          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "fitness", $options: "i" } },
          { text: { $regex: "blood", $options: "i" } },
          { text: { $regex: "step", $options: "i" } },
          { text: { $regex: "activity", $options: "i" } },
          { text: { $regex: "activities", $options: "i" } },

          { text: { $regex: "camera", $options: "i" } },
          { text: { $regex: "IP address", $options: "i" } },
          { text: { $regex: "MAC address", $options: "i" } },
          { text: { $regex: "sensor", $options: "i" } },
          { text: { $regex: "accelerometer", $options: "i" } },
          { text: { $regex: "gyroscope", $options: "i" } },
          { text: { $regex: "microphone", $options: "i" } },
          { text: { $regex: "volumn", $options: "i" } },

          { text: { $regex: "Wifi", $options: "i" } },
          { text: { $regex: "Bluetooth", $options: "i" } },
          { text: { $regex: "NFC", $options: "i" } },
          { text: { $regex: "Cookie", $options: "i" } },
          { text: { $regex: "connections", $options: "i" } },
          { text: { $regex: "beacons", $options: "i" } },

          { text: { $regex: "call", $options: "i" } },
          { text: { $regex: "messager", $options: "i" } },
          { text: { $regex: "phone number", $options: "i" } },
          { text: { $regex: "phone calls", $options: "i" } },

          // { text: { $regex: "security", $options: "i" } },
          // { text: { $regex: "privacy", $options: "i" } },
          // { text: { $regex: "collect", $options: "i" } },
          // { text: { $regex: "share", $options: "i" } },
          // { text: { $regex: "transfer", $options: "i" } },
          // { text: { $regex: "access", $options: "i" } },
          // { text: { $regex: "send", $options: "i" } },
          // { text: { $regex: "sent", $options: "i" } },
          // { text: { $regex: "ads", $options: "i" } },
          // { text: { $regex: "advertising", $options: "i" } },
          // { text: { $regex: "advertisement", $options: "i" } },
          // { text: { $regex: "advertisers", $options: "i" } },
          // { text: { $regex: "third party", $options: "i" } },
          // { text: { $regex: "parties", $options: "i" } },
          // { text: { $regex: "get", $options: "i" } },
          // { text: { $regex: "gather", $options: "i" } },
          // { text: { $regex: "use", $options: "i" } },
          // { text: { $regex: "retain", $options: "i" } },
          // { text: { $regex: "store", $options: "i" } },
          // { text: { $regex: "disclose", $options: "i" } },
        ],
      },
    },
    {
      $match: {
        $or: commonWords.map((word) => {
          return { text: { $regex: word, $options: "i" } };
        }),
      },
    },
  ]);

  commentsAD = commentsAD.filter((item) => isEnglish(item.text));

  // tokenizer
  commentsAD = commentsAD.map((item) => {
    item.textTokenized = tokenizer.tokenize(item.text.toLowerCase());
    return item;
  });

  // remove stopword
  removeStopWords(commentsAD);

  // stemmer
  commentsAD = commentsAD.map((item) => {
    item.textTokenized = item.textTokenized.map((word) =>
      natural.PorterStemmer.stem(word)
    );
    return item;
  });

  const comments = [...commentsSC, ...commentsAD];

  await Promise.all(
    comments.map((comment, i) => {
      const { appId } = comment;
      return Models.App.findById(appId)
        .select("appName")
        .then((app) => {
          return rows.push({
            userName: comment.userName,
            comment: comment.textTokenized.join(" "),
            appName: app.appName,
            rating: comment.score,
            thumbsUp: comment.thumbsUp,
          });
        });
    })
  );

  rows = _.orderBy(rows, "appName", "desc");
  rows = rows.map((row, i) => ({ ...row, stt: i + 1 }));
  const csvWriter = createCsvWriter({
    path: "./output/comments-apps-by-keywords.csv",
    header,
  });
  await csvWriter.writeRecords(rows);
  console.log(commentsAD);
  console.log("DONE statCommentsUserByKeywords");
}

function getCommonWords(comments) {
  let result = {};
  comments.forEach((comment) => {
    _.uniq(comment.textTokenized).forEach((word) => {
      result[word] ? result[word]++ : (result[word] = 1);
    });
  });

  console.log(result);
  return Object.entries(result).reduce((acc, item) => {
    const [word, count] = item;
    if (count / comments.length > 0.05) acc.push(word);

    return acc;
  }, []);
}
function removeStopWords(comments) {
  const words = ["able","about","above","abroad","according","accordingly","across","actually","adj","after","afterwards","again","against","ago","ahead","ain't","all","allow","allows","almost","alone","along","alongside","already","also","although","always","am","amid","amidst","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","aren't","around","as","a's","aside","ask","asking","associated","at","available","away","awfully","back","backward","backwards","be","became","because","become","becomes","becoming","been","before","beforehand","begin","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","came","can","cannot","cant","can't","caption","cause","causes","certain","certainly","changes","clearly","c'mon","co","co.","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldn't","course","c's","currently","dare","daren't","definitely","described","despite","did","didn't","different","directly","do","does","doesn't","doing","done","don't","down","downwards","during","each","edu","eg","eight","eighty","either","else","elsewhere","end","ending","enough","entirely","especially","et","etc","even","ever","evermore","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","fairly","far","farther","few","fewer","fifth","first","five","followed","following","follows","for","forever","former","formerly","forth","forward","found","four","from","further","furthermore","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","had","hadn't","half","happens","hardly","has","hasn't","have","haven't","having","he","he'd","he'll","hello","help","hence","her","here","hereafter","hereby","herein","here's","hereupon","hers","herself","he's","hi","him","himself","his","hither","hopefully","how","howbeit","however","hundred","i'd","ie","if","ignored","i'll","i'm","immediate","in","inasmuch","inc","inc.","indeed","indicate","indicated","indicates","inner","inside","insofar","instead","into","inward","is","isn't","it","it'd","it'll","its","it's","itself","i've","just","k","keep","keeps","kept","know","known","knows","last","lately","later","latter","latterly","least","less","lest","let","let's","like","liked","likely","likewise","little","look","looking","looks","low","lower","ltd","made","mainly","make","makes","many","may","maybe","mayn't","me","mean","meantime","meanwhile","merely","might","mightn't","mine","minus","miss","more","moreover","most","mostly","mr","mrs","much","must","mustn't","my","myself","name","namely","nd","near","nearly","necessary","need","needn't","needs","neither","never","neverf","neverless","nevertheless","new","next","nine","ninety","no","nobody","non","none","nonetheless","noone","no-one","nor","normally","not","nothing","notwithstanding","novel","now","nowhere","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","one's","only","onto","opposite","or","other","others","otherwise","ought","oughtn't","our","ours","ourselves","out","outside","over","overall","own","particular","particularly","past","per","perhaps","placed","please","plus","possible","presumably","probably","provided","provides","que","quite","qv","rather","rd","re","really","reasonably","recent","recently","regarding","regardless","regards","relatively","respectively","right","round","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","shan't","she","she'd","she'll","she's","should","shouldn't","since","six","so","some","somebody","someday","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","take","taken","taking","tell","tends","th","than","thank","thanks","thanx","that","that'll","thats","that's","that've","the","their","theirs","them","themselves","then","thence","there","thereafter","thereby","there'd","therefore","therein","there'll","there're","theres","there's","thereupon","there've","these","they","they'd","they'll","they're","they've","thing","things","think","third","thirty","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","till","to","together","too","took","toward","towards","tried","tries","truly","try","trying","t's","twice","two","un","under","underneath","undoing","unfortunately","unless","unlike","unlikely","until","unto","up","upon","upwards","us","use","used","useful","uses","using","usually","v","value","various","versus","very","via","viz","vs","want","wants","was","wasn't","way","we","we'd","welcome","well","we'll","went","were","we're","weren't","we've","what","whatever","what'll","what's","what've","when","whence","whenever","where","whereafter","whereas","whereby","wherein","where's","whereupon","wherever","whether","which","whichever","while","whilst","whither","who","who'd","whoever","whole","who'll","whom","whomever","who's","whose","why","will","willing","wish","with","within","without","wonder","won't","would","wouldn't","yes","yet","you","you'd","you'll","your","you're","yours","yourself","yourselves","you've","zero","a","how's","i","when's","why's","b","c","d","e","f","g","h","j","l","m","n","o","p","q","r","s","t","u","uucp","w","x","y","z","I","www","amount","bill","bottom","call","computer","con","couldnt","cry","de","describe","detail","due","eleven","empty","fifteen","fifty","fill","find","fire","forty","front","full","give","hasnt","herse","himse","interest","itse”","mill","move","myse”","part","put","show","side","sincere","sixty","system","ten","thick","thin","top","twelve","twenty","abst","accordance","act","added","adopted","affected","affecting","affects","ah","announce","anymore","apparently","approximately","aren","arent","arise","auth","beginning","beginnings","begins","biol","briefly","ca","date","ed","effect","et-al","ff","fix","gave","giving","heres","hes","hid","home","id","im","immediately","importance","important","index","information","invention","itd","keys","kg","km","largely","lets","line","'ll","means","mg","million","ml","mug","na","nay","necessarily","nos","noted","obtain","obtained","omitted","ord","owing","page","pages","poorly","possibly","potentially","pp","predominantly","present","previously","primarily","promptly","proud","quickly","ran","readily","ref","refs","related","research","resulted","resulting","results","run","sec","section","shed","shes","showed","shown","showns","shows","significant","significantly","similar","similarly","slightly","somethan","specifically","state","states","stop","strongly","substantially","successfully","sufficiently","suggest","thered","thereof","therere","thereto","theyd","theyre","thou","thoughh","thousand","throug","til","tip","ts","ups","usefully","usefulness","'ve","vol","vols","wed","whats","wheres","whim","whod","whos","widely","words","world","youd","youre"]

  comments = comments.map((item) => {
    words.forEach((word) => {
      item.textTokenized = removeItemAll(item.textTokenized, word);
    });

    return item;
  });
}

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

async function statCommentsUserByKeywords() {
  let apps = await Models.App.find({
    isExistedMobiPurpose: true,
    isCompleted: true,
    nodes: { $exists: true }, //
    dataTypes: { $exists: true }, //
  })
    .limit(100)
    .select("appName");

  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "userName",
      title: "User Name",
    },
    {
      id: "comment",
      title: "Comment",
    },
    {
      id: "appName",
      title: "App Name",
    },
    {
      id: "rating",
      title: "Rating",
    },
    {
      id: "thumbsUp",
      title: "Thumbs Up",
    },
  ];
  let rows = [];

  let comments = await Models.AppComment.aggregate([
    {
      $match: {
        appId: {
          $in: _.map(apps, "_id"),
        },
      },
    },
    {
      $match: {
        $or: [
          // { text: { $regex: "Security", $options: "i" } },
          // { text: { $regex: "privacy", $options: "i" } },
          // { text: { $regex: "policy", $options: "i" } },
          // { text: { $regex: "collection", $options: "i" } },
          // { text: { $regex: "third-party", $options: "i" } },
          // { text: { $regex: "share data", $options: "i" } },
          // { text: { $regex: "collect data", $options: "i" } },

          // { text: { $regex: "profile", $options: "i" } },
          // { text: { $regex: "profiling", $options: "i" } },

          // { text: { $regex: "analytics", $options: "i" } },
          // { text: { $regex: "analysis", $options: "i" } },
          // { text: { $regex: "analyze", $options: "i" } },
          // { text: { $regex: "analyse", $options: "i" } },
          // { text: { $regex: "analyzing", $options: "i" } },

          // { text: { $regex: "statistical", $options: "i" } },
          // { text: { $regex: "statistics", $options: "i" } },

          // { text: { $regex: "ads", $options: "i" } },
          // { text: { $regex: "advertising", $options: "i" } },
          // { text: { $regex: "advertisement", $options: "i" } },
          // { text: { $regex: "advertisers", $options: "i" } },

          // { text: { $regex: "maintain", $options: "i" } },
          // { text: { $regex: "maintenance", $options: "i" } },
          // { text: { $regex: "advertisement", $options: "i" } },
          // { text: { $regex: "maintained", $options: "i" } },

          // { text: { $regex: "identifier", $options: "i" } },
          // { text: { $regex: "identifying", $options: "i" } },
          // { text: { $regex: "authentication", $options: "i" } },
          // { text: { $regex: "authenticate", $options: "i" } },
          // { text: { $regex: "authenticates", $options: "i" } },
          // { text: { $regex: "identity", $options: "i" } },
          // { text: { $regex: "identities", $options: "i" } },
          // { text: { $regex: "identifiable", $options: "i" } },
          // { text: { $regex: "identifies", $options: "i" } },

          // { text: { $regex: "troubleshooting", $options: "i" } },
          // { text: { $regex: "tests", $options: "i" } },
          // { text: { $regex: "testing", $options: "i" } },
          // { text: { $regex: "troubleshoot", $options: "i" } },

          // { text: { $regex: "purchase", $options: "i" } },
          // { text: { $regex: "purchasing", $options: "i" } },
          // { text: { $regex: "payment", $options: "i" } },

          // { text: { $regex: "delivery", $options: "i" } },
          // { text: { $regex: "shipping", $options: "i" } },
          // { text: { $regex: "delivering", $options: "i" } },

          // { text: { $regex: "contacting", $options: "i" } },
          // { text: { $regex: "contacts", $options: "i" } },
          // { text: { $regex: "contacted", $options: "i" } },
          // { text: { $regex: "communications", $options: "i" } },

          // { text: { $regex: "research", $options: "i" } },
          // { text: { $regex: "researching", $options: "i" } },

          // { text: { $regex: "survey", $options: "i" } },

          // { text: { $regex: "treatment", $options: "i" } },

          // { text: { $regex: "diagnostics", $options: "i" } },
          // { text: { $regex: "diagnosis", $options: "i" } },

          // { text: { $regex: "medical", $options: "i" } },
          // { text: { $regex: "healthcare", $options: "i" } },
          // { text: { $regex: "health", $options: "i" } },
          // { text: { $regex: "care", $options: "i" } },
          // { text: { $regex: "disease", $options: "i" } },

          // { text: { $regex: "improve", $options: "i" } },
          // { text: { $regex: "improving", $options: "i" } },
          // { text: { $regex: "improvement", $options: "i" } },

          // { text: { $regex: "name", $options: "i" } },
          // { text: { $regex: "contact", $options: "i" } },
          // { text: { $regex: "email", $options: "i" } },
          // { text: { $regex: "account", $options: "i" } },
          // { text: { $regex: "identifiable", $options: "i" } },
          // { text: { $regex: "identity", $options: "i" } },
          // { text: { $regex: "social network", $options: "i" } },
          // { text: { $regex: "behavioral", $options: "i" } },
          // { text: { $regex: "behavior", $options: "i" } },
          // { text: { $regex: "about you", $options: "i" } },
          // { text: { $regex: "card", $options: "i" } },

          // { text: { $regex: "location", $options: "i" } },
          // { text: { $regex: "address", $options: "i" } },

          // { text: { $regex: "media", $options: "i" } },
          // { text: { $regex: "video", $options: "i" } },
          // { text: { $regex: "audio", $options: "i" } },
          // { text: { $regex: "picture", $options: "i" } },
          // { text: { $regex: "image", $options: "i" } },

          // { text: { $regex: "health", $options: "i" } },
          // { text: { $regex: "fitness", $options: "i" } },
          // { text: { $regex: "blood", $options: "i" } },
          // { text: { $regex: "step", $options: "i" } },
          // { text: { $regex: "activity", $options: "i" } },
          // { text: { $regex: "activities", $options: "i" } },

          // { text: { $regex: "camera", $options: "i" } },
          // { text: { $regex: "IP address", $options: "i" } },
          // { text: { $regex: "MAC address", $options: "i" } },
          // { text: { $regex: "sensor", $options: "i" } },
          // { text: { $regex: "accelerometer", $options: "i" } },
          // { text: { $regex: "gyroscope", $options: "i" } },
          // { text: { $regex: "microphone", $options: "i" } },
          // { text: { $regex: "volumn", $options: "i" } },

          // { text: { $regex: "Wifi", $options: "i" } },
          // { text: { $regex: "Bluetooth", $options: "i" } },
          // { text: { $regex: "NFC", $options: "i" } },
          // { text: { $regex: "Cookie", $options: "i" } },
          // { text: { $regex: "connections", $options: "i" } },
          // { text: { $regex: "beacons", $options: "i" } },

          // { text: { $regex: "call", $options: "i" } },
          // { text: { $regex: "messager", $options: "i" } },
          // { text: { $regex: "phone number", $options: "i" } },
          // { text: { $regex: "phone calls", $options: "i" } },

          { text: { $regex: "security", $options: "i" } },
          { text: { $regex: "privacy", $options: "i" } },
          { text: { $regex: "collect", $options: "i" } },
          { text: { $regex: "share", $options: "i" } },
          { text: { $regex: "transfer", $options: "i" } },
          { text: { $regex: "access", $options: "i" } },
          { text: { $regex: "send", $options: "i" } },
          { text: { $regex: "sent", $options: "i" } },
          { text: { $regex: "ads", $options: "i" } },
          { text: { $regex: "advertising", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "advertisers", $options: "i" } },
          { text: { $regex: "third party", $options: "i" } },
          { text: { $regex: "parties", $options: "i" } },
          { text: { $regex: "get", $options: "i" } },
          { text: { $regex: "gather", $options: "i" } },
          { text: { $regex: "use", $options: "i" } },
          { text: { $regex: "retain", $options: "i" } },
          { text: { $regex: "store", $options: "i" } },
          { text: { $regex: "disclose", $options: "i" } },
        ],
      },
    },
  ]);

  comments = comments.filter((item) => isEnglish(item.text));

  await Promise.all(
    comments.map((comment, i) => {
      const { appId } = comment;
      return Models.App.findById(appId)
        .select("appName")
        .then((app) => {
          return rows.push({
            userName: comment.userName,
            comment: comment.text,
            appName: app.appName,
            rating: comment.score,
            thumbsUp: comment.thumbsUp,
          });
        });
    })
  );

  rows = _.orderBy(rows, "appName", "desc");
  rows = rows.map((row, i) => ({ ...row, stt: i + 1 }));
  const csvWriter = createCsvWriter({
    path: "./output/comments-apps-by-keywords.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE statCommentsUserByKeywords");
}

async function statCommentsUserByKeywordsV2() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App Name",
    },
    {
      id: "totalComment",
      title: "Total comment",
    },
    {
      id: "totalCommentKeywords",
      title: "Total comment with keywords",
    },
  ];
  let rows = [];

  const comments = await Models.AppComment.aggregate([
    {
      $match: {
        $or: [
          { text: { $regex: "Security", $options: "i" } },
          { text: { $regex: "privacy", $options: "i" } },
          { text: { $regex: "policy", $options: "i" } },
          { text: { $regex: "collection", $options: "i" } },
          { text: { $regex: "third-party", $options: "i" } },
          { text: { $regex: "share data", $options: "i" } },
          { text: { $regex: "collect data", $options: "i" } },

          { text: { $regex: "profile", $options: "i" } },
          { text: { $regex: "profiling", $options: "i" } },

          { text: { $regex: "analytics", $options: "i" } },
          { text: { $regex: "analysis", $options: "i" } },
          { text: { $regex: "analyze", $options: "i" } },
          { text: { $regex: "analyse", $options: "i" } },
          { text: { $regex: "analyzing", $options: "i" } },

          { text: { $regex: "statistical", $options: "i" } },
          { text: { $regex: "statistics", $options: "i" } },

          { text: { $regex: "ads", $options: "i" } },
          { text: { $regex: "advertising", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "advertisers", $options: "i" } },

          { text: { $regex: "maintain", $options: "i" } },
          { text: { $regex: "maintenance", $options: "i" } },
          { text: { $regex: "advertisement", $options: "i" } },
          { text: { $regex: "maintained", $options: "i" } },

          { text: { $regex: "identifier", $options: "i" } },
          { text: { $regex: "identifying", $options: "i" } },
          { text: { $regex: "authentication", $options: "i" } },
          { text: { $regex: "authenticate", $options: "i" } },
          { text: { $regex: "authenticates", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "identities", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identifies", $options: "i" } },

          { text: { $regex: "troubleshooting", $options: "i" } },
          { text: { $regex: "tests", $options: "i" } },
          { text: { $regex: "testing", $options: "i" } },
          { text: { $regex: "troubleshoot", $options: "i" } },

          { text: { $regex: "purchase", $options: "i" } },
          { text: { $regex: "purchasing", $options: "i" } },
          { text: { $regex: "payment", $options: "i" } },

          { text: { $regex: "delivery", $options: "i" } },
          { text: { $regex: "shipping", $options: "i" } },
          { text: { $regex: "delivering", $options: "i" } },

          { text: { $regex: "contacting", $options: "i" } },
          { text: { $regex: "contacts", $options: "i" } },
          { text: { $regex: "contacted", $options: "i" } },
          { text: { $regex: "communications", $options: "i" } },

          { text: { $regex: "research", $options: "i" } },
          { text: { $regex: "researching", $options: "i" } },

          { text: { $regex: "survey", $options: "i" } },

          { text: { $regex: "treatment", $options: "i" } },

          { text: { $regex: "diagnostics", $options: "i" } },
          { text: { $regex: "diagnosis", $options: "i" } },

          { text: { $regex: "medical", $options: "i" } },
          { text: { $regex: "healthcare", $options: "i" } },
          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "care", $options: "i" } },
          { text: { $regex: "disease", $options: "i" } },

          { text: { $regex: "improve", $options: "i" } },
          { text: { $regex: "improving", $options: "i" } },
          { text: { $regex: "improvement", $options: "i" } },

          { text: { $regex: "name", $options: "i" } },
          { text: { $regex: "contact", $options: "i" } },
          { text: { $regex: "email", $options: "i" } },
          { text: { $regex: "account", $options: "i" } },
          { text: { $regex: "identifiable", $options: "i" } },
          { text: { $regex: "identity", $options: "i" } },
          { text: { $regex: "social network", $options: "i" } },
          { text: { $regex: "behavioral", $options: "i" } },
          { text: { $regex: "behavior", $options: "i" } },
          { text: { $regex: "about you", $options: "i" } },
          { text: { $regex: "card", $options: "i" } },

          { text: { $regex: "location", $options: "i" } },
          { text: { $regex: "address", $options: "i" } },

          { text: { $regex: "media", $options: "i" } },
          { text: { $regex: "video", $options: "i" } },
          { text: { $regex: "audio", $options: "i" } },
          { text: { $regex: "picture", $options: "i" } },
          { text: { $regex: "image", $options: "i" } },

          { text: { $regex: "health", $options: "i" } },
          { text: { $regex: "fitness", $options: "i" } },
          { text: { $regex: "blood", $options: "i" } },
          { text: { $regex: "step", $options: "i" } },
          { text: { $regex: "activity", $options: "i" } },
          { text: { $regex: "activities", $options: "i" } },

          { text: { $regex: "camera", $options: "i" } },
          { text: { $regex: "IP address", $options: "i" } },
          { text: { $regex: "MAC address", $options: "i" } },
          { text: { $regex: "sensor", $options: "i" } },
          { text: { $regex: "accelerometer", $options: "i" } },
          { text: { $regex: "gyroscope", $options: "i" } },
          { text: { $regex: "microphone", $options: "i" } },
          { text: { $regex: "volumn", $options: "i" } },

          { text: { $regex: "Wifi", $options: "i" } },
          { text: { $regex: "Bluetooth", $options: "i" } },
          { text: { $regex: "NFC", $options: "i" } },
          { text: { $regex: "Cookie", $options: "i" } },
          { text: { $regex: "connections", $options: "i" } },
          { text: { $regex: "beacons", $options: "i" } },

          { text: { $regex: "call", $options: "i" } },
          { text: { $regex: "messager", $options: "i" } },
          { text: { $regex: "phone number", $options: "i" } },
          { text: { $regex: "phone calls", $options: "i" } },
        ],
      },
    },
  ]);

  const appCommentsGroup = _.groupBy(comments, "appId");

  // const rows = await Promise.all(Object.entries(appCommentsGroup).map(buildRow))
  const chunks = _.chunk(Object.entries(appCommentsGroup), 10);

  console.log(chunks);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const result = await Promise.all(chunk.map((item) => buildRow(...item)));
    rows = [...rows, ...result];
  }
  // for (let i = 0; i < Object.entries(appCommentsGroup).length; i++) {
  //     const [appId, appComments] = Object.entries(appCommentsGroup)[i];

  //
  // }

  rows = _.orderBy(rows, "totalCommentKeywords", "desc");
  rows = rows.map((row, i) => ({ ...row, stt: i + 1 }));
  const csvWriter = createCsvWriter({
    path: "./output/comments-apps-by-keywords(v2-en).csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE statCommentsUserByKeywords");
}
async function buildRow(appId, appComments) {
  console.log(1, appId);
  let [app, totalComments] = await Promise.all([
    Models.App.findById(appId).select("appName"),
    Models.AppComment.find({
      appId,
    }).select("text"),
  ]);

  totalComments = totalComments.filter((item) => {
    if (!item.text) return false;
    let text = item.text
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "")
      .replace(/:-?[()pPdD]/gi, "");

    if (text.split(" ").length <= 3) return true;

    text = removeEmojis(text);
    return isEnglish(text);
  });

  return {
    appName: app.appName,
    totalComment: totalComments.length,
    totalCommentKeywords: appComments.length,
  };
}
function removeEmojis(string) {
  var regex =
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return string.replace(regex, "");
}

function isOnlyEmoji(string) {
  return !removeEmojis(string).length;
}

async function statCommentsByApps() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App Name",
    },
    {
      id: "numberOfComment",
      title: "Number of comments",
    },
  ];
  let rows = [];

  const comments = await Models.AppComment.aggregate([
    {
      $group: {
        _id: { appId: "$appId" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Promise.all(
    comments.map((comment, i) => {
      const {
        _id: { appId },
        count,
      } = comment;
      return Models.App.findById(appId)
        .select("appName")
        .then((app) => {
          return rows.push({
            appName: app.appName,
            numberOfComment: count,
          });
        });
    })
  );

  rows = _.orderBy(rows, "numberOfComment", "desc");
  rows = rows.map((row, i) => ({ ...row, stt: i + 1 }));
  const csvWriter = createCsvWriter({
    path: "./output/comments-apps.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE statCommentsByApps");
}

async function statCommentsByUsers() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "userName",
      title: "User Name",
    },
    {
      id: "numberOfComment",
      title: "Number of comments",
    },
  ];
  let rows = [];

  const comments = await Models.AppComment.aggregate([
    {
      $group: {
        _id: { userName: "$userName", appId: "$appId" },
      },
    },
    { $group: { _id: "$_id.userName", count: { $sum: 1 } } },
  ]).allowDiskUse(true);

  comments.forEach((comment, i) => {
    const { _id: userName, count } = comment;
    return rows.push({
      userName,
      numberOfComment: count,
    });
  });

  rows = _.orderBy(rows, "numberOfComment", "desc");
  rows = rows.map((row, i) => ({ ...row, stt: i + 1 }));

  const csvWriter = createCsvWriter({
    path: "./output/comments-user.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE statCommentsByUsers");
}
async function getCommentFromCHplay() {
  const apps = await Models.App.find({ appIdCHPlay: { $exists: true } }).select(
    "appIdCHPlay"
  );
  const appChunks = _.chunk(apps, 10);

  for (let i = 0; i < appChunks.length; i++) {
    const chunk = appChunks[i];

    await Promise.all(chunk.map(updateApp));
  }
}
async function updateApp(app) {
  const isExisted = await Models.AppComment.findOne({
    appId: app._id,
  });
  if (isExisted) return;

  let comments = [];

  let commentChunk = {};
  const limit = 3000;
  do {
    commentChunk = await gplay.reviews({
      appId: app.appIdCHPlay,
      sort: gplay.sort.RATING,
      num: limit,
      paginate: true,
      nextPaginationToken: commentChunk.nextPaginationToken || null,
    });

    comments = [
      ...comments,
      ...(commentChunk.data || []).map((item) => ({ ...item, appId: app._id })),
    ];
  } while (commentChunk.nextPaginationToken);

  await Models.AppComment.insertMany(comments);
}
