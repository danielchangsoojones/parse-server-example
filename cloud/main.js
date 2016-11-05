
//MARK: GET THE SWIPES TO START OFF THE CARD STACK
Parse.Cloud.define("getCurrentUserSwipes", function (request, response) {
    console.log("doing the find Swipes func");
    
    var currentUser = Parse.User.current();
    console.log(currentUser);
    
    getATestUser().then( function(currentUser) {
        return getCurrentUserSwipes(currentUser);
    }).then( function(swipes) {
        response.success(swipes);
    }, function(error) {
        response.error(error);
    });
});

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

function getCurrentUserSwipes(currentUser) {
    console.log("in the getCurrentUserSwipes");
    console.log(currentUser);
    
    //make sure that the other user has a profile image
    var profileImageExistsQuery = new Parse.Query("User");
    profileImageExistsQuery.exists("profileImage");
    
    //find any parseSwipes where the user is either userOne or userTwo
    var currentUserIsUserOneQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserOneQuery.equalTo("userOne", currentUser);
    currentUserIsUserOneQuery.equalTo("hasUserOneSwiped", false);
    currentUserIsUserOneQuery.matchesQuery("userTwo", profileImageExistsQuery);
    
    var currentUserIsUserTwoQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserTwoQuery.equalTo("userTwo", currentUser);
    currentUserIsUserTwoQuery.equalTo("hasUserTwoSwiped", false);
    currentUserIsUserTwoQuery.matchesQuery("userOne", profileImageExistsQuery);
    
    var orQuery = Parse.Query.or(currentUserIsUserOneQuery, currentUserIsUserTwoQuery);
    orQuery.include("userOne");
    orQuery.include("userTwo");
    
    var promise = new Parse.Promise();
    
    orQuery.find({
        success: function(swipes) {
            console.log(swipes);
            promise.resolve(swipes);
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}
