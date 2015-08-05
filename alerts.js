var env = process.env.NODE_ENV || 'default';
var cfg = require('./config.'+env);
var logger = require('./logger');

module.exports = alerts;

function alerts() {
    this.availableAlerts = {};
    if (cfg.email.use || cfg.sms.use) {
        this.setUpEmail();
        if (cfg.email.use) {
            this.availableAlerts.email = {
                label: 'Email Notification',
                icon: 'mail',
            };
        }
        if (cfg.sms.use){
            this.availableAlerts.sms = {
                label: 'SMS Notification',
                icon: 'comment',
            };
        }
    }
    if (cfg.pushbullet.use) {
        this.setUpPushbullet();
        this.availableAlerts.pushbullet = {
            label: 'Pushbullet Notification',
            icon: 'mail',
         };
    }
    if (cfg.twitter.use) {
        this.setUpTwitter();
        this.availableAlerts.twitter = {
            label: 'Twitter Notification',
            icon: 'mail',
        };
    }
}

alerts.prototype.handleNodeAlerts = function(node) {
    if (node.alerts) {
        for (var key in node.alerts) {
            this.testAlert(node, key);
        }
    }
}

//nodes[selectedNodeID] = {
//    _id: selectedNodeID, 
//    updated: last refreshed, 
//    type: type of client (garage), 
//    label: name of node,
//    descr: opt description of node,
//    hidden: hidden from front page,
//    Status: node state,
//    rssi: client signal strength,
//    lastStateChange: last state change,
//    alerts: see below 
//};
//node.alerts[alertID] = {
//    alertStatus: true/false,
//    alertType: email/sms/pushbullet/twitter,
//    timeout: time in condition before alert,
//    clientStatus: trigger condition,
//    destination: email/sms address
//}

alerts.prototype.testAlert = function(node, alertID){
    var currentTime = new Date().getTime();
    var timeInState = currentTime - node.lastStateChange;
    var enableCheck = (node.alerts[alertID].alertStatus);
    var statusCheck = (node.alerts[alertID].clientStatus == node.Status);
    var timeoutCheck = (timeInState >= node.alerts[alertID].timeout);

    logger.debug('Testing Alert: ' + alertID + ', enabled: ' + enableCheck + ', status match: ' + statusCheck + ', timeout met: ' + timeoutCheck);
	logger.debug('Node last state change: ' + node.lastStateChange);
    logger.debug('Alert timeout: ' + node.alerts[alertID].timeout);
    logger.debug('Current time: ' + currentTime);

    if (enableCheck && statusCheck && timeoutCheck) {
        logger.debug('Sending Alert!!!');
        var subject = node.label + ' has been ' + node.Status + ' for ' + (timeInState/60000).toFixed(2) + ' minutes!';
        var body = node.label + ' is ' + node.Status;
        if (node.alerts[alertID].alertType == 'email')
            this.sendEmail(subject, body);
        if  (node.alerts[alertID].alertType == 'sms')
            this.sendSMS(subject, body);
        if (node.alerts[alertID].alertType == 'pushbullet')
            this.sendPush(subject, body);
        if (node.alerts[alertID].alertType == 'twitter')
             this.sendTwitter(subject, body);
    }
}

// *********************************
// ********** EMAIL SETUP **********
// *********************************

// using nodemailer: https://github.com/andris9/Nodemailer
// "gmail" is preconfigured by nodemailer, but you can setup
// any other email client supported by nodemailer

alerts.prototype.setUpEmail = function() {
    var nodemailer = require('nodemailer');
    this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: cfg.email.username,
            pass: cfg.email.password
        }
    });
}

alerts.prototype.sendEmail = function(SUBJECT, BODY) {
    var self = this;
    this.mailOptions = {
        from: cfg.email.from,
        to: cfg.email.to,
        subject: SUBJECT,
        text: BODY
        //html: '<b>Hello world ?</b>' // html body
    };
    this.transporter.sendMail(this.mailOptions, function(error, info) {
        if (error) 
            logger.info('SENDEMAIL ERROR: ' + error);
        else 
            logger.info('SENDEMAIL SUCCESS: ' + info.response);
    });
}

// *******************************
// ********** SMS SETUP **********
// *******************************

// your mobile carrier should have an email address that will 
// generate a SMS to your phone
alerts.prototype.sendSMS = function(SUBJECT, BODY) {
    var self = this;
    var mailOptions = {
        from: cfg.sms.from,
        to: cfg.sms.to,
        subject: SUBJECT,
        text: BODY
    };
    this.transporter.sendMail(mailOptions, function(error, info) {
        if (error) 
            logger.info('SENDSMS ERROR: ' + error);
        else 
            logger.info('SENDSMS SUCCESS: ' + info.response);
    });
}

// **************************************
// ********** PUSHBULLET SETUP **********
// **************************************

alerts.prototype.setUpPushbullet = function() {
    var PushBullet = require('pushbullet');
    this.pusher = new PushBullet(cfg.pushbullet.api_key);
}

alerts.prototype.sendPush = function(SUBJECT, BODY) {
    var self = this;
    this.pusher.note('', SUBJECT, BODY, function(error, info) {
        if (error) 
            logger.info('PUSHBULLET ERROR: ' + error);
        else 
            logger.info('PUSHBULLET SUCCESS: ' + info);
    });
}

// ***********************************
// ********** TWITTER SETUP **********
// ***********************************

alerts.prototype.setUpTwitter = function() {
    var Twitter = require('twitter');
    this.client = new Twitter({
        consumer_key: cfg.twitter.consumer_key,
        consumer_secret: cfg.twitter.consumer_secret,
        access_token_key: cfg.twitter.token_key,
        access_token_secret: cfg.twitter.token_secret
    });
}

alerts.prototype.sendTweet = function(SUBJECT, BODY) {
    var self = this;
    this.client.post('statuses/update', {status: BODY}, function(error, tweet, info){
        if (error) 
            logger.info('TWITTER ERROR: ' + error);
        else 
            logger.info('TWITTER SUCCESS: ' + info);
    });
}
