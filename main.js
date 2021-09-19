let req = require("request");
let ch = require("cheerio");
let obj = require("./match.js");
let Allmatch = require("./AllMatch");

//console.log("Before");
let url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';
req(url, cb);

function cb(error, response, data) {

    if (response.statusCode == 404) {
        console.log("Page not found");
    } else if (response.statusCode == 200) {
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {
    let $ = ch.load(data);
    let AllMatchPageUrlElem = $('a[data-hover="View All Results"]');
    let AllMatchUrl = AllMatchPageUrlElem.attr("href");
    let AllMatchFullUrl = "https://www.espncricinfo.com" + AllMatchUrl;
    Allmatch.getScoreCardUrl(AllMatchFullUrl);
}
//console.log("After");
//console.log("Req send");
