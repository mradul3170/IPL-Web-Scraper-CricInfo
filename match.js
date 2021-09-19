let req = require("request");
let ch = require("cheerio");
let path = require("path");
const fs = require("fs");
let xlsx = require("xlsx");

function processMatch(URL, matchNo) {
    req(URL, function(error, response, data) {
        if (response.statusCode == 404) {
            console.log("Page Not Found");
        } else if (response.statusCode == 200) {
            parseHTML_(data, matchNo);
        } else console.log(error);
    });
}

function parseHTML_(data, matchNo) {
    $ = ch.load(data);
    //let venueElem = $(".match-info.match-info-MATCH .description");
    //console.log("venue", venueElem.text());
    //let venue=venueElem.text();
    let teams = $(".teams .name-link");
    let team1 = $(teams[0]).text().trim();
    let team2 = $(teams[1]).text().trim();
    $ = ch.load(data);
    let scorecardElem = $(".Collapsible");
    // console.log("venue", venueElem.text());
    for (let i = 0; i < scorecardElem.length; i++) {
        let inningElem = $(scorecardElem[i]);
        let teamname = inningElem.find("h5").text();
        teamName = teamname.split("INNINGS")[0].trim();
        let playerRows = inningElem.find(".table.batsman tbody tr");
        for (let key = 0; key < playerRows.length; key++) {
            let cols = $(playerRows[key]).find("td");
            let isAllowed = $(cols[0]).hasClass("batsman-cell");
            if (isAllowed) {
                let playerName = $(cols[0]).text().trim();
                let runs = $(cols[2]).text().trim();
                let balls = $(cols[3]).text().trim();
                let fours = $(cols[5]).text().trim();
                let sixes = $(cols[6]).text().trim();
                let strikeRate = $(cols[7]).text().trim();
                let opponent = (i == 0 ? team2 : team1);
                processPlayer(playerName, runs, balls, sixes, fours, strikeRate, teamName, opponent/*,venue*/);
            }
        }
    }
}

function processPlayer(playerName, runs, balls, sixes, fours, strikeRate, teamName, opponent/*,venue*/) {
    let playerObject = {
        Name: playerName,
        Runs: runs,
        Balls: balls,
        Sixes: sixes,
        Fours: fours,
        SR: strikeRate,
        TeamName: teamName,
        Opponent: opponent
        //Venue:venue
    };

    let teamPath = path.join(__dirname, "Statistics", teamName);
    let dirExist = checkExistance(teamPath);
    if (dirExist == 0) {
        createFolder(teamPath);
    }
    let playerFileName = path.join(teamPath, playerName + ".xlsx");
    let fileExist = checkExistance(playerFileName);
    let playerEntries = [];
    if (fileExist == 1) {
        playerEntries = excelReader(playerFileName, playerName);
        playerEntries.push(playerObject);
        //sort_by_key(playerEntries, "MatchDay");
        excelWriter(playerFileName, playerEntries, playerName);
    } else {
        playerEntries.push(playerObject);
        //sort_by_key(playerEntries, "MatchDay");
        excelWriter(playerFileName, playerEntries, playerName);
    }
}

function checkExistance(var1) {
    return fs.existsSync(var1);
}

function createFolder(teamPath) {
    fs.mkdirSync(teamPath);
}

function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    } else {
        // workbook => excel
        let wt = xlsx.readFile(filePath);
        // csk -> msd
        // get data from workbook
        let excelData = wt.Sheets[name];
        // convert excel format to json => array of obj
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx-> msd
    xlsx.utils.book_append_sheet(newWB, newWS, name); //workbook name as param
    //   file => create , replace
    xlsx.writeFile(newWB, filePath);
}

function sort_by_key(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
module.exports = {
    processMatch: processMatch
}