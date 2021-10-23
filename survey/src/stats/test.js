import csv from "csvtojson";
const path = require("path");
const _ = require("lodash");
import chalk from "chalk";
import * as cheerio from "cheerio";
import axios from "axios";
const bibtexParse = require("bibtex-parse");
const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
var gplay = require('google-play-scraper');
import fs from "fs";
// [ 'ID', 'Name', 'Level', 'Parent' ],
async function test() {
  let infoCollection = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/information-collected.csv"
    )
  );
  infoCollection = infoCollection.filter(item => item[3] !== "null");

  let permissions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/device-permission.csv"
    )
  );
  permissions = permissions.filter(item => item[3] !== "null");

  const services = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/service-providers.csv"
    )
  );

  const interactions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/human-interaction.csv"
    )
  );
  const lv1Nodes1 = interactions.filter(item => item[3] === "null");

  const questions = [];
  lv1Nodes1.forEach(lv1Node => {
    const [id] = lv1Node;
    const lv2Nodes = interactions.filter(item => item[3] === id);

    // lv 2
    lv2Nodes.forEach(lv2Node => {
      const lv2Id = lv2Node[0];
      const lv3Nodes = interactions.filter(item =>
        _.includes(item[3].split(","), lv2Id)
      );
      // lv 3
      lv3Nodes.forEach(lv3Node => {
        // permissions.forEach(permission => {
        //   questions.push({
        //     id: lv2Node[0],
        //     name: lv2Node[1],
        //     lv1: {
        //       id: lv1Node[0],
        //       name: lv1Node[1],
        //       level: lv1Node[2],
        //       parent: lv1Node[3]
        //     },
        //     lv3: {
        //       id: lv3Node[0],
        //       name: lv3Node[1],
        //       level: lv3Node[2],
        //       parent: lv3Node[3]
        //     },
        //     subItem: {
        //       id: permission[0],
        //       name: permission[1],
        //       level: permission[2],
        //       parent: permission[3],
        //       type: "permission"
        //     }
        //   });
        // });

        infoCollection.forEach(collection => {
          questions.push({
            id: lv2Node[0],
            name: lv2Node[1],
            lv1: {
              id: lv1Node[0],
              name: lv1Node[1],
              level: lv1Node[2],
              parent: lv1Node[3]
            },
            lv3: {
              id: lv3Node[0],
              name: lv3Node[1],
              level: lv3Node[2],
              parent: lv3Node[3]
            },
            subItem: {
              id: collection[0],
              name: collection[1],
              level: collection[2],
              parent: collection[3],
              type: "collection"
            }
          });
        });
      });
    });
  });

  const lv1Nodes2 = services.filter(item => item[3] === "null");
  lv1Nodes2.forEach(lv1Node => {
    const [id] = lv1Node;
    const lv2Nodes = services.filter(item => item[3] === id);

    // lv 2
    lv2Nodes.forEach(lv2Node => {
      const lv2Id = lv2Node[0];
      const lv3Nodes = services.filter(item =>
        _.includes(item[3].split(","), lv2Id)
      );
      // lv 3
      lv3Nodes.forEach(lv3Node => {
        permissions.forEach(permission => {
          questions.push({
            id: lv2Node[0],
            name: lv2Node[1],
            lv1: {
              id: lv1Node[0],
              name: lv1Node[1],
              level: lv1Node[2],
              parent: lv1Node[3]
            },
            lv3: {
              id: lv3Node[0],
              name: lv3Node[1],
              level: lv3Node[2],
              parent: lv3Node[3]
            },
            subItem: {
              id: permission[0],
              name: permission[1],
              level: permission[2],
              parent: permission[3],
              type: "permission"
            }
          });
        });

        // infoCollection.forEach(collection => {
        //   questions.push({
        //     id: lv2Node[0],
        //     name: lv2Node[1],
        //     lv1: {
        //       id: lv1Node[0],
        //       name: lv1Node[1],
        //       level: lv1Node[2],
        //       parent: lv1Node[3]
        //     },
        //     lv3: {
        //       id: lv3Node[0],
        //       name: lv3Node[1],
        //       level: lv3Node[2],
        //       parent: lv3Node[3]
        //     },
        //     subItem: {
        //       id: collection[0],
        //       name: collection[1],
        //       level: collection[2],
        //       parent: collection[3],
        //       type: "collection"
        //     }
        //   });
        // });
      });
    });
  });

  // const groupQuestions = _.groupBy(questions, "groupId");
  //   subItem: {
  //     '0': '9',
  //     '1': 'steps',
  //     '2': '2',
  //     '3': '8',
  //     '4': '',
  //     type: 'collection'
  //   }
  console.log(JSON.stringify(questions), questions.length);
  return;
  for (const groupId in groupQuestions) {
    console.log("=========");
    const questions = groupQuestions[groupId];
    const group = interactions.find(item => item[0] === groupId);
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      //   console.log(question);

      //   if (groupId === "1") {
      if (question.subItem.type === "collection") {
        console.log(
          chalk.bgGreen.black(
            `You are playing ${question.name}. Do you allow to share your ${question.lv3[1]} to collect your ${question.subItem[1]}? (Information collected)`
          )
        );
      } else {
        console.log(
          chalk.bgBlue.black(
            `You are playing ${question.name}. Do you allow to share your ${question.lv3[1]} with you ${question.subItem[1]}? (permission)`
          )
        );
      }
      //   }
    }
  }
}
// test();

async function test1() {
  const googleIt = require("google-it");

  const bibTxt = fs.readFileSync(
    path.join(__dirname, "../../input/ElenaFerrari.bib"),
    "utf-8"
  );

  try {
    let articles = bibtexParse.parse(bibTxt).filter(article => {
      const { fields } = article;
      if (!fields) return false;
      const year = fields.find(item => item.name === "year");
      if (!year) return false;

      return Number(year.value) >= 2011;
    });
    let missing = "";
    const getData = async (article, index) => {
      const { fields, raw } = article;

      try {
        const title = fields.find(item => item.name === "title").value;
        const ggResult = await googleIt({
          query: title
        });

        const link = ggResult[0].link;
        console.log("Get link", link);

        // // get article html
        let articleHtml = await Promise.all([
          axios
            .get(link, { timeout: 1000 * 60 })
            .then(response => response.data)
            .catch(err => ""),
          getContentFromUrl(link).catch(err => "")
        ]);

        articleHtml = articleHtml.join("\n");

        const $article = await cheerio.load(articleHtml);

        let abstract = $article(".abstract.author p").text();
        if (!abstract) {
          abstract = $article(".abstract-text").text();
          abstract.replace("Abstract:", "");
        }
        if (!abstract) {
          abstract = $article(".abstractSection").text();
        }
        if (!abstract) {
          abstract = $article("#Abs1-content").text();
        }
        if (!abstract) {
          abstract = $article("[itemprop='description']").text();
        }

        // keywords
        let keywords = $article(".keywords-section div").text();
        if (!keywords) {
          keywords = $article(".stats-keywords-container")
            .first()
            .text();
        }
        if (!keywords) {
          keywords = $article(".c-article-subject-list")
            .first()
            .text();
        }

        console.log("Get abstract", abstract);
        console.log("Get keywords", keywords);
        console.log("==============");

        let content = raw.split("\n").filter(item => !!item);
        content[content.length - 2] = content[content.length - 2] + ",";
        // link
        content[content.length - 1] = `  link      = {${link}},`;

        // abstract
        content[content.length] = `  abstract  = {${abstract}},`;
        // keywords
        content[content.length] = `  keywords  = {${keywords}}`;
        // }
        content[content.length] = "}";

        content = content.join("\n");
        console.log("content", content);
        console.log(`${index + 1}/10`);

        if (!keywords || !abstract) {
          missing += `${title}\n`;
        }
        if (!keywords) {
          missing += "keywords:\n";
        }
        if (!abstract) {
          missing += "abstract:\n";
        }
        if (!keywords || !abstract) {
          missing += "\n";
        }

        return content;
      } catch (err) {
        return raw;
      }
    };

    const chunkArray = (array = [], size = ARRAY_SIZE) => {
      const results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    };

    const articleChunk = chunkArray(articles, 10);
    console.log("params", articleChunk);
    let txt = "";
    for (let i = 0; i < articleChunk.length; i++) {
      console.log(i);
      const chunk = articleChunk[i];

      const content = await Promise.all(
        chunk.map((article, i) => getData(article, i))
      );

      txt += content.join("\n\n");
      fs.writeFileSync("./content.txt", txt);
      console.log("DONE", i);
    }
    fs.writeFileSync("./content.txt", txt);
    fs.writeFileSync("./missing.txt", missing);
    console.log("DONE");
  } catch (err) {
    console.log(err);
  }
}
// test1();

async function getContentFromUrl(url) {
  try {
    const browser = await puppeteer.launch({
      // executablePath:
      //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(1000 * 60);

    await page.goto(url, { waitUntil: "networkidle0" });

    const data = await page.evaluate(
      () => document.querySelector("html").outerHTML
    );

    await browser.close();

    return data;
  } catch (err) {
    return "";
    console.error(err);
  }
}
// test2();
async function test2() {
  let content = `
  @article{DBLP:journals/tdsc/SinghCF21,
    author    = {Bikash Chandra Singh and
                 Barbara Carminati and
                 Elena Ferrari},
    title     = {Privacy-Aware Personal Data Storage {(P-PDS):} Learning how to Protect
                 User Privacy from External Applications},
    journal   = {{IEEE} Trans. Dependable Secur. Comput.},
    volume    = {18},
    number    = {2},
    pages     = {889--903},
    year      = {2021},
    url       = {https://doi.org/10.1109/TDSC.2019.2903802},
    doi       = {10.1109/TDSC.2019.2903802},
    timestamp = {Fri, 09 Apr 2021 01:00:00 +0200},
    biburl    = {https://dblp.org/rec/journals/tdsc/SinghCF21.bib},
    bibsource = {dblp computer science bibliography, https://dblp.org}
  }`;
  content = content.split("\n").filter(item => !!item);
  content[content.length - 2] = content[content.length - 2] + ",";
  // link
  content[content.length - 1] =
    "    link = {dblp computer science bibliography, https://dblp.org},";

  // abstract
  content[content.length] =
    "    abstract = {dblp computer science bibliography, https://dblp.org},";
  // keywords
  content[content.length] =
    "    keywords = {dblp computer science bibliography, https://dblp.org}";
  // }
  content[content.length] = "  }";
  console.log(content);
}


require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";

const  ranges = {
  Beauty: [ 0.049523809523809526, 0.09557344064386315 ],
  Simulation: [ 0.04841660802251941, 0.07323340471092073 ],
  Lifestyle: [ 0, 0.11054739652870495 ],
  'Health & Fitness': [ 0, 0.12224489795918367 ],
  'Books & Reference': [ 0, 0.11807580174927114 ],
  Tools: [ 0, 0.13310104529616726 ],
  Business: [ 0, 0.11805929919137466 ],
  Social: [ 0, 0.1306122448979592 ],
  Shopping: [ 0, 0.14285714285714285 ],
  Puzzle: [ 0.026031746031746038, 0.0742115027829313 ],
  Entertainment: [ 0, 0.09910089910089911 ],
  'Travel & Local': [ 0, 0.1137254901960784 ],
  Comics: [ 0.05803450281062217, 0.07894736842105263 ],
  'Music & Audio': [ 0.035164835164835165, 0.13236889692585896 ],
  Strategy: [ 0.05416837221994815, 0.08507747824241131 ],
  'Video Players & Editors': [ 0.051241217798594973, 0.08989074816761167 ],
  Productivity: [ 0, 0.09981684981684993 ],
  Finance: [ 0.05809523809523809, 0.09016592472683126 ],
  Education: [ 0, 0.14285714285714285 ],
  'News & Magazines': [ 0, 0.09230769230769241 ],
  Parenting: [ 0.06257611241217799, 0.08119172650305433 ],
  'Food & Drink': [ 0, 0.13310104529616726 ],
  Casual: [ 0.0561851556264964, 0.08365878725590946 ],
  Medical: [ 0, 0.14285714285714285 ],
  'Maps & Navigation': [ 0, 0.14285714285714285 ],
  'Auto & Vehicles': [ 0.058691062631949294, 0.14285714285714285 ],
  'Pretend Play': [ 0.04961095549330842, 0.09438720590496714 ],
  Communication: [ 0.028571428571428564, 0.11657142857142858 ],
  Sports: [ 0, 0.11595006934812759 ],
  Word: [ 0.05848739495798316, 0.07118460287340742 ],
  Action: [ 0.05314625850340136, 0.07854447439353089 ],
  Racing: [ 0.055555555555555566, 0.08728414442700164 ],
  Dating: [ 0.05743440233236154, 0.08388733823902562 ],
  Weather: [ 0.060435038212816025, 0.12423280423280426 ],
  Photography: [ 0.05501373626373627, 0.09548319327731089 ],
  Personalization: [ 0, 0.08739143456124579 ],
  'Art & Design': [ 0.06807727690892365, 0.09197044334975367 ],
  Events: [ 0.05787172011661811, 0.0864021164021164 ],
  'Action & Adventure': [ 0.06085059978189749, 0.0923699595263081 ],
  Adventure: [ 0, 0.08567106116274033 ],
  'House & Home': [ 0.028571428571428564, 0.08209568209568209 ],
  Creativity: [ 0.05785207700101317, 0.09744067007910652 ],
  Card: [ 0, 0.07174721189591074 ],
  Casino: [ 0.05226548427324371, 0.06553038797936749 ],
  Trivia: [ 0.05514121195503152, 0.06736842105263158 ],
  Arcade: [ 0.05361016423923141, 0.07058823529411759 ],
  'Role Playing': [ 0.05582664526484747, 0.08222341568206225 ],
  Educational: [ 0.05870698644421277, 0.08431793770139638 ],
  'Libraries & Demo': [ 0, 0.10817166372721929 ],
  Board: [ 0.028571428571428564, 0.07161904761904771 ],
  Music: [ 0.05632262474367738, 0.06501969208736118 ],
  'Brain Games': [ 0.07172312223858612, 0.08312757201646091 ],
  'Music & Video': [ 0.06251944012441671, 0.0899773242630385 ]
}
const header = [
  {
    id: "stt",
    title: "#"
  },
  {
    id: "email",
    title: "email"
  },
  {
    title: "Yes",
    id: "1"
  },
  {
    id: "1developer",
    title: "Developer"
  },
  {
    id: "1category",
    title: "Category"
  },
  {
    id: "1appdev",
    title: "App - Dev"
  },
  {
    id: "1purpose",
    title: "Purpose"
  },
  {
    id: "1thirdParty",
    title: "Third Party"
  },
  {
    title: "Yes - Very low",
    id: "10"
  },
  {
    id: "10developer",
    title: "Developer"
  },
  {
    id: "10category",
    title: "Category"
  },
  {
    id: "10appdev",
    title: "App - Dev"
  },
  {
    id: "10purpose",
    title: "Purpose"
  },
  {
    id: "10thirdParty",
    title: "Third Party"
  },
  {
    title: "Yes - Low",
    id: "11"
  },
  {
    id: "11developer",
    title: "Developer"
  },
  {
    id: "11category",
    title: "Category"
  },
  {
    id: "11appdev",
    title: "App - Dev"
  },
  {
    id: "11purpose",
    title: "Purpose"
  },
  {
    id: "11thirdParty",
    title: "Third Party"
  },
  {
    title: "Yes - Neutral",
    id: "12"
  },
  {
    id: "12developer",
    title: "Developer"
  },
  {
    id: "12category",
    title: "Category"
  },
  {
    id: "12appdev",
    title: "App - Dev"
  },
  {
    id: "12purpose",
    title: "Purpose"
  },
  {
    id: "12thirdParty",
    title: "Third Party"
  },
  {
    title: "Yes - High",
    id: "13"
  },
  {
    id: "13developer",
    title: "Developer"
  },
  {
    id: "13category",
    title: "Category"
  },
  {
    id: "13appdev",
    title: "App - Dev"
  },
  {
    id: "13purpose",
    title: "Purpose"
  },
  {
    id: "13thirdParty",
    title: "Third Party"
  },
  {
    title: "Yes - Very high",
    id: "14"
  },
  {
    id: "14developer",
    title: "Developer"
  },
  {
    id: "14category",
    title: "Category"
  },
  {
    id: "14appdev",
    title: "App - Dev"
  },
  {
    id: "14purpose",
    title: "Purpose"
  },
  {
    id: "14thirdParty",
    title: "Third Party"
  },
  // NO
  {
    title: "No",
    id: "0"
  },
  {
    id: "0developer",
    title: "Developer"
  },
  {
    id: "0category",
    title: "Category"
  },
  {
    id: "0appdev",
    title: "App - Dev"
  },
  {
    id: "0purpose",
    title: "Purpose"
  },
  {
    id: "0thirdParty",
    title: "Third Party"
  },
  {
    title: "No - Very low",
    id: "00"
  },
  {
    id: "00developer",
    title: "Developer"
  },
  {
    id: "00category",
    title: "Category"
  },
  {
    id: "00appdev",
    title: "App - Dev"
  },
  {
    id: "00purpose",
    title: "Purpose"
  },
  {
    id: "00thirdParty",
    title: "Third Party"
  },
  {
    title: "No - Low",
    id: "01"
  },
  {
    id: "01developer",
    title: "Developer"
  },
  {
    id: "01category",
    title: "Category"
  },
  {
    id: "01appdev",
    title: "App - Dev"
  },
  {
    id: "01purpose",
    title: "Purpose"
  },
  {
    id: "01thirdParty",
    title: "Third Party"
  },
  {
    title: "No - Neutral",
    id: "02"
  },
  {
    id: "02developer",
    title: "Developer"
  },
  {
    id: "02category",
    title: "Category"
  },
  {
    id: "02appdev",
    title: "App - Dev"
  },
  {
    id: "02purpose",
    title: "Purpose"
  },
  {
    id: "02thirdParty",
    title: "Third Party"
  },
  {
    title: "No - High",
    id: "03"
  },
  {
    id: "03developer",
    title: "Developer"
  },
  {
    id: "03category",
    title: "Category"
  },
  {
    id: "03appdev",
    title: "App - Dev"
  },
  {
    id: "03purpose",
    title: "Purpose"
  },
  {
    id: "03thirdParty",
    title: "Third Party"
  },
  
  {
    title: "No - Very high",
    id: "04"
  },
  {
    id: "04developer",
    title: "Developer"
  },
  {
    id: "04category",
    title: "Category"
  },
  {
    id: "04appdev",
    title: "App - Dev"
  },
  {
    id: "04purpose",
    title: "Purpose"
  },
  {
    id: "04thirdParty",
    title: "Third Party"
  },
  // Maybe
  {
    title: "Maybe",
    id: "2"
  },
  {
    id: "2developer",
    title: "Developer"
  },
  {
    id: "2category",
    title: "Category"
  },
  {
    id: "2appdev",
    title: "App - Dev"
  },
  {
    id: "2purpose",
    title: "Purpose"
  },
  {
    id: "2thirdParty",
    title: "Third Party"
  },
  {
    title: "Maybe - Very low",
    id: "20"
  },
  {
    id: "20developer",
    title: "Developer"
  },
  {
    id: "20category",
    title: "Category"
  },
  {
    id: "20appdev",
    title: "App - Dev"
  },
  {
    id: "20purpose",
    title: "Purpose"
  },
  {
    id: "20thirdParty",
    title: "Third Party"
  },
  {
    title: "Maybe - Low",
    id: "21"
  },
  {
    id: "21developer",
    title: "Developer"
  },
  {
    id: "21category",
    title: "Category"
  },
  {
    id: "21appdev",
    title: "App - Dev"
  },
  {
    id: "21purpose",
    title: "Purpose"
  },
  {
    id: "21thirdParty",
    title: "Third Party"
  },
  {
    title: "Maybe - Neutral",
    id: "22"
  },
  {
    id: "22developer",
    title: "Developer"
  },
  {
    id: "22category",
    title: "Category"
  },
  {
    id: "22appdev",
    title: "App - Dev"
  },
  {
    id: "22purpose",
    title: "Purpose"
  },
  {
    id: "22thirdParty",
    title: "Third Party"
  },
  {
    title: "Maybe - High",
    id: "23"
  },
  {
    id: "23developer",
    title: "Developer"
  },
  {
    id: "23category",
    title: "Category"
  },
  {
    id: "23appdev",
    title: "App - Dev"
  },
  {
    id: "23purpose",
    title: "Purpose"
  },
  {
    id: "23thirdParty",
    title: "Third Party"
  },
  {
    title: "Maybe - Very high",
    id: "24"
  },
  {
    id: "24developer",
    title: "Developer"
  },
  {
    id: "24category",
    title: "Category"
  },
  {
    id: "24appdev",
    title: "App - Dev"
  },
  {
    id: "24purpose",
    title: "Purpose"
  },
  {
    id: "24thirdParty",
    title: "Third Party"
  },
]

async function trainingIndiv(answers){ 
  let rows = {
    expert: [],
    paid: [],
    unpaid: [],
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'

    const result = {}
    const category = {}
    const developer = {}
    const developerApp = {}
    const purpose = {}
    const thirdParty = {}
    for (let j = 0; j < 10; j++) {

      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4
      
      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))


      if(!result[installQuestion.value]) result[installQuestion.value] = 0
      result[installQuestion.value]++;
      // category 
      if(!category[`${installQuestion.value}category`]) category[`${installQuestion.value}category`] = {}
      category[`${installQuestion.value}category`][app.categoryName] ? category[`${installQuestion.value}category`][app.categoryName]++ : category[`${installQuestion.value}category`][app.categoryName] = 1 

      // developer
      if(!developer[`${installQuestion.value}developer`]) developer[`${installQuestion.value}developer`] = {}
      developer[`${installQuestion.value}developer`][app.developer] ? developer[`${installQuestion.value}developer`][app.developer]++ : developer[`${installQuestion.value}developer`][app.developer] = 1 

      // app - dev
      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      if(!developerApp[`${installQuestion.value}appdev`]) developerApp[`${installQuestion.value}appdev`] = {}
      developerApp[`${installQuestion.value}appdev`][app.developer] = appsByDeveloper

      if(!result[`${installQuestion.value}${risk}`]) result[`${installQuestion.value}${risk}`] = 0
      result[`${installQuestion.value}${risk}`]++

      // purpose 
      if(!purpose[`${installQuestion.value}purpose`]) purpose[`${installQuestion.value}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[`${installQuestion.value}purpose`][item['name']] ? purpose[`${installQuestion.value}purpose`][item['name']]++ : purpose[`${installQuestion.value}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[`${installQuestion.value}thirdParty`]) thirdParty[`${installQuestion.value}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[`${installQuestion.value}thirdParty`][item['name']] ? thirdParty[`${installQuestion.value}thirdParty`][item['name']]++ : thirdParty[`${installQuestion.value}thirdParty`][item['name']] = 1
      })
      

      // category 
      if(!category[`${installQuestion.value}${risk}category`]) category[`${installQuestion.value}${risk}category`] = {}
      category[`${installQuestion.value}${risk}category`][app.categoryName] ? category[`${installQuestion.value}${risk}category`][app.categoryName]++ : category[`${installQuestion.value}${risk}category`][app.categoryName] = 1 
      // developer
      if(!developer[`${installQuestion.value}${risk}developer`]) developer[`${installQuestion.value}${risk}developer`] = {}
      developer[`${installQuestion.value}${risk}developer`][app.developer] ? developer[`${installQuestion.value}${risk}developer`][app.developer]++ : developer[`${installQuestion.value}${risk}developer`][app.developer] = 1

      // app - dev
      if(!developerApp[`${installQuestion.value}${risk}appdev`]) developerApp[`${installQuestion.value}${risk}appdev`] = {}
      developerApp[`${installQuestion.value}${risk}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[`${installQuestion.value}${risk}purpose`]) purpose[`${installQuestion.value}${risk}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[`${installQuestion.value}${risk}purpose`][item['name']] ? purpose[`${installQuestion.value}${risk}purpose`][item['name']]++ : purpose[`${installQuestion.value}${risk}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[`${installQuestion.value}${risk}thirdParty`]) thirdParty[`${installQuestion.value}${risk}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']] ? thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']]++ : thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']] = 1
      })
    }
    
    const categoryToStringValue = Object.entries(category).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    const developerToStringValue = Object.entries(developer).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})
    // 
    
    const devAppToStringValue = Object.entries(developerApp).reduce((acc, [key, item]) => {
      acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
        acc += `*${developerName}: (`
        apps.forEach(app => {
          acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
        })
        acc += `)\n`
        return acc
      }, '')
      return acc
    }, {})

    const purposeToString =  Object.entries(purpose).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    const thirdPartyToString =  Object.entries(thirdParty).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})
    // 
    rows[type].push({
      stt: i + 1,
      email: user.email,
      ...result,
      ...categoryToStringValue,
      ...developerToStringValue,
      ...devAppToStringValue,
      ...purposeToString,
      ...thirdPartyToString
    })
  }
  let csvWriter = createCsvWriter({
    path: `./reports/test/tranning-individual(expert).csv`,
    header
  });
  await csvWriter.writeRecords(rows['expert']);

  csvWriter = createCsvWriter({
    path: `./reports/test/tranning-individual(paid).csv`,
    header
  });
  await csvWriter.writeRecords(rows['paid']);

  csvWriter = createCsvWriter({
    path: `./reports/test/tranning-individual(unpaid).csv`,
    header
  });
  await csvWriter.writeRecords(rows['unpaid']);
  console.log("DONE tranning")

}
async function testIndiv(answers) {

  let rows = {
    expert: [],
    paid: [],
    unpaid: [],
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'

    const result = {}
    const category = {}
    const developer = {}
    const developerApp = {}
    const purpose = {}
    const thirdParty = {}
    for (let j = 10; j < answer.questions.length; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;
      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;
      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      if(!result[installQuestion.value]) result[installQuestion.value] = 0
      result[installQuestion.value]++
      // category 
      if(!category[`${installQuestion.value}category`]) category[`${installQuestion.value}category`] = {}
      category[`${installQuestion.value}category`][app.categoryName] ? category[`${installQuestion.value}category`][app.categoryName]++ : category[`${installQuestion.value}category`][app.categoryName] = 1 

      // developer
      if(!developer[`${installQuestion.value}developer`]) developer[`${installQuestion.value}developer`] = {}
      developer[`${installQuestion.value}developer`][app.developer] ? developer[`${installQuestion.value}developer`][app.developer]++ : developer[`${installQuestion.value}developer`][app.developer] = 1 

      // app - dev
      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      if(!developerApp[`${installQuestion.value}appdev`]) developerApp[`${installQuestion.value}appdev`] = {}
      developerApp[`${installQuestion.value}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[`${installQuestion.value}purpose`]) purpose[`${installQuestion.value}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[`${installQuestion.value}purpose`][item['name']] ? purpose[`${installQuestion.value}purpose`][item['name']]++ : purpose[`${installQuestion.value}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[`${installQuestion.value}thirdParty`]) thirdParty[`${installQuestion.value}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[`${installQuestion.value}thirdParty`][item['name']] ? thirdParty[`${installQuestion.value}thirdParty`][item['name']]++ : thirdParty[`${installQuestion.value}thirdParty`][item['name']] = 1
      })


      if(!result[`${installQuestion.value}${risk}`]) result[`${installQuestion.value}${risk}`] = 0
      result[`${installQuestion.value}${risk}`]++

      // category 
      if(!category[`${installQuestion.value}${risk}category`]) category[`${installQuestion.value}${risk}category`] = {}
      category[`${installQuestion.value}${risk}category`][app.categoryName] ? category[`${installQuestion.value}${risk}category`][app.categoryName]++ : category[`${installQuestion.value}${risk}category`][app.categoryName] = 1 
      // developer
      if(!developer[`${installQuestion.value}${risk}developer`]) developer[`${installQuestion.value}${risk}developer`] = {}
      developer[`${installQuestion.value}${risk}developer`][app.developer] ? developer[`${installQuestion.value}${risk}developer`][app.developer]++ : developer[`${installQuestion.value}${risk}developer`][app.developer] = 1
      
      // app - dev
      if(!developerApp[`${installQuestion.value}${risk}appdev`]) developerApp[`${installQuestion.value}${risk}appdev`] = {}
      developerApp[`${installQuestion.value}${risk}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[`${installQuestion.value}${risk}purpose`]) purpose[`${installQuestion.value}${risk}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[`${installQuestion.value}${risk}purpose`][item['name']] ? purpose[`${installQuestion.value}${risk}purpose`][item['name']]++ : purpose[`${installQuestion.value}${risk}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[`${installQuestion.value}${risk}thirdParty`]) thirdParty[`${installQuestion.value}${risk}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']] ? thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']]++ : thirdParty[`${installQuestion.value}${risk}thirdParty`][item['name']] = 1
      })

    }

    const categoryToStringValue = Object.entries(category).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    const developerToStringValue = Object.entries(developer).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    const devAppToStringValue = Object.entries(developerApp).reduce((acc, [key, item]) => {
      acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
        acc += `*${developerName}: (`
        apps.forEach(app => {
          acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
        })
        acc += `)\n`
        return acc
      }, '')
      return acc
    }, {})

    const purposeToString =  Object.entries(purpose).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    const thirdPartyToString =  Object.entries(thirdParty).reduce((acc, item) => {
      acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
        acc1 += `${item1[0]}: ${item1[1]}, `
        return acc1
      }, '')
      return acc
    }, {})

    rows[type].push({
      stt: i + 1,
      email: user.email,
      ...result,
      ...categoryToStringValue,
      ...developerToStringValue,
      ...devAppToStringValue,
      ...purposeToString,
      ...thirdPartyToString
    })
  }
  let csvWriter = createCsvWriter({
    path: `./reports/test/testing-individual(expert).csv`,
    header
  });
  await csvWriter.writeRecords(rows['expert']);

  csvWriter = createCsvWriter({
    path: `./reports/test/testing-individual(paid).csv`,
    header
  });
  await csvWriter.writeRecords(rows['paid']);

  csvWriter = createCsvWriter({
    path: `./reports/test/testing-individual(unpaid).csv`,
    header
  });
  await csvWriter.writeRecords(rows['unpaid']);
  
  console.log("DONE testing")
}

async function trainingGroup(answers) {
  let rows = []
  let result = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let category = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let developer = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let developerApp = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let purpose = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let thirdParty = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    
    for (let j = 0; j < 10; j++) {

      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      if(!result[type][installQuestion.value]) result[type][installQuestion.value] = 0
      result[type][installQuestion.value]++
       // category 
       if(!category[type][`${installQuestion.value}category`]) category[type][`${installQuestion.value}category`] = {}
       category[type][`${installQuestion.value}category`][app.categoryName] ? category[type][`${installQuestion.value}category`][app.categoryName]++ : category[type][`${installQuestion.value}category`][app.categoryName] = 1 
 
       // developer
       if(!developer[type][`${installQuestion.value}developer`]) developer[type][`${installQuestion.value}developer`] = {}
       developer[type][`${installQuestion.value}developer`][app.developer] ? developer[type][`${installQuestion.value}developer`][app.developer]++ : developer[type][`${installQuestion.value}developer`][app.developer] = 1 
      
       // app - dev
      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      if(!developerApp[type][`${installQuestion.value}appdev`]) developerApp[type][`${installQuestion.value}appdev`] = {}
      developerApp[type][`${installQuestion.value}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[type][`${installQuestion.value}purpose`]) purpose[type][`${installQuestion.value}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[type][`${installQuestion.value}purpose`][item['name']] ? purpose[type][`${installQuestion.value}purpose`][item['name']]++ : purpose[type][`${installQuestion.value}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[type][`${installQuestion.value}thirdParty`]) thirdParty[type][`${installQuestion.value}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[type][`${installQuestion.value}thirdParty`][item['name']] ? thirdParty[type][`${installQuestion.value}thirdParty`][item['name']]++ : thirdParty[type][`${installQuestion.value}thirdParty`][item['name']] = 1
      })

      if(!result[type][`${installQuestion.value}${risk}`]) result[type][`${installQuestion.value}${risk}`] = 0
      result[type][`${installQuestion.value}${risk}`]++
      // category 
      if(!category[type][`${installQuestion.value}${risk}category`]) category[type][`${installQuestion.value}${risk}category`] = {}
      category[type][`${installQuestion.value}${risk}category`][app.categoryName] ? category[type][`${installQuestion.value}${risk}category`][app.categoryName]++ : category[type][`${installQuestion.value}${risk}category`][app.categoryName] = 1 

      // developer
      if(!developer[type][`${installQuestion.value}${risk}developer`]) developer[type][`${installQuestion.value}${risk}developer`] = {}
      developer[type][`${installQuestion.value}${risk}developer`][app.developer] ? developer[type][`${installQuestion.value}${risk}developer`][app.developer]++ : developer[type][`${installQuestion.value}${risk}developer`][app.developer] = 1 
      
       // app - dev
       if(!developerApp[type][`${installQuestion.value}${risk}appdev`]) developerApp[type][`${installQuestion.value}${risk}appdev`] = {}
       developerApp[type][`${installQuestion.value}${risk}appdev`][app.developer] = appsByDeveloper
 
       // purpose 
       if(!purpose[type][`${installQuestion.value}${risk}purpose`]) purpose[type][`${installQuestion.value}${risk}purpose`] = {} 
       childrenPurpose.forEach(item => {
         purpose[type][`${installQuestion.value}${risk}purpose`][item['name']] ? purpose[type][`${installQuestion.value}${risk}purpose`][item['name']]++ : purpose[type][`${installQuestion.value}${risk}purpose`][item['name']] = 1
       })
 
       // third party 
       if(!thirdParty[type][`${installQuestion.value}${risk}thirdParty`]) thirdParty[type][`${installQuestion.value}${risk}thirdParty`] = {} 
       childrenThirdParty.forEach(item => {
         thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']] ? thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']]++ : thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']] = 1
       })
    }
  }

  let categoryToStringValue_expert = Object.entries(category['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_expert = Object.entries(developer['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_expert = Object.entries(developerApp['expert']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_expert =  Object.entries(purpose['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_expert =  Object.entries(thirdParty['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})


  let categoryToStringValue_paid = Object.entries(category['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_paid = Object.entries(developer['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_paid = Object.entries(developerApp['paid']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_paid =  Object.entries(purpose['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_paid =  Object.entries(thirdParty['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let categoryToStringValue_unpaid = Object.entries(category['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_unpaid = Object.entries(developer['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_unpaid = Object.entries(developerApp['unpaid']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_unpaid =  Object.entries(purpose['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_unpaid =  Object.entries(thirdParty['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  rows.push({
    stt: 1,
    email: 'expert',
    ...result['expert'],
    ...categoryToStringValue_expert,
    ...developerToStringValue_expert,
    ...devAppToStringValue_expert,
    ...purposeToString_expert,
    ...thirdPartyToString_expert
  })
  rows.push({
    stt: 2,
    email: 'paid',
    ...result['paid'],
    ...categoryToStringValue_paid,
    ...developerToStringValue_paid,
    ...devAppToStringValue_paid,
    ...purposeToString_paid,
    ...thirdPartyToString_paid
  })
  rows.push({
    stt: 3,
    email: 'unpaid',
    ...result['unpaid'],
    ...categoryToStringValue_unpaid,
    ...developerToStringValue_unpaid,
    ...devAppToStringValue_unpaid,
    ...purposeToString_unpaid,
    ...thirdPartyToString_unpaid
  })
  let csvWriter = createCsvWriter({
    path: "./reports/test/tranning(group).csv",
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE tranning(group)")
}

async function testingGroup(answers) {
  let rows = []
  let result = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let category = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let developer = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let developerApp = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let purpose = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  let thirdParty = {
    expert: {},
    paid: {},
    unpaid: {},
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    
    for (let j = 10; j < answer.questions.length; j++) {

      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      if(!result[type][installQuestion.value]) result[type][installQuestion.value] = 0
      result[type][installQuestion.value]++
       // category 
       if(!category[type][`${installQuestion.value}category`]) category[type][`${installQuestion.value}category`] = {}
       category[type][`${installQuestion.value}category`][app.categoryName] ? category[type][`${installQuestion.value}category`][app.categoryName]++ : category[type][`${installQuestion.value}category`][app.categoryName] = 1 
 
       // developer
       if(!developer[type][`${installQuestion.value}developer`]) developer[type][`${installQuestion.value}developer`] = {}
       developer[type][`${installQuestion.value}developer`][app.developer] ? developer[type][`${installQuestion.value}developer`][app.developer]++ : developer[type][`${installQuestion.value}developer`][app.developer] = 1 

        // app - dev
      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      if(!developerApp[type][`${installQuestion.value}appdev`]) developerApp[type][`${installQuestion.value}appdev`] = {}
      developerApp[type][`${installQuestion.value}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[type][`${installQuestion.value}purpose`]) purpose[type][`${installQuestion.value}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[type][`${installQuestion.value}purpose`][item['name']] ? purpose[type][`${installQuestion.value}purpose`][item['name']]++ : purpose[type][`${installQuestion.value}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[type][`${installQuestion.value}thirdParty`]) thirdParty[type][`${installQuestion.value}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[type][`${installQuestion.value}thirdParty`][item['name']] ? thirdParty[type][`${installQuestion.value}thirdParty`][item['name']]++ : thirdParty[type][`${installQuestion.value}thirdParty`][item['name']] = 1
      })


      if(!result[type][`${installQuestion.value}${risk}`]) result[type][`${installQuestion.value}${risk}`] = 0
      result[type][`${installQuestion.value}${risk}`]++
      // category 
      if(!category[type][`${installQuestion.value}${risk}category`]) category[type][`${installQuestion.value}${risk}category`] = {}
      category[type][`${installQuestion.value}${risk}category`][app.categoryName] ? category[type][`${installQuestion.value}${risk}category`][app.categoryName]++ : category[type][`${installQuestion.value}${risk}category`][app.categoryName] = 1 

      // developer
      if(!developer[type][`${installQuestion.value}${risk}developer`]) developer[type][`${installQuestion.value}${risk}developer`] = {}
      developer[type][`${installQuestion.value}${risk}developer`][app.developer] ? developer[type][`${installQuestion.value}${risk}developer`][app.developer]++ : developer[type][`${installQuestion.value}${risk}developer`][app.developer] = 1 
      
      // app - dev
      if(!developerApp[type][`${installQuestion.value}${risk}appdev`]) developerApp[type][`${installQuestion.value}${risk}appdev`] = {}
      developerApp[type][`${installQuestion.value}${risk}appdev`][app.developer] = appsByDeveloper

      // purpose 
      if(!purpose[type][`${installQuestion.value}${risk}purpose`]) purpose[type][`${installQuestion.value}${risk}purpose`] = {} 
      childrenPurpose.forEach(item => {
        purpose[type][`${installQuestion.value}${risk}purpose`][item['name']] ? purpose[type][`${installQuestion.value}${risk}purpose`][item['name']]++ : purpose[type][`${installQuestion.value}${risk}purpose`][item['name']] = 1
      })

      // third party 
      if(!thirdParty[type][`${installQuestion.value}${risk}thirdParty`]) thirdParty[type][`${installQuestion.value}${risk}thirdParty`] = {} 
      childrenThirdParty.forEach(item => {
        thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']] ? thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']]++ : thirdParty[type][`${installQuestion.value}${risk}thirdParty`][item['name']] = 1
      })
    }
  }

  let categoryToStringValue_expert = Object.entries(category['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_expert = Object.entries(developer['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_expert = Object.entries(developerApp['expert']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_expert =  Object.entries(purpose['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_expert =  Object.entries(thirdParty['expert']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})


  let categoryToStringValue_paid = Object.entries(category['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_paid = Object.entries(developer['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_paid = Object.entries(developerApp['paid']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_paid =  Object.entries(purpose['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_paid =  Object.entries(thirdParty['paid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let categoryToStringValue_unpaid = Object.entries(category['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let developerToStringValue_unpaid = Object.entries(developer['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let devAppToStringValue_unpaid = Object.entries(developerApp['unpaid']).reduce((acc, [key, item]) => {
    acc[key] = Object.entries(item).reduce((acc, [developerName, apps]) => {
      acc += `*${developerName}: (`
      apps.forEach(app => {
        acc += ` - ${app.title}: ${app.installs}; ${app.scoreText} \n`
      })
      acc += `)\n`
      return acc
    }, '')
    return acc
  }, {})

  let purposeToString_unpaid =  Object.entries(purpose['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  let thirdPartyToString_unpaid =  Object.entries(thirdParty['unpaid']).reduce((acc, item) => {
    acc[item[0]] = Object.entries(item[1]).reduce((acc1, item1) => {
      acc1 += `${item1[0]}: ${item1[1]}, `
      return acc1
    }, '')
    return acc
  }, {})

  rows.push({
    stt: 1,
    email: 'expert',
    ...result['expert'],
    ...categoryToStringValue_expert,
    ...developerToStringValue_expert,
    ...devAppToStringValue_expert,
    ...purposeToString_expert,
    ...thirdPartyToString_expert
  })
  rows.push({
    stt: 2,
    email: 'paid',
    ...result['paid'],
    ...categoryToStringValue_paid,
    ...developerToStringValue_paid,
    ...devAppToStringValue_paid,
    ...purposeToString_paid,
    ...thirdPartyToString_paid
  })
  rows.push({
    stt: 3,
    email: 'unpaid',
    ...result['unpaid'],
    ...categoryToStringValue_unpaid,
    ...developerToStringValue_unpaid,
    ...devAppToStringValue_unpaid,
    ...purposeToString_unpaid,
    ...thirdPartyToString_unpaid
  })
  let csvWriter = createCsvWriter({
    path: "./reports/test/testing(group).csv",
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE testing(group)")
}
async function main() {
  console.log("Generating CSV...");
 

  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  // tranning 
  await Promise.all(
    [
      trainingIndiv(answers),
      testIndiv(answers),
      trainingGroup(answers),
      testingGroup(answers)
    ]
  )

  // test
  
  // trainning group 
  

  // testing group 
  
  
  console.log("DONE")
}
// main()


async function stats() {
  await Promise.all([
    genCategory('training'),
    genPurpose('training'),
    genThirdParty('training'),
    genDeveloper('training'),
    
    genCategory("testing"),
    genPurpose("testing"),
    genThirdParty("testing"),
    genDeveloper("testing"),
  ])

  console.log("DONE")
}
// stats()


async function genCategory(dataSetType) {
  
  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  const header = [
    {
      id: "name",
      title: "",
    },
    {
      id: "1expert",
      title: "Expert - Yes",
    },
    {
      id: "0expert",
      title: "Expert - No",
    },
    {
      id: "2expert",
      title: "Expert - Maybe",
    },
    // 
    {
      id: "1paid",
      title: "Crowd - Yes",
    },
    {
      id: "0paid",
      title: "Crowd - No",
    },
    {
      id: "2paid",
      title: "Crowd - Maybe",
    },
    // 
    {
      id: "1unpaid",
      title: "IT - Yes",
    },
    {
      id: "0unpaid",
      title: "IT - No",
    },
    {
      id: "2unpaid",
      title: "IT - Maybe",
    },
  ]
  let rows = []

  let result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      
      if(!installQuestion) continue;

      if(!result[app.categoryName]) result[app.categoryName] = {}
      result[app.categoryName][`${installQuestion.value}${type}`] ? result[app.categoryName][`${installQuestion.value}${type}`]++ : result[app.categoryName][`${installQuestion.value}${type}`] = 1 
    }
  }

  rows = Object.entries(result).map(item => {
    return {
      name: item[0],
      ...item[1],
    }
  })
  let csvWriter = createCsvWriter({
    path: `./reports/test/category/quantitiy(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE category(quantitiy)", dataSetType)

  rows = []

  result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;


      if(!result[app.categoryName]) result[app.categoryName] = {}
      if(!result[app.categoryName][`${installQuestion.value}${type}`]) result[app.categoryName][`${installQuestion.value}${type}`] = {}

      result[app.categoryName][`${installQuestion.value}${type}`][risk] ? result[app.categoryName][`${installQuestion.value}${type}`][risk]++ : result[app.categoryName][`${installQuestion.value}${type}`][risk] = 1
    }
  }

  rows = Object.entries(result).map(item => {

    const cols = Object.entries(item[1]).reduce((acc, [key, risks]) => {
      acc[key] = ((risks['1'] || 0) * 0.25) + ((risks['2'] || 0) * 0.5) + ((risks['3'] || 0) * 0.75) + ((risks['4'] || 0))
      acc[key] = acc[key] / ((risks['0'] || 0) + (risks['1'] || 0) + (risks['2'] || 0)+ (risks['3'] || 0)+ (risks['4'] || 0))

      acc[key] = Math.round(acc[key] * 100) / 100
      return acc
    }, {})
    return {
      name: item[0],
      ...cols,
    }
  })
  csvWriter = createCsvWriter({
    path: `./reports/test/category/risk(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE category(risk)", dataSetType)

  // 
}


async function genPurpose(dataSetType) {
  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  const header = [
    {
      id: "name",
      title: "",
    },
    {
      id: "1expert",
      title: "Expert - Yes",
    },
    {
      id: "0expert",
      title: "Expert - No",
    },
    {
      id: "2expert",
      title: "Expert - Maybe",
    },
    // 
    {
      id: "1paid",
      title: "Crowd - Yes",
    },
    {
      id: "0paid",
      title: "Crowd - No",
    },
    {
      id: "2paid",
      title: "Crowd - Maybe",
    },
    // 
    {
      id: "1unpaid",
      title: "IT - Yes",
    },
    {
      id: "0unpaid",
      title: "IT - No",
    },
    {
      id: "2unpaid",
      title: "IT - Maybe",
    },
  ]
  let rows = []

  let result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      childrenPurpose.forEach(item => {
        if(!result[item['name']]) result[item['name']] = {}
        result[item['name']][`${installQuestion.value}${type}`] ? result[item['name']][`${installQuestion.value}${type}`]++ : result[item['name']][`${installQuestion.value}${type}`] = 1 
      })
    }
  }

  rows = Object.entries(result).map(item => {
    return {
      name: item[0],
      ...item[1],
    }
  })
  let csvWriter = createCsvWriter({
    path: `./reports/test/purpose/quantitiy${dataSetType}.csv`,
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE purpose(quantitiy)", dataSetType)

  rows = []

  result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      childrenPurpose.forEach(item => {
        if(!result[item['name']]) result[item['name']] = {}
        if(!result[item['name']][`${installQuestion.value}${type}`]) result[item['name']][`${installQuestion.value}${type}`] = {}
        result[item['name']][`${installQuestion.value}${type}`][risk] ? result[item['name']][`${installQuestion.value}${type}`][risk]++ : result[item['name']][`${installQuestion.value}${type}`][risk] = 1
      })
    }
  }

  rows = Object.entries(result).map(item => {

    const cols = Object.entries(item[1]).reduce((acc, [key, risks]) => {
      acc[key] = ((risks['1'] || 0) * 0.25) + ((risks['2'] || 0) * 0.5) + ((risks['3'] || 0) * 0.75) + ((risks['4'] || 0))
      acc[key] = acc[key] / ((risks['0'] || 0) + (risks['1'] || 0) + (risks['2'] || 0)+ (risks['3'] || 0)+ (risks['4'] || 0))

      acc[key] = Math.round(acc[key] * 100) / 100
      return acc
    }, {})
    return {
      name: item[0],
      ...cols,
    }
  })
  csvWriter = createCsvWriter({
    path: `./reports/test/purpose/risk(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE purpose(risk)")
  // 
}

async function genThirdParty(dataSetType) {
  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  const header = [
    {
      id: "name",
      title: "",
    },
    {
      id: "1expert",
      title: "Expert - Yes",
    },
    {
      id: "0expert",
      title: "Expert - No",
    },
    {
      id: "2expert",
      title: "Expert - Maybe",
    },
    // 
    {
      id: "1paid",
      title: "Crowd - Yes",
    },
    {
      id: "0paid",
      title: "Crowd - No",
    },
    {
      id: "2paid",
      title: "Crowd - Maybe",
    },
    // 
    {
      id: "1unpaid",
      title: "IT - Yes",
    },
    {
      id: "0unpaid",
      title: "IT - No",
    },
    {
      id: "2unpaid",
      title: "IT - Maybe",
    },
  ]
  let rows = []

  let result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      childrenThirdParty.forEach(item => {
        if(!result[item['name']]) result[item['name']] = {}
        result[item['name']][`${installQuestion.value}${type}`] ? result[item['name']][`${installQuestion.value}${type}`]++ : result[item['name']][`${installQuestion.value}${type}`] = 1 
      })
    }
  }

  rows = Object.entries(result).map(item => {
    return {
      name: item[0],
      ...item[1],
    }
  })
  let csvWriter = createCsvWriter({
    path: `./reports/test/third-party/quantitiy(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE third-party(quantitiy)", dataSetType)

  rows = []

  result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const childrenPurpose = getLeafNodes(JSON.parse(app.collectionData))
      const childrenThirdParty = getLeafNodes(JSON.parse(app.thirdPartyData))

      childrenThirdParty.forEach(item => {
        if(!result[item['name']]) result[item['name']] = {}
        if(!result[item['name']][`${installQuestion.value}${type}`]) result[item['name']][`${installQuestion.value}${type}`] = {}
        result[item['name']][`${installQuestion.value}${type}`][risk] ? result[item['name']][`${installQuestion.value}${type}`][risk]++ : result[item['name']][`${installQuestion.value}${type}`][risk] = 1
      })
    }
  }

  rows = Object.entries(result).map(item => {

    const cols = Object.entries(item[1]).reduce((acc, [key, risks]) => {
      acc[key] = ((risks['1'] || 0) * 0.25) + ((risks['2'] || 0) * 0.5) + ((risks['3'] || 0) * 0.75) + ((risks['4'] || 0))
      acc[key] = acc[key] / ((risks['0'] || 0) + (risks['1'] || 0) + (risks['2'] || 0)+ (risks['3'] || 0)+ (risks['4'] || 0))

      acc[key] = Math.round(acc[key] * 100) / 100
      return acc
    }, {})
    return {
      name: item[0],
      ...cols,
    }
  })
  csvWriter = createCsvWriter({
    path: `./reports/test/third-party/risk(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows, dataSetType);

  console.log("DONE third-party(risk)")
  // 
}

async function genDeveloper(dataSetType) {
  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  const header = [
    {
      id: "name",
      title: "",
    },
    {
      id: "1expert",
      title: "Expert - Yes",
    },
    {
      id: "0expert",
      title: "Expert - No",
    },
    {
      id: "2expert",
      title: "Expert - Maybe",
    },
    // 
    {
      id: "1paid",
      title: "Crowd - Yes",
    },
    {
      id: "0paid",
      title: "Crowd - No",
    },
    {
      id: "2paid",
      title: "Crowd - Maybe",
    },
    // 
    {
      id: "1unpaid",
      title: "IT - Yes",
    },
    {
      id: "0unpaid",
      title: "IT - No",
    },
    {
      id: "2unpaid",
      title: "IT - Maybe",
    },
  ]
  let rows = []

  let result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      const installCount = _.sumBy(appsByDeveloper, 'maxInstalls')
      let installText = ''
      if(installCount >= 1000000000) installText = '1B'
      else if(installCount >= 500000000 && installCount < 1000000000) installText = '[500M; 1B)'
      else if(installCount >= 100000000 && installCount < 500000000) installText = '[100M; 500M)'
      else if(installCount >= 50000000 && installCount < 100000000) installText = '[50M;100M)'
      else if(installCount >= 10000000 && installCount < 50000000) installText = '[10M; 50M)'
      else if(installCount >= 1000000 && installCount < 10000000) installText = '[1M; 10M)'
      else if(installCount >= 500000 && installCount < 1000000) installText = '[500K; 1M)'
      else if(installCount >= 100000 && installCount < 500000) installText = '[100K; 500K)'
      else if(installCount >= 50000 && installCount < 100000) installText = '[50K; 100K)'
      else if(installCount >= 10000 && installCount < 50000) installText = '[10K; 50K)'
      else installText = '<10K'

      if(!result[installText]) result[installText] = {}
      result[installText][`${installQuestion.value}${type}`] ? result[installText][`${installQuestion.value}${type}`]++ : result[installText][`${installQuestion.value}${type}`] = 1 

    }
  }

  let resultSorted = {
    '1B': result['1B'],
    '[500M; 1B)': result['[500M; 1B)'] || {},
    '[100M; 500M)': result['[100M; 500M)'] || {},
    '[50M;100M)': result['[50M;100M)'] || {},
    '[10M; 50M)': result['[10M; 50M)'] || {},
    '[1M; 10M)': result['[1M; 10M)'] || {},
    '[500K; 1M)': result['[500K; 1M)'] || {},
    '[100K; 500K)': result['[100K; 500K)'] || {},
    '[50K; 100K)': result['[50K; 100K)'] || {},
    '[10K; 50K)': result['[10K; 50K)'] || {},
    '<10K': result['<10K'] || {},
  }
  rows = Object.entries(resultSorted).map(item => {
    return {
      name: item[0],
      ...item[1],
    }
  })
  let csvWriter = createCsvWriter({
    path: `./reports/test/developer/quantitiy(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE developer(quantitiy)", dataSetType)
  rows = []

  result = {
  }
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    
    const user = await Models.User.findById(answer.userId).cache(
      60 * 60 * 24 * 30
    ); // 1 month;
    const type = user.type === 'normal'? 'expert' : (user.isPaid) ? 'paid' : 'unpaid'
    const fromQuestion = dataSetType === 'training' ? 0 : 10
    const toQuestion = dataSetType === 'training' ? 10 : 26
    for (let j = fromQuestion; j < toQuestion; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      let installQuestion = question.responses.find(item => item.name === "install")
      const agreePredict = question.responses.find(item => item.name === "agreePredict")
      const ourPrediction = question.responses.find(item => item.name === "ourPrediction")
      if(!installQuestion && agreePredict == '1') {
        installQuestion = ourPrediction
      }
      if(!installQuestion) continue;

      const appsByDeveloper = await gplay.developer({devId: app.developer}).then(apps => Promise.all(apps.map(app => gplay.app({appId: app.appId}).catch(_ => null))).then(items => items.filter(item => !!item))).catch(_ => [])
      const installCount = _.sumBy(appsByDeveloper, 'maxInstalls')
      let installText = ''
      if(installCount >= 1000000000) installText = '1B'
      else if(installCount >= 500000000 && installCount < 1000000000) installText = '[500M; 1B)'
      else if(installCount >= 100000000 && installCount < 500000000) installText = '[100M; 500M)'
      else if(installCount >= 50000000 && installCount < 100000000) installText = '[50M;100M)'
      else if(installCount >= 10000000 && installCount < 50000000) installText = '[10M; 50M)'
      else if(installCount >= 1000000 && installCount < 10000000) installText = '[1M; 10M)'
      else if(installCount >= 500000 && installCount < 1000000) installText = '[500K; 1M)'
      else if(installCount >= 100000 && installCount < 500000) installText = '[100K; 500K)'
      else if(installCount >= 50000 && installCount < 100000) installText = '[50K; 100K)'
      else if(installCount >= 10000 && installCount < 50000) installText = '[10K; 50K)'
      else installText = '<10K'

      if(!result[installText]) result[installText] = {}
      if(!result[installText][`${installQuestion.value}${type}`]) result[installText][`${installQuestion.value}${type}`] = {}
      result[installText][`${installQuestion.value}${type}`][risk] ? result[installText][`${installQuestion.value}${type}`][risk]++ : result[installText][`${installQuestion.value}${type}`][risk] = 1
    }
  }

  resultSorted = {
    '1B': result['1B'],
    '[500M; 1B)': result['[500M; 1B)'] || {},
    '[100M; 500M)': result['[100M; 500M)'] || {},
    '[50M;100M)': result['[50M;100M)'] || {},
    '[10M; 50M)': result['[10M; 50M)'] || {},
    '[1M; 10M)': result['[1M; 10M)'] || {},
    '[500K; 1M)': result['[500K; 1M)'] || {},
    '[100K; 500K)': result['[100K; 500K)'] || {},
    '[50K; 100K)': result['[50K; 100K)'] || {},
    '[10K; 50K)': result['[10K; 50K)'] || {},
    '<10K': result['<10K'] || {},
  }

  rows = Object.entries(resultSorted).map(item => {

    const cols = Object.entries(item[1]).reduce((acc, [key, risks]) => {
      acc[key] = ((risks['1'] || 0) * 0.25) + ((risks['2'] || 0) * 0.5) + ((risks['3'] || 0) * 0.75) + ((risks['4'] || 0))
      acc[key] = acc[key] / ((risks['0'] || 0) + (risks['1'] || 0) + (risks['2'] || 0)+ (risks['3'] || 0)+ (risks['4'] || 0))

      acc[key] = Math.round(acc[key] * 100) / 100
      return acc
    }, {})
    return {
      name: item[0],
      ...cols,
    }
  })
  csvWriter = createCsvWriter({
    path: `./reports/test/developer/risk(${dataSetType}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE developer(risk)", dataSetType)
  // 
}


function getLeafNodes(nodes, result = []){
  for(var i = 0, length = nodes.length; i < length; i++){
    if(!!nodes[i].parent && (!nodes[i].children || nodes[i].children.length === 0)){
      result.push(nodes[i]);
    }else{
      result = getLeafNodes(nodes[i].children, result);
    }
  }
  return result;
}
