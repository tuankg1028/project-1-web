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
  baseURL: APK_PURE_API,
  timeout: 20000,
});

const seach = async (appName) => {
  try {
    const result = [];
    const response = await API.get(`/search?q=${encodeURI(appName)}`);
    const $ = cheerio.load(response.data);

    // for each hrefs
    $("#search-res")
      .find(".search-dl p a")
      .each(function (index, element) {
        result.push($(element).attr("href"));
      });

    console.log(chalk.green("APK PURE response: "), JSON.stringify(result));
    return result;
  } catch (err) {
    Helpers.Logger.info(err);
    Helpers.Logger.error(`ERROR: seach APK for ${appName} app`);
  }
};
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
const download = async (appName, appIdFromAPKPure, id, apkSourcePath) => {
  try {
    let pathFile = path.join(apkSourcePath, "/" + id + ".apk");
    // STEP 1: GET Link to download
    const response = await API.get(`${appIdFromAPKPure}/versions`);
    await sleep(3000);
    const $ = cheerio.load(response.data);
    let downloadLink;
    $(".ver-wrap li").each(function () {
      const type = $(this).find(".ver-item-t.ver-apk").text();

      switch (type) {
        case "APK":
          if (!downloadLink) {
            downloadLink = $(this).find("a").attr("href");
          }

          break;
      }
    });

    // get download link
    const downloadPageResponse = await API.get(downloadLink);
    await sleep(3000);
    const $DownloadLink = cheerio.load(downloadPageResponse.data);
    const downloadLinkTmp = $DownloadLink("#download_link").attr("href");

    // case table
    if (!downloadLinkTmp) {
      // go to list of download page (ex: https://apkpure.com/facebook/com.facebook.katana/variant/304.0.0.39.118-APK#variants)
      const downloadListResponse = await API.get(downloadLink);
      await sleep(3000);
      const $DownloadList = cheerio.load(downloadListResponse.data);
      const downloadPageLink = $DownloadList(".table .table-row")
        .last()
        .find(".down a")
        .attr("href");
      downloadLink = downloadPageLink;

      // get link on "click here" button
      const downloadPageResponse1 = await API.get(downloadLink);
      await sleep(3000);
      const $DownloadLink1 = cheerio.load(downloadPageResponse1.data);
      const downloadLinkTmp1 = $DownloadLink1("#download_link").attr("href");

      downloadLink = downloadLinkTmp1;
    } else {
      downloadLink = downloadLinkTmp;
    }

    if (!downloadLink) return null;

    // add https
    if (!downloadLink.includes("http")) {
      downloadLink = APK_PURE_API + downloadLink;
    }

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
    console.log(err.message);
    Helpers.Logger.error("ERROR: download APK");
    throw err;
  }
};

const getInfoApp = async (appId) => {
  try {
    const result = [];
    const response = await API.get(`${appId}`);

    const $ = cheerio.load(response.data);

    let CHPlayLink, AppId;
    $(".additional li").each(function (i, elem) {
      const type = $(this).find("strong").text();

      switch (type) {
        case "Available on:":
          CHPlayLink = $(this).find("a").first().attr("href");

          break;
      }
    });

    if (CHPlayLink) {
      var urlParts = url.parse(CHPlayLink, true);
      var query = urlParts.query;
      AppId = query.id;
    }

    return {
      CHPlayLink,
      AppId,
    };
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: APKPURE getInfoApp");
  }
};
export default {
  getInfoApp,
  seach,
  download,
};
