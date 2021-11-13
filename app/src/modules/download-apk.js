require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import Services from "../services";
import Helpers from "../helpers";

const apkSourcePath = "/Users/a1234/individual/abc/project-1-web/app/apks";
async function main() {
  Helpers.Logger.info("Running");
  const apps = await Models.App.find({
    supplier: "mobipurpose",
  }).limit(1);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const { appName, id } = app;
    console.log(`Running ${i}/${apps.length}`);
    try {
      Helpers.Logger.step("Step 1: Search apps from APK Pure");
      const listAppIdsFromAPKPure = await Services.APKPure.seach(appName);
      if (!listAppIdsFromAPKPure || !listAppIdsFromAPKPure.length)
        throw new Error("No app found from APK Pure");

      const appAPKPureId = listAppIdsFromAPKPure[0];
      await Models.App.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            appAPKPureId,
          },
        },
        {},
        (err, data) =>
          Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
      );
      Helpers.Logger.step("Step 2: Download apk");
      await Services.APKPure.download(appName, appAPKPureId, id, apkSourcePath);
    } catch (err) {
      Helpers.Logger.error(err.message);
    }
  }
}

main();
