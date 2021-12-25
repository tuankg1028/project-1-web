require("dotenv").config();
import "../configs/mongoose.config";
const fs = require("fs");
const path = require("path");
var parseString = require('xml2js').parseString;
const _ = require("lodash");
import Models from "../models";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const categoryGroups = {
    Beauty: ["Beauty", "Lifestyle"],
    // Business: ["Business"],
    // Education: ["Education", "Educational"],
    // Entertainment: ["Entertainment", "Photography"],
    // Finance: [
    //   "Finance",
    //   "Events",
    //   "Action",
    //   "Action & Adventure",
    //   "Adventure",
    //   "Arcade",
    //   "Art & Design",
    //   "Auto & Vehicles",
    //   "Board",
    //   "Books & Reference",
    //   "Brain Games",
    //   "Card",
    //   "Casino",
    //   "Casual",
    //   "Comics",
    //   "Creativity",
    //   "House & Home",
    //   "Libraries & Demo",
    //   "News & Magazines",
    //   "Parenting",
    //   "Pretend Play",
    //   "Productivity",
    //   "Puzzle",
    //   "Racing",
    //   "Role Playing",
    //   "Simulation",
    //   "Strategy",
    //   "Trivia",
    //   "Weather",
    //   "Word",
    // ],
    // "Food & Drink": ["Food & Drink"],
    // "Health & Fitness": ["Health & Fitness"],
    // "Maps & Navigation": ["Maps & Navigation"],
    // Medical: ["Medical"],
    // "Music & Audio": [
    //   "Music & Audio",
    //   "Video Players & Editors",
    //   "Music & Video",
    //   "Music",
    // ],
    // Shopping: ["Shopping"],
    // Social: ["Social", "Dating", "Communication"],
    // Sports: ["Sports"],
    // Tools: ["Tools", "Personalization"],
    // "Travel & Local": ["Travel & Local"],
  };
const sourceCodePath = `/data/JavaCode`;

function countAPIs(apis) {
    const result = []
    apis.forEach(({name, functions}) => {
        const apiIndex = result.findIndex(item => item.name === name)

        if(~apiIndex) {
            const originalApi = result[apiIndex]
            originalApi.count++

            functions.forEach(functionName => {
                const functionIndex = originalApi.functions.findIndex(item => item.name === functionName)

                if(~functionIndex) {
                    const originalfunction = originalApi.functions[functionIndex]
                    originalfunction.count++
                } else {
                    originalApi.functions.push({
                        name: functionName,
                        count: 1,
                    })
                }
            })
        } else {
            result.push({
                name,
                count: 1,
                functions: functions.map(functionName => ({
                    name: functionName,
                    count : 1
                }))
            })
        }
    })

    return result
}

// getApisAndLibs("/Users/xander/Downloads/AndroidManifest.xml").then(result => {
//     const originalApis = result[0]

//     const apis = countAPIs(originalApis)

//     console.log(JSON.stringify(apis, null, 2))
// })

main()
async function main() {
    const header = [
        {
          id: "stt",
          title: "#",
        },
        {
          id: "name",
          title: "Name",
        },
        {
            id: "numberOfOccurrences",
            title: "Number of occurrences"
        },
        {
            id: "functions",
            title: "Functions"
        }
    ];

    const result = {
        apis: [],
        libs: []
    }
    for (const category in categoryGroups) {
        console.log(category)
        const subCategories = categoryGroups[category];


        const apps = await Models.App.find({
            categoryName: {
                $in: subCategories
            }
        })

        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];
            const mainFestPath = `${sourceCodePath}/${app.id}/resources/AndroidManifest.xml`
            if(fs.existsSync(mainFestPath)) {
                const [apis, libs] = await getApisAndLibs(mainFestPath)


                result.apis = [...result.apis, ...apis]
                result.libs = [...result.libs, ...libs]
            }
        }

        const rowsApi = []
        const apisCounted = countAPIs(result.apis)
        let i = 1
        for (const api of apisCounted) {
    
            rowsApi.push({
                stt: i++,
                name: api.name,
                numberOfOccurrences: api.count,
                functions: api.functions.map(item => `${item.name}: ${item.count}`).join("\n")
            })
        }
    
        const csvWriterHas = createCsvWriter({
            path: `./api-keyword/apis(${category}).csv`,
            header
        });
        await csvWriterHas.writeRecords(rowsApi);


        // libs
        const rowsLibs = []
        const libsCounted = _.countBy(result.libs)
        i = 1
        for (const libName in libsCounted) {
            const numberOfOccurrences = libsCounted[libName];
    
            rowsLibs.push({
                stt: i++,
                name: libName,
                numberOfOccurrences
            })
        }
    
        const csvWriterLib = createCsvWriter({
            path: `./api-keyword/libs(${category}).csv`,
            header,
        });
        await csvWriterLib.writeRecords(rowsLibs);
    }

   

   console.log("DONE")
}


function getApisAndLibs(xmlPath) {
    const xml = fs.readFileSync(xmlPath)

    return new Promise((resolve, reject) => {
        parseString(xml, function (err, result) {
            const functions = []
            const apis = (result.manifest.application[0]['activity'] || []).reduce((acc, item) => {
                const names = item['$']['android:name'].split('.')
                const functionName = names.pop()
               
                const apiName = names.join('.')

                const index = acc.findIndex(item => item.name === apiName)
                
                if(~index) {
                    acc[index].functions.push(functionName)
                    acc[index].functions = _.uniq(acc[index].functions)
                } else {
                    acc.push({
                        name: apiName,
                        functions: [functionName]
                    })
                }

                return acc
            }, [])

            const libs = ([...result.manifest.application[0]['service'] || [], ...result.manifest.application[0]['provider'] || []]).map(item => {
                return item['$']['android:name']
            })

            resolve([_.uniq(apis), _.uniq(libs)])
        });
    })
}