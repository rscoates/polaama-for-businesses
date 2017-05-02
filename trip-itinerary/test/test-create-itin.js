'use strict';

const expect = require('chai').expect;
const sleep = require('sleep');
const Promise = require('promise');
const fs = require('fs');

const CreateItinerary = require('trip-itinerary/app/create-itin');
const baseDir = "/home/ec2-user";
const TripData = require(`${baseDir}/trip-data`);
const WeatherInfoProvider = require(`${baseDir}/weather-info-provider`);
const logger = require(`${baseDir}/my-logger`);
logger.setTestConfig(); // indicate that we are logging for a test

describe("Test Create Itinerary functionality", function() {
  it("basic test", function() {
    const tripData = new TripData('india');
    tripData.data.startDate = "2018-01-01";
    tripData.data.cityItin = {
      'cities': ['delhi'],
      'numOfDays': ['3']
    };
    tripData.data.portOfEntry = "delhi";
    const promise = populateWeatherFile(tripData.data.startDate, "india", "delhi");
    promise.done( 
      function(response) {
        const createItin = new CreateItinerary(tripData, "seattle");
        createItin.create();
        done();
      },
      function(err) {
        logger.error(`error: ${err.stack}`);
        done(err);
      }
    );
  });

  function verifyItinExpectations(dayItin, city) {
    expect(city).to.deep.equal(dayItin.city);
    expect(dayItin).to.include.keys('weather');
    const weather = dayItin.weather;
    if(Array.isArray(weather)) {
      weather.forEach(w => {
        expect(city).to.include(w.city);
        expect(w).to.include.keys('min_temp');
        expect(w).to.include.keys('max_temp');
        expect(w).to.include.keys('chanceofrain');
        expect(w).to.include.keys('cloud_cover');
      });
    }
    else {
      expect(weather).to.include.keys('min_temp');
      expect(weather).to.include.keys('max_temp');
      expect(weather).to.include.keys('chanceofrain');
      expect(weather).to.include.keys('cloud_cover');
    }
  }

  function populateWeatherFile(itinDate, country, city) {
    return new Promise(function(fulfil, reject) {
      const wip = new WeatherInfoProvider(country, city, itinDate);
      wip.getWeather(function(c, weatherDetails) {
        if(weatherDetails) {
          logger.debug(`populateWeatherFile: Successfully obtained weather details ${JSON.stringify(weatherDetails)}`);
          fulfil(weatherDetails);
        }
        else {
          console.log(`Error getting weather details`);
          const e = new Error('error');
          reject(e);
        }
      });
    });
  }

  function poll(file) {
    if(!fs.existsSync(file)) {
      console.log("polling..");
      setTimeout(poll, 500);
    }
    else {
     return fs.readFileSync(file);
    }
  }

  it("test weather file", function(done) {
    const promise = populateWeatherFile("2017-11-1", "india", "chennai", done);
    promise.done(
      function(response) {
        console.log("success");
        done();
      },
      function(err) {
        console.log(`Error: ${err.stack}`);
        done(err);
      }
    );
    const readValues = poll("/home/ec2-user/weather/chennai-11011130.txt");
    console.log(`Weather details: ${readValues}`);
  });

  // TODO: This test, while comprehensive has too many implementation details (like calculation numDays and remaining days for portOfEntry. Fix ME! The next test is better.
  it("testing entire itinerary", function(done) {
    // set up
    const cityItin = {
      'cities': ['chennai','mumbai','goa','chennai'],
      'numOfDays': ['3','3','2','2']
    };
    const startDate = "2017-11-1";
    const startTime = "09:00";
    const portOfEntry = "chennai";
    const tripData = new TripData('test-full-itin');
    tripData.data.country = "india";
    tripData.data.startDate = startDate;
    tripData.data.startTime = startTime;
    tripData.data.name = "full-itin-test";
    tripData.data.portOfEntry = portOfEntry;
    tripData.data.cityItin = cityItin;
    tripData.data.returnDate = "2017-11-10";
    tripData.data.duration = 10;
    tripData.data.departureTime = "11:00";
    const weatherPromises = [];
    cityItin.cities.forEach(city => {
      weatherPromises.push(populateWeatherFile(startDate, tripData.data.country, city));
    });
    weatherPromises.push(populateWeatherFile(startDate, "usa", "seattle"));
    const createItin = new CreateItinerary(tripData, "seattle");
    const promises = createItin.create();
        
    Promise.all(weatherPromises).done(
      // perform actual tests here
      function(response) {
        const createItin = new CreateItinerary(tripData, "seattle");
        const promises = createItin.create();
        Promise.all(promises).done(
          function(values){
            const details = createItin.getItinerary();
            // verify departure date
            const stDateStr = CreateItinerary.formatDate(new Date(startDate));
            expect(details).to.include.keys(stDateStr);
            verifyItinExpectations(details[stDateStr], ['seattle','chennai']);
            expect(details[stDateStr].startTime).to.equal(startTime);
            let nextDay = new Date(startDate);
            nextDay.setDate(nextDay.getDate() + 1);
            // verify port of entry & remaining itinerary
            cityItin.cities.forEach((city, idx) => {
              let numDays = parseInt(cityItin.numOfDays[idx]);
              if(idx === 0) numDays -= 1; // For port of entry, the first day is already accounted for.
              for(let i = 0; i < numDays; i++) {
                const nextDayStr = CreateItinerary.formatDate(nextDay);
                logger.debug(`Now verifying day ${nextDayStr}`);
                nextDay.setDate(nextDay.getDate() + 1);
              }
            });
            // nextDay has advanced beyond the return date, so get it back.
            nextDay.setDate(nextDay.getDate() - 1);
            const nextDayStr = CreateItinerary.formatDate(nextDay);
            expect(nextDayStr).to.equal(CreateItinerary.formatDate(new Date(tripData.data.returnDate)));
            expect(details[nextDayStr].departureTime).to.equal(tripData.data.departureTime);

            // tell mocha that the asynchronous work is done
            done();
          },
          function(err) {
            logger.error(`Error calling create: ${err.message}. stack: ${err.stack}`);
            // tell mocha that the asynchronous work is done
            done(err);
          }
        );
      },
      function(err) {
        logger.error(`entire itinerary test: error populating weather: ${err.stack}`);
      }
    );
  });

  it("testing presence of user itinerary", function(done) {
    // set up
    const cityItin = {
      'cities': ['chennai'],
      'numOfDays': ['2']
    };
    const startDate = "2017-10-11";
    const portOfEntry = "chennai";
    const tripData = new TripData('test-user-itin');
    tripData.data.country = "india";
    tripData.data.startDate = startDate;
    tripData.data.name = "user-itin-test";
    tripData.data.portOfEntry = portOfEntry;
    tripData.data.cityItin = cityItin;
    tripData.data.returnDate = "2017-10-13";
    const createItin = new CreateItinerary(tripData, "seattle");
    const promises = createItin.create();
    require('fs').writeFileSync(tripData.userInputItinFile(), `{"10/11/2017":["hello world"],"10/12/2017":["h w","h world 1"]}`);
    Promise.all(promises).done(
      function(values){
        const details = createItin.getItinerary();
        expect(details["10/11/2017"].userInputDetails).to.deep.equal(["hello world"]);
        expect(details["10/12/2017"].userInputDetails).to.deep.equal(["h w","h world 1"]);
        // tell mocha that asynchronous work is done;
        done();
      },
      function(err) {
        logger.error(`Error calling create: ${err.message}. stack: ${err.stack}`);
        // tell mocha that the asynchronous work is done
        done(err);
      }
    ); 
  });

  function getCityCount(details,cityItin) {
    const citiesInItin = {
      'cities': [],
      'numOfDays': []
    };
    cityItin.cities.forEach(city => {
      citiesInItin.cities.push(city);
    });
    let idx = 0;
    Object.keys(details).forEach(thisDate => {
      const cityList = details[thisDate].city;
      if(Array.isArray(cityList)) {
        cityList.forEach(city => {
          if(city != citiesInItin.cities[idx]) idx += 1;
          if(!citiesInItin.numOfDays[idx]) citiesInItin.numOfDays[idx] = 0;
          citiesInItin.numOfDays[idx] += 1;
        });
      }
      else {
        if(cityList != citiesInItin.cities[idx]) idx += 1;
        if(!citiesInItin.numOfDays[idx]) citiesInItin.numOfDays[idx] = 0;
        citiesInItin.numOfDays[idx] += 1;
      }
    });
    return citiesInItin;
  }

  // test that the duration of each city matches the number of days for that particular city in the created itinerary
  it("test city duration in itinerary", function(done) {
    const cityItin = {
      'cities': ['chennai', 'mumbai', 'goa', 'chennai'],
      'numOfDays': ['3', '3', '2', '2']
    };
    const startDate = "2017-11-1";
    const startTime = "09:00";
    const portOfEntry = "chennai";
    const tripData = new TripData('test-full-itin');
    tripData.data.country = "india";
    tripData.data.startDate = startDate;
    tripData.data.startTime = startTime;
    tripData.data.name = "full-itin-test";
    tripData.data.portOfEntry = portOfEntry;
    tripData.data.cityItin = cityItin;
    tripData.data.returnDate = "2017-11-10";
    tripData.data.duration = 10;
    tripData.data.departureTime = "11:00";
    // call
    const createItin = new CreateItinerary(tripData, "seattle");
    const promises = createItin.create();
    Promise.all(promises).done(
      function(values) {
        const details = createItin.getItinerary();
        cityItin.cities.unshift("seattle"); // add port of departure to city check list
        cityItin.numOfDays.unshift("1");
        logger.debug(`Itinerary details: ${JSON.stringify(details)}`);
        const citiesInItin = getCityCount(details, cityItin);
        logger.debug(`City count details: ${JSON.stringify(citiesInItin)}`);
        cityItin.cities.forEach((city,idx) => {
          expect(parseInt(cityItin.numOfDays[idx])).to.equal(citiesInItin.numOfDays[idx]);  
        });
        // ensure that the number of entries in itinerary match the duration.
        expect(Object.keys(details).length).to.equal(tripData.data.duration);
        done();
      },
      function(err) {
        logger.error(`Error: ${err.stack}`);
        done(err);
      }
    );
  });
});

