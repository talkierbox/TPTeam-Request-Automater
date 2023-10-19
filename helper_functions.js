"use strict";
// Tool made by Hershraj Niranjani

// Auth Token
let auth_token = "";


function onLoad() {
    document.getElementById("auth-token-input").value = getCookie("auth-token")
}

// This should be good enough
async function make_web_request(type, url, contentType=null, body=null) {
    type = type.toUpperCase();
    return (await fetch(url, {
        method: type,
        headers: {
            "Content-Type": contentType,
            "X-Auth-Token": (auth_token === null ? null : auth_token)        
        },
        credentials: "include",
        body: (contentType == "application/json" ? JSON.stringify(body) : body)
    }));
}

function generateRandomFrom(length, str) {
    let pass = '';
 
    for (let i = 0; i < length; i++) {
        let char = Math.floor(Math.random() * str.length + 1);
        pass += str.charAt(char)
    }
 
    return pass;
}

function generateRandomString(length) {
    return generateRandomFrom(length, 'abcdefghijklmnopqrstuvwxyz')
}


function generateRandomNumber(length) {
    return generateRandomFrom(length, '123456789');
}

function get_auth_token() {
    return getVal("auth-token-input")
}


function download_csv_logins() {
    let data = document.getElementById("player-details").value;
    let fileName = `logins-${generateRandomNumber(6)}.csv`;
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', fileName);
    let c = document.body.appendChild(element)
    element.click();
    document.body.removeChild(c);
    
}

function format_entry(entryStr) {
    if(!entryStr || typeof entryStr !== 'string') return entryStr;
    if (entryStr.startsWith(" ")) {
        return format_entry(entryStr.substring(1)) 
    }
    else if (entryStr.endsWith(" ")) {
        return format_entry(entryStr.slice(0, -1)) 
    }
    else return entryStr;
}

function replaceAll(str, charToRemove) {
    let returnStr = "";
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (char == charToRemove) {
            continue;
        }
        else {
            returnStr += char;
        }
    }
    return returnStr;
}

function get_password() {
    return `${generateRandomString(6) + generateRandomNumber(2)}`
}

async function does_user_email_exist(email) {
    let resp = await (await make_web_request("POST", "https://portal.tpeteam.com/api/users/search", "application/json" , {"size":15,"page":0,"orders":[{"property":"id","direction":"DESC"}],"expression":{"type":"function","function":"like","children":[{"type":"field","field":"userName"},{"type":"string","value":`${email}`}]}}, "https://portal.tpeteam.com/clients-admin/users")).json();
    // console.dir(resp)
    if (resp?.status == 401) {
        return "NO-AUTH" 
    }
    return (resp.content.length > 0 ? resp.content[0].id : false); 
}

async function get_user_data_if_exists(email) {
    let resp = (await make_web_request("POST", "https://portal.tpeteam.com/api/clients/users/search", "application/json" , {"page":0,"size":20,"expression":{"type":"function","function":"like","children":[{"type":"field","field":"email"},{"type":"string","value":email}]}}));
    return await resp.json()
}

// Returns the new client 
async function create_user_client_admin_acc(email, password) {
    let resp = await make_web_request("POST", "https://portal.tpeteam.com/api/users", "application/json", {"username": email,"password": password,"authorities":["CLIENT"]});
    
    let resptext = (await resp.text())
    if (resptext == "Login already exists" || resptext == "Not valid login") {
        return "FAIL"
    }
    else return (await JSON.parse(resptext)).id // Weird ID #1 (ID_OF_PLAYER_ACC)
}

async function get_user_array(firstName, lastName) {
    let resp = await make_web_request("GET", `https://portal.tpeteam.com/api/players/profiles/?name=${firstName.toLowerCase()}%20${lastName.toLowerCase()}`);
    let respText = await resp.text()
    return await JSON.parse(respText);
}

async function lookup_team_for_userID(id) {
    let resp = await make_web_request("GET", `https://portal.tpeteam.com/api/players/lastGame?playerId=${id}`);
    let respText = await resp.text();
    // console.log(respText)
    return await JSON.parse(respText)
}

async function build_account_user(ID_OF_PLAYER_ACC, TEAM_ID, PLAYER_TEAM_ASSOCIATION_ID, email, featureMask=0) {
    let resp = await make_web_request("POST", `https://portal.tpeteam.com/api/clients/users`, `application/json`, {
        "clientId":2473,"userAccountId":ID_OF_PLAYER_ACC,"teamId":TEAM_ID,"playerId":PLAYER_TEAM_ASSOCIATION_ID,"sendPlaylists":true,"playlistsMask":"1","featuresMask": parseInt(featureMask),"emails":[`${email}`],"locales":["EN"],"analyticUserId":466,"pictureHref":null
    }); // Use the magic 2473 Number!
    let respText = await resp.text();
    // console.log(respText);
    return await JSON.parse(respText);
}

async function link_favorite_data(ID_OF_PLAYER_ACC, updatedData) {
    let resp = await make_web_request("PUT", `https://portal.tpeteam.com/api/clients/users/${ID_OF_PLAYER_ACC}`, `application/json`, updatedData)
    let respText = await resp.text();
    console.log(respText);
    return await JSON.parse(respText);
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}