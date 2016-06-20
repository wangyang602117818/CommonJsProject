
/***************************调用说明:***********************************
/*
开发者:wangyang
调用方法请参考文档
**********************************************************************/
(function (window, document, $) {
    $.fn.Calendar = function (options) {
        var calendar = new Calendar(this, options);
        return calendar;
    }
    function Calendar(ele, options) {
        this.options = options||{};
        this.defaults = {
            format: "dd Month yyyy", //界面展示的格式 yyyy-MM-dd|yyyy/MM/dd|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
            start: "2000-01-01 00:00:00", //start: new Date(),
            end: "2049-12-31 00:00:00", //end: new Date().addYear(1)
            useFormat: "yyyy-MM-dd" //与程序交互的时间格式
        };
        this.lang = "en-us";  //界面语言 en-us|zh-cn
        this.commonlang = {
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
        };
        this.date = new Date();
        this.curr_time_arr = [this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), this.date.getSeconds()];  //文本框中的日期
        this.text_time_arr = null;  //保存选中日期
        this.start_time_arr = null;
        this.end_time_arr = null;
        this.dur = 300;  //动画速度
        this.start_disp_year = null;  //year层的起始年
        this.has_time = false;     //
        this.user_set_format = false;
        this.ele = ele;
        this.timeval_regex = /\d{1,2}:(\d{1,2})?(:\d{1,2})?/;  //验证文本框的日期值,是否有时间
        this.time_regex = /[Hh]{1,2}:([Mm]{1,2})?(:[Ss]{1,2})?/;   //作验证日期格式是否有时间
        this.date_val_regex = /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/; //提取文本框的日期,针对中国时间
        //全局对象
        this.calendar = null;  //主日期框对象
        this.calendar_time = null;  //时间对象
        this.main_data_containter = null;  //主数据容器对象
        this.con_year = null;
        this.con_month = null;
        this.con_hour = null;
        this.con_minute = null;
        this.con_second = null;
        this.init();
    }

    Calendar.prototype = {
        constructor: Calendar,
        init: function () {
            var attributeFormat = this.ele.attr("format");
            if (attributeFormat) this.defaults.format = attributeFormat;  //用户在标签上设置的值初始化一下
            this.defaults.format = this.options.format || this.defaults.format;  //以用户设置的格式为准
            if (this.options.format || attributeFormat) {
                this.user_set_format = true;
            }
            if (this.time_regex.test(this.defaults.format)) {
                this.has_time = true;
                this.defaults.useFormat = this.addTimeFormat(this.defaults.useFormat); //发生一次时间格式同步
            }
            this.defaults.start = this.options.start || this.defaults.start;
            this.defaults.end = this.options.end || this.defaults.end;
            this.defaults.dateString = this.ele.attr('dateval');  //在标签中设置的值
            this.ele.click(jQuery.proxy(this.renderCalendar, this));
            this.ele.keypress(function (event) { return false; });  //禁用文本框输入
            $(document).bind("click", function () { $("#calendar").hide() });
            this.setDate(this.defaults.dateString);  //显示用户设置的默认值
        },

        setDate: function (dateString) {
            if (!dateString) return;
            this.date = this.inputDateConvert(dateString);
            this.curr_time_arr = [this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), this.date.getSeconds()];
            this.text_time_arr = this.curr_time_arr.slice(0);

            if (!this.user_set_format && this.timeval_regex.test(dateString)) {
                this.has_time = true;
                this.defaults.useFormat = this.addTimeFormat(this.defaults.useFormat);
                this.defaults.format = this.addTimeFormat(this.defaults.format);
            }
            var showdate = this.dateFormat(this.curr_time_arr, this.defaults.format);
            var usedate = this.dateFormat(this.curr_time_arr, this.defaults.useFormat);

            this.ele.val(showdate);
            this.ele.attr("dateval", usedate);
        },
        getDate: function () {
            if (!this.text_time_arr) return null;
            if (this.has_time) {
                return new Date(this.text_time_arr[0], this.text_time_arr[1], this.text_time_arr[2], this.text_time_arr[3], this.text_time_arr[4], this.text_time_arr[5]);
            } else {
                return new Date(this.text_time_arr[0], this.text_time_arr[1], this.text_time_arr[2], 0, 0, 0);
            }
        },
        //获取日期字符串
        getDateString: function () {
            if (!this.text_time_arr) return "";
            return this.dateFormat(this.text_time_arr, this.defaults.useFormat);
        },
        //给日期型的添加时间项
        addTimeFormat: function (format) {
            if (!this.time_regex.test(format)) return format + " hh:mm:ss";
            return format;
        },
        ///获取ISO时间形式,已转化成utc时间
        getISODateString: function () {
            if (!this.text_time_arr) return "";
            var date = new Date(this.text_time_arr[0], this.text_time_arr[1], this.text_time_arr[2], this.text_time_arr[3], this.text_time_arr[4], this.text_time_arr[5]);
            var isoDate = date.getUTCFullYear() + "-" + this.monthFormat(date.getUTCMonth() + 1, 2) + "-" + this.monthFormat(date.getUTCDate(), 2);
            if (this.has_time) {
                isoDate += "T" + date.getUTCHours() + ":" + date.getMinutes() + ":" + date.getUTCSeconds() + "Z";
            } else {
                isoDate += "T00:00:00Z";
            }
            return isoDate;
        },
        //显示日期层
        renderCalendar: function () {
            $("#calendar").remove();
            if (this.defaults.start instanceof Date) {
                this.start_time_arr = [this.defaults.start.getFullYear(), this.defaults.start.getMonth(), this.defaults.start.getDate(), this.defaults.start.getHours(), this.defaults.start.getMinutes(), this.defaults.start.getSeconds()];
            } else {
                this.start_time_arr = this.startEndDateConvert(this.defaults.start);
            }
            if (this.defaults.end instanceof Date) {
                this.end_time_arr = [this.defaults.end.getFullYear(), this.defaults.end.getMonth(), this.defaults.end.getDate(), this.defaults.end.getHours(), this.defaults.end.getMinutes(), this.defaults.end.getSeconds()];
            } else {
                this.end_time_arr = this.startEndDateConvert(this.defaults.end);
            }
            if (this.ele.attr("dateval") && this.ele.attr("dateval").trim() != "") {
                this.date = this.inputDateConvert(this.ele.attr("dateval"));
                this.curr_time_arr = [this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), this.date.getSeconds()];
                this.text_time_arr = this.curr_time_arr.slice(0);
            }
            this.beginCalendar();
            $(document).bind("click", function () { $("#calendar").hide() });
            return false;
        },
        //创建日期主面板
        beginCalendar: function () {
            var top = this.ele.offset().top + this.ele.outerHeight() + "px", //日历框位置
                left = this.ele.offset().left + "px";
            var calendar_div = "<div id=\"calendar\" class=\"calendar\">";
            calendar_div += "<div id=\"calendar_title_containter\" class=\"calendar_title_containter\">";
            calendar_div += "<div class=\"calendar_last_year\"><span class=\"last_year calendar_img\" title=\"" + this.commonlang[this.lang].title[1] + "\"></span></div>" +
                "<div class=\"calendar_last_month\"><span class=\"last_month calendar_img\" title=\"" + this.commonlang[this.lang].title[4] + "\"></span></div>" +
                "<div class=\"calendar_title_date\">" + this.createCalendarTitle() + "</div>" +
                "<div class=\"calendar_next_month\"><span class=\"next_month calendar_img\" title=\"" + this.commonlang[this.lang].title[5] + "\"></span></div>" +
                "<div class=\"calendar_next_year\"><span class=\"next_year calendar_img\" title=\"" + this.commonlang[this.lang].title[2] + "\"></span></div>" +
                "</div>"; //title
            //容器部分
            calendar_div += "<div id=\"calendar_maindata_containter\" class=\"calendar_maindata_containter\">";
            calendar_div += "<div id=\"calendar_week_container\" class=\"calendar_week_container\"><div id=\"calendar_week\" class=\"calendar_week\">";
            for (var item in this.commonlang[this.lang].week) {
                calendar_div += "<div>" + this.commonlang[this.lang].week[item] + "</div>";
            }
            calendar_div += "</div></div>";
            calendar_div += this.createDataDiv(); //天数
            calendar_div += "</div></div>";
            this.calendar = $(calendar_div).bind("click", function () { return false }).css({ top: top, left: left });
            this.main_data_containter = this.calendar.find(".calendar_maindata_containter");
            this.main_data_containter.bind("click", jQuery.proxy(this.daySelected, this));
            if (this.needAddHeight()) {
                this.calendar.addClass("add_cal_len1");
                this.main_data_containter.addClass("add_main_date_len1");
            }
            $("body").append(this.calendar);
            this.initDate();
            if (this.has_time) this.renderCalendarTime().appendTo(this.calendar); //时间
        },
        createCalendarTitle: function () {
            var title = "";
            if (this.lang === "zh-cn") { //中文
                title = "<span class=\"title_year\">" + this.curr_time_arr[0] + this.commonlang[this.lang].title[0] + "</span>" +
                    " <span class=\"title_month\">" + this.monthFormat((this.curr_time_arr[1] + 1), 2) + this.commonlang[this.lang].title[3] + "</span>";
            } else { //英文
                title = " <span class=\"title_month\">" + this.commonlang[this.lang].month[this.curr_time_arr[1]] + "</span> " +
                    " <span class=\"title_year\">" + this.curr_time_arr[0] + "</span> ";
            }
            return title;
        },
        //日期面板的点击事件
        initDate: function () {
            this.con_year = this.createYearEle(this.curr_time_arr[0]);
            this.con_month = this.createMonthEle();
            this.calendar.append(this.con_year, this.con_month);
            this.calendar.find(".title_year").bind("click", jQuery.proxy(this.showYearDiv, this));
            this.calendar.find(".title_month").bind("click", jQuery.proxy(this.showMonthDiv, this));
            this.calendar.find(".last_year").bind("click", jQuery.proxy(this.lastYear, this));
            this.calendar.find(".next_year").bind("click", jQuery.proxy(this.nextYear, this));
            this.calendar.find(".last_month").bind("click", jQuery.proxy(this.lastMonth, this));
            this.calendar.find(".next_month").bind("click", jQuery.proxy(this.nextMonth, this));
        },
        //初始化时间面板
        renderCalendarTime: function () {
            var time_div = "<div id=\"calendar_time\" class=\"calendar_time\">";
            time_div += "<span id=\"hover_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + this.monthFormat(this.curr_time_arr[3], 2) + "\" maxlength=\"2\" id=\"hour\"/></span>:<span id=\"minute_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + this.monthFormat(this.curr_time_arr[4], 2) + "\" maxlength=\"2\" id=\"minute\"/></span>:<span id=\"second_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + this.monthFormat(this.curr_time_arr[5], 2) + "\" maxlength=\"2\" id=\"second\"/></span>";
            time_div += "</div>";
            this.calendar_time = $(time_div);
            this.initTime();
            this.needAddHeight() ? this.calendar.addClass("add_cal_len3") : this.calendar.addClass("add_cal_len2");
            return this.calendar_time;
        },
        //时间面板的点击事件
        initTime: function () {
            this.con_hour = this.createHoverEle();
            this.con_minute = this.createMinuteEle();
            this.con_second = this.createSecondEle();
            this.calendar.append(this.con_hour, this.con_minute, this.con_second);
            this.con_hour.bind("click", jQuery.proxy(this.hourSelected, this));
            this.con_minute.bind("click", jQuery.proxy(this.minuteSelected, this));
            this.con_second.bind("click", jQuery.proxy(this.secondSelected, this));
            this.calendar_time.find("#hover_txt").bind("click", jQuery.proxy(this.showHoverDiv, this)).bind("input propertychange", jQuery.proxy(function () {
                this.curr_time_arr[3] = $(this).find("input").val();
                this.writeDate();
            }, this));
            this.calendar_time.find("#minute_txt").bind("click", jQuery.proxy(this.showMinuteDiv, this)).bind("input propertychange", jQuery.proxy(function () {
                this.curr_time_arr[4] = $(this).find("input").val();
                this.writeDate();
            }, this));
            this.calendar_time.find("#second_txt").bind("click", jQuery.proxy(this.showSecondDiv, this)).bind("input propertychange", jQuery.proxy(function () {
                this.curr_time_arr[5] = $(this).find("input").val();
                this.writeDate();
            }, this));;
        },
        //将文本框中的日期字符串转成日期对象,供默认选中用
        inputDateConvert: function (str) {
            var result = this.date_val_regex.exec(str);
            var year = result[1] || new Date().getFullYear(),
                month = result[2] > 0 ? (result[2] - 1) : new Date().getMonth(),
                day = result[3] > 0 ? result[3] : new Date().getDate(),
                hour = result[4] >= 0 ? result[4] : 0,
                minute = result[5] >= 0 ? result[5] : 0,
                second = result[6] >= 0 ? result[6] : 0;
            //转换成日期对象,这样可以消去一些不必要的格式错误
            return new Date(year, month, day, hour, minute, second);
        },
        //将给出的时间范围转成数组,以便后续的比较
        startEndDateConvert: function (str) {
            var result = this.date_val_regex.exec(str);
            var year = result[1],
                month = (result[2] - 1) < 0 ? 0 : (result[2] - 1),
                day = result[3] > 0 ? result[3] : 1,
                hour = result[4] >= 0 ? result[4] : 0,
                minute = result[5] >= 0 ? result[5] : 0,
                second = result[6] >= 0 ? result[6] : 0;
            return [year, month, day, hour, minute, second];
        },
        //影藏时间面板
        hiddenTimePanel: function () {
            if (this.con_hour) this.con_hour.css("bottom", "-176px").attr("flag", "0");
            if (this.con_minute) this.con_minute.css("bottom", "-176px").attr("flag", "0");
            if (this.con_second) this.con_second.css("bottom", "-176px").attr("flag", "0");
        },
        //隐藏年月面板
        hiddenDatePanel: function () {
            this.con_year.css({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
            this.con_month.css({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
        },
        getMaxZIndex: function () {
            var zindex = 0;
            if (parseInt(this.con_month.css("z-index"), 10) > zindex) zindex = parseInt(this.con_month.css("z-index"), 10);
            if (parseInt(this.con_year.css("z-index"), 10) > zindex) zindex = parseInt(this.con_year.css("z-index"), 10);
            if (this.con_hour && parseInt(this.con_hour.css("z-index"), 10) > zindex) zindex = parseInt(this.con_hour.css("z-index"), 10);
            if (this.con_minute && parseInt(this.con_minute.css("z-index"), 10) > zindex) zindex = parseInt(this.con_minute.css("z-index"), 10);
            if (this.con_second && parseInt(this.con_second.css("z-index"), 10) > zindex) zindex = parseInt(this.con_second.css("z-index"), 10);
            return zindex;
        },
        //显示年份div
        showYearDiv: function () {
            this.con_year.stop();
            this.con_month.stop();
            //重设年份容器的年份内容
            this.con_year.html(this.createYearEle(this.curr_time_arr[0]).unbind("click", this.yearSelected).html());
            //让year层在month层上面
            this.con_year.css({ "z-index": this.getMaxZIndex() + 1 });
            if (this.con_year.attr("flag") == "0") { //flag=0;表示年div未显示
                this.calendar.find(".last_month,.next_month").addClass("disabled");
                this.calendar.find(".last_year,.next_year").removeClass("disabled");
                this.con_year.animate({ top: "26px" }, this.dur, jQuery.proxy(function () {
                    this.con_month.css({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                    this.hiddenTimePanel();
                    this.con_year.attr("flag", "1");
                }, this));
            } else {
                this.calendar.find(".last_month,.next_month").removeClass("disabled");
                this.con_year.animate({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }, this.dur);
                this.con_year.attr("flag", "0");
            }
        },
        //显示月份div
        showMonthDiv: function () {
            this.con_year.stop();
            this.con_month.stop();
            this.con_month.html(this.createMonthEle().unbind("click", this.monthSelected).html()); //重设月份的内容
            this.con_month.css({ "z-index": this.getMaxZIndex() + 1 }); //让moth层在year层上面
            if (this.con_month.attr("flag") == "0") { //flag=0;表示月div未显示
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                this.con_month.animate({ top: "26px" }, this.dur, jQuery.proxy(function () {
                    this.con_year.css({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                    this.hiddenTimePanel();
                    this.con_month.attr("flag", "1");
                }, this));
            } else {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                this.con_month.animate({ top: "-" + parseInt(this.main_data_containter.css("height"), 10) + "px" }, this.dur);
                this.con_month.attr("flag", "0");
            }
        },

        //显示小时div
        showHoverDiv: function () {
            this.con_hour.css("z-index", this.getMaxZIndex() + 1);
            if (this.con_hour.attr("flag") == "0") {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                this.con_hour.animate({ bottom: "21px" }, this.dur, jQuery.proxy(function (event) {
                    this.con_hour.attr("flag", "1");
                    this.con_minute.css("bottom", "-176px").attr("flag", "0");
                    this.con_second.css("bottom", "-176px").attr("flag", "0");
                    this.hiddenDatePanel();
                }, this));
            } else {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                this.con_hour.animate({ bottom: "-176px" }, this.dur);
                this.con_hour.attr("flag", "0");
            }
        },
        //显示分钟div
        showMinuteDiv: function () {
            this.con_minute.css("z-index", this.getMaxZIndex() + 1);
            if (this.con_minute.attr("flag") == "0") {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                this.con_minute.animate({ bottom: "21px" }, this.dur, jQuery.proxy(function () {
                    this.con_minute.attr("flag", "1");
                    this.con_hour.css("bottom", "-176px").attr("flag", "0");
                    this.con_second.css("bottom", "-176px").attr("flag", "0");
                    this.hiddenDatePanel();
                }, this));
            } else {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                this.con_minute.animate({ bottom: "-176px" }, this.dur);
                this.con_minute.attr("flag", "0");
            }
        },
        showSecondDiv: function () {
            this.con_second.css("z-index", this.getMaxZIndex() + 1);
            if (this.con_second.attr("flag") == "0") {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                this.con_second.animate({ bottom: "21px" }, this.dur, jQuery.proxy(function () {
                    this.con_second.attr("flag", "1");
                    this.con_hour.css("bottom", "-176px").attr("flag", "0");
                    this.con_minute.css("bottom", "-176px").attr("flag", "0");
                    this.hiddenDatePanel();
                }, this));
            } else {
                this.calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                this.con_second.animate({ bottom: "-176px" }, this.dur);
                this.con_second.attr("flag", "0");
            }
        },
        //上一年
        lastYear: function () {
            if ($(this).hasClass("disabled")) return;
            if (this.isYearDisplay()) { //year层目前在展现
                this.nextYearDiv("right");
                return false;
            }
            --this.curr_time_arr[0];
            if (this.isMonthDisplay()) { //month目前在展现
                this.nextMonthDisplay("right");
            }
            this.calendar.find(".title_year").text(this.curr_time_arr[0] + this.commonlang[this.lang].title[0]);
            this.changeMainData("right"); //动画改变日期面板
        },
        //下一年
        nextYear: function () {
            if ($(this).hasClass("disabled")) return;
            if (this.isYearDisplay()) { //year层目前在展现
                this.nextYearDiv("left");
                return false;
            }
            ++this.curr_time_arr[0];
            if (this.isMonthDisplay()) { //month目前在展现
                this.nextMonthDisplay("left");
            }
            this.calendar.find(".title_year").text(this.curr_time_arr[0] + this.commonlang[this.lang].title[0]);
            this.changeMainData("left"); //动画改变日期面板
        },
        //上一月
        lastMonth: function () {
            if ($(this).hasClass("disabled")) return;
            --this.curr_time_arr[1];
            if (this.curr_time_arr[1] < 0) {
                this.curr_time_arr[0]--;
                this.curr_time_arr[1] = 11;
                this.calendar.find(".title_year").text(this.curr_time_arr[0] + this.commonlang[this.lang].title[0]);
            }
            //if (isMonthDisplay()) nextMonthDisplay("right");
            this.calendar.find(".title_month").text(this.commonlang[this.lang].month[this.curr_time_arr[1]].substring(0, 6) + this.commonlang[this.lang].title[3]);
            this.changeMainData("right"); //动画改变日期面板
        },
        //下一月
        nextMonth: function () {
            if ($(this).hasClass("disabled")) return;
            ++this.curr_time_arr[1];
            if (this.curr_time_arr[1] > 11) { //该跳到下一年了
                this.curr_time_arr[0]++;
                this.curr_time_arr[1] = 0;
                this.calendar.find(".title_year").text(this.curr_time_arr[0] + this.commonlang[this.lang].title[0]);
            }
            //if (isMonthDisplay()) nextMonthDisplay("left");
            this.calendar.find(".title_month").text(this.commonlang[this.lang].month[this.curr_time_arr[1]].substring(0, 6) + this.commonlang[this.lang].title[3]);
            this.changeMainData("left");
        },
        //改变主日期面板,direction=动画方向
        changeMainData: function (direction) {
            var calendar_width = this.calendar.css("width"); //主日期框宽度(数据面板的偏移量)
            var dataEle = $(this.createDataDiv()); //创建
            //在改变日期数据面板时,每个月天数不一样,有可能高度发生变化
            if (this.needAddHeight()) {
                this.calendar.addClass("add_cal_len1");
                if (this.has_time) { //有时间
                    this.calendar.addClass("add_cal_len3");
                }
                this.main_data_containter.addClass("add_main_date_len1");
                this.con_year.addClass("mainyear_height1");
                this.con_month.addClass("mainmonth_height1");
            } else {
                this.calendar.removeClass("add_cal_len1");
                if (this.has_time) {
                    this.calendar.removeClass("add_cal_len3");
                    this.calendar.addClass("add_cal_len2");
                }
                this.main_data_containter.removeClass("add_main_date_len1");
                this.con_year.removeClass("mainyear_height1");
                this.con_month.removeClass("mainmonth_height1");
            }
            if (direction == "left") {
                dataEle.css({ left: calendar_width }).attr("flag", "0"); //创建日期数据主面板element
                this.main_data_containter.append(dataEle); //吧日期主面板加入父容器,这时连同以前一个数据面板，一共有2个数据面板
                var containter = this.calendar.find(".calendar_data_containter"); //获取这2个数据面板
                //2个面板一同移动
                containter.filter("[flag=1]").animate({ left: "-" + calendar_width }, this.dur, function () {
                    $(this).remove();
                });
                containter.filter("[flag=0]").animate({ left: 0 }, this.dur).attr("flag", "1");
            }
            if (direction == "right") {
                dataEle.css({ left: "-" + calendar_width }).attr("flag", "0");
                this.main_data_containter.append(dataEle);
                var containter = $(".calendar_data_containter");
                containter.filter("[flag=1]").animate({ left: calendar_width }, this.dur, function () {
                    $(this).remove();
                });
                containter.filter("[flag=0]").animate({ left: 0 }, this.dur).attr("flag", "1");
            }
        },
        //格式化日期 time_arr=数组,往界面输出 格式化后的日期
        dateFormat: function (time_arr, format) {
            var realMonth = time_arr[1];
            format = format.replace(/([Mm]onth)/, this.commonlang[this.lang].month[realMonth]);
            format = format.replace(/([\W]|^)([yY]+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.yearFormat(time_arr[0], g3.length) + g4;
            }, this));
            format = format.replace(/([\W]|^)(M+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.monthFormat(realMonth + 1, g3.length) + g4;
            }, this));
            format = format.replace(/([\W]|^)([dD]+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.monthFormat(time_arr[2], g3.length) + g4;
            }, this));
            format = format.replace(/([\W]|^)(h+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.monthFormat(time_arr[3], g3.length) + g4;
            }, this));
            format = format.replace(/([\W]|^)(m+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.monthFormat(time_arr[4], g3.length) + g4;
            }, this));
            format = format.replace(/([\W]|^)(s+)(\W|$)/, jQuery.proxy(function (g1, g2, g3, g4) {
                return g2 + this.monthFormat(time_arr[5], g3.length) + g4;
            }, this));
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
        },
        //根据年月获取该月的天数,第一天周几
        getMonthDays: function (year, month) {
            var days = new Date(year, month + 1, 0).getDate(); //当前月的天数
            var first_day_week = new Date(year, month, 1).getDay(); //第一天周几
            return { days: days, first_day_week: first_day_week };
        },
        //是否需要增加日期框高度
        needAddHeight: function () {
            var days_week_obj = this.getMonthDays(this.curr_time_arr[0], this.curr_time_arr[1]); //对象包含当月的天数，第一天周几？
            if (days_week_obj.days == 30 && days_week_obj.first_day_week == 6) return true;
            if (days_week_obj.days == 31 && (days_week_obj.first_day_week == 5 || days_week_obj.first_day_week == 6)) return true;
            return false;
        },
        //创建日期主面板的天数据
        createDataDiv: function () {
            var days_week_obj = this.getMonthDays(this.curr_time_arr[0], this.curr_time_arr[1]); //对象包含当月的天数，第一天周几？
            var calendar_div = "<div class=\"calendar_data_containter\" flag=\"1\">";
            for (var i = 0; i < days_week_obj.first_day_week; i++) { //前面部分
                calendar_div += "<span></span>";
            }
            for (var i = 1; i <= days_week_obj.days; i++) { // 日期部分
                var selcss = "\"";
                if (this.isDateDay(i)) selcss += "day ";
                if (this.isWeekend(i)) selcss += "weekend ";
                if (this.isDateToday(i)) selcss += "today ";
                if (this.isDayDisabled(i)) selcss = "disabled ";
                selcss += "\"";
                calendar_div += "<div class=" + selcss + ">" + i + "</div>";
            }
            calendar_div += "</div>";
            return calendar_div;
        },
        //创建年容器div
        createYearEle: function (curr_year) {
            this.start_disp_year = Math.floor(curr_year / 16) * 16;
            var year_div = "<div class=\"calendar_mainyear_containter\" flag=\"0\">";
            for (var i = this.start_disp_year; i < this.start_disp_year + 16; i++) {
                var classtText = "";
                if (i == this.curr_time_arr[0]) classtText = "currItem";
                var disabled = false; //禁用标记
                if (i < this.start_time_arr[0] || i > this.end_time_arr[0]) disabled = true;
                if (disabled) classtText += " disabled";
                year_div += "<div class=\"" + classtText.trim() + "\">" + i + "</div>";
            }
            year_div += "</div>";
            var year_ele = $(year_div);
            if (this.needAddHeight()) year_ele.addClass("mainyear_height1");
            year_ele.bind("click", jQuery.proxy(this.yearSelected, this));
            return year_ele;
        },
        //创建月容器div
        createMonthEle: function () {
            var month_div = "<div class=\"calendar_mainmonth_containter\" flag=\"0\">";
            for (var i = 0; i < this.commonlang[this.lang].month.length; i++) {
                var classtText = "";
                if (i == this.curr_time_arr[1]) classtText = "currItem";
                var disabled = false;  //禁用标记
                var months = Number(this.curr_time_arr[0]) * 12 + i,
                    startmonths = Number(this.start_time_arr[0]) * 12 + Number(this.start_time_arr[1]),
                    endmonths = Number(this.end_time_arr[0]) * 12 + Number(this.end_time_arr[1]);
                if (months < startmonths || months > endmonths) disabled = true;
                if (disabled) classtText += " disabled";
                month_div += "<div class=\"" + classtText.trim() + "\">" + this.commonlang[this.lang].month[i] + "</div>";
            }
            month_div += "</div>";
            var month_ele = $(month_div);
            if (this.needAddHeight()) month_ele.addClass("mainmonth_height1");
            month_ele.bind("click", jQuery.proxy(this.monthSelected, this));
            return month_ele;
        },
        //创建小时容器div
        createHoverEle: function () {
            var time_div = "<div class=\"hover_containter\" id=\"hover_containter\" flag=\"0\">";
            for (var i = 0; i <= 23; i++) {
                var classtText = "";
                if (i == this.curr_time_arr[3]) classtText = "currItem";
                time_div += "<div class=\"" + classtText.trim() + "\">" + this.monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        },
        //创建分钟容器div
        createMinuteEle: function () {
            var time_div = "<div class=\"minute_containter\" id=\"minute_containter\" flag=\"0\">";
            for (var i = 0; i <= 55; i += 5) {
                var classtText = "";
                if (i == this.curr_time_arr[4]) classtText = "currItem";
                time_div += "<div class=\"" + classtText.trim() + "\">" + this.monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        },
        //创建秒容器div
        createSecondEle: function () {
            var time_div = "<div class=\"minute_containter\" id=\"second_containter\" flag=\"0\">";
            for (var i = 0; i <= 55; i += 5) {
                var classtText = "";
                if (i == this.curr_time_arr[5]) classtText = "currItem";
                time_div += "<div class=\"" + classtText.trim() + "\">" + this.monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        },
        yearSelected: function (event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            if (!isNaN(srcElement.text()) && srcElement.text().length <= 4) {
                var txt = srcElement.text();  //点击的年份
                var curr_year = this.curr_time_arr[0];  //首先保存当前年
                this.curr_time_arr[0] = txt;   //吧全局的年份修改了
                if (txt > curr_year) {
                    this.changeMainData("left");
                } if (txt < curr_year) {
                    this.changeMainData("right");
                }
                this.calendar.find(".title_year").text(txt + this.commonlang[this.lang].title[0]);
                this.showYearDiv();
                this.writeDate();
            }
        },
        monthSelected: function (event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            var txt = srcElement.text();  //点击的月份
            for (var i = 0; i < this.commonlang[this.lang].month.length; i++) {
                if (this.commonlang[this.lang].month[i] == txt) {
                    var curr_month = this.curr_time_arr[1];   //保存当前的月份
                    this.curr_time_arr[1] = i;  //修改全局月份
                    if (i > curr_month) {
                        this.changeMainData("left");
                    }
                    if (i < curr_month) {
                        this.changeMainData("right");
                    }
                    this.calendar.find(".title_month").text(this.commonlang[this.lang].month[i] + this.commonlang[this.lang].title[3]);
                    this.showMonthDiv();
                    this.writeDate();
                    return;
                }
            }
        },
        daySelected: function (event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            var day = srcElement.text();
            if (day <= 31 && day > 0) {
                this.curr_time_arr[2] = day;
                this.calendar.hide();
                this.writeDate();
            }
        },
        hourSelected: function (event) {
            var srcElement = $(event.target);
            if (srcElement.hasClass("disabled")) return false;
            var txt = srcElement.text();
            if (txt >= 0 && txt <= 23) {
                this.calendar_time.find("#hour").val(txt);
                this.curr_time_arr[3] = txt;
                this.showHoverDiv();
                this.writeDate();
            }
        },
        minuteSelected: function (event) {
            var txt = $(event.target).text();
            if (txt >= 0 && txt <= 55) {
                this.calendar_time.find("#minute").val(txt);
                this.curr_time_arr[4] = txt;
                this.showMinuteDiv();
                this.writeDate();
            }
        },
        secondSelected: function (event) {
            var txt = $(event.target).text();
            if (txt >= 0 && txt <= 55) {
                this.calendar_time.find("#second").val(txt);
                this.curr_time_arr[5] = txt;
                this.showSecondDiv();
                this.writeDate();
            }
        },
        writeDate: function () {
            if (!this.curr_time_arr) {
                this.curr_time_arr = [this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), this.date.getMinutes(), this.date.getSeconds()];
            }
            var usedate = this.dateFormat(this.curr_time_arr, this.defaults.useFormat);
            this.setDate(usedate);
        },
        nextYearDiv: function (direction) {
            if (direction == "left") {
                this.start_disp_year += 16;
                this.con_year = this.createYearEle(this.start_disp_year).css({ "left": this.calendar.css("width"), "top": "26px" });
                this.calendar.append(this.con_year);
                var year_containter = this.calendar.find(".calendar_mainyear_containter");  //获取2个year层
                //去掉原来的
                year_containter.filter("[flag=1]").animate({ left: "-" + this.calendar.css("width") }, this.dur, function () {
                    $(this).unbind("click", this.yearSelected).remove();
                });
                //添加新的
                year_containter.filter("[flag=0]").animate({ left: 0 }, this.dur).attr("flag", "1");
            } else {
                this.start_disp_year -= 16;
                this.con_year = this.createYearEle(this.start_disp_year).css({ "right": this.calendar.css("width"), "top": "26px" });
                this.calendar.append(this.con_year);
                var year_containter = this.calendar.find(".calendar_mainyear_containter");  //获取2个year层
                year_containter.filter("[flag=1]").animate({ right: "-" + this.calendar.css("width") }, this.dur, function () {
                    $(this).unbind("click", this.yearSelected).remove();
                });
                year_containter.filter("[flag=0]").animate({ right: 0 }, this.dur).attr("flag", "1");
            }
        },
        isYearDisplay: function () {
            if (this.con_year.attr("flag") == "1") return true;
            return false;
        },
        isMonthDisplay: function () {
            if (this.con_month.attr("flag") == "1") return true;
            return false;
        },
        isHoverDisplay: function () {
            if (this.con_hour.attr("flag") == "1") return true;
            return false;
        },
        isMinuteDisplay: function () {
            if (this.con_minute.attr("flag") == "1") return true;
            return false;
        },
        isSecondDisplay: function () {
            if (this.con_second.attr("flag") == "1") return true;
            return false;
        },
        //判断给的的天是否在给出的范围
        isDayDisabled: function (day) {
            var days = Number(this.curr_time_arr[0]) * 365 + Number(this.curr_time_arr[1]) * 30 + day,
                startdays = Number(this.start_time_arr[0]) * 365 + Number(this.start_time_arr[1]) * 30 + Number(this.start_time_arr[2]),
                enddays = Number(this.end_time_arr[0]) * 365 + Number(this.end_time_arr[1]) * 30 + Number(this.end_time_arr[2]);
            if (days < startdays || days > enddays) return true;
            return false;
        },
        //判断给定的小时是否在给出的范围
        isHourDisabled: function (hour) {
            var curr_hours = Number(this.curr_time_arr[0]) * 365 * 24 + Number(this.curr_time_arr[1]) * 30 * 24 + Number(this.curr_time_arr[2]) * 24 + hour,
               start_hours = Number(this.start_time_arr[0]) * 365 * 24 + Number(this.start_time_arr[1]) * 30 * 24 + this.start_time_arr[2] * 24 + this.start_time_arr[3],
               end_hours = Number(this.end_time_arr[0]) * 365 * 24 + Number(this.end_time_arr[1]) * 30 * 24 + this.end_time_arr[2] * 24 + this.end_time_arr[3];

            if (curr_hours < start_hours || curr_hours > end_hours) return true;
            return false;
        },
        //判断给定的分是否在给出的范围
        isMinuteDisabled: function (minutes) {
            var curr_minutes = Number(this.curr_time_arr[0]) * 365 * 24 * 60 + Number(this.curr_time_arr[1]) * 30 * 24 * 60 + Number(this.curr_time_arr[2]) * 24 * 60 + this.curr_time_arr[3] * 60 + minutes,
                start_minutes = Number(this.start_time_arr[0]) * 365 * 24 * 60 + Number(this.start_time_arr[1]) * 30 * 24 * 60 + this.start_time_arr[2] * 24 * 60 + this.start_time_arr[3] * 60 + this.start_time_arr[4],
               end_minutes = Number(this.end_time_arr[0]) * 365 * 24 * 60 + Number(this.end_time_arr[1]) * 30 * 24 * 60 + this.end_time_arr[2] * 24 * 60 + this.end_time_arr[3] * 60 + this.end_time_arr[4];
            if (curr_minutes < start_minutes || curr_minutes > end_minutes) return true;
            return false;
        },
        //判断给定的秒是否在给出的范围
        isSecondDsiabled: function (seconds) {
            var curr_seconds = Number(this.curr_time_arr[0]) * 365 * 24 * 60 * 60 + Number(this.curr_time_arr[1]) * 30 * 24 * 60 * 60 + Number(this.curr_time_arr[2]) * 24 * 60 * 60 + this.curr_time_arr[3] * 60 * 60 + this.curr_time_arr[4] * 60 + seconds,
                start_seconds = Number(this.start_time_arr[0]) * 365 * 24 * 60 * 60 + Number(this.start_time_arr[1]) * 30 * 24 * 60 * 60 + this.start_time_arr[2] * 24 * 60 * 60 + this.start_time_arr[3] * 60 * 60 + this.start_time_arr[4] * 60 + this.start_time_arr[5],
               end_seconds = Number(this.end_time_arr[0]) * 365 * 24 * 60 * 60 + Number(this.end_time_arr[1]) * 30 * 24 * 60 * 60 + this.end_time_arr[2] * 24 * 60 * 60 + this.end_time_arr[3] * 60 * 60 + this.end_time_arr[4] * 60 + this.end_time_arr[5];
            if (curr_seconds < start_seconds || curr_seconds > end_seconds) return true;
            return false;
        },
        //判断给定的天是否今天,忽略年月,(只要天相等,都加上灰色背景)
        isDay: function (day) {
            var date = new Date();
            if (date.getDate() == day) return true;
            return false;
        },
        //判断给定的天是否今天(年月日都相等,才加灰色背景)
        isDateDay: function (day) {
            var date = new Date();
            if (this.curr_time_arr[0] == date.getFullYear() && this.curr_time_arr[1] == date.getMonth() && date.getDate() == day) return true;
            return false;
        },
        //判断当前的日期是否是文本框的值
        isDateToday: function (day) {
            if (this.text_time_arr && this.text_time_arr.length > 0) {
                if (this.text_time_arr[0] == this.curr_time_arr[0] && this.text_time_arr[1] == this.curr_time_arr[1] && this.text_time_arr[2] == day) return true;
                return false;
            }
            return false;
        },
        //判断给的的天是否周末
        isWeekend: function (day) {
            var weekday = new Date(this.curr_time_arr[0], this.curr_time_arr[1], day).getDay();
            if (weekday == 6 || weekday == 0) return true;
            return false;
        }
    }
    window.Date.prototype.addYear = function (year) {
        this.setFullYear(this.getFullYear() + year);
        return this;
    }
    window.Date.prototype.addMonth = function (month) {
        this.setMonth(this.getMonth() + month);
        return this;
    }
    window.Date.prototype.addDay = function (day) {
        this.setDate(this.getDate() + day);
        return this;
    }
})(window, document, jQuery);
