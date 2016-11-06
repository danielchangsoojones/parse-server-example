
//MARK: GET THE SWIPES TO START OFF THE CARD STACK

Parse.Cloud.define("getCurrentUserSwipes", function (request, response) {
    console.log("doing the find Swipes func");
    
    var theCurrentUser = request.user;
    console.log(theCurrentUser);
    
//    getATestUser().then( function(theCurrentUser) {
        
        
        getCurrentUserSwipes(theCurrentUser).then(function(swipes) {
        if (swipes.length > 25) {
            console.log("swipes are longer than 0");
            var nonDuplicateSwipes = getRidOfDuplicates(swipes, theCurrentUser);
            response.success(nonDuplicateSwipes);
        } else {
            //If the swipes is less than 25, then we want to get some new swipes to add to the swipe array, jstu to give the user something to do.
            getAlreadySwipedUserObjectIds(theCurrentUser).then( function(userObjectIds) {
                getNewSwipes(userObjectIds, theCurrentUser).then( function(newSwipes) {
                    swipes.push.apply(swipes, newSwipes);
                    response.success(swipes);
                }, function(error) {
                    response.error(error);
                });
            });
        }
    }, function(error) {
        response.error(error);
    });

//    });
    
        
        
    
});

function getRidOfDuplicates(swipes, currentUser) {
    var alreadyUsedUsers = [];
    console.log(swipes);
    
    console.log("getting rid of duplicates")
    
    for (var i = 0; i < swipes.length; i++) {
        var swipe = swipes[i];
        if (alreadyUsedUsers.indexOf(swipe.userOne) > -1 && alreadyUsedUsers.indexOf(swipe.userTwo) > -1) {
            swipe.destroy();
            swipes.splice(i, 1);
        } else {
            alreadyUsedUsers.push(swipe.userOne);
            alreadyUsedUsers.push(swipe.userTwo);
        }
    }
    
    return swipes
}

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

//TODO: don't let the currentUser be in the search
function getNewSwipes(alreadySwipedUserObjectIds, currentUser) {
    //don't want the user to search themselves
    alreadySwipedUserObjectIds.push(currentUser.objectId);
    
    var query = new Parse.Query("User");
    query.exists("profileImage");
    query.notContainedIn("objectId", alreadySwipedUserObjectIds);
    
    var promise = new Parse.Promise();
    
    query.find({
        success: function(users) {
            var newSwipes = []
            
            for (var i = 0; i < users.length; i++) {
                newSwipes.push(createNewSwipe(users));
            }
            
            Parse.Object.saveAll(newSwipes, {
                success: function(savedSwipes) {
                    promise.resolve(savedSwipes);
                }, 
                error: function(error) {
                    promise.reject(error);
                }
            });
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}

function createNewSwipe(otherUser, currentUser) {
    var newSwipe = Parse.Object.extend("ParseSwipe");
    newSwipe.userOne = currentUser;
    newSwipe.userTwo = otherUser;
    newSwipe.userOneApproval = false;
    newSwipe.userTwoApproval = false;
    newSwipe.hasUserOneSwiped = false;
    newSwipe.hasUserTwoSwiped = false;
    return newSwipe
}

//TODO: this is not a scalable solution to check how to get new users in the database, but for now, we want to just find the new users that the user hasn't swiped. 
function getAlreadySwipedUserObjectIds(currentUser) {
    //This query finds all the current user's swipes and then returns the otherUser's on the swipes. Then, we can use those users to say find all users who are not these users. 
    var query = new Parse.Query("ParseSwipe");
    
    var currentUserIsUserOneQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserOneQuery.equalTo("userOne", currentUser);
    
    var currentUserIsUserTwoQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserTwoQuery.equalTo("userTwo", currentUser);
    
    var orQuery = Parse.Query.or(currentUserIsUserOneQuery, currentUserIsUserTwoQuery);
    orQuery.include("userOne");
    orQuery.include("userTwo");
    
    var promise = new Parse.Promise();
    
    orQuery.find({
        success: function(swipes) {
            var theAlreadySwipedUserObjectIds = []
    
            for (var i = 0; i < swipes.length; i++) {
                //append the otherUser to theUsers array
                var swipe = swipes[i];
                if (currentUser == swipe.userTwo) {
                    theAlreadySwipedUserObjectIds.push(swipe.userTwo.objectId);
                } else if (currentUser == swipe.userOne) {
                    theAlreadySwipedUserObjectIds.push(swipe.userOne.objectId);
                }
            }
            
            console.log(theAlreadySwipedUserObjectIds);
            promise.resolve(theAlreadySwipedUserObjectIds);
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}
