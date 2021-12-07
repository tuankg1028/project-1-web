require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import { app } from "google-play-scraper";
import Helpers from "../helpers";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import fs from "fs";
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
        // "walkway navi - gps for walking",
        "beijing metro map",
        "google earth",
        // Entertainment
        "christmas cards",
        "sound view spectrum analyzer",
        // Finance
        "google news - daily headlines",
        "habit calendar : track habits",
        // Beauty
        "sweet macarons hd wallpapers",
        "kuchen rezepte kochbuch",
        // "feeling of color combination",
        // Education
        "brainwell mind & brain trainer",
        "origami flower instructions 3d",
        // Social
        "facebook",
        // "chat rooms - find friends",
        "my t-mobile - nederland",
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
// main2();
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

    console.log(1, categoryName, ranges);

    apps.forEach((app) => {
      const { distance } = app;

      // ranges.forEach((range, index) => {
      //   if (_.inRange(distance, ...range)) {
      //     Models.App.updateOne(
      //       {
      //         _id: app.id,
      //       },
      //       {
      //         $set: {
      //           riskLevel: index + 1,
      //         },
      //       },
      //       {}
      //     );
      //   }
      // });
    });
  }

  // const csvWriterNo = createCsvWriter({
  //   path: "./apps_categories(2-15).csv",
  //   header,
  // });
  // await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}

// main3()
async function main3() {

  // const appsInFile1 = [];
  // await new Promise((resolve, reject) => {
  //   var readline = require("linebyline"),
  //     rl = readline("/Users/xander/Downloads/data_collect_purpose.json");
  //   rl.on("line", function (line, lineCount, byteCount) {
  //     // do something with the line of text
  //     const app = JSON.parse(line);
  //     if(app) appsInFile1.push(app)
  //   })
  //     .on("error", function (e) {})
  //     .on("close", function (e) {
  //       resolve();
  //     });
  // });


  // const apps = await Models.App.find({
  //   isExistedMobiPurpose: true,
  //   isCompleted: true,
  //   nodes: { $exists: true }, //
  //   dataTypes: { $exists: true }, //
  // }).cache(10000);
  // const appIdCHPlays = _.map(apps, "appIdCHPlay")
  // console.log(appIdCHPlays)
  // let total = 0
  
  // appsInFile1.forEach(item => {
  //   if(_.includes(appIdCHPlays, item.app)) total++;
  // })
  // console.log(total)


  const keyValue = []
  // ===========
  await new Promise((resolve, reject) => {
    var readline = require("linebyline"),
      rl = readline("/Users/xander/Downloads/data_collect_purpose.json");
    rl.on("line", function (line, lineCount, byteCount) {
      // do something with the line of text
      const app = JSON.parse(line);
      if (app && app.data) {
        for (const key in app.data) {
          const value = app.data[key];
          let valType = value.split("|");
          const valueOfKey = valType[0];

          valType.splice(0, 1);
          valType.splice(-1, 1);

          keyValue.push(`${key.trim()}: ${valueOfKey.trim()}`)
        }
      }
    })
      .on("error", function (e) {})
      .on("close", function (e) {
        resolve();
      });
  });

  console.log("not unique", keyValue.length)
  console.log("unique", _.uniq(keyValue).length)

}

// console.log(genFields(['field1', 'field2', 'field3', 'field4', 'field5'], 3, [['field1'], ['field2', 'field3']]))
function genFields(fields, num, existedFields) {
  if(!num || num <= 0) return
  let result = []
  
  for (let i = 0; i < 1000; i++) {
    result.push(_.sampleSize(fields, num));
  }

  result = result.map(item => JSON.stringify(item.sort()))
  result = _.union(result)
  result = result.map(item => JSON.parse(item))

  result = result.filter(item => {
    let isExisted = false

    existedFields.forEach(existedField => {
      console.log(1, existedField)
      if(isExisted) return

      let hasFields = true
      existedField.forEach(fileName => {
        if(!item.includes(fileName)) hasFields = false
      })
      
      if(hasFields) isExisted = true
    })

    return !isExisted
  })
  return result
}
main4()
async function main4() {
  // const edaCount = await Models.EDA.find().distinct('user_id')
  // console.log("edaCount", edaCount.length)
  const limit = 1000000;

  const promisses = []
  for (let i = 0; i < 61; i++) {
    const skip = limit * i;

    promisses.push(Models.EDA.find().limit(limit).skip(skip))
  }
  const edaChunk = await Promise.all(promisses);
  const edas = edaChunk.reduce((result, item) => {
    return [...result, ...item]
  }, [])

  console.log("Finished get data from db")
  let edaGroup = _.groupBy(edas, 'type');

  let riskFields = {}
  // console.log("edaGroup", JSON.stringify(edaGroup, null, 2))
  // const edaGroup = {
  //   "participations": [
  //     {
  //       "_id": "619d297bce31879b3f1fa385",
  //       "user_id": "619d2977ce31879b3f1fa385",
  //       "type": "participations",
  //       "color": "yellow",
  //       "data": {
  //         "challenge_id": "f10ada41-bfb8-11eb-8f93-0242465fb250",
  //         "type": "GOAL_DAY1",
  //         "type_composite": "TODAY1",
  //         "start": "2021-05-27T21:00:00.000+00:00",
  //         "end": "2021-05-28T20:59:59.999+00:00",
  //         "achievement_type": null
  //       },
  //       "id": "619d297bce31879b3f1fa385"
  //     },
  //     {
  //       "_id": "619d297bce31879b3f1fa386",
  //       "user_id": "619d2977ce31879b3f1fa386",
  //       "type": "participations",
  //       "color": "yellow",
  //       "data": {
  //         "challenge_id": "f10ada41-bfb8-11eb-8f93-0242465fb250",
  //         "type": "GOAL_DAY",
  //         "type_composite": "TODAY1",
  //         "start": "2021-05-27T21:00:00.000+00:00",
  //         "end": "2021-05-28T20:59:59.999+00:00",
  //         "achievement_type": null
  //       },
  //       "id": "619d297bce31879b3f1fa386"
  //     },
  //     {
  //       "_id": "619d297bce31879b3f1fa388",
  //       "user_id": "619d2977ce31879b3f1fa388",
  //       "type": "participations",
  //       "color": "yellow",
  //       "data": {
  //         "challenge_id": "0cf761d1-c67e-11eb-9029-0242ba7820cc",
  //         "type": "GOAL_DAY1",
  //         "type_composite": "TODAY2",
  //         "start": "2021-06-05T21:00:00.000+00:00",
  //         "end": "2021-06-06T21:00:00.000+00:00",
  //         "achievement_type": null
  //       },
  //       "id": "619d297bce31879b3f1fa388"
  //     },
  //     {
  //       "_id": "619d297bce31879b3f1fa387",
  //       "user_id": "619d2977ce31879b3f1fa387",
  //       "type": "participations",
  //       "color": "yellow",
  //       "data": {
  //         "challenge_id": "0cf761d1-c67e-11eb-9029-0242ba7820cc",
  //         "type": "GOAL_DAY",
  //         "type_composite": "TODAY3",
  //         "start": "2021-06-05T21:00:00.000+00:00",
  //         "end": "2021-06-06T21:00:00.000+00:00",
  //         "achievement_type": null
  //       },
  //       "id": "619d297bce31879b3f1fa387"
  //     }
  //   ],
  //   "message_cheers": [
  //     {
  //       "_id": "619d297bce31879b3f1fa388",
  //       "user_id": "619d2977ce31879b3f1fa386",
  //       "type": "message_cheers",
  //       "color": "yellow",
  //       "data": {
  //         "message_id": "03dea589-c0a2-11eb-b6da-02424ba6cac3",
  //         "challenge_id": "8ffc0329-c04b-11eb-8ff4-02422db7ea84",
  //         "wall": "8ffc0329-c04b-11eb-8ff4-02422db7ea84"
  //       },
  //       "id": "619d297bce31879b3f1fa388"
  //     },
  //     {
  //       "_id": "619d297bce31879b3f1fa389",
  //       "user_id": "619d2977ce31879b3f1fa386",
  //       "type": "message_cheers",
  //       "color": "yellow",
  //       "data": {
  //         "message_id": "9391eb62-c05c-11eb-a64e-02429fdbdaaf",
  //         "challenge_id": "8ffc0329-c04b-11eb-8ff4-02422db7ea84",
  //         "wall": "8ffc0329-c04b-11eb-8ff4-02422db7ea84"
  //       },
  //       "id": "619d297bce31879b3f1fa389"
  //     }
  //   ]
  // }
  for (const type in edaGroup) {
    console.log('type', type)
    riskFields[type] = []
    const edasOfType = edaGroup[type];
    
    edasOfType.forEach(eda => {

      const riskFieldsExists = _.map(riskFields[type], 'fieldName')
      // filter not uuid
      const fields = Object.entries(eda.data).reduce((acc, item) => {
        if(!uuidValidate(item[1]) && !_.includes(riskFieldsExists, item[0])) acc.push(item[0])
        return acc
      }, [])
      if(!fields.length) return

      const comparedEdas = edasOfType.filter(item => item.id !== eda.id && item.user_id !== eda.user_id)

      for (let i = 1; i <= fields.length; i++) {
        const existedFields = JSON.parse(JSON.stringify(_.map(riskFields[type], 'fieldNames')))

        const genedFields = genFields(fields, i, [])

        genedFields.forEach(fieldNames => {
          
          let isRisk = true
          comparedEdas.forEach(comparedEda => {
            if(!isRisk) return

            let isEqual = true
            fieldNames.forEach(fieldName => {
              if(!isEqual) return
              const value1 = eda.data[fieldName]
              const value2 = comparedEda.data[fieldName]
              
              if(value1 !== value2) return isEqual = false
            })
            
            if(isEqual) return isRisk = false
          })
          console.log(eda.id)
          // if this field is risk
          if(isRisk) riskFields[type].push({
            fieldNames,
            id: eda.id
          })
        })
      }
    })
  }
  // console.log('riskFields', JSON.stringify(riskFields, null, 2))
  let result = {};
  for (const type in riskFields) {
    const elements = riskFields[type];

    elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
    const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)


    result[type] = elementGroup
  }

  fs.writeFileSync('./eda.txt', JSON.stringify(result, null, 2), 'utf8')

  console.log("Done")
}
