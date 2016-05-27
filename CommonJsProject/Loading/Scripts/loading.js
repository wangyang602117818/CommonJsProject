(function (jQuery) {
    jQuery.fn.extend({
        Loading: function (options) {
            //loadType:throbber|rotate
            var defaults = { loadType: "rotate" }
            options = options || {};
            if (options.loadType) defaults.loadType = options.loadType;
            var partentObject = $(this);
            var background = partentObject.find(".loading-background");
            if (background.length > 0) {
                background.remove();
                return;
            }
            partentObject.defaults = defaults;
            partentObject.bgLocation = {  //使用一个内部对象保存状态
                bgWidth: partentObject.width(),
                bgHeight: partentObject.height(),
                bgLeft: partentObject.offset().left + 1,
                bgTop: partentObject.offset().top + 1
            }
            background = getLoading(partentObject);
            partentObject.append(background);
            var conLeft = (partentObject.bgLocation.bgWidth - partentObject.loaderCon.width()) / 2;
            var conTop = (partentObject.bgLocation.bgHeight - partentObject.loaderCon.height()) / 2;
            partentObject.loaderCon.css({ left: conLeft, top: conTop });
        }
    });

    function getLoading(partentObject) {
        var background = getBackground(partentObject);
        return background;
    }
    function getBackground(partentObject) {
        var bg = "<div class=\"loading-background\"></div>";
        var background = $(bg).css(
        {
            left: partentObject.bgLocation.bgLeft,
            top: partentObject.bgLocation.bgTop,
            width: partentObject.bgLocation.bgWidth,
            height: partentObject.bgLocation.bgHeight
        });
        partentObject.loaderCon = getLoaderCon(partentObject);
        return background.append(partentObject.loaderCon);
    }
    function getLoaderCon(partentObject) {
        var loaderCon = $("<div class=\"loading\"> </div>");
        var loadingIcons;
        switch (partentObject.defaults.loadType) {
            case "throbber":
                loadingIcons = getThrobberIcons();
                break;;
            case "rotate":
                loadingIcons = getRotateIcons();
                break;
            default:
                loadingIcons = getThrobberIcons();
        }
        return loaderCon.append(loadingIcons);
    }
    //方块效果
    function getThrobberIcons() {
        var icons = $("<div class=\"throbber-loader-con\"><div class=\"throbber-loader1\"></div><div class=\"throbber-loader2\"></div><div class=\"throbber-loader3\"></div><div class=\"throbber-loader4\"></div><div class=\"throbber-loader5\"></div></div>");
        return icons;
    }
    //转动效果
    function getRotateIcons() {
        var icons = $("<div class=\"rotate-loader-con\"><div class=\"rotate-loader1\"></div><div class=\"rotate-loader2\"></div><div class=\"rotate-loader3\"></div><div class=\"rotate-loader4\"></div><div class=\"rotate-loader5\"></div><div class=\"rotate-loader6\"></div><div class=\"rotate-loader7\"></div><div class=\"rotate-loader8\"></div></div>");
        return icons;
    }
})(jQuery);