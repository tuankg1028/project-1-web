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
        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];

            const sourceCodeAppPath = `${sourceCodePath}/${app.id}`
            const mainFestPath = `${sourceCodeAppPath}/resources/AndroidManifest.xml`;
            const sourceCodeJavaPath = `${sourceCodeAppPath}/sources`

            console.log(`Running ${i}/${apps.length}`)

            if(fs.existsSync(mainFestPath) && fs.existsSync(sourceCodeJavaPath)) {
                const [apis, libs] = await getApisAndLibs(mainFestPath, sourceCodeJavaPath)


                result.apis = [...result.apis, ...apis]
                result.libs = [...result.libs, ...libs]

                totalRows++
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
            path: `${categoryPath}/libs(${totalRows}).csv`,
            header,
        });
        await csvWriterLib.writeRecords(rowsLibs);
    }

   

   console.log("DONE")
}


async function getApisAndLibs(xmlPath, sourceCodeJavaPath) {
    const xml = fs.readFileSync(xmlPath)

    const [apis, libs] = await new Promise((resolve, reject) => {
        parseString(xml, function (err, result) {
            const classes = []
            const apis = (result.manifest.application[0]['activity'] || []).reduce((acc, item) => {
                const names = item['$']['android:name'].split('.')
                const className = names.pop()
               
                const apiName = names.join('.')

                const index = acc.findIndex(item => item.name === apiName)
                
                if(~index) {
                    acc[index].classes.push(className)
                    acc[index].classes = _.uniq(acc[index].classes)
                } else {
                    acc.push({
                        name: apiName,
                        classes: [className],
                        functions: [className]
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


    // get functions 
    let contents = await Helpers.File.getContentOfFolder(sourceCodeJavaPath);
    contents = contents.split("\n");
    
    
    // get Function
    contents.forEach((line) => {
        // remove comment
        const test = line;
        if (~line.indexOf("//")) {
          line = line.slice(0, line.indexOf("//"));
        }
  
        apis.forEach((api) => {
          let { name: className, functions } = api;
          if (
            line &&
            ~line.indexOf(`${className}.`) &&
            !~line.indexOf("import")
          ) {
            const index = line.lastIndexOf(`${className}`) + className.length;
            line = line.replace(line.slice(0, index), "");
  
            if (
              line &&
              line[0] === "." &&
              ~line.indexOf("(") &&
              ~line.indexOf(")")
            ) {
                line = line.slice(0, line.indexOf("("));
                line = line.replace(".", "");
    
                functions.push(line);
                functions = _.uniq(functions)   
            }
          }
        });
      });


    return [apis, libs]
}


