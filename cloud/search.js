module.exports = {
    searchTagTitle: function(tagTitle, cacheObjectId) {
        var promise = new Parse.Promise();
        
        searchTagTitle(tagTitle, cacheObjectId).then(function(users) {
            promise.resolve(users);
        }, function(error) {
            promise.reject(error);
        });
        
        
        return promise;
    }
    
    
    
    
    
    
    
//    findSwipesForCurrentUser: function(theCurrentUser) { 
//        
//        var promise = new Parse.Promise();
//        
//        getCurrentUserSwipes(theCurrentUser).then(function(swipes) {
//        if (swipes.length > 25) {
//            console.log("swipes are longer than 0");
//            var nonDuplicateSwipes = getRidOfDuplicates(swipes, theCurrentUser);
//            promise.resolve(nonDuplicateSwipes);
//        } else {
//            //If the swipes is less than 25, then we want to get some new swipes to add to the swipe array, jstu to give the user something to do.
//            console.log("Swipes are less than 25");
//            getAlreadySwipedUserObjectIds(theCurrentUser).then( function(userObjectIds) {
//                getNewSwipes(userObjectIds, theCurrentUser).then( function(newSwipes) {
//                    swipes.push.apply(swipes, newSwipes);
//                    
//                    var nonDuplicateSwipes = getRidOfDuplicates(swipes, theCurrentUser);
//                    promise.resolve(nonDuplicateSwipes);
//                }, function(error) {
//                    promise.reject(error);
//                });
//            });
//        }
//    }, function(error) {
//        promise.reject(error);
//    });
//        
//    return promise;
//        
//    }
};

function searchTagTitle(tagTitle, cacheObjectId) {
    console.log("in the search tag title function");
    var promise = new Parse.Promise();
    
    
    if (cacheObjectId == null) {
        //the first tag, therefore no cache exists currently
        console.log("cacheObjectId is null");
        findParseTagsWithTitle(tagTitle).then(function(users) {
            promise.resolve(users);
        }, function(error) {
            promise.reject(error);
        });
    } else {
        console.log("in the else statement");
    }
    
    return promise;
}

function findParseTagsWithTitle(tagTitle) {
    var promise = new Parse.Promise();
    
    var query = new Parse.Query("ParseUserTag");
    query.equalTo("tagTitle", tagTitle);
    query.include("user");
    
    query.find({
        success: function(userTags) {
        //I set a limit for how many to return to client side, but then I still cache all of the userObjectIds
        var userObjectIds = [];
        var users = [];
        var limit = 50;
        var cacheId = makeid();
            
        for (var i = 0; i < userTags.length; i++) {
            var userTag = userTags[i];
            var user = userTag.get("user");
            
            userObjectIds.push(user.id);
            
            if (i > limit) {
                //if we have a bunch of tags in the future, we return once the limit is hit. But, if not hit, then the users are returned after everything. 
                promise.resolve([cacheId, users]);
            } else {
                users.push(user);
            } 
        }
            promise.resolve([cacheId, users]);
        },
        error: function(error) {
            promise.reject(error);
        }
    });
    
    return promise;
}

function saveSearchCache(cacheId, userObjectIds) {
    var SearchCache = Parse.Object.extend("SearchCache");
    
    
    var caches = [];
    for (var i = 0; i < userObjectIds.length; i++) {
        var cache = new SearchCache();
        cache.set("userObjectId", userObjectIds[i]);
        cache.set("cacheId", cacheId);
    }
    
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var length = 10

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

