module.exports = {
    sendMatchNotification: function(targetUserObjectId, parseSwipeObjectId) {
        sendMatchNotification(targetUserObjectId, parseSwipeObjectId);
    }
};

function sendMatchNotification(targetUserObjectId, objectId) {
    var pushQuery = new Parse.Query(Parse.Installation);
    
    var innerQuery = new Parse.Query("User");
    innerQuery.equalTo("objectId", targetUserObjectId);
    
    pushQuery.matchesQuery("user", innerQuery);
    
    Parse.Push.send({
    where: pushQuery,
    data: {
    alert: 'Test',
    badge: "Increment",
    sound: 'default',
    "identifier": "toMatch",
    "objectId": objectId
    }
    }, { useMasterKey: true }).then(function() {
    // Push sent!
        console.log("successs");
    }, function(error) {
        // There was a problem
        console.log("fuck")
        console.log(error);
      });
}
