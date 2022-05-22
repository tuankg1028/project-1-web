require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
var parseString = require("xml2js").parseString;
import fs from "fs";
import _ from "lodash";
main();
async function main() {
  try {
    const limit = 10;
    let skip = 0;
    const contition = {
      isCompleted: true,
      isCompletedJVCode: true,
    };
    let apps = await Models.App.find(contition)
      .limit(limit)
      .skip(skip)
      .select("id");

    do {
      await Promise.all(apps.map((app) => getApisAndLibs(app)));

      skip += limit;
      apps = await Models.App.find(contition).limit(limit).skip(skip);
    } while (apps && apps.length);
  } catch (err) {
    console.log(err);
  }
  console.log("DONE");
}
async function getApisAndLibs(app) {
  console.log(app);
  const xmlPath = `/data/JavaCode/${app.id}/resources/AndroidManifest.xml`;
  const xml = fs.readFileSync(xmlPath);

  const permissions = await new Promise((resolve, reject) => {
    parseString(xml, function (err, result) {
      const permissions = result.manifest["uses-permission"].map(
        (item) => item["$"]["android:name"]
      );

      resolve(permissions);
    });
  });

  await Models.App.updateOne(
    {
      _id: app.id,
    },
    {
      $set: {
        permissions,
      },
    },
    {}
  );

  return;
}
