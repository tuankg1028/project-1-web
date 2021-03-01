require("dotenv").config();
import "../configs/mongoose.config";
import Models from "../models";
import _ from "lodash";
import axios from "axios";
import cheerio from "cheerio";

const changeLanguageOfDesc = async () => {
  console.log("RUNNING: changeLanguageOfDesc");
  const apps = await Models.App.find({}).limit(1);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    console.log(1, app.appName);
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
  }
};

changeLanguageOfDesc();
