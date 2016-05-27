/// <reference path="../Scripts/jquery-1.7.1.min.js" />
/***************************调用说明:***********************************
/*
开发者:wangyang
调用方法请参考文档
**********************************************************************/
(function (win, jQuery) {
    jQuery.fn.Calendar = function (options) {
        //默认配置
        var defaults = {
            format: "dd Month yyyy",           //界面展示的格式 yyyy-MM-dd hh:mm:ss|yyyy/MM/dd hh:mm:ss|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
            start: "2000-01-01 00:00:00",      //start: new Date(),
            end: "2049-12-31 00:00:00",        //end: new Date().addYear(1)
            dateString: "",                    //字符串,默认显示的时间值,yyyy-MM-dd hh:mm:ss|yyyy/MM/dd hh:mm:ss
            useFormat: "yyyy-MM-dd hh:mm:ss"  //与程序交互的时间格式

        };
        //全局参数
        var lang = "en-us",       //界面语言 en-us|zh-cn
        commonlang = {
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
        has_time = false,     //
        that = this,
        time_regex = /[Hh]{1,2}:([Mm]{1,2})?(:[Ss]{1,2})?/,   //仅仅用作验证文本框是否有时间
        date_val_regex = /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/; //提取文本框的日期,针对中国时间
        //全局对象
        var calendar,  //主日期框对象
            calendar_time,  //时间对象
            main_data_containter,  //主数据容器对象
            con_year,
            con_month,
            con_hour,
            con_minute,
            con_second;

        init(options);     //初始化用户配置
        that.bind("click", renderCalendar);
        that.keypress(function (event) {
            return false;
        });  //禁用文本框输入

        return {
            setDate: setDate,
            getDate: getDate
        };
        function setDate(dateString) {
            that.attr("dateval", "");
            if (dateString.trim()) {
                date = inputDateConvert(dateString);
                curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                text_time_arr = curr_time_arr.slice(0);
                var showdate = dateFormat(curr_time_arr, defaults.format);
                var usedate = dateFormat(curr_time_arr, defaults.useFormat);
                that.val(showdate);
                that.attr("dateval", usedate);
            }
        }
        function getDate() {
            return that.attr("dateval");
        }
        function init(options) {
            options = options || {};
            defaults.format = options.format || defaults.format;
            defaults.start = options.start || defaults.start;
            defaults.end = options.end || defaults.end;
            defaults.dateString = options.dateString || defaults.dateString;
            if (time_regex.test(defaults.format)) has_time = true;  //标记是否有时间
            if (!has_time) defaults.useFormat = defaults.useFormat.split(" ")[0];
            setDate(defaults.dateString);  //显示用户设置的默认值
        }
        //显示日期层
        function renderCalendar() {
            $("#calendar").remove();
            if (defaults.start instanceof Date) {
                start_time_arr = [defaults.start.getFullYear(), defaults.start.getMonth(), defaults.start.getDate(), defaults.start.getHours(), defaults.start.getMinutes(), defaults.start.getSeconds()];
            } else {
                start_time_arr = startEndDateConvert(defaults.start);
            }
            if (defaults.end instanceof Date) {
                end_time_arr = [defaults.end.getFullYear(), defaults.end.getMonth(), defaults.end.getDate(), defaults.end.getHours(), defaults.end.getMinutes(), defaults.end.getSeconds()];
            } else {
                end_time_arr = startEndDateConvert(defaults.end);
            }
            if (that.attr("dateval") && that.attr("dateval").trim() != "") {
                date = inputDateConvert(that.attr("dateval"));
                curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                text_time_arr = curr_time_arr.slice(0);
            }
            beginCalendar();
            $(document).bind("click", function () { $("#calendar").hide() });
            return false;
        }
        //创建日期主面板
        function beginCalendar() {
            var top = that.offset().top + that.outerHeight() + "px",   //日历框位置
                left = $(that).offset().left + "px";
            var calendar_div = "<div id=\"calendar\" class=\"calendar\">";
            calendar_div += "<div id=\"calendar_title_containter\" class=\"calendar_title_containter\">";
            calendar_div += "<div class=\"calendar_last_year\"><span class=\"last_year calendar_img\" title=\"" + commonlang[lang].title[1] + "\"></span></div>" +
                "<div class=\"calendar_last_month\"><span class=\"last_month calendar_img\" title=\"" + commonlang[lang].title[4] + "\"></span></div>" +
                "<div class=\"calendar_title_date\">" + createCalendarTitle() + "</div>" +
                "<div class=\"calendar_next_month\"><span class=\"next_month calendar_img\" title=\"" + commonlang[lang].title[5] + "\"></span></div>" +
                "<div class=\"calendar_next_year\"><span class=\"next_year calendar_img\" title=\"" + commonlang[lang].title[2] + "\"></span></div>" +
                "</div>";  //title
            //容器部分
            calendar_div += "<div id=\"calendar_maindata_containter\" class=\"calendar_maindata_containter\">";
            calendar_div += "<div id=\"calendar_week_container\" class=\"calendar_week_container\"><div id=\"calendar_week\" class=\"calendar_week\">";
            for (var item in commonlang[lang].week) {
                calendar_div += "<div>" + commonlang[lang].week[item] + "</div>";
            }
            calendar_div += "</div></div>";
            calendar_div += createDataDiv();   //天数
            calendar_div += "</div></div>";
            calendar = $(calendar_div).bind("click", function () { return false }).css({ top: top, left: left });
            main_data_containter = calendar.find(".calendar_maindata_containter");
            main_data_containter.bind("click", daySelected);
            if (needAddHeight()) {
                calendar.addClass("add_cal_len1");
                main_data_containter.addClass("add_main_date_len1");
            }
            $("body").append(calendar);
            initDate();
            if (has_time) renderCalendarTime().appendTo(calendar);   //时间
        }
        function createCalendarTitle() {
            var title = "";
            if (lang === "zh-cn") {  //中文
                title = "<span class=\"title_year\">" + curr_time_arr[0] + commonlang[lang].title[0] + "</span>" +
                    " <span class=\"title_month\">" + monthFormat((curr_time_arr[1] + 1), 2) + commonlang[lang].title[3] + "</span>";
            } else {  //英文
                title = " <span class=\"title_month\">" + commonlang[lang].month[curr_time_arr[1]] + "</span> " +
                    " <span class=\"title_year\">" + curr_time_arr[0] + "</span> ";
            }
            return title;
        }
        //日期面板的点击事件
        function initDate() {
            con_year = createYearEle(curr_time_arr[0]);
            con_month = createMonthEle();
            calendar.append(con_year, con_month);
            calendar.find(".title_year").bind("click", displayYearDiv);
            calendar.find(".title_month").bind("click", displayMonthDiv);
            calendar.find(".last_year").bind("click", lastYear);
            calendar.find(".next_year").bind("click", nextYear);
            calendar.find(".last_month").bind("click", lastMonth);
            calendar.find(".next_month").bind("click", nextMonth);
        }
        //初始化时间面板
        function renderCalendarTime() {
            var time_div = "<div id=\"calendar_time\" class=\"calendar_time\">";
            time_div += "<span id=\"hover_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + monthFormat(curr_time_arr[3], 2) + "\" maxlength=\"2\" id=\"hour\"/></span>:<span id=\"minute_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + monthFormat(curr_time_arr[4], 2) + "\" maxlength=\"2\" id=\"minute\"/></span>:<span id=\"second_txt\"><input type=\"text\" class=\"time_txt\" value=\"" + monthFormat(curr_time_arr[5], 2) + "\" maxlength=\"2\" id=\"second\"/></span>";
            time_div += "</div>";
            calendar_time = $(time_div);
            initTime();
            needAddHeight() ? calendar.addClass("add_cal_len3") : calendar.addClass("add_cal_len2");
            return calendar_time;
        }
        //时间面板的点击事件
        function initTime() {
            con_hour = createHoverEle();
            con_minute = createMinuteEle();
            con_second = createSecondEle();
            calendar.append(con_hour, con_minute, con_second);
            con_hour.bind("click", hourSelected);
            con_minute.bind("click", minuteSelected);
            con_second.bind("click", secondSelected);
            calendar_time.find("#hover_txt").bind("click", dispalyHoverDiv);
            calendar_time.find("#minute_txt").bind("click", dispalyMinuteDiv);
            calendar_time.find("#second_txt").bind("click", dispalySecondDiv);
        }
        //将文本框中的日期字符串转成日期对象,供默认选中用
        function inputDateConvert(str) {
            var result = date_val_regex.exec(str);
            var year = result[1] || new Date().getFullYear(),
                month = result[2] > 0 ? (result[2] - 1) : new Date().getMonth(),
                day = result[3] > 0 ? result[3] : new Date().getDate(),
                hour = result[4] >= 0 ? result[4] : new Date().getHours(),
                minute = result[5] >= 0 ? result[5] : new Date().getMinutes(),
                second = result[6] >= 0 ? result[6] : new Date().getSeconds();
            //转换成日期对象,这样可以消去一些不必要的格式错误
            return new Date(year, month, day, hour, minute, second);
        }
        //将给出的时间范围转成数组,以便后续的比较
        function startEndDateConvert(str) {
            var result = date_val_regex.exec(str);
            var year = result[1],
                month = (result[2] - 1) < 0 ? 0 : (result[2] - 1),
                day = result[3] > 0 ? result[3] : 1,
                hour = result[4] >= 0 ? result[4] : 0,
                minute = result[5] >= 0 ? result[5] : 0,
                second = result[6] >= 0 ? result[6] : 0;
            return [year, month, day, hour, minute, second];
        }
        //影藏时间面板
        function hiddenTimePanel() {
            if (con_hour) con_hour.css("bottom", "-176px").attr("flag", "0");
            if (con_minute) con_minute.css("bottom", "-176px").attr("flag", "0");
            if (con_second) con_second.css("bottom", "-176px").attr("flag", "0");
        }
        //隐藏年月面板
        function hiddenDatePanel() {
            con_year.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
            con_month.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
        }
        function getMaxZIndex() {
            var zindex = 0;
            if (parseInt(con_month.css("z-index"), 10) > zindex) zindex = parseInt(con_month.css("z-index"), 10);
            if (parseInt(con_year.css("z-index"), 10) > zindex) zindex = parseInt(con_year.css("z-index"), 10);
            if (con_hour && parseInt(con_hour.css("z-index"), 10) > zindex) zindex = parseInt(con_hour.css("z-index"), 10);
            if (con_minute && parseInt(con_minute.css("z-index"), 10) > zindex) zindex = parseInt(con_minute.css("z-index"), 10);
            if (con_second && parseInt(con_second.css("z-index"), 10) > zindex) zindex = parseInt(con_second.css("z-index"), 10);
            return zindex;
        }
        //显示年份div
        function displayYearDiv() {
            con_year.stop(); con_month.stop();
            //重设年份容器的年份内容
            con_year.html(createYearEle(curr_time_arr[0]).unbind("click", yearSelected).html());
            //让year层在month层上面
            con_year.css({ "z-index": getMaxZIndex() + 1 });
            if (con_year.attr("flag") == "0") {   //flag=0;表示年div未显示
                calendar.find(".last_month,.next_month").addClass("disabled");
                calendar.find(".last_year,.next_year").removeClass("disabled");
                con_year.animate({ top: "26px" }, dur, function () {
                    con_month.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                    hiddenTimePanel();
                    con_year.attr("flag", "1");
                });
            } else {
                calendar.find(".last_month,.next_month").removeClass("disabled");
                con_year.animate({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }, dur);
                con_year.attr("flag", "0");
            }
        }
        //显示月份div
        function displayMonthDiv() {
            con_year.stop(); con_month.stop();
            con_month.html(createMonthEle().unbind("click", monthSelected).html());  //重设月份的内容
            con_month.css({ "z-index": getMaxZIndex() + 1 });  //让moth层在year层上面
            if (con_month.attr("flag") == "0") {   //flag=0;表示月div未显示
                calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                con_month.animate({ top: "26px" }, dur, function () {
                    con_year.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                    hiddenTimePanel();
                    con_month.attr("flag", "1");
                });
            } else {
                calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                con_month.animate({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }, dur);
                con_month.attr("flag", "0");
            }
        }
        //显示小时div
        function dispalyHoverDiv() {
            con_hour.css("z-index", getMaxZIndex() + 1);
            if (con_hour.attr("flag") == "0") {
                calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                con_hour.animate({ bottom: "21px" }, dur, function () {
                    $(this).attr("flag", "1");
                    con_minute.css("bottom", "-176px").attr("flag", "0");
                    con_second.css("bottom", "-176px").attr("flag", "0");
                    hiddenDatePanel();
                });
            } else {
                calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                con_hour.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
            }
        }
        //显示分钟div
        function dispalyMinuteDiv() {
            con_minute.css("z-index", getMaxZIndex() + 1);
            if (con_minute.attr("flag") == "0") {
                calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                con_minute.animate({ bottom: "21px" }, dur, function () {
                    $(this).attr("flag", "1");
                    con_hour.css("bottom", "-176px").attr("flag", "0");
                    con_second.css("bottom", "-176px").attr("flag", "0");
                    hiddenDatePanel();
                });
            } else {
                calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                con_minute.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
            }
        }
        function dispalySecondDiv() {
            con_second.css("z-index", getMaxZIndex() + 1);
            if (con_second.attr("flag") == "0") {
                calendar.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
                con_second.animate({ bottom: "21px" }, dur, function () {
                    $(this).attr("flag", "1");
                    con_hour.css("bottom", "-176px").attr("flag", "0");
                    con_minute.css("bottom", "-176px").attr("flag", "0");
                    hiddenDatePanel();
                });
            } else {
                calendar.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
                con_second.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
            }
        }
        //上一年
        function lastYear() {
            if ($(this).hasClass("disabled")) return;
            if (isYearDisplay()) {    //year层目前在展现
                nextYearDiv("right");
                return false;
            }
            --curr_time_arr[0];
            if (isMonthDisplay()) {   //month目前在展现
                nextMonthDisplay("right");
            }
            calendar.find(".title_year").text(curr_time_arr[0] + commonlang[lang].title[0]);
            changeMainData("right");  //动画改变日期面板
        }
        //下一年
        function nextYear() {
            if ($(this).hasClass("disabled")) return;
            if (isYearDisplay()) {   //year层目前在展现
                nextYearDiv("left");
                return false;
            }
            ++curr_time_arr[0];
            if (isMonthDisplay()) {   //month目前在展现
                nextMonthDisplay("left");
            }
            calendar.find(".title_year").text(curr_time_arr[0] + commonlang[lang].title[0]);
            changeMainData("left");  //动画改变日期面板
        }
        //上一月
        function lastMonth() {
            if ($(this).hasClass("disabled")) return;
            --curr_time_arr[1];
            if (curr_time_arr[1] < 0) {
                curr_time_arr[0]--;
                curr_time_arr[1] = 11;
                calendar.find(".title_year").text(curr_time_arr[0] + commonlang[lang].title[0]);
            }
            //if (isMonthDisplay()) nextMonthDisplay("right");
            calendar.find(".title_month").text(commonlang[lang].month[curr_time_arr[1]].substring(0, 6) + commonlang[lang].title[3]);
            changeMainData("right");//动画改变日期面板
        }
        //下一月
        function nextMonth() {
            if ($(this).hasClass("disabled")) return;
            ++curr_time_arr[1];
            if (curr_time_arr[1] > 11) {  //该跳到下一年了
                curr_time_arr[0]++;
                curr_time_arr[1] = 0;
                calendar.find(".title_year").text(curr_time_arr[0] + commonlang[lang].title[0]);
            }
            //if (isMonthDisplay()) nextMonthDisplay("left");
            calendar.find(".title_month").text(commonlang[lang].month[curr_time_arr[1]].substring(0, 6) + commonlang[lang].title[3]);
            changeMainData("left");
        }
        //改变主日期面板,direction=动画方向
        function changeMainData(direction) {
            var calendar_width = calendar.css("width");  //主日期框宽度(数据面板的偏移量)
            var dataEle = $(createDataDiv()); //创建
            //在改变日期数据面板时,每个月天数不一样,有可能高度发生变化
            if (needAddHeight()) {
                calendar.addClass("add_cal_len1");
                if (has_time) {  //有时间
                    calendar.addClass("add_cal_len3");
                }
                main_data_containter.addClass("add_main_date_len1");
                con_year.addClass("mainyear_height1");
                con_month.addClass("mainmonth_height1");
            } else {
                calendar.removeClass("add_cal_len1");
                if (has_time) {
                    calendar.removeClass("add_cal_len3");
                    calendar.addClass("add_cal_len2");
                }
                main_data_containter.removeClass("add_main_date_len1");
                con_year.removeClass("mainyear_height1");
                con_month.removeClass("mainmonth_height1");
            }
            if (direction == "left") {
                dataEle.css({ left: calendar_width }).attr("flag", "0");  //创建日期数据主面板element
                main_data_containter.append(dataEle);  //吧日期主面板加入父容器,这时连同以前一个数据面板，一共有2个数据面板
                var containter = calendar.find(".calendar_data_containter");   //获取这2个数据面板
                //2个面板一同移动
                containter.filter(":[flag=1]").animate({ left: "-" + calendar_width }, dur, function () {
                    $(this).remove();
                });
                containter.filter(":[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
            }
            if (direction == "right") {
                dataEle.css({ left: "-" + calendar_width }).attr("flag", "0");
                main_data_containter.append(dataEle);
                var containter = $(".calendar_data_containter");
                containter.filter(":[flag=1]").animate({ left: calendar_width }, dur, function () {
                    $(this).remove();
                });
                containter.filter(":[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
            }
        }
        //格式化日期 time_arr=数组,往界面输出 格式化后的日期
        function dateFormat(time_arr, format) {
            var realMonth = time_arr[1];
            format = format.replace(/([Mm]onth)/, commonlang[lang].month[realMonth]);
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
        //根据年月获取该月的天数,第一天周几
        function getMonthDays(year, month) {
            var days = new Date(year, month + 1, 0).getDate();  //当前月的天数
            var first_day_week = new Date(year, month, 1).getDay();   //第一天周几
            return { days: days, first_day_week: first_day_week };
        }
        //是否需要增加日期框高度
        function needAddHeight() {
            var days_week_obj = getMonthDays(curr_time_arr[0], curr_time_arr[1]);  //对象包含当月的天数，第一天周几？
            if (days_week_obj.days == 30 && days_week_obj.first_day_week == 6) return true;
            if (days_week_obj.days == 31 && (days_week_obj.first_day_week == 5 || days_week_obj.first_day_week == 6)) return true;
            return false;
        }
        //创建日期主面板的天数据
        function createDataDiv() {
            var days_week_obj = getMonthDays(curr_time_arr[0], curr_time_arr[1]);  //对象包含当月的天数，第一天周几？
            var calendar_div = "<div class=\"calendar_data_containter\" flag=\"1\">";
            for (var i = 0; i < days_week_obj.first_day_week; i++) {   //前面部分
                calendar_div += "<span></span>";
            }
            for (var i = 1; i <= days_week_obj.days; i++) {      // 日期部分
                var selcss = "\"";
                if (isDateDay(i)) selcss += "day ";
                if (isWeekend(i)) selcss += "weekend ";
                if (isDateToday(i)) selcss += "today ";
                if (isDayDisabled(i)) selcss = "disabled ";
                selcss += "\"";
                calendar_div += "<div class=" + selcss + ">" + i + "</div>";
            }
            calendar_div += "</div>";
            return calendar_div;
        }
        //创建年容器div
        function createYearEle(curr_year) {
            start_disp_year = Math.floor(curr_year / 16) * 16;
            var year_div = "<div class=\"calendar_mainyear_containter\" flag=\"0\">";
            for (var i = start_disp_year; i < start_disp_year + 16; i++) {
                if (i < start_time_arr[0] || i > end_time_arr[0]) {  //设置禁用标记
                    year_div += "<div class=\"disabled\">" + i + "</div>";
                } else {
                    year_div += "<div>" + i + "</div>";
                }
            }
            year_div += "</div>";
            var year_ele = $(year_div);
            if (needAddHeight()) year_ele.addClass("mainyear_height1");
            year_ele.bind("click", yearSelected);
            return year_ele;
        }
        //创建月容器div
        function createMonthEle() {
            var month_div = "<div class=\"calendar_mainmonth_containter\" flag=\"0\">";
            for (var i = 0; i < commonlang[lang].month.length; i++) {
                var classtText = "";
                if (i == curr_time_arr[1]) classtText = "currMonth";
                var disabled = false;  //禁用标记
                var months = Number(curr_time_arr[0]) * 12 + i,
                    startmonths = Number(start_time_arr[0]) * 12 + Number(start_time_arr[1]),
                    endmonths = Number(end_time_arr[0]) * 12 + Number(end_time_arr[1]);
                if (months < startmonths || months > endmonths) disabled = true;
                if (disabled) classtText += " disabled";
                month_div += "<div class=\"" + classtText.trim() + "\">" + commonlang[lang].month[i] + "</div>";
            }
            month_div += "</div>";
            var month_ele = $(month_div);
            if (needAddHeight()) month_ele.addClass("mainmonth_height1");
            month_ele.bind("click", monthSelected);
            return month_ele;
        }
        //创建小时容器div
        function createHoverEle() {
            var time_div = "<div class=\"hover_containter\" id=\"hover_containter\" flag=\"0\">";
            for (var i = 0; i <= 23; i++) {
                time_div += "<div>" + monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        }
        //创建分钟容器div
        function createMinuteEle() {
            var time_div = "<div class=\"minute_containter\" id=\"minute_containter\" flag=\"0\">";
            for (var i = 0; i <= 55; i += 5) {
                time_div += "<div>" + monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        }
        //创建秒容器div
        function createSecondEle() {
            var time_div = "<div class=\"minute_containter\" id=\"second_containter\" flag=\"0\">";
            for (var i = 0; i <= 55; i += 5) {
                time_div += "<div>" + monthFormat(i, 2) + "</div>";
            }
            time_div += "</div>";
            var time_ele = $(time_div);
            return time_ele;
        }
        function yearSelected(event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            if (!isNaN(srcElement.text()) && srcElement.text().length <= 4) {
                var txt = srcElement.text();  //点击的年份
                var curr_year = curr_time_arr[0];  //首先保存当前年
                curr_time_arr[0] = txt;   //吧全局的年份修改了
                if (txt > curr_year) {
                    changeMainData("left");
                } if (txt < curr_year) {
                    changeMainData("right");
                }
                calendar.find(".title_year").text(txt + commonlang[lang].title[0]);
                displayYearDiv();
            }
        }
        function monthSelected(event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            var txt = srcElement.text();  //点击的月份
            for (var i = 0; i < commonlang[lang].month.length; i++) {
                if (commonlang[lang].month[i] == txt) {
                    var curr_month = curr_time_arr[1];   //保存当前的月份
                    curr_time_arr[1] = i;  //修改全局月份
                    if (i > curr_month) {
                        changeMainData("left");
                    }
                    if (i < curr_month) {
                        changeMainData("right");
                    }
                    calendar.find(".title_month").text(commonlang[lang].month[i] + commonlang[lang].title[3]);
                    displayMonthDiv();
                    return;
                }
            }
        }
        function daySelected(event) {
            var srcElement = $(event.target);  //触发事件的原对象
            if (srcElement.hasClass("disabled")) return false;
            var day = srcElement.text();
            if (day <= 31 && day > 0) {
                curr_time_arr[2] = day;
                if (has_time) {
                    curr_time_arr[3] = calendar_time.find("#hour").val();
                    curr_time_arr[4] = calendar_time.find("#minute").val();
                    curr_time_arr[5] = calendar_time.find("#second").val();
                }
                var showdate = dateFormat(curr_time_arr, defaults.format);
                var usedate = dateFormat(curr_time_arr, defaults.useFormat);
                that.val(showdate);
                that.attr("dateval", usedate);
                calendar.hide();
            }
        }
        function hourSelected(event) {
            var srcElement = $(event.target);
            if (srcElement.hasClass("disabled")) return false;
            var txt = srcElement.text();
            if (txt >= 0 && txt <= 23) {
                calendar_time.find("#hour").val(txt);
                dispalyHoverDiv();
            }
        }
        function minuteSelected(event) {
            var txt = $(event.target).text();
            if (txt >= 0 && txt <= 55) {
                calendar_time.find("#minute").val(txt);
                dispalyMinuteDiv();
            }
        }
        function secondSelected(event) {
            var txt = $(event.target).text();
            if (txt >= 0 && txt <= 55) {
                calendar_time.find("#second").val(txt);
                dispalySecondDiv();
            }
        }
        function nextYearDiv(direction) {
            if (direction == "left") {
                start_disp_year += 16;
                con_year = createYearEle(start_disp_year).css({ "left": calendar.css("width"), "top": "26px" });
                calendar.append(con_year);
                var year_containter = calendar.find(".calendar_mainyear_containter");  //获取2个year层
                //去掉原来的
                year_containter.filter(":[flag=1]").animate({ left: "-" + calendar.css("width") }, dur, function () {
                    $(this).unbind("click", yearSelected).remove();
                });
                //添加新的
                year_containter.filter(":[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
            } else {
                start_disp_year -= 16;
                con_year = createYearEle(start_disp_year).css({ "right": calendar.css("width"), "top": "26px" });
                calendar.append(con_year);
                var year_containter = calendar.find(".calendar_mainyear_containter");  //获取2个year层
                year_containter.filter(":[flag=1]").animate({ right: "-" + calendar.css("width") }, dur, function () {
                    $(this).unbind("click", yearSelected).remove();
                });
                year_containter.filter(":[flag=0]").animate({ right: 0 }, dur).attr("flag", "1");
            }
        }
        function isYearDisplay() {
            if (con_year.attr("flag") == "1") return true;
            return false;
        }
        function isMonthDisplay() {
            if (con_month.attr("flag") == "1") return true;
            return false;
        }
        function isHoverDisplay() {
            if (con_hour.attr("flag") == "1") return true;
            return false;
        }
        function isMinuteDisplay() {
            if (con_minute.attr("flag") == "1") return true;
            return false;
        }
        function isSecondDisplay() {
            if (con_second.attr("flag") == "1") return true;
            return false;
        }
        //判断给的的天是否在给出的范围
        function isDayDisabled(day) {
            var days = Number(curr_time_arr[0]) * 365 + Number(curr_time_arr[1]) * 30 + day,
                startdays = Number(start_time_arr[0]) * 365 + Number(start_time_arr[1]) * 30 + Number(start_time_arr[2]),
                enddays = Number(end_time_arr[0]) * 365 + Number(end_time_arr[1]) * 30 + Number(end_time_arr[2]);
            if (days < startdays || days > enddays) return true;
            return false;
        }
        //判断给定的小时是否在给出的范围
        function isHourDisabled(hour) {
            var curr_hours = Number(curr_time_arr[0]) * 365 * 24 + Number(curr_time_arr[1]) * 30 * 24 + Number(curr_time_arr[2]) * 24 + hour,
               start_hours = Number(start_time_arr[0]) * 365 * 24 + Number(start_time_arr[1]) * 30 * 24 + start_time_arr[2] * 24 + start_time_arr[3],
               end_hours = Number(end_time_arr[0]) * 365 * 24 + Number(end_time_arr[1]) * 30 * 24 + end_time_arr[2] * 24 + end_time_arr[3];

            if (curr_hours < start_hours || curr_hours > end_hours) return true;
            return false;
        }
        //判断给定的分是否在给出的范围
        function isMinuteDisabled(minutes) {
            var curr_minutes = Number(curr_time_arr[0]) * 365 * 24 * 60 + Number(curr_time_arr[1]) * 30 * 24 * 60 + Number(curr_time_arr[2]) * 24 * 60 + curr_time_arr[3] * 60 + minutes,
                start_minutes = Number(start_time_arr[0]) * 365 * 24 * 60 + Number(start_time_arr[1]) * 30 * 24 * 60 + start_time_arr[2] * 24 * 60 + start_time_arr[3] * 60 + start_time_arr[4],
               end_minutes = Number(end_time_arr[0]) * 365 * 24 * 60 + Number(end_time_arr[1]) * 30 * 24 * 60 + end_time_arr[2] * 24 * 60 + end_time_arr[3] * 60 + end_time_arr[4];
            if (curr_minutes < start_minutes || curr_minutes > end_minutes) return true;
            return false;
        }
        //判断给定的秒是否在给出的范围
        function isSecondDsiabled(seconds) {
            var curr_seconds = Number(curr_time_arr[0]) * 365 * 24 * 60 * 60 + Number(curr_time_arr[1]) * 30 * 24 * 60 * 60 + Number(curr_time_arr[2]) * 24 * 60 * 60 + curr_time_arr[3] * 60 * 60 + curr_time_arr[4] * 60 + seconds,
                start_seconds = Number(start_time_arr[0]) * 365 * 24 * 60 * 60 + Number(start_time_arr[1]) * 30 * 24 * 60 * 60 + start_time_arr[2] * 24 * 60 * 60 + start_time_arr[3] * 60 * 60 + start_time_arr[4] * 60 + start_time_arr[5],
               end_seconds = Number(end_time_arr[0]) * 365 * 24 * 60 * 60 + Number(end_time_arr[1]) * 30 * 24 * 60 * 60 + end_time_arr[2] * 24 * 60 * 60 + end_time_arr[3] * 60 * 60 + end_time_arr[4] * 60 + end_time_arr[5];
            if (curr_seconds < start_seconds || curr_seconds > end_seconds) return true;
            return false;
        }
        //判断给定的天是否今天,忽略年月,(只要天相等,都加上灰色背景)
        function isDay(day) {
            var date = new Date();
            if (date.getDate() == day) return true;
            return false;
        }
        //判断给定的天是否今天(年月日都相等,才加灰色背景)
        function isDateDay(day) {
            var date = new Date();
            if (curr_time_arr[0] == date.getFullYear() && curr_time_arr[1] == date.getMonth() && date.getDate() == day) return true;
            return false;
        }
        //判断当前的日期是否是文本框的值
        function isDateToday(day) {
            if (text_time_arr && text_time_arr.length > 0) {
                if (text_time_arr[0] == curr_time_arr[0] && text_time_arr[1] == curr_time_arr[1] && text_time_arr[2] == day) return true;
                return false;
            }
        }
        //判断给的的天是否周末
        function isWeekend(day) {
            var weekday = new Date(curr_time_arr[0], curr_time_arr[1], day).getDay();
            if (weekday == 6 || weekday == 0) return true;
            return false;
        }
    }
    //Date方法扩展,方便客户端调用
    win.Date.prototype.addYear = function (year) {
        this.setFullYear(this.getFullYear() + year);
        return this;
    }
    win.Date.prototype.addMonth = function (month) {
        this.setMonth(this.getMonth() + month);
        return this;
    }
    win.Date.prototype.addDay = function (day) {
        this.setDate(this.getDate() + day);
        return this;
    }
})(window, jQuery)
