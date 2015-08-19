# XMPPie
 Connect to XMPP server
 
      var settings = {
          URL: 'http://216.244.102.100:7070/http-bind/',
          OPENFIREID: {{openfireid}} + "/" + {{nickname}},
          PASSWORD:  {{openfirepassword}}
      }
            
      XMPPie.connect(settings);
        
 Event called when user is succesfully connected to openfire server

      XMPPie.on('authenticationSuccess', function (event, data) {
             
      });
 Event called when user's connection to the openfire fails

      XMPPie.on('authenticationFail', function (event, data) {
             
      });
             
  Rertive Openfire Friends   
  
      XMPPie.on("rosterRetrive", function (event, data) {
                          
      });
              
  Presence detection
  
      XMPPie.on('presence', function (event, data) {

      });
              
  Rertive Openfire Groups
  
      XMPPie.on('groupRetrive', function (event, data) {

      });

      

  Event called when friends avtar(picture) is retrived

      XMPPie.on("vCard", function (event, data) {
                 
      });
      
      
  Event called when user get message for his rosters

      XMPPie.on("message", function (event, data) {
                 
      });
      
  Event called when user get message for user's connected groups
  
      XMPPie.on("groupmessage", function (event, data) {
                 
      });

  Event called when user get typing status from rosters
  
      XMPPie.on("typing", function (event, data) {
                
      });
      
  Send message to user
  $scope.sendMessage = function (body, isGroup) {
                 if (!isGroup) {
                     XMPPie.sendMessage({ "OpenfireID": $scope.userInfo.OpenfireID, "message": body, "body": { 'OpenfireID': XMPPie.OpenFireID, "Nickname": StorageHouse.getItem("FullName"), "Message": body, 'time': new Date().toISOString() } });
                 }
                 else {
                     XMPPie.sendGroupMessage({ "OpenfireID": $scope.userInfo.OpenfireID, "message": body, "body": { 'OpenfireID': XMPPie.OpenFireID, "Nickname": StorageHouse.getItem("FullName"), "Message": body, 'time': new Date().toISOString(), "isGroup": true, "GroupUserOpenfireID": XMPPie.OpenFireID } });
                 }

                 $scope.message = "";
                 $scope.isEmpty = false;
                 $scope.isdisable = true;
             }

             XMPPie.on("sendMessageSuccess", function (event, data) {
                 if ($scope.userInfo) {
                     if ($scope.userInfo.OpenfireID == data.to) {
                         $scope.isEmpty = false;
                         $scope.messages.push({ 'OpenfireID': XMPPie.OpenFireID, "Nickname": StorageHouse.getItem("FullName"), "Message": data.message, 'time': new Date().toISOString() });
                     }
                 }
             });
