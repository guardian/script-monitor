var fetch = require('node-fetch');
var md5 = require('md5');
var AWS = require('aws-sdk');
var _ = require('lodash');

const S3 = new AWS.S3();
const BUCKET = 'aws-frontend-artifacts'
const PREFIX = 'script-monitoring'

// Sonobi needs X-Gu-GeoLocation headers to serve regionalised versions of their script:

const urlsToCheck = [
  {
    name: 'sonobi-morpheus-uk',
    url: 'https://api.nextgen.guardianapps.co.uk/morpheus.theguardian.12911.js',
    headers: {'X-GU-GeoLocation': 'country:UK'}
  },
  {
    name: 'sonobi-morpheus-us',
    url: 'https://api.nextgen.guardianapps.co.uk/morpheus.theguardian.12911.js',
    headers: {'X-GU-GeoLocation': 'country:US'}
  },
  {
    name: 'sonobi-morpheus-au',
    url: 'https://api.nextgen.guardianapps.co.uk/morpheus.theguardian.12911.js',
    headers: {'X-GU-GeoLocation': 'country:AU'}
  },
  {
    name: 'pubads',
    url: 'https://securepubads.g.doubleclick.net/gpt/pubads_impl_108.js'
  },
  {
    name: 'integral-jload',
    url: 'https://pixel.adsafeprotected.com/jload?anId=10249&campId=1x1&pubId=45476727&chanId=61695567&placementId=138817647&pubCreative=105372992247&pubOrder=357022887&custom=RecommendedForYouRecommendations-user-hi&custom2=top-above-nav&custom3=wide'
  }
]

function createS3Key(name, contentString) {
  return `${PREFIX}/${name}-${md5(contentString)}`
}

function getFileAsText(url, headers) {
  return fetch(url, {headers: headers}).then(response => response.text());
}

function headObject(key) {
  const params = {
    Bucket: BUCKET,
    Key: key
  };

  return new Promise((resolve, reject) => {
    S3.headObject(params, function (err, metadata) {  
      if (err) { 
        console.log(`Key not found: ${key} ${err}`);
        resolve(false);
      } else {
        console.log(`S3 key already exists under: ${key}`);
        resolve(true);
      }
    });
  });
}

function putObject(key, content) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: content
  };

  return new Promise((resolve, reject) => {
    S3.putObject(params, function (err, data) {  
      if (err) {
        console.log(`Error putting object ${key}`);
        reject(err);
      } else {
        console.log(`Successfully put object to ${key}`);
        resolve(data);
      }
    });
  });
}

exports.handler = function(event, context) {
  _.map(urlsToCheck, (check) => {
      const name = check.name;
      const url = check.url;
      const headers = check.headers;

      console.log(`Getting url: ${url}`);

      getFileAsText(url, headers)
        .then(content => {
          const s3key = createS3Key(name, content);
          headObject(s3key).then(exists => {
            if (!exists) {
              putObject(s3key, content);
            }
          });
        })
        .catch((error) => {
          console.log(`Error getting ${url}: ${error}`);
        });
  });
}