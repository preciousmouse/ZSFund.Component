/**
* 时间对象的格式化
*/
Date.prototype.format = function (format) {
    /*
    * format="yyyy-MM-dd hh:mm:ss";
    */
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4
            - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
};
/**
    * String的扩展方法IndexOf，为了和C#兼容
    */
String.prototype.IndexOf = function (str) {
    return this.indexOf(str);
};
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
var Common = /** @class */ (function () {
    function Common() {
    }
    /**
     * 获取随机数(1-n之间的一个整数)
     */
    Common.GetRandom = function (n) {
        return Math.floor(Math.random() * n + 1);
    };
    /**
     * 给一个url加上一个随机字符串
     * @param url Url
     */
    Common.AddRandom = function (url) {
        return url + (url.indexOf("?") >= 0 ? "&" : "?") + Common.GetRandom(1000);
    };
    /**
     * 从给定的url中，得到参数为name的值
     * @param url
     * @param name
     */
    Common.GetParam = function (url, name) {
        var reg = new RegExp("(^|[&\\u003F])" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象, \\u003F是问号的转义
        var r = url.match(reg); //匹配目标参数
        if (r != null)
            return decodeURIComponent(r[2]);
        return null; //返回参数值
    };
    /**
     * 得到Url中的参数
     * @param name 参数名
     */
    Common.GetUrlParam = function (name) {
        return Common.GetParam(window.location.search.substr(1), name);
    };
    /**
     * 从hash中得到参数
     */
    Common.GetHashParam = function (name) {
        return Common.GetParam(window.location.hash.substr(1), name);
    };
    /**
     * 设置标签
     * @param bookmarkContent 标签内容
     */
    Common.SetBookmark = function (bookmarkContent) {
        var bookmarkString = "";
        for (var name in bookmarkContent) {
            bookmarkString += (bookmarkString == "" ? "" : "&") + name + "=" + encodeURIComponent(bookmarkContent[name]);
        }
        var bookmark = $("<a href='#" + bookmarkString + "'><span></span></a>"); //记录位置
        $(document.body).append(bookmark);
        $("span", bookmark).trigger("click");
        bookmark.remove();
    };
    /**
     * 调用一个WebApi
     * @param url
     * @param method
     * @param errMsg
     * @param data  当method为post时有效
     * @param async
     * @param func  当async为true时有效
     */
    Common.InvokeWebApi = function (url, method, errMsg, data, async, func) {
        if (data === void 0) { data = null; }
        if (async === void 0) { async = false; }
        if (func === void 0) { func = null; }
        var result = "";
        var a = $.ajax({
            url: url,
            type: method,
            async: async,
            cache: false,
            contentType: method == "POST" ? "application/json" : method == "DELETE" ? "application/x-www-form-urlencoded" : undefined,
            data: method == "POST" ? JSON.stringify(data) : data,
            //contentType: method == "DELETE" ? "application/x-www-form-urlencoded" : undefined,
            //data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (async) {
                    if (func != null) {
                        func(data);
                    }
                }
                else {
                    result = data;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                result = "error: " + errMsg + errorThrown;
                console.log(jqXHR, textStatus, errorThrown);
            }
        });
        return result;
    };
    /**
     * 将页面滚动到最上方
     */
    Common.SmoothScroll = function () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(Common.SmoothScroll);
            window.scrollTo(0, currentScroll - (currentScroll / 5));
        }
    };
    return Common;
}());
//# sourceMappingURL=Common.js.map