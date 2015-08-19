/** XMPPie initalizer and setup 
* @name XMPPie
* @returns {object} expose the XMPPie config in global-namespace
* @description XMPPie Framework setup configrations
* @example -  XMPPie.xmlns.chatState
*/
var XMPPie = {
    XMPPClient: '',
    typingTimer: '',
    typerTimer: '',
    OpenFireID: '',
    SelectedUserName: '',
    myvCard: '',
    iqCallbacks: {},
    isConnected: '',
    eitherSelectedJID :'',
    tempStorage: {
        rosters: [],
    },
    Server: '',
    /** XMPPie Events engine 
    * @name XMPPie
    * @returns {event} expose the XMPPie events in global-namespace
    * @description XMPPie Framework event engine
    * @example -  XMPPie.emit('event-name',data);
    */
    emit: function (evt, data) {
        $(this).trigger(evt, [data]);
    },
    once: function (evt, handler) {
        $(this).one(evt, handler);
    },
    on: function (evt, handler) {
        $(this).bind(evt, handler);
    },
    off: function (evt, handler) {
        $(this).unbind(evt, handler);
    },
    xmlns: {
        chatState: 'http://jabber.org/protocol/chatstates',
        roster: 'jabber:iq:roster',
        archive: {
            namespace: 'urn:xmpp:archive',
            namespaceURL: 'http://jabber.org/protocol/rsm'
        },
        ping: 'urn:xmpp:ping',
        groups: 'http://jabber.org/protocol/disco#items',
        discoinfo: 'http://jabber.org/protocol/disco#info',
        node: 'http://jabber.org/protocol/offline',
        groupMembers: 'http://jabber.org/protocol/muc#admin',
        group: 'http://jabber.org/protocol/muc#user'
    },
    presence: {
        available: "Online",
        unavailable: "Offline",
        groups: "Groups"
    },
    messageState: {
        composing: 'composing',
        paused: 'paused',
        start: 1,
        stop: 0,
    },
    failure: {
        authenticationFailure: { Message: "XMPP authentication failure", Code: 0 },
        httpFailure: { Message: "HTTP status 404", Code: 1 },
        genericFailure: { Message: "XMPP disconnected", Code: 2 }
    },
    /**
    * @name XMPPie.isEmpty
    * @returns {boolean} 
    * @description weather data is empty or not
    * @example -  if(XMPPie.isEmpty(data))
    */
    isEmpty: function (data) {
        if (data == undefined || data == "undefiend") {
            return true;
        }
        else if (data == null) {
            return true;
        }
        else if (data.length == 0) {
            return true;
        }
        else {
            return false;
        }
    },

    /**
    * @name XMPPie.doExists
    * @returns {void} 
    * @description check for dublicate user
    */
    doExists: function (array, property, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][property] == value) {
                return true;
                break;
            }
        }
        return false;
    },
    /**
    * @name XMPPie.removeRoster
    * @returns {void} 
    * @description remove the specific friend from list
    */
    removeRoster: function (array, property, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][property] == value) {
                delete array[i];
                break;
            }
        }
    },

    /**
    * @name XMPPie.capitalizeFirstLetter
    * @returns {string} 
    * @description return the string with first letter as a captial char
    */
    capitalizeFirstLetter: function (string) {
        if (!isEmpty(string)) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    },

};

/**
* @name XMPPie.connect
* @returns {void} 
* @description expose public API to connect to the XMPP chat server
*/
XMPPie.connect = function (settings, callback) {

    /**Refresh bug workaround **/
    window.onbeforeunload = function (e) {
        XMPPie.disconnect();
    };

    /**
    * @name XMPP.Client
    * @returns {void}   
    * @description XMPP Client Connection setup .
    */
    this.XMPPClient = new XMPP.Client({
        bosh: { url: settings.URL },//'http://216.244.104.62:7070/http-bind/' },
        jid: settings.OPENFIREID,
        password: settings.PASSWORD,
        reconnect: true,
        preferred: 'PLAIN'
    });

    this.OpenFireID = settings.OPENFIREID.split("/")[0];
    this.Server = this.OpenFireID.split('@')[1];
    /** XMPP Private API's **/

    /**
    * @name XMPPie Private API's
    * @returns {void}   
    * @description Series of XMPP Private API's that will not be avaiable to the client.
    */
    this.XMPPClient.on('online', function (ev) {
        XMPPie.isConnected = true;
        this.send(new XMPP.Element('presence'));
        XMPPie.emit("authenticationSuccess", ev);
    });

    this.XMPPClient.on('error', function (ev) {
        XMPPie.isConnected = false;

        if (XMPPie.failure.authenticationFailure.Message == ev) {
            XMPPie.emit("authenticationFail", { 'ErrorMessage': ev, 'ErrorCode': XMPPie.failure.authenticationFailure.Code });
        }
        else if (XMPPie.failure.httpFailure.Message == ev.message) {
            XMPPie.emit("authenticationFail", { 'ErrorMessage': ev, 'ErrorCode': XMPPie.failure.httpFailure.Code });
        }
        else {
            XMPPie.emit("authenticationFail", { 'ErrorMessage': ev, 'ErrorCode': XMPPie.failure.genericFailure.Code });
        }
    });


    this.XMPPClient.on('stanza', function (stanza) {
        /** Message Handler **/
        if (stanza.attrs.type != 'error') {
            if (stanza.is('message')) {
                if (stanza.attrs.type == 'chat') {
                    if (stanza.getChild(XMPPie.messageState.paused)) {
                        XMPPie.emit("typing", { "OpenfireID": stanza.attrs.from.split('/')[0], "isTyping": XMPPie.messageState.stop });
                    }
                    else if (stanza.getChild(XMPPie.messageState.composing)) {
                        clearTimeout(XMPPie.typerTimer);
                        XMPPie.emit("typing", { "OpenfireID": stanza.attrs.from.split('/')[0], "isTyping": XMPPie.messageState.start });
                        XMPPie.typerTimer = setTimeout(function () {
                            XMPPie.emit("typing", { "OpenfireID": stanza.attrs.from.split('/')[0], "isTyping": XMPPie.messageState.stop });
                        }, 1000);
                    } else if (stanza.getChild('body')) {
                        var stamp = stanza.getChild('delay').attrs.stamp;
                        XMPPie.emit("message", { 'Message': stanza.getChild('body').getText(), "OpenfireID": stanza.attrs.from.split('/')[0], "Nickname": stanza.attrs.from.split('/')[1], "time": stamp });
                    }
                }
                else if (stanza.attrs.type == 'groupchat') {
                    var stamp = stanza.getChild('delay').attrs.stamp;
                    XMPPie.emit("groupmessage", { 'Message': stanza.getChild('body').getText(), "OpenfireID": stanza.attrs.from.split('/')[0], "Nickname": stanza.attrs.from.split('/')[1], "time": stamp, "isGroup": true, "GroupUserOpenfireID": stanza.getChild('delay').attrs.from });
                }
            }

            /** IQ Handler **/
            else if (stanza.is('iq')) {

                /** Roster's  Handler **/
                if (stanza.getChild('query')) {

                    if (stanza.attrs.id == "groups") {
                        var _rooms = stanza.getChild('query').getChildren('item');
                        for (var i = 0; i < _rooms.length; i++) {
                            XMPPie.joinRoom(_rooms[i].attrs.jid + "/devil");
                        }
                    }

                    else if (stanza.attrs.id == "rosters") {
                        var _items = stanza.getChild('query').getChildren('item');
                        if (_items.length > 0) {
                            for (var i = 0; i < _items.length; i++) {
                                if (_items[i].attrs.jid.indexOf(XMPPie.Server) != -1) {
                                    XMPPie.emit('rosterRetrive', { 'Name': XMPPie.capitalizeFirstLetter(_items[i].attrs.name), 'OpenfireID': _items[i].attrs.jid, 'presence': XMPPie.presence.unavailable, 'vCard': "/WorkVyneHTML5WebApp/images/chat-user.png" });
                                }
                            }
                        } else {
                            XMPPie.emit("rosterRetrive", { 'isEmpty': true });
                        }
                    }
                }
            }

            /** Presence  Handler **/
            else if (stanza.is('presence')) {
                try {
                    if (!stanza.attrs.id) {
                        if (stanza.attr('from').indexOf('conference') == -1) {
                            if (stanza.parent.getChild('iq')) {
                                var _items = stanza.parent.getChild('iq').getChild('query').getChildren('item')
                                for (var i = 0; i < _items.length; i++) {
                                    if (_items[i].attrs.jid.indexOf(XMPPie.Server) != -1) {
                                        XMPPie.emit('rosterRetrive', { 'Name': XMPPie.capitalizeFirstLetter(_items[i].attrs.name), 'OpenfireID': _items[i].attrs.jid, 'presence': XMPPie.presence.unavailable, 'vCard': "/WorkVyneHTML5WebApp/images/chat-user.png" });
                                    }
                                }
                            }
                            if (!stanza.attr('type')) {
                                if (stanza.getChild('status')) {
                                    XMPPie.emit('presence', { 'OpenfireID': stanza.attr('from').split('/')[0], 'presence': stanza.getChild('status').children[0] });
                                } else {
                                    XMPPie.emit('presence', { 'OpenfireID': stanza.attr('from').split('/')[0], 'presence': XMPPie.presence.available });
                                }
                            }
                            else {
                                XMPPie.emit('presence', { 'OpenfireID': stanza.attr('from').split('/')[0], 'presence': XMPPie.presence.unavailable });
                            }
                        }
                    }
                    else {
                        if (stanza.attrs.id == "offerPresence" || stanza.attrs.id == "answerPresence") {
                            if (stanza.attrs.id == "offerPresence") {
                                XMPPie.setPresenceWithID(stanza.attr('from').split('/')[0], "");
                            }
                            XMPPie.emit('presence', { 'OpenfireID': stanza.attr('from').split('/')[0], 'presence': XMPPie.presence.available });
                        }
                    }
                }
                catch (e) {
                    console.log("Error Thrown while reading presence");
                }
            }

            /** Callback detector **/
            var cb = XMPPie.iqCallbacks[stanza.attrs.id];
            if (cb) {
                cb(stanza);
                delete XMPPie.iqCallbacks[stanza.attrs.id];
            }
        }
    });

}

/** XMPPie Public API's **/

/**
* @name GetRosters 
* @param {string} OpenfireID 
* @description Get the list of firends. 
* @example XMPPie.getRosters(string)
**/
XMPPie.getRosters = function (OpenfireID) {
    var roster = new XMPP.Element('iq', {
        type: 'get',
        from: OpenfireID,
        id: 'rosters'
    }).c('query', { xmlns: this.xmlns.roster });

    this.XMPPClient.send(roster);
}


/*
* @name SendMessage 
* @param {object} params 
* @description Send message to selected friend
* @example XMPPie.sendMessage({string,string})
**/
XMPPie.sendMessage = function (params) {
    XMPPie.emit("sendMessageSuccess", {"message" : params.body.Message, "to" : params.OpenfireID });
    var stanza = new XMPP.Element('message', { to: params.OpenfireID, type: 'chat', from: XMPPie.OpenFireID + "/" + params.body.Nickname });
    stanza.c('body').t(params.message);
    stanza.c('delay', { xmlns: "urn:xmpp:delay", from: XMPPie.OpenFireID, stamp: params.body.time });
    this.XMPPClient.send(stanza);
}

/**
* @name SendGroupMessage 
* @param {object} params 
* @description Send message to selected conference or group
* @example XMPPie.sendGroupMessage({string,string})
**/
XMPPie.sendGroupMessage = function (params) {
    var stanza = new XMPP.Element('message', { to: params.OpenfireID, type: 'groupchat' })
    stanza.c('body').t(params.message);
    stanza.c('delay', { xmlns: "urn:xmpp:delay", from: XMPPie.OpenFireID, stamp: params.body.time });
    this.XMPPClient.send(stanza);
}
/**
* @name Typer 
* @param {string} OpenfireID 
* @description detec and return the typing state
* @example XMPPie.typer(string)
**/
XMPPie.typer = function (OpenfireID) {
    var stanza = new XMPP.Element('message', { from: this.OpenFireID, to: OpenfireID, type: 'chat' })
         .c('composing ', { xmlns: this.xmlns.chatState });
    this.XMPPClient.send(stanza);

    clearTimeout(this.typingTimer);
    this.typerTimer = setTimeout(function () {
        var stanza = new XMPP.Element('message', { from: XMPPie.OpenFireID, to: OpenfireID, type: 'chat' })
          .c('paused', { xmlns: XMPPie.xmlns.chatState });
        XMPPie.XMPPClient.send(stanza);
    }, 1000);
}

/**
* @name GetGroups 
* @description Get list Groups from xmpp server
* @example XMPPie.getGroups(void)
**/
XMPPie.getGroups = function () {
    var stanza = new XMPP.Element('iq', { from: this.OpenFireID, id: 'groups', type: 'get', to: 'conference.216.244.104.62' })
    .c('query ', { xmlns: this.xmlns.groups });
    this.XMPPClient.send(stanza);
}

/**
* @name GetVCard 
* @param {string} buddy 
* @param {function} callback 
* @description Get v-card into for user from xmpp server
* @example XMPPie.getVCard(string,function)
**/
XMPPie.getVCard = function (buddy, callback) {
    var id = 'get-vcard-' + buddy.split('@').join('--');
    var stanza = new XMPP.Element('iq', { type: 'get', id: id, from: this.OpenFireID, to: buddy }).
        c('vCard', { xmlns: 'vcard-temp' });

    this.iqCallbacks[id] = function (response) {
        if (response.attrs.type === 'error') {
        } else {
            XMPPie.emit("vCard", { 'vCard': XMPPie.parseVCard(response.children[0]), 'OpenfireID': buddy });
        }
    };
    this.XMPPClient.send(stanza);
};

/**
* @name parseVCard 
* @param {object} vcard
* @description parse v-card into for user from xmpp server
* @example XMPPie.parseVCard(object)
**/
XMPPie.parseVCard = function (vcard) {
    if (!vcard) {
        return null;
    }
    return vcard.children.reduce(function (jcard, child) {
        jcard[child.name.toLowerCase()] = (
            (typeof (child.children[0]) === 'object') ?
                XMPPie.parseVCard(child) :
                child.children.join('')
        );
        return jcard;
    }, {});
}

/**
* @name Reconnect 
* @description reconnect to xmpp server
* @example XMPPie.reconnect()
**/
XMPPie.reconnect = function () {
    this.XMPPClient.connect();
}

/**
* @name getOfflineMessageCount 
* @param {string} buddy
* @description getOfflineMessageCount for buddy
* @example XMPPie.getOfflineMessageCount(string)
**/
XMPPie.getOfflineMessageCount = function (buddy) {
    var stanza = new XMPP.Element('iq', { type: 'get', id: 'offlineMsg', from: XMPPie.OpenFireID, to: buddy }).c('query', { xmlns: this.xmlns.discoinfo, node: this.xmlns.node });
    this.XMPPClient.send(stanza);
}

/**
* @name updateAvtar 
* @param {object} obj
* @description update Avtar for buddy on xmpp server
* @example XMPPie.updateAvtar({string,string(base64)})
**/
XMPPie.updateAvtar = function (obj) {
    var stanza = new XMPP.Element('iq', { type: 'get', from: obj.OpenfireID, id: 'update-avatar' }).c('vCard', { xmlns: 'vcard-temp' }).c('PHOTO');
    stanza.c('TYPE').t('image/jpeg');
    stanza.c('BINVAL').t(obj.Base64Data);
    this.XMPPClient.send(stanza);
}

/**
* @name SetPresence 
* @param {int} status
* @description Set presence info for user
* @example XMPPie.setPresence(int)
**/
XMPPie.setPresence = function (status) {
    var stanza = new XMPP.Element('presence');
    if (!XMPPie.isEmpty(status)) {
        stanza.c('status').t(status);
    }
    this.XMPPClient.send(stanza);
};

XMPPie.setPresenceWithID = function (jid, status) {
    var id = null;
    var stanza = null;
    if (XMPPie.isEmpty(jid)) {
        id = 'offerPresence'
        stanza = new XMPP.Element('presence', { id: id }).c('status').t(status);
    }
    else {
        id = 'answerPresence'
        stanza = new XMPP.Element('presence', { id: id, to: jid, from: XMPPie.OpenFireID }).c('status').t(status);
    }

    this.XMPPClient.send(stanza);
};

/**
* @name Disconnect 
* @description disconnect from xmpp server
* @example XMPPie.disconnect()
**/
XMPPie.disconnect = function () {
    XMPPie.isConnected = false;
    this.XMPPClient.end();
}

/**
* @name JoinRoom 
* @param {string} to
* @description Join all the Room to whom user belong 
* @example XMPPie.joinRoom(string)
**/
XMPPie.joinRoom = function (to) {
    var id = 'join-room-' + to.split('@').join('--');
    var stanza = new XMPP.Element('presence', { to: to, id: id }).
           c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxchars: '0' });

    this.iqCallbacks[id] = function (response) {
        XMPPie.emit('groupRetrive', { 'Name': XMPPie.capitalizeFirstLetter(response.attrs.from.split('@')[0].split('_')[1]), 'OpenfireID': response.attrs.from.split('/')[0], 'presence': XMPPie.presence.groups, 'vCard': "", 'isGroup': true });
        XMPPie.getMemberList(response.attrs.from.split('/')[0]);
    }

    this.XMPPClient.send(stanza);
}

/**
* @name joinGroups 
* @param {object} obj
* @param {string} NickName
* @description Join all the Room to whom user belongs (based on TMC Database) 
* @example XMPPie.joinGroups(string,NickName)
**/
XMPPie.joinGroups = function (obj, NickName) {
    return new Promise(function (resolve, reject) {
        var id = 'join-room-' + obj.GroupJid.split('@').join('--');
        var stanza = new XMPP.Element('presence', { to: obj.GroupJid + "/" + NickName, id: id }).
               c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxchars: '0' });

        XMPPie.iqCallbacks[id] = function (response) {
            resolve(obj);
            XMPPie.emit('groupRetrive', { 'Name': XMPPie.capitalizeFirstLetter(obj.GroupName), 'OpenfireID': response.attrs.from.split('/')[0], 'presence': XMPPie.presence.groups, 'vCard': "/WorkVyneHTML5WebApp/images/chat-user.png", 'isGroup': true });
        }
        XMPPie.XMPPClient.send(stanza);
    });
}

/**
* @name GetMemberList 
* @param {string} roomJID
* @description get the list of members belong to specific group
* @example XMPPie.getMemberList(string)
**/
XMPPie.getMemberList = function (roomJID) {
    var id = 'get-roomMembers-' + roomJID.split('@').join('--');
    var stanza = new XMPP.Element('iq', { from: XMPPie.OpenFireID, id: id, to: roomJID, type: 'get' }).c('query', { xmlns: 'http://jabber.org/protocol/muc#admin' }).c('item', { 'affiliation': 'member' });

    this.iqCallbacks[id] = function (response) {
        //  console.log(response);
    };
    this.XMPPClient.send(stanza);
}

/**
* @name GetOnlineMeberList 
* @param {string} roomJID
* @description get the list of members who are online in specific group
* @example XMPPie.getOnlineMeberList(string)
**/
XMPPie.getOnlineMeberList = function (roomJID) {
    var id = 'get-roomMembers-' + roomJID.split('@').join('--');
    var stanza = new XMPP.Element('iq', { from: XMPPie.OpenFireID, id: id, to: roomJID, type: 'get' }).c('query', { xmlns: 'http://jabber.org/protocol/muc#admin' }).c('item', { 'affiliation': 'member' });

    this.iqCallbacks[id] = function (response) {
        //  console.log(response);
    };

    this.XMPPClient.send(stanza);
}

