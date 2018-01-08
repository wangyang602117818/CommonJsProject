(function ($) {
    $.fn.orgChart = function () {
        var that = this;
        var depth = 0;
        appendTableHtml(that.find("ul:first"), that);
        function appendTableHtml($ul, container) {
            var tableHtml = "";
            if (chartType() == "pc") {
                tableHtml = getChildNodePc($ul.find("li:first"));
            } else {
                tableHtml = getChildNodeMobile($ul.find("li:first"), 1);
            }
            container.append(tableHtml);
            changeMobileWidth();
        }
        function getChildNodePc(topLi) {
            var tableHtml = '<table class="pc" cellspacing="0" cellpadding="0" border="0"><tbody>';
            var dataNode = topLi.find("div:first"),
                childNodeLiArray = topLi.find("ul:first").children("li");
            if (childNodeLiArray.length == 0) {
                return tableHtml + "<tr><td>" + dataNode[0].outerHTML + "</td></tr></tbody></table>";
            } else {
                var topHtml = '<tr><td colspan="' + childNodeLiArray.length * 2 + '">' + dataNode[0].outerHTML + "</td></tr>";
                var lineHtml = '<tr><td colspan="' + childNodeLiArray.length * 2 + '"><span class="line_down">&nbsp;</span></td>',
                 orgLineHtml = "<tr class=\"org_line\">", orgDataHtml = "<tr>";
                if (childNodeLiArray.length == 1) {
                    orgLineHtml += '<td class="trans_right">&nbsp;</td>';
                    orgLineHtml += '<td class="left">&nbsp;</td>';
                } else {
                    for (var i = 0; i < childNodeLiArray.length * 2; i++) {
                        if (i == 0) { //第一行
                            orgLineHtml += '<td class="trans_right">&nbsp;</td>';
                        } else {
                            if (i + 1 == childNodeLiArray.length * 2) {  //最后一行
                                orgLineHtml += '<td class="trans_left">&nbsp;</td>';
                            } else {
                                if (i == childNodeLiArray.length * 2 - 2) {
                                    orgLineHtml += '<td class="top right">&nbsp;</td>';
                                } else {
                                    if (i % 2 == 1) orgLineHtml += '<td class="top left">&nbsp;</td>';
                                    if (i % 2 == 0) orgLineHtml += '<td class="top trans_right">&nbsp;</td>';
                                }
                            }
                        }
                    }
                }
                for (var i = 0; i < childNodeLiArray.length; i++) {
                    var subHtml = getChildNodePc($(childNodeLiArray[i]));
                    orgDataHtml += '<td colspan="2">' + subHtml + '</td>';
                }
                orgLineHtml += '</tr>';
                lineHtml += '</tr>';
                orgDataHtml += '</tr>';
                return tableHtml + topHtml + lineHtml + orgLineHtml + orgDataHtml + "</tbody></table>";
            }
        }
        function getChildNodeMobile(topLi, k) {
            if (k > depth) depth = k;
            var tableHtml = '<table class="mobile" cellspacing="0" cellpadding="0" border="0"><tbody>';
            var dataNode = topLi.find("div:first"),
                childNodeLiArray = topLi.find("ul:first").children("li");
            tableHtml += '<tr><td colspan="2">' + dataNode[0].outerHTML + '</td><td class="org_line_width"></td><td>&nbsp;</td></tr>';
            for (var i = 0; i < childNodeLiArray.length; i++) {
                tableHtml += '<tr class="org_line_height"><td class="trans_right"></td><td class="left"></td><td></td><td></td></tr>';
                var dataNodeSub = $(childNodeLiArray[i]).find("div:first");
                var liNumbs = $(childNodeLiArray[i]).find("li");
                if (liNumbs.length == 0) {
                    tableHtml += '<tr><td class="trans_right">&nbsp;</td><td class="left bottom">&nbsp;</td><td class="bottom"></td><td rowspan="2">' + dataNodeSub[0].outerHTML + '</td></tr>';
                    if (i == childNodeLiArray.length - 1) {
                        tableHtml += '<tr><td></td><td>&nbsp;</td><td>&nbsp;</td></tr>';
                    } else {
                        tableHtml += '<tr><td class="trans_right"></td><td class="left">&nbsp;</td><td>&nbsp;</td></tr>';
                    }
                } else {
                    for (var j = 0; j < (liNumbs.length + 1) * 2; j++) {
                        if (j == 0) {
                            tableHtml += '<tr><td class="trans_right">&nbsp;</td><td class="left bottom">&nbsp;</td><td class="bottom">&nbsp;</td><td rowspan="' + (liNumbs.length + 1) * 2 + '">' + getChildNodeMobile($(childNodeLiArray[i]), k + 1) + '</td></tr>';
                        } else if ((i == childNodeLiArray.length - 1) && (j > 0)) {
                            tableHtml += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
                        }
                        else {
                            tableHtml += '<tr><td class="trans_right">&nbsp;</td><td class="left">&nbsp;</td><td>&nbsp;</td></tr>';
                        }
                    }
                }
            }
            tableHtml += '</tbody></table>';
            return tableHtml;
        }
        function isPc() {
            var userAgentInfo = navigator.userAgent;
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
            }
            return flag;
        }
        function chartType() {
            if (isPc() && $(window).width() >= 800) {
                return "pc";
            } else {
                return "mobile";
            }
        }
        function changeMobileWidth() {
            var widow_width = $(window).width();
            var node_width = that.find("table .node:first").width();
            var line_width = that.find("table .org_line_width:first").width();
            var new_line_width = (widow_width - node_width * (depth+1)) / (depth);
            that.find("table .org_line_width").width(new_line_width);
        }
        function windowResize() {
            var topUl = that.find("ul:first");
            //var version = that.find("table").attr("class");
            //if ($(window).width() <= 800 && version == "pc") {
            //    that.find("table").remove();
            //    appendTableHtml(topUl, that);
            //}
            //if ($(window).width() > 800 && version == "mobile") {
            //    that.find("table").remove();
            //    appendTableHtml(topUl, that);
            //}
            that.find("table").remove();
            appendTableHtml(topUl, that);
            if (chartType() == "mobile") {
                changeMobileWidth();
            }
        }
        $(window).resize(function () {
            windowResize();
        });
    }
})($);