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