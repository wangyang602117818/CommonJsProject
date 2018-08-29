(function (win, $) {
    var scripts = $("script");
    var currentEle = $("script[script-flowplayer]"),
        autoLoad = currentEle.attr("script-auto") || true,
        flowPlayerSrc = currentEle.attr("script-flowplayer"),
        flashlsFlowPlayerSrc = currentEle.attr("script-flowplayerhls");
    if (!flowPlayerSrc) console.log("flowplayer attr required");
    if (!flashlsFlowPlayerSrc) console.log("flowplayerhls attr required");
    if (autoLoad == "false") autoLoad = false;
    if (autoLoad == "true") autoLoad = true;
    var hlsSupported = (Hls.isSupported() || IsMobile()) ? true : false;
    var hlsConfig = {
        autoStartLoad: true,
        maxBufferLength:5
    };
    $(function () {
        if (autoLoad) begin();
    });
    win.hlsplayer = function () {
        begin();
    };
    $.fn.extend({
        setPlayerSrc: function (src) {
            hlsSupported ? setHlsPlayerSrc(this[0], src) : setFlashPlayerSrc(this[0], src);
            return this;
        },
        setPlayerTime: function (time) {
            hlsSupported ? setHlsPlayerTime(this[0], time) : setFlashPlayerTime(this[0], time);
        },
        getPlayerTime: function () {
            return hlsSupported ? getHlsPlayerTime(this[0]) : getFlashPlayerTime(this[0]);
        },
        getTotalTime: function () {
            return hlsSupported ? getHlsPlayerTotalTime(this[0]) : getFalshPlayerTotlaTime(this[0]);
        },
        videoCP: function (scale, success) {
            if (hlsSupported) {
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
        hlsSupported ? initHlsPlayer(video) : initFlashPlayer(video);
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
        var hls = new Hls(hlsConfig);
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
        if (video.src.indexOf("blob:") >= 0) return;
        var src = video.getElementsByTagName("source")[0].src || video.src;
        var hls = new Hls(hlsConfig);
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
})(window, jQuery);