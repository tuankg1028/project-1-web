import csv from "csvtojson";
const path = require("path");
const _ = require("lodash");
import chalk from "chalk";
import * as cheerio from "cheerio";
import axios from "axios";
const bibtexParse = require("bibtex-parse");
const puppeteer = require("puppeteer");

import fs from "fs";
// [ 'ID', 'Name', 'Level', 'Parent' ],
async function test() {
  const infoCollection = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/information collected-Table 1.csv"
    )
  );

  const permissions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/permission-Table 1.csv"
    )
  );

  const interactions = await csv({
    noheader: true,
    output: "csv"
  }).fromFile(
    path.join(
      __dirname,
      "../../input/Privacy_preference_Level_Sheet/interaction-Table 1.csv"
    )
  );

  const lv1Nodes = interactions.filter(item => item[3] === "null");

  const questions = [];
  lv1Nodes.forEach(lv1Node => {
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

  // const groupQuestions = _.groupBy(questions, "groupId");
  //   subItem: {
  //     '0': '9',
  //     '1': 'steps',
  //     '2': '2',
  //     '3': '8',
  //     '4': '',
  //     type: 'collection'
  //   }
  console.log(JSON.stringify(questions));
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

    const getData = async article => {
      const { fields, raw } = article;

      const title = fields.find(item => item.name === "title").value;
      const ggResult = await googleIt({
        query: title
      });

      const link = ggResult[0].link;
      console.log("Get link", link);

      // // get article html
      let articleHtml = await Promise.all([
        axios.get(link, { timeout: 1000 * 60 }).then(response => response.data),
        getContentFromUrl(link)
      ]);

      articleHtml = articleHtml.join("\n");

      fs.writeFileSync("./kaka.html", articleHtml);
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

      return content;
    };

    const chunkArray = (array = [], size = ARRAY_SIZE) => {
      const results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    };

    const articleChunk = chunkArray(articles, 5);

    let txt = "";
    for (let i = 0; i < articleChunk.length; i++) {
      const chunk = articleChunk[i];

      const content = await Promise.all(chunk.map(article => getData(article)));

      txt += content.join("\n\n");
    }

    fs.writeFileSync("./content.txt", txt);
    console.log("DONE");
  } catch (err) {
    console.log(err);
  }
}
test1();

async function getContentFromUrl(url) {
  try {
    const browser = await puppeteer.launch({
      // executablePath:
      //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto(url, { waitUntil: "networkidle0" });

    const data = await page.evaluate(
      () => document.querySelector("html").outerHTML
    );

    await browser.close();

    return data;
  } catch (err) {
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
