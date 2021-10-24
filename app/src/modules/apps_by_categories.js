require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import fs from "fs";
import axios from "axios";
import slug from "slug";
import Helpers from "../helpers";
import path from "path";
import csv from "csvtojson";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function parseCsvtoCollections() {
  let data = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/Downloads/KeyWorkSearch_New.csv");

  const result = [];
  for (let i = 1; i < data.length; i++) {
    const [id, name, level, parent, keyword] = data[i];

    result.push({
      id,
      name,
      level,
      parent,
      keywords: keyword.split(",").map((item) => item.trim()),
    });
  }

  console.log(result);
}
// parseCsvtoCollections();

async function parseCsvtoCollectionMeanings() {
  let data = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/Downloads/KeyWorkSearch_New.csv");

  const result = [];
  for (let i = 1; i < data.length; i++) {
    const [id, keyword, meaning, ids] = data[i];

    result.push({
      id,
      keyword,
      meaning,
      ids,
      ids: ids.split(",").map((item) => item.trim()),
    });
  }

  console.log(result);
}
// parseCsvtoCollectionMeanings();
const categoriesCollection = [
  {
    id: "1",
    name: "Admin",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "2",
    name: "Purchase",
    level: "1",
    parent: "null",
    keywords: ["business", "commercial", "businesses", "purchase"],
  },
  {
    id: "3",
    name: "Education",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "4",
    name: "Healthcare",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "5",
    name: "Booking",
    level: "1",
    parent: "null",
    keywords: ["booking"],
  },
  {
    id: "6",
    name: "Services",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "7",
    name: "Marketing",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "8",
    name: "Profiling",
    level: "2",
    parent: "1",
    keywords: ["profile", "profiling"],
  },
  {
    id: "9",
    name: "Analysis",
    level: "2",
    parent: "1",
    keywords: ["Analytics", "analysis", "analyze", "analyse", "analyzing"],
  },
  {
    id: "10",
    name: "Statistical",
    level: "2",
    parent: "1",
    keywords: ["Statistical", "statistics"],
  },
  {
    id: "11",
    name: "Advertisements",
    level: "2",
    parent: "1",
    keywords: ["ads", "advertising", "advertisement", "advertisers"],
  },
  {
    id: "12",
    name: "Maintenance",
    level: "2",
    parent: "1",
    keywords: ["maintain", "maintenance", "maintained"],
  },
  {
    id: "13",
    name: "Identifying",
    level: "2",
    parent: "1",
    keywords: [
      "identifier",
      "identifying",
      "authentication",
      "authenticate",
      "authenticates",
      "identity",
      "identities",
      "identifiable",
      "identifies",
    ],
  },
  {
    id: "14",
    name: "Testing/Troubleshooting",
    level: "2",
    parent: "1",
    keywords: ["Troubleshooting", "tests", "testing", "troubleshoot"],
  },
  {
    id: "15",
    name: "Payment",
    level: "2",
    parent: "2",
    keywords: ["purchase", "purchasing", "payment"],
  },
  {
    id: "16",
    name: "Delivery",
    level: "2",
    parent: "2",
    keywords: ["delivery", "shipping", "delivering"],
  },
  {
    id: "17",
    name: "Contacting",
    level: "2",
    parent: "2",
    keywords: ["Contacting", "contacts", "contacted", "communications"],
  },
  {
    id: "18",
    name: "Research",
    level: "2",
    parent: "3",
    keywords: ["research", "researching"],
  },
  {
    id: "19",
    name: "Survey",
    level: "2",
    parent: "3",
    keywords: ["survey"],
  },
  {
    id: "20",
    name: "Treatment",
    level: "2",
    parent: "4",
    keywords: ["Treatment"],
  },
  {
    id: "21",
    name: "Diagnosis",
    level: "2",
    parent: "4",
    keywords: ["diagnostics", "diagnosis"],
  },
  {
    id: "22",
    name: "Medical",
    level: "2",
    parent: "4",
    keywords: ["medical", "healthcare", "health care", "disease"],
  },
  {
    id: "23",
    name: "Improving quality",
    level: "2",
    parent: "6",
    keywords: ["improve", "improving", "improvement"],
  },
  {
    id: "24",
    name: "Developing the new services",
    level: "2",
    parent: "6",
    keywords: ["new service", "new product", "new feature", "new functions"],
  },
  {
    id: "25",
    name: "Direct Email",
    level: "2",
    parent: "7",
    keywords: ["direct && email"],
  },
  {
    id: "26",
    name: "Direct Phone",
    level: "2",
    parent: "7",
    keywords: ["direct && phone"],
  },
  {
    id: "27",
    name: "Booking2",
    level: "2",
    parent: "5",
    keywords: ["booking"],
  },
];

const collectedDataCollection = [
  {
    id: "29",
    name: "User Profile",
    level: "2",
    parent: "28",
    keywords: [
      "name; contact; email; account; identifiable; identity; social network; behavioral; behavior; about you; card",
    ],
  },
  {
    id: "30",
    name: "Location",
    level: "2",
    parent: "28",
    keywords: ["location; address"],
  },
  {
    id: "31",
    name: "Media",
    level: "2",
    parent: "28",
    keywords: ["media; video; audio; picture; image"],
  },
  {
    id: "32",
    name: "Health & Fitness",
    level: "2",
    parent: "28",
    keywords: ["health; fitness; blood; step; activity; activities"],
  },
  {
    id: "33",
    name: "Hardware",
    level: "2",
    parent: "28",
    keywords: [
      "camera; IP address; MAC address; sensor; accelerometer; gyroscope; microphone; volumn",
    ],
  },
  {
    id: "34",
    name: "Connection",
    level: "2",
    parent: "28",
    keywords: ["Wifi; Bluetooth; NFC; Cookie; connections; beacons"],
  },
  {
    id: "35",
    name: "Telephony",
    level: "2",
    parent: "28",
    keywords: ["call; messager; phone number; phone calls"],
  },
];
const keywordAndMeaningsCollection = [
  {
    id: "1",
    keyword: "name",
    meaning: "User name",
    ids: ["8", "11", "13", "15", "16", "17", "19", "25", "27"],
  },
  {
    id: "2",
    keyword: "contact",
    meaning: "Contact information",
    ids: ["8", "11", "13", "15", "16", "17", "19", "25", "26", "27"],
  },
  {
    id: "3",
    keyword: "email",
    meaning: "User Email",
    ids: ["8", "11", "13", "15", "16", "17", "19", "25", "27"],
  },
  {
    id: "4",
    keyword: "account",
    meaning: "Account info",
    ids: ["8", "11", "13", "15", "16", "17", "19", "25", "26", "27"],
  },
  {
    id: "5",
    keyword: "password",
    meaning: "Password (Encryption)",
    ids: ["8", "13"],
  },
  {
    id: "6",
    keyword: "private chats",
    meaning: "Private chats",
    ids: ["9"],
  },

  {
    id: "8",
    keyword: "identity",
    meaning: "User Identity",
    ids: ["8", "10", "13", "17", "19", "25", "26", "27"],
  },
  {
    id: "9",
    keyword: "social network",
    meaning: "Social info",
    ids: ["8", "9", "10", "11", "13", "16", "17", "19", "25", "26", "27"],
  },
  {
    id: "10",
    keyword: "behavioral",
    meaning: "User interaction",
    ids: ["8", "9", "10", "11", "13", "18", "19"],
  },
  {
    id: "11",
    keyword: "behavior",
    meaning: "User behavior",
    ids: ["8", "9", "10", "11", "13", "18", "19"],
  },
  {
    id: "12",
    keyword: "about you",
    meaning: "Your profile",
    ids: [
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "16",
      "17",
      "18",
      "19",
      "25",
      "26",
      "27",
    ],
  },
  {
    id: "13",
    keyword: "personal information",
    meaning: "Personal info",
    ids: ["10", "11", "13", "16", "19", "27"],
  },
  {
    id: "14",
    keyword: "location",
    meaning: "Location info",
    ids: ["9", "10", "11", "16", "17"],
  },
  {
    id: "15",
    keyword: "address",
    meaning: "User address",
    ids: ["9", "10", "11", "16", "17"],
  },
  {
    id: "16",
    keyword: "media",
    meaning: "Media files",
    ids: ["9", "10"],
  },
  {
    id: "17",
    keyword: "video",
    meaning: "Video files",
    ids: ["9", "11"],
  },
  {
    id: "18",
    keyword: "audio",
    meaning: "Audio files",
    ids: ["9", "12"],
  },
  {
    id: "19",
    keyword: "picture",
    meaning: "Picture files",
    ids: ["9", "13"],
  },
  {
    id: "20",
    keyword: "image",
    meaning: "Image files",
    ids: ["9", "14"],
  },
  {
    id: "21",
    keyword: "health",
    meaning: "Health info",
    ids: ["9", "10", "20", "21", "22"],
  },
  {
    id: "22",
    keyword: "fitness",
    meaning: "Fitness info",
    ids: ["9", "10", "20", "21", "23"],
  },
  {
    id: "23",
    keyword: "blood",
    meaning: "Blood info",
    ids: ["9", "10", "20", "21", "24"],
  },
  {
    id: "24",
    keyword: "step",
    meaning: "Step count",
    ids: ["9", "10", "20", "21", "25"],
  },
  {
    id: "25",
    keyword: "activity",
    meaning: "User activity",
    ids: ["9", "10", "20", "21", "26"],
  },
  {
    id: "26",
    keyword: "activities",
    meaning: "User activities",
    ids: ["9", "10", "20", "21", "27"],
  },
  {
    id: "27",
    keyword: "camera",
    meaning: "Camera info",
    ids: ["9", "12", "14", "23", "24"],
  },
  {
    id: "28",
    keyword: "IP address",
    meaning: "IP Address",
    ids: ["9", "14", "23", "24"],
  },
  {
    id: "29",
    keyword: "MAC address",
    meaning: "MAC Address",
    ids: ["9", "14", "23", "25"],
  },
  {
    id: "30",
    keyword: "sensor",
    meaning: "Sensor info",
    ids: ["9", "14", "23", "26"],
  },
  {
    id: "31",
    keyword: "accelerometer",
    meaning: "Accelerometer output",
    ids: ["9", "14", "23", "27"],
  },
  {
    id: "32",
    keyword: "gyroscope",
    meaning: "Gyroscope output",
    ids: ["9", "14", "23", "28"],
  },
  {
    id: "33",
    keyword: "microphone",
    meaning: "Microphone state",
    ids: ["9", "14", "23", "29"],
  },
  {
    id: "34",
    keyword: "volumn",
    meaning: "Volumn setting",
    ids: ["9"],
  },
  {
    id: "35",
    keyword: "Wifi",
    meaning: "Wifi connection state",
    ids: ["9", "14", "23", "24"],
  },
  {
    id: "36",
    keyword: "Bluetooth",
    meaning: "Bluetooth info",
    ids: ["14", "23"],
  },
  {
    id: "37",
    keyword: "NFC",
    meaning: "NFC state",
    ids: ["14", "23"],
  },
  {
    id: "38",
    keyword: "Cookie",
    meaning: "Cookie info",
    ids: ["9", "14", "23", "24"],
  },
  {
    id: "39",
    keyword: "connections",
    meaning: "Connection info",
    ids: ["9", "14", "23", "24"],
  },
  {
    id: "40",
    keyword: "beacons",
    meaning: "Beacons info",
    ids: ["9", "14", "23", "24"],
  },
  {
    id: "41",
    keyword: "call",
    meaning: "Call info",
    ids: ["14", "16", "17", "23", "24"],
  },
  {
    id: "42",
    keyword: "messager",
    meaning: "Messager",
    ids: ["11", "14", "16", "17", "23", "24"],
  },
  {
    id: "43",
    keyword: "phone number",
    meaning: "Phone number",
    ids: ["11", "16", "17"],
  },
  {
    id: "44",
    keyword: "phone calls",
    meaning: "Phone calls",
    ids: ["14", "16", "17", "23", "24"],
  },
  { id: "45", keyword: "card", meaning: "Card Info", ids: ["15"] },
];
// [
//   {
//     id: "1",
//     keywords: [],
//     level: "1",
//     name: "Admin",
//     parent: "null",
//   },
//   {
//     id: "8",
//     keywords: ["profile", "profiling"],
//     level: "2",
//     name: "Profiling",
//     parent: "1",
//   },
//   {
//     id: "9",
//     keywords: ["analytics", "analysis", "analyze", "analyse", "analyzing"],
//     level: "2",
//     name: "Analysis",
//     parent: "1",
//   },
//   {
//     id: "10",
//     keywords: ["statistical", "statistics"],
//     level: "2",
//     name: "Statistical",
//     parent: "1",
//   },
//   {
//     id: "11",
//     keywords: ["ads", "advertising", "advertisement", "advertisers"],
//     level: "2",
//     name: "Advertisements",
//     parent: "1",
//   },
//   {
//     id: "12",
//     keywords: ["maintain", "maintenance", "maintained"],
//     level: "2",
//     name: "Maintenance",
//     parent: "1",
//   },
//   {
//     id: "13",
//     keywords: [
//       "identifier",
//       "identifying",
//       "authentication",
//       "authenticate",
//       "authenticates",
//       "identity",
//       "identities",
//       "identifiable",
//       "identifies",
//     ],
//     level: "2",
//     name: "Identifying",
//     parent: "1",
//   },
//   {
//     id: "14",
//     keywords: ["troubleshooting", "tests", "testing", "troubleshoot"],
//     level: "2",
//     name: "Testing/Troubleshooting",
//     parent: "1",
//   },
//   {
//     id: "2",
//     keywords: ["business", "commercial", "businesses", "purchase"],
//     level: "1",
//     name: "Purchase",
//     parent: "null",
//   },
//   {
//     id: "15",
//     keywords: ["purchase", "purchasing", "payment"],
//     level: "2",
//     name: "Payment",
//     parent: "2",
//   },
//   {
//     id: "16",
//     keywords: ["delivery", "shipping", "delivering"],
//     level: "2",
//     name: "Delivery",
//     parent: "2",
//   },
//   {
//     id: "17",
//     keywords: ["contacting", "contacts", "contacted", "communications"],
//     level: "2",
//     name: "Contacting",
//     parent: "2",
//   },
//   {
//     id: "3",
//     keywords: [],
//     level: "1",
//     name: "Education",
//     parent: "null",
//   },
//   {
//     id: "18",
//     keywords: ["research", "researching"],
//     level: "2",
//     name: "Research",
//     parent: "3",
//   },
//   {
//     id: "19",
//     keywords: ["survey"],
//     level: "2",
//     name: "Survey",
//     parent: "3",
//   },
//   {
//     id: "4",
//     keywords: ["medical", "healthcare", "health care", "disease"],
//     level: "1",
//     name: "Medical",
//     parent: "null",
//   },
//   {
//     id: "20",
//     keywords: ["treatment"],
//     level: "2",
//     name: "Treatment",
//     parent: "4",
//   },
//   {
//     id: "21",
//     keywords: ["diagnostics", "diagnosis"],
//     level: "2",
//     name: "Diagnosis",
//     parent: "4",
//   },
//   {
//     id: "5",
//     keywords: ["booking"],
//     level: "1",
//     name: "Booking",
//     parent: "null",
//   },
//   {
//     id: "6",
//     keywords: [],
//     level: "1",
//     name: "Services",
//     parent: "null",
//   },
//   {
//     id: "22",
//     keywords: ["improve", "improving", "improvement"],
//     level: "2",
//     name: "Improving quality",
//     parent: "6",
//   },
//   {
//     id: "23",
//     keywords: ["new service", "new product", "new feature", "new functions"],
//     level: "2",
//     name: "Developing the new services",
//     parent: "6",
//   },
//   {
//     id: "7",
//     keywords: [],
//     level: "1",
//     name: "Marketing",
//     parent: "null",
//   },

//   {
//     id: "24",
//     keywords: ["direct"],
//     level: "2",
//     name: "Direct",
//     parent: "7",
//   },
//   {
//     id: "25",
//     keywords: ["direct &amp;amp;&amp;amp; email"],
//     level: "3",
//     name: "Direct Email",
//     parent: "24",
//   },
//   {
//     id: "26",
//     keywords: ["direct &amp;amp;&amp;amp; phone"],
//     level: "3",
//     name: "Direct Phone",
//     parent: "24",
//   },
// {
//   id: "27",
//   keywords: [
//     "third-party",
//     "3rd parties",
//     "third party",
//     "third parties",
//     "3rd party",
//   ],
//   level: "2",
//   name: "Third-party",
//   parent: "7",
// },
// {
//   id: "28",
//   keywords: [
//     "third-party",
//     "3rd parties",
//     "third party",
//     "third parties",
//     "3rd party &amp;amp;&amp;amp; email",
//   ],
//   level: "3",
//   name: "Third-party Email",
//   parent: "27",
// },
// {
//   id: "29",
//   keywords: [
//     "third-party",
//     "3rd parties",
//     "third party",
//     "third parties",
//     "3rd party &amp;amp;&amp;amp; postal",
//   ],
//   level: "3",
//   name: "Third-party Postal",
//   parent: "27",
// },
// ];
const categoriesThirdParty = [
  {
    id: "0",
    name: "Third party",
    level: "0",
    parent: "null",
    keywords: [
      "Third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party",
    ],
  },
  {
    id: "2",
    name: "Purpose",
    level: "1",
    parent: "null",
    keywords: [""],
  },
  {
    id: "10",
    name: "Payment",
    level: "2",
    parent: "2",
    keywords: ["payment; purchase; order; credit card"],
  },
  {
    id: "11",
    name: "Delivery",
    level: "2",
    parent: "2",
    keywords: ["diliver; delivery; deliverer"],
  },
  {
    id: "12",
    name: "Marketing",
    level: "2",
    parent: "2",
    keywords: ["marketing"],
  },
  {
    id: "13",
    name: "Advertisement",
    level: "2",
    parent: "2",
    keywords: ["Advertising; ads; advertisement; advertiser;"],
  },
  {
    id: "14",
    name: "Analysis",
    level: "2",
    parent: "2",
    keywords: [
      "Analysis; analytical; analysed; analyzed; analytics; market research",
    ],
  },
];
const collectedDataThirdParty = [
  {
    id: "3",
    name: "User Profile",
    level: "2",
    parent: "1",
    keywords: [
      "name; contact; email; account; identifiable; identity; social network; behavioral; behavior; about you; card",
    ],
  },
  {
    id: "4",
    name: "Location",
    level: "2",
    parent: "1",
    keywords: ["location; address"],
  },
  {
    id: "5",
    name: "Media",
    level: "2",
    parent: "1",
    keywords: ["media; video; audio; picture; image"],
  },
  {
    id: "6",
    name: "Health & Fitness",
    level: "2",
    parent: "1",
    keywords: ["health; fitness; blood; step; activity; activities"],
  },
  {
    id: "7",
    name: "Hardware",
    level: "2",
    parent: "1",
    keywords: [
      "camera; IP address; MAC address; sensor; accelerometer; gyroscope; microphone; volumn",
    ],
  },
  {
    id: "8",
    name: "Connection",
    level: "2",
    parent: "1",
    keywords: ["Wifi; Bluetooth; NFC; Cookie; connections; beacons"],
  },
  {
    id: "9",
    name: "Telephony",
    level: "2",
    parent: "1",
    keywords: ["call; messager; phone number; phone calls"],
  },
];
const keywordAndMeaningsThirdParty = [
  {
    id: "1",
    keyword: "name",
    meaning: "User name",
    ids: ["10", "11", "12", "13"],
  },
  {
    id: "2",
    keyword: "contact",
    meaning: "Contact information",
    ids: ["10", "11", "12", "14"],
  },
  {
    id: "3",
    keyword: "email",
    meaning: "User Email",
    ids: ["10", "11", "12", "15"],
  },
  {
    id: "4",
    keyword: "account",
    meaning: "Account info",
    ids: ["10", "11", "12", "16"],
  },
  {
    id: "7",
    keyword: "identifiable",
    meaning: "User ID",
    ids: ["10", "11", "12", "13"],
  },
  {
    id: "8",
    keyword: "identity",
    meaning: "User Identity",
    ids: ["10", "11", "12", "13"],
  },
  {
    id: "9",
    keyword: "social network",
    meaning: "Social info",
    ids: ["12"],
  },
  {
    id: "10",
    keyword: "behavioral",
    meaning: "User interaction",
    ids: ["13"],
  },
  {
    id: "11",
    keyword: "behavior",
    meaning: "User behavior",
    ids: ["13"],
  },
  {
    id: "12",
    keyword: "about you",
    meaning: "Your profile",
    ids: ["10", "11", "12", "13"],
  },
  {
    id: "14",
    keyword: "location",
    meaning: "Location info",
    ids: ["14"],
  },
  {
    id: "15",
    keyword: "address",
    meaning: "User address",
    ids: ["14"],
  },
  { id: "16", keyword: "media", meaning: "Media files", ids: ["14"] },
  { id: "17", keyword: "video", meaning: "Video files", ids: ["14"] },
  { id: "18", keyword: "audio", meaning: "Audio files", ids: ["14"] },
  {
    id: "19",
    keyword: "picture",
    meaning: "Picture files",
    ids: ["14"],
  },
  { id: "20", keyword: "image", meaning: "Image files", ids: ["14"] },
  {
    id: "21",
    keyword: "health",
    meaning: "Health info",
    ids: ["14"],
  },
  {
    id: "22",
    keyword: "fitness",
    meaning: "Fitness info",
    ids: ["14"],
  },
  { id: "23", keyword: "blood", meaning: "Blood info", ids: ["14"] },
  { id: "24", keyword: "step", meaning: "Step count", ids: ["14"] },
  {
    id: "25",
    keyword: "activity",
    meaning: "User activity",
    ids: ["14"],
  },
  {
    id: "26",
    keyword: "activities",
    meaning: "User activities",
    ids: ["14"],
  },
  {
    id: "27",
    keyword: "camera",
    meaning: "Camera info",
    ids: ["14"],
  },
  {
    id: "28",
    keyword: "IP address",
    meaning: "IP Address",
    ids: ["14"],
  },
  {
    id: "29",
    keyword: "MAC address",
    meaning: "MAC Address",
    ids: ["14"],
  },
  {
    id: "30",
    keyword: "sensor",
    meaning: "Sensor info",
    ids: ["14"],
  },
  {
    id: "31",
    keyword: "accelerometer",
    meaning: "Accelerometer output",
    ids: ["14"],
  },
  {
    id: "32",
    keyword: "gyroscope",
    meaning: "Gyroscope output",
    ids: ["14"],
  },
  {
    id: "33",
    keyword: "microphone",
    meaning: "Microphone state",
    ids: ["14"],
  },
  {
    id: "34",
    keyword: "volumn",
    meaning: "Volumn setting",
    ids: ["14"],
  },
  {
    id: "35",
    keyword: "Wifi",
    meaning: "Wifi connection state",
    ids: ["14"],
  },
  {
    id: "36",
    keyword: "Bluetooth",
    meaning: "Bluetooth info",
    ids: ["14"],
  },
  { id: "37", keyword: "NFC", meaning: "NFC state", ids: ["14"] },
  {
    id: "38",
    keyword: "Cookie",
    meaning: "Cookie info",
    ids: ["14"],
  },
  {
    id: "39",
    keyword: "connections",
    meaning: "Connection info",
    ids: ["14"],
  },
  {
    id: "40",
    keyword: "beacons",
    meaning: "Beacons info",
    ids: ["14"],
  },
  { id: "41", keyword: "call", meaning: "Call info", ids: ["14"] },
  { id: "42", keyword: "messager", meaning: "Messager", ids: ["14"] },
  {
    id: "43",
    keyword: "phone number",
    meaning: "Phone number",
    ids: ["14"],
  },
  {
    id: "44",
    keyword: "phone calls",
    meaning: "Phone calls",
    ids: ["14"],
  },
  { id: "45", keyword: "card", meaning: "Card Info", ids: ["10"] },
];
// [
//   {
//     id: "1",
//     keywords: [
//       "Third-party",
//       "3rd parties",
//       "third party",
//       "third parties",
//       "3rd party",
//     ],
//     level: "1",
//     name: "Third-party",
//     parent: "null",
//   },
//   {
//     id: "2",
//     keywords: [
//       "Third-party",
//       "3rd parties",
//       "third party",
//       "third parties",
//       "3rd party && email",
//     ],
//     level: "2",
//     name: "Third-party Email",
//     parent: "1",
//   },
//   {
//     id: "3",
//     keywords: [
//       "Third-party",
//       "3rd parties",
//       "third party",
//       "third parties",
//       "3rd party && postal",
//     ],
//     level: "2",
//     name: "Third-party Postal",
//     parent: "1",
//   },
// ];

const categoriesRetention = [
  {
    id: "1",
    name: "Data",
    level: "1",
    parent: "null",
    keywords: [
      // "retain", "retention"
    ],
  },
  {
    id: "2",
    name: "Period",
    level: "1",
    parent: "null",
    keywords: [
      // "retain", "retention"
    ],
  },
  {
    id: "3",
    name: "less than a day (<24 hours)",
    level: "2",
    parent: "2",
    keywords: ["< 24 hours"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "4",
    name: "1 day (24 hours) - 14 days (two week)",
    level: "2",
    parent: "2",
    keywords: ["> 24 hours && < 14 days"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "5",
    name: "15 days - 1 month (30 day)",
    level: "2",
    parent: "2",
    keywords: [">14 days && < 30 days"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "6",
    name: "1 month - 3 months (90 day)",
    level: "2",
    parent: "2",
    keywords: ["> 1 month && < 3 months"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "7",
    name: "3 months - 6 months (185 days)",
    level: "2",
    parent: "2",
    keywords: ["> 3 months && < 6 months"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "8",
    name: "6 months - 1 year (12 months)",
    level: "2",
    parent: "2",
    keywords: ["> 6 months && < 1 year"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "9",
    name: "1 year - 2 years (24 months)",
    level: "2",
    parent: "2",
    keywords: ["> 1 year && < 2 years"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "10",
    name: "2 years - several years (> 24 months)",
    level: "2",
    parent: "2",
    keywords: ["> 2 years"],
    isTime: true,
    isShowKey: true,
  },
  {
    id: "11",
    name: "User Profile",
    level: "2",
    parent: "1",
    keywords: [
      "name; contact information; your email; user email; account; password; private chats; identifiable; identity; social network; behavioral; behavior; about you; personal information",
    ],
  },
  {
    id: "12",
    name: "Location",
    level: "2",
    parent: "1",
    keywords: ["location; address"],
  },
  {
    id: "13",
    name: "Media",
    level: "2",
    parent: "1",
    keywords: ["media; video; audio; picture; image"],
  },
  {
    id: "14",
    name: "Health & Fitness",
    level: "2",
    parent: "1",
    keywords: ["health; fitness; blood; step; activity; activities"],
  },
  {
    id: "15",
    name: "Hardware",
    level: "2",
    parent: "1",
    keywords: [
      "camera; IP address; MAC address; sensor; accelerometer; gyroscope; microphone; volumn",
    ],
  },
  {
    id: "16",
    name: "Connection",
    level: "2",
    parent: "1",
    keywords: ["Wifi; Bluetooth; NFC; Cookie; connections; beacons"],
  },
  {
    id: "17",
    name: "Telephony",
    level: "2",
    parent: "1",
    keywords: ["call; messager; phone number; phone calls"],
  },
];

const keywordsRequiredRetention = ["retain", "retention"];
const keywordsRequiredThirdParty = [
  "Third-party",
  "3rd parties",
  "third party",
  "third parties",
  "3rd party",
];

// [
//   {
//     id: "1",
//     keywords: ["data retention", "retain"],
//     level: "1",
//     name: "Data retention",
//     parent: "null",
//   },
// ];
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
  "Travel & Local": "Travel & Local",
};
const categoriesData = [
  // "Beauty",
  // "Health & Fitness",
  // "Tools",
  // "Business",
  // "Social",
  // "Shopping",
  // "Entertainment",
  // "Travel & Local",
  // "Music & Audio",
  // "Finance",
  // "Education",
  // "Food & Drink",
  // "Sports",
  // "Maps & Navigation",
  // "Medical",

  "Beauty",
  // "Simulation",
  // "Lifestyle",
  // "Health & Fitness",
  // "Books & Reference",
  // "Tools",
  // "Business",
  // "Social",
  // "Shopping",
  // "Puzzle",
  // "Entertainment",
  // "Travel & Local",
  // "Comics",
  // "Music & Audio",
  // "Strategy",
  // "Video Players & Editors",
  // "Productivity",
  // "Finance",
  // "Education",
  // "News & Magazines",
  // "Parenting",
  // "Food & Drink",
  // "Casual",
  // "Medical",
  // "Maps & Navigation",
  // "Auto & Vehicles",
  // "Pretend Play",
  // "Communication",
  // "Sports",
  // "Word",
  // "Action",
  // "Racing",
  // "Dating",
  // "Weather",
  // "Photography",
  // "Personalization",
  // "Art & Design",
  // "Events",
  // "Action & Adventure",
  // "Adventure",
  // "House & Home",
  // "Creativity",
  // "Card",
  // "Casino",
  // "Trivia",
  // "Arcade",
  // "Role Playing",
  // "Educational",
  // "Libraries & Demo",
  // "Board",
  // "Music",
  // "Brain Games",
  // "Music & Video",
];

function getParentCategories(childCategoryName, parents = [], categories) {
  try {
    const category = categories.find((item) => item.name === childCategoryName);

    if (
      category.parent &&
      category.parent !== null &&
      category.parent !== "null"
    ) {
      const parent = categories.find((item) => item.id === category.parent);
      parents.push(parent);

      getParentCategories(parent.name, parents);
    }
    return parents;
  } catch (error) {
    console.log("ERROR: getParentCategories");
    throw error;
  }
}

function getChildCategories(categoryName, categories, result = []) {
  const category = categories.find((item) => item.name === categoryName);

  const childs = categories.filter((item) => item.parent === category.id);

  console.log(1, categoryName, category, childs);
  for (let i = 0; i < childs.length; i++) {
    const child = childs[i];

    getChildCategories(child.name, categories, result);

    result.push(child);
  }

  return result;
}

function checkParentHasContent(childCategoryName, ppCategories, categories) {
  try {
    const childCategory = categories.find(
      (item) => item.name === childCategoryName
    );
    const parentCategory = categories.find(
      (item) => item.id === childCategory.parent
    );
    parentCategory &&
      parentCategory.keywords &&
      (parentCategory.keywords = parentCategory.keywords.filter(
        (item) => !!item
      ));

    if (parentCategory && parentCategory.keywords.length > 0) {
      const contentsParent = ppCategories[parentCategory.name];

      if (!contentsParent || contentsParent.length === 0) return false;

      return checkParentHasContent(
        parentCategory.name,
        ppCategories,
        categories
      );
    }

    return true;
  } catch (error) {
    console.log("ERROR: checkParentHasContent");
    throw error;
  }
}

async function getPPCategories(contentPrivacyPolicy) {
  const result = {};

  try {
    if (!contentPrivacyPolicy) return null;

    const ppData = await axios.get(
      `http://127.0.0.1:8081/beforeaccept?url_text=&policy_text=${escape(
        contentPrivacyPolicy
      )}`,
      {
        headers: { "Content-Language": "en-US" },
        timeout: 20000,
      }
    );
    // .then(console.log);
    if (!_.isObject(ppData.data)) return null;

    const contentTypes = {
      collection: (
        [
          ...ppData.data.segments_third_party_sharing,
          ...ppData.data.segments_first_party_collection,
        ] || []
      ).reduce((acc, item) => {
        const items = item.split(/([\.\?!])(?= )/);
        return [...acc, ...items];
      }, []),
      thirdParty: (
        [
          ...ppData.data.segments_third_party_sharing,
          ...ppData.data.segments_first_party_collection,
        ] || []
      ).reduce((acc, item) => {
        const items = item.split(/([\.\?!])(?= )/);
        return [...acc, ...items];
      }, []),
      retention: (ppData.data.segments_data_retention || []).reduce(
        (acc, item) => {
          const items = item.split(/([\.\?!])(?= )/);
          return [...acc, ...items];
        },
        []
      ),
    };

    for (const contentType in contentTypes) {
      const contents = contentTypes[contentType];
      let categories;
      switch (contentType) {
        case "collection":
          categories = categoriesCollection;
          break;

        case "thirdParty":
          categories = categoriesThirdParty;
          break;

        default:
          categories = categoriesRetention;
          break;
      }

      result[contentType] = {};
      categories.forEach((category) => {
        if (!result[contentType][category.name])
          result[contentType][category.name] = [];
      });
      // loop contents
      for (let i = 0; i < contents.length; i++) {
        let content = contents[i];
        content = content.toLowerCase();

        // check keywords required for "retention", "thirdParty"
        if (["retention", "thirdParty"].includes(contentType)) {
          let isContinue = false;
          (contentType === "thirdParty"
            ? keywordsRequiredThirdParty
            : keywordsRequiredRetention
          ).forEach((item) => {
            if (~content.indexOf(item.toLowerCase())) isContinue = true;
          });
          if (!isContinue) continue;
        }

        // loop categories
        categories.forEach((category) => {
          const { keywords, requiredKeyword, isTime } = category;

          // loop keywords
          for (let j = 0; j < keywords.length; j++) {
            let keywordItems = keywords[j];
            keywordItems = keywordItems.toLowerCase();

            keywordItems =
              keywordItems &&
              keywordItems
                .split(";")
                .filter((item) => !!item)
                .map((item) => item.trim());

            keywordItems &&
              keywordItems.forEach((keyword) => {
                // find keyword in content
                // is time
                if (isTime) {
                  const hours = getTimeInContent("hour", content);
                  const days = getTimeInContent("day", content);
                  const months = getTimeInContent("month", content);
                  const years = getTimeInContent("year", content);
                  switch (keyword) {
                    case "< 24 hours": {
                      if (
                        hours &&
                        hours.length &&
                        hours.some((hour) => hour < 24)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }
                    case "> 24 hours && < 14 days": {
                      if (
                        hours &&
                        hours.length &&
                        hours.some((hour) => hour > 24) &&
                        days.some((day) => day < 14)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case ">14 days && < 30 days": {
                      if (
                        hours &&
                        hours.length &&
                        days.some((day) => day > 14 && day < 30)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case "> 1 month && < 3 months": {
                      if (
                        hours &&
                        hours.length &&
                        months.some((month) => month > 1 && month < 3)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case "> 3 months && < 6 months": {
                      if (
                        hours &&
                        hours.length &&
                        months.some((month) => month > 3 && month < 6)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case "> 6 months && < 1 year": {
                      if (
                        hours &&
                        hours.length &&
                        months.some((month) => month > 6 && month < 12)
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case "> 1 year && < 2 years": {
                      if (
                        hours &&
                        hours.length &&
                        (years.some((year) => year > 1 && year < 2) ||
                          months.some((month) => month > 12 && month < 24))
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }

                    case "> 2 years": {
                      if (
                        hours &&
                        hours.length &&
                        (years.some((year) => year > 2) ||
                          months.some((month) => month > 24))
                      ) {
                        result[contentType][category.name].push(content);
                      }
                      break;
                    }
                  }
                  // console.log(hours, days, months, years);
                } else {
                  if (
                    (~content.indexOf(keyword.toLowerCase()) &&
                      !requiredKeyword) ||
                    (~content.indexOf(keyword.toLowerCase()) &&
                      requiredKeyword &&
                      ~content.indexOf(requiredKeyword.toLowerCase()))
                  ) {
                    const isExisted = result[contentType][category.name].some(
                      (item) => item === content
                    );
                    !isExisted &&
                      result[contentType][category.name].push(content);
                    // break;
                  }
                }
              });
          }
        });
      }
    }

    return result;
  } catch (e) {
    console.log(`ERROR getPPCategories: ${e.message}`);
    return null;
  }
}
function getTimeInContent(keyword, content) {
  const matchedContent = content.match(new RegExp(`[0-9]+ ${keyword}`, "g"));
  if (matchedContent && matchedContent.length) {
    return matchedContent[0].match(/[0-9]+/g);
  }
  return;
}
async function getParent(node) {
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
  return getParent(parent);
}

updateAppsPrivacyPolicy();
async function updateAppsPrivacyPolicy() {
  const apps = await Models.App.find({
    // isCompleted: true,
    // appName: {
    //   $in: [
    //     "truecaller: phone caller id, spam blocking & chat",
    //     "mi music",
    //     "huawei backup",
    //     "file manager : free and easily",
    //     "tiktok",
    //     "linkedin: jobs, business news & social networking",
    //     "hicare",
    //     "microsoft teams",
    //     "spotify: listen to podcasts & find music you love",
    //     "zoom cloud meetings",
    //   ],
    // },
  }).select("id");

  // // .limit(1);
  const appIds = _.map(apps, "id");

  for (let i = 0; i < appIds.length; i++) {
    const appId = appIds[i];
    await updateAppPrivacyPolicy(appId);
  }
  // await Promise.all(appIds.map(updateAppPrivacyPolicy));

  // await Helpers.Tree.getTreeFromNode("602951a8163e554ddd9a1274");
  console.log("DONE");
}

async function updateAppPrivacyPolicy(appId) {
  try {
    const app = await Models.App.findById(appId);

    let ppCategoriesAPP = {};
    let ppCategoriesAPPContent = {};
    // pp
    const ppCategorieTypes = await getPPCategories(app.contentPrivacyPolicy);
    if (!ppCategorieTypes) return;

    for (const dataType in ppCategorieTypes) {
      const ppCategories = ppCategorieTypes[dataType];

      ppCategoriesAPP[dataType] = [];
      ppCategoriesAPPContent[dataType] = [];
      let categories;

      switch (dataType) {
        case "collection":
          categories = categoriesCollection;
          break;

        case "thirdParty":
          categories = categoriesThirdParty;
          break;

        default:
          categories = categoriesRetention;
          break;
      }

      if (ppCategories) {
        for (const category in ppCategories) {
          const contents = ppCategories[category];

          const isParentHasContent = checkParentHasContent(
            category,
            ppCategories,
            categories
          );
          if (isParentHasContent && contents && contents.length > 0) {
            let childCategories = _.flatten(
              getChildCategories(category, categories)
            );
            childCategories = _.map(childCategories, "name");
            if (childCategories.length === 0) {
              ppCategoriesAPP[dataType].push(category);
              ppCategoriesAPPContent[dataType].push(contents);
            }

            if (
              _.difference(ppCategoriesAPP[dataType], childCategories).lenth ===
              childCategories.lenth
            ) {
              ppCategoriesAPPContent[dataType][category] = contents;
              ppCategoriesAPP[dataType].push(category);
            }
          }
        }
      }

      ppCategoriesAPP[dataType] = _.uniq(ppCategoriesAPP[dataType]);
    }

    const collectionData = [];
    for (let i = 0; i < ppCategoriesAPP.collection.length; i++) {
      const element = ppCategoriesAPP.collection[i];
      await createTreeDataByNode(element, collectionData, categoriesCollection);
    }
    // map CONTENT
    for (const categoryName in ppCategoriesAPPContent.collection) {
      const contents = ppCategoriesAPPContent.collection[categoryName];

      mapContentWithCategory(categoryName, contents, collectionData);
    }

    // get meanings
    getMeaningWithCategory(collectionData, "collection");

    const thirdPartyData = [];
    for (let i = 0; i < ppCategoriesAPP.thirdParty.length; i++) {
      const element = ppCategoriesAPP.thirdParty[i];
      await createTreeDataByNode(element, thirdPartyData, categoriesThirdParty);
    }
    // map CONTENT
    for (const categoryName in ppCategoriesAPPContent.thirdParty) {
      const contents = ppCategoriesAPPContent.thirdParty[categoryName];

      mapContentWithCategory(categoryName, contents, thirdPartyData);
    }
    // get meanings
    getMeaningWithCategory(thirdPartyData, "thirdParty");

    const retentionData = [];
    for (let i = 0; i < ppCategoriesAPP.retention.length; i++) {
      const element = ppCategoriesAPP.retention[i];
      await createTreeDataByNode(element, retentionData, categoriesRetention);
    }
    // map CONTENT
    for (const categoryName in ppCategoriesAPPContent.retention) {
      const contents = ppCategoriesAPPContent.retention[categoryName];

      mapContentWithCategory(categoryName, contents, retentionData);
    }

    // console.log(1, app._id, {
    //   collectionData: JSON.stringify(collectionData),
    //   thirdPartyData: JSON.stringify(thirdPartyData),
    //   retentionData: JSON.stringify(retentionData),
    // });

    await Models.App.updateOne(
      {
        _id: app._id,
      },
      {
        $set: {
          collectionData: JSON.stringify(collectionData),
          thirdPartyData: JSON.stringify(thirdPartyData),
          retentionData: JSON.stringify(retentionData),
        },
      },
      {},
      (err, data) => {
        // Helpers.Logger.info(`Data saved1: ${JSON.stringify(data, null, 2)}`)
      }
    );
  } catch (err) {
    console.log(err);
    console.log(`ERROR: ${appId} ${err.message}`);
  }
}

const mapContentWithCategory = (categoryName, contents, originalData) => {
  for (let i = 0; i < originalData.length; i++) {
    const element = originalData[i];

    if (element.name === categoryName) return (element.contents = contents);

    if (element.children && element.children.length) {
      mapContentWithCategory(categoryName, contents, element.children);
    }
  }
  return;
};

const getMeaningWithCategory = (originalData, dataType) => {
  let categories;
  let categoriesMeaning;
  let collectionData;
  switch (dataType) {
    case "collection":
      categories = categoriesCollection;
      categoriesMeaning = keywordAndMeaningsCollection;
      collectionData = collectedDataCollection;
      break;

    case "thirdParty":
      categories = categoriesThirdParty;
      categoriesMeaning = keywordAndMeaningsThirdParty;
      collectionData = collectedDataThirdParty;
      break;

    default:
      categories = categoriesRetention;
      break;
  }

  for (let i = 0; i < originalData.length; i++) {
    const element = originalData[i];
    element.meanings = [];

    const contents = element.contents ? element.contents.join(",") : "";
    collectionData.forEach((collectedItem) => {
      let { keywords, name: groupKeyword } = collectedItem;
      keywords = keywords[0].split(";").map((item) => item.trim());

      keywords.forEach((keyword) => {
        // check in cateogory's content
        if (~contents.indexOf(keyword)) {
          categoriesMeaning.forEach((categoryMeaning) => {
            if (
              categoryMeaning.keyword.toLowerCase().trim() === keyword &&
              categoryMeaning.ids.includes(element.id)
            ) {
              // handle
              const index = element.meanings.findIndex(
                (item) => item.groupKeyword === groupKeyword
              );
              if (~index) {
                element.meanings[index].meanings.push(categoryMeaning.meaning);
              } else {
                element.meanings.push({
                  groupKeyword,
                  meanings: [categoryMeaning.meaning],
                });
              }
            }
          });
        }
      });
    });
    if (element.children && element.children.length) {
      getMeaningWithCategory(element.children, dataType);
    }
  }
};

const parseCollectionData = (item) => {
  if (!item) return;
  return {
    id: item.id,
    name: item.name,
    parent: item.parent === "null" ? null : item.parent,
  };
};
async function createTreeDataByNode(categoryName, result = [], categoriesData) {
  const category = categoriesData.find((item) => item.name === categoryName);

  const pathString = getNodePath(category.id, categoriesData);
  let pathArray = pathString.split(".");
  pathArray = pathArray.filter((item) => {
    return !!item;
  });
  _.reverse(pathArray);

  await buildTree(pathArray, result, categoriesData);
}

async function buildTree(pathArray, result, categoriesData) {
  if (!pathArray || !pathArray.length) return result;
  let lv1, lv2, lv3;

  if (pathArray[0]) {
    lv1 = categoriesData.find((item) => item.id === pathArray[0]);
    lv1 = parseCollectionData(lv1);
  }

  if (pathArray[1]) {
    lv2 = categoriesData.find((item) => item.id === pathArray[1]);
    lv2 = parseCollectionData(lv2);
  }

  if (pathArray[2]) {
    lv3 = categoriesData.find((item) => item.id === pathArray[2]);
    lv3 = parseCollectionData(lv3);
  }

  if (lv1) {
    let lv1Result = result.find((item) => item.id === lv1.id);
    if (!lv1Result) {
      result.push(lv1);
      lv1Result = lv1;
    }
    if (!lv1Result.children) lv1.children = [];

    if (lv2) {
      lv1Result.children.push(lv2);

      if (lv3) {
        let lv2Result = lv1.children.find((item) => item.id === lv2.id);
        if (!lv2Result.children) lv2.children = [];
        lv2Result.children.push(lv3);
      }
    }
  }

  return result;
}

const getNodePath = (categoryId, categoriesData, pathString = "") => {
  const category = categoriesData.find((item) => item.id === categoryId);
  pathString += `${category.id}.`;

  if (category.parent && category.parent != "null")
    return getNodePath(category.parent, categoriesData, pathString);

  return pathString;
};
// createTreeDataByNode("Contacting");

const serialize = function (obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};
async function main() {
  // categoriesData
  // const apps = await Models.App.find()
  //   // .limit(1)
  //   .select("categoryName privacyLink contentPrivacyPolicy");
  // console.log(`app ${apps.length}`);
  // const appGroups = _.groupBy(apps, "categoryName");
  // // console.log(appGroups);
  // console.log(Object.keys(appGroups));
  // return;

  let content = "";
  for (const categoryName of categoriesData) {
    console.log(1, categoryName);
    const apps = await Models.App.find({ categoryName });
    content += `Category Name: ${categoryName} - ${apps.length} apps \n`;

    let collectionTotal = 0;
    let thirdPartyTotal = 0;
    let retentionTotal = 0;
    let noneTotal = 0;
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      let ppData;
      try {
        ppData = await axios.get(
          `http://127.0.0.1:8081/beforeaccept?url_text=&policy_text=${escape(
            app.contentPrivacyPolicy
          )}`,
          // `http://127.0.0.1:8081/beforeaccept?url_text=${app.privacyLink}&policy_text=`,
          {
            headers: { "Content-Language": "en-US" },
            timeout: 10000,
          }
        );
      } catch (err) {
        noneTotal++;
        continue;
      }

      if (!ppData.data) {
        noneTotal++;
        continue;
      }

      if (
        ppData.data.segments_first_party_collection &&
        ppData.data.segments_first_party_collection.length
      )
        collectionTotal++;
      if (
        ppData.data.segments_third_party_sharing &&
        ppData.data.segments_third_party_sharing.length
      )
        thirdPartyTotal++;
      if (
        ppData.data.segments_data_retention &&
        ppData.data.segments_data_retention.length
      )
        retentionTotal++;

      if (
        !ppData.data.segments_first_party_collection &&
        !ppData.data.segments_third_party_sharing &&
        !ppData.data.segments_data_retention
      )
        noneTotal++;
    }

    content += ` + purpose of data collection: ${collectionTotal} \n`;
    content += ` + third-party: ${thirdPartyTotal} \n`;
    content += ` + retention: ${retentionTotal} \n`;
    content += ` + None: ${noneTotal} \n`;
  }

  console.log(content);
}
// main2();
async function main2() {
  const { execSync } = require("child_process");
  //execSync(`mkdir ${path.join(__dirname, "/data")}`);
  const keywords = ["week", "year", "day", "month", "hour", "minute", "second"];
  const acceptedWords = [
    "retain",
    "retention",
    "remove",
    "delete",
    "store",
    "storage",
  ];
  const unexpectedWords = ["years old"];
  let content = "";

  for (const categoryGroup in categoryGroups) {
    let appsMatchedContent = "";

    console.log(1, categoryGroup);
    const categoriesData = categoryGroups[categoryGroup];
    const apps = await Models.App.find({
      categoryName: { $in: categoriesData },
    });

    content += `Category Name: ${categoryGroup} - ${apps.length} apps \n`;

    let retentionTotal = 0;
    let noneTotal = 0;
    let retentionMatchedNumberTotal = 0;
    let retentionMatchedNoneNumberTotal = 0;

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      console.log(`${categoryGroup}: running ${i}/${apps.length}`);
      let ppData;
      try {
        ppData = await axios.get(
          `http://127.0.0.1:8081/beforeaccept?url_text=&policy_text=${escape(
            app.contentPrivacyPolicy
          )}`,
          // `http://127.0.0.1:8081/beforeaccept?url_text=${app.privacyLink}&policy_text=`,
          {
            headers: { "Content-Language": "en-US" },
            timeout: 10000,
          }
        );
        //.then(() => {console.log(`Got privacy policy app ${app.appName}`)});
      } catch (err) {
        noneTotal++;
        continue;
      }

      if (
        !ppData ||
        !ppData.data ||
        !ppData.data.segments_data_retention ||
        !ppData.data.segments_data_retention.length
      ) {
        noneTotal++;
        continue;
      }
      retentionTotal++;
      const dataRetention = ppData.data.segments_data_retention;

      // const dataRetention = [
      //   "const dataRetention = ppData.data.segments_data_retention; 30 weeks dataRetention = ppData.data.segments_data_retention; years old",
      // ];
      let isContinue = false;
      //acceptedWords.forEach((item) => {
      //  if (dataRetention.join("").includes(item)) isContinue = true;
      //});
      // if (!isContinue) continue;

      //isContinue = false;
      unexpectedWords.forEach((item) => {
        if (!dataRetention.join("").includes(item)) isContinue = true;
      });
      if (!isContinue) continue;

      for (let j = 0; j < keywords.length; j++) {
        const keyword = keywords[j];

        const matchedNumberItems = dataRetention.filter((item) => {
          const matchedContent = item.match(
            new RegExp(`[0-9]+ ${keyword}`, "g")
          );
          if (matchedContent && matchedContent.length && keyword === "year") {
            if (matchedContent[0].match(/[0-9]+/g) > 10) return false;
          }
          return matchedContent && !!matchedContent.length;
        });
        // number
        if (matchedNumberItems.length) {
          appsMatchedContent += `App name: ${app.appName} \n`;
          appsMatchedContent += `   + ${matchedNumberItems.join("")} \n\n`;
          retentionMatchedNumberTotal++;
          break;
        } else {
          const matchedItems = dataRetention.filter((item) => {
            return item.includes(keyword);
          });
          if (matchedItems.length) retentionMatchedNoneNumberTotal++;
        }
      }
    }
    content += ` + Có keyword và number:  ${retentionMatchedNumberTotal} (${
      (retentionMatchedNumberTotal / retentionTotal) * 100 || 0
    }%) \n`;
    content += ` + Có keyword: ${retentionMatchedNoneNumberTotal} \n\n`;

    fs.writeFileSync(
      path.join(__dirname, `/data/${categoryGroup}.txt`),
      appsMatchedContent,
      { encoding: "utf8" },
      () => {
        console.log(
          `Created file ${path.join(__dirname, `/data/${categoryGroup}.txt`)}`
        );
      }
    );
  }

  console.log(content);
}
// main();
