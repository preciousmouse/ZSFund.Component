//依赖Common.js进行ajax请求操作
var MetadataManage = /** @class */ (function () {
    function MetadataManage() {
        var _this = this;
        this.vm = null;
        /**
         * 目录树dialog form中,值类型为Entities时，实体属性表格的check函数
         * 传入rules对象即可
         * @param rule
         * @param value
         * @param callback
         */
        this.treeEntityCheck = function (rule, value, callback) {
            if (_this.vm.$data.treeForm.metaCategoryType != MetadataManage.MetadataProprertyTypeEnum.Entities) {
                callback();
            }
            else {
                var arr = _this.vm.$data.metaTreeData;
                for (var i in arr) {
                    if (arr[i].name == "") {
                        callback(new Error("请输入值名称"));
                        return;
                    }
                }
                callback();
            }
        };
        /**
         * 元数据dialog form中,值类型为Entities时，实体属性表格的check函数
         * 传入rules对象即可
         * @param rule
         * @param value
         * @param callback
         */
        this.tableEntityCheck = function (rule, value, callback) {
            if (_this.vm.$data.tableForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Number) {
                var number = _this.vm.$data.tableForm.metaDetailValue;
                if (((/^(-?\d+)(\.\d+)?$/)).test(number)) {
                    callback();
                }
                else {
                    callback(new Error("请输入数字值"));
                }
            }
            else if (_this.vm.$data.tableForm.metaCategoryType != MetadataManage.MetadataProprertyTypeEnum.Entities) {
                if (_this.vm.$data.tableForm.metaDetailValue === "" || _this.vm.$data.tableForm.metaDetailValue === null) {
                    callback(new Error("请输入Value项"));
                }
                else {
                    callback();
                }
            }
            else {
                var arr = _this.vm.$data.metaTableData.keyValueMetadata;
                for (var i in arr) {
                    if (arr[i].value === undefined || arr[i].value === null || arr[i].value === "") {
                        callback(new Error("请输入Value项"));
                        return;
                    }
                }
                callback();
            }
        };
    }
    MetadataManage.prototype.Init = function () {
        var _this = this;
        this.vm = new Vue({
            el: "#app",
            data: {
                //global
                baseUrl: "http://10.10.0.175:8088",
                isAdmin: false,
                //tree
                props: {
                    label: 'metaCategoryName',
                    children: 'inverseParent'
                },
                treeData: [],
                //tree node logo
                noPermissionPicSrc: "img/MetaCategory.png",
                permissionPicSrc: "img/MetaCategoryWithPermission.png",
                //tree form
                treeDialogVisible: false,
                treeForm: {
                    objectId: 0,
                    parentId: 0,
                    formTitle: "",
                    metaCategoryPath: "/",
                    metaCategoryName: '',
                    metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,
                    keyValueMetadata: "",
                    isExternal: false,
                    externalWebApi: null,
                    description: null,
                    isDeleted: false,
                    permissionInherited: true
                },
                treeFormRules: {
                    metaCategoryName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
                    metaCategoryType: [{ required: true, message: '请输入类型', trigger: 'blur' }],
                    metaTreeData: [{ validator: this.treeEntityCheck, tigger: 'blur' }]
                },
                formLabelWidth: '90px',
                externSwitch: "off",
                metaTreeData: [{
                        name: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String
                    }],
                //tree permission
                treePermissionDialogVisible: false,
                treePermission: [],
                selectOption: {
                    multiple: true,
                    chosenType: OrgBasePara.OrgSelectType.Employee
                },
                //search
                searchInput: "",
                //table
                tableData: [],
                tableDeleteVisible: [],
                tableAddPermission: false,
                tableButtonWidth: 95,
                //table form
                tableDialogVisible: false,
                tableForm: {
                    formTitle: "",
                    objectId: 0,
                    categoryPath: "/",
                    metaCategoryId: 0,
                    metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,
                    metaDetailName: "",
                    metaDetailValue: "",
                    description: "",
                    sort: 0,
                    isDeleted: false,
                },
                tableFormRules: {
                    metaDetailName: [{ required: true, message: '请输入值名称', trigger: 'blur' }],
                    metaDetailValue: [{ required: true, validator: this.tableEntityCheck, trigger: 'blur' }]
                },
                metaTableData: [{
                        name: "",
                        value: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String,
                        typeName: ""
                    }],
                //date-picker
                datePickerOptions: {
                    //disabledDate(time) {
                    //    return time.getTime() > Date.now();
                    //},
                    shortcuts: [{
                            text: '今天',
                            onClick: function (picker) {
                                picker.$emit('pick', new Date());
                            }
                        }, {
                            text: '昨天',
                            onClick: function (picker) {
                                var date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', date);
                            }
                        }, {
                            text: '一周前',
                            onClick: function (picker) {
                                var date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', date);
                            }
                        }]
                },
            },
            methods: {
                //global
                showEntity: function (row) {
                    return (_this.vm.$refs.asideTree.getNode(row.metaCategoryId).data
                        .metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities);
                },
                //tree      //this.$refs.asideTree
                handleCurrentChange: function (data, node) {
                    //if (!node.isLeaf) {
                    //    return;
                    //}
                    _this.initTableData(data.objectId);
                },
                handleTreeAdd: function () {
                    //在class作用域下直接访问this.vm.(...)时
                    //typescript会报类型错误（类型Vue上不存在属性...）
                    //此处使用了类型断言不进行类型检查，后同
                    var node = _this.vm.$refs.asideTree.getCurrentNode();
                    _this.vm.$data.treeForm = _this.getForm({
                        formTitle: "添加目录",
                        parentId: (node == null ? 0 : node.objectId),
                        metaCategoryPath: (node == null ? "/" : node.metaCategoryPath),
                    }, _this.vm.$data.treeForm);
                    _this.vm.$data.treeDialogVisible = true;
                },
                handleTreeEdit: function () {
                    var node = _this.vm.$refs.asideTree.getCurrentNode();
                    if (node === null) {
                        return;
                    }
                    _this.vm.$data.treeForm = _this.getForm({
                        formTitle: "修改目录",
                        metaCategoryPath: (node.parentId == null || node.parentId == 0 ? "/" : _this.vm.$refs.asideTree.getNode(node.parentId).data.metaCategoryPath),
                    }, node);
                    if (_this.vm.$data.treeForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        //this.metaTreeData = JSON.parse(this.treeForm.keyValueMetadata).Entities;
                        _this.vm.$data.metaTreeData = JSON.parse(_this.vm.$data.treeForm.keyValueMetadata).Entities.map(function (ele) {
                            ele.type = typeof (ele.type) == "number" ? ele.type : parseInt(ele.type);
                            return ele;
                        });
                    }
                    console.log(_this.vm.$data.metaTreeData, _this.vm.$data.treeForm);
                    _this.vm.$data.treeDialogVisible = true;
                },
                handleTreeDelete: function () {
                    var node = _this.vm.$refs.asideTree.getCurrentNode();
                    if (node == null) {
                        return;
                    }
                    _this.postTreeDelete(node.objectId, function () {
                        _this.vm.$refs.asideTree.remove(node.objectId);
                    });
                },
                handleTreeReset: function () {
                    _this.vm.$refs.asideTree.setCurrentKey(null);
                },
                //treeForm
                handleTreeFormAdd: function () {
                    _this.vm.$data.metaTreeData.push({
                        name: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String
                    });
                },
                handleTreeFormDelete: function (index, row) {
                    _this.vm.$data.metaTreeData.splice(index, 1);
                },
                //tree permission
                handleTreePermission: function () {
                    var node = _this.vm.$refs.asideTree.getCurrentNode();
                    if (node === null) {
                        return;
                    }
                    _this.vm.$data.treePermissionDialogVisible = true;
                    _this.getPermission(node.objectId);
                    //this.vm.$data.treePermission = [];
                },
                handlePermissionAdd: function () {
                    _this.vm.$data.treePermission.push({
                        memberId: "",
                        permission: MetadataManage.metadataPermissionEnum.List,
                        checkList: []
                    });
                },
                handlePermissionDelete: function (index, row) {
                    _this.vm.$data.treePermission.splice(index, 1);
                },
                handlePermissionConfirm: function () {
                    var list = [];
                    for (var i in _this.vm.$data.treePermission) {
                        var obj = _this.vm.$data.treePermission[i];
                        for (var j in obj.checkList) {
                            obj.permission |= obj.checkList[j];
                        }
                        if (obj.memberId != "") {
                            list.push(obj);
                        }
                    }
                    _this.vm.$data.treePermission = list;
                    _this.vm.$data.treePermissionDialogVisible = false;
                    _this.postPermission();
                },
                handleOrgSelectChange: function (index, str) {
                    var str = _this.vm.$data.treePermission[index].memberId;
                    if (str.indexOf(";") != -1) {
                        _this.vm.$data.treePermission[index].memberId = str.split(';')[1];
                    }
                },
                //table
                handleSearch: function () {
                    if (_this.vm.$data.searchInput == "") {
                        return;
                    }
                    _this.setTableData({
                        keyWord: _this.vm.$data.searchInput
                    }, function () {
                        _this.vm.handleTreeReset();
                        _this.vm.$data.searchInput = "";
                    });
                },
                handleTableAdd: function () {
                    var node = _this.vm.$refs.asideTree.getCurrentNode();
                    if (node == null || !_this.vm.$refs.asideTree.getNode(node.objectId).isLeaf) {
                        return;
                    }
                    _this.vm.$data.tableForm = _this.getForm({
                        formTitle: "添加属性",
                        categoryPath: node.metaCategoryPath,
                        metaCategoryId: node.objectId,
                        metaCategoryType: _this.vm.$refs.asideTree.getNode(node.objectId).data.metaCategoryType,
                    }, _this.vm.$data.tableForm);
                    if (node.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        _this.vm.$data.metaTableData = _this.getType(node.objectId);
                    }
                    //this.vm.$data.tableDeleteVisible.push(false);
                    _this.vm.$data.tableDialogVisible = true;
                },
                handleTableEdit: function (index, row) {
                    var node = _this.vm.$refs.asideTree.getNode(_this.vm.$data.tableData[index].metaCategoryId).data;
                    _this.vm.$data.tableForm = _this.getForm({
                        formTitle: "修改属性",
                        categoryPath: node.metaCategoryPath,
                        metaCategoryType: _this.vm.$refs.asideTree.getNode(_this.vm.$data.tableData[index].metaCategoryId).data.metaCategoryType
                    }, _this.vm.$data.tableData[index]);
                    if (node.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        _this.vm.$data.metaTableData = {
                            metaCategoryType: node.metaCategoryType,
                            //keyValueMetadata: JSON.parse(this.vm.$data.tableData[index].metaDetailValue)
                            keyValueMetadata: _this.getKeyValueData(_this.vm.$data.tableData[index])
                        };
                    }
                    _this.vm.$data.tableDialogVisible = true;
                },
                handleTableDelete: function (index, row) {
                    _this.postTableDelete(row.objectId, function () {
                        _this.vm.$data.tableData.splice(index, 1);
                        _this.vm.$data.tableDeleteVisible.splice(index, 1);
                    });
                },
                //tableForm
                //form validate
                validateForm: function (formName) {
                    //var _this = this;
                    _this.vm.$refs[formName].validate(function (valid) {
                        if (valid) {
                            //eval("this." + formName + "Confirm()");
                            if (formName == 'treeForm') {
                                _this.treeFormConfirm();
                            }
                            else if (formName == "tableForm") {
                                _this.tableFormConfirm();
                            }
                            else {
                            }
                        }
                        else {
                            return false;
                        }
                    });
                },
            },
            watch: {
                treeDialogVisible: function (newVal, oldVal) {
                    if (newVal == true) {
                        //初始化通用值
                        _this.vm.$data.externSwitch = _this.vm.$data.treeForm.isExternal ? "on" : "off";
                    }
                    else {
                        //还原为初始值
                        _this.vm.$data.treeForm = {
                            objectId: 0,
                            parentId: 0,
                            formTitle: "",
                            metaCategoryPath: "/",
                            metaCategoryName: "",
                            metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,
                            keyValueMetadata: '{"KeyType":"0","Entities":[]}',
                            isExternal: false,
                            externalWebApi: null,
                            description: null,
                            isDeleted: false,
                            permissionInherited: true
                        };
                        _this.vm.$data.metaTreeData = [{
                                name: "",
                                type: MetadataManage.MetadataProprertyTypeEnum.String
                            }];
                        _this.vm.$data.externSwitch = "off";
                        _this.resetForm("treeForm");
                    }
                },
                tableDialogVisible: function (newVal, oldVal) {
                    if (newVal) { }
                    else {
                        _this.vm.$data.tableForm = {
                            formTitle: "",
                            objectId: 0,
                            categoryPath: "/",
                            metaCategoryId: 0,
                            metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,
                            metaDetailName: "",
                            metaDetailValue: "",
                            description: "",
                            sort: 0,
                            isDeleted: false,
                        };
                        _this.vm.$data.metaTableData = [{
                                name: "",
                                value: "",
                                type: MetadataManage.MetadataProprertyTypeEnum.String,
                                typeName: ""
                            }];
                        _this.resetForm("tableForm");
                    }
                },
                externSwitch: function (newVal, oldVal) {
                    _this.vm.$data.treeForm.isExternal = newVal == "on" ? true : false;
                }
            },
            updated: function () {
                //使之前选择的节点恢复高亮
                var node = this.$refs.asideTree.getCurrentNode();
                if (node != null) {
                    this.$refs.asideTree.setCurrentKey(node.objectId);
                }
            }
        });
        this.initTreeData();
    };
    //global
    /**
     * 在某个对象中，通过value得到key
     * 不存在value时返回undefined
     * @param obj
     * @param value
     * @param compare = (a, b) => a === b
     */
    MetadataManage.prototype.findkey = function (obj, value, compare) {
        //es6
        //return Object.keys(obj).find(val => compare(obj[val], value));
        //es5
        if (compare === void 0) { compare = function (a, b) { return a === b; }; }
        //normal
        for (var key in obj) {
            if (obj[key] == value) {
                return key;
            }
        }
        return undefined;
    };
    /**
     * 得到被sub（subform）更新后的form
     * @param sub
     * @param form
     */
    MetadataManage.prototype.getForm = function (sub, form) {
        form = $.extend(true, {}, form); //深拷贝
        for (var key in sub) {
            form[key] = sub[key];
        }
        return form;
    };
    /**
     * 把数组数据中的name-value整合为key-value对象,返回序列化字符串
     * @param data
     */
    MetadataManage.prototype.getDetailJson = function (data) {
        var res = {};
        for (var i in data) {
            res[data[i].name] = data[i].value;
        }
        return JSON.stringify(res);
    };
    /**
     * 统计二进制有效位数
     * @param number
     */
    MetadataManage.prototype.getBitCount = function (number) {
        var count = 0;
        while (number) {
            count += number & 1;
            number /= 2;
        }
        return count;
    };
    /**
     * 返回二进制位对应的数字数组
     * @param number
     */
    MetadataManage.prototype.getBitArray = function (number) {
        var base = 1;
        var res = [];
        while (number > 0) {
            if (number & base) {
                res.push(base);
                number ^= base;
            }
            base <<= 1;
        }
        return res;
    };
    /**
     * 返回较大值
     * @param a
     * @param b
     * @param compare 比较规则,默认>运算符比较
     */
    MetadataManage.prototype.max = function (a, b, compare) {
        if (compare === void 0) { compare = function (a, b) { return a > b ? a : b; }; }
        return compare(a, b);
    };
    //message
    /**
     * 显示提示信息 -功能未完成
     * @param option { message:"", type:"success" }
     */
    MetadataManage.prototype.showMessage = function (option) {
        this.vm.$message(option);
    };
    //tree
    /**
     * 目录节点为Enitity时调用
     * 得到enitity的各个属性名和类型
     * @param objectId
     */
    MetadataManage.prototype.getType = function (objectId) {
        var node = this.vm.$refs.asideTree.getNode(objectId);
        var obj = {
            metaCategoryType: node.data.metaCategoryType,
            keyValueMetadata: []
        };
        var entity = JSON.parse(node.data.keyValueMetadata).Entities;
        for (var i in entity) {
            obj.keyValueMetadata.push({
                name: entity[i].name,
                type: parseInt(entity[i].type),
                typeName: this.findkey(MetadataManage.mataCategoryTypeList, parseInt(entity[i].type))
            });
        }
        return obj;
    };
    /**
     * 通过api加载目录树内容
     * 以及判断管理员身份
     */
    MetadataManage.prototype.initTreeData = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category", para = "";
        Common.InvokeWebApi(url, "GET", "error", "", true, function (data) {
            _this.vm.$data.treeData = data;
            console.log(_this.vm.$data.treeData);
        });
        url = this.vm.$data.baseUrl + "/api/MetadataManage/IsAdmin";
        Common.InvokeWebApi(url, "GET", "error", "", true, function (data) {
            _this.vm.$data.isAdmin = data;
        });
    };
    /**
     * 通过api进行目录树节点的添加/修改操作
     */
    MetadataManage.prototype.postTreeEdit = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.treeForm, true, function (data) {
            _this.initTreeData();
        });
    };
    /**
     * 通过api进行目录树节点的删除操作
     * @param id
     * @param callback =null
     */
    MetadataManage.prototype.postTreeDelete = function (id, callback) {
        if (callback === void 0) { callback = null; }
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category";
        Common.InvokeWebApi(url, "DELETE", "error", {
            id: id
        }, true, function (data) {
            //this.initTreeData();
            if (callback) {
                callback();
            }
        });
    };
    //treeform
    /**
     * 处理目录树form内容,并调用api进行post请求
     */
    MetadataManage.prototype.treeFormConfirm = function () {
        if (this.vm.$data.treeForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
            var obj = {
                "KeyType": MetadataManage.MetadataProprertyTypeEnum.Entities,
                "Entities": []
            };
            for (var ele in this.vm.$data.metaTreeData) {
                var name = this.vm.$data.metaTreeData[ele].name;
                var type = this.vm.$data.metaTreeData[ele].type;
                //if (name != "") {
                obj.Entities.push({
                    "name": name,
                    "type": type.toString()
                });
                //}
            }
            this.vm.$data.treeForm = this.getForm({
                keyValueMetadata: JSON.stringify(obj),
                metaCategoryPath: this.vm.$data.treeForm.metaCategoryPath + "/" + this.vm.$data.treeForm.metaCategoryName
            }, this.vm.$data.treeForm);
        }
        this.vm.$data.treeDialogVisible = false;
        this.postTreeEdit();
    };
    //tree permission
    /**
     * 通过api加载目录树节点权限
     * @param id =0
     */
    MetadataManage.prototype.getPermission = function (id) {
        var _this = this;
        if (id === void 0) { id = 0; }
        if (id == undefined || id == 0) {
            this.vm.$data.treePermission = [];
            return;
        }
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Permission?categoryId=" + id;
        Common.InvokeWebApi(url, "GET", "error", "", true, function (data) {
            for (var i in data) {
                data[i].checkList = _this.getBitArray(data[i].permission);
            }
            _this.vm.$data.treePermission = data;
        });
    };
    /**
     * 通过api修改目录树节点权限情况
     */
    MetadataManage.prototype.postPermission = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Permission";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.treePermission, true, function (data) {
            console.log(_this.vm.$data.treePermission);
        });
    };
    //table
    /**
     * 通过带name-value值的obj对象，返回key-value数组
     * @param obj tableData元素
     */
    MetadataManage.prototype.getKeyValueData = function (obj) {
        var arr = this.getType(obj.metaCategoryId).keyValueMetadata;
        var value = JSON.parse(obj.metaDetailValue);
        for (var i in arr) {
            arr[i].value = value[arr[i].name];
        }
        return arr;
    };
    /**
     * 通过api加载元数据表格
     * @param obj keyword或metaCategoryId 两者只有一者生效,keyword优先
     * @param callback =null
     */
    MetadataManage.prototype.setTableData = function (obj, callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var url = Common.GetUrl(this.vm.$data.baseUrl + "/api/MetadataManage/Detail", obj);
        var type = obj.keyWord == undefined; //false为搜索
        Common.InvokeWebApi(url, "GET", "error", null, true, function (data) {
            //console.log(data, this, type);
            //根据权限进行元数据筛选 默认&List存在
            _this.vm.$data.tableData = []; //data;
            if (data != undefined && data) {
                var buttonFlag = 0;
                for (var i in data) {
                    var permission = _this.vm.$refs.asideTree.getNode(data[i].metaCategoryId).data.permission;
                    //test
                    permission = (MetadataManage.metadataPermissionEnum.List
                        | MetadataManage.metadataPermissionEnum.Read
                        //| MetadataManage.metadataPermissionEnum.Add
                        | Math.floor(Math.random() * 2) * MetadataManage.metadataPermissionEnum.Edit
                        | Math.floor(Math.random() * 2) * MetadataManage.metadataPermissionEnum.Delete);
                    //记录每列最多有多少按钮
                    var buttonCount = 0;
                    //元数据可读性（是否显示）
                    if (permission & MetadataManage.metadataPermissionEnum.Read) {
                        data[i].editPermission = permission & MetadataManage.metadataPermissionEnum.Edit ? true : false;
                        data[i].deletePermission = permission & MetadataManage.metadataPermissionEnum.Delete ? true : false;
                        _this.vm.$data.tableData.push(data[i]);
                        if (data[i].editPermission) {
                            buttonCount |= 1;
                        }
                        if (data[i].deletePermission) {
                            buttonCount |= 2;
                        }
                    }
                    buttonFlag = _this.max(buttonFlag, _this.getBitCount(buttonCount));
                }
                //根据按钮数调整列宽度
                _this.vm.$data.tableButtonWidth = 20 + buttonFlag * 38;
                console.log(buttonFlag);
            }
            //添加按钮可用性
            _this.vm.$data.tableAddPermission = type && ((_this.vm.$refs.asideTree.getCurrentNode().permission & MetadataManage.metadataPermissionEnum.Add) != 0);
            //删除按钮操作依赖
            _this.vm.$data.tableDeleteVisible = Array(_this.vm.$data.tableData == undefined ? 0 : _this.vm.$data.tableData.length);
            if ([].fill) {
                _this.vm.$data.tableDeleteVisible.fill(false);
            }
            else { //fill的兼容
                for (var i in _this.vm.$data.tableDeleteVisible) {
                    _this.vm.$data.tableDeleteVisible[i] = false;
                }
            }
            if (callback) {
                callback();
            }
        });
    };
    /**
     * 加载指定目录的元数据内容
     * @param id =0
     */
    MetadataManage.prototype.initTableData = function (id) {
        if (id === void 0) { id = 0; }
        if (id == undefined || id == 0) {
            this.vm.$data.tableData = [];
            return;
        }
        this.setTableData({
            metaCategoryId: id
        });
    };
    /**
     * 通过api进行元数据的添加/修改操作
     * @param callback =null
     */
    MetadataManage.prototype.postTableEdit = function (callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.tableForm, true, function (data) {
            _this.initTableData(_this.vm.$refs.asideTree.getCurrentNode().objectId);
            if (callback) {
                callback();
            }
        });
    };
    /**
     * 通过api进行元数据的删除操作
     * @param id
     * @param callback =null
     */
    MetadataManage.prototype.postTableDelete = function (id, callback) {
        if (callback === void 0) { callback = null; }
        //var url = this.baseUrl + "/api/MetadataManage/Detail";
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail?id=" + id;
        Common.InvokeWebApi(url, "DELETE", "error", null, true, function (data) {
            //this.initTableData();
            if (callback) {
                callback();
            }
        });
    };
    //tableform
    /**
     * 处理元数据form内容,并调用api进行post请求
     */
    MetadataManage.prototype.tableFormConfirm = function () {
        if (this.vm.$data.tableForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
            this.vm.$data.tableForm = this.getForm({
                //metaDetailValue: JSON.stringify(this.vm.$data.metaTableData.keyValueMetadata)
                metaDetailValue: this.getDetailJson(this.vm.$data.metaTableData.keyValueMetadata)
            }, this.vm.$data.tableForm);
        }
        this.vm.$data.tableDialogVisible = false;
        this.postTableEdit();
    };
    //form validate
    /**
     * 重置清空form内容
     * @param formName
     */
    MetadataManage.prototype.resetForm = function (formName) {
        this.vm.$refs[formName].resetFields();
    };
    MetadataManage.MetadataProprertyTypeEnum = {
        String: 0,
        Number: 1,
        DateTime: 2,
        Boolean: 3,
        Entities: 4,
    };
    MetadataManage.mataCategoryTypeList = {
        String: MetadataManage.MetadataProprertyTypeEnum.String,
        Number: MetadataManage.MetadataProprertyTypeEnum.Number,
        DateTime: MetadataManage.MetadataProprertyTypeEnum.DateTime,
        Boolean: MetadataManage.MetadataProprertyTypeEnum.Boolean,
    };
    MetadataManage.metadataPermissionEnum = {
        None: 0,
        /// <summary>
        /// 列举子目录
        /// </summary>
        List: 1,
        Read: 2,
        Add: 4,
        Edit: 8,
        Delete: 16
    };
    return MetadataManage;
}());
//# sourceMappingURL=metadatamanage.js.map