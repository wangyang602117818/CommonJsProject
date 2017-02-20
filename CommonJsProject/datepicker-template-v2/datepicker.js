(function (win, $) {
    //默认配置
    var defaults = {
        showFormat: "dd Month yyyy",       //界面展示的格式 yyyy-MM-dd|yyyy/MM/dd|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
        start: "2000-01-01 00:00:00",      //start: new Date(),
        end: "2049-12-31 00:00:00",        //end: new Date().addYear(1)
        useFormat: "yyyy-MM-dd",           //与程序交互的时间格式
        lang: "en-us",                    //界面语言 en-us|zh-cn
    };
    //全局参数
    var commonlang = {
        "zh-cn": {
            week: ["日", "一", "二", "三", "四", "五", "六"],
            month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            title: ["年", "上一年", "下一年", "月", "上一月", "下一月"]
        },
        "en-us": {
            week: ["Sa", "Mo", "Tu", "We", "Th", "Fr", "Su"],
            month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            title: ["", "Last Year", "Next Year", "", "Last Month", "Next Month"]
        }
    },
    date = new Date(),
    curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()],  //文本框中的日期
    text_time_arr,  //保存选中日期
    start_time_arr,
    end_time_arr,
    dur = 300,   //动画速度
    start_disp_year,  //year层的起始年
    has_time = false,     //,
    timeval_regex = /\d{1,2}:(\d{1,2})?(:\d{1,2})?/,  //验证文本框的日期值,是否有时间
    time_regex = /[Hh]{1,2}:([Mm]{1,2})?(:[Ss]{1,2})?/,   //作验证日期格式是否有时间
    date_val_regex = /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/; //提取文本框的日期,针对中国时间

    //全局对象
    var calendar,       //主日期框对象
        calendar_time,  //时间对象
        main_data_containter,  //主数据容器对象
        con_year,
        con_month,
        con_hour,
        con_minute,
        con_second;
    $(function () {
        $(".datepicker").each(function () { init($(this)); });
    });
    //初始化用户配置
    function init(that) {
        defaults.showFormat = that.attr("date-show-format") || defaults.showFormat;
        defaults.start = that.attr("date-start") || defaults.start;
        defaults.end = that.attr("date-end") || defaults.end;
        defaults.lang = that.attr("date-lang") || defaults.lang;
        if (time_regex.test(defaults.showFormat)) {
            has_time = true;
            defaults.useFormat = addTimeFormat(defaults.useFormat);    //showFormat使用了时间，则为useFormat添加时间
        }
        var dateString = that.attr("date-val");
        if (dateString && timeval_regex.test(dateString) && !that.attr("date-show-format")) {
            has_time = true;
            defaults.useFormat = addTimeFormat(defaults.useFormat);
            defaults.showFormat = addTimeFormat(defaults.showFormat);
        }
        setDate(that, dateString);
        //click

    }
    function setDate(that, dateString) {
        if (!dateString || dateString === '') return;
        date = inputDateConvert(dateString);
        curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        text_time_arr = curr_time_arr.slice(0);
        var showdate = dateFormat(curr_time_arr, defaults.showFormat);
        that.val(showdate);
    }
    function dateFormat(time_arr, format) {                //格式化日期 time_arr=数组,往界面输出 格式化后的日期
        var realMonth = time_arr[1];
        format = format.replace(/([Mm]onth)/, commonlang[defaults.lang].month[realMonth]);
        format = format.replace(/([\W]|^)([yY]+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + yearFormat(time_arr[0], g3.length) + g4;
        });
        format = format.replace(/([\W]|^)(M+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + monthFormat(realMonth + 1, g3.length) + g4;
        });
        format = format.replace(/([\W]|^)([dD]+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + monthFormat(time_arr[2], g3.length) + g4;
        });
        format = format.replace(/([\W]|^)(h+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + monthFormat(time_arr[3], g3.length) + g4;
        });
        format = format.replace(/([\W]|^)(m+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + monthFormat(time_arr[4], g3.length) + g4;
        });
        format = format.replace(/([\W]|^)(s+)(\W|$)/, function (g1, g2, g3, g4) {
            return g2 + monthFormat(time_arr[5], g3.length) + g4;
        });
        return format;
    }
    //将文本框中的日期字符串转成日期对象,供默认选中用
    function inputDateConvert(str) {
        var result = date_val_regex.exec(str);
        var year = result[1] || new Date().getFullYear(),
            month = result[2] > 0 ? (result[2] - 1) : new Date().getMonth(),
            day = result[3] > 0 ? result[3] : new Date().getDate(),
            hour = result[4] >= 0 ? result[4] : 0,
            minute = result[5] >= 0 ? result[5] : 0,
            second = result[6] >= 0 ? result[6] : 0;
        //转换成日期对象,这样可以消去一些不必要的格式错误
        return new Date(year, month, day, hour, minute, second);
    }
    //格式化年，len=位数
    function yearFormat(year, len) {
        if (year.toString().length == len) return year.toString();
        if (year.toString().length == 4 && len == 2) return year.toString().substr(2, 2);
        if (year.toString().length == 2 && len == 4) return new Date().getFullYear().toString().substr(0, 2) + year;
    }
    //格式化月，天，小时，
    function monthFormat(month, len) {
        if (len == 1) return month;
        if (len == 2) return month.toString().length == 1 ? "0" + month : month;
        if (len == 0) return "";
    }
    //给日期型的添加时间项
    function addTimeFormat(format) {
        if (!time_regex.test(format)) return format + " hh:mm:ss";
        return format;
    }
})(window, jQuery);