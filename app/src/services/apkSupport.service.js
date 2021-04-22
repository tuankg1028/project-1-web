require("dotenv").config();
import axios from "axios";
import cheerio from "cheerio";
import chalk from "chalk";
import fs from "fs";
import Helpers from "../helpers";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import path from "path";

const API = axios.create({
  baseURL: "https://apk.support/app",
  timeout: 20000,
});

const download = async (downloadLink, pathFile) => {
  try {
    if (!downloadLink) return null;
    return await new Promise(function (resolve, reject) {
      axios
        .get(downloadLink, {
          responseType: "stream",
        })
        .then((response) => {
          response.data.pipe(fs.createWriteStream(pathFile));

          response.data.on("end", () => {
            setTimeout(() => {
              console.log(chalk.green("Dowloaded APK file successfully"));

              resolve(true);
            }, 3000);
          });
        })
        .catch((err) => {
          resolve(null);
        });
    });
  } catch (err) {
    console.log(err.message);
    Helpers.Logger.error("ERROR: download APK");
    return null;
  }
};

const downloadLink = async (appId) => {
  try {
    const response = await axios.get(
      `https://apk.support/old-apk-from-google-play/${appId}/`
    );
    const $ = cheerio.load(response.data);
    const downloadLink = $(".browser_a").last().find("ul li a").attr("href");

    return downloadLink;
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: APKPURE getInfoApp");
  }
};

const getInfoAppLink = async (link) => {
  try {
    const response = await axios.get(`${link}`, {
      timeout: 50000,
    });
    const $ = cheerio.load(response.data);

    let category;
    $(".napkinfo").each(function (i, elem) {
      const type = $(this).find(".bnapkinfo").text();

      switch (type) {
        case "Category":
          category = $(this).find(".htlgb a").text();

          break;
      }
    });
    const appName = $(".apkinfo h1").text().replace("APK", "").trim();

    const description = $(".description .fullmtx").text();
    return {
      category,
      appName,
      description,
    };
  } catch (err) {
    throw Error(err);
  }
};
export default {
  download,
  getInfoAppLink,
  downloadLink,
};
