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
    //闪烁功能(每隔200ms给对象添加shake样式|删除shake样式),shake样式得用户自己定义,times:闪烁的次数
    shake: function (times) {
        var times = (times || 2) * 2,  //默认2次
            that = this;
        var interval = setInterval(function () {
            that.toggleClass("shake");
            times--;
            if (times === 0) clearInterval(interval);
        }, 200);
    }
});


