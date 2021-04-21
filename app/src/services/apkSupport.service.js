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

const download = async (appName, appIdFromAPKPure, id) => {
  try {
    let pathFile = path.join(__dirname, "../../", "apkTemp/" + id + ".apk");
    // STEP 1: GET Link to download
    const response = await API.get(`${appIdFromAPKPure}/versions`);

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
    const $DownloadLink = cheerio.load(downloadPageResponse.data);
    const downloadLinkTmp = $DownloadLink("#download_link").attr("href");

    // case table
    if (!downloadLinkTmp) {
      // go to list of download page (ex: https://apkpure.com/facebook/com.facebook.katana/variant/304.0.0.39.118-APK#variants)
      const downloadListResponse = await API.get(downloadLink);
      const $DownloadList = cheerio.load(downloadListResponse.data);
      const downloadPageLink = $DownloadList(".table .table-row")
        .last()
        .find(".down a")
        .attr("href");
      downloadLink = downloadPageLink;

      // get link on "click here" button
      const downloadPageResponse1 = await API.get(downloadLink);
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

    let category;
    $(".napkinfo").each(function (i, elem) {
      const type = $(this).find(".bnapkinfo").text();

      switch (type) {
        case "Category":
          category = $(this).find(".htlgb a").text();

          break;
      }
    });
    const downloadLink = $(".godownbox").html();

    console.log(1, downloadLink);
    // if (CHPlayLink) {
    //   var urlParts = url.parse(CHPlayLink, true);
    //   var query = urlParts.query;
    //   AppId = query.id;
    // }

    return {
      category,
      downloadLink,
    };
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: APKPURE getInfoApp");
  }
};

const getInfoAppLink = async (link) => {
  try {
    const response = await axios.get(`${link}`, {
      timeout: 20000,
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
    return {
      category,
      appName,
    };
  } catch (err) {
    throw Error(err);
  }
};
export default {
  getInfoApp,
  download,
  getInfoAppLink,
};
