let req = require("request");
let ch = require("cheerio");
let match = require("./match.js");
const { processMatch } = require("./match.js");

//console.log("Before");

function getScoreCardUrl(url) {

    req(url, cb);
}

function cb(error, response, data) {
    // resoure not  found
    if (response.statusCode == 404) {
        console.log("Page not found");
        // resource found
    } else if (response.statusCode == 200) {
        // console.log(data);
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {
    let $ = ch.load(data);
    let AllScorecardElem = $('a[data-hover="Scorecard"]');
    for (let i = 0; i < AllScorecardElem.length; i++) {
        let url = $(AllScorecardElem[i]).attr("href");
        let MatchfullUrl = "https://www.espncricinfo.com" + url;
        match.processMatch(MatchfullUrl);
    }
}

//console.log("After");
//console.log("Req send");
module.exports = {
    getScoreCardUrl: getScoreCardUrl
}