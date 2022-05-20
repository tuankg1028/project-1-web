require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import Helpers from "../helpers";
const fs = require("fs");
const path = require("path");

main();
async function main() {
  let apps = await Models.App.find({
    categoryName: "Business",
    isCompleted: true,
  }).limit(10);

  for (let i = 0; i < apps.length; i++) {
    try {
      const app = apps[i];

      // const pathFileApk = _getApkFileFromSource(app.id, app.appName);
      // console.log(pathFileApk);
      // if (!pathFileApk) throw new Error("Cannot find apk file");
      // Helpers.Logger.step("Step 2: Parse APK to Text files by jadx");

      const apkSourcePath = `/data/JavaCode/${app.id}`;
      // if (!fs.existsSync(apkSourcePath)) execSync(`mkdir ${apkSourcePath}`);
      // const jadxScript = `sh ./jadx/build/jadx/bin/jadx -d "${apkSourcePath}" "${pathFileApk}"`;
      // console.log("jadxScript", jadxScript);
      // execSync(jadxScript, {
      //   timeout: 1000 * 60 * 5, // 5 mins
      // });

      console.log(apkSourcePath);
      const contents = await Helpers.File.getContentOfFolder(
        `${apkSourcePath}/sources`
      );

      if (contents) console.log("YES");
    } catch (err) {
      console.log(err);
      console.log("NO");
    }
  }
}

function ThroughDirectory(Directory, Files = []) {
  fs.readdirSync(Directory).forEach((File) => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory())
      return ThroughDirectory(Absolute, Files);
    else Files.push(Absolute);
  });

  return Files;
}

function _getApkFileFromSource(appId, appName) {
  let apkPath = "";
  const apkFilesInFolder1 = ThroughDirectory(
    "/data/apkfile/new_top_apps_Download"
  );
  const apkFilesInFolder2 = ThroughDirectory("/data/apkfile/top_apps_Download");
  const apkFilesInFolder3 = ThroughDirectory("/data/apkfile/mobipurpose-apks");
  const apkFilesInFolder4 = ThroughDirectory(
    "/home/son/apkfile/mobipurpose-apks"
  );

  const apkFiles = [
    ...apkFilesInFolder1,
    ...apkFilesInFolder2,
    ...apkFilesInFolder3,
    ...apkFilesInFolder4,
  ];

  // find in folder
  for (let i = 0; i < apkFiles.length; i++) {
    const apkFile = apkFiles[i];

    if (apkFile.includes(appId) || apkFile.includes(appName)) {
      apkPath = apkFile;
      break;
    }
  }
  return apkPath;
}
