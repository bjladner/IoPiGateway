$(document).ready(function() {
        var nodes = {};        // this holds the current nodes data
        var selectedNodeId;    // points to the selected node ID
        var clientsDef;        // holds the definition of the clients (from server side clients.js)
        var alertsDef;         // holds the definition of the alerts (from server side alerts.js)
        var showHiddenNodes=false;
        var socket = io.connect('<?php echo $_SERVER['HTTP_HOST']; ?>', {'connect timeout': 1000}); //limit chrome xhr-polling fall back delay
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
                    $('#addAlert_OK').show();
                } else {
                    $('#addAlertDescr').html(' ');
                    $('#addAlert_OK').hide();
                }
            });
        });

        $(document).on("pagecreate", "#eventAdd", function(){ 
            if ($('addAlertType').val()) 
                $('#addAlert_OK').show(); 
            else 
                $('#addAlert_OK').hide();
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
            $("span.nodeMetricAgo").each(function(){
                var timestamp = parseInt($(this).attr('data-time'));
                var agoResult = ago(timestamp);
                $(this).css('color', agoResult.color);
                $(this).prop('title', agoResult.text);
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
            $('#nodeClientType').val(node.type || '');
            $("#nodeClientType").selectmenu('refresh',true);
            $('#nodeDescr').val(node.descr || '');
            $('#nodeHidden').val(node.hidden||0);
            $('#nodeHidden').slider().slider('refresh');
     
            $('.nodeID').html(node._id);
            $('.nodeRSSI').html(node.rssi);
            $('.nodeUpdated').html(ago(node.updated, false).tag);
      
            //display alerts list
            $('#alertList').empty();
            for(var key in node.alerts) {
                var alrt = alertsDef[node.alerts[key].alertType];
                var enabled = node.alerts[key].alertStatus;
                if (!alrt) 
                    continue;
                var listItem = '<li style="background-color:' + (enabled ? '#2d0' : '#d00') + '">';
                listItem = listItem + '<span class="ui-btn-icon-notext ui-icon-' + (enabled ? (alrt.icon ? alrt.icon : 'action') : 'minus');
                listItem = listItem + '" style="position:relative;float:left;padding:15px 10px;"></span><a alert-id="' + key;
                listItem = listItem + '" href="#" class="alertEnableDisable" style="padding-top:0;padding-bottom:0;"><h2>';
                listItem = listItem + alrt.label + '</h2><p> To: ' + (alrt.destination || '&nbsp;') + '</p>' + '</a><a alert-id="' + key;
                listItem = listItem + '" href="#" class="alertDelete" data-transition="pop" data-icon="delete"></a></li>';
                var newLI = $(listItem);
                var existingNode = $('#alertList li#alrt_' + key);
                if(existingNode.length)
                    existingNode.replaceWith(newLI);
                else 
                    $('#alertList').append(newLI);
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
            $("#addAlertType").empty();
            $('#addAlertType').append('<option value="">Select type...</option>');
            for(var key in alertsDef){
                $('#addAlertType').append('<option value="' + key + '">' + (alertsDef[key].label || key) + '</option>');
            }
            // TODO: add places to choose status and timeout for alert (and maybe destination email/sms)
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
            var alertID = $('#addAlertType').val();
            // TODO: Add unique alertIDs to have multiple alerts of the same type
            //var count = 0;
            //if (nodes[selectedNodeID].alerts)
            //    for (var alrt in nodes[selectedNodeID].alerts)
            //        if (nodes[selectedNodeID].alerts[alrt].alertType == alertID)
            //            count++;
            //alertID = alertID + count;
            var newAlert = {
                alertStatus: true,
                alertType: alertID,
                timeout: (5 * 60 * 1000), // 5 minutes
                clientStatus: 'Open',
                destination: ''
            }
            socket.emit('EDITNODEALERT', selectedNodeId, alertID, newAlert);
        });

        $("#deleteNode_yes").click("tap", function(event) {
            nodes[selectedNodeId] = undefined;
            $('#nodeList li#' + selectedNodeId).remove();
            socket.emit('DELETENODE', selectedNodeId);
        });
    
        $("#clearbtn").click("tap", function(event) {
            $('#log').val('');
        });
    
        $("#rawActionSend").click("tap", function(event) {
            socket.emit("NODEACTION", {nodeId:$("#rawActionID").val(), action:$("#rawActionText").val()});
        });
    
        //enforce positive numeric input
        $("#rawActionID").on("keypress keyup blur",function (event) {    
            $(this).val($(this).val().replace(/[^\d].+/, ""));
            if ((event.which < 48 || event.which > 57) || $(this).val().length > 3) {
                event.preventDefault();
            }
            //max node ID is 255 with packet header defaults in RFM69 library
            if ($(this).val() > 255) $(this).val(255);
        });
    
        //graph value tooltips container
        $("<div id='tooltip'></div>").css({
			position: "absolute",
			display: "none",
            fontSize: "11px",
			border: "1px solid #fdd",
			padding: "2px",
			"background-color": "#fee",
			opacity: 0.80
		}).appendTo("body");
});