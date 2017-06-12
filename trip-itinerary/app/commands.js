'use strict';

const moment = require('moment-timezone');
const CreateItinerary = require('trip-itinerary/app/create-itin');
const DayPlanner = require('calendar-view/app/day-planner');
const htmlBaseDir = "/home/ec2-user/html-templates"; // TODO: Move this to config.
const baseDir = "/home/ec2-user";
const logger = require(`${baseDir}/my-logger`);
const Encoder = require(`${baseDir}/encoder`);

function Commands(trip, fbid) {
  if(!fbid) throw new Error(`Commands: required parameter fbid not passed`);
  this.fbid = fbid;
  this.trip = trip;
  this.itin = new CreateItinerary(this.trip, this.trip.leavingFrom).getItinerary();
}

Commands.prototype.handle = function(command, whichSet) {
  this.whichSet = whichSet;
  if(!this.whichSet) this.whichSet = "first";
  this.command = command;
  return handleDayItin.call(this);
}

Commands.prototype.canHandle = function(command) {
  this.command = command;
  if(this.command.startsWith("tomorrow")) return true;
  if(this.command.startsWith("today")) return true;
  // if(this.command === "next" || this.command.startsWith("next ")) return true;
  return isDateValid.call(this);
}

Commands.prototype.getPath = function(command) {
  if(this.command.startsWith("tomorrow")) return "tomorrow";
  if(this.command.startsWith("today")) return "today";
  if(!this.date && !isDateValid.call(this)) throw new Error(`getPath: invalid command ${command}`);
  return new moment(this.date).format("YYYY-MM-DD");
}

// TODO: reconcile with getTodaysItin
/*
Commands.prototype.getTodaysItinAsList = function(command, fbid) {
  let today;
  if(command.startsWith("today")) {
    today = new Date(moment().tz(getTimezone()).format("M/DD/YYYY"));
    // Currently, we only have list view created for 6/12
    if(CreateItinerary.formatDate(today) !== "6/12/2017") return null;
  }
  else return null;
  logger.debug(`getTodaysItinAsList: returning list itin for date ${today}`);
  this.date = today;
  const dateStr = CreateItinerary.formatDate(this.date);
  const dayPlanner = new DayPlanner(this.date, this.itin[dateStr], this.trip); 
  return dayPlanner.getDayPlanAsList(fbid);
}

Commands.prototype.getTodaysItinNextSet = function(fbid) {
  this.date = new Date(moment().tz(getTimezone()).format("M/DD/YYYY"));
  const dateStr = CreateItinerary.formatDate(this.date);
  const dayPlanner = new DayPlanner(this.date, this.itin[dateStr], this.trip); 
  return dayPlanner.getDayPlanNextSet(fbid);
}
*/

Commands.prototype.handlePostback = function(payload) {
  logger.debug(`handlePostback: handling payload ${payload}`);
  let contents = /^(\d+)-(\d+)-(\d+)-itin_second_set/.exec(payload);  
  if(!contents) return false;
  const date = new Date(contents[1], contents[2], contents[3]);
  logger.debug(`handlePostback: date is ${date}; ${CreateItinerary.formatDate(date)}`);
  if(!listFormat(date)) return false;
  this.date = date;
  this.whichSet = "second";
  return getDayItinerary.call(this);
}

function listFormat(date) {
  const dateList = ["6/13/2017"];
  if(dateList.indexOf(CreateItinerary.formatDate(date) !== -1)) return true;
  return false;
}

function handleDayItin() {
  if(this.command.startsWith("tomorrow")) return getTomorrowsItin.call(this);
  if(this.command.startsWith("today")) return getTodaysItin.call(this);
  if(!isDateValid.call(this)) return null;
  return getDayItinerary.call(this);
}

// Get today's itinerary.
// Find the time (Based on timezone).
// Start comparing the hour
// Possible options: 1st item, last item, item with time, 
function getNextItem() {
}

function isDateValid() {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  let contents = /^(\d+)t?h?$/.exec(this.command);
  if(contents) {
    this.date = new Date(thisYear, thisMonth, contents[1]);
    return true;
  }
  contents = /([a-zA-Z]+) *(\d+)/.exec(this.command);
  if(contents) {
    this.date = new Date(thisYear, toNum(contents[1]), contents[2]);    
    return true;
  }
  contents = /(\d+)\/(\d+)/.exec(this.command);
  if(contents) {
    this.date = new Date(thisYear, contents[1]-1, contents[2]);    
    return true;
  }
  contents = /(\d+)-(\d+)-(\d+)/.exec(this.command);
  if(contents) {
    this.date = new Date(this.command);
    return true;
  }
  logger.error(`isDateValid: unknown format ${this.command} that did not match any of the known formats.`);
  return false;
}

function getDayItinerary() {
  const dateStr = CreateItinerary.formatDate(this.date);
  const dayPlanner = new DayPlanner(this.date, this.itin[dateStr], this.trip); 
  // if(CreateItinerary.formatDate(this.date) === "6/13/2017") {
  if(listFormat(this.date)) {
    const dayAsList = dayPlanner.getPlanAsList(this.fbid, this.whichSet);
    if(dayAsList) return dayAsList;
  }
  const plans = dayPlanner.getPlan();
  const html = require('fs').readFileSync(`${htmlBaseDir}/day-plan.html`, 'utf8');
  return html.replace("${date}", dateStr)
             .replace("${city}", plans.city)
             .replace("${plan}", plans.dayPlan);
}

function toNum(month) {
  const monthMap = new Map();
  monthMap.set('january', 0);
  monthMap.set('february', 1);
  monthMap.set('march', 2);
  monthMap.set('april', 3);
  monthMap.set('may', 4);
  monthMap.set('june', 5);
  monthMap.set('july', 6);
  monthMap.set('august', 7);
  monthMap.set('september', 8);
  monthMap.set('october', 9);
  monthMap.set('november', 10);
  monthMap.set('december', 11);
  monthMap.set('jan', 0);
  monthMap.set('feb', 1);
  monthMap.set('mar', 2);
  monthMap.set('apr', 3);
  monthMap.set('may', 4);
  monthMap.set('jun', 5);
  monthMap.set('jul', 6);
  monthMap.set('aug', 7);
  monthMap.set('sep', 8);
  monthMap.set('oct', 9);
  monthMap.set('nov', 10);
  monthMap.set('dec', 11);
  return monthMap.get(Encoder.encode(month));
}


function getTomorrowsItin() {
  // const tomorrow = new Date();
  const tomorrow = new Date(moment().tz(getTimezone()).format("M/DD/YYYY"));
  tomorrow.setDate(tomorrow.getDate() + 1);
  this.date = tomorrow;
  logger.debug(`getTomorrowsItin: tomorrow's date is ${this.date}`);
  return getDayItinerary.call(this);
}

function getTodaysItin() {
  // this.date = new Date();
  this.date = new Date(moment().tz(getTimezone()).format("M/DD/YYYY"));
  logger.debug(`getTodaysItin: today's date is ${this.date}`);
  return getDayItinerary.call(this);
}

// TODO: (searching for "today" at 6/3/2017T02:00TEV will show 6/2/2017, instead of 6/3. Fix me!
// user enters today. We find out the date in UTC. We use that to determine where the user will be. (Between 6/11 - 6/19 UTC, the user will be in Tel Aviv). We get moment for that timezone and determine the day.
function getTimezone() {
  // const dateInUTC = moment().format("M/DD/YYYY");
  const dateInUTC = "6/12/2017";
  const userLocation = {
    '6/10/2017' : "America/New_York",
    '6/11/2017' : "Asia/Tel_Aviv",
    '6/12/2017' : "Asia/Tel_Aviv",
    '6/13/2017' : "Asia/Tel_Aviv",
    '6/14/2017' : "Asia/Tel_Aviv",
    '6/15/2017' : "Asia/Tel_Aviv",
    '6/16/2017' : "Asia/Tel_Aviv",
    '6/17/2017' : "Asia/Tel_Aviv",
    '6/18/2017' : "Asia/Tel_Aviv",
    '6/19/2017' : "Asia/Tel_Aviv",
  };  
  return userLocation[dateInUTC];
  /*
    if(this.trip.portOfEntry === "albuquerque") return "America/Cambridge_Bay";
    if(this.trip.portOfEntry === "tel_aviv") return "Asia/Tel_Aviv";
  */
}

module.exports = Commands;