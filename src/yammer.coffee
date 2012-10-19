Robot   = require('hubot').Robot
Adapter = require('hubot').Adapter
TextMessage = require('hubot').TextMessage

HTTPS        = require 'https'
EventEmitter = require('events').EventEmitter
Yammer        = require('./node-yammer').Yammer

class YammerAdapter extends Adapter
 send: (user, strings...) ->
   strings.forEach (str) =>
      @prepare_string str, (yamText) =>
         @bot.send user,yamText

 reply: (user, strings...) ->
   strings.forEach (str) =>
      @prepare_string str,(yamText) =>
         @bot.reply user,yamText

 prepare_string: (str, callback) ->
     text = str
     yamsText = [str]
     yamsText.forEach (yamText) => 
        callback yamText

 run: ->
   self = @
   options =
    key         : process.env.HUBOT_YAMMER_KEY
    secret      : process.env.HUBOT_YAMMER_SECRET
    token       : process.env.HUBOT_YAMMER_TOKEN
    tokensecret : process.env.HUBOT_YAMMER_TOKEN_SECRET
    groups      : process.env.HUBOT_YAMMER_GROUPS or "hubot"
    reply_self  : process.env.HUBOT_YAMMER_REPLY_SELF # for debugging use:  HUBOT_YAMMER_REPLY_SELF=1 bin/hubot -n bot -a yammer
   bot = new YammerRealtime(options)

   bot.listen (err, data, self_id) ->
      user_name = (reference.name for reference in data.references when reference.type is "user")

      data.messages.forEach (message) =>
         thread_id = message.thread_id
         sender_id = message.sender_id
         text = message.body.plain
         console.log "received #{text} from #{user_name} (thread_id: #{thread_id}, sender_id: #{sender_id})"
         if self_id == sender_id && !bot.reply_self
           console.log "hubot does not reply himself, hubot not crazy nor desperate"
         else
           user =
             name: user_name
             id: sender_id
             thread_id: thread_id
           self.receive new TextMessage user, text
      if err
         console.log "received error: #{err}"

   @bot = bot
   self.emit 'connected' 

exports.use = (robot) ->
 new YammerAdapter robot

class YammerRealtime extends EventEmitter
 self = @
 groups_ids = []
 constructor: (options) ->
    if options.token? and options.secret? and options.key? and options.tokensecret?
      @yammer = new Yammer
         oauth_consumer_key   : options.key
         oauth_token          : options.token
         oauth_signature      : options.secret
         oauth_token_secret   : options.tokensecret

      groups_ids = @resolving_groups_ids options.groups
      @reply_self = options.reply_self
    else
      throw new Error "Not enough parameters provided. I need a key, a secret, a token, a secret token"

 ## Yammer API call methods    
 listen: (callback) ->
   @yammer.realtime.messages (err, data) ->
     self_id = data.data.meta.current_user_id
     callback err, data.data, self_id

 send: (user, yamText) ->
   if user && user.thread_id
     @reply user, yamText
   else
     #TODO: Adapt to flood overflow
     groups_ids.forEach (group_id) =>
       params =
         body          : yamText
         group_id      : group_id

       console.log "send message to group #{params.group_id} with text #{params.body}"
       @create_message params

 reply: (user, yamText) ->
   if user && user.thread_id
     params =
       body          : yamText
       replied_to_id : user.thread_id

     console.log "reply message to #{user.name} with text #{params.body}"
     @create_message params

 ## Utility methods
 create_message: (params) ->
   # Build opengraph urls
   urls = params.body.match /\bhttps?:\/\/[^ ]+/
   if urls
     og_url = urls[0]
     params['og_url'] = og_url
     if og_url.match /.*\.(gif|png|jpg|jpeg)/i
       # Try to identify images
       params['og_image'] = og_url
     else
       # let yammer do its best...
       params['og_fetch'] = true

   @yammer.createMessage params, (err, data, res) ->
      if err
         console.log "yammer send error: #{err} #{data}"

      console.log "Message creation status #{res.statusCode}"

 resolving_groups_ids: (groups) ->
   #TODO: Need to make this function using a callback
   #      I don't thing this will really work with too many groups
   result = []

   @yammer.groups (err, data) ->
      if err
         console.log "yammer groups error: #{err} #{data}"
      else
         data.forEach (existing_group) =>
            groups.split(",").forEach (group) =>
               if group.toString().toLowerCase() is existing_group.name.toString().toLowerCase()
                  result.push existing_group.id

      console.log "groups list : " + groups
      console.log "groups_ids list : " + result

      if result.length is 0
         throw new Error "No group registered or an error occured to resolve IDs."

   result

 resolving_user_id: (user, callback) ->
   @yammer.users (err, data) ->
      if err
         console.log "yammer users error: #{err} #{data}" 
      else
         data.forEach (existing_user) =>
            if user.toString().toLowerCase() is existing_user.name.toString().toLowerCase()
                callback existing_user.id
