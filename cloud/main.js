
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

