require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import axios from "axios";
import cheerio from "cheerio";
import Helpers from "../helpers";

const changeLanguageOfDesc = async () => {
  console.log("RUNNING: changeLanguageOfDesc");
  const apps = await Models.App.find({});

  for (let i = 0; i < apps.length; i++) {
    try {
      const app = apps[i];
      if (!app.privacyLink) continue;

      const privacyPolicyResponse = await axios.get(app.privacyLink, {
        headers: {
          "Accept-Language": "en-US,en;q=0.5",
        },
      });
      const $Privacy = cheerio.load(privacyPolicyResponse.data);

      const contentPrivacyPolicy = $Privacy("body").text();

      await Models.App.updateOne(
        {
          _id: app.id,
        },
        {
          $set: {
            contentPrivacyPolicy,
          },
        },
        {},
        (err, data) =>
          Helpers.Logger.info(`Data saved: ${JSON.stringify(data, null, 2)}`)
      );
    } catch (err) {
      console.error(err);
    }
  }
};

changeLanguageOfDesc();
