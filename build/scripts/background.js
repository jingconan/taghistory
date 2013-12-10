/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, chrome, ChromeExOAuth*/
"use strict";
chrome.browserAction.onClicked.addListener(function () {
    // chrome.tabs.create({url:chrome.extension.getURL("popup.html")});
    chrome.tabs.create({url: chrome.extension.getURL("index.html")});
});

// var evernoteHostName = 'https://sandbox.evernote.com';
// var oauth = ChromeExOAuth.initBackgroundPage({
//     'request_url' : evernoteHostName + '/oauth',
//     'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
//     'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
//     'consumer_key' : 'anonymous',
//     'consumer_secret' : 'anonymous',
//     'scope' : '',
//     'app_name' : 'Tag-History'
// });

// var onEver = function () {};
// var onAu = function () {
//     console.log("on authorize");
//     var url = evernoteHostName + '/oauth';
//     oauth.sendSignedRequest(url, onEver, {
//     });

// };

// var auEvernote = function () {
//     oauth.authorize(onAu);

// };

