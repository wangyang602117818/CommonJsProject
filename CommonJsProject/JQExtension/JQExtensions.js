/// <reference path="jquery-1.7.1.js" />

//全局函数
jQuery.extend({
    getRandom: function (lowerValue, upperValue) {
        var choices = upperValue - lowerValue + 1;
        return Math.floor(Math.random() * choices + lowerValue);
    }
});

//对象函数
jQuery.fn.extend({
    //闪烁功能(每隔200ms给对象添加shake样式|删除shake样式),shake样式得用户自己定义
    shake: function (times) {
        var times = times || 2, i = 0, that = this;
        var interval = setInterval(function() {
            i % 2 === 0 ? that.addClass("shake") : that.removeClass("shake");
            if (i++ >= times * 2) clearInterval(interval);
        }, 200);
    }
})
