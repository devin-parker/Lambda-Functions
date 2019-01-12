
// Verify Url - https://api.slack.com/events/url_verification
function verify(data, callback) {
    if (data.token === SLACK_VERIFICATION_TOKEN) callback(null, data.challenge);
    else callback("verification failed");   
}

    
// Post message to Slack - https://api.slack.com/methods/chat.postMessage
function process(event, callback) {
    // test the message for conent and not a bot
    if (!event.bot_id && event.text.length > 0) {
        //Slack Admin Bot Responds to DM
        var autoResponse = `Hi, <@${event.user}>. Slack Admin Bot does not pass messages on to humans. Please DM <@[ADMIN OR CHANNEL]> for assistance.`;
        var message = { 
            token: SLACK_ACCESS_TOKEN,
            channel: event.channel,
            thread_ts:event.ts,
            text: autoResponse,
            username: 'Slack Helper',
            icon_emoji:':male-factory-worker:',
        };

        //Slackbot calls out user in channel or thread
        // var text = `Hi, <@${event.user}> please no @-here in here`;
        // var message = { 
        //     token: ACCESS_TOKEN,
        //     channel: event.channel,
        //  // engage thread_ts to move message to thread
        //     thread_ts:event.ts,
        //     text: text,
        //     username: 'Slack Police',
        //     icon_emoji:':male-police-officer:',
        // };

        var query = qs.stringify(message); // prepare the querystring
        https.get(`https://slack.com/api/chat.postMessage?${query}`);
    }

    callback(null);
}

// Lambda handler
exports.handler = (data, context, callback) => {
    switch (data.type) {
        case "url_verification": verify(data, callback); break;
        case "event_callback": process(data.event, callback); break;
        default: callback(null);
    }
};
