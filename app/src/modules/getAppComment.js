require("dotenv").config();
// import "../configs/mongoose.config";
import axios from "axios";
const fs = require("fs");
const path = require("path");
var parseString = require("xml2js").parseString;
const _ = require("lodash");
// import Models from "../models";
import Helpers from "../helpers";
import natural from "natural";
var bayesClassifier = new natural.BayesClassifier();
var logisticRegressionClassifier = new natural.LogisticRegressionClassifier();

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
  trainningAndTesting();
}

async function trainningAndTesting() {
  console.log("Running trainningAndTesting");
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

  const numberTrainning = 594;

  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/Downloads/TRAINING-TEST.csv");

  let [, ...rows] = fileData;

  const trainning = rows.splice(0, numberTrainning);

  trainning.forEach(([, , text, , , , label]) => {
    bayesClassifier.addDocument(text, label);
    logisticRegressionClassifier.addDocument(text, label);
  });
  bayesClassifier.train();
  logisticRegressionClassifier.train();

  const testing = rows;
  testing.forEach(([, , text, , , , label]) => {
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
    path: "./output/Bayesian-and-Logistic-Regression-Classifiers.csv",
    header: headerAccuracy,
  });
  await csvWriterAccuracy.writeRecords(rowsAccuracy);

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
  const words = [
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "aren't",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "can't",
    "cannot",
    "could",
    "couldn't",
    "did",
    "didn't",
    "do",
    "does",
    "doesn't",
    "doing",
    "don't",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "hadn't",
    "has",
    "hasn't",
    "have",
    "haven't",
    "having",
    "he",
    "he'd",
    "he'll",
    "he's",
    "her",
    "here",
    "here's",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "how's",
    "i",
    "i'd",
    "i'll",
    "i'm",
    "i've",
    "if",
    "in",
    "into",
    "is",
    "isn't",
    "it",
    "it's",
    "its",
    "itself",
    "let's",
    "me",
    "more",
    "most",
    "mustn't",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "ought",
    "our",
    "ours	ourselves",
    "out",
    "over",
    "own",
    "same",
    "shan't",
    "she",
    "she'd",
    "she'll",
    "she's",
    "should",
    "shouldn't",
    "so",
    "some",
    "such",
    "than",
    "that",
    "that's",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "there's",
    "these",
    "they",
    "they'd",
    "they'll",
    "they're",
    "they've",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "wasn't",
    "we",
    "we'd",
    "we'll",
    "we're",
    "we've",
    "were",
    "weren't",
    "what",
    "what's",
    "when",
    "when's",
    "where",
    "where's",
    "which",
    "while",
    "who",
    "who's",
    "whom",
    "why",
    "why's",
    "with",
    "won't",
    "would",
    "wouldn't",
    "you",
    "you'd",
    "you'll",
    "you're",
    "you've",
    "your",
    "yours",
    "yourself",
    "yourselves",
  ];

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
