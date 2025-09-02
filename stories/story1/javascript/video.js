// Add event listeners for video looping
var bgVideo = document.getElementById("bgVideo");
if (bgVideo) {
    bgVideo.addEventListener("loadedmetadata", function() {
        bgVideo.currentTime = pageData.bgStart;
    });

    bgVideo.addEventListener("timeupdate", function() {
        if (bgVideo.currentTime >= pageData.bgEnd) {
            bgVideo.currentTime = pageData.bgStart;
        }
    });
}

// Modified fgVideo event listener snippet
var fgVideo = document.getElementById("fgVideo");
if (fgVideo) {
    fgVideo.addEventListener("loadedmetadata", function() {
        fgVideo.currentTime = pageData.fgStart;
    });

    fgVideo.addEventListener("timeupdate", function() {
        if (fgVideo.currentTime >= pageData.fgEnd) {
            fgVideo.currentTime = pageData.fgStart;
        }
    });
}
