// ==UserScript==
// @name         Automate Deleting Facebook Comments and Reactions
// @namespace    http://violentmonkey.com/
// @version      1.0
// @author       djfrey
// @description  Automatically delete comments and reactions
// @match        *://*facebook.com/*/allactivity*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';

  var category = getQueryVal('category_key');
  const btnId = 'fb-vm-script-btn';
  const cat = {
    "COMMENTSCLUSTER": {
      "btn": {"start": "Remove comments", "stop": "Cancel"},
      "text": "Remove",
      "confirm": "Remove"
    },
    "LIKEDPOSTS": {
      "btn": {"start": "Remove likes", "stop": "Cancel"},
      "text": "Remove",
      "confirm": "Remove"
    },
    "MANAGEPOSTSPHOTOSANDVIDEOS": {
      "btn": {"start": "Remove posts", "stop": "Cancel"},
      "text": "Trash",
      "confirm": "Move to trash"
    },
    "YOURACTIVITYTAGGEDINSCHEMA": {
      "btn": {"start": "Remove tags", "stop": "Cancel"},
      "text": "Remove Tags",
      "confirm": "Remove tags"
    }
  };

  var scriptRunning = false;

  //https://www.facebook.com/727260453/allactivity?activity_history=false&category=COMMENTSCLUSTER&manage_mode=false&should_load_landing_page=false
  function getQueryVal(key) {
    let q = new URLSearchParams(window.location.search);
    let out = q.get(key);
    return out;
  }

  function getNode(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  async function doDelete() {
    if (!cat[category]) {
      if (category) {
        alert("Couldn't find a way to delete " + category);
      } else {
        alert("Must be in an Activity Log category");
      }
    } else {
      /*let b = document.getElementById(btnId);

      if (scriptRunning) {
        b.textContent = cat[category].btn.stop;
        scriptRunning = false;
        return;
      } else {
        b.textContent = cat[category].btn.start;
        scriptRunning = true;
      }*/

      let checkAll = document.querySelectorAll('input[type="checkbox"]')[0]; //The "All" checkbox should be the first checkbox on the page

      if (!checkAll) {
        alert('Could not find "All" checkbox');
        return;
      }

      let isChecked = checkAll.getAttribute('aria-checked');
      if (isChecked == "false") {
        checkAll.click();
        await new Promise(r => setTimeout(r, 500));
      }

      let removeButton = getNode("//span[text()='" + cat[category].text + "']");
      if (removeButton) {
        removeButton.click();
        await new Promise(r => setTimeout(r, 1000));
        let removeConfirm = document.querySelectorAll('[aria-label="' + cat[category].confirm + '"]')[1];
        if (removeConfirm) {
          removeConfirm.click();
        }
        //Pause for a second, the delete will begin, and the background position of the checkbox will change...
        await new Promise(r => setTimeout(r, 1000));
        var interval = setInterval(function() {
          //This is a visual identification of the All checkbox state
          //We can tell what's going on by the background image position
          let i = document.querySelectorAll('i[data-visualcompletion="css-img"]')[0];
          let pos = i.style.backgroundPositionY;
          if (pos == "-125px") { //The delete is done!
            clearInterval(interval);
          }
        }, 1000);
      }

      var c = 10;

      var intAll = setInterval(function() {
        if (document.querySelectorAll('[aria-label="Action options"]').length) {
          c = 10;
          clearInterval(intAll);
          doDelete();
        } else {
          c--;
          if (c === 0) {
            clearInterval(intAll);
            alert("All items have been removed");
            return;
          }
        }
      }, 750);
    }
  }

  function addTriggerButton() {
    var interval = setInterval(function() {
      var m = document.querySelector('div[aria-label="Account Controls and Settings"]');
      if (m) {
          clearInterval(interval);
          var b = document.createElement("button");
          b.id = btnId;
          //b.textContent = cat[category].btn.start;
          b.textContent = "Start";
          b.style.zIndex = '9999';
          b.style.fontSize = "1.2rem";
          b.style.margin = "0px 10px";
          b.addEventListener('click', doDelete);
          m.prepend(b);
      }
    }, 100);
  }


  addTriggerButton();

})();