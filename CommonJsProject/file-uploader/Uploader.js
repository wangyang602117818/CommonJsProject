/// <reference path="../jquery-1.7.1.min.js" />
/// <reference path="spark-md5.js" />
//Jquery插件（使用html5），文件MD5分析（spark-md5.js）和文件上传.
//options={md5Url:"/home/Md5",uploadUrl:"/home/Uploader",md5Progress:function(i,currentChunk,chunks){},uploadProgress:function(i,currentChunk,chunks){},uploadComplete:function(i){}}
jQuery.fn.Uploader = function (options) {
    //默认配置
    var defaults = {
        chunkSize: 2 * 1024 * 1024, //文件每块分割2M，计算分割详情(分析MD5时使用)
        maxFileSize: 50 * 1024 * 1024,  //单个文件最大限制50m
        md5: false, //是否要分析文件MD5
        md5Url: "",  //查询MD5url，注意分析MD5是在前台分析的，此url只提供查询该MD5在后台是否存在
        uploadUrl: "",  //上传文件用到的url；
        md5Progress: function (i, currentChunk, chunks) { },   //md5分析时候循环调用，以显示进度
        uploadProgress: function (i, currentChunk, chunks) { },        //上传文件时候循环调用，以显示进度
        uploadComplete: function (i) { }                       //上传文件完成后调用
    };
    init(options);
    var spark = new SparkMD5.ArrayBuffer(), //计算MD5专用对象
        blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice, //文件分割方法
        that = this,  //指点击的对象dom
        file_input = fileInput();   //文件上传框对象
    this.click(function () { file_input.click(); event.stopPropagation(); });
    file_input.change({ file_input: file_input }, selectFiles);
    //初始化默认参数
    function init(options) {
        options = options || {};
        defaults.chunkSize = options.chunkSize || defaults.chunkSize;
        defaults.md5Url = options.md5Url || defaults.md5Url;
        defaults.uploadUrl = options.uploadUrl || defaults.uploadUrl;
        defaults.md5Progress = options.md5Progress || defaults.md5Progress;
        defaults.uploadProgress = options.uploadProgress || defaults.uploadProgress;
        defaults.uploadComplete = options.uploadComplete || defaults.uploadComplete;
        if (options.md5Url) defaults.md5 = true;
    }
    //初始化file_input对象
    function fileInput() {
        file_input = $("#hidden_file_input");
        if (file_input.length < 1) {                 //如果页面上没有文本上传框,就添加
            file_input = $("<input type=\"file\" multiple=\"multiple\" id=\"hidden_file_input\" style=\"visibility: hidden; position: absolute; top: -100px; left: -100px; height: 0px; width: 0px;\">");
            $("body").append(file_input);
        }
        return file_input;
    }
    //选择了一个或一批文件(入口)
    function selectFiles(event) {
        var file_list = event.data.file_input[0].files; //要计算的文件集合 file_input[0]:dom对象
        for (var i = 0; i < file_list.length; i++) {
            displayFiles(i, file_list[i]);     //在页面展示文件列表
        }
        for (var i = 0; i < file_list.length; i++) {
            //if (file_list[i].size > defaults.maxFileSize) {
            //    fileTooBig(i);
            //    continue;
            //}
            defaults.md5 ? computeMd5(i, file_list) : uploadFile(i, file_list[i]); //分别上传文件
        }
        event.data.file_input.val("");
    }
    //展示文件列表
    function displayFiles(i, file) {
        var message_container_id = $(that).attr("class") + "_message",  //显示文件详情的div id
            message_file_name = $(that).attr("class") + "_message_name" + i,  //文件名 id
            message_file_progress = $(that).attr("class") + "_message_progress" + i;  //进度 id
        var message_container = $("." + message_container_id);
        var file_div = $("<div class=\"" + message_container_id + "_detail" + i + "\"><span class=\"" + message_file_name + "\">" + file.name + "</span> <span class=\"" + message_container_id + "_size" + i + "\">(" + (file.size / 1024 / 1024).toFixed(2) + "M)</span> <span class=\"" + message_file_progress + "\">0%</span></div>");
        message_container.append(file_div);
    }
    //计算MD5
    function computeMd5(index, fileList) {
        if (typeof FileReader == "undefined") return;
        var fileReader = new FileReader(),
            currentChunk = 0,
            chunks = Math.ceil(fileList[index].size / defaults.chunkSize),
            file = fileList[index];
        fileReader.onload = function (e) {
            spark.append(e.target.result);
            currentChunk++;
            defaults.md5Progress(index, currentChunk, chunks);  //MD5分析的进度
            if (currentChunk < chunks) {
                loadNext(fileReader, file, currentChunk);
            } else {
                md5Request(index, spark.end());  //查询MD5
            }
        };
        loadNext(fileReader, file, currentChunk);
    }
    function loadNext(fileReader, file, currentChunk) {
        var start = currentChunk * defaults.chunkSize,
            end = start + defaults.chunkSize >= file.size ? file.size : start + defaults.chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    //到给出的url查询文件是否存在
    function md5Request(index, code) {
        $.get(defaults.md5Url, { "code": code }, function (data) {
            
        });
    }
    function uploadFile(i, file) {
        var form_data = new FormData(),
            xhr = new XMLHttpRequest(), //上传对象
            j = i;
        form_data.append("file", file);
        //上传进度
        xhr.upload.onprogress = function (event) { defaults.uploadProgress(j, event.loaded, event.total); };
        //上传完成
        xhr.onload = function (event) { defaults.uploadComplete(j, $.parseJSON(event.target.responseText)); };

        //xhr.addEventListener("error", uploadFailed, false);
        //xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open("post", defaults.uploadUrl);
        xhr.send(form_data);
    }
    //页面上移除文件
    window.fileRemove = function (i) {
        var detail_id = $(that).attr("class") + "_message_detail" + i;
        $("#" + detail_id).remove();
    };
    //文件过大怎么显示
    function fileTooBig(i) {  //sp1_message_progress0
        var message_id = $(that).attr("class") + "_message_progress" + i;
        $("." + message_id).html("<a href=\"javascript:fileRemove(" + i + ")\" title=\"文件超过(" + (defaults.maxFileSize / 1024 / 1024).toFixed(2) + "M)\">删除</a>");
    }
}