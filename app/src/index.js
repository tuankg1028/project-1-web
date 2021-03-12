require("dotenv").config();
import express from "express";
import morgan from "morgan";
import path from "path";
import bodyParser from "body-parser";
import routes from "./routes";
import Helpers from "./helpers";
import "./configs/mongoose.config";
const app = express();

app.use(morgan("tiny"));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "../public")));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

async function initData() {
  // init tree on database
  // await Helpers.Init.initTreeOnDB();
  // init apps on database
  // Helpers.Init.initAppsOnDB();
  // init apps on database by csv
  // await Helpers.Init.initAppsOnDBByCSV();
  // init apps on database (36k)
  await Helpers.Init.initAppsOnDB36K();
}
initData();

app.get("/", function (req, res) {
  res.render("pages/index");
});

// routes
app.use(routes);

// const PORT = process.env.PORT || 3333;
// app.listen(PORT, () =>
//   Helpers.Logger.info("Server listening on: http://localhost:3333")
// );
