require("dotenv").config();
import express from "express";
import chalk from "chalk";
import morgan from "morgan";
import path from "path";
import bodyParser from "body-parser";
import routes from "./routes";
import Helpers from "./helpers";
import "./configs/mongoose.config";
import Models from "./models";
const app = express();

app.use(morgan("tiny"));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "../public")));

// change name in tree
// Models.Tree.updateMany(
//   {
//     name: {
//       $in: [
//         "android.net.wifi.hotspot2",
//         "android.net.wifi.hotspot3",
//         "android.net.wifi.hotspot4",
//         "android.net.wifi.hotspot5",
//         "android.net.wifi.hotspot6",
//         "android.net.wifi.hotspot7",
//         "android.net.wifi.hotspot8",
//         "android.net.wifi.hotspot9",
//         "android.net.wifi.hotspot10",
//         "android.net.wifi.hotspot11",
//         "android.net.wifi.hotspot12",
//         "android.net.wifi.hotspot13",
//       ],
//     },
//   },
//   { name: "android.net.wifi.hotspot2" }
// )
//   .then(console.log)
//   .catch(console.log);
async function main() {
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const data = {};
  const csv = require("csvtojson");

  let appCategories = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(
    "/Users/a1234/individual/abc/project-1-web/app/data/app_category.csv"
  );

  appCategories = appCategories.map((item) => {
    const [stt, appName, category] = item;

    return {
      stt,
      appName,
      category,
    };
  });

  const apps = await Models.App.find();

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i].toJSON();

    const apis = [],
      classes = [];
    const category = appCategories.filter((item) => {
      return item.appName == app.name;
    })[0];

    if (!data[category.category]) {
      data[category.category] = {};
      data[category.category].appNumber = 0;
      data[category.category].functions = { max: 0, min: 99999, agv: 0 };
      data[category.category].classes = { max: 0, min: 99999, agv: 0 };
      data[category.category].apis = { max: 0, min: 99999, agv: 0 };
    }
    data[category.category].appNumber++;

    const nodes = app.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      const nodeDB = await Models.Tree.findOne({ name: node.name });

      if (nodeDB.right - nodeDB.left === 1) {
        const lv2 = await Models.Tree.findById(nodeDB.parent).cache(
          60 * 60 * 24 * 30
        );

        const lv1 = await Models.Tree.findById(lv2.parent).cache(
          60 * 60 * 24 * 30
        );

        // class
        if (!~classes.indexOf(lv2.name)) {
          classes.push(lv2.name);
        }

        //api
        if (!~apis.indexOf(lv1.name)) {
          apis.push(lv1.name);
        }
      }
    }
    // functions
    data[category.category].functions.agv += nodes.length;
    if (nodes.length > data[category.category].functions.max) {
      data[category.category].functions.max = nodes.length;
    }
    if (nodes.length < data[category.category].functions.min) {
      data[category.category].functions.min = nodes.length;
      if (nodes.length === 0) {
        console.log("function", app);
      }
    }

    // classes
    if (classes.length > data[category.category].classes.max) {
      data[category.category].classes.max = classes.length;
    }
    if (classes.length < data[category.category].classes.min) {
      data[category.category].classes.min = classes.length;
      if (classes.length === 0) {
        console.log("classes", app);
      }
    }
    data[category.category].classes.agv += classes.length;

    // apis
    if (apis.length > data[category.category].apis.max) {
      data[category.category].apis.max = apis.length;
    }
    if (apis.length < data[category.category].apis.min) {
      data[category.category].apis.min = apis.length;
      if (apis.length === 0) {
        console.log("apis", app);
      }
    }
    data[category.category].apis.agv += apis.length;
  }

  for (const category in data) {
    const value = data[category];

    console.log(
      `${category}: 
      - functions (avg: ${value.functions.agv / value.appNumber} - min: ${
        value.functions.min
      } - max: ${value.functions.max}) 

      - classes (avg: ${value.classes.agv / value.appNumber} - min: ${
        value.classes.min
      } - max: ${value.classes.max}) 

      - apis (avg: ${value.apis.agv / value.appNumber} - min: ${
        value.apis.min
      } - max: ${value.apis.max}) `
    );
  }
}

async function getLevel(node, lv1 = 1) {
  if (node.parent) {
    const parent = await Models.Tree.findById(node.parent);
    return await getLevel(parent, lv1++);
  }
  return lv1;
}
// main();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// init tree on database
// Helpers.Init.initTreeOnDB();

// init apps on database
// Helpers.Init.initAppsOnDB();

// init apps on database by csv
// Helpers.Init.initAppsOnDBByCSV();

app.get("/", function (req, res) {
  res.render("pages/index");
});

// routes
app.use(routes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
  console.log("Server listening on: http://localhost:3333")
);
