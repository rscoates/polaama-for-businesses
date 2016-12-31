const request = require('request');
const fs = require('fs');

// https://support.business.skyscanner.net/hc/en-us/articles/211308489-Flights-Live-Pricing?_ga=1.158124153.234443051.1483127005
function skyScanner() {
  const uri = `http://partners.api.skyscanner.net/apiservices/pricing/v1.0`;
  request.post({
    uri: uri,
    headers: {
      Accept: "application/json"
    },
    form: {
      apiKey: "prtl6749387986743898559646983194",
      country: "US",
      currency: "USD",
      locale: "en-US",
      originplace: "SEA-sky",
      destinationplace: "LIS-sky",
      outbounddate: "2017-02-03",
      inbounddate: "2017-02-16",
      adults: "2"
    }
  }, function(err, res, body) {
    console.log(`err is ${err}`);
    console.log(`res is ${JSON.stringify(res)}`);
    console.log(`body is ${body}`);
    return;
  });
}

function qpx() {
}

// skyScanner();
const json = JSON.parse(fs.readFileSync('/tmp/sky-scanner','utf8'));
console.log(JSON.stringify(json, null, 2));
