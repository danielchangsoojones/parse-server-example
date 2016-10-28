
Parse.Cloud.define("modifyUser", function(request, response) {
  // The rest of the function operates on the assumption that request.user is *authorized*

  Parse.Cloud.useMasterKey();

  // Query for the user to be modified by username
  // The username is passed to the Cloud Function in a 
  // key named "username". You can search by email or
  // user id instead depending on your use case.

  var query = new Parse.Query(Parse.User);
  query.equalTo("objectId", request.params.targetObjectId);

  // Get the first user which matches the above constraints.
  query.first({
    success: function(anotherUser) {
      // Successfully retrieved the user.
      // Modify any parameters as you see fit.
      // You can use request.params to pass specific
      // keys and values you might want to change about
      // this user.
      anotherUser.set("name", "Poopy Pajama");

      // Save the user.
      anotherUser.save(null, {
        success: function(anotherUser) {
          // The user was saved successfully.
          response.success("Successfully updated user.");
        },
        error: function(gameScore, error) {
          // The save failed.
          // error is a Parse.Error with an error code and description.
          response.error("Could not save changes to user.");
        }
      });
    },
    error: function(error) {
      response.error("Could not find user.");
    }
  });
});
