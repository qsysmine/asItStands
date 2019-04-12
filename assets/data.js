(function() {
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

})();
