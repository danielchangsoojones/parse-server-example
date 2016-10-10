Parse.Cloud.define("getUsersAndTheirTags", function(request, response) {
    var query = new Parse.Query("ParseTag");
    var tagTitles = request.params.tagTitles;
    query.containedIn("title", tagTitles);
    query.include("createdBy");
    query.find({ useMasterKey : true }).then(
        function(results) {
            var necessaryTagCount = tagTitles.length;
            var userTagRatioDictionary = {};
            var usersToPass = [];
            for (var i = 0; i < results.length; ++i) {
//                var user = results[i].get("createdBy");
//                if user in userTagRatioDictionary {
//                    userTagRatioDictionary[user] = userTagRatioDictionary[user] + 1;
//                    if userTagRatioDictionary[user] == necessaryTagCount {
//                        usersToPass.push(user);
//                    }
//                } else {
//                    userTagRatioDictionary[user] = 1;
//                }
            }
            response.success(usersToPass);
        },
        function(error) {
            response.error(error);
            console.log(error);
        }
  );
});
