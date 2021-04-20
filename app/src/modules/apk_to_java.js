const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const apkFolders = [
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/benign500",
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid&KuafuDet_2082",
];
async function main() {
  // execSync(
  //   `sh ./jadx/build/jadx/bin/jadx -d "${apkSourcePath}" "${pathFileApk}"`
  // );
  for (let i = 0; i < apkFolders.length; i++) {
    const apkFolder = apkFolders[i];

    const outputFolderPath = path.join(
      path.dirname(apkFolder),
      "/JavaSources/",
      path.basename(apkFolder)
    );
    try {
      execSync(`mkdir ${path.dirname(outputFolderPath)}`);
    } catch (e) {
      console.log(e.message);
    }
    try {
      execSync(`mkdir ${outputFolderPath}`);
    } catch (e) {
      console.log(e.message);
    }

    let apkFiles = fs.readdirSync(apkFolder);
    apkFiles = apkFiles.filter((filename) => filename.endsWith("apk"));

    apkFiles.forEach((apkFile) => {
      const outputPath = path.join(outputFolderPath, path.basename(apkFile));

      const jadxFolder = path.join(__dirname, "../../jadx/build/jadx/bin/jadx");
      const apkFileFullPath = `${path.dirname(apkFolder)}/${apkFile}`;
      execSync(`sh ${jadxFolder} -d "${outputPath}" "${apkFileFullPath}"`);
      console.log(
        `DONE ${path.basename(apkFile)} in ${path.basename(apkFolder)} folder`
      );
    });
  }
}

main();
