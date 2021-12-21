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
  // const edaCount = await Models.EDA.find({
  //   type: "badge"
  // }).distinct('data.dateTime')

  //   console.log(edaCount)
  // const edaCount = await Models.EDA.find({
  //   "data.shareText": "I took 25,000 steps and earned the Classics badge! #Fitbit"
  // })
  // console.log("edaCount", edaCount)
  // return
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
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getEdaByGroupV2(type, riskFields, edasOfType) {
  const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
    if(!uuidValidate(item[1])) acc.push(item[0])
    return acc
  }, [])

  if(!fields.length) return
  
  
  const genedFields = genFields(fields, 1, [])

  if(!genedFields.length) return


  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getEdaByGroupV2 ${k}/${genedFields.length}`)
    const fieldNames = genedFields[k]
    const fieldName = fieldNames[0];

    const distintValues = _.uniq(_.map(edasOfType, `data.${fieldName}`))

    const edasByUnique = distintValues.map(value => {
      const result = []
      edasOfType.forEach(item => {
        if(result.length >= 2) return
        
        if(item.data[fieldName] === value) {
          result.push(item)
        }
      })
      

      return result
    })


      const itemUnique = edasByUnique.find(item => item.length === 1);
      if(!itemUnique) continue

      riskFields[type].push({
        fieldNames,
        values: fieldNames.map(fieldName => itemUnique[0].data[fieldName]).join(' - '),
        id: itemUnique[0].id
      })
  }
  
  return
}

async function getEdaByGroup(type) {
    if(fs.existsSync(`./eda/${type}.txt`)) return

    let riskFields = {};
    riskFields[type] = []

    const edasOfType = await Models.EDA.find({
      type,
    })
    if(fs.existsSync(`./eda/${type}.txt`)) return

    await getEdaByGroupV2(type, riskFields, edasOfType)
    console.log("riskFields", JSON.stringify(riskFields, null, 2))

    // filter not uuid
    const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
      if(!uuidValidate(item[1])) acc.push(item[0])
      return acc
    }, [])

    if(!fields.length) return

    for (let i = 2; i <= fields.length; i++) {
      console.log(`Running ${i}/${fields.length} on ${type}`)
      // const riskFieldsExists = _.map(riskFields[type], 'fieldName')
      const existedFields = JSON.parse(JSON.stringify(_.map(riskFields[type], 'fieldNames')))
      const genedFields = genFields(fields, i, existedFields)

      if(!genedFields.length) continue;

      const existedFieldInTurn = []
      const runnedIds = []
      // const originalCompareEdas = [...edasOfType]
      for (let j = 0; j < edasOfType.length; j++) {
        const eda = edasOfType[j];
        runnedIds.push(eda.id)
        console.log(`Running ${j}/${edasOfType.length} on ${type}`, existedFieldInTurn, genedFields)
        if(existedFieldInTurn.length === genedFields.length) continue;

        // filterInPlace(originalCompareEdas, obj => obj.id !== eda.id)
        const comparedEdas = edasOfType.filter(item => item.user_id !== eda.user_id && !_.includes(runnedIds, item.id))

        for (let k = 0; k < genedFields.length; k++) {
          const fieldNames = genedFields[k];
          if(_.includes(existedFieldInTurn, fieldNames.join(','))) continue;

          let isRisk = true
          for (let g = 0; g < comparedEdas.length; g++) {
            const comparedEda = comparedEdas[g];
            if(!isRisk) continue

            let isEqual = true
            for (let f = 0; f < fieldNames.length; f++) {
              const fieldName = fieldNames[f];
              if(!isEqual) continue

              const value1 = eda.data[fieldName]
              const value2 = comparedEda.data[fieldName]

              if(value1 !== value2) {
                isEqual = false
              }
            }
            if(isEqual) {
              isRisk = false
              continue
            }
          }

          // if this field is risk
          if(isRisk) {
            existedFieldInTurn.push(fieldNames.join(','));
            riskFields[type].push({
              fieldNames,
              values: fieldNames.map(fieldName => itemUnique[0].data[fieldName]).join(' - '),
              id: eda.id
            })
          }
        }
      }
    }

    for (const type in riskFields) {
      const elements = riskFields[type];

      elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
      const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)

      fs.writeFileSync(`./eda/${type}.txt`, JSON.stringify(elementGroup, null, 2), 'utf8')
    }
  return
}

const filterInPlace = (array, predicate) => {
  let end = 0;

  for (let i = 0; i < array.length; i++) {
      const obj = array[i];

      if (predicate(obj)) {
          array[end++] = obj;
      }
  }

  array.length = end;
};
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