(function() {
  var infoItemTemplate = document.getElementById("info-item-template");
  var infoItemTemplateHTML = infoItemTemplate.outerHTML;

  window.createInfoItem = function(meetStatus, isAdmin) {
    var d = new Date();
    d.setTime(meetStatus.timestamp);
    var sanitizerNode = document.createElement("div");
    sanitizerNode.innerText = meetStatus.message;
    var sanitizedMessage = sanitizerNode.innerHTML;
    var infoItem = infoItemTemplateHTML
      .replace(/{{infoItemContent}}/g, sanitizedMessage)
      .replace(/{{infoItemTimestamp}}/g, d.toLocaleDateString() + " at " + (d.getHours() > 10 ? d.getHours() : "0" + d.getHours()) + ":" + (d.getMinutes() > 10 ? d.getMinutes() : "0" + d.getMinutes()))
      .replace(/hidden mfd/g, "")
      .replace(/info-item-deleteButton/g, isAdmin ? "info-item-deleteButton" : "hidden")
      .replace(/{{owner}}/g, meetStatus.owner)
      .replace(/{{infoItemKey}}/g, meetStatus.id);
    return infoItem;
  };
  [].slice.call(document.getElementsByClassName("mfd")).forEach((el) => {
    el.parentNode.removeChild(el)
  });
})();
(function() {
    var meetID = location.search.split("meet=")[1].split(/\&|\?|\//)[0];
    document.getElementById("meet-id-input").value = meetID;
    getMeets().then((meets) => {
      var meet = meets.val()[meetID];
      if (!meet) return;
      var meetName = meet.name;
      document.getElementById("meet-name-header").innerText = meetName;
      document.getElementsByTagName("title")[0].innerText = meetName + " : As It Stands";
      getMeetStatus(meetID, (meetStatuses) => {
        var meetStatusesArray = [];
        for (meetStatusID in meetStatuses.val()) {
          meetStatusesArray.push(meetStatuses.val()[meetStatusID]);
        }
        var isAdmin = true;

        var sigla = function() {
          console.log(meet);

          document.getElementById("info-items").innerHTML = meetStatusesArray.sort((a, b) => {
            return b.timestamp - a.timestamp
          }).map((meetStatus) => {return createInfoItem(meetStatus, isAdmin)}).join("\n");

          if (!meet.active && !isAdmin && document.getElementById("content-form") != null) {
            var contentForm = document.getElementById("content-form");
            contentForm.parentNode.removeChild(contentForm);
          }

          if (meetStatusesArray.length == 0) {
            document.getElementById("info-items").innerHTML = '<li class="info-item" id="info-item-template">\
             <p class="info-item-content font-graph">No info yet. {{action}}.</p>\
             </li>'.replace(/{{action}}/g, meet.active ? "Try submitting something ↑" : "Check back later for more");
            return;
          }

        };

        firebase.database().ref("admins").once("value").catch(() => {
          isAdmin = false;
          console.log("not admin");
        }).finally(() => {
          sigla();
        });
      });
    });
})();
(function() {
  document.getElementById("content-form").onsubmit = function(e) {
    e.preventDefault();
    console.log(e);
    var meetID = document.getElementById("meet-id-input").value;
    if (!meetID || meetID !== location.search.split("meet=")[1].split(/\&|\?|\//)[0]) {
      console.error("No meet id");
      return;
    }
    var content = document.getElementById("notable-occurrence-textarea").value;
    if (!content || content.trim() == "") {
      return;
    }
    authenticate().then(() => {
      postInfo(meetID, {
        timestamp: new Date().getTime(),
        message: content,
        owner: firebase.auth().currentUser.uid
      }).then((id) => {
        console.log("Posted at " + id);
        document.getElementById("content-form").reset();
      });
    })
  };
  window.deleteInfoItem = function(itemID) {
    var meetID = document.getElementById("meet-id-input").value;
    firebase.database().ref("meetStatuses/" + meetID + "/" + itemID).set(null);
  }
  window.banUser = function(userID) {
    var meetID = document.getElementById("meet-id-input").value;
    firebase.database().ref("bannedUsers").child(userID).set(true).then(() => {
      firebase.database().ref("meetStatuses/" + meetID).once("value").then((snapshot) => {
        var value = snapshot.val();
        for(valueItem_ in value) {
          var valueItem = value[valueItem_];
          if(valueItem.owner == userID) deleteInfoItem(valueItem_);
        }
      })
    }).catch(() => {console.log("ban failed")});;

  }
})();
