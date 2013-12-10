fetchInputToken = function () {
    var evernoteToken = $("#evernote_token_input")[0].value;
    console.log("evernoteToken: " + evernoteToken);
    var notestoreUrl = $("#evernote_notestore_input")[0].value;
    console.log("notestoreUrl: " + notestoreUrl);
    var info = {
        evernoteToken: evernoteToken,
        notestoreUrl: notestoreUrl
    };
    // debugger;
    chrome.storage.sync.set({'evernoteOAuth': info}, function () {
        console.log('successfully stored token');
        $("#main_body").html("<h1>Successfully updated token!</h1>");
    });
};
$('#evernote_token_input_button').on("click", fetchInputToken);

