const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
import "../configs/mongoose.config";
import Models from "../models";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import _ from "lodash";
import fs from "fs";
const file1 = async type => {
  let allAnswers = await Models.Answer.find();
  allAnswers = allAnswers.filter(item => item.questions.length === 26);

  const answers = [];
  for (let i = 0; i < allAnswers.length; i++) {
    const answer = allAnswers[i];

    const user = await Models.User.findById(answer.userId);

    if (user.type === type) answers.push(answer);
  }
  // file 1
  const header = [
    {
      id: "stt",
      title: "#"
    },
    {
      id: "result",
      title: "Result"
    }
  ];
  const result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];

    let { questions } = answer;
    questions = [
      answer.questions[13],
      answer.questions[17],
      answer.questions[21],
      answer.questions[25]
    ];
    questions.forEach((question, index) => {
      const responses = question.responses;

      const indexSatisfaction = responses.findIndex(
        item => item.name === "satisfaction"
      );

      result[index][responses[indexSatisfaction].value]++;
    });
  }

  const rows = [
    {
      stt: 1,
      result: `No: ${result[0][0]} - Yes: ${result[0][1]} - Maybe: ${result[0][2]}`
    },
    {
      stt: 2,
      result: `No: ${result[1][0]} - Yes: ${result[1][1]} - Maybe: ${result[1][2]}`
    },
    {
      stt: 3,
      result: `No: ${result[2][0]} - Yes: ${result[2][1]} - Maybe: ${result[2][2]}`
    },
    {
      stt: 4,
      result: `No: ${result[3][0]} - Yes: ${result[3][1]} - Maybe: ${result[3][2]}`
    }
  ];

  const csvWriter = createCsvWriter({
    path: `file-1 (${type === "microworker" ? "microworker" : "expert"}).csv`,
    header
  });
  await csvWriter.writeRecords(rows);
  // eslint-disable-next-line no-console
  console.log("==== DONE FILE 1 ====");
};

const file2 = async type => {
  let allAnswers = await Models.Answer.find();
  allAnswers = allAnswers.filter(item => item.questions.length === 26);

  const answers = [];
  for (let i = 0; i < allAnswers.length; i++) {
    const answer = allAnswers[i];

    const user = await Models.User.findById(answer.userId);

    if (user.type === type) answers.push(answer);
  }

  const header = [
    {
      id: "stt",
      title: "Approach Number"
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
  for (let j = 0; j < answers.length; j++) {
    const answer = answers[j];
    let { questions, userId } = answer;
    questions = [questions[13], questions[17], questions[21], questions[25]];
    const user = await Models.User.findById(userId);

    questions.forEach((question, i) => {
      const responses = question.responses;
      const indexComment = responses.findIndex(item => item.name === "comment");

      rows.push({
        stt: i + 1,
        email: user.email,
        comment: responses[indexComment].value
      });
    });
  }
  rows = _.orderBy(rows, "stt");

  const csvWriter = createCsvWriter({
    path: `file-2 (${type === "microworker" ? "microworker" : "expert"}).csv`,
    header: header
  });
  await csvWriter.writeRecords(rows);
  // eslint-disable-next-line no-console
  console.log("==== DONE FILE 2 ====");
};

const file3 = async type => {
  let allAnswers = await Models.Answer.find();
  allAnswers = allAnswers.filter(item => item.questions.length === 26);

  const answers = [];
  for (let i = 0; i < allAnswers.length; i++) {
    const answer = allAnswers[i];

    const user = await Models.User.findById(answer.userId);

    if (user.type === type) answers.push(answer);
  }

  // file
  const header = [
    {
      id: "email",
      title: "Email"
    },
    {
      id: "appNumber",
      title: "App number"
    },
    {
      id: "satisfiedLevel",
      title: "Satisfied level"
    },
    {
      id: "correctAnswer",
      title: "Correct Answer"
    },
    {
      id: "time",
      title: "Time"
    }
  ];
  const rows1 = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const user = await Models.User.findById(answer.userId);
    const questions = [
      answer.questions[10],
      answer.questions[11],
      answer.questions[12],
      answer.questions[13]
    ];

    questions.forEach(({ responses }, index) => {
      const indexInstall = responses.findIndex(item => item.name === "install");
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexOurPredict = responses.findIndex(
        item => item.name === "ourPrediction"
      );
      const indexTime = responses.findIndex(item => item.name === "time");
      rows1.push({
        email: user.email,
        appNumber: 11 + index,
        satisfiedLevel: responses[indexAgreePredict].value == 1 ? "Yes" : "No",
        correctAnswer:
          responses[indexAgreePredict].value == 1
            ? "-"
            : responses[indexInstall].value == 0
            ? "No"
            : responses[indexInstall].value == 1
            ? "Yes"
            : "Maybe",
        time: responses[indexTime].value
      });
    });
  }

  const csvWriter1 = createCsvWriter({
    path: `file-3-accuracy-approach-1 (${
      type === "microworker" ? "microworker" : "expert"
    }).csv`,
    header
  });
  await csvWriter1.writeRecords(rows1);

  //
  const rows2 = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const user = await Models.User.findById(answer.userId);
    const questions = [
      answer.questions[14],
      answer.questions[15],
      answer.questions[16],
      answer.questions[17]
    ];

    questions.forEach(({ responses }, index) => {
      const indexInstall = responses.findIndex(item => item.name === "install");
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexOurPredict = responses.findIndex(
        item => item.name === "ourPrediction"
      );
      const indexTime = responses.findIndex(item => item.name === "time");
      rows2.push({
        email: user.email,
        appNumber: 15 + index,
        satisfiedLevel: responses[indexAgreePredict].value == 1 ? "Yes" : "No",
        correctAnswer:
          responses[indexAgreePredict].value == 1
            ? "-"
            : responses[indexInstall].value == 0
            ? "No"
            : responses[indexInstall].value == 1
            ? "Yes"
            : "Maybe",
        time: responses[indexTime].value
      });
    });
  }

  const csvWriter2 = createCsvWriter({
    path: `file-3-accuracy-approach-2 (${
      type === "microworker" ? "microworker" : "expert"
    }).csv`,
    header
  });
  await csvWriter2.writeRecords(rows2);

  //
  const rows3 = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const user = await Models.User.findById(answer.userId);
    const questions = [
      answer.questions[18],
      answer.questions[19],
      answer.questions[20],
      answer.questions[21]
    ];

    questions.forEach(({ responses }, index) => {
      const indexInstall = responses.findIndex(item => item.name === "install");
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexOurPredict = responses.findIndex(
        item => item.name === "ourPrediction"
      );
      const indexTime = responses.findIndex(item => item.name === "time");
      rows3.push({
        email: user.email,
        appNumber: 19 + index,
        satisfiedLevel: responses[indexAgreePredict].value == 1 ? "Yes" : "No",
        correctAnswer:
          responses[indexAgreePredict].value == 1
            ? "-"
            : responses[indexInstall].value == 0
            ? "No"
            : responses[indexInstall].value == 1
            ? "Yes"
            : "Maybe",
        time: responses[indexTime].value
      });
    });
  }

  const csvWriter3 = createCsvWriter({
    path: `file-3-accuracy-approach-3 (${
      type === "microworker" ? "microworker" : "expert"
    }).csv`,
    header
  });
  await csvWriter3.writeRecords(rows3);

  //
  const rows4 = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const user = await Models.User.findById(answer.userId);
    const questions = [
      answer.questions[22],
      answer.questions[23],
      answer.questions[24],
      answer.questions[25]
    ];

    questions.forEach(({ responses }, index) => {
      const indexInstall = responses.findIndex(item => item.name === "install");
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexOurPredict = responses.findIndex(
        item => item.name === "ourPrediction"
      );
      const indexTime = responses.findIndex(item => item.name === "time");
      rows4.push({
        email: user.email,
        appNumber: 23 + index,
        satisfiedLevel: responses[indexAgreePredict].value == 1 ? "Yes" : "No",
        correctAnswer:
          responses[indexAgreePredict].value == 1
            ? "-"
            : responses[indexInstall].value == 0
            ? "No"
            : responses[indexInstall].value == 1
            ? "Yes"
            : "Maybe",
        time: responses[indexTime].value
      });
    });
  }

  const csvWriter4 = createCsvWriter({
    path: `file-3-accuracy-approach-4 (${
      type === "microworker" ? "microworker" : "expert"
    }).csv`,
    header
  });
  await csvWriter4.writeRecords(rows4);
  // eslint-disable-next-line no-console
  console.log("==== DONE FILE 3 ====");
};

const file4 = async type => {
  let allAnswers = await Models.Answer.find();
  allAnswers = allAnswers.filter(item => item.questions.length === 26);

  const answers = [];
  for (let i = 0; i < allAnswers.length; i++) {
    const answer = allAnswers[i];

    const user = await Models.User.findById(answer.userId);

    if (user.type === type) answers.push(answer);
  }

  let result1 = 0;
  let resultMaybe1 = 0;

  for (let j = 0; j < answers.length; j++) {
    const answer = answers[j];
    let { questions } = answer;
    questions = [questions[10], questions[11], questions[12], questions[13]];

    questions.forEach((question, i) => {
      const responses = question.responses;
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexInstall = responses.findIndex(item => item.name === "install");
      responses[indexAgreePredict].value == 0 &&
        responses[indexInstall].value == 2 &&
        resultMaybe1++;
      responses[indexAgreePredict].value == 1 && result1++;
    });
  }

  let result2 = 0;
  let resultMaybe2 = 0;
  for (let j = 0; j < answers.length; j++) {
    const answer = answers[j];
    let { questions } = answer;
    questions = [questions[14], questions[15], questions[16], questions[17]];

    questions.forEach((question, i) => {
      const responses = question.responses;
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexInstall = responses.findIndex(item => item.name === "install");
      responses[indexAgreePredict].value == 0 &&
        responses[indexInstall].value == 2 &&
        resultMaybe2++;

      responses[indexAgreePredict].value == 1 && result2++;
    });
  }

  let result3 = 0;
  let resultMaybe3 = 0;
  for (let j = 0; j < answers.length; j++) {
    const answer = answers[j];
    let { questions } = answer;
    questions = [questions[18], questions[19], questions[20], questions[21]];

    questions.forEach((question, i) => {
      const responses = question.responses;
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexInstall = responses.findIndex(item => item.name === "install");
      responses[indexAgreePredict].value == 0 &&
        responses[indexInstall].value == 2 &&
        resultMaybe3++;

      responses[indexAgreePredict].value == 1 && result3++;
    });
  }

  let result4 = 0;
  let resultMaybe4 = 0;
  for (let j = 0; j < answers.length; j++) {
    const answer = answers[j];
    let { questions } = answer;
    questions = [questions[22], questions[23], questions[24], questions[25]];

    questions.forEach((question, i) => {
      const responses = question.responses;
      const indexAgreePredict = responses.findIndex(
        item => item.name === "agreePredict"
      );
      const indexInstall = responses.findIndex(item => item.name === "install");
      responses[indexAgreePredict].value == 0 &&
        responses[indexInstall].value == 2 &&
        resultMaybe4++;

      responses[indexAgreePredict].value == 1 && result4++;
    });
  }

  const content = `
  Accuracy:
    Approach 1: ${Math.round((result1 / (answers.length * 4)) * 10000) / 100} 
    Approach 2: ${Math.round((result2 / (answers.length * 4)) * 10000) / 100} 
    Approach 3: ${Math.round((result3 / (answers.length * 4)) * 10000) / 100} 
    Approach 4: ${Math.round((result4 / (answers.length * 4)) * 10000) / 100}
  Satisfied level: 
    Approach 1: ${Math.round(
      ((result1 * 100 + resultMaybe1 * 50) / (answers.length * 4 * 100)) * 10000
    ) / 100} 
    Approach 2: ${Math.round(
      ((result2 * 100 + resultMaybe2 * 50) / (answers.length * 4 * 100)) * 10000
    ) / 100}  
    Approach 3: ${Math.round(
      ((result3 * 100 + resultMaybe3 * 50) / (answers.length * 4 * 100)) * 10000
    ) / 100}  
    Approach 4: ${Math.round(
      ((result4 * 100 + resultMaybe4 * 50) / (answers.length * 4 * 100)) * 10000
    ) / 100} 
  `;

  fs.writeFileSync(
    `file-4 (${type === "microworker" ? "microworker" : "expert"}).txt`,
    content,
    { encoding: "utf-8" }
  );
  // eslint-disable-next-line no-console
  console.log("==== DONE FILE 4 ====");
};

// File 1 xem có bao nhiều người chọn theo từng phương án (Yes, No, Maybe)
// File 2 chứa các comment của họ
const main = async () => {
  const types = ["normal", "microworker"];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];

    await file1(type);
    await file2(type);
    await file3(type);
    await file4(type);
  }
};
main();
