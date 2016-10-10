Parse.Cloud.define("hobo", function(request, response) {
  var query = new Parse.Query("ParseSwipe");
//  query.equalTo("userOneApproval", request.params.bool);
  query.find({
    success: function(results) {
      response.success(results.length);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});
