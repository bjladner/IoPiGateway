<!DOCTYPE html>
<html lang="en">
<head>
  <title>Raspberry Pi Gateway</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="images/favicon.ico" type="image/x-icon">
  <script src="https://cdn.socket.io/socket.io-1.2.1.js"></script>
  <link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />
  <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
  <script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
  <script language="javascript" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.min.js"></script>
  <script language="javascript" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.time.min.js"></script>
  <script language="javascript" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.selection.min.js"></script>
  <link rel="stylesheet" type="text/css" href="index.css"/>
</head>
<body>
  <div data-role="page" id="homepage">
    <div data-role="header">
      <a href="http://lowpowerlab.com/gateway" target="new" data-role="none"><img src="images/logo.png" alt="LowPowerLab" title="LowPowerLab.com" style="float:left;display:inline;max-width:30px;padding:4px"/></a>
      <h1>Raspberry Pi Gateway</h1>
      <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal" data-mini="true">
        <a id="btnHiddenNodesToggle" href="#" data-role="button" data-icon="eye" data-iconpos="notext">Show hidden</a>
        <a id="btnSearch" href="#" data-role="button" data-icon="search" data-iconpos="notext">Search</a>
        <a href="#logpage" data-role="button" data-icon="bars" data-iconpos="notext">Log</a>
      </div>
    </div>

    <div id="loader" class="center-wrapper">
      <div style="padding:20px 0">
        <a href="http://lowpowerlab.com/gateway" target="new" data-role="none"><img src="images/logo.png" alt="LowPowerLab" title="LowPowerLab.com" style="max-width:100px;padding:4px"/></a>
      </div>
      
      <div class="ui-content center-div">
        <span id="loadingSocket" style="font-weight:bold">Waiting for socket connection..</span>
        <br/>
        <div style="padding:20px 0">
          <img src="images/loading.gif" />
        </div>
      </div>
    </div>
      
    <div data-role="main" class="ui-content">
      <form id="searchBox" class="ui-filterable" style="display:none">
        <input id="filter" data-type="search" placeholder="Search nodes..">
      </form>
      <ul id="nodeList" data-role="listview" data-inset="true" data-filter="true" data-input="#filter" data-theme="a" data-dividertheme="b"></ul>
    </div>

    <div data-role="footer">
      <h1><span style="font-size:11px">?? <a href="http://lowpowerlab.com">LowPowerLab.com</a> 2015. All rights reserved. <a href="http://lowpowerlab.com/gateway">About</a></span></h1>
    </div>
  </div>
  
  <div data-role="page" id="nodedetails">
    <div data-role="header">
      <h3><span id="nodeDetailTitle">Node details</span> <span class="nodeUpdated">x</span> <span id="nodeDetailStatus">Status</span></h3>
      <a id="node_update" href="#homepage" class="ui-btn ui-btn-inline ui-btn-b ui-shadow ui-corner-all ui-icon-home ui-btn-icon-left ui-mini ui-btn-notext">Home</a>
      
      <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
        <a href="#deleteNode" class="ui-btn ui-btn-inline ui-corner-all ui-icon-delete ui-btn-icon-left ui-mini" data-transition="fade">Delete</a>
      </div>
    </div>
    <div data-role="main" class="ui-content">
      <div class="ui-field-contain">
        <label for="nodeClientType" class="labelbold">Type:</label>
        <select id="nodeClientType" data-mini="true"></select>
        <label for="nodeLabel" class="labelbold">Label:</label>
        <input type="text" name="nodeLabel" id="nodeLabel" placeholder="node label..." />
        <label for="nodeDescr" class="labelbold">Description:</label>
        <input type="text" name="nodeDescr" id="nodeDescr" placeholder="description/location..." />
        <label for="nodeHidden" class="labelbold">Visibility:</label>
        <select name="nodeHidden" id="nodeHidden" data-role="slider" data-mini="true">
          <option value="0">visible</option>
          <option value="1">hidden</option>
        </select> 
      </div>
      
      <div class="center-wrapper">
        <div id="nodeControls" class="center-div">
        </div>
      </div>

      <ul id="alertList" data-role="listview" data-inset="true" data-theme="a" data-dividertheme="b"></ul>
      
      <div class="center-wrapper" style="margin-top:10px">
        <div id="nodeEvents" class="center-div">
          <div id="nodeControls" data-role="controlgroup" data-type="horizontal">
            <a id="addNodeAlert" href="#addAlert" data-role="button" data-icon="plus" style="background-color:#9BFFBE">Alert</a>
          </div>
        </div>
      </div>

      <span class="nodeDetailLabel">Node ID:</span><span class="nodeID">x</span><br/>
      <span class="nodeDetailLabel">Wifi Signal:</span><span class="rssi">x</span><br/>
      <span class="nodeDetailLabel">Client Uptime:</span><span class="upTime">x</span><br/>
      <span class="nodeDetailLabel">CPU Temp:</span><span class="cpuTemp">x</span><br/>
      <span class="nodeDetailLabel">Room Temp:</span><span class="roomTemp">x</span><br/>
      <span class="nodeDetailLabel">Humidity:</span><span class="humidity">x</span><br/>
      <span class="nodeDetailLabel">Last Sensor Update:</span><span class="infoUpdate">x</span><br/>
    </div>
  </div>

  <div data-role="page" id="addAlert" data-dialog="true">
    <div data-role="main" class="ui-content">
      <div class="center-wrapper" style="padding:20px">
        <h3>Pick the alert type:</h3>
      </div>
      <select id="addAlertType" data-mini="true"></select>
      <div class="center-wrapper" style="padding:8px; font-size:12px; font-weight:bold; color:red"><span id="addAlertDescr">&nbsp;</span></div>
      <div class="center-wrapper" id="addAlertVariables" style="padding:8px; font-size:12px; font-weight:bold">
        <div class="center-wrapper"><label>Destination: <input id="addAlertDest" type="text" placeholder="destination" required></label></div>
	<div class="center-wrapper"><label>Timeout (in minutes): <input id="addAlertTime" type="text" placeholder="timeout" required></label></div>
        <select id="addAlertState" data-role="slider" data-mini="true">
          <option value="0">open</option>
          <option value="1">closed</option>
        </select> 
      </div>
      <div class="center-wrapper">
        <a id="addAlert_OK" href="#nodedetails" class="ui-btn ui-btn-inline ui-btn-b ui-shadow ui-corner-all ui-icon-check ui-btn-icon-left ui-mini" data-rel="nodedetails" style="background-color:#9BFFBE;color:#000">Add</a>
        <a href="#" class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-mini ui-icon-back ui-btn-icon-left" data-rel="back">Cancel</a>
      </div>
    </div>
  </div>

  <div data-role="page" id="deleteNode" data-dialog="true">
    <div data-role="main" class="ui-content">
      <div class="center-wrapper" style="padding:20px">
        <h3>Are you sure you want to remove this node?</h3>
      </div>
      <div class="center-wrapper"><span style="padding:10px">Further data from node will make it appear again.</span></div>
      <div class="center-wrapper" style="padding:20px">
        <a id="deleteNode_yes" href="#homepage" class="ui-btn ui-btn-inline ui-btn-b ui-shadow ui-corner-all ui-icon-check ui-btn-icon-left ui-mini" data-rel="homepage" style="background: red; color: white;">Delete</a>
        <a href="#" class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-mini ui-icon-back ui-btn-icon-left" data-rel="back">Cancel</a>
      </div>
    </div>
  </div>

  <div data-role="page" id="logpage">
    <div data-role="header">
      <a href="#homepage" class="ui-btn ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left">Home</a>
      <h1>Raw data log</h1>
      <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal" data-mini="true">
        <a id="btnRawToggle" href="#" data-role="button" data-icon="arrow-u" data-iconpos="notext">Raw send</a>
        <a id="clearbtn" href="#" data-role="button" data-icon="delete" data-iconpos="notext">Clear</a>
      </div>
    </div>

    <div class="rawAction" style="display:none">
      <span id="rawActionIDspan">
        <input type="text" id="rawActionID" data-mini="true" placeholder="node ID" />
      </span>
      <span id="rawActionTextspan">
         <input type="text" id="rawActionText" data-mini="true" placeholder="message..." />
      </span>
      <span id="rawActionSendspan">
        <a id="rawActionSend" data-role="button">Send</a>
      </span>
    </div>

    <div id="wrap">
      <textarea name="log" id="log" rows="10" style="font-size:10px;"></textarea>
    </div>
  </div>

  <script type="text/javascript">
    $(function(){
        var nodes = {};        // this holds the current nodes data
        var selectedNodeId;    // points to the selected node ID
        var clientsDef;        // holds the definition of the clients (from server side clients.js)
        var alertsDef;         // holds the definition of the alerts (from server side alerts.js)
        var showHiddenNodes=false;
        //var socket = io.connect('<?php echo $_SERVER['HTTP_HOST']; ?>', {'connect timeout': 1000}); //limit chrome xhr-polling fall back delay
        //var socket = io('/iopi').connect('<?php echo $_SERVER['HTTP_HOST']; ?>', {'connect timeout': 1000}); //limit chrome xhr-polling fall back delay
        var socket = io('/iopi').connect();
        $('#nodeList').hide();
    
        function LOG(data) {
            $('#log').val(new Date().toLocaleTimeString() + ' : ' + data + '\n' + $('#log').val());
            if ($('#log').val().length > 5000) 
                $('#log').val($('#log').val().slice(0,5000));
        };
    
        socket.on('connect', function(){
            LOG('Connected!');
            $('#loadingSocket').html('<span style="color:#2d0">Connected!</span><br/><br/>Waiting for data..');
        });

        socket.on('disconnect', function () {
            $('#log').val(new Date().toLocaleTimeString() + ' : Disconnected!\n' + $('#log').val());
            $("#loader").show();
            $('#loadingSocket').html('Socket was <span style="color:red">disconnected.</span><br/><br/>Waiting for socket connection..');
            if ($.mobile.activePage.attr('id') != 'homepage')
                $.mobile.navigate('#homepage', { transition : 'slide'});
            $('#nodeList').hide();
        });
    
        socket.on('UPDATENODE', function(entry) {
            socket.emit("CONSOLE", "in UPDATENODE");
            updateNode(entry);
            refreshNodeListUI();
        });
    
        socket.on('UPDATENODES', function(entries) {
            $("#loader").hide();
            $("#nodeList").empty();
            $('#nodeList').append('<li id="uldivider" data-role="divider"><h2>Nodes</h2><span class="ui-li-count ui-li-count16">Count: 0</span></li>');
            $('#nodeList').show();
            entries.sort(function(a,b){ 
                if (a.label && b.label) 
                    return a.label < b.label ? -1 : 1; 
                if (a.label) 
                    return -1; 
                if (b.label) 
                    return 1; 
                return a._id > b._id;
            });
            for (var i = 0; i < entries.length; ++i)
                updateNode(entries[i]);
            refreshNodeListUI();
            if ($.mobile.activePage.attr('id') != 'homepage')
                $.mobile.navigate('#homepage', { transition : 'slide'});
        });
    
        socket.on('CLIENTSDEF', function(clientsDefinition) {
            clientsDef = clientsDefinition;
            $("#nodeClientType").empty();
            $('#nodeClientType').append('<option value="">Select type...</option>');
            for(var client in clientsDef)
                $('#nodeClientType').append('<option value="' + client + '">' + clientsDef[client].label || client + '</option>');
            $("#nodeClientType").selectmenu();
        });
    
        socket.on('ALERTSDEF', function(alertsDefinition) {
            alertsDef = alertsDefinition;
            $('#addAlertType').change(function() {
                if ($(this).val()) {
                    $('#addAlertDescr').html('<span style="color:#000">Action: </span>' + (alertsDef[$(this).val()].icon ? '<span class="ui-btn-icon-notext ui-icon-'+alertsDef[$(this).val()].icon+'" style="position:relative;float:left"></span>' : '') + (alertsDef[$(this).val()].label || key));
	                $('#addAlertVariables').show();
                    $('#addAlert_OK').show();
                } else {
                    $('#addAlertDescr').html(' ');
	                $('#addAlertVariables').hide();
                    $('#addAlert_OK').hide();
                }
            });
        });

        $(document).on("pagecreate", "#eventAdd", function(){ 
            if ($('addAlertType').val()) {
	        $('#addAlertVariables').show();
                $('#addAlert_OK').show(); 
            } else {
	        $('#addAlertVariables').hide();
                $('#addAlert_OK').hide();
	    }
        });
    
        socket.on('LOG', function(data) {
            LOG(data);
        });
    
        socket.on('PLAYSOUND', function (soundFile) {
            new Audio(soundFile).play();
        });

        function getNodeIcon(nodeType) {
            if (clientsDef != undefined && nodeType != undefined && clientsDef[nodeType] != undefined)
                return clientsDef[nodeType].icon || 'icon_default.png';
            return 'icon_default.png';
        };
    
        function resolveRSSIImage(rssi) {
            if (rssi == undefined) return '';
            var img;
            if (Math.abs(rssi) > 95) img = 'icon_rssi_7.png';
            else if (Math.abs(rssi) > 90) img = 'icon_rssi_6.png';
            else if (Math.abs(rssi) > 85) img = 'icon_rssi_5.png';
            else if (Math.abs(rssi) > 80) img = 'icon_rssi_4.png';
            else if (Math.abs(rssi) > 75) img = 'icon_rssi_3.png';
            else if (Math.abs(rssi) > 70) img = 'icon_rssi_2.png';
            else img = 'icon_rssi_1.png';
            return '<img class="listIcon20px" src="images/'+img+'" title="RSSI:-'+Math.abs(rssi)+'" />';
        }

        function updateNode(node) {
            LOG(JSON.stringify(node));
            if (node._id) {
                nodes[node._id] = node;
                var listItem = '<li id="' +  node._id + '"><a node-id="' + node._id;
                listItem = listItem + '" href="#nodedetails" class="nodedetails"><img class="productimg" src="images/'+getNodeIcon(node.type)+'">';
                listItem = listItem + '<h2>' + (node.label || node._id) + ' ' + resolveRSSIImage(node.rssi) + ' ' + ago(node.updated, 0).tag;
                listItem = listItem + (node.hidden ? ' <img class="listIcon20px" src="images/icon_hidden.png" />' : '') + '</h2>';
                listItem = listItem + '<p>' + (node.descr || '&nbsp;') + '</p>';
                listItem = listItem + '<span class="ui-li-count ui-li-count16">' + node.Status + '</span></a></li>';
                var newLI = $(listItem);
                var existingNode = $('#nodeList li#' + node._id);
                if (node.hidden)
                    if (showHiddenNodes)
                        newLI.addClass('hiddenNodeShow');
                    else
                        newLI.addClass('hiddenNode');
                if(existingNode.length)
                    existingNode.replaceWith(newLI);
                else 
                    $('#nodeList').append(newLI);
                if (node._id == selectedNodeId) 
                    refreshNodeDetails(node);
            }
        }
    
        function refreshNodeListUI() {
            var hiddenCount = $('.hiddenNode, .hiddenNodeShow').length;
            $('#uldivider span').html('Count: ' + ($('#nodeList li:not(#uldivider)').length) + (hiddenCount > 0 ? ', ' +hiddenCount +' hidden' : ''));
            if (hiddenCount > 0)
                $('#btnHiddenNodesToggle').show();
            else {
                showHiddenNodes = false;
                $('#btnHiddenNodesToggle').removeClass('ui-btn-b').hide();
            }
            $('#nodeList').listview('refresh'); //re-render the listview
        }

        function ago(time, agoPrefix) {
            agoPrefix = (typeof agoPrefix !== 'undefined') ?  agoPrefix : true;
            var now = new Date().getTime();
            var update = new Date(time).getTime();
            var lastupdate = (now-update)/1000;
            var s = (now-update)/1000;
            var m = s/60;
            var h = s/3600;
            var updated = s.toFixed(0) + 's';
            if (s<6) updated = 'now';
            if (s>=60) updated = m.toFixed(0)+'m';
            if (h>=2) updated = h.toFixed(0)+'h';
            var theColor = 'ff8800'; //dark orange //"rgb(255,125,20)";
            if (s<6) theColor = "00ff00"; //dark green
            else if (s<30) theColor = "33cc33"; //green
            else if (s<60) theColor = 'ffcc00'; //light orange
            if (h>=3) theColor = 'ff0000'; //red
            theColor = '#'+theColor;
            updated = updated+(agoPrefix && updated!=='now'?' ago':'');
            return {text:updated,color:theColor,tag:'<span data-time="'+time+'" class="nodeAgo" style="color:'+theColor+';">'+updated+'</span>'};
        }

        function updateAgos() {
            $("span.nodeAgo").each(function(){
                var timestamp = parseInt($(this).attr('data-time'));
                var agoResult = ago(timestamp, false);
                $(this).css('color', agoResult.color);
                $(this).html(agoResult.text);
            });
        }
    
        //refresh "updated X ago" indicators
        var updateAgosTimer = setInterval(updateAgos,3000);
    
        $("#btnSearch").click("tap", function(event) {
            if ($("#searchBox").is(":visible")) {
                $("#searchBox").slideUp('fast');
                $("#btnSearch").removeClass('ui-btn-b');
            } else {
                $("#searchBox").slideDown('fast');
                $("#btnSearch").addClass('ui-btn-b');
            }
        });
    
        $("#btnHiddenNodesToggle").click("tap", function(event) {
            if (showHiddenNodes) {
                $(".hiddenNodeShow").removeClass('hiddenNodeShow').addClass('hiddenNode');
                $("#btnHiddenNodesToggle").removeClass('ui-btn-b');
                showHiddenNodes = false;
            } else {
                $(".hiddenNode").removeClass('hiddenNode').addClass('hiddenNodeShow');
                $("#btnHiddenNodesToggle").addClass('ui-btn-b');
                showHiddenNodes = true;
            }
        });
    
        $("#btnRawToggle").click("tap", function(event) {
           if ($(".rawAction").is(":visible")) {
                $(".rawAction").slideUp('fast');
                $("#btnRawToggle").removeClass('ui-btn-b');
            } else {
                $(".rawAction").slideDown('fast');
                $("#btnRawToggle").addClass('ui-btn-b');
            }
        });
       
        function refreshNodeDetails(node) {
            socket.emit("CONSOLE", "In refreshNodeDetails function for " + node.label);
            $('#nodeLabel').val(node.label || '');
            $('#nodeDetailTitle').html(node.label || 'Node details');
			$('#nodeDetailStatus').html(' - ' + node.Status + ' - ' || 'Node status');
            $('#nodeClientType').val(node.type || '');
            $("#nodeClientType").selectmenu('refresh',true);
            $('#nodeDescr').val(node.descr || '');
            $('#nodeHidden').val(node.hidden||0);
            $('#nodeHidden').slider().slider('refresh');
     
            $('.nodeID').html(node._id);
            $('.rssi').html(node.rssi);
            $('.upTime').html(node.uptime);
            $('.cpuTemp').html(node.cpuTemp);
            $('.roomTemp').html(node.temperature);
            $('.humidity').html(node.humidity);
            $('.infoUpdate').html(node.infoUpdate);
            $('.nodeUpdated').html(ago(node.updated, false).tag);
      
            //display alerts list
            $('#alertList').empty();
            for(var key in node.alerts) {
	            if (node.alerts[key] != null) {
                    var alrt = alertsDef[node.alerts[key].alertType];
                    var enabled = node.alerts[key].alertStatus;
		            var timeout = (node.alerts[key].timeout/60000); // make timeout readable 
		            var description = 'Send notification to ' + node.alerts[key].destination + ' after ' + timeout + ' minutes of status ' + node.alerts[key].clientStatus;
                    var listItem = '<li style="background-color:' + (enabled ? '#2d0' : '#d00') + '">';
                    listItem = listItem + '<span class="ui-btn-icon-notext ui-icon-' + (enabled ? (alrt.icon ? alrt.icon : 'action') : 'minus');
                    listItem = listItem + '" style="position:relative;float:left;padding:15px 10px;"></span><a alert-id="' + key;
                    listItem = listItem + '" href="#" class="alertEnableDisable" style="padding-top:0;padding-bottom:0;"><h2>';
                    listItem = listItem + alrt.label + '</h2><p>' + description + '</p>' + '</a><a alert-id="' + key;
                    listItem = listItem + '" href="#" class="alertDelete" data-transition="pop" data-icon="delete"></a></li>';
                    var newLI = $(listItem);
                    var existingNode = $('#alertList li#alrt_' + key);
                    if(existingNode.length)
                        existingNode.replaceWith(newLI);
                    else 
                        $('#alertList').append(newLI);
		        }
            }
            $('#alertList').listview().listview('refresh');
      
            //handle node controls/buttons
            $('#nodeControls').hide();
            if (clientsDef[node.type] && clientsDef[node.type].controls) {
                var showControls=false;
                $('#nodeControls').empty();
                for (var cKey in clientsDef[node.type].controls) {
                    var control = clientsDef[node.type].controls[cKey];
                    var newBtn = $('<a href="#" data-role="button" class="ui-btn ui-btn-inline ui-shadow ui-corner-all">' + control.label + '</a>');
                    if (control.css) 
                        newBtn.attr('style',control.css);
                    if (control.icon) {
                        newBtn.addClass('ui-btn-icon-left');
                        newBtn.addClass('ui-icon-' + control.icon);
                    }
                    newBtn.bind('click', {nodeId:node._id, action:control.action}, function(event) {
                        socket.emit("NODEACTION", {nodeId:event.data.nodeId, action:event.data.action});
                    });
                    $('#nodeControls').append(newBtn);
                    showControls = true;
                }
                if (showControls) {
                    $('#nodeControls').show();
                }
            }
        }

        $(document).on("click", ".nodedetails", function () {
            var nodeId = $(this).attr('node-id');
            selectedNodeId = parseInt(nodeId);
            var node = nodes[selectedNodeId];
            refreshNodeDetails(node);
        });
    
        $(document).on("click", ".alertEnableDisable", function () {
            var alertKey = $(this).attr('alert-id');
            var newAlert = nodes[selectedNodeId].alerts[alertKey];
            newAlert.alertStatus = !nodes[selectedNodeId].alerts[alertKey].alertStatus,
            socket.emit('EDITNODEALERT', selectedNodeId, alertKey, newAlert);
        });
    
        $(document).on("click", ".alertDelete", function () {
            var alertKey = $(this).attr('alert-id');
            socket.emit('EDITNODEALERT', selectedNodeId, alertKey, null);
        });

        $('#nodeLabel').keyup(function() {
            $('#nodeDetailTitle').html($('#nodeLabel').val() || 'no label');
        });

        $('#nodeClientType').change(function(){
            var node = nodes[selectedNodeId];
            notifyUpdateDB();
            refreshNodeDetails(node);
        });
    
        function notifyUpdateDB() {
            var node = nodes[selectedNodeId];
            node.label = $('#nodeLabel').val();
            node.type = $('#nodeClientType').val();
            node.descr = $('#nodeDescr').val();
            node.hidden = $('#nodeHidden').val() == 1 ? 1 : undefined; //only persist when it's hidden
            if (node.label.trim()=='' || node.label == controlsDef[node.type])
                node.label = node.type ? controlsDef[node.type].label : node.label;
            socket.emit('UPDATE_DB_ENTRY', nodes[selectedNodeId]);
        }
    
        $('#addNodeAlert').click("tap", function(event) {
            $('#addAlertDescr').html(' ');
            $('#addAlert_OK').hide();
	        $('#addAlertVariables').hide();
            $("#addAlertType").empty();
            $('#addAlertType').append('<option value="">Select type...</option>');
            for(var key in alertsDef){
                $('#addAlertType').append('<option value="' + key + '">' + (alertsDef[key].label || key) + '</option>');
            }
            $(document).on("pagebeforeshow", "#addAlert", function(event){
                $("#addAlertType").selectmenu('refresh');
                $("#addAlertType").val('');
            });
        });
    
        $("#node_update").click("tap", function(event) {
            notifyUpdateDB();
            $('#nodeList').listview('refresh');
        });
    
        $("#addAlert_OK").click("tap", function(event) {
            var alertType = $('#addAlertType').val();
	    LOG("adding alertID = " + alertType + " to node " + selectedNodeId);
            var count = 0;
            if (nodes[selectedNodeId].alerts.length > 0) {
                count = alertIndex(nodes[selectedNodeId].alerts, alertType);
            }
            alertID = alertType + count;
            var newAlert = {
                alertStatus: true,
                alertType: alertType,
                timeout: $('#addAlertTime').val() * 1000 * 60, // convert to minutes
                clientStatus: parseInt($('#addAlertState').val()) ? 'Closed' : 'Open',
                destination: $('#addAlertDest').val()
            }
            socket.emit('EDITNODEALERT', selectedNodeId, alertID, newAlert);
        });
        
        function alertIndex(alerts, alertType) {
            // return the lowest available index fot specific alertType
            var count = 0;
            var indices = [];
            var skipIndex = 0;
            LOG("# of alerts: " + alerts.length);
            for (var alert in alerts) {
                if (alerts[alert].alertType == alertType) {
                    indices[count] = parseInt(alert.substring(alertType.length, alert.length));
                    count++;
                }
            }
            if (count == 0) {
                return 0;
            } else {
/*                for (var i = 0, i < count, count++) {
                    skipIndex = 0;
                    for (new index in indicies) {
                        if (indicies[index] == i)
                            skipIndex = 1;
                    }
                    if (!skipIndex)
                        return i;
                }*/
                return count;
            }
        }

        $("#deleteNode_yes").click("tap", function(event) {
            nodes[selectedNodeId] = undefined;
            $('#nodeList li#' + selectedNodeId).remove();
            socket.emit('DELETENODE', selectedNodeId);
        });
    
        $("#clearbtn").click("tap", function(event) {
            $('#log').val('');
        });
    
        $("#rawActionSend").click("tap", function(event) {
            var node = {
                nodeId: $("#rawActionID").val(),
                action: $("#rawActionText").val()
            }
			if (node.nodeId == "svr") {
				serverAction(node.action);
			} else {
				socket.emit("NODEACTION", node);
			}
        });
    
	    function serverAction(action) {
			LOG(action);
			if (action == "sched") {
				socket.emit("SCHEDULE");
			}
		}
		
    });
  </script>
</body>
</html>
