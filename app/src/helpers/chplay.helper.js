import fs from "fs";
import path from "path";
import Helpers from "./";
import cheerio from "cheerio";
import axios from "axios";

async function getCommentsFromLink(link) {
    const linkComments = `${link}&showAllReviews=true`

    const response = await axios.get(linkComments);
    const $ = cheerio.load(response.data);

    console.log(1, $("h3.td1D0d").html())
    $("[jsname='fk8dgd'] > div").each(function (i, elem) {
        console.log($(this).text())

    })
}

export default {
    getCommentsFromLink,
};
