const https = require('https'),
      qs = require('querystring'),
      SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN,
      SLACK_ACCESS_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;


// Verify Url - https://api.slack.com/events/url_verification
function verify(data, callback) {
    if (data.token === SLACK_VERIFICATION_TOKEN) callback(null, data.challenge);
    else callback("verification failed");   
}

// Patrol these rooms for @here or @channel
let patrolRooms =[
    "C061EG9SA", // room name for reference
    "C061EG9SB", // room name for reference
    "C061EG9SC", // room name for reference
    "C061EG9SD", // room name for reference
    "C061EG9SE", // room name for reference
    "C061EG9SF", // room name for reference
    "C061EG9SG", // room name for reference
    "C061EG9SH",
    ];
    
    
// Post message to Slack - https://api.slack.com/methods/chat.postMessage
function process(event, callback) {
    // test the message for a match and not a bot
    if (!event.bot_id && /(<!here>|<!channel>)/ig.test(event.text) && patrolRooms.includes(event.channel)) {
        //Slack bot sends User warning message
        var text = `Hi, <@${event.user}>. Please refrain from using <!here> in <#${event.channel}>`;
        var message = { 
            token: ACCESS_TOKEN,
            channel: event.user,
        //    thread_ts:event.ts,
            text: text,
            username: 'Slack Police',
            icon_emoji:':male-police-officer:',
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
