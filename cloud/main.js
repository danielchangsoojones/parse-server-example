Parse.Cloud.define("hobo", function(request, response) {
  var query = new Parse.Query("ParseSwipe");
//  query.equalTo("userOneApproval", request.params.bool);
  query.find({ useMasterKey : true }).then(
      function(results) {
      response.success("helllo");
  });
});
