// **********************************************************************************
// Websocket backend for the Raspberry Pi IoT Framework
// **********************************************************************************
// Modified from the Moteino IoT Framework - http://lowpowerlab.com/gateway
// By Felix Rusu, Low Power Lab LLC (2015), http://lowpowerlab.com/contact
// **********************************************************************************
// Based on Node.js, socket.io, NeDB
// This is a work in progress and is released without any warranties expressed or implied.
// Please read the details below.
// Also ensure you change the settings in this file to match your hardware and email settings etc.
// **********************************************************************************
// NeDB is Node Embedded Database - a persistent database for Node.js, with no dependency
// Specs and documentation at: https://github.com/louischatriot/nedb
//
// Under the hood, NeDB's persistence uses an append-only format, meaning that all updates 
// and deletes actually result in lines added at the end of the datafile. The reason for
// this is that disk space is very cheap and appends are much faster than rewrites since
// they don't do a seek. The database is automatically compacted (i.e. put back in the
// one-line-per-document format) everytime your application restarts.
// 
// This script is configured to compact the database every 24 hours since time of start.
// ********************************************************************************************
// Copyright Brian Ladner
// ********************************************************************************************
//                                    LICENSE
// ********************************************************************************************
// This source code is released under GPL 3.0 with the following ammendments:
// You are free to use, copy, distribute and transmit this Software for non-commercial purposes.
// - You cannot sell this Software for profit while it was released freely to you by Low Power Lab LLC.
// - You may freely use this Software commercially only if you also release it freely,
//   without selling this Software portion of your system for profit to the end user or entity.
//   If this Software runs on a hardware system that you sell for profit, you must not charge
//   any fees for this Software, either upfront or for retainer/support purposes
// - If you want to resell this Software or a derivative you must get permission from Low Power Lab LLC.
// - You must maintain the attribution and copyright notices in any forks, redistributions and
//   include the provided links back to the original location where this work is published,
//   even if your fork or redistribution was initially an N-th tier fork of this original release.
// - You must release any derivative work under the same terms and license included here.
// - This Software is released without any warranty expressed or implied, and Low Power Lab LLC
//   will accept no liability for your use of the Software (except to the extent such liability
//   cannot be excluded as required by law).
// - Low Power Lab LLC reserves the right to adjust or replace this license with one
//   that is more appropriate at any time without any prior consent.
// Otherwise all other non-conflicting and overlapping terms of the GPL terms below will apply.
// ********************************************************************************************
// This program is free software; you can redistribute it and/or modify it under the terms 
// of the GNU General Public License as published by the Free Software Foundation;
// either version 3 of the License, or (at your option) any later version.                    
//                                                        
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.
//                                                        
// You should have received a copy of the GNU General Public License along with this program.
// If not license can be viewed at: http://www.gnu.org/licenses/gpl-3.0.txt
//
// Please maintain this license information along with authorship
// and copyright notices in any redistribution of this code
// **********************************************************************************

//var io = require('socket.io').listen(8080);
var io = require('socket.io').listen(8888);
var Datastore = require('nedb');
var globalFunctions = require('./globals');
var alerts = require('./alerts');
var clients = require('./clients');
var logger = require("./logger");
var cfg = require('./config.default');

var alertsDef = new alerts();
var clientsDef = new clients();

// db to keep all devices and changes
var db = new Datastore({ filename: __dirname + '/databases/DBclients.db', autoload: true });
db.persistence.setAutocompactionInterval(86400000); //daily

// authorize handshake - make sure the request is coming from nginx, 
// not from the outside world. If you comment out this section, you 
// will be able to hit this socket directly at the port it's running
// at, from anywhere! This was tested on Socket.IO v1.2.1 and will 
// not work on older versions
io.use(function(socket, next) {
    var handshakeData = socket.request;
    var remoteAddress = handshakeData.connection.remoteAddress;
    var remotePort = handshakeData.connection.remotePort;
    logger.info("AUTHORIZING CONNECTION FROM " + remoteAddress + ":" + remotePort);
    if (remoteAddress == "localhost" || remoteAddress == "127.0.0.1") {
        logger.info('IDENTITY ACCEPTED: from local host');
        next();
    } else {
        var remote_add = remoteAddress.split(".",3);
        var compare_str = cfg.locnet.start.split(".",3);
        if (remote_add[0] == compare_str[0] && remote_add[1] == compare_str[1] && remote_add[2] == compare_str[2]) {
            logger.info('IDENTITY ACCEPTED: from local network');
            next();
        } else {
            logger.error('REJECTED IDENTITY, not coming from local network');
            next(new Error('REJECTED IDENTITY, not coming from local network'));
        }
    }
});

io.on('connection', function (socket) {
    logger.info("Socket connected!");
    socket.emit('ALERTSDEF', alertsDef.availableAlerts);
    socket.emit('CLIENTSDEF', clientsDef);

    db.find({ _id : { $exists: true } }, function (err, entries) {
        io.emit('UPDATENODES', entries);
    });
  
    socket.on('SEND_DATA', function (deviceData) {
        logger.info("Updating node info for node: " + deviceData.name);
        db.find({ _id : deviceData.deviceID }, function (err, entries) {
            var existingNode = new Object();
            if (entries.length == 1)
                existingNode = entries[0];
            existingNode._id = deviceData.deviceID;
            //existingNode.rssi = deviceData.signalStrength; //update signal strength we last heard from this node, regardless of any matches
            existingNode.type = deviceData.type;
            existingNode.label = deviceData.name;
            existingNode.Status = deviceData.Status;
            existingNode.lastStateChange = deviceData.lastStateChange;
            existingNode.updated = new Date().getTime(); //update timestamp we last heard from this node, regardless of any matches
			
	    // set up existing alert schedules
	    if (existingNode.alerts) {
	        for (var alertKey in existingNode.alerts) {
		    if (existingNode.alerts[alertKey].alertStatus) {
		        if (existingNode.Status == existingNode.alerts[alertKey].clientStatus) {
		            addSchedule(existingNode, alertKey);
		        } else {
			    removeSchedule(existingNode._id, alertKey);
		        }
		    }
		}
	    }
			
	    // add entry into database
            if (entries.length == 0) {
                db.insert(existingNode);
                logger.info(' [' + existingNode._id + '] DB-Insert new _id:' + id);
            } else {
                db.update({_id:existingNode._id},{$set:existingNode},{}, function (err,numReplaced) {
                    logger.info(' [' + existingNode._id + '] DB-Updates:' + numReplaced);
                });
            }

            io.emit('LOG', existingNode);
            io.emit('UPDATENODE', existingNode);
            alertsDef.handleNodeAlerts(existingNode);
        });
    });
  
    socket.on('CLIENT_INFO', function (deviceData) {
        logger.info("Updating client info for node: " + deviceData.nodeID);
        db.find({ _id : deviceData.nodeID }, function (err, entries) {
            if (entries.length == 1) {
                var existingNode = entries[0];
                existingNode.infoUpdate = deviceData.lastUpdate||undefined;
                existingNode.rssi = deviceData.wifi||undefined;
                existingNode.uptime = deviceData.uptime||undefined;
                existingNode.cpuTemp = deviceData.cpuTemp||undefined;
                existingNode.temperature = deviceData.temperature||undefined;
                existingNode.humidity = deviceData.humidity||undefined;
                existingNode.photo = deviceData.photo||undefined;
			
                db.update({_id:deviceData.nodeID},{$set:existingNode},{}, function (err,numReplaced) {
                    //logger.info(' [' + deviceData.nodeID + '] CLIENT_INFO records replaced:' + numReplaced);
                });
                io.emit('UPDATENODE', existingNode);
            }
        });
    });
  
    socket.on('CONSOLE', function (msg) {
        logger.info(msg);
    });
	
    socket.on('UPDATE_DB_ENTRY', function (node) {
        db.find({ _id : node._id }, function (err, entries) {
            if (entries.length == 1) {
                var dbNode = entries[0];
                dbNode.type = node.type||undefined;
                dbNode.label = node.label||undefined;
                dbNode.descr = node.descr||undefined;
                dbNode.hidden = (node.hidden == 1 ? 1 : undefined);
                db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { 
                    logger.info('UPDATE_DB_ENTRY records replaced:' + numReplaced);
                });
                io.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
                logger.debug("UPDATE DB ENTRY found docs:" + entries.length);
            }
        });
    });
  
    socket.on('EDITNODEALERT', function (nodeId, alertKey, newAlert) {
        logger.debug('**** EDITNODEALERT  **** key:' + alertKey);
        db.find({ _id : nodeId }, function (err, entries) {
            if (entries.length == 1) {
                var dbNode = entries[0];
				
		        if (newAlert == null) {
		            if (dbNode.alerts[alertKey])
    		            delete dbNode.alerts[alertKey];
		        } else {
                    if (!dbNode.alerts) {
                        dbNode.alerts = {};
                    }
                    dbNode.alerts[alertKey] = newAlert;
 	            }
                
		        db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) {
                    logger.debug('DB alert Updated:' + numReplaced);
                });

                if (dbNode.alerts[alertKey] && dbNode.alerts[alertKey].alertStatus) {
			        addSchedule(dbNode, alertKey);
		        } else {
			        removeSchedule(dbNode._id, alertKey);
		        }
                io.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
            }
        });
    });
  
    socket.on('NODEACTION', function (node) {
        if (node.nodeId && node.action) {
            logger.info('NODEACTION sent: ' + JSON.stringify(node));
            io.emit('ACTION', node);
        }
    });

    socket.on('DELETENODE', function (nodeId) {
        db.remove({ _id : nodeId }, function (err, removedCount) {
            logger.info('DELETED entries: ' + removedCount);
            db.find({ _id : { $exists: true } }, function (err, entries) {
                io.emit('UPDATENODES', entries);
            });
        });
		removeSchedule(nodeId, null);
    });
	
    socket.on('SCHEDULE', function () {
        logger.info("Scheduled Alerts: " + scheduledAlerts);
        //io.emit('LOG', scheduledAlerts);
    });
});

// ************************************
// ********** SCHEDULE SETUP **********
// ************************************

//keep track of scheduler based events - these need to be kept in sych with the UI
//if UI removes an event, it needs to be cancelled from here as well;
// if UI adds a scheduled event it needs to be scheduled and added here also
scheduledAlerts = []; //each entry should be defined like this: {nodeId, eventKey, timer}
  
//schedule and register a scheduled type event
//function schedule(node, alertKey) {
function addSchedule(node, alertKey) {
    var nextRunTimeout = node.alerts[alertKey].timeout;
    logger.info('**** ADDING ALERT - nodeId:' + node._id + ' event:' + alertKey + ' to run ' + (nextRunTimeout/60000).toFixed(2) + ' minutes after status is ' + node.alerts[alertKey].clientStatus);
    var theTimer = setTimeout(function() {
        var currentTime = new Date().getTime();
		logger.debug('Alert Timeout Function for node ' + node._id + ', alert for ' + alertKey);
        if (node.alerts[alertKey].clientStatus == node.Status && currentTime - node.lastStateChange >= node.alerts[alertKey].timeout) {
            alertsDef.testAlert(node, alertKey);
        }
        removeSchedule(node._id, alertKey);
    }, nextRunTimeout); //http://www.w3schools.com/jsref/met_win_settimeout.asp
    scheduledAlerts.push({nodeId:node._id, alertKey:alertKey, timer:theTimer}); //save nodeId, eventKey and timer (needs to be removed if the event is disabled/removed from the UI)
}

function removeSchedule(nodeId, alertKey) {
    for (var s in scheduledAlerts) {
        if (scheduledAlerts[s].nodeId == nodeId) {
            if (alertKey == null || scheduledAlerts[s].alertKey == alertKey){
                logger.info('**** REMOVING SCHEDULED ALERT - nodeId:' + nodeId + 'alert:' + scheduledAlerts[s].alertKey);
                clearTimeout(scheduledAlerts[s].timer);
                scheduledAlerts.splice(scheduledAlerts.indexOf(scheduledAlerts[s]), 1)
            }
        }
    }
}

// ************************************
