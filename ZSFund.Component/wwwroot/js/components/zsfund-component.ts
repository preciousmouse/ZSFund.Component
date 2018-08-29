/**
 * Api请求帮助类
 */
class AjaxHelper {
    /**
     * 基础请求
     * @param url 地址
     * @param param 参数
     * @param callbackfunc 成功回调函数
     * @param showProgressBar 是否显示ProgressBar
     */
    public RequestData(url, param, callbackfunc: Function = null) {
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
            success: (data) => {
                result = data;
                if (callbackfunc != null) {
                    callbackfunc.call(this, data);
                    return;
                }
                return result;
            },
            error: (jqXHR, textStatus, errorThrown) => {
                result = "error: " + errorThrown;
            }
        });
    }

    public PostData(url, data, callbackfunc = null) {
        $.post(
            url,
            data,
            (data, status) => {
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
            }).fail((data) => {
                alert("网络错误，请联系系统管理员");
            })
    }

    private AddRandom(url: string): string {
        return url + (url.indexOf("?") >= 0 ? "&" : "?") + this.GetRandom(1000);
    }

    private GetRandom(n: number) {
        return Math.floor(Math.random() * n + 1);
    }
}

class OrgBasePara {
    static OrgSelectType: any;
    constructor() {
        //enum OrgUnitType {
        //    User = 1,
        //    Group = 2,
        //    Post = 4,
        //    Department = 8,
        //    Company = 16,
        //    All = 255
        //}
        enum OrgSelectType {
            Employee = 1,
            Department = 8,
            All = 255
        }
        OrgBasePara.OrgSelectType = OrgSelectType;
    }

    static getLastBit(type) {
        var count = 0;
        while ((type & 1) == 0 && type != 0) {
            type >>= 1;
            count++;
        }
        return 1 << count;
    }

    static findIndex(array, callback) {
        if (!Array.isArray(array)) {
            return -2;
        }
        for (var i = 0; i < array.length;i++) {
            if (callback(array[i])) {
                return i;
            }
        }
        return -1;
    }
}


var ajaxHelper = new AjaxHelper();
var orgBasePara = new OrgBasePara();
Vue.component('zsfund-stock-select', {
    data: () => {
        return {
            stocks: [],
            selectStock: this.stockCode,
            size: this.size,
        }
    },
    props: ['stockCode', 'size'],
    template:
        `<el-select filterable remote clearable v-model="selectStock" default-first-option="true" :remote-method="findSecInSelect" @change="change" placeholder="股票查询" v-bind:size="size">
        <el-option v-for="item in stocks" :key="item.stockCode" :label="item.stockName" :value="item" >
            <span style="float: left">{{ item.stockName }}</span>
            <span style="float: right; color: #CC0033; font-size: 13px">{{ item.stockCode+'.'+item.market }}</span>
        </el-option>
    </el-select>`,
    methods: {
        findSecInSelect: function (query) {
            var baseUrl = "http://component"
            if (query !== '') {
                ajaxHelper.RequestData(baseUrl + "/api/StockInfo/GetStockInfo", "queryStr=" + query, (data) => {
                    this.stocks = data;
                })
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
    data: () => {
        return {
            id: this.id,
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

        }
    },
    props: ['options', 'prevnodes', 'baseurl','dialog'],
    template: `
        <div id="orgTreeSelect">
            <el-select v-model="selectNodes" :multiple="options.multiple" filterable remote placeholder="输入关键字"
                    :collapse-tags="options.collapseTags" value-key="id" :remote-method="getSearchResult" 
                    :loading="loading" @remove-tag="removeTag" @change="selectChosen">
                <el-option-group v-if="selectNodes!=undefined && selectNodes.length>0" label="已选中">
                    <el-option v-for="item in selectNodes" :label="item.label" :key="item.id" :value="item"></el-option>
                </el-option-group>
                <el-option-group  label="搜索结果">
                    <el-option v-for="item in search" :label="item.label" :key="item.id" :value="item" :disabled="item.disabled"></el-option>
                </el-option-group>
            </el-select>
            <el-tree :props="props" lazy :load="onload" node-key="id"  @node-click="onclick" 
                     ref="tree" show-checkbox check-strictly @check-change="checkChange">
                <span class="custom-tree-node" slot-scope="ele">
                    <i v-if="ele.data.type=='department'" class="fa fa-university"></i>
                    <i v-else-if="ele.data.type=='group'" class="fa fa-users"></i>
                    <i v-else-if="ele.data.type=='manager'" class="fa fa-user-secret"></i>
                    <i v-else="ele.data.type=='employee'" class="fa fa-user"></i>
                    <span>{{ ele.node.label }}</span>
                </span>
            </el-tree>
            <div class="footer" style=""><span class="buttons">
                <el-button @click="cancelbtn">取 消</el-button>
                <el-button type="primary" @click="confirmbtn">确 定</el-button>
            </span></div>
        </div>
    `,
    methods: {
        /**
         * 自定义findIndex函数
         * @param array
         * @param callback
         */
        findIndex(array, callback) {
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
        /**
         * select框change事件
         * @param data
         */
        selectChosen(data) {
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
            } else if (checkKeys.length < data.length) {
                var addNodes = data.filter(function (e) { return checkKeys.indexOf(e.id) < 0; });
                for (var i in addNodes) {
                    this.$refs.tree.setChecked(addNodes[i], true);
                }
            } else {
                console.log("assert");
            }
        },
        /**
         * select框关闭标签
         * @param data
         */
        removeTag(data) {
            this.$refs.tree.setChecked(data.id,false);
        },
        /**
         * tree组件check-change回调
         * @param data
         * @param check
         */
        checkChange(data, check) {
            var node = this.$refs.tree.getNode(data);
            if (this.options.multiple) {
                //var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                //var index = this.selectNodes.findIndex(ele => { return ele.id == data.id });
                //IE 不支持find和findIndex,使用自定义的简易findIndex
                //if (index == -1) {
                if (node.checked) {
                    //深拷贝 用作watch
                    var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                    if (index < 0) {//避免重复添加
                        var cpy = this.selectNodes.slice(0);
                        cpy.push(this.options.setArrayFromData(data.data))
                        this.selectNodes = cpy;
                    }
                } else {
                    //this.selectNodes.splice(index, 1);
                    var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                    if (index >= 0) {//避免删除错误
                        this.selectNodes.splice(index, 1);
                    }
                }
            } else {
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
                    } else {
                        this.fuckFlag = true;
                    }
                }
            }
        },
        /**
         * tree组件动态加载节点的回调
         * @param node
         * @param resolve
         */
        onload(node, resolve) {
            //if (node.level > 1) {
            //    return resolve([]);
            //}
            var url = this.options.loadUrl;
            var para = this.options.loadDefaultPara;

            //if (node.id != 0)
            //当单个页面加载多个tree组件时，仅有一个根节点是id=0
            //所以使用node.level来进行根节点的判断
            if(node.level != 0)
            {
                para = this.options.loadPara(node);
            }
            ajaxHelper.RequestData(url, para, (data) => {
                var arr = [];
                for (let i in data) {
                    arr.push(this.options.setArrayFromData(data[i]));
                }
                resolve(arr);
                this.appendToOptions(data);


                var nodes = this.selectNodes.slice ? this.selectNodes.slice(0) : new Array(this.selectNodes);
                for (var i in nodes) {
                    //console.log(this.findIndex(data, function (e) { e.id == nodes[i].id }));
                    if (this.findIndex(data, function (e) { return e.id==nodes[i].id}) >= 0) {
                        //默认未加载的节点不会被选中
                        //所以认为nodes[i]未被选中
                        if (this.options.multiple) {//单选模式第一次改变选择时有bug，未修复
                            this.$refs.tree.setChecked(nodes[i], true);
                        }
                    }
                }
            })
        },
        /**
         * tree组件节点点击回调
         * @param node
         * @param data
         * @param f
         */
        onclick(node, data, f) {
            if (node.disabled || !node.leaf) {
            //if (data.isLeaf == false) { // data.isLeaf根据树节点的resolve进行自动更新
                                        // data.isLeafByUser与node.leaf绑定 
                return;
            }
            this.$refs.tree.setChecked(node.id, !data.checked);
        },
        /**
         * 更新search内容,tree上选择的节点可以在search-bar上加载
         * @param data
         */
        appendToOptions(data) {
            this.search = [];
            for (let i in data) {
                var obj = this.options.setArrayFromData(data[i]);
                //if (obj.appendWhileSearch) {
                    this.search.push(obj);
                //}
            }
        },
        /**
         * search方法
         * @param query
         */
        getSearchResult(query) {
            if (query === '') {
                return;
            }
            this.loading = true;
            var url = this.options.searchUrl;
            var para = this.options.searchPara(query);
            ajaxHelper.RequestData(url, para, (data) => {
                this.appendToOptions(data);
                this.loading = false;
            })
        },
        /**
         * 节点初始化/更新
         */
        loadLastNodes() {
            if (!(this.prevnodes&&this.prevnodes.length)) {
                return;
            }
            var data = this.prevnodes;
            this.appendToOptions(data);

            if (this.options.multiple) {
                //if (this.selectNodes.findIndex(ele => { return ele.id == data.id }) == -1) {
                if (this.selectNodes.filter(ele => { return ele.id == data.id }).length <=0) {
                    //深拷贝 用作watch
                    var cpy = [];
                    for(var i in data){
                        cpy.push(this.options.setArrayFromData(data[i]))
                        this.$refs.tree.setChecked(data[i].id,true)
                    }
                    this.selectNodes = cpy;
                }
            } else {
                //this.$refs.tree.setChecked(data[0], true);
                if (this.selectNodes == "" || this.selectNodes.id != data[0].id) {
                    this.selectNodes = this.options.setArrayFromData(data[0]);
                    //this.$refs.tree.setChecked(data[0].id, true)
                }
            }
        },
        cancelbtn() {
            this.$emit('cancelbutton');
        },
        confirmbtn() {
            this.$emit('confirmbutton');
        }
    },
    watch: {
        selectNodes(newVal, oldVal) {
            this.$emit('getvalue', newVal);
        },
        dialog(newVal, oldVal) {
            if (newVal == false) {
                this.$refs.tree.setCheckedKeys([]);
                return;
            }
            this.loadLastNodes();
        }
    },
    created: function () {
        this.options.loadUrl = this.options.loadUrl ? this.options.loadUrl : this.baseurl + "/api/Org/Children";//"http://userservice/api/Org/Children";
        this.options.loadDefaultPara = this.options.loadDefaultPara ? this.options.loadDefaultPara : "";
        this.options.loadPara = this.options.loadPara ? this.options.loadPara :
            (node) => {
                var para = "id=" + node.data.id;
                return para + "&type=" + this.options.displayType;
            };
        this.options.setArrayFromData = this.options.setArrayFromData ? this.options.setArrayFromData :
            (data) => {
                return {
                    label: data.displayName,
                    leaf: (data.unitType & OrgBasePara.getLastBit(this.options.displayType)) !=0,
                    //leaf: data.unitType == (this.options.type == orgSelectType.all ? orgSelectType.Employee : this.options.type),//根据type选项设置leaf属性
                                                                                            //混合选择模式下，在onload方法里也会对部门叶节点进行leaf属性的更新
                    //depth: (data.unitType == 1) ? 1 : 0,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == OrgBasePara.OrgSelectType.Employee) ? "employee" : "department",
                    disabled: (data.unitType&this.options.chosenType)==0,//this.options.type==orgSelectType.Employee?data.unitType!=orgSelectType.Employee:false,
                    //appendWhileSearch: (data.unitType == 1),
                    data: data
                }
            }
        this.options.searchUrl = this.options.searchUrl ? this.options.searchUrl : this.baseurl + "/api/Org/Search";//"http://userservice/api/Org/Search";
        this.options.searchPara = this.options.searchPara ? this.options.searchPara :
            (query) => {
                return "keyword=" + query
            };
        //this.selectNodes = this.options.setArrayFromData(this.prevnodes);
        //this.loadLastNodes();
        this.selectNodes = this.options.multiple ? [] : "";
    },
    mounted: function () {
        this.loadLastNodes();
    }
});

class OrgSelect {
    public vm = {
        data: () => {
            return {
                dialogVisible: false,
                tags: [],
                selectData: [],
                prevNodes: null,
                firstload: true,
                //baseUrl: "",
                //option: {
                //    collapseTags: false,
                //    multiple: false,
                //    //loadUrl: "/api/Org/Children"  //type test url
                //},
            }
        },
        props: ['options', 'value', 'baseurl'],
        template: `
            <div>
                <div v-if="options.disabled">
                    <el-input :disabled="true" placeholder="请输入内容"></el-input></div>
                <div v-else>
                    <div class="select" @click="dialogVisible = true" style="position:relative;">
                        <span class="tags" style="position:absolute;top: 20%;">
                            <el-tag v-for="tag in tags" :key="tag" size="small" style="margin-left: 6px;"
                                    closable @close="closeTag(tag)" :disable-transitions="true">
                                <i v-if="tag.type=='department'" class="fa fa-university"></i>
                                <i v-else-if="tag.type=='group'" class="fa fa-users"></i>
                                <i v-else-if="tag.type=='manager'" class="fa fa-user-secret"></i>
                                <i v-else="tag.type=='employee'" class="fa fa-user"></i>
                                {{tag.label}}
                            </el-tag>
                        </span>
                        <el-input v-show="tags.length!=0"></el-input>
                        <el-input v-show="tags.length==0" placeholder="请输入内容"></el-input>
                    </div>
                    <el-dialog :visible.sync="dialogVisible" :width="300" custom-class="componydialog"
                            :modal-append-to-body="false" :close-on-click-modal="false" append-to-body="true">
                        <zsfund-origination-tree :prevnodes="prevNodes" :options="option" 
                            ref="orgTree" :baseurl="baseUrl" :dialog="dialogVisible"
                            v-on:getvalue="setValue" v-on:cancelbutton="dialogVisible=false;"
                            v-on:confirmbutton="handleConfirm"></zsfund-origination-tree>
                    </el-dialog>
                </div>
            </div>`,
        methods: {
            /**
             * 接收子组件的getvalue回调,维护选择的值
             * @param data
             */
            setValue(data) {
                this.selectData = data;
                if (!this.options.multiple) {
                    this.handleConfirm();
                }
            },
            /**
             * 接收子组件的confirmbutton回调,点击确认按钮后执行的操作
             */
            handleConfirm() {
                //浅拷贝，tags改变会带动selectdata改变
                //进而selectData带动data改变
                //三者使用同一块内存？
                //this.tags = this.selectData;//并不是呢

                if (this.options.multiple) {
                    this.tags = $.extend(true, [], this.selectData).sort((a, b) => { return b.data.unitType - a.data.unitType; });
                } else {
                    this.tags = this.selectData === "" ? "" : $.extend(true, {}, this.selectData);
                }

                if (this.prevNodes && this.prevNodes.length) {
                    if (!this.options.multiple && this.firstload) {
                        this.firstload = false;
                        return;
                    }
                } else {
                    this.firstload = false;
                }

                this.dialogVisible = false;
            },
            /**
             * 移除标签进行的操作
             * @param tag
             */
            closeTag(tag) {
                if (this.$refs.orgTree) {
                    this.$refs.orgTree.removeTag(tag);
                }
                if (this.options.multiple) {
                    this.tags.splice(this.tags.indexOf(tag), 1);
                } else {
                    this.tags = [];
                }
            },
            /**
             * 数据格式转换,从api格式转为页面数据格式
             * @param data
             */
            setArrayFromData(data) {
                return {
                    label: data.displayName,
                    leaf: (data.unitType & OrgBasePara.getLastBit(this.options.displayType)) == 1,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == OrgBasePara.OrgSelectType.Employee) ? "employee" : "department",
                    disabled: (data.unitType & this.options.chosenType) == 0,
                    data: data
                }
            },
            /**
             * 加载初始值或更新后的值
             */
            loadLastNodes() {
                var idList = this.value;
                if (idList == undefined) {
                    return;
                }
                if (idList === "") {
                    this.tags = [];
                    return;
                }


                //else {
                //    this.tags.splice(0);
                //}

                var url = this.baseUrl + "/api/User/List";
                var para = "idList=" + idList;
                //部门选择模式和混合选择模式逻辑未做
                ajaxHelper.RequestData(url, para, (data) => {
                    var idList = this.value.split(";");
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
                        cpy.push(this.setArrayFromData(data[i]))
                    }
                    //排序 api返回的数据结果没有按上传的idList进行排序
                    cpy.sort((a, b) => {
                        return OrgBasePara.findIndex(idList, function (e) { return e == a.id })
                            - OrgBasePara.findIndex(idList, function (e) { return e == b.id });
                    });
                    //this.tags = cpy;
                    if (this.tags.__ob__) {
                        this.tags = $.extend(true, [], cpy);
                    } else {
                        this.tags = $.extend(true, this.tags, cpy);
                    }
                })
            }
        },
        watch: {
            /**
             * tags为显示的选中值,tags变动时通知子组件和外部v-bind进行数值更新
             * @param newVal
             * @param oldVal
             */
            tags(newVal, oldVal) {
                if (newVal === "") {
                    this.tags = [];
                } else if (!Array.isArray(newVal)) {
                    this.tags = new Array(newVal);
                } else {
                    var res = newVal;
                    var prev = []
                    var idList = [];
                    for (var i in res) {
                        prev.push(res[i].data);
                        idList.push(res[i].id);
                    }
                    //tags变动引发内层值变动
                    this.prevNodes = prev;

                    this.$emit('input', idList.join(";"));
                    setTimeout(() => {
                        this.$emit('change', idList.join(";"));
                    }, 50);
                }
            },
            /**
             * value为外部传入的初始值,初始化或更新后触发组件更新
             * @param newVal
             * @param oldVal
             */
            value(newVal, oldVal) {
                var idList = [];
                for (var i in this.prevNodes) {
                    idList.push(this.prevNodes[i].id);
                }
                if (idList.join(";") != newVal) {
                    this.loadLastNodes();
                }
            },
        },
        computed: {
            option: function () {
                return {
                    collapseTags: this.options.collapseTags ? this.options.collapseTags : false,
                    multiple: this.options.multiple != undefined ? this.options.multiple : true,
                    displayType: this.options.displayType ? this.options.displayType : OrgBasePara.OrgSelectType.All,
                    chosenType: this.options.chosenType ? this.options.chosenType : this.options.displayType
                };
            },
            baseUrl: function () {
                return this.baseurl ? this.baseurl : "https://oa.zsfund.com/ApiGateway/UserService";
            }
        },
        mounted: function () {
            this.loadLastNodes();
        }
    }
    
}
var orgselect = new OrgSelect();

Vue.component("zsfund-origination-input-select", orgselect.vm);
