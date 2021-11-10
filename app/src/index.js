require("dotenv").config();
import express from "express";
import morgan from "morgan";
import path from "path";
import bodyParser from "body-parser";
import routes from "./routes";
import Helpers from "./helpers";
import fs from "fs";
import _ from "lodash";
import "./configs/mongoose.config";
import Models from "./models";
const app = express();

app.use(morgan("tiny"));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "../public")));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

async function initData() {
  // init tree on database
  // await Helpers.Init.initTreeOnDB();
  // init apps on database
  // Helpers.Init.initAppsOnDB();
  // init apps on database by csv
  // await Helpers.Init.initAppsOnDBByCSV();
  // init apps on database (36k)
  await Helpers.Init.initeJavaSourceCode();
  // await Helpers.Init.getAppsUninstall();
  // await Helpers.Init.updateApps();
}
// initData();

async function main() {
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  // var data = require("/Users/a1234/Downloads/data_what_why_json.json");

  // console.log(1,  config);

  const header = [
    {
      id: "stt",
      title: "STT",
    },
    {
      id: "dataType",
      title: "Data type",
    },
    {
      id: "api",
      title: "api",
    },
    {
      id: "class",
      title: "class",
    },
    {
      id: "function",
      title: "function",
    },
    {
      id: "count",
      title: "so lan xuat hien",
    },
  ];
  const rows = [];
  const result = {};
  const tree = await Models.Tree.find({
    parent: "602951a2163e554ddd9a1262",
  }).cache(60 * 60 * 24 * 30);

  let skip = 0;
  let apps = await Models.App.find({}).limit(100).skip(skip);
  let appsApis = [];
  while (apps.length) {
    const appApis = apps.map((app) => {
      const apis = JSON.parse(app.apisModel);
      const apisUsed = Object.entries(apis).reduce((acc, [key, value]) => {
        if (value == 1) acc.push(key);

        return acc;
      }, []);

      return apisUsed;
    });

    appsApis = [...appsApis, ...appApis];

    skip += 100;
    apps = [];
    // apps = await Models.App.find({}).limit(100).skip(skip);
  }

  for (let i = 0; i < 1; i++) {
    const cloneAppsApis = JSON.parse(JSON.stringify(appsApis));
    const dataType = tree[i];
    !result[dataType.name] &&
      (result[dataType.name] = {
        count: 0,
        apis: [],
      });
    // apis
    const apis = await Models.Tree.find({
      parent: dataType.id,
    });

    for (let j = 0; j < apis.length; j++) {
      const api = apis[j].toJSON();

      const cloneAppsApisForApi = JSON.parse(JSON.stringify(cloneAppsApis));
      for (let f = 0; f < cloneAppsApisForApi.length; f++) {
        const apisApp = cloneAppsApisForApi[f];

        if (apisApp.includes(api.name)) {
          result[dataType.name]++;
          cloneAppsApis.splice(f, 1);
        }
      }

      let indexApi = result[dataType.name].apis.findIndex(
        (item) => item.name === api.name
      );
      if (indexApi === -1)
        result[dataType.name].apis.push({
          ...api,
          classes: [],
        });
      indexApi = result[dataType.name].apis.findIndex(
        (item) => item.name === api.name
      );

      // classes
      const classes = await Models.Tree.find({
        parent: api.id,
      });
      for (let k = 0; k < classes.length; k++) {
        const class1 = classes[k].toJSON();

        let indexClass = result[dataType.name].apis[indexApi].classes.findIndex(
          (item) => item.name === class1.name
        );
        if (indexClass === -1)
          result[dataType.name].apis[indexApi].classes.push({
            ...class1,
            functions: [],
          });
        indexClass = result[dataType.name].apis[indexApi].classes.findIndex(
          (item) => item.name === class1.name
        );
        // functions
        const functions = await Models.Tree.find({
          parent: class1.id,
        });

        for (let l = 0; l < functions.length; l++) {
          const function1 = functions[l].toJSON();

          result[dataType.name].apis[indexApi].classes[
            indexClass
          ].functions.push(function1);
        }
      }
    }
  }

  let stt = 1;
  for (const dataType in result) {
    const { count, apis } = result[dataType];

    apis.forEach((api) => {
      const { classes } = api;

      classes.forEach((class1) => {
        let { functions } = class1;
        functions = _.uniqBy(functions, "name");

        functions.forEach((function1) => {
          rows.push({
            stt: stt++,
            dataType,
            api: api.name,
            class: class1.name,
            function: function1.name,
            count,
          });
        });
      });
    });
  }

  const csvWriterNo = createCsvWriter({
    path: "file2.csv",
    header,
  });
  await csvWriterNo.writeRecords(rows);

  console.log("DONE");
}
main();
app.get("/", function (req, res) {
  res.render("pages/index");
});

// routes
app.use(routes);

// const PORT = process.env.PORT || 3333;
// app.listen(PORT, () =>
//   Helpers.Logger.info("Server listening on: http://localhost:3333")
// );
