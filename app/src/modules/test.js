var api = require("gpapi").GooglePlayAPI({
  username: "lethanhtuan1028@gmail.com",
  password: "tuan01272311832",
  androidId: "498EB5EA1637E425",
  // apiUserAgent: optional API agent override (see below)
  // downloadUserAgent: optional download agent override (see below)
});

// usage via Promise
api.details("com.viber.voip").then(console.log);

// usage via node callback convention
api.details("com.viber.voip", function (err, res) {
  console.log(err ? err : res);
});
