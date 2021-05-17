function get_bookmarklet() {
    fetch("./bookmarklet.js").then(res => res.text().then(text=>
        document.getElementById("bookmarklet").href = text
    ));
}

var isYTLoaded = false;
function yt_load(){
    if(!isYTLoaded) {
        isYTLoaded = true;
        var player = new YT.Player('yt-player', {
            videoId: 'e-HNmMR1tmc',
            events: {
                'onReady': onPlayerReady,
            }
        });
        document.getElementById("yt-thumb").style.display = "none";
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
}

window.addEventListener('load', get_bookmarklet);