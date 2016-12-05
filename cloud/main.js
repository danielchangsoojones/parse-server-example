
//MARK: GET THE SWIPES TO START OFF THE CARD STACK

Parse.Cloud.define("getCurrentUserSwipes", function (request, response) {
    console.log("doing the find Swipes func");
    
    var theCurrentUser = request.user;
    console.log(theCurrentUser);
    
    var swipeRepository = require("./swipes.js");
    
//    getATestUser().then( function(theCurrentUser) {
        
    
        swipeRepository.findSwipesForCurrentUser(theCurrentUser).then( function(swipes) {
        response.success(swipes);
    }, function(error) {
        response.error(error);
    });
        
        

//    });
    
        
        
    
});

//Push notifications
Parse.Cloud.define("sendMatchPushNotification", function (request, response) {
    var parseSwipeObjectId = request.params.parseSwipeObjectId;
    var targetUserObjectId = request.params.targetUserObjectId;
//    var targetUserObjectId = "FtUz5lCNv7"
//    var parseSwipeObjectId = "H7LylHlnZr"
    
    console.log("we are in the sendMatchPushNotification");
    var notificationRepository = require("./pushNotifications.js");
    console.log(parseSwipeObjectId);
    notificationRepository.sendMatchNotification(targetUserObjectId, parseSwipeObjectId);
         
});

Parse.Cloud.define("sendChatNotification", function (request, response) {
    
    
    
    getATestUser().then( function(theCurrentUser) {
        var Chat = Parse.Object.extend("Chat");
        var gameScore = new Chat();

        gameScore.set("chatRoom", "testing");
        gameScore.set("chatText", "testing Chat texts");
        gameScore.set("sender", theCurrentUser);
        gameScore.set("receiver", theCurrentUser);

gameScore.save(null, {
  success: function(gameScore) {
    // Execute any logic that should take place after the object is saved.
    console.log('New object created with objectId: ' + gameScore.id);
  },
  error: function(gameScore, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    console.log('Failed to create new object, with error code: ' + error.message);
  }
});
        
        
        
        
//        var message = "hi, i'm testing"
//        var receiver = theCurrentUser;
//        var sender = theCurrentUser;
//        
//        var notificationRepository = require("./pushNotifications.js");
//        notificationRepository.sendChatNotification(receiver, sender, message);
    
    
    
    });
    
    
    
    
         
});

Parse.Cloud.afterSave("Chat", function(request) {
    var receiver = request.object.get("receiver");
    var message = request.object.get("chatText");
    var sender = request.object.get("sender");
    
    console.log(receiver);
    
    var notificationRepository = require("./pushNotifications.js");
    notificationRepository.sendChatNotification(receiver, sender, message);
});
    

//USE THIS WHEN TESTING TO GET A CURRENT USER
function getATestUser() {
    var promise = new Parse.Promise();
    console.log("running the test user query");
    var query = new Parse.Query("User");
    query.equalTo("username", "messyjones@gmail.com");
    query.find({
        success: function(users) {
            console.log("near the return of the promise results");
            promise.resolve(users[0]);
        },
        error: function(error) {
            console.log("near the return of the promise error");
            promise.reject(error);
        }
    });
    
    return promise;
}

