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
    statCommentsUserByKeywords()
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
                    rating: app.score,
                    thumbsUp: app.thumbsUp,
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