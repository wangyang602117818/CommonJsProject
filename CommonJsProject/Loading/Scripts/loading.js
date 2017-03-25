(function (jQuery) {
    jQuery.fn.extend({
        loading: function (options) {
            //loadType:throbber|rotate
            var defaults = { loadType: "rotate" }
            options = options || {};
            if (options.loadType) defaults.loadType = options.loadType;
            if (this.attr("loading") == "1") {
                this.attr("loading", "0");
                this.next().remove();
                return;
            }
            this.defaults = defaults;
            var rect = getBoundingClientRect(this);
            this.bgLocation = {  //使用一个内部对象保存状态
                bgWidth: rect.width,
                bgHeight: rect.height,
                bgLeft: rect.left,
                bgTop: rect.top
            }
            var background = getLoading(this);
            this.after(background).attr("loading", "1");
            var conLeft = (this.bgLocation.bgWidth - this.loaderCon.width()) / 2;
            var conTop = (this.bgLocation.bgHeight - this.loaderCon.height()) / 2;
            this.loaderCon.css({ left: conLeft, top: conTop });
        }
    });
    function getBoundingClientRect(element) {
        var scrollTop = $(document).scrollTop();
        var rect = element[0].getBoundingClientRect();
        var offset = arguments.callee.offset;
        return {
            left: rect.left,
            right: rect.right,
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            width: rect.width,
            height: rect.height
        };
    }
    function getLoading(partentObject) {
        var background = getBackground(partentObject);
        return background;
    }
    function getBackground(partentObject) {
        var bg = "<div class=\"loading-background\"></div>";
        var background = $(bg).css(
            {
                left: partentObject.bgLocation.bgLeft + 1,
                top: partentObject.bgLocation.bgTop + 1,
                width: partentObject.bgLocation.bgWidth - 2,
                height: partentObject.bgLocation.bgHeight - 2
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