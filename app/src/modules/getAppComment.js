require("dotenv").config();
import "../configs/mongoose.config";
import axios from "axios";
const fs = require("fs");
const path = require("path");
var parseString = require('xml2js').parseString;
const _ = require("lodash");
import Models from "../models";
import Helpers from "../helpers";
const { execSync } = require("child_process");
var gplay = require('google-play-scraper');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
const isEnglish = require("is-english");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

main()
async function main() {
    // getCommentFromCHplay()
    // statCommentsByApps()
    // statCommentsByUsers()
    statCommentsUserByKeywords()
    // statCommentsUserByKeywordsV2()
}

async function statCommentsUserByKeywords() {
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
            title: "Comment"
        },
        {
          id: "appName",
          title: "App Name",
        },
        {
            id: "rating",
            title: "Rating"
        },
        {
            id: "thumbsUp",
            title: "Thumbs Up"
        },
    ];
    let rows = []

    const comments = await Models.AppComment.aggregate([
        // {    
        //     "$match": {
        //         "$or": [
        //             { "text": { "$regex": "security", "$options": 'i' } },
        //             { "text": { "$regex": "security", "$options": 'i' } },
                    
        //             { "text": { "$regex": "privacy", "$options": 'i' } },
        //             { "text": { "$regex": "Privacy", "$options": 'i' } },

        //             { "text": { "$regex": "privacy policy", "$options": 'i' } },
        //             { "text": { "$regex": "Privacy policy", "$options": 'i' } },
        //             { "text": { "$regex": "Privacy Policy", "$options": 'i' } },
        //         ]
        //     }
        // },
        {    
            "$match": {
                "$or": [
                    { "text": { "$regex": "Security", "$options": 'i' } },
                    { "text": { "$regex": "privacy", "$options": 'i' } },
                    { "text": { "$regex": "policy", "$options": 'i' } },
                    { "text": { "$regex": "collection", "$options": 'i' } },
                    { "text": { "$regex": "third-party", "$options": 'i' } },
                    { "text": { "$regex": "share data", "$options": 'i' } },
                    { "text": { "$regex": "collect data", "$options": 'i' } },
                    
                    { "text": { "$regex": "profile", "$options": 'i' } },
                    { "text": { "$regex": "profiling", "$options": 'i' } },
                    
                    { "text": { "$regex": "analytics", "$options": 'i' } },
                    { "text": { "$regex": "analysis", "$options": 'i' } },
                    { "text": { "$regex": "analyze", "$options": 'i' } },
                    { "text": { "$regex": "analyse", "$options": 'i' } },
                    { "text": { "$regex": "analyzing", "$options": 'i' } },

                    { "text": { "$regex": "statistical", "$options": 'i' } },
                    { "text": { "$regex": "statistics", "$options": 'i' } },

                    { "text": { "$regex": "ads", "$options": 'i' } },
                    { "text": { "$regex": "advertising", "$options": 'i' } },
                    { "text": { "$regex": "advertisement", "$options": 'i' } },
                    { "text": { "$regex": "advertisers", "$options": 'i' } },

                    { "text": { "$regex": "maintain", "$options": 'i' } },
                    { "text": { "$regex": "maintenance", "$options": 'i' } },
                    { "text": { "$regex": "advertisement", "$options": 'i' } },
                    { "text": { "$regex": "maintained", "$options": 'i' } },

                    { "text": { "$regex": "identifier", "$options": 'i' } },
                    { "text": { "$regex": "identifying", "$options": 'i' } },
                    { "text": { "$regex": "authentication", "$options": 'i' } },
                    { "text": { "$regex": "authenticate", "$options": 'i' } },
                    { "text": { "$regex": "authenticates", "$options": 'i' } },
                    { "text": { "$regex": "identity", "$options": 'i' } },
                    { "text": { "$regex": "identities", "$options": 'i' } },
                    { "text": { "$regex": "identifiable", "$options": 'i' } },
                    { "text": { "$regex": "identifies", "$options": 'i' } },

                    { "text": { "$regex": "troubleshooting", "$options": 'i' } },
                    { "text": { "$regex": "tests", "$options": 'i' } },
                    { "text": { "$regex": "testing", "$options": 'i' } },
                    { "text": { "$regex": "troubleshoot", "$options": 'i' } },

                    { "text": { "$regex": "purchase", "$options": 'i' } },
                    { "text": { "$regex": "purchasing", "$options": 'i' } },
                    { "text": { "$regex": "payment", "$options": 'i' } },
                   
                    
                    { "text": { "$regex": "delivery", "$options": 'i' } },
                    { "text": { "$regex": "shipping", "$options": 'i' } },
                    { "text": { "$regex": "delivering", "$options": 'i' } },

                    { "text": { "$regex": "contacting", "$options": 'i' } },
                    { "text": { "$regex": "contacts", "$options": 'i' } },
                    { "text": { "$regex": "contacted", "$options": 'i' } },
                    { "text": { "$regex": "communications", "$options": 'i' } },

                    { "text": { "$regex": "research", "$options": 'i' } },
                    { "text": { "$regex": "researching", "$options": 'i' } },

                    { "text": { "$regex": "survey", "$options": 'i' } },

                    { "text": { "$regex": "treatment", "$options": 'i' } },

                    { "text": { "$regex": "diagnostics", "$options": 'i' } },
                    { "text": { "$regex": "diagnosis", "$options": 'i' } },

                    { "text": { "$regex": "medical", "$options": 'i' } },
                    { "text": { "$regex": "healthcare", "$options": 'i' } },
                    { "text": { "$regex": "health", "$options": 'i' } },
                    { "text": { "$regex": "care", "$options": 'i' } },
                    { "text": { "$regex": "disease", "$options": 'i' } },

                    { "text": { "$regex": "improve", "$options": 'i' } },
                    { "text": { "$regex": "improving", "$options": 'i' } },
                    { "text": { "$regex": "improvement", "$options": 'i' } },

                    { "text": { "$regex": "name", "$options": 'i' } },
                    { "text": { "$regex": "contact", "$options": 'i' } },
                    { "text": { "$regex": "email", "$options": 'i' } },
                    { "text": { "$regex": "account", "$options": 'i' } },
                    { "text": { "$regex": "identifiable", "$options": 'i' } },
                    { "text": { "$regex": "identity", "$options": 'i' } },
                    { "text": { "$regex": "social network", "$options": 'i' } },
                    { "text": { "$regex": "behavioral", "$options": 'i' } },
                    { "text": { "$regex": "behavior", "$options": 'i' } },
                    { "text": { "$regex": "about you", "$options": 'i' } },
                    { "text": { "$regex": "card", "$options": 'i' } },

                    { "text": { "$regex": "location", "$options": 'i' } },
                    { "text": { "$regex": "address", "$options": 'i' } },

                    { "text": { "$regex": "media", "$options": 'i' } },
                    { "text": { "$regex": "video", "$options": 'i' } },
                    { "text": { "$regex": "audio", "$options": 'i' } },
                    { "text": { "$regex": "picture", "$options": 'i' } },
                    { "text": { "$regex": "image", "$options": 'i' } },

                    { "text": { "$regex": "health", "$options": 'i' } },
                    { "text": { "$regex": "fitness", "$options": 'i' } },
                    { "text": { "$regex": "blood", "$options": 'i' } },
                    { "text": { "$regex": "step", "$options": 'i' } },
                    { "text": { "$regex": "activity", "$options": 'i' } },
                    { "text": { "$regex": "activities", "$options": 'i' } },

                    { "text": { "$regex": "camera", "$options": 'i' } },
                    { "text": { "$regex": "IP address", "$options": 'i' } },
                    { "text": { "$regex": "MAC address", "$options": 'i' } },
                    { "text": { "$regex": "sensor", "$options": 'i' } },
                    { "text": { "$regex": "accelerometer", "$options": 'i' } },
                    { "text": { "$regex": "gyroscope", "$options": 'i' } },
                    { "text": { "$regex": "microphone", "$options": 'i' } },
                    { "text": { "$regex": "volumn", "$options": 'i' } },

                    { "text": { "$regex": "Wifi", "$options": 'i' } },
                    { "text": { "$regex": "Bluetooth", "$options": 'i' } },
                    { "text": { "$regex": "NFC", "$options": 'i' } },
                    { "text": { "$regex": "Cookie", "$options": 'i' } },
                    { "text": { "$regex": "connections", "$options": 'i' } },
                    { "text": { "$regex": "beacons", "$options": 'i' } },

                    { "text": { "$regex": "call", "$options": 'i' } },
                    { "text": { "$regex": "messager", "$options": 'i' } },
                    { "text": { "$regex": "phone number", "$options": 'i' } },
                    { "text": { "$regex": "phone calls", "$options": 'i' } },
                ]
            }
        },
    ])
 
    await Promise.all(
        comments.map((comment, i) => {
            const {appId} = comment
            return Models.App.findById(appId).select('appName').then(app => {
                return rows.push({
                    userName: comment.userName,
                    comment: comment.text,
                    appName: app.appName,
                    rating: comment.score,
                    thumbsUp: comment.thumbsUp,
                })
            })
        })
    )
   
    
    rows = _.orderBy(rows, 'userName', 'desc')
    rows = rows.map((row, i) => ({...row, stt: i + 1}))
    const csvWriter = createCsvWriter({
        path: `./output/comments-apps-by-keywords.csv`,
        header
    });
    await csvWriter.writeRecords(rows);

    console.log("DONE statCommentsUserByKeywords")
}

async function statCommentsUserByKeywordsV2() {
    const header = [
        {
          id: "stt",
          title: "#",
        },
        {
            id: "appName",
            title: "App Name",
          },
          {
            id: "totalComment",
            title: "Total comment"
        },
        {
            id: "totalCommentKeywords",
            title: "Total comment with keywords"
        },
    ];
    let rows = []

    const comments = await Models.AppComment.aggregate([
        {    
            "$match": {
                "$or": [
                    { "text": { "$regex": "Security", "$options": 'i' } },
                    { "text": { "$regex": "privacy", "$options": 'i' } },
                    { "text": { "$regex": "policy", "$options": 'i' } },
                    { "text": { "$regex": "collection", "$options": 'i' } },
                    { "text": { "$regex": "third-party", "$options": 'i' } },
                    { "text": { "$regex": "share data", "$options": 'i' } },
                    { "text": { "$regex": "collect data", "$options": 'i' } },
                    
                    { "text": { "$regex": "profile", "$options": 'i' } },
                    { "text": { "$regex": "profiling", "$options": 'i' } },
                    
                    { "text": { "$regex": "analytics", "$options": 'i' } },
                    { "text": { "$regex": "analysis", "$options": 'i' } },
                    { "text": { "$regex": "analyze", "$options": 'i' } },
                    { "text": { "$regex": "analyse", "$options": 'i' } },
                    { "text": { "$regex": "analyzing", "$options": 'i' } },

                    { "text": { "$regex": "statistical", "$options": 'i' } },
                    { "text": { "$regex": "statistics", "$options": 'i' } },

                    { "text": { "$regex": "ads", "$options": 'i' } },
                    { "text": { "$regex": "advertising", "$options": 'i' } },
                    { "text": { "$regex": "advertisement", "$options": 'i' } },
                    { "text": { "$regex": "advertisers", "$options": 'i' } },

                    { "text": { "$regex": "maintain", "$options": 'i' } },
                    { "text": { "$regex": "maintenance", "$options": 'i' } },
                    { "text": { "$regex": "advertisement", "$options": 'i' } },
                    { "text": { "$regex": "maintained", "$options": 'i' } },

                    { "text": { "$regex": "identifier", "$options": 'i' } },
                    { "text": { "$regex": "identifying", "$options": 'i' } },
                    { "text": { "$regex": "authentication", "$options": 'i' } },
                    { "text": { "$regex": "authenticate", "$options": 'i' } },
                    { "text": { "$regex": "authenticates", "$options": 'i' } },
                    { "text": { "$regex": "identity", "$options": 'i' } },
                    { "text": { "$regex": "identities", "$options": 'i' } },
                    { "text": { "$regex": "identifiable", "$options": 'i' } },
                    { "text": { "$regex": "identifies", "$options": 'i' } },

                    { "text": { "$regex": "troubleshooting", "$options": 'i' } },
                    { "text": { "$regex": "tests", "$options": 'i' } },
                    { "text": { "$regex": "testing", "$options": 'i' } },
                    { "text": { "$regex": "troubleshoot", "$options": 'i' } },

                    { "text": { "$regex": "purchase", "$options": 'i' } },
                    { "text": { "$regex": "purchasing", "$options": 'i' } },
                    { "text": { "$regex": "payment", "$options": 'i' } },
                   
                    
                    { "text": { "$regex": "delivery", "$options": 'i' } },
                    { "text": { "$regex": "shipping", "$options": 'i' } },
                    { "text": { "$regex": "delivering", "$options": 'i' } },

                    { "text": { "$regex": "contacting", "$options": 'i' } },
                    { "text": { "$regex": "contacts", "$options": 'i' } },
                    { "text": { "$regex": "contacted", "$options": 'i' } },
                    { "text": { "$regex": "communications", "$options": 'i' } },

                    { "text": { "$regex": "research", "$options": 'i' } },
                    { "text": { "$regex": "researching", "$options": 'i' } },

                    { "text": { "$regex": "survey", "$options": 'i' } },

                    { "text": { "$regex": "treatment", "$options": 'i' } },

                    { "text": { "$regex": "diagnostics", "$options": 'i' } },
                    { "text": { "$regex": "diagnosis", "$options": 'i' } },

                    { "text": { "$regex": "medical", "$options": 'i' } },
                    { "text": { "$regex": "healthcare", "$options": 'i' } },
                    { "text": { "$regex": "health", "$options": 'i' } },
                    { "text": { "$regex": "care", "$options": 'i' } },
                    { "text": { "$regex": "disease", "$options": 'i' } },

                    { "text": { "$regex": "improve", "$options": 'i' } },
                    { "text": { "$regex": "improving", "$options": 'i' } },
                    { "text": { "$regex": "improvement", "$options": 'i' } },

                    { "text": { "$regex": "name", "$options": 'i' } },
                    { "text": { "$regex": "contact", "$options": 'i' } },
                    { "text": { "$regex": "email", "$options": 'i' } },
                    { "text": { "$regex": "account", "$options": 'i' } },
                    { "text": { "$regex": "identifiable", "$options": 'i' } },
                    { "text": { "$regex": "identity", "$options": 'i' } },
                    { "text": { "$regex": "social network", "$options": 'i' } },
                    { "text": { "$regex": "behavioral", "$options": 'i' } },
                    { "text": { "$regex": "behavior", "$options": 'i' } },
                    { "text": { "$regex": "about you", "$options": 'i' } },
                    { "text": { "$regex": "card", "$options": 'i' } },

                    { "text": { "$regex": "location", "$options": 'i' } },
                    { "text": { "$regex": "address", "$options": 'i' } },

                    { "text": { "$regex": "media", "$options": 'i' } },
                    { "text": { "$regex": "video", "$options": 'i' } },
                    { "text": { "$regex": "audio", "$options": 'i' } },
                    { "text": { "$regex": "picture", "$options": 'i' } },
                    { "text": { "$regex": "image", "$options": 'i' } },

                    { "text": { "$regex": "health", "$options": 'i' } },
                    { "text": { "$regex": "fitness", "$options": 'i' } },
                    { "text": { "$regex": "blood", "$options": 'i' } },
                    { "text": { "$regex": "step", "$options": 'i' } },
                    { "text": { "$regex": "activity", "$options": 'i' } },
                    { "text": { "$regex": "activities", "$options": 'i' } },

                    { "text": { "$regex": "camera", "$options": 'i' } },
                    { "text": { "$regex": "IP address", "$options": 'i' } },
                    { "text": { "$regex": "MAC address", "$options": 'i' } },
                    { "text": { "$regex": "sensor", "$options": 'i' } },
                    { "text": { "$regex": "accelerometer", "$options": 'i' } },
                    { "text": { "$regex": "gyroscope", "$options": 'i' } },
                    { "text": { "$regex": "microphone", "$options": 'i' } },
                    { "text": { "$regex": "volumn", "$options": 'i' } },

                    { "text": { "$regex": "Wifi", "$options": 'i' } },
                    { "text": { "$regex": "Bluetooth", "$options": 'i' } },
                    { "text": { "$regex": "NFC", "$options": 'i' } },
                    { "text": { "$regex": "Cookie", "$options": 'i' } },
                    { "text": { "$regex": "connections", "$options": 'i' } },
                    { "text": { "$regex": "beacons", "$options": 'i' } },

                    { "text": { "$regex": "call", "$options": 'i' } },
                    { "text": { "$regex": "messager", "$options": 'i' } },
                    { "text": { "$regex": "phone number", "$options": 'i' } },
                    { "text": { "$regex": "phone calls", "$options": 'i' } },
                ]
            }
        },
    ])
    
    const appCommentsGroup = _.groupBy(comments, 'appId')

    // const rows = await Promise.all(Object.entries(appCommentsGroup).map(buildRow))
    const chunks = _.chunk(Object.entries(appCommentsGroup), 10)

    console.log(chunks)
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const result = await Promise.all(chunk.map(item => buildRow(...item)))
        rows = [...rows, ...result]
    }
    // for (let i = 0; i < Object.entries(appCommentsGroup).length; i++) {
    //     const [appId, appComments] = Object.entries(appCommentsGroup)[i];
        
    //     
    // }
    
    
    rows = _.orderBy(rows, 'totalCommentKeywords', 'desc')
    rows = rows.map((row, i) => ({...row, stt: i + 1}))
    const csvWriter = createCsvWriter({
        path: `./output/comments-apps-by-keywords(v2-en).csv`,
        header
    });
    await csvWriter.writeRecords(rows);

    console.log("DONE statCommentsUserByKeywords")
}
async function buildRow(appId, appComments) {
    console.log(1, appId)
    let [app, totalComments] = await Promise.all([
        Models.App.findById(appId).select('appName'),
        Models.AppComment.find({
            appId
        }).select('text')
    ])
    
    totalComments = totalComments.filter(item => {
        if(!item.text) return false
        let text = item.text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').replace(/:-?[()pPdD]/gi, '');
        
        if(text.split(' ').length <= 3) return true

        text = removeEmojis(text)
        return isEnglish(text)
    })

    return {
        appName: app.appName,
        totalComment: totalComments.length,
        totalCommentKeywords: appComments.length,
    }
}
function removeEmojis(string) {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, "");
  }
  
  function isOnlyEmoji(string) {
    return !removeEmojis(string).length;
  }

async function statCommentsByApps() {
    const header = [
        {
          id: "stt",
          title: "#",
        },
        {
          id: "appName",
          title: "App Name",
        },
        {
            id: "numberOfComment",
            title: "Number of comments"
        },
    ];
    let rows = []

    const comments = await Models.AppComment.aggregate([
        {
            $group: {
              _id: { appId : "$appId" },
              count: { $sum: 1 }
            }
        }
    ])

    await Promise.all(
        comments.map((comment, i) => {
            const {_id:  {appId }, count} = comment
            return Models.App.findById(appId).select('appName').then(app => {
                return rows.push({
                    appName: app.appName,
                    numberOfComment: count
                })
            })
        })
    )
   
    
    rows = _.orderBy(rows, 'numberOfComment', 'desc')
    rows = rows.map((row, i) => ({...row, stt: i + 1}))
    const csvWriter = createCsvWriter({
        path: `./output/comments-apps.csv`,
        header
    });
    await csvWriter.writeRecords(rows);

    console.log("DONE statCommentsByApps")
}

async function statCommentsByUsers() {
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
            id: "numberOfComment",
            title: "Number of comments"
        },
    ];
    let rows = []

    const comments = await Models.AppComment.aggregate([
        {
            $group: {
              _id: { userName : "$userName", appId: "$appId"},
            },
        },
        { $group: { _id: "$_id.userName", count: { $sum: 1 } } },
    ]).allowDiskUse(true)

  
    comments.forEach((comment, i) => {
        const {_id:  userName, count} = comment
        return rows.push({
            userName,
            numberOfComment: count
        })
    })
   
    
    rows = _.orderBy(rows, 'numberOfComment', 'desc')
    rows = rows.map((row, i) => ({...row, stt: i + 1}))

    const csvWriter = createCsvWriter({
        path: `./output/comments-user.csv`,
        header
    });
    await csvWriter.writeRecords(rows);

    console.log("DONE statCommentsByUsers")
}
async function getCommentFromCHplay() {
    const apps = await Models.App.find({appIdCHPlay : {$exists: true}}).select('appIdCHPlay')
    const appChunks = _.chunk(apps, 10)

    for (let i = 0; i < appChunks.length; i++) {
        const chunk = appChunks[i];

        await Promise.all(chunk.map(updateApp))
    }
}
async function updateApp(app) {
    const isExisted = await Models.AppComment.findOne({
        appId: app._id
    })
    if(isExisted) return

    let comments = []

    let commentChunk = {}
    const limit = 3000
    do {
        commentChunk = await gplay.reviews({
            appId: app.appIdCHPlay,
            sort: gplay.sort.RATING,
            num: limit,
            paginate: true,
            nextPaginationToken: commentChunk.nextPaginationToken || null
        })

        comments = [...comments, ...(commentChunk.data || []).map(item => ({...item, appId: app._id}))]
    } while (commentChunk.nextPaginationToken)


    

    await Models.AppComment.insertMany(comments)
}