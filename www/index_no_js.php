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
  <script language="javascript" type="text/javascript" src="index.js"></script>
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
      <h1><span style="font-size:11px">© <a href="http://lowpowerlab.com">LowPowerLab.com</a> 2015. All rights reserved. <a href="http://lowpowerlab.com/gateway">About</a></span></h1>
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
        var socket = io.connect('<?php echo $_SERVER['HTTP_HOST']; ?>', {'connect timeout': 1000}); //limit chrome xhr-polling fall back delay

        socket.on('connect', function(){
            LOG('Connected!');
            $('#loadingSocket').html('<span style="color:#2d0">Connected!</span><br/><br/>Waiting for data..');
        });
    });
  </script>
</body>
</html>
