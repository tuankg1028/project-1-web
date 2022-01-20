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

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

main()
async function main() {
    // getCommentFromCHplay()
    // statCommentsByApps()
    // statCommentsByUsers()
    // statCommentsUserByKeywords()
    statCommentsUserByKeywordsV2()
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
        {    
            "$match": {
                "$or": [
                    { "text": { "$regex": "security", "$options": 'i' } },
                    { "text": { "$regex": "security", "$options": 'i' } },
                    
                    { "text": { "$regex": "privacy", "$options": 'i' } },
                    { "text": { "$regex": "Privacy", "$options": 'i' } },

                    { "text": { "$regex": "privacy policy", "$options": 'i' } },
                    { "text": { "$regex": "Privacy policy", "$options": 'i' } },
                    { "text": { "$regex": "Privacy Policy", "$options": 'i' } },
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
    
    let skip = 0;
    let limit = 10000
    let comments1 = await Models.AppComment.find({
        textLower: { $exists: false }
    }).limit(limit).skip(skip * limit)
    do {
        await Promise.all(
            comments1.map(item => {
                return Models.AppComment.updateOne(
                    {
                      _id: item._id,
                    },
                    {
                      $set: {
                        textLower: item.text ? item.text.toLowerCase() : '',
                      },
                    }
                  );
            })
        )

        skip++;
        comments1 = await Models.AppComment.find({
            textLower: { $exists: false }
        }).limit(limit).skip(skip * limit)
    }
    while(comments1.length) 

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
                    { "textLower": { "$regex": "profile", "$options": 'i' } },
                    { "textLower": { "$regex": "profiling", "$options": 'i' } },
                    
                    { "textLower": { "$regex": "analytics", "$options": 'i' } },
                    { "textLower": { "$regex": "analysis", "$options": 'i' } },
                    { "textLower": { "$regex": "analyze", "$options": 'i' } },
                    { "textLower": { "$regex": "analyse", "$options": 'i' } },
                    { "textLower": { "$regex": "analyzing", "$options": 'i' } },

                    { "textLower": { "$regex": "statistical", "$options": 'i' } },
                    { "textLower": { "$regex": "statistics", "$options": 'i' } },

                    { "textLower": { "$regex": "ads", "$options": 'i' } },
                    { "textLower": { "$regex": "advertising", "$options": 'i' } },
                    { "textLower": { "$regex": "advertisement", "$options": 'i' } },
                    { "textLower": { "$regex": "advertisers", "$options": 'i' } },

                    { "textLower": { "$regex": "maintain", "$options": 'i' } },
                    { "textLower": { "$regex": "maintenance", "$options": 'i' } },
                    { "textLower": { "$regex": "advertisement", "$options": 'i' } },
                    { "textLower": { "$regex": "maintained", "$options": 'i' } },

                    { "textLower": { "$regex": "identifier", "$options": 'i' } },
                    { "textLower": { "$regex": "identifying", "$options": 'i' } },
                    { "textLower": { "$regex": "authentication", "$options": 'i' } },
                    { "textLower": { "$regex": "authenticate", "$options": 'i' } },
                    { "textLower": { "$regex": "authenticates", "$options": 'i' } },
                    { "textLower": { "$regex": "identity", "$options": 'i' } },
                    { "textLower": { "$regex": "identities", "$options": 'i' } },
                    { "textLower": { "$regex": "identifiable", "$options": 'i' } },
                    { "textLower": { "$regex": "identifies", "$options": 'i' } },

                    { "textLower": { "$regex": "troubleshooting", "$options": 'i' } },
                    { "textLower": { "$regex": "tests", "$options": 'i' } },
                    { "textLower": { "$regex": "testing", "$options": 'i' } },
                    { "textLower": { "$regex": "troubleshoot", "$options": 'i' } },

                    { "textLower": { "$regex": "purchase", "$options": 'i' } },
                    { "textLower": { "$regex": "purchasing", "$options": 'i' } },
                    { "textLower": { "$regex": "payment", "$options": 'i' } },
                   
                    
                    { "textLower": { "$regex": "delivery", "$options": 'i' } },
                    { "textLower": { "$regex": "shipping", "$options": 'i' } },
                    { "textLower": { "$regex": "delivering", "$options": 'i' } },

                    { "textLower": { "$regex": "contacting", "$options": 'i' } },
                    { "textLower": { "$regex": "contacts", "$options": 'i' } },
                    { "textLower": { "$regex": "contacted", "$options": 'i' } },
                    { "textLower": { "$regex": "communications", "$options": 'i' } },

                    { "textLower": { "$regex": "research", "$options": 'i' } },
                    { "textLower": { "$regex": "researching", "$options": 'i' } },

                    { "textLower": { "$regex": "survey", "$options": 'i' } },

                    { "textLower": { "$regex": "treatment", "$options": 'i' } },

                    { "textLower": { "$regex": "diagnostics", "$options": 'i' } },
                    { "textLower": { "$regex": "diagnosis", "$options": 'i' } },

                    { "textLower": { "$regex": "medical", "$options": 'i' } },
                    { "textLower": { "$regex": "healthcare", "$options": 'i' } },
                    { "textLower": { "$regex": "health", "$options": 'i' } },
                    { "textLower": { "$regex": "care", "$options": 'i' } },
                    { "textLower": { "$regex": "disease", "$options": 'i' } },

                    { "textLower": { "$regex": "improve", "$options": 'i' } },
                    { "textLower": { "$regex": "improving", "$options": 'i' } },
                    { "textLower": { "$regex": "improvement", "$options": 'i' } },

                    { "textLower": { "$regex": "name", "$options": 'i' } },
                    { "textLower": { "$regex": "contact", "$options": 'i' } },
                    { "textLower": { "$regex": "email", "$options": 'i' } },
                    { "textLower": { "$regex": "account", "$options": 'i' } },
                    { "textLower": { "$regex": "identifiable", "$options": 'i' } },
                    { "textLower": { "$regex": "identity", "$options": 'i' } },
                    { "textLower": { "$regex": "social network", "$options": 'i' } },
                    { "textLower": { "$regex": "behavioral", "$options": 'i' } },
                    { "textLower": { "$regex": "behavior", "$options": 'i' } },
                    { "textLower": { "$regex": "about you", "$options": 'i' } },
                    { "textLower": { "$regex": "card", "$options": 'i' } },

                    { "textLower": { "$regex": "location", "$options": 'i' } },
                    { "textLower": { "$regex": "address", "$options": 'i' } },

                    { "textLower": { "$regex": "media", "$options": 'i' } },
                    { "textLower": { "$regex": "video", "$options": 'i' } },
                    { "textLower": { "$regex": "audio", "$options": 'i' } },
                    { "textLower": { "$regex": "picture", "$options": 'i' } },
                    { "textLower": { "$regex": "image", "$options": 'i' } },

                    { "textLower": { "$regex": "health", "$options": 'i' } },
                    { "textLower": { "$regex": "fitness", "$options": 'i' } },
                    { "textLower": { "$regex": "blood", "$options": 'i' } },
                    { "textLower": { "$regex": "step", "$options": 'i' } },
                    { "textLower": { "$regex": "activity", "$options": 'i' } },
                    { "textLower": { "$regex": "activities", "$options": 'i' } },

                    { "textLower": { "$regex": "camera", "$options": 'i' } },
                    { "textLower": { "$regex": "IP address", "$options": 'i' } },
                    { "textLower": { "$regex": "MAC address", "$options": 'i' } },
                    { "textLower": { "$regex": "sensor", "$options": 'i' } },
                    { "textLower": { "$regex": "accelerometer", "$options": 'i' } },
                    { "textLower": { "$regex": "gyroscope", "$options": 'i' } },
                    { "textLower": { "$regex": "microphone", "$options": 'i' } },
                    { "textLower": { "$regex": "volumn", "$options": 'i' } },

                    { "textLower": { "$regex": "Wifi", "$options": 'i' } },
                    { "textLower": { "$regex": "Bluetooth", "$options": 'i' } },
                    { "textLower": { "$regex": "NFC", "$options": 'i' } },
                    { "textLower": { "$regex": "Cookie", "$options": 'i' } },
                    { "textLower": { "$regex": "connections", "$options": 'i' } },
                    { "textLower": { "$regex": "beacons", "$options": 'i' } },

                    { "textLower": { "$regex": "call", "$options": 'i' } },
                    { "textLower": { "$regex": "messager", "$options": 'i' } },
                    { "textLower": { "$regex": "phone number", "$options": 'i' } },
                    { "textLower": { "$regex": "phone calls", "$options": 'i' } },
                ]
            }
        },
    ])
    
    const appCommentsGroup = _.groupBy(comments, 'appId')

    for (const appId in appCommentsGroup) {
        const appComments = appCommentsGroup[appId];
        const app = Models.App.findById(appId).select('appName')
        const totalComments = await Models.AppComment.count({
            appId
        })

        rows.push({
            appName: app.appName,
            totalComment: totalComments,
            totalCommentKeywords: appComments.length,
        })
    }
    
    rows = _.orderBy(rows, 'totalCommentKeywords', 'desc')
    rows = rows.map((row, i) => ({...row, stt: i + 1}))
    const csvWriter = createCsvWriter({
        path: `./output/comments-apps-by-keywords(v2).csv`,
        header
    });
    await csvWriter.writeRecords(rows);

    console.log("DONE statCommentsUserByKeywords")
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