//test keys
//change these with your app keys
var myConfiguration = function() {
        var isProduction = false
        
        //Development database
        var masterKey = "ajdkdkfld6354758";
        var serverURL = "https://chachatinder.herokuapp.com/parse";
        var appId = "djflkajsdlfjienrj3457698";
        
        if (isProduction) {
            masterKey = "shuffle21319808432940LKJLSJD";
            serverURL = "http://shuffles-production.herokuapp.com/parse";
            appId = "shuffle12890432EJLDIFJEKhdhd";
        }


    return {
        masterKey: masterKey,
        serverURL: serverURL,
        appId: appId
    };
};

//local module
global.Parse = require("/Users/danieljones/parse-server-example/node_modules/parse-cloud-debugger").Parse;

//npm module
//global.Parse = require("parse-cloud-debugger").Parse;

//init parse modules
Parse.initialize(myConfiguration().appId, myConfiguration().masterKey);
Parse.masterKey = myConfiguration().masterKey;

Parse.serverURL = myConfiguration().serverURL

process.nextTick(function () {
   //run cloud code
    require('./cloud/main.js');
    console.log("it ran");
    Parse.Cloud.run("getCurrentUserSwipes", {testData:true}, {
                    success: function (result) {
                        console.log("right BEFORE we get result return to testing local debugging");
                        console.log(result);
                        console.log("right AFTER we get result return to testing local debugging");
                    },
                    error: function (error) {
                        console.log(error);
                    }
    });
    
    


});
