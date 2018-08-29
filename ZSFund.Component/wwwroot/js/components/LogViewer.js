var LogViewer = /** @class */ (function () {
    function LogViewer() {
        this.vm = null;
    }
    LogViewer.prototype.Init = function () {
        var _this = this;
        this.vm = new Vue({
            el: "#app",
            data: {
                baseUrl: "http://logservice",
                logForm: {
                    dateRange: [],
                    source: null,
                    type: null,
                    type2: null,
                    level: null,
                    title: null,
                    loginName: null,
                    priority: null
                },
                sourceOptions: [],
                typeOptions: [],
                type2Options: [],
                levelOptions: {
                    I: "信息",
                    W: "警告",
                    E: "错误"
                },
                currentPage: 1,
                pageSize: 10,
                pageSizes: [10, 20, 50, 100],
                totalSize: 200,
                logTable: [],
            },
            methods: {
                handleFilter: function () {
                    _this.getLogTable(_this.getFormObj());
                },
                handlePageChange: function (index) {
                },
                handleSizeChange: function (size) {
                }
            }
        });
        this.loadLists();
    };
    /**
     * 将sub添加合并到obj中,存在的元素会进行覆盖
     * @param obj
     * @param sub
     */
    LogViewer.prototype.addSubObj = function (obj, sub) {
        obj = $.extend(true, {}, obj); //深拷贝
        for (var key in sub) {
            obj[key] = sub[key];
        }
        return obj;
    };
    /**
     * 过滤null和undefined属性
     * @param obj
     */
    LogViewer.prototype.filterNull = function (obj) {
        var res = {};
        for (var i in obj) {
            if (obj[i] === null || obj[i] === undefined || obj[i] === "") { }
            else {
                res[i] = obj[i];
            }
        }
        return res;
    };
    /**
     * 加载AppSource、LogType、LogType2三个option列表
     */
    LogViewer.prototype.loadLists = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/Log/AppSource";
        Common.InvokeWebApi(url, "GET", "", null, true, function (data) {
            _this.vm.$data.sourceOptions = data;
        });
        url = this.vm.$data.baseUrl + "/api/Log/LogType";
        Common.InvokeWebApi(url, "GET", "", null, true, function (data) {
            _this.vm.$data.typeOptions = data;
        });
        url = this.vm.$data.baseUrl + "/api/Log/LogType2";
        Common.InvokeWebApi(url, "GET", "", null, true, function (data) {
            _this.vm.$data.type2Options = data;
        });
        var date = new Date().toLocaleDateString();
        this.vm.$data.logForm.dateRange = [date, date];
    };
    /**
     * 获取当前请求参数
     */
    LogViewer.prototype.getFormObj = function () {
        var data = this.vm.$data;
        var obj = {
            pageCount: data.pageSize,
            pageIndex: data.currentPage,
            startDate: data.logForm.dateRange[0],
            endDate: data.logForm.dateRange[1],
            appSource: data.logForm.source,
            logTitle: data.logForm.title,
            logType: data.logForm.type,
            logType2: data.logForm.type2,
            logLevel: data.logForm.level,
            priority: data.logForm.priority,
            loginName: data.logForm.loginName,
            isDescending: true,
        };
        return this.filterNull(obj);
    };
    /**
     * 调用api请求table数据
     * @param obj 请求参数
     */
    LogViewer.prototype.getLogTable = function (obj) {
        var _this = this;
        var url = Common.GetUrl(this.vm.$data.baseUrl + "/api/Log/Filter", obj);
        Common.InvokeWebApi(url, "GET", "", null, true, function (data) {
            _this.vm.$data.totalSize = data.totalCount;
            _this.vm.$data.logTable = data.items;
        });
    };
    return LogViewer;
}());
//# sourceMappingURL=LogViewer.js.map