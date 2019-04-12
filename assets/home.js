(function() {
  var listItemTemplate = document.getElementById("list-meets-item-template");
  var listItemTemplateHTML = listItemTemplate.outerHTML;
  window.createListItem = function(meetData, isAdmin) {
    var listItem = listItemTemplateHTML
      .replace(/{{meetID}}/g, meetData.id)
      .replace(/{{meetName}}/g, meetData.name)
      .replace(/{{meetDate}}/g, meetData.date)
      .replace(/{{disabled}}/g, meetData.active == false ? "disabled" : "")
      .replace(/{{meetKey}}/g, meetData.id)
      .replace(/meet-deleteButton/g, isAdmin ? "meet-deleteButton" :  "hidden")
      .replace(/hidden mfd/g, "");
    return listItem;
  };
  [].slice.call(document.getElementsByClassName("mfd")).forEach((el) => {
    el.parentNode.removeChild(el)
  });
})();
(function() {
  window.renderMeets = function(isAdmin) {
    getMeets().then((meets) => {
      var meetsArray = [];
      for (meetID in meets.val()) {
        meetsArray.push(meets.val()[meetID]);
      }
      meetsArray.sort((a, b) => {
        return Date.parse(b.date) - Date.parse(a.date);
      })
      document.getElementById("list-meets").innerHTML = meetsArray.map((meet) => {
        return createListItem(meet, isAdmin);
      }).join("\n");
    });
  }
})();
(function() {
  var isAdmin = true;
  firebase.database().ref("admins").once("value").catch(() => {
    isAdmin = false;
    console.log("not admin");
  }).finally(() => {
    renderMeets(isAdmin);
    if(!isAdmin) document.getElementById("meet-form").setAttribute("class", "hidden");
  });
  document.getElementById("meet-form").onsubmit = function(e) {
    e.preventDefault();
    var meetName = document.getElementById("meet-name-input").value;
    var meetDate = document.getElementById("meet-date-input").value;
    var failed = false;
    firebase.database().ref("meets").push({name: meetName, date: meetDate, active: false}).catch(() => {
      failed = true;
    }).then((snapshot) => {

      if(failed) alert("Posting failed") && location.reload();

      firebase.database().ref("meets/" + snapshot.key + "/id").set(snapshot.key).then(() => {
        location.reload();
      });
    });
  };
  window.deleteMeet = function(meetID) {
    var failed = false
    firebase.database().ref("meets/" + meetID).set(null).catch(() => {
      failed = true;
    }).finally(() => {
      if(failed) {
        alert("Meet deletion failed.");
      }
      location.reload();
    });
  }
})();
