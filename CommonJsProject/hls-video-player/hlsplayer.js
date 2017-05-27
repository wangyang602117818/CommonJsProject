(function (win, $) {
    var scripts = $("script");
    var currentEle = $(scripts[scripts.length - 1]),
        flowPlayerSrc = currentEle.attr("flowplayer"),
        flashlsFlowPlayerSrc = currentEle.attr("flowplayerhls");
    if (!flowPlayerSrc) console.log("flowplayer attr required");
    if (!flashlsFlowPlayerSrc) console.log("flowplayerhls attr required");
    $(function () {
        $("video").each(function () { init(this) });
    });
    function init(video) {
        if (Hls.isSupported()) {
            hlsPlayer(video)
        } else {
            flashPlayer(video);
        }
    }
    function hlsPlayer(video) {
        var src = video.getElementsByTagName("source")[0].src || video.src;
        var hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
    }
    function flashPlayer(video) {
        var src = video.getElementsByTagName("source")[0].src || video.src;
        if (video.width) video.style.width = video.width + "px";
        if (video.height) video.style.height = video.height + "px";
        var ele = document.createElement("div");
        if (video.className) ele.className = video.className;
        if (video.style.cssText) ele.style.cssText = video.style.cssText;
        $(video).replaceWith(ele);
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
                autoPlay: false,
                autoBuffering: true
            }
        });
    }
})(window, jQuery);