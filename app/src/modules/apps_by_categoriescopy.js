require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import fs from "fs";
import axios from "axios";
import slug from "slug";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const categories = [
  {
    id: "1",
    keywords: [],
    level: "1",
    name: "Admin",
    parent: "null",
  },
  {
    id: "8",
    keywords: ["profile", "profiling"],
    level: "2",
    name: "Profiling",
    parent: "1",
  },
  {
    id: "9",
    keywords: ["analytics", "analysis", "analyze", "analyse", "analyzing"],
    level: "2",
    name: "Analysis",
    parent: "1",
  },
  {
    id: "10",
    keywords: ["statistical", "statistics"],
    level: "2",
    name: "Statistical",
    parent: "1",
  },
  {
    id: "11",
    keywords: ["ads", "advertising", "advertisement", "advertisers"],
    level: "2",
    name: "Advertisements",
    parent: "1",
  },
  {
    id: "12",
    keywords: ["maintain", "maintenance", "maintained"],
    level: "2",
    name: "Maintenance",
    parent: "1",
  },
  {
    id: "13",
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
    level: "2",
    name: "Identifying",
    parent: "1",
  },
  {
    id: "14",
    keywords: ["troubleshooting", "tests", "testing", "troubleshoot"],
    level: "2",
    name: "Testing/Troubleshooting",
    parent: "1",
  },
  {
    id: "2",
    keywords: ["business", "commercial", "businesses", "purchase"],
    level: "1",
    name: "Purchase",
    parent: "null",
  },
  {
    id: "15",
    keywords: ["purchase", "purchasing", "payment"],
    level: "2",
    name: "Payment",
    parent: "2",
  },
  {
    id: "16",
    keywords: ["delivery", "shipping", "delivering"],
    level: "2",
    name: "Delivery",
    parent: "2",
  },
  {
    id: "17",
    keywords: ["contacting", "contacts", "contacted", "communications"],
    level: "2",
    name: "Contacting",
    parent: "2",
  },
  {
    id: "3",
    keywords: [],
    level: "1",
    name: "Education",
    parent: "null",
  },
  {
    id: "18",
    keywords: ["research", "researching"],
    level: "2",
    name: "Research",
    parent: "3",
  },
  {
    id: "19",
    keywords: ["survey"],
    level: "2",
    name: "Survey",
    parent: "3",
  },
  {
    id: "4",
    keywords: ["medical", "healthcare", "health care", "disease"],
    level: "1",
    name: "Medical",
    parent: "null",
  },
  {
    id: "20",
    keywords: ["treatment"],
    level: "2",
    name: "Treatment",
    parent: "4",
  },
  {
    id: "21",
    keywords: ["diagnostics", "diagnosis"],
    level: "2",
    name: "Diagnosis",
    parent: "4",
  },
  {
    id: "5",
    keywords: ["booking"],
    level: "1",
    name: "Booking",
    parent: "null",
  },
  {
    id: "6",
    keywords: [],
    level: "1",
    name: "Services",
    parent: "null",
  },
  {
    id: "22",
    keywords: ["improve", "improving", "improvement"],
    level: "2",
    name: "Improving quality",
    parent: "6",
  },
  {
    id: "23",
    keywords: ["new service", "new product", "new feature", "new functions"],
    level: "2",
    name: "Developing the new services",
    parent: "6",
  },
  {
    id: "7",
    keywords: [],
    level: "1",
    name: "Marketing",
    parent: "null",
  },

  {
    id: "24",
    keywords: ["direct"],
    level: "2",
    name: "Direct",
    parent: "7",
  },
  {
    id: "25",
    keywords: ["direct &amp;amp;&amp;amp; email"],
    level: "3",
    name: "Direct Email",
    parent: "24",
  },
  {
    id: "26",
    keywords: ["direct &amp;amp;&amp;amp; phone"],
    level: "3",
    name: "Direct Phone",
    parent: "24",
  },
  {
    id: "27",
    keywords: [
      "third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party",
    ],
    level: "2",
    name: "Third-party",
    parent: "7",
  },
  {
    id: "28",
    keywords: [
      "third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party &amp;amp;&amp;amp; email",
    ],
    level: "3",
    name: "Third-party Email",
    parent: "27",
  },
  {
    id: "29",
    keywords: [
      "third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party &amp;amp;&amp;amp; postal",
    ],
    level: "3",
    name: "Third-party Postal",
    parent: "27",
  },
];

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
  "Travel & Local": ["Travel & Local"],
};

console.log(1);
const categoriesData = [
  "Beauty",
  "Health & Fitness",
  "Tools",
  "Business",
  "Social",
  "Shopping",
  "Entertainment",
  "Travel & Local",
  "Music & Audio",
  "Finance",
  "Education",
  "Food & Drink",
  "Sports",
  "Maps & Navigation",
  "Medical",
];
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
      id: "developer",
      title: "Developer",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "apis",
      title: "APIs",
    },
    {
      id: "pp",
      title: "Privacy Policy",
    },
  ];

  const next2Data = {};
  const rows = [];
  for (const categoryName in categoryGroups) {
    const subCategories = categoryGroups[categoryName];

    console.log(`RUNNING ${categoryName}`);
    const apps = await Models.App.find({
      isCompleted: true,
      categoryName: {
        $in: subCategories,
      },
    });

    for (let j = 0; j < apps.length; j++) {
      const { developer, categoryName, appName, nodes, privacyLink, id } = apps[
        j
      ];
      console.log(`RUNNING ${appName}: ${nodes.length} nodes`);

      let apis = await Promise.all(nodes.map((node) => getParent(node)));

      let ppCategoriesAPP = [];
      // pp
      const ppCategories = await getPPCategories(privacyLink);
      if (ppCategories) {
        for (const category in ppCategories) {
          const contents = ppCategories[category];

          const isParentHasContent = checkParentHasContent(
            category,
            ppCategories
          );

          if (isParentHasContent && contents && contents.length > 0) {
            let childCategories = getChildCategories(category);
            childCategories = _.map(childCategories, "name");
            if (childCategories.length === 0) ppCategoriesAPP.push(category);

            if (
              _.difference(ppCategoriesAPP, childCategories).lenth ===
              childCategories.lenth
            )
              ppCategoriesAPP.push(category);
          }
        }
      }
      ppCategoriesAPP = _.uniq(ppCategoriesAPP);

      // rows.push({
      //   stt: i + 1 + j,
      //   developer,
      //   category: categoryName,
      //   appName,
      //   apis: _.uniq(_.map(apis, "name")).join(", "),
      //   pp: ppCategoriesAPP.join(", "),
      // });

      next2Data[appName] = {
        id,
        developer,
        category: categoryName,
        appName,
        apis: _.uniq(_.map(apis, "name")),
        pp: ppCategoriesAPP,
      };
    }
  }

  // const csvWriter = createCsvWriter({
  //   path: "apps_categories.csv",
  //   header,
  // });
  // await csvWriter.writeRecords(rows);

  await main2(next2Data);

  console.log("DONE");
}
main();
async function main2(next2Data) {
  const getParentCategoriesDB = await Models.Tree.find({
    name: {
      $in: [
        "Connection",
        "Media",
        "Hardware",
        "Health&Fitness",
        "Location",
        "Telephony",
        "UserInfo",
      ],
    },
  });
  const apisDB = await Models.Tree.find({
    parent: {
      $in: _.map(getParentCategoriesDB, "id"),
    },
  });

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
      id: "developer",
      title: "Developer",
    },
    {
      id: "category",
      title: "Category",
    },
    ...categories.map((category) => {
      return {
        id: slug(category.name),
        title: category.name,
      };
    }),
    ...apisDB.map((item) => {
      return {
        id: slug(item.name),
        title: item.name,
      };
    }),
  ];

  const rows = [];
  let stt = 1;
  for (const appName in next2Data) {
    const { developer, category, apis, pp, id } = next2Data[appName];

    const apisCSV = {};
    apisDB.forEach((item) => {
      apisCSV[slug(item.name)] = 0;
    }),
      apis.forEach((item) => {
        apisCSV[slug(item)] = 1;
      });

    const ppCategories = {};
    categories.forEach((category) => {
      ppCategories[slug(category.name)] = 0;
    }),
      pp.forEach((item) => {
        ppCategories[slug(item)] = 1;
        const categoriesParent = getParentCategories(item);
        categoriesParent.forEach((categoryPr) => {
          ppCategories[slug(categoryPr.name)] = 1;
        });
      });

    rows.push({
      stt,
      developer,
      category,
      appName,
      ...apisCSV,
      ...ppCategories,
    });
    await Models.App.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          apisModel: JSON.stringify(apisCSV),
          PPModel: JSON.stringify(ppCategories),
        },
      },
      {},
      (err, data) => {
        // Helpers.Logger.info(`Data saved1: ${JSON.stringify(data, null, 2)}`)
      }
    );

    console.log(1, apisCSV, ppCategories);
    stt++;
  }
  // const csvWriter = createCsvWriter({
  //   path: "apps_categories(ver2).csv",
  //   header: headers,
  // });
  // await csvWriter.writeRecords(rows);
}
function getParentCategories(childCategoryName, parents = []) {
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

function getChildCategories(categoryName, result = []) {
  const category = categories.find((item) => item.name === categoryName);

  const childs = categories.filter((item) => item.parent === category.id);

  result.push(childs);
  for (let i = 0; i < childs.length; i++) {
    const child = childs[i];

    getChildCategories(child.name, result);
  }
  return _.flatten(result);
}

function checkParentHasContent(childCategoryName, ppCategories) {
  try {
    const childCategory = categories.find(
      (item) => item.name === childCategoryName
    );
    const parentCategory = categories.find(
      (item) => item.id === childCategory.parent
    );

    if (parentCategory && parentCategory.keywords.length > 0) {
      const contentsParent = ppCategories[parentCategory.name];

      if (!contentsParent || contentsParent.length === 0) return false;

      return checkParentHasContent(parentCategory.name, ppCategories);
    }

    return true;
  } catch (error) {
    console.log("ERROR: checkParentHasContent");
    throw error;
  }
}

async function getPPCategories(privacyLink) {
  const result = {};

  try {
    if (!privacyLink) return null;

    const ppData = await axios.get(
      `http://127.0.0.1:8081/beforeaccept?url_text=${privacyLink}&policy_text=`,
      {
        headers: { "Content-Language": "en-US" },
        timeout: 10000,
      }
    );
    if (!_.isObject(ppData.data)) return null;

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
async function getParent(node) {
  const parent = await Models.Tree.findById(node.parent).cache(60 * 60 * 24 * 30);

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

// updateAppsPrivacyPolicy();
async function updateAppsPrivacyPolicy() {
  const apps = await Models.App.find({
    isCompleted: true,
  })
    .select("id")
    .limit(2);
  const appIds = _.map(apps, "id");

  Promise.all(appIds.map(updateAppPrivacyPolicy));
}

async function updateAppPrivacyPolicy(appId) {
  const app = await Models.App.findById(appId);
}

async function createDataSetApps(item) {
  try {
    const [, appName, categoryName, , link, type] = item;

    const Model =
      type === "Our Dataset"
        ? Models.OurMaliciousDataset
        : Models.MPDroidDataset;
    const appDB = await Model.findOne({
      appName,
    });

    if (appDB) return;
    const appId = _.last(link.split("/"));

    const sourceFolder = path.join(
      __dirname,
      "../../../../",
      "APKSources-malware"
    );
    const outputPath = path.join(__dirname, `../sourceTemp/${appId}`);

    const jadxFolder = path.join(__dirname, "../../jadx/build/jadx/bin/jadx");
    execSync(
      `sh ${jadxFolder} -d "${outputPath}" "${
        sourceFolder + "/" + appId + ".apk"
      }"`
    );

    const contents = await Helpers.default.File.getContentOfFolder(
      `${outputPath}/sources`
    );

    const leafNodeBaseLines = await Services.default.BaseLine.initBaseLineForTree(
      contents
    );

    const functionConstants = leafNodeBaseLines.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    const nodes = functionConstants.map((item) => {
      return {
        id: item._id,
        name: item.name,
        value: item.baseLine,
        parent: item.parent._id,
      };
    });
    await Model.create({
      appName,
      categoryName,
      appId,
      link,
      nodes,
    });
  } catch (err) {
    console.log("ERROR: createDataSetApps", err.message);
  }
}
