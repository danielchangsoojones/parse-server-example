// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var myConfiguration = function() {
        var isProduction = false
        
        //Development database
        var masterKey = "ajdkdkfld6354758"
        var serverURL = "https://chachatinder.herokuapp.com/parse"
        
        if (isProduction) {
            masterKey = "shuffle21319808432940LKJLSJD"
            serverURL = "http://shuffles-production.herokuapp.com/parse"
        }


    return {
        masterKey: masterKey,
        serverURL: serverURL
    };
};

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
    
    //MARK: Development Database
    masterKey: process.env.MASTER_KEY || myConfiguration().masterKey, //Add your master key here. Keep it secret!
    readOnlyMasterKey: "hi",
  serverURL: process.env.SERVER_URL || myConfiguration().serverURL, // Don't forget to change to https if needed
        // here the configuration for email begins
    
verifyUserEmails: false,  //depends on your needs, you can set it to false 
emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)
preventLoginWithUnverifiedEmail: false, // defaults to false

//Mark: Development Database
publicServerURL: myConfiguration().serverURL,
 // Your apps name. This will appear in the subject and body of the emails that are sent.
appName: 'ShuffleHunt',

// The email adapter
emailAdapter: {
module: 'parse-server-simple-mailgun-adapter',
options: {
  // The address that your emails come from
  fromAddress: 'shufflehunt@shufflehunt.com',
  // Your domain from mailgun.com
  domain: 'sandboxe1a767d87d5046e58bddddb6c2985382.mailgun.org',
  // Your API key from mailgun.com
  apiKey: 'key-058644e2f351a81f92faafdf7bbcd12f',
    }
  },
    push: {
		ios: [
            {
			pfx: 'cloud/certs/ParsePushDevelopmentCertificate.p12',
			bundleId: 'com.Chacha.Shuffle', // The bundle identifier associated with your app
			production: false // Specifies which environment to connect to: Production (if true) or Sandbox
		  }, 
            {
                pfx: 'cloud/certs/PushNotificationProductionCertificate.p12',
                bundleId: 'com.Chacha.Shuffle', // The bundle identifier associated with your app
                production: true // Specifies which environment to connect to: Production (if true) or Sandbox
            }]
	},
    
  liveQuery: {
    classNames: ['Chat'] // List of classes to support for query subscriptions
  }
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
