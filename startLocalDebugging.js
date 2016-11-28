//test keys
//change these with your app keys

//MARK: PRODUCTION DATABASE
//var appId = "shuffle12890432EJLDIFJEKhdhd";
//var javaScriptKey = "shuffle21319808432940LKJLSJD";

//MARK: DEVELOPMENT DATABASE
var appId = "djflkajsdlfjienrj3457698";
var javaScriptKey = "ajdkdkfld6354758";

//local module
global.Parse = require("/Users/danieljones/parse-server-example/node_modules/parse-cloud-debugger").Parse;

//npm module
//global.Parse = require("parse-cloud-debugger").Parse;

//init parse modules
Parse.initialize(appId, javaScriptKey);
Parse.masterKey = javaScriptKey;


//MARK: PRODUCTION SERVERURL
//Parse.serverURL = "http://shuffles-production.herokuapp.com/parse"

//MARK: DEVELOPMENT SERVERURL
Parse.serverURL = "https://chachatinder.herokuapp.com/parse"

process.nextTick(function () {
   //run cloud code
    require('./cloud/main.js');
    
//    Parse.Cloud.run("getCurrentUserSwipes", {testData:true}, {
//                    success: function (result) {
//                        console.log("right BEFORE we get result return to testing local debugging");
//                        console.log(result);
//                        console.log("right AFTER we get result return to testing local debugging");
//                    },
//                    error: function (error) {
//                        console.log(error);
//                    }
//    });
    
    


});
