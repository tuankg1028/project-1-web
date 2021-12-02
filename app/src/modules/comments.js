require("dotenv").config();
import "../configs/mongoose.config";
import _ from 'lodash';
import Models from "../models";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
main()
async function main() {
    await genCSV("microworker")
    await genCSV("normal")
}

 async function genCSV (type) {
    const users = await Models.User.find({
        type
    })
    let answers = await Models.Answer.find({
        userId: {
            $in: _.map(users, "id")
        }
    });

    // for (let i = 0; i < allAnswers.length; i++) {
    //   const answer = allAnswers[i];
  
    //   const user = await Models.User.findById(answer.userId);
  
    //   if (user.type === type) answers.push(answer);
    // }
  
    const header = [
      {
        id: "stt",
        title: "STT"
      },
      {
        id: "email",
        title: "Email"
      },
      {
        id: "comment",
        title: "Comment"
      }
    ];
    let rows = [];
    let stt = 1
    for (let j = 0; j < answers.length; j++) {
      const answer = answers[j];
      let { questions, userId } = answer;
      const user = await Models.User.findById(userId);
  
      questions.forEach((question, i) => {
        const responses = question.responses;
        const indexComment = responses.findIndex(item => item.name === "comment");
  
        rows.push({
          stt: stt++,
          email: user.email,
          comment: responses[indexComment].value
        });
      });
    }
    // rows = _.orderBy(rows, "stt");
  
    const csvWriter = createCsvWriter({
      path: `comments (${type === "microworker" ? "microworker" : "expert"}).csv`,
      header: header
    });
    await csvWriter.writeRecords(rows);
    // eslint-disable-next-line no-console
    console.log("==== DONE Comment ====");
  };