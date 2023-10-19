"use strict";

// Tool made by Hershraj Niranjani
let debug = false;
let parsed_data_arr = []

function parse_csv_data(raw_csv_data) {
    if (raw_csv_data == "") {
        return []
    }

    let returnArr = []
    let correlationArr = ["firstName", "lastName", "email", "teamID", "featureMask"];

    let entrySplits = raw_csv_data.split("\r\n")

    let titles = entrySplits[0].split(",").map(item => replaceAll(item.toLowerCase(), " "));
    if (titles.length !== correlationArr.length) {
        alert(`ERROR: Badly formatted CSV! There should be ${correlationArr.length} columns in the CSV, containing the fields of "${correlationArr.join(`","`)}"`);
        return [];
    }

    for (let i = 0; i < titles.length; i++) {
        let title = titles[i]

        if (title !== correlationArr[i].toLowerCase()) {
            alert(`ERROR: Badly formatted CSV! Column #${i + 1} should contain \'${correlationArr[i]}\' as a column header!`);
            return [];
        }
    }

    /*
    if (titles[0] !== "firstname") {
        alert("ERROR: Badly formatted CSV! First column should contain \'First Name\' as a column header!");
        return [];
    }
    if (titles[1] !== "lastname") {
        alert("ERROR: Badly formatted CSV! Second column should contain \'Last Name\' as a column header!");
        return [];
    }
    if (titles[2] !== "email") {
        alert("ERROR: Badly formatted CSV! Third column should contain \'Email\' as a column header!");
        return [];
    }
    if (titles[3] !== "teamid") {
        alert("ERROR: Badly formatted CSV! Fourth column should contain \'Team ID\' as a column header!");
        return [];
    }
    */

    // Remove the first CSV item
    entrySplits.shift();

    for (let commaEntry of entrySplits) {
        // commEntry = ", , , ,"
        let split = commaEntry.split(",");
        if(split.length == 0) continue;
        if (split == [] || split.length < 1) continue;
        if (split[0] == "") continue;
        if (split.length !== correlationArr.length) {
            alert(`ERROR: Badly formatted CSV! There should be ${correlationArr.length} columns and data entries for each row!`);
            return;
        }
        let tempObj = {}
        for (let i = 0; i < correlationArr.length; i++) {
            let str = correlationArr[i]
            tempObj[`${str}`] = `${split[i]}`
        }
        returnArr.push(tempObj)
    }
    return returnArr
}

function getVal(id) {
    return document.getElementById(id).value
}

function newAlertBox(alertBoxID) {
    let alertDiv = $("#alerts")  
    alertDiv.css("visibility", "visible") // Make sure it is visible
    let newText = $(`<span class="marker" style="color:black">${alertBoxID.split("-")[1]} |</span><div id=${alertBoxID}></div>`)
    
    $("#alerts-container").prepend(newText);
    function display_alert(text, alertType=`loading`) {
        $("#" + alertBoxID).append(`<span class=${alertType}>`+text+'</span>' +`<span class="divider-text"> | </span>`);
    }
    return display_alert;
}


async function uploaded_file(){
    console.log("CSV Uploaded!")
    let fileToRead = document.getElementById("csvFile").files
    let raw_csv_data = await fileToRead[0].text();
    parsed_data_arr = await parse_csv_data(raw_csv_data);
    document.getElementById("reqs-btn").disabled = (parsed_data_arr.length == 0);
    if (debug) {
        // display_alert("Good!", "good")
        // display_alert("Bad!", "bad")
        // display_alert("Normal", "normal")
        // display_alert("Loading...", "processing")
    }
}


/* 
[{
    "firstName": "",
    "lastName": "",
    "email": "",
    "teamID": ""
}]
*/
