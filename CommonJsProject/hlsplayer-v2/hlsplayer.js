(function (window) {
    window.hlsplayer = function () { hlsplayer(); }
    function hlsplayer() {
        var elements = document.getElementsByClassName("hlsplayer");
        for (var i = 0; i < elements.length; i++) {
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
    function setCookieNonExday(cname, cvalue) {
        document.cookie = cname + "=" + cvalue + ";path=/";
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
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
            maxBufferLength: 20,
            maxMaxBufferLength: 40,
            maxBufferSize: 10 * 1000 * 1000,  //10M
            //startPosition: -1,
            xhrSetup: function (xhr) {
                //获取user
                var user = null;
                if (typeof StaffID != "undefined") user = StaffID;
                var tsuser = video.getAttribute("tstime-user");
                if (tsuser) user = tsuser;
                ////获取文件id
                var fileId = src.match(/\w{24}/)[0];
                var user_init_time = getCookie(fileId + "-time");
                ////未设置user 但是有 user_init_time
                if (!user && user_init_time > 0 && video.currentTime == 0) {
                    video.currentTime = user_init_time;
                }
                video.ontimeupdate = function () {
                    var currentTime = Math.floor(video.currentTime);
                    var time = video.getAttribute("time") || 0;
                    if (Math.abs(currentTime - time) > 1) {
                        this.setAttribute("time", currentTime);
                        if (user) {
                            httpget(src, { tstime: currentTime, usercode: user });
                        } else {
                            setCookieNonExday(fileId + "-time", currentTime);
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
})(window);