var fs = require("fs"),
  xml2js = require("xml2js"),
  fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const slug = require("slug");
const _ = require("lodash");
const CoreNLP = require("corenlp");

const { Properties, Pipeline } = CoreNLP;

const props = new Properties({
  timeout: 60000 * 10,
  annotators: "tokenize,ssplit,pos,lemma,ner,parse",
});
const pipeline = new Pipeline(props, "English"); // uses ConnectorServer by default

const retry = async (promise, time = 20) => {
  let counter = 1;
  let status = false;
  let result;

  do {
    try {
      result = await promise;
      status = true;
    } catch (error) {
      result = error;
      counter++;
    }
  } while (!status && counter <= time);

  if (!status) throw result;

  return result;
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getMainVerbOfSentence(sentence) {
  let tempData = fs.readFileSync("./stanford-data.txt", "utf8");
  tempData = tempData && JSON.parse(tempData);

  tempResult = tempData && tempData.find((item) => item.sentence === sentence);
  if (tempResult) return tempResult;
  if (!tempData) tempData = [];

  const sent = new CoreNLP.default.simple.Sentence(sentence);
  return pipeline
    .annotate(sent)
    .then((sent) => {
      const result = sent.toJSON().basicDependencies;

      const mainVerb = result.find(
        (item) => item.dep === "ROOT"
      ).dependentGloss;

      const response = { mainVerb, result, sentence };
      tempData.push(response);

      fs.writeFileSync(
        "./stanford-data.txt",
        JSON.stringify(tempData, null, 2),
        { encoding: "utf8" }
      );
      return response;
    })
    .catch((err) => {
      console.log(err, sentence);
      throw err;
    });
}
main3();
async function main3() {
  const csv = require("csvtojson");
  // const axios = require("axios");
  // const cheerio = require("cheerio");
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "userName",
      title: "User Name",
    },
    {
      id: "comment",
      title: "Comment",
    },
    {
      id: "appName",
      title: "App Name",
    },
    {
      id: "rating",
      title: "Rating",
    },
    {
      id: "thumbsUp",
      title: "Thumbs Up",
    },
    {
      id: "label",
      title: "Label (Y/N)",
    },
    {
      id: "bayesian",
      title: "Bayesian",
    },
    {
      id: "logistic",
      title: "Logistic Regression",
    },
    {
      id: "mainVerb",
      title: "Main Verb",
    },
    {
      id: "stanford",
      title: "Stanford Response",
    },
  ];
  // const getMainVerbOfSentence = async (sentence) => {
  //   const res = await axios.post(
  //     "http://nlp.stanford.edu:8080/parser/index.jsp",
  //     {
  //       query: sentence,
  //     }
  //   );
  //   const $ = cheerio.load(res.data);
  //   let data = $("h3:contains(\"Universal dependencies\")")
  //     .first()
  //     .next()
  //     .text()
  //     .trim();
  //   data = data.split("\n");
  //   const rootItem = data.find((item) => item.substring(0, 4) === "root");
  //   const mainVerb = rootItem.split(",")[1].trim().split("-")[0];
  //   console.log(data, sentence);
  //   return { mainVerb, results: data };
  // };
  let csvInput = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/Downloads/TRAINING-TEST(50-50).csv");
  const [, ...rowsInputed] = csvInput;
  let rows = [];
  const chunks = _.chunk(rowsInputed, 1);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Running ${i}/${chunks.length}`);
    await Promise.all(
      chunk.map((rowInputed) => {
        return retry(
          getMainVerbOfSentence(rowInputed[2]).then(({ mainVerb, result }) => {
            rows.push({
              stt: rowInputed[0],
              userName: rowInputed[1],
              comment: rowInputed[2],
              appName: rowInputed[3],
              rating: rowInputed[4],
              thumbsUp: rowInputed[5],
              label: rowInputed[6],
              bayesian: rowInputed[7],
              logistic: rowInputed[8],
              mainVerb,
              stanford: JSON.stringify(result, null, 2),
            });
          })
        );
      })
    );
  }
  rows = _.sortBy(rows, "stt");
  const csvWriter = createCsvWriter({
    path: "./output/TRAINING-TEST(50-50)(main-verb).csv",
    header,
  });
  await csvWriter.writeRecords(rows);
  console.log("DONE");
}

// main2();
async function main2() {
  const EDAPATH =
    "/Users/a1234/individual/abc/Fitbit-Data-Anonymization/public/data/EDA";
  const SURVEYPATH =
    "/Users/a1234/individual/abc/Fitbit-Data-Anonymization/public/data/Survey";
  const SEMAPATH =
    "/Users/a1234/individual/abc/Fitbit-Data-Anonymization/public/data/Sema";

  let filesEDA = fs.readdirSync(EDAPATH);
  let filesSURVEY = fs.readdirSync(SURVEYPATH);
  let filesSEMA = fs.readdirSync(SEMAPATH);

  let header = [
    {
      id: "id",
      title: "ID",
    },
  ];
  const rows = [];
  const users = {
    EDA: [],
    survey: [],
    sema: [],
  };

  // FOR EDA
  filesEDA.forEach(function (file) {
    let content = fs.readFileSync(`${EDAPATH}/${file}`, "utf-8");
    content = JSON.parse(content);

    content.forEach((row) => {
      if (!users.EDA[row.id]) users.EDA[row.id] = {};
      row.types.forEach((type) => {
        if (!users.EDA[row.id][type.type]) users.EDA[row.id][type.type] = [];
        users.EDA[row.id][type.type].push({
          fieldNames: type.fieldNames,
          values: type.values,
        });
      });
    });
  });

  // FOR SURVEY
  filesSURVEY.forEach(function (file) {
    let content = fs.readFileSync(`${SURVEYPATH}/${file}`, "utf-8");
    content = JSON.parse(content);

    content.forEach((row) => {
      if (!users.survey[row.id]) users.survey[row.id] = {};
      row.types.forEach((type) => {
        if (!users.survey[row.id][type.type])
          users.survey[row.id][type.type] = [];
        users.survey[row.id][type.type].push({
          fieldNames: type.fieldNames,
          values: type.values,
        });
      });
    });
  });

  // FOR sema
  filesSEMA.forEach(function (file) {
    let content = fs.readFileSync(`${SEMAPATH}/${file}`, "utf-8");
    content = JSON.parse(content);

    content.forEach((row) => {
      if (!users.sema[row.id]) users.sema[row.id] = {};
      row.types.forEach((type) => {
        if (!users.sema[row.id]) users.sema[row.id] = [];
        users.sema[row.id].push({
          fieldNames: type.fieldNames,
          values: type.values,
        });
      });
    });
  });

  // FOR EDA
  for (const userId in users.EDA) {
    const types = users.EDA[userId];

    const contentCols = {};
    for (const typeName in types) {
      let rows = types[typeName];
      rows.forEach((row) => {
        if (
          row.values &&
          row.values !== "[object Object]" &&
          !row.values.includes("[")
        ) {
          if (!contentCols[`EDA-${typeName}-${row.fieldNames.join("+")}`])
            contentCols[`EDA-${typeName}-${row.fieldNames.join("+")}`] = "";

          contentCols[
            `EDA-${typeName}-${row.fieldNames.join("+")}`
          ] += `${row.values}\n`;
        }
      });
    }

    rows.push({
      id: userId,
      ...Object.entries(contentCols).reduce((acc, row) => {
        acc[slug(row[0])] = row[1];
        return acc;
      }, {}),
    });

    for (const columnName in contentCols) {
      const index = header.findIndex((item) => item.title === columnName);

      if (!~index) {
        header.push({
          id: slug(columnName),
          title: columnName,
        });
      }
    }
  }

  // FOR survey
  for (const userId in users.survey) {
    const types = users.survey[userId];

    const contentCols = {};
    for (const typeName in types) {
      let rows = types[typeName];
      rows.forEach((row) => {
        if (
          row.values &&
          row.values !== "[object Object]" &&
          !row.values.includes("[")
        ) {
          if (!contentCols[`Suvey-${typeName}-${row.fieldNames.join("+")}`])
            contentCols[`Suvey-${typeName}-${row.fieldNames.join("+")}`] = "";

          contentCols[
            `Survey-${typeName}-${row.fieldNames.join("+")}`
          ] += `${row.values}\n`;
        }
      });
    }

    rows.push({
      id: userId,
      ...Object.entries(contentCols).reduce((acc, row) => {
        acc[slug(row[0])] = row[1];
        return acc;
      }, {}),
    });

    for (const columnName in contentCols) {
      const index = header.findIndex((item) => item.title === columnName);

      if (!~index) {
        header.push({
          id: slug(columnName),
          title: columnName,
        });
      }
    }
  }

  // FOR sema
  for (const userId in users.sema) {
    const rowsItem = users.sema[userId];

    rowsItem.forEach((row) => {
      if (
        row.values &&
        row.values !== "[object Object]" &&
        !row.values.includes("[")
      ) {
        if (!contentCols[`sema-${row.fieldNames.join("+")}`])
          contentCols[`sema-${row.fieldNames.join("+")}`] = "";

        contentCols[`sema-${row.fieldNames.join("+")}`] += `${row.values}\n`;
      }
    });

    rows.push({
      id: userId,
      ...Object.entries(contentCols).reduce((acc, row) => {
        acc[slug(row[0])] = row[1];
        return acc;
      }, {}),
    });

    for (const columnName in contentCols) {
      const index = header.findIndex((item) => item.title === columnName);

      if (!~index) {
        header.push({
          id: slug(columnName),
          title: columnName,
        });
      }
    }
  }

  const csvWriter = createCsvWriter({
    path: "./fitbit-comments(unque value).csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE");
}

// main()
async function main() {
  var parser = new xml2js.Parser();
  var builder = new xml2js.Builder();

  console.time("timeToRun");
  fs.readFile("/Users/xander/Downloads" + "/input.xml", function (err, data) {
    parser.parseString(data, function (err, result) {
      // console.dir(result);
      // console.log('Done', result.mvnx.subject[0].segments[0].segment[0].points[0].point);

      encryptObject(result.mvnx.subject);
      var xml = builder.buildObject(result);
      fs.writeFileSync("./encrypt-object.xml", xml.toString());

      // decrypt

      fs.readFile("." + "/encrypt-object.xml", function (err, data) {
        parser.parseString(data, function (err, resultEncrypted) {
          decryptObject(resultEncrypted.mvnx.subject);
          var decryptXml = builder.buildObject(resultEncrypted);
          fs.writeFileSync("./decrypt-object.xml", decryptXml.toString());

          console.timeEnd("timeToRun");
          console.log("DONE");
        });
      });
    });
  });
}

function decryptObject(data) {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const value = data[i];

      if (typeof value === "string") {
        try {
          decrypt(value);
          data[i] = decrypt(value);
        } catch (e) {}
      } else {
        decryptObject(value);
      }
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      const value = data[key];
      decryptObject(value);
    }
  }
}

function encryptObject(data) {
  let pattern = /^([0-9-. ]*)$/;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const value = data[i];

      if (value && typeof value === "string" && !!value.match(pattern)) {
        data[i] = encrypt(value);
      } else {
        encryptObject(value);
      }
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      const value = data[key];
      encryptObject(value);
    }
  }
}

const crypto = require("crypto");
const ENC_KEY = "bf3c199c2470cb477d907b1e0917c17b"; // set random encryption key
const IV = "5183666c72eec9e4"; // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');

var encrypt = (val) => {
  let cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, IV);
  let encrypted = cipher.update(val, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

var decrypt = (encrypted) => {
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  return decrypted + decipher.final("utf8");
};
