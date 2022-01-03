import fs from "fs";
import path from "path";
import Helpers from "./";
const getContentOfFolder = async (dirPath, loop = 0) => {
  let contents = "";
  // // get java files
  let fileNames = fs.readdirSync(dirPath);
  let subFolders = Helpers.Folder.getDirectories(dirPath);
  // folder

  const bytesValue = contents.length
  let gbValue = (bytesValue / (1000 * 1000 * 1000)).toFixed(2);
  console.log(`Content size: ${gbValue} GB with ${loop}`)

  for (let i = 0; i < subFolders.length; i++) {
    const subFolder = subFolders[i];

    contents += await getContentOfFolder(dirPath + "/" + subFolder, loop + 1);
  }

  // file
  for (let j = 0; j < fileNames.length; j++) {
    const fileName = fileNames[j];
    const ext = path.extname(fileName);

    // if file is java
    if (ext === ".java") {
      contents += fs.readFileSync(dirPath + "/" + fileName, "utf8") + "\n";
    }
  }

  return contents;
};

const getFilesInFolderByPath = async (path, regex = "~") => {
  return fs
    .readdirSync(path, {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter((fileName) => {
      if (!regex) return true;
      const regex = new RegExp(regex, "g");

      return !fileName.match(regex);
    });
};
export default {
  getContentOfFolder,
  getFilesInFolderByPath,
};
