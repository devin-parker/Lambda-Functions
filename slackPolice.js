const url = require('url');
const https = require('https');
const querystring = require('querystring');

const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN,
const SLACK_ACCESS_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

async function postToWebhook(postMessage, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        // Setup request options
        const options = url.parse(postMessage);
        options.method = 'POST';
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        };

        // Request with response handler
        console.log('Making chat.postMessage API request');
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');

            let json = '';
            res.on('data', (chunk) => { json += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('Webhook request was successful!');
                    resolve();
                } else {
                    console.log('Webhook request failed!');
                    reject(new Error(res.statusMessage))
                }
            });
        });

        // Generic request error handling
        req.on('error', e => reject(e));

        req.write(body);
        req.end();
    });
}

function messageText(payload) {
    if (payload.text && payload.text.indexOf(' ') != -1) {
        return payload.text;
    } else if(payload.text === 'thread'){
        const intro = "Okay folks, let's move this conversation to";
        const to ='the thread';
        return `${intro} ${to}.`;
    }else{
        const intro = "Okay folks, let's move this conversation to";
        const channel = ('%23' + payload.text).replace(/#/, '');
        const to = (payload.text ? channel : 'elsewhere');
        return `${intro} ${to}.`;
    }
}

exports.handler = async (event) => {
    // The Slack slash command request body is URL encoded
    const payload = querystring.parse(event.body);
    if (payload.token !== SLACK_VERIFICATION_TOKEN) {
        // Invalid Slack verification token on payload
        throw 'Invalid verification token';
    }
    try {   
        await postToWebhook('https://slack.com/api/chat.postMessage?token='+SLACK_ACCESS_TOKEN+'&channel='+payload.channel_name+'&link_names=true&mrkdwn=true&asuser=false&username=Slack%20Police'+'&text='+messageText(payload)+'&icon_emoji=%3Amale-police-officer%3A', {
        });

        // Returning an empty body to the Slack slash command request will
        // preventany message from being posted to the channel (we've already
        // sent our message using the incoming webhook).
        return { statusCode: 200, headers: {}, body: '' };
    } catch (e) {
        throw e;
    }
};
