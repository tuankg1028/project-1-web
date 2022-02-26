require("dotenv").config();
// import "../configs/mongoose.config";
// import Models from "../models";
const Models = 1;
import _ from "lodash";
import { app } from "google-play-scraper";
import Helpers from "../helpers";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import fs from "fs";
import axios from "axios";
import cheerio from "cheerio";
var parse = require("fast-json-parse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
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
// getPermissionFromMainFestFile();
async function getPermissionFromMainFestFile() {
  const permissions = [];
  const response = await axios.get(
    "https://developer.android.com/reference/android/Manifest.permission"
  );
  const $ = cheerio.load(response.data);

  $("#constants td[width=100%]").each(function () {
    const permission = $(this).find("code").first().text();

    permissions.push(permission);
  });

  console.log(permissions);
}

const getVietTelNumber = async (phoneNumber) => {
  const response = await axios.get(`https://khosim.com/${phoneNumber}`);

  const $ = cheerio.load(response.data);

  const price = (
    $(".OIJeQ_price_l3YLB").text() || $(".tmJWs_price_WauoS").text()
  ).trim();

  console.log(1, phoneNumber, price);
  const isAvailable =
    price.trim() !== "Sim đã bán hoặc chưa được cập nhật" &&
    price.trim() !== "Sim chưa được cập nhật";

  if (!isAvailable) return;

  return {
    price,
  };
};

const randomPhoneNumber = (phoneNumber) => {
  const data = {
    1: [3, 4, 8, 9, 11],
    2: [1, 3, 9],
    3: [2, 3, 8, 33],
    4: [1, 2, 8],
    6: [1, 6, 8, 9],
    8: [3, 4, 6, 9],
    9: [1, 4, 6, 8],
  };

  const lastNum = phoneNumber[phoneNumber.length - 1];

  const nextNums = data[lastNum];

  const randomNum = _.sample(nextNums);

  if ((phoneNumber + randomNum).length > 10)
    phoneNumber = randomPhoneNumber(phoneNumber);
  else if ((phoneNumber + randomNum).length < 10)
    phoneNumber = randomPhoneNumber(phoneNumber + randomNum);
  else if ((phoneNumber + randomNum).length === 10)
    phoneNumber = phoneNumber + randomNum;

  return phoneNumber;
};

// genPhoneNumbersVietnamobile();
async function genPhoneNumbersVietnamobile() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "sdt",
      title: "So dien thoai",
    },
    {
      id: "tong",
      title: "Tong cua day so",
    },

    {
      id: "category",
      title: "Loai thue bao",
    },
    {
      id: "price",
      title: "Gia/Phi hoa mang",
    },
    {
      id: "commitTime",
      title: "Thoi gian cam ket",
    },
    {
      id: "commitPrice",
      title: "Cuoc cam ket",
    },
    {
      id: "status",
      title: "Tinh trang",
    },
    {
      id: "address",
      title: "Dia diem hoa",
    },
  ];

  const input = ["092"];

  // let result = [];

  // input.forEach((threeNumStart) => {
  //   for (let i = 0; i < 100; i++) {
  //     let phoneNumber = randomPhoneNumber(threeNumStart.toString());

  //     result.push(phoneNumber);
  //   }
  // });

  // result = _.uniq(result);

  let rows = JSON.parse(
    '[{"sdt":"0921413333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921898684","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923333384","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923214832","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923898384","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923383338","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923321119","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929894132","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921833333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929132132","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923333333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921423866","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929861113","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921118333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921333333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923838918","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921869111","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929898333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929842194","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923211133","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921118913","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923333338","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921914238","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929861842","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921842968","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929666111","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923323291","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929898329","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923213232","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923323333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921114238","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929869698","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929138483","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921913294","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929614189","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923842389","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929619183","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929413321","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923338333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929133323","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923233332","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921896694","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921333298","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921418968","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921111141","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921323214","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929486961","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923238948","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921868661","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921486619","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929683333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921842384","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921868614","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921333868","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923861113","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929661421","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929666142","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921338489","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923833383","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921948414","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921119691","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929489132","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921111183","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923332333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929898683","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921411148","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929413333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923294296","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929483332","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929611189","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921333332","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929668961","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921429868","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929841896","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923868486","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921333894","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921869483","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921423389","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921113332","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921113219","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929833333","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929429694","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929111113","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923332941","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0923333329","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921484218","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921913389","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929414869","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929186896","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929861919","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0921911194","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"},{"sdt":"0929683869","price":"60.000","commitTime":"36 Tháng","commitPrice":"\\n50.000 đ\\n-50%\\n100.000 đ"}]'
  );

  rows = rows.map((item, index) => {
    return {
      ...item,
      stt: index + 1,
      tong: _.sum(item.sdt.split("").map((num) => Number(num))),
      commitPrice: item.commitPrice.trim().split("\n")[0],
    };
  });

  // console.log(result);
  // return;
  //   abc()
  // async function abc(){
  //     const data = []
  //     for (let i = 0; i < array.length; i++) {
  //     const phoneNumber = array[i]

  //     const response = await $.post('https://shop.vietnamobile.com.vn/vn/so-dep', {patten: "0926314446"}).then((html => {
  //         if($(html).find('#list_msisdn').find("tbody tr").first().html()) {
  //             return {
  //                 price: $(html).find('#list_msisdn').find("tbody tr").first().find('td:eq(1)').text(),
  //                 commitTime: $(html).find('#list_msisdn').find("tbody tr").first().find('td:eq(2)').text(),
  //                 commitPrice: $(html).find('#list_msisdn').find("tbody tr").first().find('td:eq(3)').text()
  //             }
  //         }

  //     }))

  //         if(response) {
  //             data.push(
  //                 {sdt: phoneNumber,
  //                 ...response}
  //             )
  //         }
  // }
  //     console.log(1, data)
  // }

  const csvWriter = createCsvWriter({
    path: "./vietnamobile.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  console.log("DONE");
}
async function main444() {
  await genPhoneNumbersVietTel("vinaphone");
  await genPhoneNumbersVietTel("viettel");
  await genPhoneNumbersVietTel("mobiphone");
}
main444();

async function genPhoneNumbersVietTel(type) {
  console.log("RUNNING genPhoneNumbersVietTel");
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "sdt",
      title: "So dien thoai",
    },
    {
      id: "tong",
      title: "Tong cua day so",
    },

    {
      id: "category",
      title: "Loai thue bao",
    },
    {
      id: "price",
      title: "Gia/Phi hoa mang",
    },
    {
      id: "commitTime",
      title: "Thoi gian cam ket",
    },
    {
      id: "commitPrice",
      title: "Cuoc cam ket",
    },
    {
      id: "status",
      title: "Tinh trang",
    },
    {
      id: "address",
      title: "Dia diem hoa",
    },
  ];

  const inputs = {
    vinaphone: ["094", "091", "083", "084"],
    mobiphone: ["089"],
    viettel: ["098", "096", "086"],
  };
  const input = inputs[type]; // vina
  // const input = ["089"]; // mobi
  // const input = ["098", "096", "086"]; // Viettel
  let result = [];

  input.forEach((threeNumStart) => {
    for (let i = 0; i < 1000000; i++) {
      let phoneNumber = randomPhoneNumber(threeNumStart.toString());

      result.push(phoneNumber);
    }
  });

  result = _.uniq(result);
  let rows = [];

  let stt = 1;

  const chunks = _.chunk(result, 100);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`${i}/${chunks.length}`);
    await Promise.all(
      chunk.map((phoneNumber) => {
        return retry(
          getVietTelNumber(phoneNumber)
            .then((data) => {
              if (data) {
                rows.push({
                  stt: stt++,
                  sdt: phoneNumber,
                  tong: _.sum(phoneNumber.split("").map((num) => Number(num))),
                  ...data,
                });
              }
              return;
            })
            .catch(console.error)
        );
      })
    );
  }

  rows = rows.map((item, index) => {
    return {
      ...item,
      stt: index + 1,
    };
  });
  const csvWriterNo = createCsvWriter({
    path: `./${type}.csv`,
    header,
  });
  await csvWriterNo.writeRecords(rows);

  console.log("DONE");
}

const categoryGroups = {
  Beauty: ["Beauty", "Lifestyle"],
  Business: ["Business"],
  Education: ["Education", "Educational"],
  Entertainment: ["Entertainment", "Photography"],
  Finance: [
    "Finance",
    "Events",
    "Action",
    "Action & Adventure",
    "Adventure",
    "Arcade",
    "Art & Design",
    "Auto & Vehicles",
    "Board",
    "Books & Reference",
    "Brain Games",
    "Card",
    "Casino",
    "Casual",
    "Comics",
    "Creativity",
    "House & Home",
    "Libraries & Demo",
    "News & Magazines",
    "Parenting",
    "Pretend Play",
    "Productivity",
    "Puzzle",
    "Racing",
    "Role Playing",
    "Simulation",
    "Strategy",
    "Trivia",
    "Weather",
    "Word",
  ],
  "Food & Drink": ["Food & Drink"],
  "Health & Fitness": ["Health & Fitness"],
  "Maps & Navigation": ["Maps & Navigation"],
  Medical: ["Medical"],
  "Music & Audio": [
    "Music & Audio",
    "Video Players & Editors",
    "Music & Video",
    "Music",
  ],
  Shopping: ["Shopping"],
  Social: ["Social", "Dating", "Communication"],
  Sports: ["Sports"],
  Tools: ["Tools", "Personalization"],
  "Travel & Local": ["Travel & Local"],
};

function getCategoryNameBy(sub) {
  for (const categoyName in categoryGroups) {
    const subs = categoryGroups[categoyName];

    if (subs.includes(sub)) return categoyName;
  }

  return;
}
async function main() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "distance",
      title: "Distance",
    },
    {
      id: "risk",
      title: "riskLevel",
    },
  ];

  let apps = await Models.App.find({
    // $or: [{ supplier: "mobipurpose" }, { isExistedMobiPurpose: true }],
    // isCompleted: true,
    appName: {
      $in: [
        // Sports
        "football news - patriots",
        "australian hunter magazine",
        // Maps & Navigation
        "tc fuel consumption record",
        "taiwan mrt info - taipei、taoyuan、kaohsiung",
        // Medical
        "acupressure tips",
        "nighttime speaking clock",
        //  Health & Fitness
        "easy rise alarm clock",
        "sports supplements",
        // Travel & Local
        // "walkway navi - gps for walking",
        "beijing metro map",
        "google earth",
        // Entertainment
        "christmas cards",
        "sound view spectrum analyzer",
        // Finance
        "google news - daily headlines",
        "habit calendar : track habits",
        // Beauty
        "sweet macarons hd wallpapers",
        "kuchen rezepte kochbuch",
        // "feeling of color combination",
        // Education
        "brainwell mind & brain trainer",
        "origami flower instructions 3d",
        // Social
        "facebook",
        // "chat rooms - find friends",
        "my t-mobile - nederland",
        // Music & Audio
        "soul radio",
        "find that song",
        // Food & Drink
        "resep masakan",
        "tip calculator : split tip",
        // Shopping
        "brands for less",
        "house of fraser",
        // Business
        "real estate auctions listings  - gsa listings",
        "mobile inventory",
        // Tools
        "the ney is an end-blown flute sufi music wallpaper",
        "calcnote - notepad calculator",
      ],
    },
  });

  apps = apps.map((app) => ({
    // ...app,
    appName: app.appName,
    distance: app.distance,
    categoryName: getCategoryNameBy(app.categoryName),
    riskLevel: app.riskLevel,
  }));

  const appsByGroup = _.groupBy(apps, "categoryName");

  const rows = [];
  let stt = 1;
  for (const categoryName in appsByGroup) {
    const apps = appsByGroup[categoryName];

    apps.forEach((app) => {
      rows.push({
        stt: stt++,
        appName: app.appName,
        category: app.categoryName,
        distance: app.distance,
        risk: app.riskLevel,
      });
    });
  }

  const csvWriterNo = createCsvWriter({
    path: "./apps_categories(2-15).csv",
    header,
  });
  await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}

// main();
// main2();
async function main2() {
  const [app1, app2] = await Promise.all([
    Models.App.find({
      supplier: "mobipurpose",
      isCompleted: true,
      distance: {
        $exists: true,
      },
    }),
    Models.App.find({
      isExistedMobiPurpose: true,
      isCompleted: true,
      distance: {
        $exists: true,
      },
    }),
  ]);

  let apps = [...app1, ...app2].map((app) => ({
    // ...app,
    id: app.id,
    appName: app.appName,
    distance: app.distance,
    categoryName: getCategoryNameBy(app.categoryName),
  }));
  apps = _.uniqBy(apps, "appName");
  console.log(apps.length);
  const appsByGroup = _.groupBy(apps, "categoryName");

  for (const categoryName in appsByGroup) {
    const apps = appsByGroup[categoryName];
    const maxDistance = _.maxBy(apps, "distance").distance;
    const minDistance = _.minBy(apps, "distance").distance;

    const ranges = Array.from(
      {
        length: 5,
      },
      (_, index) => {
        const value = (maxDistance - minDistance) / 5;

        return [minDistance + index * value, minDistance + (index + 1) * value];
      }
    );

    console.log(1, categoryName, ranges);

    apps.forEach((app) => {
      const { distance } = app;

      // ranges.forEach((range, index) => {
      //   if (_.inRange(distance, ...range)) {
      //     Models.App.updateOne(
      //       {
      //         _id: app.id,
      //       },
      //       {
      //         $set: {
      //           riskLevel: index + 1,
      //         },
      //       },
      //       {}
      //     );
      //   }
      // });
    });
  }

  // const csvWriterNo = createCsvWriter({
  //   path: "./apps_categories(2-15).csv",
  //   header,
  // });
  // await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}

// main3()
async function main3() {
  // const appsInFile1 = [];
  // await new Promise((resolve, reject) => {
  //   var readline = require("linebyline"),
  //     rl = readline("/Users/xander/Downloads/data_collect_purpose.json");
  //   rl.on("line", function (line, lineCount, byteCount) {
  //     // do something with the line of text
  //     const app = JSON.parse(line);
  //     if(app) appsInFile1.push(app)
  //   })
  //     .on("error", function (e) {})
  //     .on("close", function (e) {
  //       resolve();
  //     });
  // });

  // const apps = await Models.App.find({
  //   isExistedMobiPurpose: true,
  //   isCompleted: true,
  //   nodes: { $exists: true }, //
  //   dataTypes: { $exists: true }, //
  // }).cache(10000);
  // const appIdCHPlays = _.map(apps, "appIdCHPlay")
  // console.log(appIdCHPlays)
  // let total = 0

  // appsInFile1.forEach(item => {
  //   if(_.includes(appIdCHPlays, item.app)) total++;
  // })
  // console.log(total)

  const keyValue = [];
  // ===========
  await new Promise((resolve, reject) => {
    var readline = require("linebyline"),
      rl = readline("/Users/xander/Downloads/data_collect_purpose.json");
    rl.on("line", function (line, lineCount, byteCount) {
      // do something with the line of text
      const app = JSON.parse(line);
      if (app && app.data) {
        for (const key in app.data) {
          const value = app.data[key];
          let valType = value.split("|");
          const valueOfKey = valType[0];

          valType.splice(0, 1);
          valType.splice(-1, 1);

          keyValue.push(`${key.trim()}: ${valueOfKey.trim()}`);
        }
      }
    })
      .on("error", function (e) {})
      .on("close", function (e) {
        resolve();
      });
  });

  console.log("not unique", keyValue.length);
  console.log("unique", _.uniq(keyValue).length);
}

// console.log(genFields(['field1', 'field2'], 2, [['field1'], ['field2']]))
function genFields(fields, num, existedFields) {
  if (!num || num <= 0) return;
  let result = [];

  for (let i = 0; i < 1000; i++) {
    result.push(_.sampleSize(fields, num));
  }

  result = result.map((item) => JSON.stringify(item.sort()));
  result = _.union(result);
  result = result.map((item) => parse(item).value);

  result = result.filter((item) => {
    let isExisted = false;

    existedFields.forEach((existedField) => {
      if (isExisted) return;

      let hasFields = true;
      existedField.forEach((fileName) => {
        if (!item.includes(fileName)) hasFields = false;
      });

      if (hasFields) isExisted = true;
    });

    return !isExisted;
  });
  return result;
}

const types = [
  "Afib ECG Readings",
  "Computed Temperature",
  "Daily Heart Rate Variability Summary",
  "Daily SpO2",
  "Feed Cheers",
  "Feed Comments",
  "Feed Posts",
  "Groups",
  "Heart Rate Variability Details",
  "Heart Rate Variability Histogram",
  "Profile",
  "Respiratory Rate Summary",
  "Stress Score",
  "Trackers",
  "Wrist Temperature",
  "altitude",
  "badge",
  "calories",
  "demographic_vo2_max",
  "distance",
  "estimated_oxygen_variation",
  "exercise",
  "games",
  "heart_rate",
  "height",
  "lightly_active_minutes",
  "menstrual_health_birth_control",
  "menstrual_health_cycles",
  "menstrual_health_settings",
  "menstrual_health_symptoms",
  "message_cheers",
  "mindfulness_eda_data_sessions",
  "mindfulness_goals",
  "moderately_active_minutes",
  "participations",
  "resting_heart_rate",
  "sedentary_minutes",
  "sleep",
  "steps",
  "swim_lengths_data",
  "time_in_heart_rate_zones",
  "trophy",
  "very_active_minutes",
  "water_logs",
];

// main4Eda()
async function main4Eda() {
  // const edaCount = await Models.EDA.find({
  //   type: "badge"
  // }).distinct('data.dateTime')
  // const eda = await Models.EDA.aggregate([
  //   {
  //     $match: {
  //       type: "estimated_oxygen_variation"
  //     }
  //   },
  //   { "$group": {
  //     "_id": {
  //         "user_id": "$user_id",
  //         "data": "$data.Infrared to Red Signal Ratio"
  //     },
  //     total:{$sum :1}
  //   }},

  //   {$sort:{total:-1}},

  //   {$group:{_id:'$_id.data', totalData: {$sum :1}}}
  // ])

  // const eda = await Models.EDA.find({type: 'badge', 'data.dateTime': '2021-07-11'})
  // console.log(eda)
  //   return

  //   console.log(edaCount)
  // const edaCount = await Models.EDA.find({
  //   "data.shareText": "I took 25,000 steps and earned the Classics badge! #Fitbit"
  // })
  // console.log("edaCount", edaCount)
  // return
  let riskFields = {};
  let promisses = [];
  const typeChunk = _.chunk(_.sampleSize(types, types.length), 10);
  for (const chunk of typeChunk) {
    console.log("type", chunk);
    // await retry(getEdaByGroup(type))
    // promisses.push()

    await Promise.all(chunk.map((type) => retry(getEdaByGroup(type))));
  }
  // await Promise.all(promisses)

  // let result = {};
  // for (const type in riskFields) {
  //   const elements = riskFields[type];

  //   elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames))
  //   const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length)

  //   result[type] = elementGroup
  // }

  // fs.writeFileSync('./eda.txt', JSON.stringify(result, null, 2), 'utf8')

  console.log("Done");
}

async function main4Survey() {
  let riskFields = {};
  let promisses = [];
  const typeChunk = _.chunk(_.sampleSize(types, types.length), 10);
  for (const chunk of typeChunk) {
    console.log("type", chunk);
    // await retry(getEdaByGroup(type))
    // promisses.push()

    await Promise.all(chunk.map((type) => retry(getEdaByGroup(type))));
  }

  console.log("Done");
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getEdaByGroupV2(type, riskFields, edasOfType) {
  console.log(`Running ${type}`);
  const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
    if (!uuidValidate(item[1])) acc.push(item[0]);
    return acc;
  }, []);

  if (!fields.length) return;

  const genedFields = genFields(fields, 1, []);

  if (!genedFields.length) return;

  const totalRows = edasOfType.length;

  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getEdaByGroupV2 ${k}/${genedFields.length}`);
    const fieldNames = genedFields[k];
    const fieldName = fieldNames[0];

    console.time("getUniqueValuesByUser");
    let count = 0;
    const uniqueValuesByUser = _.uniqWith(edasOfType, (obj1, obj2) => {
      console.log(`${++count}/${totalRows}`);
      return (
        obj1.user_id === obj2.user_id &&
        obj1.data[fieldName] === obj2.data[fieldName]
      );
    });
    console.timeEnd("getUniqueValuesByUser");

    console.time("getValuesOfField");
    const valuesOfField = _.map(uniqueValuesByUser, `data.${fieldName}`);
    console.timeEnd("getValuesOfField");

    let uniqueValue;
    Object.entries(_.countBy(valuesOfField)).forEach(
      ([value, numberOfOccurrences]) => {
        if (uniqueValue) return;
        if (numberOfOccurrences === 1) uniqueValue = value;
      }
    );

    if (!uniqueValue) continue;
    const uniqueEda = edasOfType.find(
      (item) => item.data[fieldName] == uniqueValue
    );

    riskFields[type].push({
      fieldNames,
      values: fieldNames
        .map((fieldName) => uniqueEda.data[fieldName])
        .join(" - "),
      id: uniqueEda.id,
    });
  }

  return;
}

async function getEdaByGroupV3(type, riskFields) {
  console.log(`Running ${type}`);

  const edaOfType = await Models.EDA.findOne({
    type,
  });

  const fields = Object.entries(edaOfType.data).reduce((acc, item) => {
    if (!uuidValidate(item[1])) acc.push(item[0]);
    return acc;
  }, []);

  if (!fields.length) return;

  const genedFields = genFields(fields, 1, []);

  if (!genedFields.length) return;

  for (let k = 0; k < genedFields.length; k++) {
    console.log(`getEdaByGroupV2 ${k}/${genedFields.length}`);
    const fieldNames = genedFields[k];
    const fieldName = fieldNames[0];

    const valuesCounted = await Models.EDA.aggregate([
      {
        $match: {
          type,
        },
      },
      {
        $group: {
          _id: {
            user_id: "$user_id",
            data: `$data.${fieldName}`,
          },
          total: { $sum: 1 },
        },
      },

      { $sort: { total: -1 } },

      { $group: { _id: "$_id.data", totalData: { $sum: 1 } } },
    ]).allowDiskUse(true);

    const uniqueValue = valuesCounted.find((item) => item.totalData == 1);
    if (!uniqueValue) continue;

    const eda = await Models.EDA.findOne({
      type,
      [`data.${fieldName}`]: uniqueValue._id,
    });

    riskFields[type].push({
      fieldNames,
      values: fieldNames.map((fieldName) => eda.data[fieldName]).join(" - "),
      id: eda.id,
    });
  }

  return;
}

async function getEdaByGroup(type) {
  if (fs.existsSync(`./eda/${type}.txt`)) return;

  let riskFields = {};
  riskFields[type] = [];

  if (fs.existsSync(`./eda/${type}.txt`)) return;

  await getEdaByGroupV3(type, riskFields);
  console.log("riskFields", JSON.stringify(riskFields, null, 2));

  const edasOfType = await Models.EDA.aggregate([
    {
      $match: {
        type,
      },
    },
  ]).allowDiskUse(true);

  // filter not uuid
  const fields = Object.entries(edasOfType[0].data).reduce((acc, item) => {
    if (!uuidValidate(item[1])) acc.push(item[0]);
    return acc;
  }, []);

  if (!fields.length) return;

  for (let i = 1; i <= fields.length; i++) {
    console.log(`Running ${i}/${fields.length} on ${type}`);
    // const riskFieldsExists = _.map(riskFields[type], 'fieldName')
    const existedFields = JSON.parse(
      JSON.stringify(_.map(riskFields[type], "fieldNames"))
    );
    const genedFields = genFields(fields, i, existedFields);

    if (!genedFields.length) continue;

    const existedFieldInTurn = [];
    const runnedIds = [];
    // const originalCompareEdas = [...edasOfType]
    for (let j = 0; j < edasOfType.length; j++) {
      const eda = edasOfType[j];
      runnedIds.push(eda.id);
      console.log(
        `Running ${j}/${edasOfType.length} on ${type}`,
        existedFieldInTurn,
        genedFields
      );
      if (existedFieldInTurn.length === genedFields.length) continue;

      // filterInPlace(originalCompareEdas, obj => obj.id !== eda.id)
      const comparedEdas = edasOfType.filter(
        (item) =>
          item.user_id !== eda.user_id && !_.includes(runnedIds, item.id)
      );

      for (let k = 0; k < genedFields.length; k++) {
        const fieldNames = genedFields[k];
        if (_.includes(existedFieldInTurn, fieldNames.join(","))) continue;

        let isRisk = true;
        for (let g = 0; g < comparedEdas.length; g++) {
          const comparedEda = comparedEdas[g];
          if (!isRisk) continue;

          let isEqual = true;
          for (let f = 0; f < fieldNames.length; f++) {
            const fieldName = fieldNames[f];
            if (!isEqual) continue;

            const value1 = eda.data[fieldName];
            const value2 = comparedEda.data[fieldName];

            if (value1 !== value2) {
              isEqual = false;
            }
          }
          if (isEqual) {
            isRisk = false;
            continue;
          }
        }

        // if this field is risk
        if (isRisk) {
          existedFieldInTurn.push(fieldNames.join(","));
          riskFields[type].push({
            fieldNames,
            values: fieldNames
              .map((fieldName) => eda.data[fieldName])
              .join(" - "),
            id: eda.id,
          });
        }
      }
    }
  }

  for (const type in riskFields) {
    const elements = riskFields[type];

    elements = _.uniqBy(elements, (item) => JSON.stringify(item.fieldNames));
    const elementGroup = _.groupBy(elements, (item) => item.fieldNames.length);

    fs.writeFileSync(
      `./eda/${type}.txt`,
      JSON.stringify(elementGroup, null, 2),
      "utf8"
    );
  }
  return;
}

const filterInPlace = (array, predicate) => {
  let end = 0;

  for (let i = 0; i < array.length; i++) {
    const obj = array[i];

    if (predicate(obj)) {
      array[end++] = obj;
    }
  }

  array.length = end;
};
// main5()
async function main5() {
  console.log("main5");
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const header = [
    {
      id: "stt",
      title: "STT",
    },
    {
      id: "user_id",
      title: "User Id",
    },
    {
      id: "num",
      title: "Number of questions",
    },
  ];

  const typeChunk = _.chunk(types, 4);
  for (const types of typeChunk) {
    await Promise.all(
      types.map(async (type) => {
        if (!fs.existsSync(`./eda/num-question-types/${type}.csv`)) {
          const edaInType = await Models.EDA.find({
            type,
          });
          console.log("queried");
          const edaGroupUser = _.groupBy(edaInType, "user_id");

          const rows = Object.entries(edaGroupUser).map((item, index) => {
            return {
              stt: index + 1,
              user_id: item[0],
              num: item[1].length,
            };
          });

          const csvWriter = createCsvWriter({
            path: `./eda/num-question-types/${type}.csv`,
            header: header,
          });
          await csvWriter.writeRecords(rows);
        }
      })
    );
  }

  console.log("Done");
}

// getAppCategory();
async function getAppCategory() {
  const apps = await Models.App.aggregate([
    {
      $group: {
        _id: {
          categoryName: "$categoryName",
        },
        total: { $sum: 1 },
      },
    },
  ]).allowDiskUse(true);

  const categoriesCount = apps.reduce((acc, item) => {
    const category = Object.entries(categoryGroups).find(
      ([_, subCategories]) => {
        if (!subCategories.includes(item._id.categoryName)) return false;

        return true;
      }
    );

    const categoryName = category[0];
    !acc[categoryName] && (acc[categoryName] = 0);

    acc[categoryName] += item.total;

    return acc;
  }, {});

  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "total",
      title: "Total",
    },
  ];

  const rows = [];
  let stt = 1;
  for (const categoryName in categoriesCount) {
    const total = categoriesCount[categoryName];

    rows.push({
      stt: stt++,
      category: categoryName,
      total,
    });
  }

  const csvWriterNo = createCsvWriter({
    path: "./apps_category_total.csv",
    header,
  });
  await csvWriterNo.writeRecords(rows);
  console.log("DONE");
}
