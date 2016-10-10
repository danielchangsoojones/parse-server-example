Parse.Cloud.define("getUsersAndTheirTags", function(request, response) {
    var query = new Parse.Query("ParseTag");
    var tagTitles = request.params.tagTitles;
    query.containedIn("title", tagTitles);
    query.include("createdBy");
    query.find({ useMasterKey : true }).then(
        function(results) {
            response.success(results);
        },
        function(error) {
            response.error(error);
            console.log(error);
        }
  );
});
