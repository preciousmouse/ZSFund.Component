var _this = this;
/**
 * Api请求帮助类
 */
var AjaxHelper = /** @class */ (function () {
    function AjaxHelper() {
    }
    /**
     * 基础请求
     * @param url 地址
     * @param param 参数
     * @param callbackfunc 成功回调函数
     * @param showProgressBar 是否显示ProgressBar
     */
    AjaxHelper.prototype.RequestData = function (url, param, callbackfunc) {
        var _this = this;
        if (callbackfunc === void 0) { callbackfunc = null; }
        var result = "";
        $.get({
            url: this.AddRandom(url + "?" + encodeURI(param)),
            //method: method,
            //async: async,
            cache: false,
            //contentType: method == "POST" ? "application/json-patch+json" : undefined,
            //data: JSON.stringify(data),
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                result = data;
                if (callbackfunc != null) {
                    callbackfunc.call(_this, data);
                    return;
                }
                return result;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                result = "error: " + errorThrown;
            }
        });
    };
    AjaxHelper.prototype.PostData = function (url, data, callbackfunc) {
        if (callbackfunc === void 0) { callbackfunc = null; }
        $.post(url, data, function (data, status) {
            if (status != "success") {
                alert(status);
                return;
            }
            if (data.errorString != null) {
                alert(data.errorString);
                return;
            }
            if (callbackfunc != null) {
                callbackfunc(data);
                return;
            }
        }).fail(function (data) {
            alert("网络错误，请联系系统管理员");
        });
    };
    AjaxHelper.prototype.AddRandom = function (url) {
        return url + (url.indexOf("?") >= 0 ? "&" : "?") + this.GetRandom(1000);
    };
    AjaxHelper.prototype.GetRandom = function (n) {
        return Math.floor(Math.random() * n + 1);
    };
    return AjaxHelper;
}());
var OrgBasePara = /** @class */ (function () {
    function OrgBasePara() {
        var OrgUnitType;
        (function (OrgUnitType) {
            OrgUnitType[OrgUnitType["User"] = 1] = "User";
            //Group = 2,
            //Post = 4,
            OrgUnitType[OrgUnitType["Department"] = 8] = "Department";
            //Company = 16,
            OrgUnitType[OrgUnitType["All"] = 255] = "All";
        })(OrgUnitType || (OrgUnitType = {}));
        var OrgSelectType;
        (function (OrgSelectType) {
            OrgSelectType[OrgSelectType["Employee"] = 1] = "Employee";
            OrgSelectType[OrgSelectType["Department"] = 8] = "Department";
            OrgSelectType[OrgSelectType["All"] = 255] = "All";
        })(OrgSelectType || (OrgSelectType = {}));
        OrgBasePara.OrgSelectType = OrgSelectType;
    }
    OrgBasePara.getLastBit = function (type) {
        var count = 0;
        while ((type & 1) == 0 && type != 0) {
            type >>= 1;
            count++;
        }
        return 1 << count;
    };
    OrgBasePara.findIndex = function (array, callback) {
        if (!Array.isArray(array)) {
            return -2;
        }
        for (var i = 0; i < array.length; i++) {
            if (callback(array[i])) {
                return i;
            }
        }
        return -1;
    };
    return OrgBasePara;
}());
var Metadata = /** @class */ (function () {
    function Metadata() {
        var MetadataProprertyTypeEnum;
        (function (MetadataProprertyTypeEnum) {
            MetadataProprertyTypeEnum[MetadataProprertyTypeEnum["String"] = 0] = "String";
            MetadataProprertyTypeEnum[MetadataProprertyTypeEnum["Number"] = 1] = "Number";
            MetadataProprertyTypeEnum[MetadataProprertyTypeEnum["DateTime"] = 2] = "DateTime";
            MetadataProprertyTypeEnum[MetadataProprertyTypeEnum["Boolean"] = 3] = "Boolean";
            MetadataProprertyTypeEnum[MetadataProprertyTypeEnum["Entities"] = 4] = "Entities";
        })(MetadataProprertyTypeEnum || (MetadataProprertyTypeEnum = {}));
        Metadata.MetadataProprertyTypeEnum = MetadataProprertyTypeEnum;
    }
    return Metadata;
}());
var ajaxHelper = new AjaxHelper();
var orgBasePara = new OrgBasePara();
var metadata = new Metadata();
Vue.component('zsfund-stock-select', {
    data: function () {
        return {
            stocks: [],
            selectStock: _this.stockCode,
            size: _this.size,
        };
    },
    props: ['stockCode', 'size'],
    template: "<el-select filterable remote clearable v-model=\"selectStock\" default-first-option=\"true\" :remote-method=\"findSecInSelect\" @change=\"change\" placeholder=\"\u80A1\u7968\u67E5\u8BE2\" v-bind:size=\"size\">\n        <el-option v-for=\"item in stocks\" :key=\"item.stockCode\" :label=\"item.stockName\" :value=\"item\" >\n            <span style=\"float: left\">{{ item.stockName }}</span>\n            <span style=\"float: right; color: #CC0033; font-size: 13px\">{{ item.stockCode+'.'+item.market }}</span>\n        </el-option>\n    </el-select>",
    methods: {
        findSecInSelect: function (query) {
            var _this = this;
            var baseUrl = "http://component";
            if (query !== '') {
                ajaxHelper.RequestData(baseUrl + "/api/StockInfo/GetStockInfo", "queryStr=" + query, function (data) {
                    _this.stocks = data;
                });
            }
        },
        change: function (event) {
            this.selectStock = event.stockName;
            this.$emit('change', event);
            this.$emit('input', event.stockCode);
        }
    }
});
Vue.component('zsfund-origination-tree', {
    data: function () {
        return {
            id: _this.id,
            nodes: [],
            selectNodes: "",
            //单选与多选两种情况下，selectNodes分别对应""和[]
            //会触发selectNodes的watch
            search: [],
            loading: false,
            fuckFlag: true,
            props: {
                label: 'label',
                children: 'nodes',
                //depth: 'depth',
                isLeaf: 'leaf',
                type: 'type',
                disabled: 'disabled'
            },
        };
    },
    props: ['options', 'prevnodes', 'baseurl', 'dialog'],
    template: "\n        <div id=\"orgTreeSelect\">\n            <el-select v-model=\"selectNodes\" :multiple=\"options.multiple\" filterable remote placeholder=\"\u8F93\u5165\u5173\u952E\u5B57\"\n                    :collapse-tags=\"options.collapseTags\" value-key=\"id\" :remote-method=\"getSearchResult\" \n                    :loading=\"loading\" @remove-tag=\"removeTag\" @change=\"selectChosen\">\n                <el-option-group v-if=\"selectNodes!=undefined && selectNodes.length>0\" label=\"\u5DF2\u9009\u4E2D\">\n                    <el-option v-for=\"item in selectNodes\" :label=\"item.label\" :key=\"item.id\" :value=\"item\"></el-option>\n                </el-option-group>\n                <el-option-group  label=\"\u641C\u7D22\u7ED3\u679C\">\n                    <el-option v-for=\"item in search\" :label=\"item.label\" :key=\"item.id\" :value=\"item\" :disabled=\"item.disabled\"></el-option>\n                </el-option-group>\n            </el-select>\n            <el-tree :props=\"props\" lazy :load=\"onload\" node-key=\"id\"  @node-click=\"onclick\" \n                     ref=\"tree\" show-checkbox check-strictly @check-change=\"checkChange\">\n                <span class=\"custom-tree-node\" slot-scope=\"ele\">\n                    <i v-if=\"ele.data.type=='department'\" class=\"fa fa-university\"></i>\n                    <i v-else-if=\"ele.data.type=='group'\" class=\"fa fa-users\"></i>\n                    <i v-else-if=\"ele.data.type=='manager'\" class=\"fa fa-user-secret\"></i>\n                    <i v-else=\"ele.data.type=='employee'\" class=\"fa fa-user\"></i>\n                    <span>{{ ele.node.label }}</span>\n                </span>\n            </el-tree>\n            <div class=\"footer\" style=\"\"><span class=\"buttons\">\n                <el-button @click=\"cancelbtn\">\u53D6 \u6D88</el-button>\n                <el-button type=\"primary\" @click=\"confirmbtn\">\u786E \u5B9A</el-button>\n            </span></div>\n        </div>\n    ",
    methods: {
        selectChosen: function (data) {
            var dataid = [];
            for (var i in data) {
                dataid.push(data[i].id);
            }
            var checkKeys = this.$refs.tree.getCheckedKeys();
            if (checkKeys.length > data.length) {
                var delNodes = checkKeys.filter(function (e) { return dataid.indexOf(e) < 0; });
                for (var i in delNodes) {
                    this.$refs.tree.setChecked(delNodes[i], false);
                }
            }
            else if (checkKeys.length < data.length) {
                var addNodes = data.filter(function (e) { return checkKeys.indexOf(e.id) < 0; });
                for (var i in addNodes) {
                    this.$refs.tree.setChecked(addNodes[i], true);
                }
            }
            else {
                console.log("assert");
            }
        },
        removeTag: function (data) {
            this.$refs.tree.setChecked(data.id, false);
        },
        checkChange: function (data, check) {
            var node = this.$refs.tree.getNode(data);
            if (this.options.multiple) {
                //var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                //var index = this.selectNodes.findIndex(ele => { return ele.id == data.id });
                //IE 不支持find和findIndex,使用自定义的简易findIndex
                //if (index == -1) {
                if (node.checked) {
                    //深拷贝 用作watch
                    var index = this.findIndex(this.selectNodes, function (ele) { return ele.id == data.id; });
                    if (index < 0) { //避免重复添加
                        var cpy = this.selectNodes.slice(0);
                        cpy.push(this.options.setArrayFromData(data.data));
                        this.selectNodes = cpy;
                    }
                }
                else {
                    //this.selectNodes.splice(index, 1);
                    var index = this.findIndex(this.selectNodes, function (ele) { return ele.id == data.id; });
                    if (index >= 0) { //避免删除错误
                        this.selectNodes.splice(index, 1);
                    }
                }
            }
            else {
                if (node.checked) {
                    if (this.selectNodes != "") {
                        this.fuckFlag = false;
                    }
                    this.$refs.tree.setCheckedNodes([data.data]);
                    this.selectNodes = this.options.setArrayFromData(data.data);
                }
                else {
                    if (this.fuckFlag) {
                        this.selectNodes = "";
                    }
                    else {
                        this.fuckFlag = true;
                    }
                }
            }
        },
        onload: function (node, resolve) {
            var _this = this;
            //if (node.level > 1) {
            //    return resolve([]);
            //}
            var url = this.options.loadUrl;
            var para = this.options.loadDefaultPara;
            //if (node.id != 0)
            //当单个页面加载多个tree组件时，仅有一个根节点是id=0
            //所以使用node.level来进行根节点的判断
            if (node.level != 0) {
                para = this.options.loadPara(node);
            }
            ajaxHelper.RequestData(url, para, function (data) {
                var arr = [];
                for (var i_1 in data) {
                    arr.push(_this.options.setArrayFromData(data[i_1]));
                }
                resolve(arr);
                _this.appendToOptions(data);
                var nodes = _this.selectNodes.slice ? _this.selectNodes.slice(0) : new Array(_this.selectNodes);
                for (var i in nodes) {
                    //console.log(this.findIndex(data, function (e) { e.id == nodes[i].id }));
                    if (_this.findIndex(data, function (e) { return e.id == nodes[i].id; }) >= 0) {
                        //默认未加载的节点不会被选中
                        //所以认为nodes[i]未被选中
                        if (_this.options.multiple) { //单选模式第一次改变选择时有bug，未修复
                            _this.$refs.tree.setChecked(nodes[i], true);
                        }
                    }
                }
            });
        },
        findIndex: function (array, callback) {
            if (!Array.isArray(array)) {
                return -2;
            }
            for (var i in array) {
                if (callback(array[i])) {
                    return i;
                }
            }
            return -1;
        },
        onclick: function (node, data, f) {
            if (node.disabled || !node.leaf) {
                //if (data.isLeaf == false) { // data.isLeaf根据树节点的resolve进行自动更新
                // data.isLeafByUser与node.leaf绑定 
                return;
            }
            this.$refs.tree.setChecked(node.id, !data.checked);
        },
        appendToOptions: function (data) {
            this.search = [];
            for (var i in data) {
                var obj = this.options.setArrayFromData(data[i]);
                //if (obj.appendWhileSearch) {
                this.search.push(obj);
                //}
            }
        },
        getSearchResult: function (query) {
            var _this = this;
            if (query === '') {
                return;
            }
            this.loading = true;
            var url = this.options.searchUrl;
            var para = this.options.searchPara(query);
            ajaxHelper.RequestData(url, para, function (data) {
                _this.appendToOptions(data);
                _this.loading = false;
            });
        },
        loadLastNodes: function () {
            if (!(this.prevnodes && this.prevnodes.length)) {
                return;
            }
            var data = this.prevnodes;
            this.appendToOptions(data);
            if (this.options.multiple) {
                //if (this.selectNodes.findIndex(ele => { return ele.id == data.id }) == -1) {
                if (this.selectNodes.filter(function (ele) { return ele.id == data.id; }).length <= 0) {
                    //深拷贝 用作watch
                    var cpy = [];
                    for (var i in data) {
                        cpy.push(this.options.setArrayFromData(data[i]));
                        this.$refs.tree.setChecked(data[i].id, true);
                    }
                    this.selectNodes = cpy;
                }
            }
            else {
                //this.$refs.tree.setChecked(data[0], true);
                if (this.selectNodes == "" || this.selectNodes.id != data[0].id) {
                    this.selectNodes = this.options.setArrayFromData(data[0]);
                    //this.$refs.tree.setChecked(data[0].id, true)
                }
            }
        },
        cancelbtn: function () {
            this.$emit('cancelbutton');
        },
        confirmbtn: function () {
            this.$emit('confirmbutton');
        }
    },
    watch: {
        selectNodes: function (newVal, oldVal) {
            this.$emit('getvalue', newVal);
        },
        dialog: function (newVal, oldVal) {
            if (newVal == false) {
                this.$refs.tree.setCheckedKeys([]);
                return;
            }
            this.loadLastNodes();
        }
    },
    created: function () {
        var _this = this;
        this.options.loadUrl = this.options.loadUrl ? this.options.loadUrl : this.baseurl + "/api/Org/Children"; //"http://userservice/api/Org/Children";
        this.options.loadDefaultPara = this.options.loadDefaultPara ? this.options.loadDefaultPara : "";
        this.options.loadPara = this.options.loadPara ? this.options.loadPara :
            function (node) {
                var para = "id=" + node.data.id;
                return para + "&type=" + _this.options.displayType;
            };
        this.options.setArrayFromData = this.options.setArrayFromData ? this.options.setArrayFromData :
            function (data) {
                return {
                    label: data.displayName,
                    leaf: (data.unitType & OrgBasePara.getLastBit(_this.options.displayType)) != 0,
                    //leaf: data.unitType == (this.options.type == orgSelectType.all ? orgSelectType.Employee : this.options.type),//根据type选项设置leaf属性
                    //混合选择模式下，在onload方法里也会对部门叶节点进行leaf属性的更新
                    //depth: (data.unitType == 1) ? 1 : 0,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == OrgBasePara.OrgSelectType.Employee) ? "employee" : "department",
                    disabled: (data.unitType & _this.options.chosenType) == 0,
                    //appendWhileSearch: (data.unitType == 1),
                    data: data
                };
            };
        this.options.searchUrl = this.options.searchUrl ? this.options.searchUrl : this.baseurl + "/api/Org/Search"; //"http://userservice/api/Org/Search";
        this.options.searchPara = this.options.searchPara ? this.options.searchPara :
            function (query) {
                return "keyword=" + query;
            };
        //this.selectNodes = this.options.setArrayFromData(this.prevnodes);
        //this.loadLastNodes();
        this.selectNodes = this.options.multiple ? [] : "";
    },
    mounted: function () {
        this.loadLastNodes();
    }
});
Vue.component("zsfund-origination-input-select", {
    data: function () {
        return {
            dialogVisible: false,
            tags: [],
            selectData: [],
            prevNodes: null,
            firstload: true,
            baseUrl: "",
            option: {
                collapseTags: false,
                multiple: false,
                //type: 0,
                //并没有用到的width和height
                width: "",
                height: "",
            },
        };
    },
    props: ['options', 'value', 'baseurl'],
    template: "\n        <div>\n            <div v-if=\"options.disabled\">\n                <el-input :disabled=\"true\" placeholder=\"\u8BF7\u8F93\u5165\u5185\u5BB9\"></el-input></div>\n            <div v-else>\n                <div class=\"select\" @click=\"dialogVisible = true\" style=\"position:relative;\">\n                    <span class=\"tags\" style=\"position:absolute;top: 20%;\">\n                        <el-tag v-for=\"tag in tags\" :key=\"tag\" size=\"small\" style=\"margin-left: 6px;\"\n                                closable @close=\"closeTag(tag)\" :disable-transitions=\"true\">\n                            <i v-if=\"tag.type=='department'\" class=\"fa fa-university\"></i>\n                            <i v-else-if=\"tag.type=='group'\" class=\"fa fa-users\"></i>\n                            <i v-else-if=\"tag.type=='manager'\" class=\"fa fa-user-secret\"></i>\n                            <i v-else=\"tag.type=='employee'\" class=\"fa fa-user\"></i>\n                            {{tag.label}}\n                        </el-tag>\n                    </span>\n                    <el-input v-show=\"tags.length!=0\"></el-input>\n                    <el-input v-show=\"tags.length==0\" placeholder=\"\u8BF7\u8F93\u5165\u5185\u5BB9\"></el-input>\n                </div>\n                <el-dialog :visible.sync=\"dialogVisible\" :width=\"300\" custom-class=\"componydialog\"\n                        :modal-append-to-body=\"false\" :close-on-click-modal=\"false\" append-to-body=\"true\">\n                    <zsfund-origination-tree :prevnodes=\"prevNodes\" :options=\"option\" \n                        ref=\"orgTree\" :baseurl=\"baseUrl\" :dialog=\"dialogVisible\"\n                        v-on:getvalue=\"setValue\" v-on:cancelbutton=\"dialogVisible=false;\"\n                        v-on:confirmbutton=\"handleConfirm\"></zsfund-origination-tree>\n                </el-dialog>\n            </div>\n        </div>\n    ",
    methods: {
        setValue: function (data) {
            this.selectData = data;
            if (!this.options.multiple) {
                this.handleConfirm();
            }
        },
        handleConfirm: function () {
            //浅拷贝，tags改变会带动selectdata改变
            //进而selectData带动data改变
            //三者使用同一块内存？
            //this.tags = this.selectData;//并不是呢
            if (this.options.multiple) {
                this.tags = $.extend(true, [], this.selectData).sort(function (a, b) { return b.data.unitType - a.data.unitType; });
            }
            else {
                this.tags = this.selectData === "" ? "" : $.extend(true, {}, this.selectData);
            }
            if (this.prevNodes && this.prevNodes.length) {
                if (!this.options.multiple && this.firstload) {
                    this.firstload = false;
                    return;
                }
            }
            else {
                this.firstload = false;
            }
            this.dialogVisible = false;
        },
        closeTag: function (tag) {
            if (this.$refs.orgTree) {
                this.$refs.orgTree.removeTag(tag);
            }
            if (this.options.multiple) {
                this.tags.splice(this.tags.indexOf(tag), 1);
            }
            else {
                this.tags = [];
            }
        },
        setArrayFromData: function (data) {
            return {
                label: data.displayName,
                leaf: (data.unitType & OrgBasePara.getLastBit(this.options.displayType)) == 1,
                id: data.id,
                parentId: data.parentId,
                type: (data.unitType == OrgBasePara.OrgSelectType.Employee) ? "employee" : "department",
                disabled: (data.unitType & this.options.chosenType) == 0,
                data: data
            };
        },
        loadLastNodes: function () {
            var _this = this;
            var idList = this.value;
            if (idList == "" || !idList) {
                return;
            }
            //else {
            //    this.tags.splice(0);
            //}
            var url = this.baseUrl + "/api/User/List";
            var para = "idList=" + idList;
            //部门选择模式和混合选择模式逻辑未做
            ajaxHelper.RequestData(url, para, function (data) {
                var idList = _this.value.split(";");
                //把部门节点筛选出进行保留
                //var test = $.extend(true, [], this.tags);
                //test.sort((a, b) => {
                //    return OrgBasePara.findIndex(idList, function (e) { return e.data.unitType != OrgBasePara.OrgSelectType.Employee })
                //        - OrgBasePara.findIndex(idList, function (e) { return e.data.unitType != OrgBasePara.OrgSelectType.Employee });
                //});
                //if (this.$refs.orgTree) {
                //    this.tags.splice(0, OrgBasePara.findIndex(this.tags,
                //        (e) => { return e.data.unitType == OrgBasePara.OrgSelectType.Employee }));
                //}
                //if (this.options.multiple) 
                var cpy = [];
                for (var i in data) {
                    cpy.push(_this.setArrayFromData(data[i]));
                }
                //排序 api返回的数据结果没有按上传的idList进行排序
                cpy.sort(function (a, b) {
                    return OrgBasePara.findIndex(idList, function (e) { return e == a.id; })
                        - OrgBasePara.findIndex(idList, function (e) { return e == b.id; });
                });
                //this.tags = cpy;
                if (_this.tags.__ob__) {
                    _this.tags = $.extend(true, [], cpy);
                }
                else {
                    _this.tags = $.extend(true, _this.tags, cpy);
                }
            });
        }
    },
    watch: {
        tags: function (newVal, oldVal) {
            if (newVal === "") {
                this.tags = [];
            }
            else if (!Array.isArray(newVal)) {
                this.tags = new Array(newVal);
            }
            else {
                var res = newVal;
                var prev = [];
                var idList = [];
                for (var i in res) {
                    prev.push(res[i].data);
                    idList.push(res[i].id);
                }
                //tags变动引发内层值变动
                this.prevNodes = prev;
                //this.$emit('change', res);
                this.$emit('input', idList.join(";"));
            }
        },
        value: function (newVal, oldVal) {
            var idList = [];
            for (var i in this.prevNodes) {
                idList.push(this.prevNodes[i].id);
            }
            if (idList.join(";") != newVal) {
                this.loadLastNodes();
            }
        }
    },
    created: function () {
        this.option.collapseTags = this.options.collapseTags ? this.options.collapseTags : false;
        this.option.multiple = this.options.multiple != undefined ? this.options.multiple : true;
        //this.option.type = this.options.type ? this.options.type : orgSelectType.all;
        this.option.displayType = this.options.displayType ? this.options.displayType : OrgBasePara.OrgSelectType.All;
        this.option.chosenType = this.options.chosenType ? this.options.chosenType : this.options.displayType;
        //setArrayFromData内外同步
        //this.option.setArrayFromData = this.options.setArrayFromData;
        this.baseUrl = this.baseurl ? this.baseurl : "https://oa.zsfund.com/ApiGateway/UserService";
        //this.option.width= "260";
        //this.option.height = "300";
    },
    mounted: function () {
        this.loadLastNodes();
    }
});
//# sourceMappingURL=zsfund-component.js.map