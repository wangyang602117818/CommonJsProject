(function (win, $) {
    //默认配置
    var defaults = {
        showFormat: "yyyy-MM-dd",       //界面展示的格式 yyyy-MM-dd|yyyy/MM/dd|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
        start: "2000-01-01 00:00:00",      //start: new Date(),
        end: "2100-12-31 00:00:00",        //end: new Date().addYear(1)
        useFormat: "yyyy-MM-dd",           //与程序交互的时间格式
        lang: "en-us"                    //界面语言 en-us|zh-cn,

    };
    var scr = document.getElementsByTagName('SCRIPT');
    var template_src = $(scr[scr.length - 1]).attr("template");
    var css_src = $(scr[scr.length - 1]).attr("css");
    //全局参数
    var commonlang = {
        "zh-cn": {
            week: ["日", "一", "二", "三", "四", "五", "六"],
            month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            title: ["年", "上一年", "下一年", "月", "上一月", "下一月"]
        },
        "en-us": {
            week: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            title: ["", "Last Year", "Next Year", "", "Last Month", "Next Month"]
        }
    },
    date = new Date(),
    curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()],  //文本框中的日期
    text_time_arr,    //保存选中日期
    start_time_arr,
    end_time_arr,
    dur = 300,        //动画速度
    start_disp_year,  //year层的起始年
    has_time = false,     //,
    template = "",
    template_data = "",
    template_year = "",
    template_month = "",
    template_hover = "",
    template_minute = "",
    template_second = "",
    template_data_regex = /<!--data_containter_start-->((.|\n|\r)*)<!--data_containter_end-->/,
    template_year_regex = /<!--year_containter_start-->((.|\n|\r)*)<!--year_containter_end-->/,
    template_month_regex = /<!--month_containter_start-->((.|\n|\r)*)<!--month_containter_end-->/,
    template_hover_regex = /<!--hover_containter_start-->((.|\n|\r)*)<!--hover_containter_end-->/,
    template_minute_regex = /<!--minute_containter_start-->((.|\n|\r)*)<!--minute_containter_end-->/,
    template_second_regex = /<!--second_containter_start-->((.|\n|\r)*)<!--second_containter_end-->/,
    timeval_regex = /\d{1,2}:(\d{1,2})?(:\d{1,2})?/,  //验证文本框的日期值,是否有时间
    time_regex = /[Hh]{1,2}:([Mm]{1,2})?(:[Ss]{1,2})?/,   //作验证日期格式是否有时间
    date_val_regex = /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/; //提取文本框的日期,针对中国时间
    //全局对象
    var datepicker_iframe,
        datepicker,              //主日期框对象
        datepicker_time,         //时间对象
        main_data_containter,  //主数据容器对象
        con_year,
        con_month,
        con_hour,
        con_minute,
        con_second;
    var model = {};
    var that = null;    //input
    $(function () {
        $("body").append("<iframe class=\"datepicker_iframe\" scrolling=\"no\" style=\"position:absolute;display:none;border:0;left:50px;top:100px;width:205px;height:203px\"></iframe>");
        datepicker_iframe = $(".datepicker_iframe");
        datepicker_iframe.contents().find("head").append("<link href=\"" + css_src + "\" rel=\"stylesheet\" />");
        $(".datepicker").each(function () { showDate($(this)); });
        $(".datepicker").click(function () { that = $(this); init(); });
        $(document).click(function (event) {
            var srcElement = $(event.target);
            if (!srcElement.hasClass("datepicker")) datepicker_iframe.hide();
        });
    });
    $.fn.extend({
        initDatePicker: function () {
            this.each(function () { showDate($(this)); });
            return this;
        }
    });
    //页面加载的时候，展示日期
    function showDate(that) {
        var showFormat = that.attr("date-show-format") || defaults.showFormat;
        var dateString = that.attr("date-val");
        if (dateString && timeval_regex.test(dateString) && !that.attr("date-show-format")) showFormat = addTimeFormat(showFormat);
        if (dateString && dateString != '') {
            var date = inputDateConvert(dateString);
            var curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            var showdate = dateFormat(curr_time_arr, showFormat);
            that.val(showdate);
        }
    }
    //点击的时候，初始化数据
    function init() {
        var options = {};
        for (var t in defaults) options[t] = defaults[t];
        has_time = false;
        var dateShowFormat = that.attr("date-show-format");
        options.showFormat = dateShowFormat || options.showFormat;
        options.start = that.attr("date-start") || options.start;
        options.end = that.attr("date-end") || options.end;
        options.lang = that.attr("date-lang") || options.lang;
        if (time_regex.test(options.showFormat)) {
            has_time = true;
            options.useFormat = addTimeFormat(options.useFormat);    //showFormat使用了时间，则为useFormat添加时间
        }
        var dateString = that.attr("date-val");
        if (dateString && timeval_regex.test(dateString) && !dateShowFormat) {
            has_time = true;
            options.useFormat = addTimeFormat(options.useFormat);
            options.showFormat = addTimeFormat(options.showFormat);
        }
        if (dateString && dateString != '') {
            date = inputDateConvert(dateString);
        } else {
            date = new Date();
        }
        curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        text_time_arr = curr_time_arr.slice(0);
        if (options.start instanceof Date) {
            start_time_arr = [options.start.getFullYear(), options.start.getMonth(), options.start.getDate(), options.start.getHours(), options.start.getMinutes(), options.start.getSeconds()];
        } else {
            start_time_arr = startEndDateConvert(options.start);
        }
        if (options.end instanceof Date) {
            end_time_arr = [options.end.getFullYear(), options.end.getMonth(), options.end.getDate(), options.end.getHours(), options.end.getMinutes(), options.end.getSeconds()];
        } else {
            end_time_arr = startEndDateConvert(options.end);
        }
        start_disp_year = getStartDispYear(curr_time_arr[0]);
        render(options);
    }
    function render(options) {
        var top = that.offset().top + that.outerHeight(),
            left = that.offset().left;
        model = {
            defaults: options,
            commonlang: commonlang,
            curr_time_arr: curr_time_arr,
            start_time_arr: start_time_arr,
            end_time_arr: end_time_arr,
            start_disp_year: start_disp_year,
            has_time: has_time,
            getMonthDays: getMonthDays,
            isDateDay: isDateDay,
            isWeekend: isWeekend,
            isDateToday: isDateToday,
            isDayDisabled: isDayDisabled,
            monthFormat: monthFormat
        };
        var template = parseTemplate(getTemplate(), model);
        datepicker_iframe.contents().find("body").html(template);
        datepicker_iframe.css({ top: top, left: left, display: "inline" });
        bindEvent();
    }
    function bindEvent() {
        datepicker = datepicker_iframe.contents().find(".datepicker");
        main_data_containter = datepicker.find(".datepicker_maindata_containter");
        con_year = datepicker.find(".datepicker_year_layer");
        con_month = datepicker.find(".datepicker_month_layer");
        con_hour = datepicker.find(".datepicker_hover_layer");
        con_minute = datepicker.find(".datepicker_minute_layer");
        con_second = datepicker.find(".datepicker_second_layer");
        changeHeight();
        //5个div层
        datepicker.find(".title_year").bind("click", showYearLayer);
        datepicker.find(".title_month").bind("click", showMonthLayer);
        datepicker.find("#hover_txt").bind("click", showHoverLayer).bind("input propertychange", function () {
            curr_time_arr[3] = $(this).find("input").val();
            writeDate();
        });
        datepicker.find("#minute_txt").bind("click", showMinuteLayer).bind("input propertychange", function () {
            curr_time_arr[4] = $(this).find("input").val();
            writeDate();
        });
        datepicker.find("#second_txt").bind("click", showSecondLayer).bind("input propertychange", function () {
            curr_time_arr[5] = $(this).find("input").val();
            writeDate();
        });
        //选中了一个
        datepicker.click(function (event) {
            var srcElement = $(event.target);
            if (srcElement.hasClass("disabled")) return false;
            var data = srcElement.text();
            if (srcElement.hasClass("tag_day")) {
                if (data <= 31 && data > 0) {
                    curr_time_arr[2] = data;
                    datepicker_iframe.hide();
                    writeDate();
                }
            }
            if (srcElement.hasClass("tag_year")) {
                var curr_year = curr_time_arr[0];  //首先保存当前年
                curr_time_arr[0] = data;   //吧全局的年份修改了
                if (data > curr_year) {
                    changeMainData("left");
                } if (data < curr_year) {
                    changeMainData("right");
                }
                datepicker.find(".title_year").text(data + model.commonlang[model.defaults.lang].title[0]);
                showYearLayer();
                writeDate();
            }
            if (srcElement.hasClass("tag_month")) {
                for (var i = 0; i < model.commonlang[model.defaults.lang].month.length; i++) {
                    if (model.commonlang[model.defaults.lang].month[i] == data) {
                        var curr_month = curr_time_arr[1];   //保存当前的月份
                        curr_time_arr[1] = i;  //修改全局月份
                        if (i > curr_month) {
                            changeMainData("left");
                        }
                        if (i < curr_month) {
                            changeMainData("right");
                        }
                        datepicker.find(".title_month").text(model.commonlang[model.defaults.lang].month[i] + model.commonlang[model.defaults.lang].title[3]);
                        showMonthLayer();
                        writeDate();
                    }
                }
            }
            if (srcElement.hasClass("tag_hover")) {
                if (data >= 0 && data <= 23) {
                    datepicker.find(".hour").val(data);
                    curr_time_arr[3] = data;
                    showHoverLayer();
                    writeDate();
                }
            }
            if (srcElement.hasClass("tag_minute")) {
                if (data >= 0 && data <= 55) {
                    datepicker.find(".minute").val(data);
                    curr_time_arr[4] = data;
                    showMinuteLayer();
                    writeDate();
                }
            }
            if (srcElement.hasClass("tag_second")) {
                if (data >= 0 && data <= 55) {
                    datepicker.find(".second").val(data);
                    curr_time_arr[5] = data;
                    showSecondLayer();
                    writeDate();
                }
            }
        });
        //4个按钮
        datepicker.find(".last_year").bind("click", lastYear);
        datepicker.find(".next_year").bind("click", nextYear);
        datepicker.find(".last_month").bind("click", lastMonth);
        datepicker.find(".next_month").bind("click", nextMonth);
    }
    function writeDate() {
        if (!curr_time_arr) {
            curr_time_arr = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        }
        var usedate = dateFormat(curr_time_arr, model.defaults.useFormat);
        var showdate = dateFormat(curr_time_arr, model.defaults.showFormat);
        that.val(showdate);
        that.attr("date-val", usedate);
    }
    //显示年份div
    function showYearLayer() {
        con_year.stop(); con_month.stop();
        //让year层在month层上面
        con_year.css({ "z-index": getMaxZIndex() + 1 });
        if (con_year.attr("flag") == "0") {   //flag=0;表示年div未显示
            var html = $(parseTemplate(template_year, model)).html();
            con_year.html(html);
            datepicker.find(".last_month,.next_month").addClass("disabled");
            datepicker.find(".last_year,.next_year").removeClass("disabled");
            con_year.animate({ top: "27px" }, dur, function () {
                con_month.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                hiddenTimePanel();
                con_year.attr("flag", "1");
            });
        } else {
            datepicker.find(".last_month,.next_month").removeClass("disabled");
            con_year.animate({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }, dur);
            con_year.attr("flag", "0");
        }
    }
    //显示月份div
    function showMonthLayer() {
        con_year.stop(); con_month.stop();
        con_month.css({ "z-index": getMaxZIndex() + 1 });  //让moth层在year层上面
        if (con_month.attr("flag") == "0") {   //flag=0;表示月div未显示
            var html = $(parseTemplate(template_month, model)).html();
            con_month.html(html);
            datepicker.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
            con_month.animate({ top: "27px" }, dur, function () {
                con_year.css({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }).attr("flag", "0");
                hiddenTimePanel();
                con_month.attr("flag", "1");
            });
        } else {
            datepicker.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
            con_month.animate({ top: "-" + parseInt(main_data_containter.css("height"), 10) + "px" }, dur);
            con_month.attr("flag", "0");
        }
    }
    //显示小时div
    function showHoverLayer() {
        con_hour.css("z-index", getMaxZIndex() + 1);
        if (con_hour.attr("flag") == "0") {
            var html = $(parseTemplate(template_hover, model)).html();
            con_hour.html(html);
            datepicker.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
            con_hour.animate({ bottom: "21px" }, dur, function () {
                $(this).attr("flag", "1");
                con_minute.css("bottom", "-176px").attr("flag", "0");
                con_second.css("bottom", "-176px").attr("flag", "0");
                hiddenDatePanel();
            });
        } else {
            datepicker.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
            con_hour.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
        }
    }
    //显示分钟div
    function showMinuteLayer() {
        con_minute.css("z-index", getMaxZIndex() + 1);
        if (con_minute.attr("flag") == "0") {
            var html = $(parseTemplate(template_minute, model)).html();
            con_minute.html(html);
            datepicker.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
            con_minute.animate({ bottom: "21px" }, dur, function () {
                $(this).attr("flag", "1");
                con_hour.css("bottom", "-176px").attr("flag", "0");
                con_second.css("bottom", "-176px").attr("flag", "0");
                hiddenDatePanel();
            });
        } else {
            datepicker.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
            con_minute.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
        }
    }
    function showSecondLayer() {
        con_second.css("z-index", getMaxZIndex() + 1);
        if (con_second.attr("flag") == "0") {
            var html = $(parseTemplate(template_second, model)).html();
            con_second.html(html);
            datepicker.find(".last_year,.next_year,.last_month,.next_month").addClass("disabled");
            con_second.animate({ bottom: "21px" }, dur, function () {
                $(this).attr("flag", "1");
                con_hour.css("bottom", "-176px").attr("flag", "0");
                con_minute.css("bottom", "-176px").attr("flag", "0");
                hiddenDatePanel();
            });
        } else {
            datepicker.find(".last_year,.next_year,.last_month,.next_month").removeClass("disabled");
            con_second.animate({ bottom: "-176px" }, dur, function () { $(this).attr("flag", "0") });
        }
    }
    //上一年
    function lastYear() {
        if ($(this).hasClass("disabled")) return;
        if (isYearDisplay()) {    //year层目前在展现
            showNextYear("right");
            return false;
        }
        --curr_time_arr[0];
        datepicker.find(".title_year").text(curr_time_arr[0] + model.commonlang[model.defaults.lang].title[0]);
        changeMainData("right");  //动画改变日期面板
    }
    //下一年
    function nextYear() {
        if ($(this).hasClass("disabled")) return;
        if (isYearDisplay()) {   //year层目前在展现
            showNextYear("left");
            return false;
        }
        ++curr_time_arr[0];
        datepicker.find(".title_year").text(curr_time_arr[0] + model.commonlang[model.defaults.lang].title[0]);
        changeMainData("left");  //动画改变日期面板
    }
    //上一月
    function lastMonth() {
        if ($(this).hasClass("disabled")) return;
        --curr_time_arr[1];
        if (curr_time_arr[1] < 0) {
            curr_time_arr[0]--;
            curr_time_arr[1] = 11;
            datepicker.find(".title_year").text(curr_time_arr[0] + model.commonlang[model.defaults.lang].title[0]);
        }
        //if (isMonthDisplay()) nextMonthDisplay("right");
        datepicker.find(".title_month").text(model.commonlang[model.defaults.lang].month[curr_time_arr[1]].substring(0, 6) + model.commonlang[model.defaults.lang].title[3]);
        changeMainData("right");//动画改变日期面板
    }
    //下一月
    function nextMonth() {
        if ($(this).hasClass("disabled")) return;
        ++curr_time_arr[1];
        if (curr_time_arr[1] > 11) {  //该跳到下一年了
            curr_time_arr[0]++;
            curr_time_arr[1] = 0;
            datepicker.find(".title_year").text(curr_time_arr[0] + model.commonlang[model.defaults.lang].title[0]);
        }
        //if (isMonthDisplay()) nextMonthDisplay("left");
        datepicker.find(".title_month").text(model.commonlang[model.defaults.lang].month[curr_time_arr[1]].substring(0, 6) + model.commonlang[model.defaults.lang].title[3]);
        changeMainData("left");
    }
    function showNextYear(direction) {
        if (direction == "left") {
            model.start_disp_year += 16;
            con_year = $(parseTemplate(template_year, model)).css({ "left": datepicker.css("width"), "top": "27px" });
            if (needAddHeight()) con_year.addClass("mainyear_height1");
            datepicker.append(con_year);
            var year_containter = datepicker.find(".datepicker_year_layer");  //获取2个year层
            //去掉原来的
            year_containter.filter("[flag=1]").animate({ left: "-" + datepicker.css("width") }, dur, function () {
                $(this).remove();
            });
            //添加新的
            year_containter.filter("[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
        } else {
            model.start_disp_year -= 16;
            con_year = $(parseTemplate(template_year, model)).css({ "right": datepicker.css("width"), "top": "27px" });
            if (needAddHeight()) con_year.addClass("mainyear_height1");
            datepicker.append(con_year);
            var year_containter = datepicker.find(".datepicker_year_layer");  //获取2个year层
            year_containter.filter("[flag=1]").animate({ right: "-" + datepicker.css("width") }, dur, function () {
                $(this).remove();
            });
            year_containter.filter("[flag=0]").animate({ right: 0 }, dur).attr("flag", "1");
        }
    }
    //改变主日期面板,direction=动画方向
    function changeMainData(direction) {
        var datepicker_width = datepicker.css("width");  //主日期框宽度(数据面板的偏移量)
        var dataEle = $(parseTemplate(template_data, model)); //创建
        //在改变日期数据面板时,每个月天数不一样,有可能高度发生变化
        changeHeight();
        if (direction == "left") {
            dataEle.css({ left: datepicker_width }).attr("flag", "0");  //创建日期数据主面板element
            main_data_containter.append(dataEle);  //吧日期主面板加入父容器,这时连同以前一个数据面板，一共有2个数据面板
            var containter = datepicker.find(".datepicker_data_containter");   //获取这2个数据面板
            //2个面板一同移动
            containter.filter("[flag=1]").animate({ left: "-" + datepicker_width }, dur, function () {
                $(this).remove();
            });
            containter.filter("[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
        }
        if (direction == "right") {
            dataEle.css({ left: "-" + datepicker_width }).attr("flag", "0");
            main_data_containter.append(dataEle);
            var containter = datepicker.find(".datepicker_data_containter");
            containter.filter("[flag=1]").animate({ left: datepicker_width }, dur, function () {
                $(this).remove();
            });
            containter.filter("[flag=0]").animate({ left: 0 }, dur).attr("flag", "1");
        }
    }
    function changeHeight() {
        if (needAddHeight()) {
            datepicker.addClass("add_cal_len1");
            if (has_time) {
                datepicker.addClass("add_cal_len3");
            }
            main_data_containter.addClass("add_main_date_len1");
            con_year.addClass("mainyear_height1");
            con_month.addClass("mainmonth_height1");
        } else {
            datepicker.removeClass("add_cal_len1");
            if (has_time) {
                datepicker.removeClass("add_cal_len3");
                datepicker.addClass("add_cal_len2");
            }
            main_data_containter.removeClass("add_main_date_len1");
            con_year.removeClass("mainyear_height1");
            con_month.removeClass("mainmonth_height1");
        }
        datepicker_iframe.height(datepicker.height() + 2);
    }
    function getTemplate() {
        if (template != "") return template;
        $.ajax({
            type: "get",
            url: template_src,
            async: false,
            success: function (data) {
                template = data;
            }
        });
        template_data = template_data_regex.exec(template)[1];
        template_year = template_year_regex.exec(template)[1];
        template_month = template_month_regex.exec(template)[1];
        template_hover = template_hover_regex.exec(template)[1];
        template_minute = template_minute_regex.exec(template)[1];
        template_second = template_second_regex.exec(template)[1];
        return template;
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
    //是否需要增加日期框高度
    function needAddHeight() {
        var days_week_obj = getMonthDays(curr_time_arr[0], curr_time_arr[1]);  //对象包含当月的天数，第一天周几？
        if (days_week_obj.days == 30 && days_week_obj.first_day_week == 6) return true;
        if (days_week_obj.days == 31 && (days_week_obj.first_day_week == 5 || days_week_obj.first_day_week == 6)) return true;
        return false;
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
    function dateFormat(time_arr, format) {                //格式化日期 time_arr=数组,往界面输出 格式化后的日期
        var realMonth = time_arr[1];
        if (model.commonlang)
            format = format.replace(/([Mm]onth)/, model.commonlang[model.defaults.lang].month[realMonth]);
        else {
            format = format.replace(/([Mm]onth)/, commonlang[defaults.lang].month[realMonth]);
        }
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
    //获取year层的起始
    function getStartDispYear(curr_year) {
        return start_disp_year = Math.floor(curr_year / 16) * 16;
    }
    //根据年月获取该月的天数,第一天周几
    function getMonthDays(year, month) {
        var days = new Date(year, month + 1, 0).getDate();  //当前月的天数
        var first_day_week = new Date(year, month, 1).getDay();   //第一天周几
        return { days: days, first_day_week: first_day_week };
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
        return false;
    }
    //判断给的的天是否周末
    function isWeekend(day) {
        var weekday = new Date(curr_time_arr[0], curr_time_arr[1], day).getDay();
        if (weekday == 6 || weekday == 0) return true;
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
    //把模板解析成字符串
    function parseTemplate(html, model) {
        html = html.replace(/[\r\n]/g, "").replace(/'/g, "\\'");
        var splitRegex = /<%=(.+?)%>|<%([^=]([^%]|\n)*)%>/g,
            code = "var p = [] ;\n",
            cursor = 0,
            match = splitRegex.exec(html);
        while (match) {
            code += "p.push('" + html.slice(cursor, match.index) + "');\n";
            cursor = match.index + match[0].length;
            code += match[1] ? "p.push(" + match[1] + ");\n" : match[2] + ";\n";
            match = splitRegex.exec(html);
        }
        code += "p.push('" + html.slice(cursor) + "');\n;return p.join(\'\')";
        var fn = new Function("model", code);
        return fn(model);
    }
})(window, jQuery);