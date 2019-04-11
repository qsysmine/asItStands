(function() {
  var listItemTemplate = document.getElementById("list-meets-item-template");
  var listItemTemplateHTML = listItemTemplate.outerHTML;
  window.createListItem = function(meetData) {
    var listItem = listItemTemplateHTML
      .replace(/{{meetID}}/g, meetData.id)
      .replace(/{{meetName}}/g, meetData.name)
      .replace(/{{meetDate}}/g, meetData.date)
      .replace(/{{disabled}}/g, meetData.active == false ? "disabled" : "")
      .replace(/hidden mfd/g, "");
    return listItem;
  };
  [].slice.call(document.getElementsByClassName("mfd")).forEach((el) => {
    el.parentNode.removeChild(el)
  });
})();
(function() {
  getMeets().then((meets) => {
    var meetsArray = [];
    for (meetID in meets.val()) {
      meetsArray.push(meets.val()[meetID]);
    }
    document.getElementById("list-meets").innerHTML = meetsArray.map(createListItem).join("\n");
  });
})();
