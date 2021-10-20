import csv from "csvtojson";
const path = require("path");
const _ = require("lodash");
import chalk from "chalk";
import * as cheerio from "cheerio";
import axios from "axios";
const bibtexParse = require("bibtex-parse");
const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

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

async function main() {
  // console.log(1)
  // const apps = await Models.App.find({
  // }).select(["_id", "categoryName", 'distance'])

  // const appGrours = _.groupBy(apps, "categoryName")
  // console.log(2)
  // const result1= {}
  // for (const categoryName in appGrours) {
  //     const apps = appGrours[categoryName];
      
  //     result1[categoryName] =[ _.min(_.map(apps, 'distance')), _.max(_.map(apps, 'distance'))]
  // }
  
  // console.log(result1)
  // return 
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
      title: "Yes - Very low",
      id: "10"
    },
    {
      title: "Yes - Low",
      id: "11"
    },
    {
      title: "Yes - Neutral",
      id: "12"
    },
    {
      title: "Yes - High",
      id: "13"
    },
    {
      title: "Yes - Very high",
      id: "14"
    },
    // NO
    {
      title: "No",
      id: "0"
    },
    {
      title: "No - Very low",
      id: "00"
    },
    {
      title: "No - Low",
      id: "01"
    },
    {
      title: "No - Neutral",
      id: "02"
    },
    {
      title: "No - High",
      id: "03"
    },
    {
      title: "No - Very high",
      id: "04"
    },
    // Maybe
    {
      title: "Maybe",
      id: "2"
    },
    {
      title: "Maybe - Very low",
      id: "20"
    },
    {
      title: "Maybe - Low",
      id: "21"
    },
    {
      title: "Maybe - Neutral",
      id: "22"
    },
    {
      title: "Maybe - High",
      id: "23"
    },
    {
      title: "Maybe - Very high",
      id: "24"
    },
  ]
  let users = await Models.User.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;

  let answers = await Models.Answer.find().cache(
    60 * 60 * 24 * 30
  ); // 1 month;
  answers = answers.filter(answer => answer.questions.length === 26)

  // tranning 
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
    for (let j = 0; j < 10; j++) {

      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;

      const installQuestion = question.responses.find(item => item.name === "install")
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4


      if(!result[installQuestion.value]) result[installQuestion.value] = 0
      result[installQuestion.value]++

      if(!result[`${installQuestion.value}${risk}`]) result[`${installQuestion.value}${risk}`] = 0
      result[`${installQuestion.value}${risk}`]++
    }
    

    rows[type].push({
      stt: i + 1,
      email: user.email,
      ...result
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
  // test
  rows = {
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
    for (let j = 10; j < answer.questions.length; j++) {
      const question = answer.questions[j];
      const app = await Models.App.findById(question.id).cache(
        60 * 60 * 24 * 30
      ); // 1 month;
      const installQuestion = question.responses.find(item => item.name === "install")
      if(!installQuestion) continue;
      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4


      if(!result[installQuestion.value]) result[installQuestion.value] = 0
      result[installQuestion.value]++

      if(!result[`${installQuestion.value}${risk}`]) result[`${installQuestion.value}${risk}`] = 0
      result[`${installQuestion.value}${risk}`]++
    }
    rows[type].push({
      stt: i + 1,
      email: user.email,
      ...result
    })
  }
  csvWriter = createCsvWriter({
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
  // trainning group 
  rows = []
  let result = {
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

      const installQuestion = question.responses.find(item => item.name === "install")
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else risk = 4

      if(!result[type][installQuestion.value]) result[type][installQuestion.value] = 0
      result[type][installQuestion.value]++

      if(!result[type][`${installQuestion.value}${risk}`]) result[type][`${installQuestion.value}${risk}`] = 0
      result[type][`${installQuestion.value}${risk}`]++
    }
  }
  rows.push({
    stt: 1,
    email: 'expert',
    ...result['expert']
  })
  rows.push({
    stt: 2,
    email: 'paid',
    ...result['paid']
  })
  rows.push({
    stt: 3,
    email: 'unpaid',
    ...result['unpaid']
  })
  csvWriter = createCsvWriter({
    path: "./reports/test/tranning(group).csv",
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE tranning(group)")

  // testing group 
  rows = []
  result = {
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

      const installQuestion = question.responses.find(item => item.name === "install")
      if(!installQuestion) continue;

      const range = ranges[app.categoryName]
      let risk
      const part = (range[1] - range[0]) / 5
      if(0 <= Number( app.distance) && Number( app.distance) < (range[0] + part * 1)) risk = 0
      else if((range[0] + part * 1) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 2)) risk = 1
      else  if((range[0] + part * 2) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 3)) risk = 2
      else if((range[0] + part * 3) <= Number( app.distance) && Number( app.distance) < (range[0] + part * 4)) risk = 3
      else  if((range[0] + part * 4) <= Number( app.distance) && Number( app.distance) <= (range[0] + part *5)) risk = 4

      if(!result[type][installQuestion.value]) result[type][installQuestion.value] = 0
      result[type][installQuestion.value]++

      if(!result[type][`${installQuestion.value}${risk}`]) result[type][`${installQuestion.value}${risk}`] = 0
      result[type][`${installQuestion.value}${risk}`]++
      
    }
  }
  rows.push({
    stt: 1,
    email: 'expert',
    ...result['expert']
  })
  rows.push({
    stt: 2,
    email: 'paid',
    ...result['paid']
  })
  rows.push({
    stt: 3,
    email: 'unpaid',
    ...result['unpaid']
  })
  csvWriter = createCsvWriter({
    path: "./reports/test/testing(group).csv",
    header
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE testing(group)")
  
  console.log("DONE")
}
main()


