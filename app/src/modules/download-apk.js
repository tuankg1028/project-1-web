require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import Services from "../services";
import Helpers from "../helpers";

const apkSourcePath = "/data/apkfile/mobipurpose-apks";
async function main() {
  Helpers.Logger.info("Running");
  const apps = await Models.App.find({
    supplier: "mobipurpose",
    appAPKPureId: { $exists: false },
  });

  for (let i = 0; i < apps.length; i++) {
    await sleep(5000);
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

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
main();
