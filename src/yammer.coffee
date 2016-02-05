Robot       = require('hubot').Robot
Adapter     = require('hubot').Adapter
TextMessage = require('hubot').TextMessage

HTTPS        = require('https')
EventEmitter = require('events').EventEmitter
Yammer       = require('yammer').Yammer

class YammerAdapter extends Adapter
  constructor: (robot) ->
    super

  message = (envelope, strings...) ->
    user = envelope.user or envelope
    strings.forEach (str) =>
      @prepare_string str, (yamText) =>
        @bot.send user, yamText

  send: message
  reply: message

  prepare_string: (str, callback) ->
    text = str
    yamsText = [str]
    yamsText.forEach (yamText) =>
      callback yamText

  run: ->
    options =
      access_token: process.env.HUBOT_YAMMER_ACCESS_TOKEN
      groups:       process.env.HUBOT_YAMMER_GROUPS or "hubot"
      reply_self:   process.env.HUBOT_YAMMER_REPLY_SELF
      # for debugging use:  HUBOT_YAMMER_REPLY_SELF=1
      # bin/hubot -n bot -a yammer

    bot = new YammerRealtime(options, @robot)
    bot.listen (err, data) =>
      user_name = (reference.name for reference in data.references when reference.type is "user")
      self_id = data.meta.current_user_id
      data.messages.forEach (message) =>
        if message.group_id in bot.groups_ids
          thread_id = message.thread_id
          sender_id = message.sender_id
          text = message.body.plain
          @robot.logger.debug "A message from #{user_name}: #{text}
                               (thread_id: #{thread_id}, sender_id: #{sender_id})."
          if self_id == sender_id && !bot.reply_self
            me = @robot.name
            @robot.logger.debug "Skipping a message from self."
          else
            user =
              name: user_name
              id: sender_id
              thread_id: thread_id
            @robot.receive new TextMessage user, text
      @robot.logger.error "Received a error: #{err}" if err

    @bot = bot
    @emit 'connected'

exports.use = (robot) ->
  new YammerAdapter robot

class YammerRealtime extends EventEmitter
  constructor: (options, robot) ->
    if options.access_token?
      @robot = robot
      @yammer = new Yammer(access_token: options.access_token)
      @groups_ids = @resolving_groups_ids options.groups
      @reply_self = options.reply_self
    else
      throw new Error "Not enough parameters provided. I need an access token"

  ## Yammer API call methods
  listen: (callback) ->
    @yammer.realtime.messages (err, data) ->
      callback err, data.data if 'data' of data

  send: (user, yamText) ->
    if user && user.thread_id
      @reply user, yamText
    else
      #TODO: Adapt to flood overflow
      groups_ids.forEach (group_id) =>
        params =
          body:     yamText
          group_id: group_id

      @robot.logger.info "Sent a message to group #{params.group_id}: #{params.body}"
      @create_message params

  reply: (user, yamText) ->
    if user && user.thread_id
      params =
        body:          yamText
        replied_to_id: user.thread_id

      @robot.logger.info "Replied to #{user.name}: #{params.body}"
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

    @yammer.createMessage params, (err, data, res) =>
      @robot.logger.error "Yammer error: #{err} #{data}" if err
      @robot.logger.info "Message creation status #{res.statusCode}"

  resolving_groups_ids: (groups) ->
    #TODO: Need to make this function using a callback
    #      I don't think this will really work with too many groups
    result = []
    params =
      qs:
        mine: 1

    @yammer.groups params, (err, data) =>
      if err
        @robot.logger.error "Groups error (#{err}): #{data}"
      else
        data.forEach (existing_group) =>
          groups.split(",").forEach (group) =>
            if group.toString().toLowerCase() is existing_group.name.toString().toLowerCase()
              result.push existing_group.id

      @robot.logger.info "Allowed groups: " + groups
      @robot.logger.info "Group IDs: " + result

      throw new Error "No groups selected or ID resolution failed." if not result.length

    result
