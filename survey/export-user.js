const path = require("path");
import moment from "moment";
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

require("dotenv").config({ path: path.join(__dirname, ".env") });
import "./src/configs/mongoose.config";
import Models from "./src/models";
const makeDir = require("make-dir");
import _ from "lodash";
import fs from "fs";
import rq from "request-promise";
main();

async function main() {
  await makeDir("./workers");

  // let answers = await fs.readFileSync("./answers.txt", "utf8");
  // answers = JSON.parse(answers);

  const answers = await Models.Answer.find({
    createdAt: {
      $gte: new Date("2020-05-23T01:03:41.477+00:00"),
      $lt: new Date("2020-06-21T18:27:58.290+00:00")
    }
  });
  console.log(answers.length);
  for (let i = 0; i < answers.length; i++) {
    console.log(i);
    let content = "";
    const { workerId, apps, comment, slotId } = answers[i];
    let worker = await rq({
      method: "GET",
      uri: `https://ttv.microworkers.com/api/v2/workers/${workerId}`,
      headers: {
        MicroworkersApiKey:
          "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
      }
    });

    worker = JSON.parse(worker);
    // console.log(worker);
    content += "Worker info: \n";
    content += `User name: ${worker.username}       City: ${worker.location.city}      Country: ${worker.location.country.name}\n`;
    content += "--------------------------------\n";

    for (let j = 0; j < apps.length; j++) {
      const { name: appName, time, response } = apps[j];

      content += `App name: ${appName} - Time: ${time} - Final: ${response}\n`;
    }
    console.log(
      moment.duration(_.sumBy(apps, "time"), "seconds").format("mm:ss"),
      _.sumBy(apps, "time")
    );
    content += `Comment: ${comment}\n`;
    content += `Total time: ${moment
      .duration(_.sumBy(apps, "time"), "seconds")
      .format("mm:ss")} minutes`;

    fs.writeFileSync(`./workers/${worker.id}`, content);
  }

  console.log("DONE");

  // let worker = await rq({
  //   method: "GET",
  //   uri:
  //     "https://ttv.microworkers.com/api/v2/basic-campaigns/ebb78f2dde35/tasks/38092333",
  //   headers: {
  //     MicroworkersApiKey:
  //       "0b699dd430dfdea18466d2ea36967022652f9bcb6114c5977066518e1ecd5314"
  //   }
  // });
}
