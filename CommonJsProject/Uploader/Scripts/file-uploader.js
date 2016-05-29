/// <reference path="jquery-1.7.1.js" />

(function (window, jQuery) {
    jQuery.fn.extend({
        Uploader: function (options) {
            var defaults = {
                maxSize: 50 * 1024 * 1024, //文件最大限制
                url: "/file/uploadfile",    //上传文件的url
                delurl: "/file/deletefile"   //文件删除的url
            };
            options = options || {};
            defaults.maxSize = options.maxSize || defaults.maxSize;
            var fileList = [],     //保存文件列表
                uploadedFileIds = [],  //上传完成后的文件id
                uploaderControl = $(this),
                fileInput = initFileInput(uploaderControl);
            fileInput.change(
                {
                    fileInput: fileInput,
                    uploadedFileIds: uploadedFileIds,
                    fileList: fileList,
                    uploaderControl: uploaderControl,
                    defaults: defaults
                },
                showFiles);
        }
    });

    function initFileInput(uploaderControl) {
        var fileInput = $("#hidden_file_input");
        if (fileInput.length < 1) {                 //如果页面上没有文本上传框,就添加
            fileInput = $("<input type=\"file\" multiple=\"multiple\" id=\"hidden_file_input\" style=\"visibility: hidden; position: absolute; top: -100px; left: -100px; height: 0px; width: 0px;\">");
            $("body").append(fileInput);
        }
        //把srcEle的点击事件传递到fileInput
        uploaderControl.click(function () {
            fileInput.click();
        });
        return fileInput;
    }
    //在界面上显示已选择的文件
    function showFiles(event) {
        var fileInput = event.data.fileInput[0],
            fileList = event.data.fileList, //内存中的文件列表
            uploadedFileIds = event.data.uploadedFileIds,  //上传完成后的文件id
            uploaderControl = event.data.uploaderControl,
            defaults = event.data.defaults,
            filesWarp = uploaderControl.siblings(".upload-file-list");
        if (filesWarp.length === 0) {
            filesWarp = $("<div class=\"upload-file-list\" ><input type=\"hidden\" name=\"uploadedFiles\" id=\"uploadedFiles\"/></div>");
            uploaderControl.after(filesWarp);
        }
        var filesDiv = "";
        if (fileInput.files.length < 1) return;
        for (var i = 0; i < fileInput.files.length; i++) {
            var file = fileInput.files[i];
            //把file封装成对象,upload,false:未上传,true:已上传
            var fileObject = { file: file, upload: false, maxLength: false };
            if (file.size > defaults.maxSize) {
                fileObject.maxLength = true;
            }
            if (!fileList.contains(fileObject)) {
                fileList.push(fileObject);
                var uploadTip = fileObject.maxLength ?
                    "文件大小超过" + (defaults.maxSize / 1024 / 1024) + "M" :
                    "等待上传";
                filesDiv += "<div class=\"file uploading\" index=\"" + fileList.length + "\">" +
                                "<a class=\"filename\">" + file.name + "</a> " +
                                "<span class=\"filesize\">(" + (file.size / 1024 / 1024).toFixed(2) + "M)</span> " +
                                "<span class=\"fileprogress\">" + uploadTip + "</span> " +
                                "<a class=\"filedel\">删除</a>" +
                            "</div>";
            }
        }
        filesWarp.append(filesDiv);
        filesWarp.find(".filedel").off().click(
            {
                fileList: fileList,
                uploadedFileIds: uploadedFileIds,
                filesWarp: filesWarp,
                defaults: defaults
            },
            delFile);  //添加删除事件

        fileUpload(fileList, uploadedFileIds, filesWarp, defaults);
        fileInput.value = "";  //清空界面上fileInput对象的值
        showFileList(fileList); //测试

    }

    function showFileList(fileList) {
        $("#txt").html("");
        for (var i = 0; i < fileList.length; i++) {
            var fileObject = fileList[i];
            $("#txt").append(fileObject.file.name + "." + fileObject.upload + "<br>");
        }
    }
    //上传
    function fileUpload(fileList, uploadedFileIds, filesWarp, defaults) {
        for (var i = 0; i < fileList.length; i++) {
            //文件过大
            if (fileList[i].maxLength) {
                $(filesWarp.children(".file")[i]).removeClass("uploading").addClass("error");
                continue;
            }
            if (!fileList[i].upload) {
                //上传对象
                var xhr = new XMLHttpRequest();
                //将当前正在上传的文件dom对象保存到 xhr.upload 对象中
                xhr.upload.fileDom = xhr.fileDom = filesWarp.children(".file")[i];
                //构建表单对象
                var formData = new FormData();
                //添加数据,并将状态改为已上传
                formData.append("file", fileList[i].file);
                fileList[i].upload = true;
                //上传进度事件
                xhr.upload.onprogress = function (event) {
                    var target = (event.srcElement || event.target);
                    onProgress(event.loaded, event.total, target.fileDom); //从xhr.upload对象中取出 文件dom对象
                }
                //上传完成事件
                xhr.onload = function (event) {
                    var target = event.srcElement || event.target;
                    onComplete(JSON.parse(target.responseText), target.fileDom, uploadedFileIds);
                }
                //上传失败
                xhr.onerror = function (event) {
                    var target = event.srcElement || event.target;
                    onError(target.fileDom);
                }
                xhr.open("post", defaults.url);
                xhr.send(formData);
            }
        }
    }
    //上传进度
    function onProgress(loaded, total, fileDom) {
        var percent = (loaded / total * 100).toFixed() + "%";
        $(fileDom).children(".fileprogress").html(percent);
    }
    //上传完成
    function onComplete(response, fileDom, uploadedFileIds) {
        var $file = $(fileDom);  //界面上的文件对象
        $file.removeClass("uploading");
        if (response.code == 0) { //上传成功
            uploadedFileIds.push(response.result);
            $file.parent().find("#uploadedFiles").val(uploadedFileIds);
            $file.attr("fileid", response.result).addClass("uploaded");
            $file.find(".fileprogress").html("");
        } else {
            $file.addClass("error");
            $file.find(".fileprogress").html(response.msg);
        }
    }
    //上传失败
    function onError(fileDom) {
        var $file = $(fileDom);  //界面上的文件对象
        $file.removeClass("uploading").addClass("error").find(".fileprogress").html("文件上传失败,网络异常!");
    }
    //删除文件
    function delFile(event) {
        var fileList = event.data.fileList,
            uploadedFileIds = event.data.uploadedFileIds,
            filesWarp = event.data.filesWarp,
            defaults = event.data.defaults,
            delFileDom = $(this).parent(),
            delIndex = parseInt(delFileDom.attr("index"), 10),
            fileid = delFileDom.attr("fileid");
        if (delFileDom.hasClass("uploading")) return;  //上传过程中,不准删除
        if (fileid) {
            var form_data = new FormData(),
                xhr = new XMLHttpRequest(); //请求对象
            form_data.append("id", fileid);
            xhr.onload = function (event) {
                var target = event.target || event.srcElement;
                //删除成功
                if (JSON.parse(target.responseText).code == 0) {
                    uploadedFileIds.removeItem(fileid);
                    //修改文本框的值
                    delFileDom.parent().find("#uploadedFiles").val(uploadedFileIds);
                    //删除内存中文件对象
                    fileList.splice(delIndex - 1, 1);
                    //删除dom节点
                    delFileDom.remove();
                    //重建dom节点的顺序
                    reSortFileList(filesWarp);
                } else {
                    delFileDom.find(".fileprogress").html(JSON.parse(target.responseText).msg);
                }
                showFileList(fileList); //测试
            }
            xhr.onerror = function (event) {
                delFileDom.find(".fileprogress").html("删除失败,网络错误!");
            }
            xhr.open("post", defaults.delurl);
            xhr.send(form_data);
        } else {
            fileList.splice(delIndex - 1, 1); //删除内存中文件对象
            delFileDom.remove(); //删除dom节点
            reSortFileList(filesWarp); //重建dom节点的顺序
            showFileList(fileList); //测试
        }
    }
    function reSortFileList(filesWarp) {
        var domFileList = filesWarp.children(".file");
        for (var i = 0; i < domFileList.length; i++) {
            var fileDom = $(domFileList[i]);
            fileDom.attr("index", i + 1);
        }
    }
    Array.prototype.removeItem = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == item) {
                this.splice(i, 1);
            }
        }
    }
    Array.prototype.contains = function (fileObject) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].file.name === fileObject.file.name) {
                return true;
            }
        }
    }

})(window, jQuery)