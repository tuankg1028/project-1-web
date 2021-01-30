require("dotenv").config();
import axios from "axios";
import cheerio from "cheerio";
import chalk from "chalk";
import fs from "fs";
import Helpers from "../helpers";
import { v4 as uuidv4 } from "uuid";
import url from "url";

const { APK_PURE_API } = process.env;

const API = axios.create({
  baseURL: APK_PURE_API,
  timeout: 20000,
});

const seach = async (appName) => {
  try {
    const result = [];
    const response = await API.get(`/search?q=${appName}`);
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
    Helpers.Logger.error("ERROR: seach APK");
  }
};

const download = async (appName, appIdFromAPKPure) => {
  try {
    const path = "./apkTemp/" + appName + "-" + uuidv4() + ".apk";
    const response = await API.get(`${appIdFromAPKPure}/download?from=details`);

    // get download link
    const $ = cheerio.load(response.data);
    const downloadLink = $("#download_link").attr("href");

    // apk file
    await API.get(downloadLink, {
      responseType: "stream",
    })
      .then((response) => {
        return new Promise((resolve, reject) => {
          response.data.pipe(fs.createWriteStream(path));

          response.data.on("end", resolve);
        });
      })
      .then(() => {
        console.log(chalk.green("Dowloaded file from APK Pure successfully"));
      });

    return path;
  } catch (err) {
    console.log(err);
    Helpers.Logger.error("ERROR: download APK");
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
