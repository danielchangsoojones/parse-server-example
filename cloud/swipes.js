module.exports = {
    findSwipesForCurrentUser: function(theCurrentUser) { 
        
        var promise = new Parse.Promise();
        
        getCurrentUserSwipes(theCurrentUser).then(function(swipes) {
        if (swipes.length > 25) {
            console.log("swipes are longer than 0");
            var nonDuplicateSwipes = getRidOfDuplicates(swipes, theCurrentUser);
            promise.resolve(nonDuplicateSwipes);
        } else {
            //If the swipes is less than 25, then we want to get some new swipes to add to the swipe array, jstu to give the user something to do.
            console.log("Swipes are less than 25");
            getAlreadySwipedUserObjectIds(theCurrentUser).then( function(userObjectIds) {
                getNewSwipes(userObjectIds, theCurrentUser).then( function(newSwipes) {
                    swipes.push.apply(swipes, newSwipes);
                    
                    var nonDuplicateSwipes = getRidOfDuplicates(swipes, theCurrentUser);
                    promise.resolve(nonDuplicateSwipes);
                }, function(error) {
                    promise.reject(error);
                });
            });
        }
    }, function(error) {
        promise.reject(error);
    });
        
    return promise;
        
    }
};


function getRidOfDuplicates(swipes, currentUser) {
    var alreadyUsedUserObjectIds = [];
    //just make sure that the currentUser doesn't get themselves, this is a safegaurd. 
    alreadyUsedUserObjectIds.push(currentUser.id);
    
    console.log("getting rid of duplicates")
    
    for (var i = 0; i < swipes.length; i++) {
        var swipe = swipes[i];
        if (alreadyUsedUserObjectIds.indexOf(swipe.get("userOne").id) > -1 && alreadyUsedUserObjectIds.indexOf(swipe.get("userTwo").id) > -1) {
            console.log("the user is getting deleted");
            swipes.splice(i, 1);
            swipe.destroy();

        } else {
            //we add the current user a bunch to this array because it doesn't matter if the currentUser gets added twice. 
            alreadyUsedUserObjectIds.push(swipe.get("userOne").id);
            alreadyUsedUserObjectIds.push(swipe.get("userTwo").id);
        }
    }
    
    console.log(alreadyUsedUserObjectIds);
    
    return swipes
}

function getCurrentUserSwipes(currentUser) {
    console.log("in the getCurrentUserSwipes");
    
    //make sure that the other user has a profile image
    var innerOtherUserQuery = createInnerUserQuery(currentUser);
    
    //find any parseSwipes where the user is either userOne or userTwo
    var currentUserIsUserOneQuery = createCurrentUserIsUserOneQuery(currentUser);
    currentUserIsUserOneQuery.equalTo("hasUserOneSwiped", false);
    currentUserIsUserOneQuery.matchesQuery("userTwo", innerOtherUserQuery);
    
    var currentUserIsUserTwoQuery = createCurrentUserIsUserTwoQuery(currentUser);
    currentUserIsUserTwoQuery.equalTo("hasUserTwoSwiped", false);
    currentUserIsUserTwoQuery.matchesQuery("userOne", innerOtherUserQuery);
    
    
    var innerUserMessageQuery = createInnerUserMessageQuery()
    
    //add any parseswipes with a message included
    //they don't need to be in the user's interested in parameter, anyone can send a message to anyone.
    var currentUserOneMessageQuery = createCurrentUserIsUserOneQuery(currentUser);
    currentUserOneMessageQuery.matchesQuery("userTwo", innerUserMessageQuery);
    currentUserOneMessageQuery.exists("userTwoMessage");
    
    var currentUserTwoMessageQuery = createCurrentUserIsUserTwoQuery(currentUser);
    currentUserTwoMessageQuery.matchesQuery("userOne", innerUserMessageQuery);
    currentUserTwoMessageQuery.exists("userOneMessage");
    
    var orQuery = Parse.Query.or(currentUserIsUserOneQuery, currentUserIsUserTwoQuery, currentUserOneMessageQuery, currentUserTwoMessageQuery);
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

function createCurrentUserIsUserTwoQuery(currentUser) {
    var currentUserIsUserTwoQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserTwoQuery.equalTo("userTwo", currentUser);
    return currentUserIsUserTwoQuery
}

function createCurrentUserIsUserOneQuery(currentUser) {
    var currentUserIsUserOneQuery = new Parse.Query("ParseSwipe");
    currentUserIsUserOneQuery.equalTo("userOne", currentUser);
    return currentUserIsUserOneQuery
}

function createInnerUserMessageQuery() {
    var query = new Parse.Query("User");
    query.exists("profileImage");
    return query
}

function shouldCheckInterestedIn(currentUser) {
    var interestedIn = currentUser.get("interestedIn")
    //we only check the interested in parameter if they have actually set to female or male. We don't have to run an extra query parameter if they inputed all or it is nil. 
    return (interestedIn == "male" ||  interestedIn == "female")
}

//TODO: don't let the currentUser be in the search
function getNewSwipes(alreadySwipedUserObjectIds, currentUser) {
    //don't want the user to search themselves
    alreadySwipedUserObjectIds.push(currentUser.id);
    
    var query = createInnerUserQuery(currentUser);
    query.notContainedIn("objectId", alreadySwipedUserObjectIds);
    
    var promise = new Parse.Promise();
    
    query.find({
        success: function(users) {
            var newSwipes = []
            
            for (var i = 0; i < users.length; i++) {
                newSwipes.push(createNewSwipe(users[i], currentUser));
            }
            
            console.log("about to create a bunch of new swipes");
            console.log(newSwipes);
            
            Parse.Object.saveAll(newSwipes, {
                success: function(savedSwipes) {
                    console.log("everything got saved");
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

function createInnerUserQuery(currentUser) {
    var query = new Parse.Query("User");
    query.exists("profileImage");
    if (shouldCheckInterestedIn(currentUser)) {
        console.log("in the should check interested in query");
        console.log(currentUser.get("interestedIn"));
        query.equalTo("gender", currentUser.get("interestedIn"));
    }
    
    return query;
}

function createNewSwipe(otherUser, currentUser) {
    var TheNewSwipe = Parse.Object.extend("ParseSwipe");
    var newSwipe = new TheNewSwipe();
    newSwipe.set("userOne", currentUser);
    newSwipe.set("userTwo", otherUser);
    newSwipe.set("userOneApproval", false);
    newSwipe.set("userTwoApproval", false);
    newSwipe.set("hasUserOneSwiped", false);
    newSwipe.set("hasUserTwoSwiped", false);
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
                var userOne = swipe.get("userOne");
                var userTwo = swipe.get("userTwo");
                
                //we must make sure the users are not null because if a user ever gets deleted, then the pointer would be null, and that would break the function. But, this fixes it by checking to make sure the data is okay
                if (userOne != null && userTwo != null) {
                    if (currentUser.id == userTwo.id) {
                        theAlreadySwipedUserObjectIds.push(userOne.id);
                    } else if (currentUser.id == userOne.id) {
                        theAlreadySwipedUserObjectIds.push(userTwo.id);
                    }
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

