require("dotenv").config();
import "../src/configs/mongoose.config";
import Models from "../src/models";
import _ from "lodash";
import fs from "fs";
import path from "path";
import readline from "linebyline";
import slug from "slug";
import axios from "axios";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const categories = [
  { name: "Profiling", keywords: ["profile", "profiling"] },
  {
    name: "Analysis",
    keywords: ["Analytics", "analysis", "analyze", "analyse", "analyzing"],
  },
  {
    name: "Statistical",
    keywords: ["Statistical", "statistics", ""],
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

async function getPPCategories(privacyLink) {
  const result = {};

  if (!privacyLink) return result;
  // const ppData = await axios.get(
  //   `http://127.0.0.1:8081/beforeaccept?url_text=${privacyLink}&policy_text=`
  // );

  const contents = [
    "We may disclose information about you as part of a merger, acquisition or other sale or transfer of the Company’s assets or business. The Company does not guarantee that any entity receiving such information in connection with one of these transactions will comply with all terms of this policy. We may disclose your Personal Information for purposes such as to provide services available on the Site; to coordinate with insurance, reinsurance and excess or stop loss insurers; to enforce our members’ rights; to protect against actual or potential fraud; to resolve member inquiries or disputes; to receive payments; to carry out our business; to protect the confidentiality or security of our records; to administer preventive health and case management programs; to perform underwriting, auditing and rate making functions; to enable our service providers to perform marketing services on our behalf and inform members about our own products or services; to comply with state laws and other applicable legal requirements. Moreover, we may be legally obligated to disclose Personal Information about you to the government or to third parties under certain circumstances, such as in connection with illegal activity on our Site or to respond to a subpoena, court order or other legal process. The Company reserves the right to release information that we collect to law enforcement or other government oﬃcials, as we, in our sole and absolute discretion, deem necessary or appropriate.",
    "lala",
  ];

  // loop contents
  contents.forEach((content) => {
    content = content.toLowerCase();
    // loop categories
    categories.forEach((category) => {
      if (!result[category.name]) result[category.name] = [];
      const { keywords } = category;

      // loop keywords
      for (let i = 0; i < keywords.length; i++) {
        let keyword = keywords[i];
        keyword = keyword.toLowerCase();
        // find keyword in content
        if (~content.indexOf(keyword)) {
          result[category.name].push(content);
          break;
        }
      }
    });
  });

  return result;
}
main();
