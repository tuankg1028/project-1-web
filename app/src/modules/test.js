require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import { app } from "google-play-scraper";
import Helpers from "../helpers";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

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

function getCategoryNameBy(sub) {
  for (const categoyName in categoryGroups) {
    const subs = categoryGroups[categoyName];

    if (subs.includes(sub)) return categoyName;
  }

  return;
}
async function main() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "distance",
      title: "Distance",
    },
    {
      id: "risk",
      title: "riskLevel",
    },
  ];

  let apps = await Models.App.find({
    // $or: [{ supplier: "mobipurpose" }, { isExistedMobiPurpose: true }],
    // isCompleted: true,
    appName: {
      $in: [
        // Sports
        "football news - patriots",
        "australian hunter magazine",
        // Maps & Navigation
        "tc fuel consumption record",
        "taiwan mrt info - taipei、taoyuan、kaohsiung",
        // Medical
        "acupressure tips",
        "nighttime speaking clock",
        //  Health & Fitness
        "easy rise alarm clock",
        "sports supplements",
        // Travel & Local
        "walkway navi - gps for walking",
        "google earth",
        // Entertainment
        "christmas cards",
        "sound view spectrum analyzer",
        // Finance
        "google news - daily headlines",
        "habit calendar : track habits",
        // Beauty
        "sweet macarons hd wallpapers",
        "feeling of color combination",
        // Education
        "brainwell mind & brain trainer",
        "origami flower instructions 3d",
        // Social
        "facebook",
        "chat rooms - find friends",
        // Music & Audio
        "soul radio",
        "find that song",
        // Food & Drink
        "resep masakan",
        "tip calculator : split tip",
        // Shopping
        "brands for less",
        "house of fraser",
        // Business
        "real estate auctions listings  - gsa listings",
        "mobile inventory",
        // Tools
        "the ney is an end-blown flute sufi music wallpaper",
        "calcnote - notepad calculator",
      ],
    },
  });

  apps = apps.map((app) => ({
    // ...app,
    appName: app.appName,
    distance: app.distance,
    categoryName: getCategoryNameBy(app.categoryName),
    riskLevel: app.riskLevel,
  }));

  const appsByGroup = _.groupBy(apps, "categoryName");

  const rows = [];
  let stt = 1;
  for (const categoryName in appsByGroup) {
    const apps = appsByGroup[categoryName];

    apps.forEach((app) => {
      rows.push({
        stt: stt++,
        appName: app.appName,
        category: app.categoryName,
        distance: app.distance,
        risk: app.riskLevel,
      });
    });
  }

  const csvWriterNo = createCsvWriter({
    path: "./apps_categories(2-15).csv",
    header,
  });
  await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}

// main();
main2();
async function main2() {
  const [app1, app2] = await Promise.all([
    Models.App.find({
      supplier: "mobipurpose",
      isCompleted: true,
      distance: {
        $exists: true,
      },
    }),
    Models.App.find({
      isExistedMobiPurpose: true,
      isCompleted: true,
      distance: {
        $exists: true,
      },
    }),
  ]);

  let apps = [...app1, ...app2].map((app) => ({
    // ...app,
    id: app.id,
    appName: app.appName,
    distance: app.distance,
    categoryName: getCategoryNameBy(app.categoryName),
  }));
  console.log(app1.length, app2.length, apps.length);
  apps = _.uniqBy(apps, "appName");
  console.log(apps.length);
  const appsByGroup = _.groupBy(apps, "categoryName");

  for (const categoryName in appsByGroup) {
    const apps = appsByGroup[categoryName];
    const maxDistance = _.maxBy(apps, "distance").distance;
    const minDistance = _.minBy(apps, "distance").distance;

    const ranges = Array.from(
      {
        length: 5,
      },
      (_, index) => {
        const value = (maxDistance - minDistance) / 5;

        return [minDistance + index * value, minDistance + (index + 1) * value];
      }
    );

    console.log(1, maxDistance, minDistance, ranges);

    apps.forEach((app) => {
      const { distance } = app;

      ranges.forEach((range, index) => {
        if (_.inRange(distance, ...range)) {
          console.log("inRange", distance, range, index + 1);

          Models.App.updateOne(
            {
              _id: app.id,
            },
            {
              $set: {
                riskLevel: index + 1,
              },
            },
            {},
            (err, data) =>
              Helpers.Logger.info(
                `Data saved: ${JSON.stringify(data, null, 2)}`
              )
          );
        }
      });
    });
  }

  // const csvWriterNo = createCsvWriter({
  //   path: "./apps_categories(2-15).csv",
  //   header,
  // });
  // await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}
