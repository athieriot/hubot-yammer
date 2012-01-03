var request = require('request')
  , qs = require('querystring')
  , url = require('url')
  ;
  
function RealTime (yam) {
  this.yam = yam;
}
RealTime.prototype.messages = function (cb) {
  this.yam.messages(function (e, body) {
    if (e) return cb(e);
    var meta = body.meta.realtime
      , id = 1
      ;
      
    request(
      { url: meta.uri + 'handshake'
      , headers: {'content-type':'application/json'}
      , method: 'POST'
      , body: JSON.stringify(
        [ { ext: {"token": meta.authentication_token}
          , version: "1.0"
          , minimumVersion: "0.9"
          , channel: "/meta/handshake"
          , supportedConnectionTypes: ["long-polling","callback-polling"]
          , id: id
          }
        ])
      }, function (e, resp, b) {
      if (e) return cb(e);
      if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
      var handshake = JSON.parse(b)[0];
      id += 1
      request.post(
        { url: meta.uri
        , headers: {'content-type':'application/json'}
        , body: JSON.stringify(
          [ { channel: "/meta/subscribe"
            , subscription: "/feeds/" + meta.channel_id + "/primary"
            , id: id
            , clientId: handshake.clientId
            }
          , { channel: "/meta/subscribe"
            , subscription: "/feeds/" + meta.channel_id + "/secondary"
            , id: id + 1
            , clientId: handshake.clientId
            }
          ])
        }, function (e, resp, b) {
          if (e) return cb(e);
          console.log(b)
          if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
          id += 1
          var getchannel = function () {
            id += 1
            request.post(
              { url: meta.uri + 'connect'
              , headers: {'content-type': 'application/json'}
              , body: JSON.stringify(
                [ { channel: "/meta/connect"
                  , connectionType: 'long-polling'
                  , id: id
                  , clientId: handshake.clientId 
                  }
                ])
              }, function (e, resp, b) {
                if (e) return cb(e);
                if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
                var b = JSON.parse(b);
                b.pop()

                b.forEach(function (r) {
                  cb(null, r.data);
                })
                getchannel();
              }
            )
          }
          getchannel();
        }
      )
    })
  })
}

function Yammer (opts) {
  this.opts = opts;
  this.realtime = new RealTime(this);
}
Yammer.prototype._req = function (opts, cb) {
  var auth
  if (!this.opts.access_token) {
    auth = 'OAuth ' +
           'oauth_consumer_key="'+this.opts.oauth_consumer_key+'",' +
           'oauth_token="'+this.opts.oauth_token+'",' +
           'oauth_signature_method="'+ (this.opts.oauth_signature_method || "PLAINTEXT") + '",' +
           'oauth_timestamp="'+(this.opts.oauth_timestamp || (new Date()).getTime())+'",' +
           'oauth_nonce="'+(this.opts.oauth_nonce || Math.floor(Math.random()*1111111111))+'",' +
           'oauth_verifier="'+this.opts.oauth_verifier+'",' +
           'oauth_signature="'+this.opts.oauth_signature+'%26'+this.opts.oauth_token_secret+'"'
           ;
  }
  
  
  if (opts.uri[opts.uri.length - 1] === '.') {
    opts.uri += (this.opts.format || 'json');
  }
  
  if (this.opts.access_token) {
    var u = url.parse(opts.uri);
    var q = qs.parse(u.query);
    q.access_token = this.opts.access_token;
    opts.uri = u.protocol + '//' + u.host + u.pathname + '?' + qs.stringify(q);
  }
  
  if (!opts.headers) opts.headers = {};
  if (auth) {
    opts.headers.authorization = auth;
  }
  // console.log(opts.body)
  request(opts, function (e, resp, body) {
    if (e) return cb(e);
    if (resp.statusCode > 399) {
      return cb(new Error('Error status '+resp.statusCode+'\n'), body, resp);
    }
    if (resp.headers['content-type'].slice(0, 'application/json'.length) === 'application/json') {
      cb(null, JSON.parse(body), resp);
    } else {
      cb(null, body, resp);
    }
  })
}
Yammer.prototype._get = function (url, cb) {
  this._req({uri:url, method:'GET'}, cb);
}
Yammer.prototype._formpost = function (url, data, cb) {
  this._req({uri:url, method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:qs.stringify(data)}, cb)
}
Yammer.prototype._post = function (url, data, cb) {
  this._req({uri:url, method:'POST', body:JSON.stringify(data), headers:{'content-type':'application/json'}}, cb)
}

Yammer.prototype.messages = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages.', cb);
}
Yammer.prototype.messagesSent = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/sent.', cb);
}
Yammer.prototype.messagesReceived = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/received.', cb);
}
Yammer.prototype.messagesFollowing = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/following.', cb);
}
Yammer.prototype.messagesFromUser = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/from_user/'+userid+'.', cb);
}
Yammer.prototype.messagesFromBot = function (botid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/bot_user/'+botid+'.', cb);
}
Yammer.prototype.messagesWithTag = function (tagid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/tagged_with/'+tagid+'.', cb);
}
Yammer.prototype.messagesInGroup = function (groupid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/in_group/'+groupid+'.', cb);
}
Yammer.prototype.messagesFavoritesOf = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/favorites_of/'+userid+'.', cb);
}
Yammer.prototype.messagesLikedBy = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/liked_by/'+userid+'.', cb);
}
Yammer.prototype.messagesInThread = function (threadid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/in_thread/'+threadid+'.', cb);
}
Yammer.prototype.messagesAboutTopic = function (id, cb) {
  this._get('https://www.yammer.com/api/v1/messages/about_topic/'+id+'.', cb);
}
Yammer.prototype.messagesPrivate = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/private.', cb);
}
Yammer.prototype.directMessages = Yammer.prototype.messagesPrivate;

Yammer.prototype.groups = function (cb) {
  this._get('https://www.yammer.com/api/v1/groups.', cb);
}
Yammer.prototype.group = function (id, cb) {
  this._get('https://www.yammer.com/api/v1/groups/'+id+'.', cb);
}

Yammer.prototype.topic = function (id, cb) {
  this._get('https://www.yammer.com/api/v1/topics/'+id+'.', cb);
}

Yammer.prototype.users = function (cb) {
  this._get('https://www.yammer.com/api/v1/users.', cb);
}
Yammer.prototype.user = function (id, cb) {
  this._get('https://www.yammer.com/api/v1/users/'+id+'.', cb);
}
Yammer.prototype.userByEmail = function (email, cb) {
  this._get('https://www.yammer.com/api/v1/users/by_email.json?email='+encodeURIComponent(email), cb);
}

Yammer.prototype.relationships = function (cb) {
  this._get('https://www.yammer.com/api/v1/relationships.', cb);
}

Yammer.prototype.suggestions = function (cb) {
  this._get('https://www.yammer.com/api/v1/suggestions.', cb);
}
Yammer.prototype.suggestedUsers = function (cb) {
  this._get('https://www.yammer.com/api/v1/suggestions/users.', cb);
}

Yammer.prototype.thread = function (id, cb) {
  this._get('https://www.yammer.com/api/v1/threads/'+id+'.', cb);
}


Yammer.prototype.checkUserSubscription = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/subscriptions/to_user/'+userid+'.', function (e, body, resp) {
    if (resp.statusCode === 404) {
      return cb(null, false);
    } 
    if (e) return cb(e, body);
    cb(null, body);
  });
}
Yammer.prototype.checkTagSubscription = function (tagid, cb) {
  this._get('https://www.yammer.com/api/v1/subscriptions/to_tag/'+tagid+'.', function (e, body, resp) {
    if (resp.statusCode === 404) {
      return cb(null, false);
    } 
    if (e) return cb(e, body);
    cb(null, body);
  });
}
Yammer.prototype.checkThreadSubscription = function (threadid, cb) {
  this._get('https://www.yammer.com/api/v1/subscriptions/to_thread/'+threadid+'.', function (e, body, resp) {
    if (resp.statusCode === 404) {
      return cb(null, false);
    } 
    if (e) return cb(e, body);
    cb(null, body);
  });
}
Yammer.prototype.checkTopicSubscription = function (topicid, cb) {
  this._get('https://www.yammer.com/api/v1/subscriptions/to_topic/'+topicid+'.', function (e, body, resp) {
    if (resp.statusCode === 404) {
      return cb(null, false);
    } 
    if (e) return cb(e, body);
    cb(null, body);
  });
}

// Yammer.prototype.createTopic = function (name, cb) {
//   this._formpost('https://www.yammer.com/api/v1/topics.', {id:name}, cb)
// }

Yammer.prototype.search = function (term, cb) {
  this._get('https://www.yammer.com/api/v1/search.json?search='+term, cb);
}

Yammer.prototype.networks = function (cb) {
  this._get('https://www.yammer.com/api/v1/networks/current.', cb);
}
// Yammer.prototype.showlikes = function (user, cb) {
//   if (typeof cb === undefined) {
//     cb = user
//     user = 'current'
//   }
//   this._get('https://www.yammer.com/api/v1/messages/liked_by/'+user+'.', cb)
// }

Yammer.prototype.invite = function (email, cb) {
  this._post('https://www.yammer.com/api/v1/invitations.', {email:email}, cb);
}
Yammer.prototype.createMessage = function (obj, cb) {
  this._formpost('https://www.yammer.com/api/v1/messages.json', obj, cb);
}

Yammer.prototype.presences = function (cb) {
  this._get('https://www.yammer.com/api/v1/presences.', cb);
}
Yammer.prototype.presencesByFollowing = function (cb) {
  this._get('https://www.yammer.com/api/v1/presences/by_following.', cb);
}

Yammer.prototype.tokens = function (cb) {
  this._get('https://www.yammer.com/api/v1/oauth/tokens.', cb)
}

exports.Yammer = Yammer
