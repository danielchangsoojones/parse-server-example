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

function searchTagTitle(tagTitle, cacheIdentifier) {
    console.log("in the search tag title function");
    var promise = new Parse.Promise();
    
    
    if (cacheIdentifier == null) {
        //the first tag, therefore no cache exists currently
        console.log("cacheObjectId is null");
        findParseTagsWithTitle(tagTitle).then(function(results) {
            promise.resolve(results);
        }, function(error) {
            promise.reject(error);
        });
    } else {
        //cache identifier exists
        querySearchCache(tagTitle, cacheIdentifier).then(function(results) {
            console.log("hey im in the results");
            promise.resolve(results);
        }, function(error) {
            promise.reject(error);
        });
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
        var users = [];
        var limit = 50;
        var cacheId = makeid();
            
        for (var i = 0; i < userTags.length; i++) {
            
            var userTag = userTags[i];
            var user = userTag.get("user");
            
            if (i > limit) {
                //if we have a bunch of tags in the future, we return once the limit is hit. But, if not hit, then the users are returned after everything. 
                promise.resolve([cacheId, users]);
            } else {
                users.push(user);
            } 
        }
            
            if (users.length > 0) {
                promise.resolve([cacheId, users]);
                saveSearchCache(users, cacheId);
            } else {
                promise.resolve(createNoObjectsReturn());
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });
    
    return promise;
}

function saveSearchCache(users, cacheId) {
    if (users.length > 0) {
    var SearchCache = Parse.Object.extend("SearchCache");
    var searchCache = new SearchCache();
    
    searchCache.set("cacheIdentifier", cacheId);
    
    console.log("saving the users to cache");
    console.log(users);
    
        var relation = searchCache.relation("users");
        relation.add(users);
    
        searchCache.save(null, {
            success: function(searchCache) {
                console.log(searchCache.id)
            },
            error: function(searchCache, error) {
                console.log(error);
            }
        });
    
    }
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var length = 10;

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function querySearchCache(tagTitle, cacheIdentifier) {
    var query = new Parse.Query("SearchCache");
    query.equalTo("cacheIdentifier", cacheIdentifier);
    
    var promise = new Parse.Promise();
    
    query.first({
        success: function(searchCache) {
           queryCachedUserRelation(searchCache, tagTitle).then(function(results) {
               promise.resolve(results);
           }, 
        function(error){
               promise.reject(error);
        });
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise
}

function queryCachedUserRelation(searchCache, tagTitle) {
    console.log(searchCache);
    var relation = searchCache.relation("users");
    var query = relation.query();
    //TODO: need to make the users have an array of their tagTitles. 
    query.equalTo("tagsArray", tagTitle);
    
    var promise = new Parse.Promise();
    
    query.find({
        success: function(users) {
            var cacheIdentifier = makeid()
            if (users.length > 0) {
                promise.resolve([cacheIdentifier,users]);
                saveSearchCache(users,cacheIdentifier);
            } else {
                //no users found
                promise.resolve(createNoObjectsReturn());
            }
        },
        error: function(error) {
            console.log(error);
            promise.reject(error);
        }
    });
    
    return promise;
}

function createNoObjectsReturn() {
    var results = ["", []];
    return results;
}
