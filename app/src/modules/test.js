require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import { app } from "google-play-scraper";
import Helpers from "../helpers";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import fs from "fs";
var parse = require('fast-json-parse')
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

// console.log(genFields(['field1', 'field2'], 2, [['field1'], ['field2']]))
function genFields(fields, num, existedFields) {
  if(!num || num <= 0) return
  let result = []
  
  for (let i = 0; i < 1000; i++) {
    result.push(_.sampleSize(fields, num));
  }

  result = result.map(item => JSON.stringify(item.sort()))
  result = _.union(result)
  result = result.map(item => parse(item).value)

  result = result.filter(item => {
    let isExisted = false

    existedFields.forEach(existedField => {
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

const types = [ 
  'Afib ECG Readings',
'Computed Temperature',
'Daily Heart Rate Variability Summary',
'Daily SpO2',
'Feed Cheers',
'Feed Comments',
'Feed Posts',
'Groups',
'Heart Rate Variability Details',
'Heart Rate Variability Histogram',
'Profile',
'Respiratory Rate Summary',
'Stress Score',
'Trackers',
'Wrist Temperature',
'altitude',
'badge',
'calories',
'demographic_vo2_max',
'distance',
'estimated_oxygen_variation',
'exercise',
'games',
'heart_rate',
'height',
'lightly_active_minutes',
'menstrual_health_birth_control',
'menstrual_health_cycles',
'menstrual_health_settings',
'menstrual_health_symptoms',
'message_cheers',
'mindfulness_eda_data_sessions',
'mindfulness_goals',
'moderately_active_minutes',
'participations',
'resting_heart_rate',
'sedentary_minutes',
'sleep',
'steps',
'swim_lengths_data',
'time_in_heart_rate_zones',
'trophy',
'very_active_minutes',
'water_logs'
 ]
 const retry = async (promise, time = 20) => {
  let counter = 1
  let status = false
  let result

  do {
    try {
      result = await promise
      status = true
    } catch (error) {
      result = error
      counter++
    }
  } while (!status && counter <= time)

  if (!status) throw result

  return result
}

main4()
async function main4() {
  // const edaCount = await Models.EDA.find().distinct('type')
  // console.log("edaCount", edaCount)

  // const limit = 1000000;

  // const promisses = []
  // for (let i = 0; i < 61; i++) {
  //   const skip = limit * i;

  //   promisses.push(Models.EDA.find().limit(limit).skip(skip))
  // }
  // const edaChunk = await Promise.all(promisses);
  // const edas = edaChunk.reduce((result, item) => {
  //   return [...result, ...item]
  // }, [])

  // console.log("Finished get data from db")
  // let edaGroup = _.groupBy(edas, 'type');

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
  
  let riskFields = {}
  let promisses = []
  const typeChunk = _.chunk(_.sampleSize(types, types.length), 10)
  for (const chunk of typeChunk) {
    console.log('type', chunk)
    // await retry(getEdaByGroup(type))
    // promisses.push()

    await Promise.all(chunk.map(type => retry(getEdaByGroup(type))))
  }
  // await Promise.all(promisses)

  // let result = {};
  // for (const type in riskFields) {
  //   const elements = riskFields[type];

  //   elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
  //   const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)


  //   result[type] = elementGroup
  // }

  // fs.writeFileSync('./eda.txt', JSON.stringify(result, null, 2), 'utf8')

  console.log("Done")
}

async function getEdaByGroup(type) {
    if(fs.existsSync(`./eda/${type}.txt`)) return

    let riskFields = {};
    riskFields[type] = []
    const edasOfType = await Models.EDA.find({
      type
    })
    
    // filter not uuid
    const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
      if(!uuidValidate(item[1])) acc.push(item[0])
      return acc
    }, [])

    if(!fields.length) return
    for (let i = 1; i <= fields.length; i++) {
      console.log(`Running ${i}/${fields.length} on ${type}`)
      // const riskFieldsExists = _.map(riskFields[type], 'fieldName')
      const existedFields = JSON.parse(JSON.stringify(_.map(riskFields[type], 'fieldNames')))
      const genedFields = genFields(fields, i, existedFields)

      if(!genedFields.length) continue;

      const existedFieldInTurn = []
      edasOfType.forEach((eda, index) => {

        console.log(`Running ${index}/${edasOfType.length} on ${type}`, existedFieldInTurn, genedFields)
        const comparedEdas = edasOfType.filter(item => item.user_id !== eda.user_id)
        genedFields.forEach(fieldNames => {
          if(_.includes(existedFieldInTurn, fieldNames.join(','))) return

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
          // if this field is risk
          if(isRisk) {
            existedFieldInTurn.push(fieldNames.join(','));
            riskFields[type].push({
              fieldNames,
              id: eda.id
            })
          }
        })
      })
    }

    for (const type in riskFields) {
      const elements = riskFields[type];

      elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
      const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)

      fs.writeFileSync(`./eda/${type}.txt`, JSON.stringify(elementGroup, null, 2), 'utf8')
    }
  return
}

// main5()
async function main5() {
  console.log("main5")
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const header = [
    {
      id: "stt",
      title: "STT"
    },
    {
      id: "user_id",
      title: "User Id"
    },
    {
      id: "num",
      title: "Number of questions"
    }
  ];

  const typeChunk = _.chunk(types, 4)
  for (const types of typeChunk) {
    await Promise.all(types.map(async type => {
      if(!fs.existsSync(`./eda/num-question-types/${type}.csv`)) {
        const edaInType = await Models.EDA.find({
          type
        })
        console.log("queried")
        const edaGroupUser = _.groupBy(edaInType, 'user_id')
    
        const rows = Object.entries(edaGroupUser).map((item, index) => {
          return {
            stt: index + 1,
            user_id: item[0],
            num: item[1].length
          }
        })
    
        const csvWriter = createCsvWriter({
          path: `./eda/num-question-types/${type}.csv`,
          header: header
        });
        await csvWriter.writeRecords(rows);
      }
    }))
  }
  
  console.log("Done")
}