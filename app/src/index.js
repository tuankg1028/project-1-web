require("dotenv").config();
import express from "express";
import chalk from "chalk";
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

// init tree on database
// Helpers.Init.initTreeOnDB();

// init apps on database
// Helpers.Init.initAppsOnDB();

// init apps on database by csv
Helpers.Init.initAppsOnDBByCSV();

app.get("/", function (req, res) {
  res.render("pages/index");
});

// routes
app.use(routes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
  console.log("Server listening on: http://localhost:3333")
);
