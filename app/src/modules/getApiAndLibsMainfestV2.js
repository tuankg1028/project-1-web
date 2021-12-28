require("dotenv").config();
import "../configs/mongoose.config";
const fs = require("fs");
const path = require("path");
var parseString = require('xml2js').parseString;
const _ = require("lodash");
import Models from "../models";
import Helpers from "../helpers";
const { execSync } = require("child_process");

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
    apis.forEach(({name, functions, classes}) => {
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

            classes.forEach(className => {
                const classIndex = originalApi.classes.findIndex(item => item.name === className)

                if(~classIndex) {
                    const originalclass = originalApi.classes[classIndex]
                    originalclass.count++
                } else {
                    originalApi.classes.push({
                        name: className,
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
                })),
                classes: classes.map(className => ({
                    name: className,
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
            id: "classes",
            title: "Classes"
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
        const subCategories = categoryGroups[category];


        const apps = await Models.App.find({
            categoryName: {
                $in: subCategories
            }
        })

        console.log(category, apps.length)


        let totalRows = 0
        for (let i = 1525; i < apps.length; i++) {
            const app = apps[i];

            const sourceCodeAppPath = `${sourceCodePath}/${app.id}`
            const sourceCodeJavaPath = `${sourceCodeAppPath}/sources`
            console.log(`Running ${i}/${apps.length}`)

            if(fs.existsSync(sourceCodeJavaPath)) {
                const apis = await getApisAndLibs(sourceCodeJavaPath)


                result.apis = [...result.apis, ...apis]
                totalRows++
            }


            console.log((JSON.stringify(myBigNestedarray).replace(/[\[\]\,\"]/g,'').length / (1000 * 1000 * 1000)).toFixed(2))
        }

        const rowsApi = []
        const apisCounted = countAPIs(result.apis)
        let i = 1
        for (const api of apisCounted) {
    
            rowsApi.push({
                stt: i++,
                name: api.name,
                numberOfOccurrences: api.count,
                classes: api.classes.map(item => `${item.name}: ${item.count}`).join("\n"),
                functions: api.functions.map(item => `${item.name}: ${item.count}`).join("\n")
            })
        }
        
        const categoryPath = path.join(__dirname, `../../api-keyword/${category}`)
        if(!fs.existsSync(categoryPath)) {
            execSync(`mkdir ${categoryPath}`);
        }
        const csvWriterHas = createCsvWriter({
            path: `${categoryPath}/apis(${totalRows}).csv`,
            header
        });
        await csvWriterHas.writeRecords(rowsApi);
    }

   

   console.log("DONE")
}


async function getApisAndLibs(sourceCodeJavaPath) {
    

    const apis = []
    // get functions 
    let contents = await Helpers.File.getContentOfFolder(sourceCodeJavaPath);
    contents = contents.split("\n");
    
    
    // get Function
    contents.forEach((line) => {
        if (
            line &&
            ~line.indexOf("import")
          ) {
            line = line.replace(";", "");
            line = line.replace("import", "");
            line = line.trim();
            
            line = line.split('.');

            const apiName = line.splice(0, line.length - 2).join('.')
            const className = line.splice(0, 1).join('.')
            const functionName = line.splice(0, 1).join('.')

            const apiIndex = apis.findIndex(item => item.name === apiName)

            if(~apiIndex) {
                const api = apis[apiIndex]

                const functionIndex = api.functions.findIndex(item => item.name === functionName)
                const classIndex = api.classes.findIndex(item => item.name === className)
                if(!~functionIndex) {
                    api.functions.push(functionName)
                    api.functions = _.uniq(api.functions)
                }

                if(!~classIndex) {
                    api.classes.push(className)
                    api.classes = _.uniq(api.classes)
                }
            }
            else {
                apis.push({
                    name: apiName,
                    classes: [className],
                    functions: [functionName]
                })
            }
            

          }

      });


    return apis
}


