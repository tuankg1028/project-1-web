require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import fs from "fs";
var parse = require('fast-json-parse')

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
main()
async function main() {
  

  await Promise.all([
    main4Eda(),
    main4Survey(),
    main4Sema()
  ])
}

async function main4Eda() {
  const typeChunk = _.chunk(_.sampleSize(types, types.length), 10)
  for (const chunk of typeChunk) {
    console.log('type', chunk)

    await Promise.all(chunk.map(type => retry(getEdaByGroup(type))))
  }

  console.log("Done EDA")
}


async function main4Survey() {
  // const types = await Models.Survey.distinct("type")

  const types = ['parq']
  let riskFields = {}
  const typeChunk = _.chunk(_.sampleSize(types, types.length), 10)
  for (const chunk of typeChunk) {
    console.log('type', chunk)

    await Promise.all(chunk.map(type => retry(getSurveyByGroup(type))))
  }
 

  console.log("Done SurVey")
}

async function main4Sema() {
  let riskFields = []

  await getSemaByGroupV3(riskFields)
  console.log("riskFields", JSON.stringify(riskFields, null, 2))
  
  const semasOfType = await Models.Sema.find().limit(1000)

  // filter not uuid
  const fields = Object.entries(semasOfType[0].data).reduce((acc, item) => {
    if(!uuidValidate(item[1])) acc.push(item[0])
    return acc
  }, [])

  if(!fields.length) return

  for (let i = 2; i <= fields.length; i++) {
    console.log(`Running ${i}/${fields.length}`)
    // const riskFieldsExists = _.map(riskFields[type], 'fieldName')
    const existedFields = JSON.parse(JSON.stringify(_.map(riskFields, 'fieldNames')))
    const genedFields = genFields(fields, i, existedFields)

    if(!genedFields.length) continue;

    const existedFieldInTurn = []
    const runnedIds = []
    for (let j = 0; j < semasOfType.length; j++) {
      const sema = semasOfType[j];
      runnedIds.push(sema.id)
      console.log(`Running ${j}/${semasOfType.length}`, existedFieldInTurn, genedFields)
      if(existedFieldInTurn.length === genedFields.length) continue;

      const comparedSemas = semasOfType.filter(item => item.user_id !== sema.user_id && !_.includes(runnedIds, item.id))

      for (let k = 0; k < genedFields.length; k++) {
        const fieldNames = genedFields[k];
        if(_.includes(existedFieldInTurn, fieldNames.join(','))) continue;

        let isRisk = true
        for (let g = 0; g < comparedSemas.length; g++) {
          const comparedSema = comparedSemas[g];
          if(!isRisk) continue

          let isEqual = true
          for (let f = 0; f < fieldNames.length; f++) {
            const fieldName = fieldNames[f];
            if(!isEqual) continue

            const value1 = sema.data[fieldName]
            const value2 = comparedSema.data[fieldName]

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
          riskFields.push({
            fieldNames,
            values: fieldNames.map(fieldName => sema.data[fieldName]).join(' - '),
            id: sema.id
          })
        }
      }
    }
  }

  let elements = riskFields;

  elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
  const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)

  fs.writeFileSync(`./sema/index.txt`, JSON.stringify(elementGroup, null, 2), 'utf8')

  console.log("DONE SEMA")
  return
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getEdaByGroupV2(type, riskFields, edasOfType) {
  console.log(`Running ${type}`)
  const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
    if(!uuidValidate(item[1])) acc.push(item[0])
    return acc
  }, [])

  if(!fields.length) return
  
  
  const genedFields = genFields(fields, 1, [])

  if(!genedFields.length) return

  const totalRows = edasOfType.length

  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getEdaByGroupV2 ${k}/${genedFields.length}`)
    const fieldNames = genedFields[k]
    const fieldName = fieldNames[0];
    
    console.time("getUniqueValuesByUser")
    let count = 0
    const uniqueValuesByUser = _.uniqWith(edasOfType, (obj1, obj2) => {
      console.log(`${++count}/${totalRows}`)
      return obj1.user_id === obj2.user_id && obj1.data[fieldName] === obj2.data[fieldName]
    })
    console.timeEnd("getUniqueValuesByUser")

    console.time("getValuesOfField")
    const valuesOfField = _.map(uniqueValuesByUser, `data.${fieldName}`)
    console.timeEnd("getValuesOfField")

    let uniqueValue
    Object.entries(_.countBy(valuesOfField)).forEach(([value, numberOfOccurrences]) => {
      if(uniqueValue) return
      if (numberOfOccurrences === 1) uniqueValue = value
    })

    if(!uniqueValue) continue
    const uniqueEda = edasOfType.find(item => item.data[fieldName] == uniqueValue);

    riskFields[type].push({
      fieldNames,
      values: fieldNames.map(fieldName => uniqueEda.data[fieldName]).join(' - '),
      id: uniqueEda.id
    })
  }
  
  return
}


async function getEdaByGroupV3(type, riskFields) {
  console.log(`Running ${type}`)

  const edaOfType = await Models.EDA.findOne({
    type
  });

  const fields = Object.entries(edaOfType.data).reduce((acc, item) => {
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
    
    const valuesCounted = await Models.EDA.aggregate([
      {
        $match: {
          type
        }
      },
      { "$group": {
        "_id": {
            "user_id": "$user_id",
            "data": `$data.${fieldName}`
        },
        total:{$sum :1}
      }},

      {$sort:{total:-1}},

      {$group:{_id:'$_id.data', totalData: {$sum :1}}},
     
    ]).allowDiskUse(true)


    const uniqueValue = valuesCounted.find(item => item.totalData == 1);
    if(!uniqueValue) continue

    const eda = await Models.EDA.findOne({
      type, 
      [`data.${fieldName}`]: uniqueValue._id
    })

    riskFields[type].push({
      fieldNames,
      values: fieldNames.map(fieldName => eda.data[fieldName]).join(' - '),
      id: eda.id
    })
  }
  
  return
}

async function getSurveyByGroupV3(type, riskFields) {
  console.log(`Running ${type}`)

  const surveyOfType = await Models.Survey.findOne({
    type
  });

  const fields = Object.entries(surveyOfType.data).reduce((acc, item) => {
    if(!uuidValidate(item[1])) acc.push(item[0])
    return acc
  }, [])

  if(!fields.length) return
  
  
  const genedFields = genFields(fields, 1, [])

  if(!genedFields.length) return

  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getSurveyByGroupV2 ${k}/${genedFields.length}`)
    const fieldNames = genedFields[k]
    const fieldName = fieldNames[0];
    
    const valuesCounted = await Models.Survey.aggregate([
      {
        $match: {
          type
        }
      },
      { "$group": {
        "_id": {
            "user_id": "$user_id",
            "data": `$data.${fieldName}`
        },
        total:{$sum :1}
      }},

      {$sort:{total:-1}},

      {$group:{_id:'$_id.data', totalData: {$sum :1}}},
     
    ]).allowDiskUse(true)


    const uniqueValue = valuesCounted.find(item => item.totalData == 1);
    if(!uniqueValue) continue

    const survey = await Models.Survey.findOne({
      type, 
      [`data.${fieldName}`]: uniqueValue._id
    })

    console.log(1, survey)
    riskFields[type].push({
      fieldNames,
      values: fieldNames.map(fieldName => survey.data[fieldName]).join(' - '),
      id: survey.id
    })
  }
  
  return
}

async function getSemaByGroupV3(riskFields) {
  console.log(`Running Sema`)

  const semaOfType = await Models.Sema.findOne({
  });

  const fields = Object.entries(semaOfType.data).reduce((acc, item) => {
    if(!uuidValidate(item[1])) acc.push(item[0])
    return acc
  }, [])

  if(!fields.length) return
  
  
  const genedFields = genFields(fields, 1, [])

  if(!genedFields.length) return

  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getSemaByGroupV2 ${k}/${genedFields.length}`)
    const fieldNames = genedFields[k]
    const fieldName = fieldNames[0];
    
    const valuesCounted = await Models.Sema.aggregate([
      { "$group": {
        "_id": {
            "user_id": "$user_id",
            "data": `$data.${fieldName}`
        },
        total:{$sum :1}
      }},

      {$sort:{total:-1}},

      {$group:{_id:'$_id.data', totalData: {$sum :1}}},
     
    ]).allowDiskUse(true)


    const uniqueValue = valuesCounted.find(item => item.totalData == 1);
    if(!uniqueValue) continue

    const sema = await Models.Sema.findOne({
      [`data.${fieldName}`]: uniqueValue._id
    })

    riskFields.push({
      fieldNames,
      values: fieldNames.map(fieldName => sema.data[fieldName]).join(' - '),
      id: sema.id
    })
  }
  
  return
}

async function getSurveyByGroup(type) {
  // if(fs.existsSync(`./survey/${type}.txt`)) return

  let riskFields = {};
  riskFields[type] = []

  
  // if(fs.existsSync(`./survey/${type}.txt`)) return

  await getSurveyByGroupV3(type, riskFields)
  console.log("riskFields", JSON.stringify(riskFields, null, 2))
  
  const surveysOfType = await Models.Survey.aggregate([
    {
      $match: {
        type,
      }
    }
  ]).allowDiskUse(true)

  // filter not uuid
  const fields = Object.entries(surveysOfType[0].data).reduce((acc, item) => {
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
    for (let j = 0; j < surveysOfType.length; j++) {
      const survey = surveysOfType[j];
      runnedIds.push(survey.id)
      console.log(`Running ${j}/${surveysOfType.length} on ${type}`)
      if(existedFieldInTurn.length === genedFields.length) continue;

      const comparedSurveys = surveysOfType.filter(item => item.user_id !== survey.user_id && !_.includes(runnedIds, item.id))

      for (let k = 0; k < genedFields.length; k++) {
        const fieldNames = genedFields[k];
        if(_.includes(existedFieldInTurn, fieldNames.join(','))) continue;

        let isRisk = true
        for (let g = 0; g < comparedSurveys.length; g++) {
          const comparedSurvey = comparedSurveys[g];
          if(!isRisk) continue

          let isEqual = true
          for (let f = 0; f < fieldNames.length; f++) {
            const fieldName = fieldNames[f];
            if(!isEqual) continue

            const value1 = survey.data[fieldName]
            const value2 = comparedSurvey.data[fieldName]

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
            values: fieldNames.map(fieldName => survey.data[fieldName]).join(' - '),
            id: survey._id
          })
        }
      }
    }
  }

  for (const type in riskFields) {
    const elements = riskFields[type];

    elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
    const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)

    fs.writeFileSync(`./survey/${type}.txt`, JSON.stringify(elementGroup, null, 2), 'utf8')
  }
return
}

async function getEdaByGroup(type) {
    // if(fs.existsSync(`./eda/${type}.txt`)) return

    let riskFields = {};
    riskFields[type] = []

    
    // if(fs.existsSync(`./eda/${type}.txt`)) return

    await getEdaByGroupV3(type, riskFields)
    console.log("riskFields", JSON.stringify(riskFields, null, 2))

    const edasOfType = await Models.EDA.aggregate([
      {
        $match: {
          type,
        }
      }
    ]).allowDiskUse(true)

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
              values: fieldNames.map(fieldName => eda.data[fieldName]).join(' - '),
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

