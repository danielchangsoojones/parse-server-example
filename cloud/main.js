
//MARK: GET THE SWIPES TO START OFF THE CARD STACK
Parse.Cloud.define("getCurrentUserSwipes", function (request, response) {
    console.log("doing the find Swipes func");
    
    var theCurrentUser = Parse.User.current();
    console.log(theCurrentUser);
    
    getCurrentUserSwipes(theCurrentUser).then(function(swipes) {
        if (swipes.length > 0) {
            console.log("swipes are longer than 0");
            response.success(swipes);
        } else {
            getRandomUsers().then( function(users) {
                return checkIfUsersExistInParseSwipes(users, theCurrentUser);
            }).then( function(swipes) {
                response.success(swipes);
            }, function (error) {
                response.error(error);
            });
        }
    }, function(error) {
        response.error(error);
    });
});

//USE THIS WHEN TESTING TO GET A CURRENT USER
//function getATestUser() {
//    var promise = new Parse.Promise();
//    console.log("running the test user query");
//    var query = new Parse.Query("User");
//    query.equalTo("username", "messyjones@gmail.com");
//    query.find({
//        success: function(users) {
//            console.log("near the return of the promise results");
//            promise.resolve(users[0]);
//        },
//        error: function(error) {
//            console.log("near the return of the promise error");
//            promise.reject(error);
//        }
//    });
//    
//    return promise;
//}

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
    orQuery.limit(50);
    
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

function randomDate() {
    //the dates for the months are 1 behind, so October is actually the 9th month
    var firstUserCreatedDate = new Date(2016, 9, 20, 0, 0, 0);
    var now = Date.now();
  var date = new Date(+firstUserCreatedDate + Math.random() * (now - firstUserCreatedDate));
  return date;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

//we want a randomUser because there really isn't a very effecient way to get all the users who haven't been used in a swipe. We are better off just getting a number of random users, and checking if they exist already in the parseSwipes.
function getRandomUsers() {
    var query = new Parse.Query("User");
    
    //the best way to get random users is too just look at when the user was last updated, which changes randomly as users use the app, and then just get a random date block between the start of the database and now. It's not perfectly random, but it's functionally random enough. 
    var theRandomDate = randomDate();
    var numberOfDaysBetween = 10
    query.greaterThan("updatedAt", addDays(theRandomDate, -numberOfDaysBetween));
    query.lessThan("updatedAt", theRandomDate);
    query.limit(50);
    
    query.exists("profileImage");
    
    var promise = new Parse.Promise();
    
    query.find({
        success: function(users) {
            console.log("in the random user function");
            console.log(users);
            promise.resolve(users);
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}

function checkIfUsersExistInParseSwipes(users, currentUser) {
    var query = new Parse.Query("ParseSwipe");
    
    console.log("in the checking parse swipes");
    
    var usersWithExistingProfilePics = []
    
    for (var i = 0; i < users.length; i++) {
        //if the profileImage is undefined, that means it exists. If null, it doesn't exist. 
        var user = users[i];
        if (user.profileImage !== null) {
            usersWithExistingProfilePics.push(user);
        }
    }
    
    console.log(usersWithExistingProfilePics);
    
    //find any parseSwipes where the user is either userOne or userTwo
    var currentUserIsUserOneQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserOneQuery.equalTo("userOne", currentUser);
    currentUserIsUserOneQuery.containedIn("userTwo", usersWithExistingProfilePics);
    
    var currentUserIsUserTwoQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserTwoQuery.equalTo("userTwo", currentUser);
    currentUserIsUserTwoQuery.containedIn("userOne", usersWithExistingProfilePics);
    
    var orQuery = Parse.Query.or(currentUserIsUserOneQuery, currentUserIsUserTwoQuery);
    orQuery.include("userOne");
    orQuery.include("userTwo");
    
    var promise = new Parse.Promise();
     orQuery.find({
        success: function(swipes) {
            var swipesToReturn = []
            
            for (var swipe in swipes) {
                for (var i = 0; i < usersWithExistingProfilePics.length; i++) {
                    var user = usersWithExistingProfilePics[i];
                    if (user == swipe.userOne || user == swipe.userTwo) {
                        //the user already exists in a swipe with the current user, so remove them from the array to return.
                        usersWithExistingProfilePics.splice(i, 1);
                    } else {
                        //we want to create a new swipe to be sent to the user
                        swipesToReturn.push(createNewSwipe());
                    }
                }
            }
            
            console.log(swipesToReturn);
            promise.resolve(swipesToReturn);
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}

function createNewSwipe(otherUser, currentUser) {
    var newSwipe = new ParseSwipe();
    newSwipe.userOne = currentUser;
    newSwipe.userTwo = otherUser;
    newSwipe.userOneApproval = false;
    newSwipe.userTwoApproval = false;
    newSwipe.hasUserOneSwiped = false;
    newSwipe.hasUserTwoSwiped = false;
    return newSwipe
}
