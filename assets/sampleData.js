(function() {
  var meets = {
    val: function() {
      return {
        "00000": {
          name: "Arcadia Invitational",
          id: "00000",
          date: "5-6 April 2019",
          active: true
        },
        "00001": {
          name: "Granada Sprint & Distance Festival",
          id: "00001",
          date: "13 April 2019",
          active: false
        }
      }
    }
  };

  var meetStatuses = {
    "00000": {
      val: function() {
        return {
          "00000-00001": {
            timestamp: 1554326721898,
            message: "Message 00001"
          },
          "00000-00002": {
            timestamp: 1554326721900,
            message: "Message 00002"
          },
          "00000-00003": {
            timestamp: 1554326722000,
            message: "Message 00003"
          }
        }
      }
    }
  };
  var online = true;
  if (!online) {
    window.getMeets = function() {
      return new Promise((resolve, reject) => {
        //TODO: Datasource;
        return resolve(meets);
      });
    };
    window.getMeetStatus = function(meetID, resolve) {

      return resolve(meetStatuses[meetID]);
    };
    window.authenticate = function() {
      return new Promise((resolve, reject) => {
        //TODO: authenticate
        return resolve();
      })
    };
    window.postInfo = function(meetID, infoObj) {
      return new Promise((resolve, reject) => {
        console.log(meetID, infoObj);
        return resolve(new Date().getTime());
      });
    }
  } else {
    window.getMeets = function() {
      return firebase.database().ref("meets").once("value");
    };
    window.getMeetStatus = function(meetID, resolve) {
      firebase.database().ref("meetStatuses").child(meetID).on("value", (meetRef) => {
        console.log(meetRef.exists());
        if (meetRef.exists()) return resolve(meetRef);
        resolve({
          val: function() {
            return {};
          }
        });
      })
    }
    window.authenticate = function() {
      return new Promise((resolve, reject) => {

        if (firebase.auth().currentUser != null) return resolve(firebase.auth().currentUser);

        return firebase.auth().signInAnonymously().then(resolve).catch(reject);

      })
    }
    window.postInfo = function(meetID, infoObj) {
      return new Promise((resolve, reject) => {
        var uid = new Date().getTime();
        infoObj.id = uid;
        var hasFailed = false;
        return new firebase.database().ref("meetStatuses").child(meetID).child(uid).set(infoObj).catch(() => {
          hasFailed = true;
          console.log("has failed")
          return reject();
        }).then(() => {
          if (!hasFailed) {
            return resolve(uid);
          }
        });
      });
    }
  }
})();
