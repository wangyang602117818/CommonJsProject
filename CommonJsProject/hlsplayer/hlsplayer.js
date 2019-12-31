(function (window, $) {
    var currentEle = $("script[script-flowplayer]"),
        autoInit = $("script[script-auto-init]").length == 0 ? "true" : $("script[script-auto-init]").attr("script-auto-init"),
        autoRecord = $("script[script-tstime-record]").length == 0 ? "false" : $("script[script-tstime-record]").attr("script-tstime-record"),
        flowPlayerSrc = currentEle.attr("script-flowplayer"),
        flashlsFlowPlayerSrc = currentEle.attr("script-flowplayerhls");
    if (!flowPlayerSrc) console.log("flowplayer attr required");
    if (!flashlsFlowPlayerSrc) console.log("flowplayerhls attr required");
    if (autoInit == "false") autoInit = false; if (autoInit == "true") autoInit = true;
    window.hlsSupported = (Hls.isSupported() || IsMobile()) ? true : false;
    window.browser = Browser();
    window.isMobile = IsMobile();
    $(function () {
        if (autoInit) begin();
    });
    window.hlsplayer = function () {
        begin();
    };
    $.fn.extend({
        setPlayerSrc: function (src) {
            window.hlsSupported ? setHlsPlayerSrc(this[0], src) : setFlashPlayerSrc(this[0], src);
            return this;
        },
        setPlayerTime: function (time) {
            window.hlsSupported ? setHlsPlayerTime(this[0], time) : setFlashPlayerTime(this[0], time);
        },
        getPlayerTime: function () {
            return window.hlsSupported ? getHlsPlayerTime(this[0]) : getFlashPlayerTime(this[0]);
        },
        getTotalTime: function () {
            return window.hlsSupported ? getHlsPlayerTotalTime(this[0]) : getFalshPlayerTotlaTime(this[0]);
        },
        videoCP: function (scale, success) {
            if (window.hlsSupported) {
                var canvas = document.createElement("canvas");
                canvas.width = this[0].videoWidth * scale;
                canvas.height = this[0].videoHeight * scale;
                canvas.getContext('2d').drawImage(this[0], 0, 0, canvas.width, canvas.height);
                var img = document.createElement("img");
                img.src = canvas.toDataURL('images/png');
                success(img);
            } else {
                console.log("videoCP not supported in FlashPlayer");
            }
        }
    })
    function begin() {
        $(".hlsplayer").each(function () { init(this); });
    }
    function init(video) {
        window.hlsSupported ? initHlsPlayer(video) : initFlashPlayer(video);
    }
    //设置hls播放进度
    function setHlsPlayerTime(video, time) {
        video.currentTime = time;
    }
    //获取hls播放进度
    function getHlsPlayerTime(video) {
        return video.currentTime;
    }
    function getHlsPlayerTotalTime(video) {
        return video.duration;
    }
    function getFalshPlayerTotlaTime(video) {
        var player = flowplayer(video);
        return player.getPlaylist()[0].duration;
    }
    //flash播放进度
    function setFlashPlayerTime(video, time) {
        var palyer = flowplayer(video);
        palyer.seek(time);
    }
    function getFlashPlayerTime(video) {
        var palyer = flowplayer(video);
        return palyer.getTime();
    }
    //重新设置播放源 hls
    function setHlsPlayerSrc(video, src) {
        var playing = !video.paused;  //是否正在播放
        var hls = new Hls({
            autoStartLoad: true,
            maxBufferLength: 5,
            maxBufferSize: 2 * 1000 * 1000,  //2M
            startPosition: -1
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        if (playing) {
            video.play();
        } else {
            video.pause();
        }
    }
    //重新设置播放源 flash
    function setFlashPlayerSrc(obj, src) {
        var playing = flowplayer(obj).isPlaying();  //是否正在播放
        var time = flowplayer(obj).getTime();    //当前播放时间
        flowPlayer(obj, src, playing);
    }
    //初始化播放源 hls
    function initHlsPlayer(video) {
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
                if (autoRecord == "true") {
                    xhr.setRequestHeader("tstime", Math.floor(video.currentTime));
                    xhr.setRequestHeader("usercode", video.getAttribute("tstime-user"));
                }
            }
        };
        var hls = new Hls(hlsConfig);
        //初始化之后设置进度条的位置
        hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
            var tsTime = parseInt(data.networkDetails.getResponseHeader("tstime") || 0, 10);
            if (tsTime > 0 && autoRecord == "true") {
                video.currentTime = tsTime;
                hls.startLoad(startPosition = tsTime);
            }
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        //$(video).on("play", function () { console.log("xx"); hls.startLoad(startPosition = -1) });
    }
    //初始化播放源 flash
    function initFlashPlayer(video) {
        var src = video.getElementsByTagName("source")[0].src || video.src;
        if (video.width) video.style.width = video.width + "px";
        if (video.height) video.style.height = video.height + "px";
        var ele = document.createElement("div");
        if (video.className) ele.className = video.className;
        if (video.style.cssText) ele.style.cssText = video.style.cssText;
        if (video.id) ele.id = video.id;
        $(video).replaceWith(ele);
        flowPlayer(ele, src, false);
    }
    function flowPlayer(ele, src, play) {
        flowplayer(ele, flowPlayerSrc, {
            wmode: 'direct',
            plugins: {
                httpstreaming: {
                    url: flashlsFlowPlayerSrc,
                    hls_debug: false,
                    hls_debug2: false,
                    hls_lowbufferlength: 3,
                    hls_minbufferlength: -1,
                    hls_maxbufferlength: 60,
                    hls_startfromlevel: -1,
                    hls_seekfromlevel: -1,
                    hls_live_flushurlcache: false,
                    hls_seekmode: "ACCURATE",
                    hls_fragmentloadmaxretry: -1,
                    hls_manifestloadmaxretry: -1,
                    hls_capleveltostage: false,
                    hls_maxlevelcappingmode: "downscale"
                }
            },
            clip: {
                accelerated: true,
                url: src,
                urlResolvers: "httpstreaming",
                lang: "fr",
                provider: "httpstreaming",
                autoPlay: play,
                autoBuffering: true
            }
        });
    }
    function IsMobile() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) return true;
        }
        return false;
    }
    function Browser() {
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) return "firefox";
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        if (isSafari) return "safari";
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE) return "ie";
        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge) return "edge";
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isChrome) return "chrome";
    }
})(window, jQuery);