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
  
    var category_key = getQueryVal('category_key');
  
    //https://www.facebook.com/727260453/allactivity?activity_history=false&category_key=COMMENTSCLUSTER&manage_mode=false&should_load_landing_page=false
    function getQueryVal(key) {
      let q = new URLSearchParams(window.location.search);
      let out = q.get(key);
      return out;
    }
  
    function getNode(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
  
    //COMMENTSCLUSTER
    async function doDelete() {
      var cat = [{
        "COMMENTSCLUSTER": {
          "text": "Remove",
          "confirm": "Remove"
        },
        "LIKEDPOSTS": {
          "text": "Remove",
          "confirm": "Remove"
        },
        "MANAGEPOSTSPHOTOSANDVIDEOS": {
          "text": "Trash",
          "confirm": "Move to trash"
        }
      }];
  
  
      switch (category_key) {
        case 'COMMENTSCLUSTER':
        case 'LIKEDPOSTS':
        case 'MANAGEPOSTSPHOTOSANDVIDEOS':
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
  
          let removeButton = getNode("//span[text()='" + cat[category_key].text + "']");
          if (removeButton) {
            removeButton.click();
            await new Promise(r => setTimeout(r, 1000));
            let removeConfirm = document.querySelectorAll('[aria-label="' + cat[category_key].confirm + '"]')[1];
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
        break;
        default:
          if (category_key) {
            alert("Couldn't find a way to delete " + category_key);
          } else {
            alert("Must be in an Activity Log category");
          }
        break;
      }
    }
  
    function addTriggerButton() {
      var interval = setInterval(function() {
        var m = document.querySelector('div[aria-label="Account Controls and Settings"]');
        if (m) {
            clearInterval(interval);
            var b = document.createElement("button");
            b.textContent = 'Start';
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