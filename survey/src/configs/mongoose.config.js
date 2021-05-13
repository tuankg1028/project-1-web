const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
import mongoose from "mongoose";
import Utils from "../utils";
import MongooseCache from "mongoose-redis";

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    dbName: process.env.DB_DATABASE || '',
    auth: {
      user: process.env.MONGODB_USERNAME || '',
      password: process.env.MONGODB_PASSWORD || '',
    }
});

mongoose.connection.on("error", err => {
  console.log("Connect MONDGODB ERROR")
  Utils.Logger.error(err);
});

mongoose.set("debug", true);

MongooseCache(
  mongoose,
  `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
);
