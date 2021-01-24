require("dotenv").config();
import axios from "axios";
import cheerio from "cheerio";
import Helpers from "../helpers";
import chalk from "chalk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const { CH_PLAY_API } = process.env;
const INFO_TYPES = {
  UPDATED: "Updated",
  SIZE: "Size",
  INSTALLS: "Installs",
  CURRENT_VERSION: "Current Version",
  DEVELOPER: "Developer",
};
const API = axios.create({
  baseURL: CH_PLAY_API,
  timeout: 20000,
});

const getInfoApp = async (appId) => {
  try {
    const result = [];
    const response = await API.get(`store/apps/details?id=${appId}&hl=en`);
    const $ = cheerio.load(response.data);

    const developer = $(".qQKdcc").first().find(".T32cc").first().text();
    const categoryName = $(".qQKdcc").first().find(".T32cc").last().text();

    let updatedDate, currentVersion, size, installs, privacyLink;
    $(".hAyfc").each(function (i, elem) {
      const type = $(this).find(".BgcNfc").text();

      switch (type) {
        case INFO_TYPES.UPDATED:
          updatedDate = $(this).find(".htlgb").first().text();
          break;
        case INFO_TYPES.CURRENT_VERSION:
          currentVersion = $(this).find(".htlgb").first().text();
          break;
        case INFO_TYPES.SIZE:
          size = $(this).find(".htlgb").first().text();
          break;
        case INFO_TYPES.INSTALLS:
          installs = $(this).find(".htlgb").first().text();
          break;
        case INFO_TYPES.DEVELOPER:
          $(this)
            .find(".htlgb a")
            .each(function (j, devE) {
              const devType = $(devE).text();

              if (devType === "Privacy Policy")
                privacyLink = $(devE).attr("href");
            });
          break;
      }
    });

    return {
      developer,
      categoryName,
      updatedDate,
      currentVersion,
      size,
      installs,
      privacyLink,
    };
  } catch (err) {
    Helpers.Logger.info(err);
    Helpers.Logger.error("ERROR: getInfoApp");
  }
};

export default {
  getInfoApp,
};
