Parse.Cloud.define("hobo", function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo("fullName", request.params.fullName);
  query.find({
    success: function(results) {
      response.success(results.length);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});
