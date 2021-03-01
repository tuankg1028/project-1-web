require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import fs from "fs";
import path from "path";
import readline from "linebyline";
import slug from "slug";
import axios from "axios";
import readXlsxFile from "read-excel-file/node";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const categories = [
  { name: "Profiling", keywords: ["profile", "profiling"] },
  {
    name: "Analysis",
    keywords: ["Analytics", "analysis", "analyze", "analyse", "analyzing"],
  },
  {
    name: "Statistical",
    keywords: ["Statistical", "statistics"],
  },
  { name: "Marketing", keywords: ["marketing"] },
  {
    name: "Improving quality",
    keywords: ["improve", "improving", "improvement"],
  },
  {
    name: "Advertisements",
    keywords: ["ads", "advertising", "advertisement", "advertisers"],
  },
  {
    name: "Maintenance",
    keywords: ["maintain", "maintenance", "maintained"],
  },
  {
    name: "Payment",
    keywords: ["purchase", "purchasing", "payment"],
  },
  {
    name: "Developing the new services",
    keywords: ["new service", "new product", "new feature", "new functions"],
  },
  { name: "Research", keywords: ["research", "researching"] },
  {
    name: "Business/commercial",
    keywords: ["business", "commercial", "businesses"],
  },
  { name: "Survey", keywords: ["survey"] },
  { name: "Treatment", keywords: ["Treatment"] },
  { name: "Diagnosis", keywords: ["diagnostics", "diagnosis"] },
  { name: "Booking", keywords: ["booking"] },
  {
    name: "Testing/Troubleshooting",
    keywords: ["Troubleshooting", "tests", "testing", "troubleshoot"],
  },
  {
    name: "Identifying",
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
    name: "Contacting",
    keywords: ["Contacting", "contacts", "contacted", "communications"],
  },
  {
    name: "Delivery",
    keywords: ["delivery", "shipping", "delivering"],
  },
];

// const categories = [];
// let rl = readline(path.join(__dirname, "../data/keyword/KeyWorkSearch.txt"));
// rl.on("line", (line, lineCount, byteCount) => {
//   let [category, keywords] = line.split(":");

//   keywords = keywords
//     .trim()
//     .split(",")
//     .map((item) => item.trim());

//   categories.push({
//     name: category,
//     keywords,
//   });
// })
//   .on("end", () => {
//     console.log(categories);
//   })
//   .on("error", (err) => {});
async function main() {
  const headers = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "devName",
      title: "Dev name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "link",
      title: "Link",
    },
    ...categories.map((category) => {
      return {
        id: slug(category.name),
        title: category.name,
      };
    }),
  ];
  const rows = [];
  let contentTxt = "";

  const apps = await Models.App.find({
    isCompleted: true,
  }).limit(10);
  for (let i = 0; i < apps.length; i++) {
    const { appName, developer, categoryName, privacyLink } = apps[i];
    contentTxt += `(*.*)	${appName} \n`;
    const ppCategories = await getPPCategories(privacyLink);

    const appCategories = {};
    for (const category in ppCategories) {
      const contents = ppCategories[category];
      contentTxt += `	(-) ${category} \n`;

      appCategories[slug(category)] = contents.length ? "X" : "-";
      contentTxt += (contents.length ? contents.join("\n\n") : "No") + "\n";
    }
    rows.push({
      stt: i + 1,
      appName,
      devName: developer,
      category: categoryName,
      link: privacyLink,
      ...appCategories,
    });
  }
  const csvWriter = createCsvWriter({
    path: "result.csv",
    header: headers,
  });
  await csvWriter.writeRecords(rows);

  await fs.writeFileSync("result.txt", contentTxt, "utf8");
  console.log("DONE");
}

async function main2() {
  const headerResult = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "devName",
      title: "Dev name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "link",
      title: "Link",
    },
    ...categories.map((category) => {
      return {
        id: slug(category.name),
        title: category.name,
      };
    }),
    {
      id: "percent",
      title: "Percent",
    },
  ];

  const headerAnalyze = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "devName",
      title: "Dev name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "link",
      title: "Link",
    },
    ...categories.map((category) => {
      return {
        id: slug(category.name),
        title: category.name,
      };
    }),
  ];

  const data = await readXlsxFile(
    path.join(__dirname, "../data/keyword/PrivacyPolicySample.xlsx")
  );

  const [, ...actvityData] = data;

  const rowsResult = [];
  const rowsAnalyze = [];

  let sttTemp = 1;
  for (let i = 0; i < actvityData.length; i++) {
    const [
      stt,
      appName,
      developer,
      categoryName,
      privacyLink,
      ...categoryResult
    ] = actvityData[i];
    console.log("RUNNING", i);
    // if (appName.trim() !== "3D Geeks : Premium License for 3D Printing")
    //   continue;

    const ppCategories = await getPPCategories(privacyLink);

    if (ppCategories === null) continue;

    let contentTxt = `(*.*)	${appName} \n`;
    const appCategoriesResult = {};
    const appCategoriesAnalyze = {};
    let percent = 0;
    for (const category in ppCategories) {
      const contents = ppCategories[category];
      contentTxt += `	(-) ${category} \n`;

      let predict = categoryResult[_.findIndex(categories, ["name", category])];
      predict = predict ? predict.trim() : predict;
      appCategoriesResult[slug(category)] = contents.length
        ? predict === "x"
          ? 1
          : ""
        : predict === null || predict === ""
        ? 1
        : "";
      appCategoriesAnalyze[slug(category)] = contents.length ? "x" : "";

      contentTxt += (contents.length ? contents.join("\n\n") : "No") + "\n";

      if (
        (contents.length && predict == "x") ||
        (!contents.length && (predict === null || predict === ""))
      ) {
        percent++;
      }
    }
    rowsResult.push({
      stt: sttTemp,
      appName,
      devName: developer,
      category: categoryName,
      link: privacyLink,
      ...appCategoriesResult,
      percent: Math.round((percent / 19) * 100 * 100) / 100 + "%",
    });

    rowsAnalyze.push({
      stt: sttTemp,
      appName,
      devName: developer,
      category: categoryName,
      link: privacyLink,
      ...appCategoriesAnalyze,
    });
    sttTemp++;
    fs.writeFileSync(
      `contents(65 apps)/${appName.replace("/", "")}.txt`,
      contentTxt,
      "utf8"
    );
  }
  const csvWriterResult = createCsvWriter({
    path: "result.csv",
    header: headerResult,
  });
  await csvWriterResult.writeRecords(rowsResult);

  const csvWriterAnalyze = createCsvWriter({
    path: "analyze.csv",
    header: headerAnalyze,
  });
  await csvWriterAnalyze.writeRecords(rowsAnalyze);

  console.log("DONE");
}

async function getPPCategories(privacyLink) {
  const result = {};

  try {
    if (!privacyLink) return null;

    const ppData = await axios.get(
      `http://127.0.0.1:8081/beforeaccept?url_text=${privacyLink}&policy_text=`,
      {
        headers: { "Content-Language": "en-US" },
      }
    );
    if (!_.isObject(ppData.data)) return null;
    console.log(1, ppData.data);
    const contents = [
      ...ppData.data.segments_data_retention,
      ...ppData.data.segments_first_party_collection,
      ...ppData.data.segments_third_party_sharing,
    ];

    categories.forEach((category) => {
      if (!result[category.name]) result[category.name] = [];
    });
    // loop contents
    contents.forEach((content) => {
      content = content.toLowerCase();
      // loop categories
      categories.forEach((category) => {
        const { keywords } = category;

        // loop keywords
        for (let i = 0; i < keywords.length; i++) {
          let keyword = keywords[i];
          keyword = keyword.toLowerCase();
          // find keyword in content
          if (~content.indexOf(keyword)) {
            if (!_.includes(result[category.name], content)) {
              result[category.name].push(content);
            }
            break;
          }
        }
      });
    });

    return result;
  } catch (e) {
    console.log(e.message);
    return null;
  }
}
main2();
