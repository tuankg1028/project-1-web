require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import fs from "fs";
import axios from "axios";
import slug from "slug";
import Helpers from "../helpers";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const categoriesCollection = [
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
];
const categoriesThirdParty = [
  {
    id: "1",
    keywords: [
      "Third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party",
    ],
    level: "1",
    name: "Third-party",
    parent: "null",
  },
  {
    id: "2",
    keywords: [
      "Third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party && email",
    ],
    level: "2",
    name: "Third-party Email",
    parent: "1",
  },
  {
    id: "3",
    keywords: [
      "Third-party",
      "3rd parties",
      "third party",
      "third parties",
      "3rd party && postal",
    ],
    level: "2",
    name: "Third-party Postal",
    parent: "1",
  },
];

const categoriesRetention = [
  {
    id: "1",
    keywords: ["data retention", "retain"],
    level: "1",
    name: "Data retention",
    parent: "null",
  },
];
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
  "Simulation",
  "Lifestyle",
  "Health & Fitness",
  "Books & Reference",
  "Tools",
  "Business",
  "Social",
  "Shopping",
  "Puzzle",
  "Entertainment",
  "Travel & Local",
  "Comics",
  "Music & Audio",
  "Strategy",
  "Video Players & Editors",
  "Productivity",
  "Finance",
  "Education",
  "News & Magazines",
  "Parenting",
  "Food & Drink",
  "Casual",
  "Medical",
  "Maps & Navigation",
  "Auto & Vehicles",
  "Pretend Play",
  "Communication",
  "Sports",
  "Word",
  "Action",
  "Racing",
  "Dating",
  "Weather",
  "Photography",
  "Personalization",
  "Art & Design",
  "Events",
  "Action & Adventure",
  "Adventure",
  "House & Home",
  "Creativity",
  "Card",
  "Casino",
  "Trivia",
  "Arcade",
  "Role Playing",
  "Educational",
  "Libraries & Demo",
  "Board",
  "Music",
  "Brain Games",
  "Music & Video",
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

  result.push(childs);
  for (let i = 0; i < childs.length; i++) {
    const child = childs[i];

    getChildCategories(child.name, categories, result);
  }
  return _.flatten(result);
}

function checkParentHasContent(childCategoryName, ppCategories, categories) {
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

    const contentTypes = {
      collection: ppData.data.segments_first_party_collection,
      thirdParty: ppData.data.segments_third_party_sharing,
      retention: ppData.data.segments_data_retention,
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
              if (!_.includes(result[contentType][category.name], content)) {
                result[contentType][category.name].push(content);
              }
              break;
            }
          }
        });
      });
    }

    return result;
  } catch (e) {
    console.log(e.message);
    return null;
  }
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

// updateAppsPrivacyPolicy();
async function updateAppsPrivacyPolicy() {
  const apps = await Models.App.find({
    isCompleted: true,
  })
    .select("id")
    .limit(1);
  const appIds = _.map(apps, "id");

  Promise.all(appIds.map(updateAppPrivacyPolicy));

  // await Helpers.Tree.getTreeFromNode("602951a8163e554ddd9a1274");
}

async function updateAppPrivacyPolicy(appId) {
  const app = await Models.App.findById(appId);

  let ppCategoriesAPP = {};
  // pp
  const ppCategorieTypes = await getPPCategories(app.privacyLink);

  for (const dataType in ppCategorieTypes) {
    const ppCategories = ppCategorieTypes[dataType];

    ppCategoriesAPP[dataType] = [];
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
    console.log(categories);
    if (ppCategories) {
      for (const category in ppCategories) {
        const contents = ppCategories[category];

        const isParentHasContent = checkParentHasContent(
          category,
          ppCategories,
          categories
        );

        if (isParentHasContent && contents && contents.length > 0) {
          let childCategories = getChildCategories(category, categories);
          childCategories = _.map(childCategories, "name");
          if (childCategories.length === 0)
            ppCategoriesAPP[dataType].push(category);

          if (
            _.difference(ppCategoriesAPP[dataType], childCategories).lenth ===
            childCategories.lenth
          )
            ppCategoriesAPP[dataType].push(category);
        }
      }
    }

    ppCategoriesAPP[dataType] = _.uniq(ppCategoriesAPP[dataType]);
  }

  // console.log(1, ppCategoriesAPP);
}

async function createTreeDataByNode(categoryName, result = []) {
  const category = categoriesCollection.find(
    (item) => item.name === categoryName
  );

  const pathString = getNodePath(category.id);
  let pathArray = pathString.split(".");
  pathArray = pathArray.filter((item) => {
    console.log(1, !!item);
    return !!item;
  });
  _.reverse(pathArray);

  console.log(pathArray);

  const data = await buildTree(pathArray, result);
  // console.log(1, JSON.stringify(data, null, 2));
}

async function buildTree(pathArray, result) {
  if (!pathArray || !pathArray.length) return result;
  let lv1, lv2, lv3;

  if (pathArray[0]) {
    lv1 = categoriesCollection.find((item) => item.id === pathArray[0]);
  }

  if (pathArray[1]) {
    lv2 = categoriesCollection.find((item) => item.id === pathArray[1]);
  }

  if (pathArray[2]) {
    lv3 = categoriesCollection.find((item) => item.id === pathArray[2]);
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

const getNodePath = (categoryId, pathString = "") => {
  const category = categoriesCollection.find((item) => item.id === categoryId);

  pathString += `${category.id}.`;

  if (category.parent && category.parent != "null")
    return getNodePath(category.parent, pathString);

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
    const apps = await Models.App.find({ categoryName });
    content += `Category Name: ${categoryName} - ${apps.length} apps \n`;

    let collectionTotal = 0;
    let thirdPartyTotal = 0;
    let retentionTotal = 0;
    let noneTotal = 0;
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];

      const ppData = await axios.get(
        `http://127.0.0.1:8081/beforeaccept?url_text=&policy_text=${escape(
          app.contentPrivacyPolicy
        )}`,
        // `http://127.0.0.1:8081/beforeaccept?url_text=${app.privacyLink}&policy_text=`,
        {
          headers: { "Content-Language": "en-US" },
          timeout: 10000,
        }
      );

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

main();
