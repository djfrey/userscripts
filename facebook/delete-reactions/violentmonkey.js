// ==UserScript==
// @name         Automate Deleting Facebook Comments and Reactions
// @namespace    http://violentmonkey.com/
// @version      1.0
// @author       djfrey
// @description  Automatically delete comments and reactions
// @match        *://*facebook.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

	function activityLogGet() {
		let linkOrder = [
			document.querySelector('[aria-label="Your profile"]'),
			document.evaluate("//span[text()='Settings & privacy']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
			document.evaluate("//span[text()='Actity log']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
		]
		for (let i = 0; i < linkOrder.length; i++) {
			let btn = linkOrder[i];
			setTimeout(clickElement(btn), 500);
		}
	}

	function clickElement(element) {
		element.click();
	}

    async function deleteNotifications() {
        const full_name = await promptForName();
        const menu_label = "Manage " + full_name + " notification settings";
        const delete_label = "Delete this notification";

        while(true) {
            const menu = document.querySelector(`[aria-label="${menu_label}"]`);
            if (!menu) {
                alert('No item found');
                break;
            }
            menu.click();
            await new Promise(r => setTimeout(r, 1000));

            const buttons = document.evaluate(`//span[contains(., '${delete_label}')]`, document, null, XPathResult.ANY_TYPE, null);
            const button = buttons.iterateNext();

            if (!button) {
                break;
            }

            button.click();
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    function promptForName() {
        return new Promise((resolve) => {
            const name = prompt("Enter your full name:");
            resolve(name || "You Full Name");
        });
    }

    function addTriggerButton() {
        const button = document.createElement('button');
        button.textContent = 'Start';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '9999';
        button.addEventListener('click', activityLogGet);
        document.body.appendChild(button);
    }

    // Violentmonkey-specific style application
    GM_addStyle(`
        #notification-delete-button {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
        }
    `);

    addTriggerButton();
})();