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
    const appName = $(".AHFaub")
      .first()
      .find("span")
      .last()
      .text()
      .toLowerCase();
    const description = $("meta[itemprop='description']")
      .first()
      .attr("content")
      .replace(/\n/g, "<br>");

    let updatedDate,
      currentVersion,
      size,
      installs,
      privacyLink,
      contentPrivacyPolicy;
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

    // get content of privacy policy
    if (privacyLink) {
      try {
        const privacyPolicyResponse = await axios.get(privacyLink);
        const $Privacy = cheerio.load(privacyPolicyResponse.data);

        contentPrivacyPolicy = $Privacy("body").text();
      } catch (err) {
        Helpers.Logger.error(err.message);
        Helpers.Logger.error("ERROR: Get content privacy policy");
      }
    }

    return {
      developer,
      categoryName,
      updatedDate,
      currentVersion,
      size,
      installs,
      privacyLink,
      appName,
      description,
      contentPrivacyPolicy,
    };
  } catch (err) {
    // console.log(err);
    Helpers.Logger.error("ERROR: getInfoApp");
  }
};

export default {
  getInfoApp,
};
