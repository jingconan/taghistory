/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, chrome, ChromeExOAuth*/
"use strict";
chrome.browserAction.onClicked.addListener(function () {
    // chrome.tabs.create({url:chrome.extension.getURL("popup.html")});
    chrome.tabs.create({url: chrome.extension.getURL("index.html")});
});
