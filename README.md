# Hubot Yammer Adapter

[![Build Status](https://travis-ci.org/athieriot/hubot-yammer.svg?branch=master)](https://travis-ci.org/athieriot/hubot-yammer)

## Description

This is the [Yammer](http://www.yammer.com) adapter for [Hubot](https://github.com/github/hubot) that allows communication in Yammer public groups.

## Installation

* Install dependencies with `npm install`
* Set environment variables (below)
* Run hubot with `bin/hubot -a yammer -n name`

## Yammer account and token

* Create a new account for your bot in your Yammer domain
* Sign in as the new user
* Register an API application at `https://www.yammer.com/client_applications`
* Take note of the token you're given (copy it to `HUBOT_YAMMER_ACCESS_TOKEN`)
* Currently you also need to create at least one public group for your bot

## Usage

You will need to set environment variables to use this adapter:

### Heroku

    % heroku config:add HUBOT_YAMMER_ACCESS_TOKEN="access_token"
    % heroku config:add HUBOT_YAMMER_GROUPS="groups list"

    You will also need to change the process type from `app` to `web` in the `Procfile`.

### Non-Heroku environment variables

    % export HUBOT_YAMMER_ACCESS_TOKEN="access_token"
    % export HUBOT_YAMMER_GROUPS="groups list"

## Contribute

Just send a pull request if needed or file an issue!

## Copyright

Copyright &copy; Aurélien Thieriot. See LICENSE for details.

## Thanks

[Mikeal](https://github.com/mikeal) for his great and simple libraries [node-yammer](https://github.com/mikeal/node-yammer.git)

[Mathilde Lemee](https://github.com/MathildeLemee) from wich I shamefully fork the code of [hubot-twitter](https://github.com/MathildeLemee/hubot-twitter.git)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/athieriot/hubot-yammer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
