
Parse.Cloud.define("saveOtherUser", function(request, response) {
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", request.params.targetObjectId);
    query.find({useMasterKey : true}).then(function(results) {
    // process the result of the query here
    // Save the user object
//        success: function(results) {
//            var obj = results[0];
//                obj.save(null,{
//                  success: function (object) { 
//                    response.success(object);
//                  }, 
//                error: function (object, error) { 
//                  response.error(error);
//                }
//              });
//        },
//        error: function(error) {
//            console.log("failed");
//        }

    });
  });
