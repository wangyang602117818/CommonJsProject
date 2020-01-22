(function (window) {
    window.addEventListener("load", function () { hlsplayer(false) });
    window.hlsplayer = function () { hlsplayer(true); }
    function hlsplayer(manual) {
        var elements = document.getElementsByClassName("hlsplayer");
        for (var i = 0; i < elements.length; i++) {
            var autoInit = elements[i].getAttribute("auto-init");
            if (!manual && autoInit == "false") continue;
            initPlayer(elements[i]);
        }
    }
    function httpget(url, headers, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(target.responseText);
        };
        if (error) xhr.onerror = error;
        xhr.open('get', url);
        xhr.setRequestHeader("tstime", headers.tstime);
        xhr.setRequestHeader("usercode", headers.usercode);
        xhr.send();
    }
    function initPlayer(video) {
        if (video.src && video.src.indexOf("blob:") >= 0) return;
        var source = video.getElementsByTagName("source");
        var src = "";
        if (source.length > 0) {
            src = video.getElementsByTagName("source")[0].src || video.src;
        } else {
            src = video.src;
        }
        if (!src) return;

        var hlsConfig = {
            autoStartLoad: true,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            maxBufferSize: 2 * 1000 * 1000,  //2M

            startPosition: -1,
            xhrSetup: function (xhr, url) {
                //获取user
                var user = null;
                if (typeof StaffID != "undefined") user = StaffID;
                var tsuser = video.getAttribute("tstime-user");
                if (tsuser) user = tsuser;
                //获取文件id
                var fileId = src.match(/\w{24}/)[0];
                var user_init_time = localStorage.getItem(fileId + "-time");
                //未设置user 但是有 user_init_time
                if (!user && user_init_time > 0) video.currentTime = user_init_time;
                video.ontimeupdate = function () {
                    var currentTime = Math.floor(video.currentTime);
                    var time = video.getAttribute("time") || 0;
                    if (Math.abs(currentTime - time) > 1) {
                        this.setAttribute("time", currentTime);
                        if (user) {
                            httpget(src, { tstime: currentTime, usercode: user });
                        } else {
                            localStorage.setItem(fileId + "-time", currentTime)
                        }
                    }
                }
                xhr.setRequestHeader("usercode", user);
            }
        };
        var hls = new Hls(hlsConfig);
        hls.loadSource(src);
        hls.attachMedia(video);
    }
})(window)