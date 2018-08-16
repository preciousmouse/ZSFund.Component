//依赖Common.js进行ajax请求操作
var MetadataManage = /** @class */ (function () {
    function MetadataManage() {
        this.vm = null;
    }
    MetadataManage.prototype.Init = function () {
        var _this = this;
        this.vm = new Vue({
            el: "#app",
            data: {
                //global
                baseUrl: "http://10.10.0.175:8088",
                mataCategoryTypeList: {
                    String: MetadataManage.MetadataProprertyTypeEnum.String,
                    Number: MetadataManage.MetadataProprertyTypeEnum.Number,
                    DateTime: MetadataManage.MetadataProprertyTypeEnum.DateTime,
                    Boolean: MetadataManage.MetadataProprertyTypeEnum.Boolean,
                },
                //tree
                props: {
                    label: 'metaCategoryName',
                    children: 'inverseParent'
                },
                treeData: [],
                metaTypeMap: {},
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
                //name: [{ required: true, message: '请输入名称', trigger: 'blur'}],
                },
                formLabelWidth: '90px',
                externSwitch: "off",
                metaTreeData: [{
                        name: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String
                    }],
                //search
                searchInput: "",
                //table
                tableData: [],
                tableDeleteVisible: [],
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
                tableFormRules: {},
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
                //entity
                metaTableData: [{
                        name: "",
                        value: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String,
                        typeName: ""
                    }],
            },
            methods: {
                //global
                //tree      //this.$refs.asideTree
                handleCurrentChange: function (data, node) {
                    if (!node.isLeaf) {
                        return;
                    }
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
                //table
                handleSearch: function () {
                    if (_this.vm.$data.searchInput == "") {
                        return;
                    }
                    _this.vm.$data.setTableData({
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
                    _this.vm.$data.tableDeleteVisible.push(false);
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
                            keyValueMetadata: JSON.parse(_this.vm.$data.tableData[index].metaDetailValue)
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
                            else {
                                _this.tableFormConfirm();
                            }
                        }
                        else {
                            console.log("error");
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
    //在某个对象中，通过value得到key
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
    //得到被sub（subform）更新后的form
    MetadataManage.prototype.getForm = function (sub, form) {
        form = $.extend(true, {}, form); //深拷贝
        for (var key in sub) {
            form[key] = sub[key];
        }
        return form;
    };
    //tree
    //目录节点为Enitity时调用
    //得到enitity的各个属性名和类型
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
                typeName: this.findkey(this.vm.$data.mataCategoryTypeList, parseInt(entity[i].type))
            });
        }
        return obj;
    };
    //通过api加载目录树内容
    MetadataManage.prototype.initTreeData = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category", para = "";
        Common.InvokeWebApi(url, "GET", "error", "", true, function (data) {
            _this.vm.$data.treeData = data;
            //this.calcTypeMap(data);
            console.log(_this.vm.$data.treeData);
        });
    };
    //通过api进行目录树节点的添加/修改操作
    MetadataManage.prototype.postTreeEdit = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.treeForm, true, function (data) {
            _this.initTreeData();
        });
    };
    //通过api进行目录树节点的删除操作
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
    MetadataManage.prototype.treeFormConfirm = function () {
        if (this.vm.$data.treeForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
            var obj = {
                "KeyType": MetadataManage.MetadataProprertyTypeEnum.Entities,
                "Entities": []
            };
            for (var ele in this.vm.$data.metaTreeData) {
                var name = this.vm.$data.metaTreeData[ele].name;
                var type = this.vm.$data.metaTreeData[ele].type;
                if (name != "") {
                    obj.Entities.push({
                        "name": name,
                        "type": type.toString()
                    });
                }
            }
            this.vm.$data.treeForm = this.getForm({
                keyValueMetadata: JSON.stringify(obj),
                metaCategoryPath: this.vm.$data.treeForm.metaCategoryPath + "/" + this.vm.$data.treeForm.metaCategoryName
            }, this.vm.$data.treeForm);
        }
        this.postTreeEdit();
        this.vm.$data.treeDialogVisible = false;
    };
    //table
    //通过api加载元数据表格
    MetadataManage.prototype.setTableData = function (obj, callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail";
        Common.InvokeWebApi(url, "GET", "error", obj, true, function (data) {
            _this.vm.$data.tableData = data;
            console.log(data);
            _this.vm.$data.tableDeleteVisible = Array(data == undefined ? 0 : data.length);
            _this.vm.$data.tableDeleteVisible.fill(false);
            if (callback) {
                callback();
            }
        });
    };
    //加载元数据内容
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
    //通过api进行元数据的添加/修改操作
    MetadataManage.prototype.postTableEdit = function () {
        var _this = this;
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.tableForm, true, function (data) {
            _this.initTableData(_this.vm.$refs.asideTree.getCurrentNode().objectId);
        });
    };
    //通过api进行元数据的删除操作
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
    MetadataManage.prototype.tableFormConfirm = function () {
        if (this.vm.$data.tableForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
            this.vm.$data.tableForm = this.getForm({
                metaDetailValue: JSON.stringify(this.vm.$data.metaTableData.keyValueMetadata)
            }, this.vm.$data.tableForm);
        }
        this.postTableEdit();
        this.vm.$data.tableDialogVisible = false;
    };
    //form validate
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
    return MetadataManage;
}());
//# sourceMappingURL=metadatamanage.js.map