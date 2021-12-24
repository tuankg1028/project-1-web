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
        const apisCounted = _.countBy(result.apis)
        let i = 1
        for (const apiName in apisCounted) {
            const numberOfOccurrences = apisCounted[apiName];
    
            rowsApi.push({
                stt: i++,
                name: apiName,
                numberOfOccurrences
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
            const apis = (result.manifest.application[0]['activity'] || []).map(item => {
                return item['$']['android:name']
            })

            const libs = (result.manifest.application[0]['service'] || []).map(item => {
                return item['$']['android:name']
            })

            resolve([_.uniq(apis), _.uniq(libs)])
        });
    })
}