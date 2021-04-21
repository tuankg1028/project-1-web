const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const apkFolders = [
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/benign500",
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid&KuafuDet_2082",
  // "/Users/a1234/individual/abc/project-1-web/app/sourceTemp",
];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const permissions = require("../../data/apktojava/System permissions.json");
const Helpers = require("../helpers");
const slug = require("slug");

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
      try {
        const outputPath = path.join(outputFolderPath, path.basename(apkFile));

        const jadxFolder = path.join(
          __dirname,
          "../../jadx/build/jadx/bin/jadx"
        );
        const apkFileFullPath = `${apkFolder}/${apkFile}`;
        execSync(`sh ${jadxFolder} -d "${outputPath}" "${apkFileFullPath}"`);
        // execSync(`jadx -d "${outputPath}" "${apkFileFullPath}"`);

        console.log(
          `DONE ${path.basename(apkFile)} in ${path.basename(apkFolder)} folder`
        );
      } catch (err) {
        console.log(err);
      }
    });
  }
}
// main();

async function main2() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    ...(permissions &&
      permissions.map((item) => ({ id: slug(item), title: item }))),
  ];
  const rows = [];

  let stt = 1;
  apkFolders.forEach((apkFolder) => {
    const outputFolderPath = path.join(
      path.dirname(apkFolder),
      "/JavaSources/",
      path.basename(apkFolder)
    );
    let apkFiles = fs.readdirSync(apkFolder);
    apkFiles = apkFiles.filter((filename) => filename.endsWith("apk"));
    apkFiles.forEach((apkFile) => {
      try {
        let row = {
          stt,
          appName: path.basename(apkFile),
        };
        stt++;
        const outputPath = path.join(outputFolderPath, path.basename(apkFile));
        let content = Helpers.default.File.getContentOfFolder(
          `${outputPath}/sources`
        );
        content = content.toLowerCase();
        // check perrmission exists in content
        permissions.forEach((permission) => {
          if (~content.indexOf(permission.toLowerCase())) {
            row[slug(permission)] = 1;
          } else {
            row[slug(permission)] = 0;
          }
        });

        rows.push(row);
      } catch (err) {
        console.log(err);
      }
    });
  });

  const csvWriter = createCsvWriter({
    path: "apps-permissions.csv",
    header,
  });
  await csvWriter.writeRecords(rows);
  console.log("==== DONE ====");
}

main2();
