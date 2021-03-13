import express from "express";
import chalk from "chalk";
import Services from "./services";
import morgan from "morgan";

const app = express();

app.use(morgan("tiny"));

app.get("/", function (req, res) {
  res.send("Hello World from server");
});

app.post("/", async function (req, res) {
  console.log(chalk.green("Recieved data from edge"));

  await Services.EdgeServer.sendData({ message: "Hello Edge" });
  res.end();
});

app.listen(8000);
