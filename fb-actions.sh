#!/bin/bash

PAGE_ACCESS_TOKEN="EAAXu91clmx0BAONN06z8f5Nna6XnCH3oWJChlbooiZCaYbKOUccVsfvrbY0nCZBXmZCQmZCzPEvkcJrBZAHbVEZANKe46D9AaxOhNPqwqZAGZC5ZCQCK4dpxtvgsPGmsQNzKhNv5OdNkizC9NfrzUQ9s8FwXa7GK3EAkOWpDHjZAiGZAgZDZD";

# Whitelist domain
function whitelist_domain {
  echo "whitelist function called";
  curl -X POST -H "Content-Type: application/json" -d '{
    "setting_type" : "domain_whitelisting",
    "whitelisted_domains" : ["https://polaama.com"],
    "domain_action_type": "add"
  }' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$PAGE_ACCESS_TOKEN"
}

function subscribe_app {
  curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=$PAGE_ACCESS_TOKEN"
}

function send_message {
  id="$1"
  echo "id is $id $1"
  curl -X POST -H "Content-Type: application/json" -d '{
    "recipient":{
      "id":'$id'
    },
    "message":{
      "text":"hello, world!"
    }
  }' "https://graph.facebook.com/v2.6/me/messages?access_token=$PAGE_ACCESS_TOKEN"
}

while [[ $# -ge 1 ]]
do
key="$1"

case $key in
  -w|--whitelist)
    shift # past argument
    whitelist_domain
    ;;
  -s|--subscribe-app)
    shift # past argument
    subscribe_app
    ;;
  -sm|--send-message)
    send_message "$2"
    shift # past argument
    ;;
esac
done
echo ""