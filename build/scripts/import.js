function storeArchiveTags(jsonText) {
        var obj, N, i, keys;
        obj = JSON.parse(jsonText);
        // add tag to the database
        //
        keys = Object.keys(obj.storedTags);
        N = keys.length;
        Models.addTag.prototype.visitNum = 0;
        for(i = 0; i < N; ++i) {
            console.log("data_import: " + i);
            Models.addTag({url:keys[i]}, 
                obj.storedTags[keys[i]].tag_name, 
                function () {
                    console.log("stored: " + keys[i]);
                });
        }

        console.log(obj);
        alert("You data has been successfully imported!");
}

data_import = function () {
    var url = $("#json_file")[0].value,
        xhr = new XMLHttpRequest();
    try {
        storeArchiveTags(url);
    } catch (e) {
        xhr.onreadystatechange = function(){
            if (xhr.readyState==4 && xhr.status==200) {
                storeArchiveTags(xhr.responseText);
            }
        };
        xhr.open("GET", url); 
        xhr.send();
    }
};
$('#data_import').on("click", data_import);

