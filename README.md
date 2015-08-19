# XMPPie
 Connect to XMPP server
 
      var settings = {
          URL: 'http://216.244.102.100:7070/http-bind/',
          OPENFIREID: {{openfireid}} + "/" + {{nickname}},
          PASSWORD:  {{openfirepassword}}
      }
            
      XMPPie.connect(settings);
        
 <b>Event called when user is succesfully connected to openfire server</b>

      XMPPie.on('authenticationSuccess', function (event, data) {
             
      });
  <b>Event called when user's connection to the openfire fails</b>

      XMPPie.on('authenticationFail', function (event, data) {
             
      });
             
   <b>Rertive Openfire Friends   </b>
  
      XMPPie.on("rosterRetrive", function (event, data) {
                          
      });
              
   <b>Presence detection</b>
  
      XMPPie.on('presence', function (event, data) {

      });
              
   <b>Rertive Openfire Groups</b>
  
      XMPPie.on('groupRetrive', function (event, data) {

      });

      

  <b> Event called when friends avtar(picture) is retrived</b>

      XMPPie.on("vCard", function (event, data) {
                 
      });
      
      
  <b> Event called when user get message for his rosters</b>

      XMPPie.on("message", function (event, data) {
                 
      });
      
  <b> Event called when user get message for user's connected groups</b>
  
      XMPPie.on("groupmessage", function (event, data) {
                 
      });

  <br>Event called when user get typing status from rosters</b>
  
      XMPPie.on("typing", function (event, data) {
                
      });
      
   <b>Send message to user</b>
  
       $scope.sendMessage = function (body, isGroup) {
          if (!isGroup) {
              XMPPie.sendMessage({ "OpenfireID": {{openfireid}} "message": body });
          }
          else {
              XMPPie.sendGroupMessage({ "OpenfireID": {{openfireid}}, "message": body });
          }
       }
       
 <b> Message sent callback </br>
      
       XMPPie.on("sendMessageSuccess", function (event, data) {
             
        });
        
  <b>Send typing presence </br>
        
        XMPPie.typer({{openfireid}});
        
  <b>set Presence</br>
 
        XMPPie.setPresence("Away");
        XMPPie.setPresence("Offline");
