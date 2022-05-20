require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import Helpers from "../helpers";

main();
async function main() {
  let apps = await Models.App.find({
    categoryName: "Business",
  }).limit(10);

  for (let i = 0; i < apps.length; i++) {
    try {
      const app = apps[i];

      const apkSourcePath = `/data/JavaCode/${app.id}`;
      console.log(apkSourcePath);
      const contents = await Helpers.File.getContentOfFolder(
        `${apkSourcePath}/sources`
      );

      if (contents) console.log("YES");
    } catch (err) {
      console.log("NO");
    }
  }
}
