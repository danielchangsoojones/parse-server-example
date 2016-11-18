
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

//Jobs
Parse.Cloud.job("copyUsernamesToEmail", function(request, status) {
var query = new Parse.Query(Parse.User);

  // Update the Job status message
 console.log("I just started");
    
    query.find({useMasterKey: true}).then(function(users) {
        
        var usersToUpdate = []
            for (var i = 0; i < user.count; i++) {
                var user = users[i];
                var email = user.get("email");
                if (email == null) {
                    user.set("email", user.get("username"));
                    usersToUpdate.push(user);
                }
            }
            Parse.Object.saveAll(usersToUpdate, {
            success: function(objs) {
            // objects have been saved...
                console.log("the job was a success");
            },
            error: function(error) { 
            // an error occurred...
                console.log(error);
            }
        });
        
        
    }, function(error) {
        console.log(error);
    });

});

