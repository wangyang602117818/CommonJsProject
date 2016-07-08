(function (window, $) {
    var DatePicker = function (element, option) {
        this.defaults = {
            format: "dd Month yyyy", //界面展示的格式 yyyy-MM-dd|yyyy/MM/dd|19 May 2016 02:10:23(dd Month yyyy hh:mm:ss)
            start: "2000-01-01 00:00:00",  //start: new Date(),
            end: "2100-12-31 00:00:00",        //end: new Date().addYear(1)
            useFormat: "yyyy-MM-dd",               //与程序交互的时间格式
            //验证文本框的日期值,是否有时间
            timeval_regex: /\d{1,2}:(\d{1,2})?(:\d{1,2})?/,
            //作验证日期格式是否有时间
            time_regex: /[Hh]{1,2}:([Mm]{1,2})?(:[Ss]{1,2})?/,
            //提取文本框的日期,针对中国时间
            date_val_regex: /(\d{2,4})(?:[/-])?(\d{1,2})?(?:[/-])?(\d{1,2})?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/,
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
            date: new Date(),
            curr_time_arr: [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()],         //文本框中的日期
            text_time_arr: null,          //保存选中日期
            start_time_arr: null,        //时间范围限制
            end_time_arr: null,          //时间范围限制
            dur: 300,                   //动画速度
            start_disp_year: null,     //year层的起始年
            has_time: false,           //
            user_set_format: false,  //标记用户设置了格式没有
            element: element

        };
        this.dataContainer = {
            datepicker: null,
            title_containter: null,
            time_containter: null,
            main_data_containter: null,
            year_layer: null,
            month_layer: null,
            hour_layer: null,
            minute_layer: null,
            second_layer: null
        }
    }


})(window, $);