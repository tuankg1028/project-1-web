import express from "express";
import Services from "./services";
import morgan from "morgan";
const app = express();

app.use(morgan("tiny"));

app.get("/", function (req, res) {
  res.send("Hello World from edge");
});

app.post("/", function (req, res) {
  console.log(chalk.green("Recieved data from cloud"));
  res.send("Hello World from server");
});

setInterval(() => {
  console.log("Edge sending data to cloud");
  Services.Server.sendData({ message: "Hello Cloud" });
}, 1000);
app.listen(8000);
