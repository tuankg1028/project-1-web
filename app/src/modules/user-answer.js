require("dotenv").config();
import "../configs/mongoose.config";
import _ from 'lodash';
import Models from "../models";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
main()
async function main() {
    await genCSV()
}

 async function genCSV (type) {
    const users = await Models.User.find({
        email: {
          $in: ["benthomasp99@gmail.com",
          "abediasghar7@gmail.com",
          "sasikuttan9933@gmail.com",
          "sanjuguha073@gmail.com",
          "shubhraguha7@gmail.com",
          "stamjayson@gmail.com",
          "mindyjones167@gmail.com",
          "mohdsaaed7189@gmail.com",
          "rosewangu957@gmail.com",
          "wanjikuf460@gmail.com",
          "brayoahaya2@gmail.com",
          "anandrocker321@gmail.com",
          "alextobias689@gmail.com"]
        }
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
        id: "question1",
        title: "Question 1"
      },
      {
        id: "question2",
        title: "Question 2"
      },
      {
        id: "question3",
        title: "Question 3"
      },
      {
        id: "question4",
        title: "Question 4"
      },
      {
        id: "question5",
        title: "Question 5"
      },
      {
        id: "question6",
        title: "Question 6"
      },
      {
        id: "question7",
        title: "Question 7"
      },
      {
        id: "question8",
        title: "Question 8"
      },
      {
        id: "question9",
        title: "Question 9"
      },
      {
        id: "question10",
        title: "Question 10"
      }
    ];
    let rows = [];
    let stt = 1
    for (let j = 0; j < answers.length; j++) {
      const answer = answers[j];
      let { questions, userId } = answer;
      const user = await Models.User.findById(userId);
      
      const row = {
        stt: stt++,
        email: user.email,
      }
      questions.forEach((question, i) => {
        const responses = question.responses;
        const indexComment = responses.findIndex(item => item.name === "final");
        
        let answerText = ""
        if(responses[indexComment].value == 1) answerText = "Very low"
        else if(responses[indexComment].value == 2) answerText = "Low"
        else if(responses[indexComment].value == 3) answerText = "Neutral"
        else if(responses[indexComment].value == 4) answerText = "Hight"
        else if(responses[indexComment].value == 5) answerText = "Very Hight"
        row[`question${i + 1}`] = answerText
      });

      rows.push(row)
    }
    // rows = _.orderBy(rows, "stt");
  
    const csvWriter = createCsvWriter({
      path: `user-answers(group 1).csv`,
      header: header
    });
    await csvWriter.writeRecords(rows);
    // eslint-disable-next-line no-console
    console.log("==== DONE User answers ====");
  };