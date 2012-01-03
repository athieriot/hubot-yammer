# Hubot Yammer Adapter

## Description

This is the [Yammer](http://www.yammer.com) adapter for hubot that allows you to
send a message to him with Yammer and he will happily reply the same way.

## Installation

* Add `hubot-yammer` as a dependency in your hubot's `package.json`
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

   heroku config:add HUBOT\_YAMMER\_KEY="key" HUBOT\_YAMMER\_SECRET="secret" HUBOT\_YAMMER\_TOKEN="token" HUBOT\_YAMMER\_TOKEN\_SECRET="secret" HUBOT\_YAMMER\_GROUPS="groups list"

### Non-Heroku environment variables

   export HUBOT\_YAMMER\_KEY="key"
   export HUBOT\_YAMMER\_SECRET="secret"
   export HUBOT\_YAMMER\_TOKEN="token"
   export HUBOT\_YAMMER\_TOKEN\_SECRET="secret"
   export HUBOT\_YAMMER\_GROUPS="groups list"

## How do you get your credential informations

An easy way to get your access codes is to use [nyam](https://github.com/csanz/node-nyam).

Nyam is a node.js CLI tool wich can help you to setup Yammer authorizations.

First, log on to Yammer and get your own application keys.

    https://www.yammer.com/<DOMAIN>/client_applications/new

Install nyam

    npm install nyam -g

__Warning__: Actually, nyam need a 0.4.x version of node.js. You may want to look at [nvm](https://github.com/creationix/nvm)

To override nyam configuration with your own app keys create the following file:

    ~/.nyam_keys

and add the following

    {
        "app_consumer_key": "<CONSUMER KEY HERE>",
        "app_consumer_secret": "<CONSUMER SECRET HERE>"
    }

Then, start the setup process to give hubot-yammer access to an account 

    nyam -s

Finally, run nyam with a verbose level to display all the informations you need

    nyam --verbose

## Contribute

Just send pull request if needed or fill an issue !

## Copyright

Copyright &copy; Aurélien Thieriot. See LICENSE for details.

## Thanks

[Mikeal](https://github.com/mikeal) for his great and simple libraries [node-yammer](https://github.com/mikeal/node-yammer.git)

[Mathilde Lemee](https://github.com/MathildeLemee) from wich I shamefully fork the code of [hubot-twitter](https://github.com/MathildeLemee/hubot-twitter.git)
