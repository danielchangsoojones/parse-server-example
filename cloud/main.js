
Parse.Cloud.define("getUsersAndTheirTags", function(request, response) {
    var query = new Parse.Query("ParseTag");
    var tagTitles = request.params.tagTitles;
    query.containedIn("title", tagTitles);
    query.include("createdBy");
  query.find({
    success: function(results) {
    //the necessaryTagCount means that a user must have this number of tags to be a chosen user, because a chosen user needs to have all searched tags.
    var necessaryTagCount = tagTitles.length;
    var userTagRatioDictionary = {};
    var usersToPass = [];
      for (var i = 0; i < results.length; ++i) {
          var user = results[i].get("createdBy");
          if user in userTagRatioDictionary {
              userTagRatioDictionary[user] = userTagRatioDictionary[user] + 1;
              if userTagRatioDictionary[user] == necessaryTagCount {
                  usersToPass.push(user);
              }
          } else {
              userTagRatioDictionary[user] = 1;
          }
      }
      response.success(usersToPass);
    },
    error: function() {
      response.error("there is an error in this cloud func");
    }
  });
});

Parse.Cloud.define("averageStars", function(request, response) {
  var query = new Parse.Query("User");
    let userId = request.params.userIds[0];
  query.equalTo("objectId", userId);
  query.find({
    success: function(results) {
      response.success(results.item[0]);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});