module.exports = {
    sendMatchNotification: function(targetUserObjectId, parseSwipeObjectId) {
        sendMatchNotification(targetUserObjectId, parseSwipeObjectId);
    },
    sendChatNotification: function(receiver, sender, chatMessage) {
        sendChatNotification(receiver, sender, chatMessage)
    },
    sendAddedTagNotification: function(userForTag, tagTitle, createdBy) {
        sendAddedTagNotification(userForTag, tagTitle, createdBy);
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

function sendChatNotification(receiver, sender, chatMessage) {
    receiver.fetch().then(function(fullReceiver) {
            var pushQuery = createPushQuery(fullReceiver.id);
        var fullName = fullReceiver.get("fullName");
        var notificationMessage = fullName + " sent you a new message"
    
        Parse.Push.send({
            where: pushQuery,
            data: {
                alert: notificationMessage,
                badge: "Increment",
                sound: 'default',
                "identifier": "toChat",
                "senderObjectId": sender.id
            }
        }, { useMasterKey: true }).then(function() {
            // Push sent!
            console.log("successs");
        }, function(error) {
            // There was a problem
            console.log(error);
        });
    });
}

function sendAddedTagNotification(userForTag, tagTitle, createdBy) {
    console.log("heyyyyy");
    console.log(userForTag);
    console.log(createdBy);
    if (userForTag.id != createdBy.id && createdBy != null) {
        createdBy.fetch().then(function(fetchedCreatedBy) {
        var pushQuery = createPushQuery(userForTag.id);
        var fullName = fetchedCreatedBy.get("fullName");
        var firstName = fullName.substring(0, fullName.indexOf(" "));
        var notificationMessage = firstName + " tag you as " + tagTitle
    
        Parse.Push.send({
            where: pushQuery,
            data: {
                alert: notificationMessage,
                badge: "Increment",
                sound: 'default',
                "identifier": "toApproveTag",
            }
        }, { useMasterKey: true }).then(function() {
            // Push sent!
            console.log("successs");
        }, function(error) {
            // There was a problem
            console.log(error);
        });
    });
        
    }
}


function createPushQuery(targetUserObjectId) {
    var pushQuery = new Parse.Query(Parse.Installation);
    
    var innerQuery = new Parse.Query("User");
    innerQuery.equalTo("objectId", targetUserObjectId);
    
    pushQuery.matchesQuery("user", innerQuery);
    return pushQuery
}
