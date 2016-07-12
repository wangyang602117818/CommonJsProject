(function (window, $) {
    window.onload = function () {
        $(".datepicker").each(function () {
            var datepicker = new DatePicker();
            datepicker.init(this);
        });
    };

    function DatePicker() {
        this.defaults = {
            //界面展示的格式 yyyy-MM-dd|yyyy/MM/dd|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
            format: "dd Month yyyy",
            start: "2000-01-01 00:00:00",  //start: new Date(),
            end: "2100-12-31 00:00:00",        //end: new Date().addYear(1)
            //与程序交互的时间格式
            useFormat: "yyyy-MM-dd",
            //验证文本框的日期值,是否有时间
            valueTime: /\d{1,2}:(\d{1,2})?(:\d{1,2})?/,
            //作验证日期格式是否有时间
            formatTime: /[Hh]{1,2}:([m]{1,2})?(:[Ss]{1,2})?/,
            //提取文本框的日期,针对中国时间
            dateValue: /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/,
            defaultLang: "en",
            lang: {
                zh: {
                    week: ["日", "一", "二", "三", "四", "五", "六"],
                    month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
                    title: ["年", "上一年", "下一年", "月", "上一月", "下一月"]
                },
                en: {
                    week: ["Sa", "Mo", "Tu", "We", "Th", "Fr", "Su"],
                    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    title: ["", "Last Year", "Next Year", "", "Last Month", "Next Month"]
                }
            }
        };
        this.parameters = {
            //面板启动时默认显示的时间对象
            date: new Date(),
            //面板启动时默认显示的时间数组
            defaultTimeArray: null,
            //文本框中的日期
            currentTimeArray: null,          //保存选中日期
            timeBoundStart: null,        //起始时间
            timeBoundEnd: null,          //结束时间
            dur: 300,                   //动画速度
            startYear: null,           //year层的起始年
            hasTime: false,            //
            hasUserFormat: false,     //标记用户设置了格式没有(通过 javascript|html 标签)
            $element: null
        };
        this.dateContainer = {
            datepicker: null,
            titleContainter: null,
            timeContainter: null,
            mainDataContainter: null,
            yearLayer: null,
            monthLayer: null,
            hourLayer: null,
            minuteLayer: null,
            secondLayer: null
        };
    };
    DatePicker.prototype = {
        init: function (element) {
            with (this) {
                parameters.defaultTimeArray = [
                    parameters.date.getFullYear(),
                    parameters.date.getMonth(),
                    parameters.date.getDate(),
                    parameters.date.getHours(),
                    parameters.date.getMinutes(),
                    parameters.date.getSeconds()];
                parameters.$element = $(element);
                var attrFormat = parameters.$element.attr("format");  //要在界面上展示的时间格式
                var attrValue = parameters.$element.attr("dateval");  //文本框的时间初始值,程序要使用的
                if (attrFormat) {
                    defaults.format = attrFormat;
                    parameters.hasUserFormat = true;  //用户已经设置了格式
                }
                if (defaults.formatTime.test(defaults.format)) {  //如果defaults.format格式有时间项
                    defaults.useFormat = addTimeFormat(defaults.useFormat); //给程序使用的也设置时间
                    parameters.hasTime = true;
                }
                setDate(attrValue);
            }
        },
        setDate: function (str) {
            if (!str) return;
            with (this) {
                parameters.date = inputDateConvert(str);
                parameters.defaultTimeArray = parameters.currentTimeArray =
                    [parameters.date.getFullYear(),
                        parameters.date.getMonth(),
                        parameters.date.getDate(),
                        parameters.date.getHours(),
                        parameters.date.getMinutes(),
                        parameters.date.getSeconds()
                    ];
                //用户没有设置format,但是在时间值中有time,等于间接设置了time
                if (!parameters.hasUserFormat && defaults.valueTime.test(str)) {
                    parameters.hasTime = true;
                    defaults.useFormat = addTimeFormat(defaults.useFormat);
                    defaults.format = addTimeFormat(defaults.format);
                }
                var showdate = dateFormat(parameters.currentTimeArray, defaults.format);
                var usedate = dateFormat(parameters.currentTimeArray, defaults.useFormat);
                parameters.$element.val(showdate);
                parameters.$element.attr("dateval", usedate);
            }

        },
        inputDateConvert: function (str) {
            var result = this.defaults.dateValue.exec(str);
            var year = result[1] || new Date().getFullYear(),
                month = result[2] > 0 ? (result[2] - 1) : new Date().getMonth(),
                day = result[3] > 0 ? result[3] : new Date().getDate(),
                hour = result[4] >= 0 ? result[4] : 0,
                minute = result[5] >= 0 ? result[5] : 0,
                second = result[6] >= 0 ? result[6] : 0;
            //转换成日期对象,这样可以消去一些不必要的格式错误
            return new Date(year, month, day, hour, minute, second);
        },
        //给日期型的添加时间项
        addTimeFormat: function (format) {
            if (!this.defaults.formatTime.test(format)) return format + " hh:mm:ss";
            return format;
        },
        //格式化日期 time_arr=数组,往界面输出 格式化后的日期
        dateFormat: function (time_arr, format) {
            var realMonth = time_arr[1];
            var datepicker = this;
            format = format.replace(/([Mm]onth)/, this.defaults.lang[this.defaults.defaultLang].month[realMonth]);
            format = format.replace(/([\W]|^)([yY]+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.yearFormat(time_arr[0], g3.length) + g4;
            });
            format = format.replace(/([\W]|^)(M+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.monthFormat(realMonth + 1, g3.length) + g4;
            });
            format = format.replace(/([\W]|^)([dD]+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.monthFormat(time_arr[2], g3.length) + g4;
            });
            format = format.replace(/([\W]|^)(h+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.monthFormat(time_arr[3], g3.length) + g4;
            });
            format = format.replace(/([\W]|^)(m+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.monthFormat(time_arr[4], g3.length) + g4;
            });
            format = format.replace(/([\W]|^)(s+)(\W|$)/, function (g1, g2, g3, g4) {
                return g2 + datepicker.monthFormat(time_arr[5], g3.length) + g4;
            });
            return format;
        },
        //格式化年，len=位数
        yearFormat: function (year, len) {
            if (year.toString().length == len) return year.toString();
            if (year.toString().length == 4 && len == 2) return year.toString().substr(2, 2);
            if (year.toString().length == 2 && len == 4) return new Date().getFullYear().toString().substr(0, 2) + year;
        },
        //格式化月，天，小时，
        monthFormat: function (month, len) {
            if (len == 1) return month;
            if (len == 2) return month.toString().length == 1 ? "0" + month : month;
            if (len == 0) return "";
        }
    }

})(window, jQuery);