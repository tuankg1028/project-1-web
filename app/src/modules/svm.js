const csv = require("csvtojson");
const _ = require("lodash");
async function svmDemo() {
  const data = await csv({
    noheader: true,
    output: "csv",
  }).fromFile("/Users/a1234/individual/download-abc/apps_categories_Test2.csv");

  let [, ...rows] = data;
  rows = _.chunk(rows, 5);

  let trainingSet = rows.reduce((acc, chunk) => {
    return [...acc, ..._.chunk(chunk, 3)[0]];
  }, []);

  // rediction set
  let predictionSet = rows.reduce((acc, chunk) => {
    return [...acc, ..._.chunk(chunk, 3)[1]];
  }, []);
  predictionSet = predictionSet.map((item) => {
    item.splice(-1, 1);
    return item;
  });

  const { features, labels } = trainingSet.reduce(
    (acc, item) => {
      const label = item.splice(-1, 1)[0];

      item = item.map((item1) => {
        return Number(item1);
      });
      item.splice(0, 3);

      acc.features.push(item);
      acc.labels.push(Number(label));
      return acc;
    },
    { features: [], labels: [] }
  );
  console.log(labels);
  // ============ START SVM =============
  const SVM = await require("libsvm-js");
  const svm = new SVM({
    kernel: SVM.KERNEL_TYPES.RBF, // The type of kernel I want to use
    type: SVM.SVM_TYPES.C_SVC, // The type of SVM I want to run
    gamma: 1, // RBF kernel gamma parameter
    cost: 1, // C_SVC cost parameter
  });

  svm.train(features, labels); // train the model

  predictionSet.forEach((item) => {
    const predictedLabel = svm.predictOneProbability(item);
    console.log(predictedLabel);
  });
  // var svm = require("node-svm");

  // var clf = new svm.CSVC();
  // console.log(trainingSet.length);
  // clf
  //   .train([
  //     [[0, 0], 0],
  //     [[0, 1], 1],
  //     [[1, 0], 1],
  //     [[1, 1], 0],
  //   ])
  //   .done(function () {
  //     // predict things
  //     // xor.forEach(function (ex) {
  //     //   var prediction = clf.predictSync(ex[0]);
  //     //   console.log("%d XOR %d => %d", ex[0][0], ex[0][1], prediction);
  //     // });
  //   });
}
svmDemo();

async function bayerDemo() {
  var BayesClassifier = require("bayes-classifier");
  var classifier = new BayesClassifier();

  var positiveDocuments = [
    "I love tacos.",
    "Dude, that burrito was epic!",
    "Holy cow, these nachos are so good and tasty.",
    "I am drooling over the awesome bean and cheese quesadillas.",
  ];

  var negativeDocuments = [
    "Gross, worst taco ever.",
    "The buritos gave me horrible diarrhea.",
    "I'm going to puke if I eat another bad nacho.",
    "I'd rather die than eat those nasty enchiladas.",
  ];

  classifier.addDocuments(positiveDocuments, "positive");
  classifier.addDocuments(negativeDocuments, "negative");

  classifier.train();

  console.log(classifier.classify("I don't want to eat there again.")); // "negative"
  console.log(classifier.classify("The torta is epicly bad.")); // "negative"
  console.log(classifier.classify("The torta is tasty.")); // "positive"

  console.log(
    classifier.getClassifications("Burritos are the meaning of life.")
  );
}

// bayerDemo();
