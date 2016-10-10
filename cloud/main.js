
Parse.Cloud.define("averageStars", function(request, response) {
  var query = new Parse.Query("User");
    let userId = request.params.userId;
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