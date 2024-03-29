require("dotenv").config();
import "../configs/mongoose.config";
import axios from "axios";
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

            functions.forEach(({name: functionName}) => {
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
                functions: functions.map(({name: functionName}) => ({
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

//Settings Default Size to 0
var bytes = 0;

main()
async function main() {
    // const contentResponse = await axios.get(`http://localhost:4444/content/602a89d3163e554ddd9e306c`)

    // console.log(contentResponse.data)
    // return
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





        // const apps = await Models.App.aggregate([
        //     {
        //         $match: {
        //             categoryName: {
        //                 $in: subCategories
        //             }
        //         }
        //     }
        // ])

        // console.log(category, apps.length)


        let totalRows = 0
        const limit = 100;
        let page = 0;
        let apps = []

        const total = await Models.App.count({
            categoryName: {
                $in: subCategories
            }
        })
        do {
            apps = await Models.App.aggregate([
            {
                $match: {
                    categoryName: {
                        $in: subCategories
                    }
                }
            },
            { $skip: page * limit },
            { $limit: limit },
            { $project: { _id: 1, id: 1 } }
            ]);

            for (let i = 0; i < apps.length; i++) {
                const app = apps[i];
                console.log(`Running ${(i + 1) + (page * limit)}/${total}`)
    
                const isSuccess = await calculateApi(app, result)
                if(isSuccess) totalRows++
                global.gc();
            }
            page++;
            global.gc();
        } while (apps.length);

        
        // const appChunk = _.chunk(apps, 1)
        // for (let i = 0; i < appChunk.length; i++) {
        //     console.log(`Running ${i}/${appChunk.length}`)
        //     const apps = appChunk[i];

        //     await Promise.all(apps.map(app => calculateApi(app, result, totalRows)))
        //     global.gc();
        // }
        

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

async function calculateApi(app, result) {

    let appMedata = await Models.AppMeta.findOne({
        appId: app._id,
    })

    if(appMedata && appMedata.apisFromSource && appMedata.apisFromSource.length) {
        result.apis = [...result.apis, ...appMedata.apisFromSource]
        return true
    }

    // const contentResponse = await axios.get(`http://localhost:4444/content/${app.id}`)
    // let content = contentResponse.data

    const sourceCodeAppPath = `${sourceCodePath}/${app._id}`
    const sourceCodeJavaPath = `${sourceCodeAppPath}/sources`
    if(!fs.existsSync(sourceCodeJavaPath)) return
    
    let content = await Helpers.File.getContentOfFolder(sourceCodeJavaPath);

    
    if(content) {
        let apis = await getApisAndLibs(content)


        result.apis = [...result.apis, ...apis]

        await Models.AppMeta.create(
            {
                appId: app._id,
                apisFromSource: apis,
            }
        );
        apis = null
        content = null
        global.gc();

        return true
    }
    

    return false
}

async function createApis (apis, appId) {
    for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        const apiDoc = await Models.Api.create({name: api.name, appId})
        await Promise.all(api.functions.map(functionName => Models.Function.create({name: functionName, apiId: apiDoc.id, appId})))

        await Promise.all(api.classes.map(className => Models.Class.create({name: className, apiId: apiDoc.id, appId})))
    }
}
async function getApisAndLibs(contents) {
    

    const apis = []
    // get functions 
    // let contents = await Helpers.File.getContentOfFolder(sourceCodeJavaPath);
    contents = contents.split("\n");
    
    // get Function
    contents.forEach((line) => {
        if (
            line &&
            ~line.indexOf("import ")
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

                const functionIndex = api.functions.findIndex(item => item.name === functionName && item.className === className)
                const classIndex = api.classes.findIndex(item => item.name === className)
                if(!~functionIndex) {
                    api.functions.push({
                        name: functionName,
                        className
                    })
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
                    functions: [{
                        name: functionName,
                        className
                    }]
                })
            }
            

          }

      });
    return apis
}


function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}


 
//Caclulate each object size using Javascript 
function getObjectSize(obj)
{
	
    if(obj !== null && obj !== undefined) {
		var objClass = Object.prototype.toString.call(obj).slice(8, -1);
	 
		if(objClass === 'Object' || objClass === 'Array') {
		  for(var key in obj) {
			 if(!obj.hasOwnProperty(key)) continue;
				getObjectSize(obj[key]);
		  }
		} else {
			 bytes += obj.toString().length * 2;
			 
		}
	}
	
	if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
        else return(bytes / 1073741824).toFixed(3) + " GB";
} 