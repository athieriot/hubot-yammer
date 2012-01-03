Robot        = require('hubot').robot()
Adapter      = require('hubot').adapter()

HTTPS        = require 'https'
EventEmitter = require('events').EventEmitter
Yammer        = require('./node-yammer').Yammer

class YammerAdapter extends Adapter
 send: (user, strings...) ->
   strings.forEach (str) =>
     text = str
     console.log text
     yamsText = str.split('\n')
     yamsText.forEach (yamText) =>
       @bot.send(user,yamText)

 reply: (user, strings...) ->
   strings.forEach (text) =>
       @bot.reply(user,text)

 run: ->
   self = @
   options =
    key         : process.env.HUBOT_YAMMER_KEY
    secret      : process.env.HUBOT_YAMMER_SECRET
    token       : process.env.HUBOT_YAMMER_TOKEN
    tokensecret : process.env.HUBOT_YAMMER_TOKEN_SECRET
   bot = new YammerRealtime(options)

   bot.listen (err, data) ->
      user_name = (reference.name for reference in data.references when reference.type is "user")

      data.messages.forEach (message) =>
         message = message.body.plain
         console.log "received #{message} from #{user_name}"

         self.receive new Robot.TextMessage user_name, message
      if err
         console.log "received error: #{err}"

   @bot = bot

exports.use = (robot) ->
 new YammerAdapter robot

class YammerRealtime extends EventEmitter
 self = @
 constructor: (options) ->
    if options.token? and options.secret? and options.key? and options.tokensecret?
      @yammer = new Yammer({
         "oauth_consumer_key": options.key,
         "oauth_token": options.token,
         "oauth_signature": options.secret,
         "oauth_token_secret": options.tokensecret
      })
    else
      throw new Error("Not enough parameters provided. I need a key, a secret, a token, a secret token")

 listen: (callback) ->
    @yammer.realtime.messages (err, data) ->
       callback err, data.data

 send : (user,yamText) ->
   console.log "send message to #{user} with text #{yamText}"
   @yammer.createMessage {"body": yamText}, (err, data, res) ->
      if err
         console.log "yammer send error: #{err} #{data}"
      console.log "Status #{res.statusCode}"
