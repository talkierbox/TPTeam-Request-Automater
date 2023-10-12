"use strict";

// Tool made by Hershraj Niranjani

// Start the requests
async function start_reqs() {
    if (parsed_data_arr == [] ||! parsed_data_arr || parsed_data_arr.length == 0) {
        return alert("You must provide a valid CSV file!")
    }

    let xAuthToken = format_entry(get_auth_token())
    auth_token = xAuthToken
    console.log(xAuthToken)
    if (!xAuthToken || xAuthToken == "" || xAuthToken == null) {
        return alert("Invalid Token! Please check to ensure it is a valid token!");
    } 

    // Validate the auth token -- ensure it works
    if (await does_user_email_exist("test@gmail.com") == "NO-AUTH") {
        return alert("Invalid Token! Please check to ensure it is a valid token!");
    
    }
    setCookie("auth-token", xAuthToken, 100);

    document.getElementById("player-details").value = ""
    let seenPeopleNames = new Set();
    for (let i = 0; i < parsed_data_arr.length; i++) {
        let playerDataMap = parsed_data_arr[i];
        let firstName = format_entry(playerDataMap["firstName"]);
        let lastName = format_entry(playerDataMap["lastName"]);
        let fullName = `${firstName} ${lastName}`;
        let email = format_entry(playerDataMap["email"]);
        let teamID = format_entry(playerDataMap["teamID"]);
        let displayAlertIdentifier = `${firstName}-${i + 1}`;
        let display_alert = newAlertBox(displayAlertIdentifier);

        if(email == undefined || email == "undefined" || fullName == undefined || fullName == " ") {
            // Important info not given
            display_alert("EMAIL OR FULLNAME NOT GIVEN - SKIPPING THIS USER", "bad");
            continue;
        }

        if (!parseInt(teamID)) {
            display_alert("INVALID TEAM ID - SKIPPING THIS USER", "bad");
            continue;
        }

        let seenPeopleNames = new Set();
        if (seenPeopleNames.has(fullName)) {
            // Skip this user, it's a duplicate 
            display_alert(`Duplicate user provided in the CSV - Skipping ${fullName} - ${email}`, "bad")
            continue;
        } else {
            seenPeopleNames.add(fullName);
            // display_alert(`Loading data for ${fullName} - ${email}`, "processing")
        }
        // Now we can actually get onto sending in all the requests

        // Check if the user already exists, prompt if the user does exist already
        let ID_OF_PLAYER_ACC = await does_user_email_exist(email);
        console.log(ID_OF_PLAYER_ACC)
        if (ID_OF_PLAYER_ACC) {
            display_alert(`Skipping creation of account for - ${email} - Continuing to next step`, `bad`);
        } else {
            // Run the function and get a ID_OF_PLAYER_ACC
            let PLAYER_PASSWORD = get_password();
            ID_OF_PLAYER_ACC = await create_user_client_admin_acc(email, PLAYER_PASSWORD);
            if(ID_OF_PLAYER_ACC !== "FAIL") {
                display_alert(`Piping User ${email}'s password to Textbox Above`, "good");
                if (document.getElementById("player-details").value == "") {
                    document.getElementById("player-details").value = `${email},${PLAYER_PASSWORD}`;
                }
                else {
                    document.getElementById("player-details").value += `\n${email},${PLAYER_PASSWORD}`;
                }
            } else {
                display_alert(`User Already Exists - ${email}`, "loading");
            }
        }

        // Now we have ID_of_PLAYER_ACC. We can move on to finding which account to use
        let possibleUsers = (await get_user_array(firstName, lastName));
        let ourUserObj;
        let PLAYER_TEAM_ASSOCIATION_ID;
        if (!possibleUsers || possibleUsers.length == 0) {
            display_alert(`Player not Found - ${fullName} - Skipping account linking...`, `bad`)
            continue;
        }

        if (possibleUsers.length == 1) {
            ourUserObj = possibleUsers[0]
        } else {
            // We found our user obj
            for (let i = 0; i < possibleUsers.length; i++) {
                let thisUserObj = possibleUsers[i];
                let teamLookupData = await lookup_team_for_userID(thisUserObj.id);
                // console.log(`Looking up ${firstName} (${email}) and TeamID ${teamID}`);
                if(teamLookupData?.message == "Game not found" ||! teamLookupData?.team) {
                    continue;
                }
                // console.log(teamLookupData);
                if (teamLookupData.team["id"] == teamID) {
                    // console.log("MATCH! ^")
                    ourUserObj = possibleUsers[i];
                    break;
                }
            }
        }

        
        if(!ourUserObj) {
            display_alert(`Skipping User: ${email} - PLAYER TEAM NOT FOUND`, `bad`);
            continue;
        }        
        PLAYER_TEAM_ASSOCIATION_ID = ourUserObj.id;
        display_alert(`Found Matching Player for ${email}! Linking ${email} to ${PLAYER_TEAM_ASSOCIATION_ID}`, "good")
        let TO_USE_RESP = await build_account_user(ID_OF_PLAYER_ACC, teamID, PLAYER_TEAM_ASSOCIATION_ID, email);
        console.log(TO_USE_RESP);

        if(!TO_USE_RESP) {
            display_alert(`Error on building account user for ${email}`, "bad");
            continue;
        }
        TO_USE_RESP.favoritePlayerIds.push(PLAYER_TEAM_ASSOCIATION_ID);
        TO_USE_RESP.favoriteTeamIds.push(teamID);
        await link_favorite_data(ID_OF_PLAYER_ACC, TO_USE_RESP);
        display_alert(`Completed entire process for ${email}`, "good");
    }

    let done_alert = newAlertBox("TASK FINISHED-TASK FINISHED");
    done_alert(`All ${parsed_data_arr.length} Users Complete!`);
    document.getElementById("download-btn").disabled = (document.getElementById("player-details").value == "");
    if (document.getElementById("player-details").value == "") {
        document.getElementById("player-details").value = "No new user accounts created."
    }
}