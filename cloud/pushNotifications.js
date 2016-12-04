module.exports = {
    sendMatchNotification: function(targetUserObjectId, parseSwipeObjectId) {
        sendMatchNotification(targetUserObjectId, parseSwipeObjectId);
    },
    sendChatNotification: function(sender, chatMessage) {
        sendChatNotification(sender, chatMessage)
    }
};

function sendMatchNotification(targetUserObjectId, parseSwipeObjectId) {
    var pushQuery = createPushQuery(targetUserObjectId);
    
    Parse.Push.send({
    where: pushQuery,
    data: {
    alert: 'You have a new match!',
    badge: "Increment",
    sound: 'default',
    "identifier": "toMatch",
    "objectId": parseSwipeObjectId
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

function sendChatNotification(sender, chatMessage) {
    var pushQuery = createPushQuery(sender.id);
    var fullName = sender.get("fullName");
    var notificationMessage = fullName + "sent you a new message"
    
    Parse.Push.send({
        where: pushQuery,
        data: {
            alert: notificationMessage,
            badge: "Increment",
            sound: 'default',
            "identifier": "toChat",
            "objectId": sender.id
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

function createPushQuery(targetUserObjectId) {
    var pushQuery = new Parse.Query(Parse.Installation);
    
    var innerQuery = new Parse.Query("User");
    innerQuery.equalTo("objectId", targetUserObjectId);
    
    pushQuery.matchesQuery("user", innerQuery);
    return pushQuery
}
