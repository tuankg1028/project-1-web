const path = require("path");
const chalk = require("chalk");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
import "../configs/mongoose.config";
import Models from "../models";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import _ from "lodash";
function getRegionByCampaignId(campaignId) {
  const regions = {
    "0d3a745340d0": "Europe East",
    "99cf426fa790": "Latin America",
    "7cfcb3709b44": "Europe West",
    "4d74caeee538": "Asia - Africa",
    e0a4b9cf46eb: "USA - Western"
  };
  return regions[campaignId];
}

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

const file4ByRegion = async campaignId => {
  let allAnswers = await Models.Answer.find();
  allAnswers = allAnswers.filter(item => item.questions.length === 26);

  const answers = [],
    users = [];
  for (let i = 0; i < allAnswers.length; i++) {
    const answer = allAnswers[i];

    const user = await Models.User.findById(answer.userId);

    if (user.type === "microworker" && user.campaignId === campaignId) {
      answers.push(answer);
      users.push(user);
    }
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

  let content = `
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
    ) / 100} \n
  `;

  // stats gender, country, ...
  const result = { ages: {}, countries: {}, genders: {}, regions: {} };
  users.forEach(({ age, country, gender, campaignId }) => {
    result.ages[age] ? result.ages[age]++ : (result.ages[age] = 1);
    result.countries[country.trim()]
      ? result.countries[country.trim()]++
      : (result.countries[country.trim()] = 1);

    result.genders[gender]
      ? result.genders[gender]++
      : (result.genders[gender] = 1);

    result.countries[country.trim()]
      ? result.countries[country.trim()]++
      : (result.countries[country.trim()] = 1);

    const region = getRegionByCampaignId(campaignId);
    result.regions[region]
      ? result.regions[region]++
      : (result.regions[region] = 1);
  });

  content += `
    * Ages: 
        - [0;20]: ${result.ages["[0;20]"]} (${(
    (result.ages["[0;20]"] / users.length) *
    100
  ).toFixed(2)}%)

        - [20;30]: ${result.ages["[20;30]"]} (${(
    (result.ages["[20;30]"] / users.length) *
    100
  ).toFixed(2)}%)

        - [30;40]: ${result.ages["[30;40]"]} (${(
    (result.ages["[30;40]"] / users.length) *
    100
  ).toFixed(2)}%)
            
        - [>40]: ${result.ages[">40"]} (${(
    (result.ages[">40"] / users.length) *
    100
  ).toFixed(2)}%)

    * Genders: 
        - Male: ${result.genders["male"]} (${(
    (result.genders["male"] / users.length) *
    100
  ).toFixed(2)}%)

        - Female: ${result.genders["female"]} (${(
    (result.genders["female"] / users.length) *
    100
  ).toFixed(2)}%)
  `;

  // sort country by name
  content += "\n    * Countries: \n";
  _.sortBy(Object.entries(result.countries), [
    function(o) {
      return o[0];
    }
  ]).forEach(([country, value]) => {
    content += `        - ${country}: ${value} (${(
      (value / users.length) *
      100
    ).toFixed(2)}%) \n`;
  });

  // region
  if (!_.isEmpty(result.regions)) {
    content += "\n    * Regions: \n";
    for (const region in result.regions) {
      const value = result.regions[region];

      content += `        - ${region}: ${value} (${(
        (value / users.length) *
        100
      ).toFixed(2)}%) \n`;
    }
  }

  fs.writeFileSync(
    `./reports/file-4 (microworker-${getRegionByCampaignId(campaignId)}).txt`,
    content,
    {
      encoding: "utf-8"
    }
  );
  // eslint-disable-next-line no-console
  console.log("==== DONE FILE 4 ====");
};

async function usersPaid() {
  const header = [
    {
      id: "stt",
      title: "#"
    },
    {
      id: "workerId",
      title: "Worker ID"
    },
    {
      id: "email",
      title: "Email"
    },
    {
      id: "gender",
      title: "Gender"
    },
    {
      id: "region",
      title: "Region"
    },
    {
      id: "country",
      title: "Country"
    },
    {
      id: "isPaid",
      title: "Paid"
    },
    {
      id: "numberOfQuestions",
      title: "Number of questions the user did"
    }
  ];
  let rows = [];
  const users = await Models.User.find({
    type: "microworker"
  });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const answer = await Models.Answer.findOne({
      userId: user.id
    });

    // numberOfQuestions
    let numberOfQuestions = 0;
    if (answer && answer.questions) {
      numberOfQuestions = answer.questions.length;
    }
    rows.push({
      stt: i + 1,
      workerId: user.workerId,
      email: user.email,
      gender: user.gender,
      region: getRegionByCampaignId(user.campaignId),
      country: user.country,
      isPaid: user.isPaid ? "YES" : "NO",
      numberOfQuestions
    });
  }

  rows = _.sortBy(rows, ["isPaid"], ["desc"]);
  const csvWriter = createCsvWriter({
    path: "./reports/users-paid.csv",
    header
  });
  await csvWriter.writeRecords(rows);
}

async function confusionMaxtrix() {
  const header = [
    {
      id: "name",
      title: ""
    },
    {
      id: "predictY",
      title: "Predicted value: YES"
    },
    {
      id: "predictN",
      title: "Predicted value: NO"
    },
    {
      id: "predictM",
      title: "Predicted value: MAYBE"
    }
  ];

  const matrix = {
    expert: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    paid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    unpaid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  };
  const answers = await Models.Answer.find();
  for (let i = 0; i < answers.length; i++) {
    const { questions, userId } = answers[i];
    const user = await Models.User.findById(userId);
    if (!user || questions.length <= 10) continue;
    // userType
    const userType =
      user.type === "normal" ? "expert" : user.isPaid ? "paid" : "unpaid";

    for (let j = 11; j < questions.length; j++) {
      const question = questions[j];
      // agreePredict
      let agreePredict = question.responses.find(
        item => item.name === "agreePredict"
      );
      agreePredict = Number(
        agreePredict.value.replace("[", "").replace("]", "")
      );

      // ourPrediction
      let ourPrediction = question.responses.find(
        item => item.name === "ourPrediction"
      );
      ourPrediction = Number(
        ourPrediction.value.replace("[", "").replace("]", "")
      );

      if (agreePredict) {
        matrix[userType][ourPrediction][ourPrediction]++;
      } else {
        //install
        let install = question.responses.find(item => item.name === "install");
        install = Number(install.value.replace("[", "").replace("]", ""));

        matrix[userType][install][ourPrediction]++;
      }
    }
  }

  const rowsForExpert = [
    {
      name: "Actual value: Yes",
      predictY: matrix["expert"][1][1],
      predictN: matrix["expert"][1][0],
      predictM: matrix["expert"][1][2]
    },
    {
      name: "Actual value: No",
      predictY: matrix["expert"][0][1],
      predictN: matrix["expert"][0][0],
      predictM: matrix["expert"][0][2]
    },
    {
      name: "Actual value: Maybe",
      predictY: matrix["expert"][2][1],
      predictN: matrix["expert"][2][0],
      predictM: matrix["expert"][2][2]
    }
  ];

  const rowsForPaid = [
    {
      name: "Actual value: Yes",
      predictY: matrix["paid"][1][1],
      predictN: matrix["paid"][1][0],
      predictM: matrix["paid"][1][2]
    },
    {
      name: "Actual value: No",
      predictY: matrix["paid"][0][1],
      predictN: matrix["paid"][0][0],
      predictM: matrix["paid"][0][2]
    },
    {
      name: "Actual value: Maybe",
      predictY: matrix["paid"][2][1],
      predictN: matrix["paid"][2][0],
      predictM: matrix["paid"][2][2]
    }
  ];

  const rowsForUnPaid = [
    {
      name: "Actual value: Yes",
      predictY: matrix["unpaid"][1][1],
      predictN: matrix["unpaid"][1][0],
      predictM: matrix["unpaid"][1][2]
    },
    {
      name: "Actual value: No",
      predictY: matrix["unpaid"][0][1],
      predictN: matrix["unpaid"][0][0],
      predictM: matrix["unpaid"][0][2]
    },
    {
      name: "Actual value: Maybe",
      predictY: matrix["unpaid"][2][1],
      predictN: matrix["unpaid"][2][0],
      predictM: matrix["unpaid"][2][2]
    }
  ];
  const csvWriterExpert = createCsvWriter({
    path: "./reports/confusion matrix/expert.csv",
    header
  });
  await csvWriterExpert.writeRecords(rowsForExpert);

  // paid
  const csvWriterPaid = createCsvWriter({
    path: "./reports/confusion matrix/microworker-paid.csv",
    header
  });
  await csvWriterPaid.writeRecords(rowsForPaid);

  // unpaid
  const csvWriterUnPaid = createCsvWriter({
    path: "./reports/confusion matrix/microworker-unpaid.csv",
    header
  });
  await csvWriterUnPaid.writeRecords(rowsForUnPaid);
}
// File 1 xem có bao nhiều người chọn theo từng phương án (Yes, No, Maybe)
// File 2 chứa các comment của họ
const main = async () => {
  const types = ["normal", "microworker"];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];

    await Promise.all([file1(type), file2(type), file3(type), file4(type)]);
  }

  const regions = {
    "0d3a745340d0": "Europe East",
    "99cf426fa790": "Latin America",
    "7cfcb3709b44": "Europe West",
    "4d74caeee538": "Asia - Africa",
    e0a4b9cf46eb: "USA - Western"
  };

  for (const campaignId in regions) {
    await file4ByRegion(campaignId);
  }

  await usersPaid();
  await confusionMaxtrix();
  console.log(chalk.default.bgGreen.black("==== DONE ===="));
};
main();
