require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import moment from "moment";
import _ from "lodash";
var categoryGroups = {
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

function getCategoryName(originalCategoryName) {
  for (const categoryName in categoryGroups) {
    const categoryMeannings = categoryGroups[categoryName];

    if (categoryMeannings.includes(originalCategoryName)) return categoryName;
  }
  return;
}
async function main() {
  console.log("RUNNING");
  var gplay = require("google-play-scraper");
  let packageIds = require("../../data/packageIds.json");
  let packageIdsChunks = _.chunk(packageIds, 100);

  // packageIds = packageIds.slice(500, 600);
  console.log("Total package ids", packageIds.length);

  for (let i = 0; i < packageIdsChunks.length; i++) {
    console.log(`Running ${i}/${packageIdsChunks.length}`);
    const packageIdsChunk = packageIdsChunks[i];

    let apps = await Promise.all(
      packageIdsChunk.map((packageId) =>
        gplay.app({ appId: packageId.trim().toLowerCase() }).catch((_) => null)
      )
    );
    // filter not found app
    apps = apps.filter((app) => !!app);
    console.log("Total apps from CHPlay", apps.length);

    // get category
    apps = apps.map((app) => ({
      ...app,
      categoryName: getCategoryName(app.genre),
    }));
    console.log("Total app that has category", apps.length);

    // filter not found category
    apps = apps.filter((app) => !!app.categoryName);

    // check existed in db
    apps = await Promise.all(
      apps.map((app) =>
        Models.App.findOne({
          appName: app.title.toLowerCase(),
        }).then((appDB) => ({
          ...app,
          isExisted: !!appDB,
        }))
      )
    );

    // filter out not existed
    apps = apps.filter((app) => !app.isExisted);
    console.log("Total apps not in db", apps.length);
    apps = apps.map((app) => ({
      appName: app.title.toLowerCase(),
      categoryName: app.categoryName,
      developer: app.developer,
      updatedDate: moment(app.updated).utc().format("MMMM DD, YYYY"),
      description: app.description,
      version: app.version,
      size: app.size,
      installs: app.installs,
      minInstalls: app.minInstalls,
      maxInstalls: app.maxInstalls,
      privacyLink: app.privacyPolicy,
      chplayLink: app.url,
      appIdCHPlay: app.appId,
      CHPlayLink: app.url,
      supplier: "mobipurpose",
      isCompleted: false,
      isCompletedJVCode: false,
    }));

    console.log("Creating apps into db");
    await Promise.all(apps.map((app) => Models.App.create(app)));
  }
  console.log("Done");
}
main();
