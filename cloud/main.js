
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








Parse.Cloud.job("removeDuplicates", function(request, status) {
    var _ = require("underscore");
    
    var hashTable = {};

  function hashKeyForTestItem(testItem) {
    var hashKey = "";
            if (testItem.get("userOne") != null && testItem.get("userTwo") != null) {
                hashKey += testItem.get("userOne").id + "/";
                hashKey += testItem.get("userTwo").id + "/";
      }
      console.log(hashKey);
    return hashKey;
  }

  var testItemsQuery = new Parse.Query("ParseSwipe");
    testItemsQuery.limit(100000);
    testItemsQuery.include("userOne");
    testItemsQuery.include("userTwo");
    
    
    testItemsQuery.find({
        success: function(results) {
            console.log("hii");
            for (var i = 0; i < results.length; i++) {
                var testItem = results[i];
                
                if (testItem.get("userOne") == null && testItem.get("userTwo") == null) {
                    console.log("destroy the row because it is pointing to a null pointer( aka a deleted pointer)");
                    return testItem.destroy();
                } else {
                    //they exist
                    var key = hashKeyForTestItem(testItem);

                    if (key in hashTable) { // this item was seen before, so destroy this
                        return testItem.destroy();
                    } else { // it is not in the hashTable, so keep it
                        hashTable[key] = 1;
                        }
                    console.log("finished dealing with the hash key" + key);
                }
                
                
                

            }

    }
    });

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
        var ParseUserTag = Parse.Object.extend("ParseUserTag");
        var gameScore = new ParseUserTag();

        gameScore.set("tagTitle", "testing");
        gameScore.set("user", theCurrentUser);
        gameScore.set("createdBy", theCurrentUser);
        console.log(theCurrentUser.id);

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
});
    
    
    
    
         
});

//Parse.Cloud.afterSave("Chat", function(request) {
//    var receiver = request.object.get("receiver");
//    var message = request.object.get("chatText");
//    var sender = request.object.get("sender");
//    
//    console.log(receiver);
//    
//    var notificationRepository = require("./pushNotifications.js");
//    notificationRepository.sendChatNotification(receiver, sender, message);
//});
//
//Parse.Cloud.afterSave("ParseUserTag", function(request) {
//    var userForTag = request.object.get("user");
//    var tagTitle = request.object.get("tagTitle");
//    var createdBy = request.object.get("createdBy");
//    
//    var notificationRepository = require("./pushNotifications.js");
//    notificationRepository.sendAddedTagNotification(userForTag, tagTitle, createdBy);
//});
//    

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

