# Hubot Yammer Adapter

## Description

This is the [Yammer](http://www.yammer.com) adapter for hubot that allows you to
send a message to him with Yammer and he will happily reply the same way.

## Installation

* Install dependencies with `npm install`
* Run hubot with `bin/hubot -a yammer -n the_name_of_the_yammer_bot_account`

## Yammer side

* Create a new account for your bot in your Yammer domain
* Create a new application for hubot (see bellow)
* You'll need to create at least one group in wich hubot will talk. By default, this group is "hubot" but you can change him

### Note if running on Heroku

You will need to change the process type from `app` to `web` in the `Procfile`.

## Usage

You will need to set some environment variables to use this adapter.

### Heroku

    % heroku config:add HUBOT_YAMMER_ACCESS_TOKEN="access_token"
    % heroku config:add HUBOT_YAMMER_GROUPS="groups list"

### Non-Heroku environment variables

    % export HUBOT_YAMMER_ACCESS_TOKEN="access_token"
    % export HUBOT_YAMMER_GROUPS="groups list"

## How do you get your access token

Here's how to get a valid Yammer OAuth2 token with the standard OAuth2 authorization flow.

See [Yammer documentation](https://developer.yammer.com/api/oauth2.html) for more details.

* Register a new application on Yammer at `https://www.yammer.com/client_applications`. Leave the callback URLs empty
* Take notes of your `consumer_key` and `consumer_secret`
* Make a new bot user on Yammer.
* Sign in as the new bot user on Yammer
* Go to `https://www.yammer.com/dialog/oauth?client_id=<consumer_key>`
* There's an authorization dialog. Authorize the app
* Look at the URL bar and there's a `code=<CODE>` query parameter in there, copy that
* `curl https://www.yammer.com/oauth2/access_token?code=<CODE>&client_id=<consumer_key>&client_secret=<consumer_secret>`
* you'll get a big JSON that contains `access_token`

Now set the token to `HUBOT_YAMMER_ACCESSTOKEN`.

## Contribute

Just send pull request if needed or fill an issue!

## Copyright

Copyright &copy; Aurélien Thieriot. See LICENSE for details.

## Thanks

[Mikeal](https://github.com/mikeal) for his great and simple libraries [node-yammer](https://github.com/mikeal/node-yammer.git)

[Mathilde Lemee](https://github.com/MathildeLemee) from wich I shamefully fork the code of [hubot-twitter](https://github.com/MathildeLemee/hubot-twitter.git)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/athieriot/hubot-yammer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
