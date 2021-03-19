require("dotenv").config();
import axios from "axios";
import cheerio from "cheerio";
import chalk from "chalk";
import fs from "fs";
import Helpers from "../helpers";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import path from "path";
const { APK_PURE_API } = process.env;

const API = axios.create({
  baseURL: "https://apkcombo.com",
  timeout: 60 * 1000 * 3,
  headers: {
    token:
      "03AGdBq24qnH-lqr2CxIAF0e-8j3KAlceN8MhocUQXO7kNloglvnYkYppf6maS4rlhQebm3UUmdxHQwwgqBcamZ9fD67NoXSg7ulrJ6APlmc09OtKn99qLGTpmrHeWSv80zJ_0SMC8DBDOA7L_kII0JScxXsu-YjqxThS45tGz1WaHwhwYqQ9_TgHQdFU2CJOQavWWIw7x4D8FYEqjCRY0i-q2y6FZV_bXYv0jzo-G2bV-eCYFvxsHe4PdcG75mTj4SxnydeFnu417ZDiHZaPd7IySgpx87oInUWSKjaa1UMgYw_0A2k_eRH2dyqtn8shPfWu30WZJl6c78_2CwVuvN_QCuC1Qtdj8N3UOb4T4PzlyzsO1LdjPftsAqGM7lzpfxatuDgJ1q-oq2HIXPxZbPlQWSdzYWGYbGTQd41tHWJAmLyLdFfRLImBRjt9oUC2JbbZjq0GQhU-PuMGj9Lkl4j-8XBYSgWo86g",
  },
});

const download = async (appIdCHPlay) => {
  try {
    let pathFile = path.join(
      __dirname,
      "../../",
      "apkTemp/" + uuidv4() + ".apk"
    );
    // STEP 1: GET Link to download
    const response = await API.get(
      `/vi-vn/apk-downloader/advance/?package_name=${appIdCHPlay}&device=&arches=&sdkInt=&lang=en&dpi=480&sa=1`
    );
    console.log(2);
    const $ = cheerio.load(response.data);

    const downloadLink = $(".download-item").find("a").attr("href");
    console.log(1, downloadLink);
    return;
    console.log(1, downloadLink, response);
    if (!downloadLink) return null;

    await new Promise(function (resolve, reject) {
      axios
        .get(downloadLink, {
          responseType: "stream",
        })
        .then((response) => {
          response.data.pipe(fs.createWriteStream(pathFile));

          response.data.on("end", () => {
            setTimeout(() => {
              console.log(
                chalk.green("Dowloaded file from APK Pure successfully")
              );

              resolve();
            }, 3000);
          });
        });
    });

    return pathFile;
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: download APK");
    throw err;
  }
};

export default {
  download,
};
