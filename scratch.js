function testObjectKey() {
  var a = {};
  a.b = 1;
  const d = 'c';
  a[d] = "Hello";
  console.log(a);
}

// at this point, we are only keeping 2 messages in history
const HISTORY_LENGTH = 4;
function updateHistoryAndCallResolve(message, context) {
  const sessionId = context.sessionId;
  var history = sessions[sessionId].botMesgHistory;
  // add this message to the sessions's previous messages.
  if(history.length == HISTORY_LENGTH) {
    history.forEach(function(element,i,array) {
      history[i] = history[i+1];
    });
    history[HISTORY_LENGTH - 1] = message;
  }
  else {
    history.push(message);
  }
}

function testUpdateHistoryAndCallResolve() {
  var context = {};
  var sessions = [];
  sessions[1] = {};
  sessions[1].botMesgHistory = [];
  context.sessionId = 1;
  updateHistoryAndCallResolve("A", context);
  updateHistoryAndCallResolve("B", context);
  updateHistoryAndCallResolve("C", context);
  updateHistoryAndCallResolve("D", context);
  updateHistoryAndCallResolve("E", context);
  updateHistoryAndCallResolve("F", context);
  updateHistoryAndCallResolve("G", context);
  updateHistoryAndCallResolve("H", context);
  console.log(sessions[1].botMesgHistory);
}

function testEncoding() {
  var str = "Big Island";
  console.log(str.toLowerCase().replace(" ","-"));
}

var _ = require('lodash');

function retrieveTrip(tripName) {
  return retrieveTrips()[tripName];
}

function retrieveTrips() {
  return JSON.parse("{\"big_island\":{\"name\":\"big_island\"},\"israel\": {\"name\": \"israel\"}}");
}

function testUndefined() {
  var trip = retrieveTrip("israel");
  console.log("Value is " + _.isUndefined(trip) + ". Trip is " + JSON.stringify(trip));
}

function testRegex() {
 const messageText = "pack: Hello,World";
 const items = messageText.replace(/pack[:]*[ ]*/,"").split(',');
 console.log(items);
 return items;
}

function testNonexistentKey() {
  var a = {};
  a.k1 = "k1";
  a.k2 = "k2";
  a.k3 = ["a"];
  if(!("k3" in a)) {
    a.k3 = [];
  }
  a.k3 = a.k3.concat(testRegex());
  console.log(JSON.stringify(a));
}

function storeList(senderId, messageText, regex) {
  const tripName = "big island";
  // retrieve text
  const items = messageText.replace(regex,"").split(',');
  console.log("successfully stored item " + items + " in list");
  return;
}

var reg = new RegExp("todo[:]*[ ]*","i");
storeList("", "todo: a", reg);