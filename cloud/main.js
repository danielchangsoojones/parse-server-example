
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


Parse.Cloud.job("changeTagging", function(request, status) {
 var query = new Parse.Query(Parse.User);
    query.limit(200);
      console.log("I just started the changingTagging Job");
    
    query.find({
    success: function(users) {
        console.log(users.length);
    // list contains the posts that the current user likes.
  }
});
    
query.find({useMasterKey: true}).then(function(users) {
    console.log(users.length);
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        
        runQuery(user);
        
    }
     }, function(error) {
         console.log(error);
});
 
});

function runQuery(user) {
    var relation = user.relation("tags");
    var query = relation.query();
    
    query.find({
            success: function(parseTags) {
                for (var q = 0; q < parseTags.length; q++) {
                    var parseTag = parseTags[q];
                    save(parseTag, user)
                }
            }
    });
}

function save(parseTag, user) {

        
        var title = parseTag.get("title");
        
            var ParseUserTag = Parse.Object.extend("ParseUserTag");
    var parseUserTag = new ParseUserTag();
    parseUserTag.set("tagTitle", title);
    parseUserTag.set("parseTag", parseTag);
    parseUserTag.set("user", user);
    parseUserTag.save(null, {useMasterKey:true}).then( function(p) {
        console.log("finished saving" + p.id);
                }, function(error) {
                    console.log(error);
                });
    
    user.addUnique("tagsArray", title);
    user.save(null, {useMasterKey:true}).then( function(theUser) {
        console.log("finished saving" + theUser.id);
        }, function(error) {
            console.log(error);
        });
}


Parse.Cloud.job("removeDuplicates", function(request, status) {
    var _ = require("underscore");
    
    var hashTable = {};

  function hashKeyForTestItem(testItem) {
    var fields = ["tagTitle"];
    var hashKey = "";
    _.each(fields, function (field) {
        hashKey += testItem.get(field) + "/" ;
    });
      hashKey += testItem.get("user").id
      console.log(hashKey);
    return hashKey;
  }

  var testItemsQuery = new Parse.Query("ParseUserTag");
    testItemsQuery.include("user");
  testItemsQuery.each(function (testItem) { 
    var key = hashKeyForTestItem(testItem);

    if (key in hashTable) { // this item was seen before, so destroy this
        return testItem.destroy();
    } else { // it is not in the hashTable, so keep it
        hashTable[key] = 1;
    }
      console.log("finished dealing with the hash key" + key);
  });

});

Parse.Cloud.job("convertOriginalTagClass", function(request, status) {
    var query = new Parse.Query("Tags");
    query.find({
            success: function(tags) {
                for (var q = 0; q < tags.length; q++) {
                    var tag = tags[q];
                    var genericTags = tag.get("genericTags");
                    
                    if (genericTags != null) {
                        for (var i = 0; i < genericTags.length; i++) {
                        var genTag = genericTags[i];
                            if (!hasNumbers(genTag)) {
                                console.log("without number" + genTag);
                                saveANewTag(tag.get("createdBy"), genTag);
                            }
                        
                    }
                    }
                }
            }
    });
    console.log("converting the Tags class");
    
    

});

function saveANewTag(user, tagTitle) {
    var query = new Parse.Query("ParseTag");
    console.log(tagTitle);
    query.equalTo("title", tagTitle);
    query.first({
            success: function(parseTag) {
                if (parseTag == undefined) {
                    var ParseTag = Parse.Object.extend("ParseTag");
                    var newParseTag = new ParseTag();
                    newParseTag.set("title", tagTitle);
                    newParseTag.set("attribute", "generic");
                    newParseTag.set("isPrivate", false);
                    
                    newParseTag.save(null, {
                        success: function(gameScore) {
                        // Execute any logic that should take place after the object is saved.
                        save(newParseTag, user);
                    },
                        error: function(gameScore, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        console.log(error);
                        }
                    });
                    
                    
                } else {
                console.log(parseTag);
                save(parseTag, user);
                }
                
            }
    });
}

function hasNumbers(t) {
var regex = /\d/g;
return regex.test(t);
}  

