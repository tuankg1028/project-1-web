require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import fs from "fs";
import axios from "axios";
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
    id: "2",
    keywords: ["business", "commercial", "businesses", "purchase"],
    level: "1",
    name: "Purchase",
    parent: "null",
  },
  {
    id: "3",
    keywords: [],
    level: "1",
    name: "Education",
    parent: "null",
  },
  {
    id: "4",
    keywords: ["medical", "healthcare", "health care", "disease"],
    level: "1",
    name: "Medical",
    parent: "null",
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
    id: "7",
    keywords: [],
    level: "1",
    name: "Marketing",
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
  const rows = [];
  for (let i = 0; i < categoriesData.length; i++) {
    const categoryName = categoriesData[i];
    console.log(`RUNNING ${categoryName}`);
    const apps = await Models.App.find({
      categoryName,
    }).limit(5);

    for (let j = 0; j < apps.length; j++) {
      const { developer, categoryName, appName, nodes, privacyLink } = apps[j];
      console.log(`RUNNING ${appName}: ${apis.length} apis`);
      let apis = await Promise.all(nodes.map((node) => getParent(node)));

      const ppCategoriesAPP = [];
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

      rows.push({
        stt: i + 1 + j,
        developer,
        category: categoryName,
        appName,
        apis: apis.join(", "),
        pp: ppCategoriesAPP.join(", "),
      });
    }
  }

  const csvWriter = createCsvWriter({
    path: "apps_categories.csv",
    header: headers,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE");
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
  const parent = await Models.Tree.findById(node.parent);

  if (
    parent.name !== "root" ||
    ![
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
main();