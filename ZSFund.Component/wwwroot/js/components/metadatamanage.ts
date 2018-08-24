//依赖Common.js进行ajax请求操作
class MetadataManage {
    private vm: Vue = null;
    public static MetadataProprertyTypeEnum = {
        String: 0,
        Number: 1,
        DateTime: 2,
        Boolean: 3,
        Entities: 4,
    };
    public static mataCategoryTypeList = {
        String: MetadataManage.MetadataProprertyTypeEnum.String,
        Number: MetadataManage.MetadataProprertyTypeEnum.Number,
        DateTime: MetadataManage.MetadataProprertyTypeEnum.DateTime,
        Boolean: MetadataManage.MetadataProprertyTypeEnum.Boolean,
        //Entities: MetadataManage.MetadataProprertyTypeEnum.Entities
    };
    public static metadataPermissionEnum = {
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
    public Init() {
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
                    metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,//this.$refs.asideTree.getNode(this.tableForm.metaCategoryId).data.metaCategoryType
                    metaDetailName: "",
                    metaDetailValue: "",
                    description: "",
                    sort: 0,
                    isDeleted: false,
                },
                tableFormRules: {
                    metaDetailName: [{ required: true, message: '请输入值名称', trigger: 'blur'}],
                    metaDetailValue: [{ required: true, validator: this.tableEntityCheck, trigger: 'blur'}]
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
                        onClick(picker) {
                            picker.$emit('pick', new Date());
                        }
                    }, {
                        text: '昨天',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '一周前',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', date);
                        }
                    }]
                },
                //entity
            },
            methods: {
                //global
                showEntity: (row) => {
                    return ((<any>this).vm.$refs.asideTree.getNode(row.metaCategoryId).data
                        .metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities);
                },
                //tree      //this.$refs.asideTree
                handleCurrentChange: (data, node)=> {
                    if (!node.isLeaf) {
                        return;
                    }
                    this.initTableData(data.objectId);
                },
                handleTreeAdd: () => {
                    //在class作用域下直接访问this.vm.(...)时
                    //typescript会报类型错误（类型Vue上不存在属性...）
                    //此处使用了类型断言不进行类型检查，后同
                    var node = (<any>this).vm.$refs.asideTree.getCurrentNode();
                    this.vm.$data.treeForm = this.getForm({
                        formTitle: "添加目录",
                        parentId: (node == null ? 0 : node.objectId),
                        metaCategoryPath: (node == null ? "/" : node.metaCategoryPath),
                    }, this.vm.$data.treeForm);
                    this.vm.$data.treeDialogVisible = true;
                },
                handleTreeEdit: ()=> {
                    var node = (<any>this).vm.$refs.asideTree.getCurrentNode();
                    if (node === null) {
                        return;
                    }
                    this.vm.$data.treeForm = this.getForm({
                        formTitle: "修改目录",
                        metaCategoryPath: (node.parentId == null || node.parentId == 0 ? "/" : (<any>this).vm.$refs.asideTree.getNode(node.parentId).data.metaCategoryPath),
                    }, node);
                    if (this.vm.$data.treeForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        //this.metaTreeData = JSON.parse(this.treeForm.keyValueMetadata).Entities;
                        this.vm.$data.metaTreeData = JSON.parse(this.vm.$data.treeForm.keyValueMetadata).Entities.map((ele) => {
                            ele.type = typeof (ele.type) == "number" ? ele.type : parseInt(ele.type);
                            return ele;
                        });
                    }
                    console.log(this.vm.$data.metaTreeData, this.vm.$data.treeForm);
                    this.vm.$data.treeDialogVisible = true;
                },
                handleTreeDelete: ()=> {
                    var node = (<any>this).vm.$refs.asideTree.getCurrentNode();
                    if (node == null) {
                        return;
                    }
                    this.postTreeDelete(node.objectId, () => {
                        (<any>this).vm.$refs.asideTree.remove(node.objectId);
                    });
                },
                handleTreeReset: ()=> {
                    (<any>this).vm.$refs.asideTree.setCurrentKey(null);
                },
                //treeForm
                handleTreeFormAdd: ()=> {
                    this.vm.$data.metaTreeData.push({
                        name: "",
                        type: MetadataManage.MetadataProprertyTypeEnum.String
                    });
                },
                handleTreeFormDelete: (index, row)=> {
                    this.vm.$data.metaTreeData.splice(index, 1);
                },
                //tree permission
                handleTreePermission: () => {
                    var node = (<any>this).vm.$refs.asideTree.getCurrentNode();
                    if (node === null) {
                        return;
                    }

                    this.vm.$data.treePermissionDialogVisible = true;
                    this.getPermission(node.objectId);
                    //this.vm.$data.treePermission = [];
                },
                handlePermissionAdd: () => {
                    this.vm.$data.treePermission.push({
                        memberId: "",
                        permission: MetadataManage.metadataPermissionEnum.List,
                        checkList: []
                    });
                },
                handlePermissionDelete: (index, row) => {
                    this.vm.$data.treePermission.splice(index, 1);
                },
                handlePermissionConfirm: () => {
                    var list = [];
                    for (var i in this.vm.$data.treePermission) {
                        var obj = this.vm.$data.treePermission[i];
                        for (var j in obj.checkList) {
                            obj.permission |= obj.checkList[j];
                        }
                        if (obj.memberId != "") {
                            list.push(obj);
                        }
                    }
                    this.vm.$data.treePermissionDialogVisible = false;
                    this.vm.$data.treePermission = list; 
                    //post api
                    console.log(this.vm.$data.treePermission);
                },
                //table
                handleSearch: ()=> {
                    if (this.vm.$data.searchInput == "") {
                        return;
                    }
                    this.setTableData({
                        keyWord: this.vm.$data.searchInput
                    }, () => {
                        (<any>this).vm.handleTreeReset();
                        this.vm.$data.searchInput = "";
                    });
                },
                handleTableAdd: ()=> {
                    var node = (<any>this).vm.$refs.asideTree.getCurrentNode();
                    if (node == null || !(<any>this).vm.$refs.asideTree.getNode(node.objectId).isLeaf) {
                        return;
                    }
                    this.vm.$data.tableForm = this.getForm({
                        formTitle: "添加属性",
                        categoryPath: node.metaCategoryPath,
                        metaCategoryId: node.objectId,
                        metaCategoryType: (<any>this).vm.$refs.asideTree.getNode(node.objectId).data.metaCategoryType,
                        //metaDetailValue:
                    }, this.vm.$data.tableForm);
                    if (node.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        this.vm.$data.metaTableData = this.getType(node.objectId);
                    }
                    //this.vm.$data.tableDeleteVisible.push(false);
                    this.vm.$data.tableDialogVisible = true;
                },
                handleTableEdit: (index, row)=> {
                    var node = (<any>this).vm.$refs.asideTree.getNode(this.vm.$data.tableData[index].metaCategoryId).data;
                    this.vm.$data.tableForm = this.getForm({
                        formTitle: "修改属性",
                        categoryPath: node.metaCategoryPath,
                        metaCategoryType: (<any>this).vm.$refs.asideTree.getNode(this.vm.$data.tableData[index].metaCategoryId).data.metaCategoryType
                    }, this.vm.$data.tableData[index]);
                    if (node.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
                        this.vm.$data.metaTableData = {
                            metaCategoryType: node.metaCategoryType,
                            //keyValueMetadata: JSON.parse(this.vm.$data.tableData[index].metaDetailValue)
                            keyValueMetadata: this.getKeyValueData(this.vm.$data.tableData[index])
                        };
                    }
                    this.vm.$data.tableDialogVisible = true;
                },
                handleTableDelete: (index, row)=> {
                    this.postTableDelete(row.objectId, () => {
                        this.vm.$data.tableData.splice(index, 1);
                        this.vm.$data.tableDeleteVisible.splice(index, 1);
                    });
                },
                //tableForm
                //form validate
                validateForm: (formName)=> {
                    //var _this = this;
                    (<any>this).vm.$refs[formName].validate((valid) => {
                        if (valid) {
                            //eval("this." + formName + "Confirm()");
                            if (formName == 'treeForm') {
                                this.treeFormConfirm();
                            } else if (formName == "tableForm") {
                                this.tableFormConfirm();
                            } else {

                            }
                        } else {
                            return false;
                        }
                    });
                },
            },
            watch: {
                treeDialogVisible: (newVal, oldVal)=> {
                    if (newVal == true) {
                        //初始化通用值
                        this.vm.$data.externSwitch = this.vm.$data.treeForm.isExternal ? "on" : "off";
                    } else {
                        //还原为初始值
                        this.vm.$data.treeForm = {
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
                        this.vm.$data.metaTreeData = [{
                            name: "",
                            type: MetadataManage.MetadataProprertyTypeEnum.String
                        }];
                        this.vm.$data.externSwitch = "off";
                        this.resetForm("treeForm");
                    }
                },
                tableDialogVisible: (newVal, oldVal)=> {
                    if (newVal) { }
                    else {
                        this.vm.$data.tableForm = {
                            formTitle: "",
                            objectId: 0,
                            categoryPath: "/",
                            metaCategoryId: 0,
                            metaCategoryType: MetadataManage.MetadataProprertyTypeEnum.String,//this.$refs.asideTree.getNode(this.tableForm.metaCategoryId).data.metaCategoryType
                            metaDetailName: "",
                            metaDetailValue: "",
                            description: "",
                            sort: 0,
                            isDeleted: false,
                        };
                        this.vm.$data.metaTableData = [{
                            name: "",
                            value: "",
                            type: MetadataManage.MetadataProprertyTypeEnum.String,
                            typeName: ""
                        }];
                        this.resetForm("tableForm");
                    }
                },
                externSwitch: (newVal, oldVal)=> {
                    this.vm.$data.treeForm.isExternal = newVal == "on" ? true : false;
                }
            },
            updated: function(){
                //使之前选择的节点恢复高亮
                var node = this.$refs.asideTree.getCurrentNode();
                if (node != null) {
                    this.$refs.asideTree.setCurrentKey(node.objectId);
                }
            }
        });
        this.initTreeData();
    }

//global
    //在某个对象中，通过value得到key
    private findkey(obj, value, compare = (a, b) => a === b) {
        //es6
        //return Object.keys(obj).find(val => compare(obj[val], value));
        //es5

        //normal
        for (var key in obj) {
            if (obj[key] == value) {
                return key;
            }
        }
        return undefined;
    }
    //得到被sub（subform）更新后的form
    private getForm(sub, form) {
        form = $.extend(true, {}, form);//深拷贝
        for (var key in sub) {
            form[key] = sub[key];
        }
        return form;
    }
    //把数组数据中的name-value整合为key-value对象
    private getDetailJson(data) {
        var res = {};
        for (var i in data) {
            res[data[i].name] = data[i].value;
        }
        return JSON.stringify(res);
    }
    //统计二进制有效位数
    private getBitCount(number) {
        var count = 0;
        while (number) {
            count += number & 1;
            number /= 2;
        }
        return count;
    }
    //返回二进制位对应的数字数组
    private getBitArray(number) {
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
    }
//message
    private showMessage(option) {// { message:"", type:"success" }
        (<any>this).vm.$message(option);
    }
//tree
    //目录节点为Enitity时调用
    //得到enitity的各个属性名和类型
    private getType(objectId) {
        var node = (<any>this).vm.$refs.asideTree.getNode(objectId);
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
    }
    //通过api加载目录树内容
    private initTreeData() {
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category", para = "";
        Common.InvokeWebApi(url, "GET", "error", "", true, (data) => {
            this.vm.$data.treeData = data;
            //this.calcTypeMap(data);
            console.log(this.vm.$data.treeData);
        });
        url = this.vm.$data.baseUrl + "/api/MetadataManage/IsAdmin";
        Common.InvokeWebApi(url, "GET", "error", "", true, (data) => {
            this.vm.$data.isAdmin = data;
        });
    }
    //通过api进行目录树节点的添加/修改操作
    private postTreeEdit() {
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.treeForm, true, (data) => {
            this.initTreeData();
        });
    }
    //通过api进行目录树节点的删除操作
    private postTreeDelete(id, callback = null) {
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Category";
        Common.InvokeWebApi(url, "DELETE", "error", {
            id: id
        }, true, (data) => {
            //this.initTreeData();
            if (callback) {
                callback();
            }
        });
    }
//treeform
    private treeFormConfirm() {
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
                    })
                //}
            }
            this.vm.$data.treeForm = this.getForm({
                keyValueMetadata: JSON.stringify(obj),
                metaCategoryPath: this.vm.$data.treeForm.metaCategoryPath + "/" + this.vm.$data.treeForm.metaCategoryName
            }, this.vm.$data.treeForm);
        }
        this.vm.$data.treeDialogVisible = false;
        this.postTreeEdit();
    }
//tree permission
    private getPermission(id = 0) {
        if (id == undefined || id == 0) {
            this.vm.$data.treePermission = [];
            return;
        }
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Permission?categoryId=" + id;
        Common.InvokeWebApi(url, "GET", "error", "", true, (data) => {
            for (var i in data) {
                data[i].checkList = this.getBitArray(data[i].permission);
            }
            this.vm.$data.treePermission = data;
        });
    }
    private postPermission(permission) {

    }
//table
    //通过带name-value值的obj对象，返回key-value数组
    private getKeyValueData(obj) {
        var arr = this.getType(obj.metaCategoryId).keyValueMetadata;
        var value = JSON.parse(obj.metaDetailValue);
        for (var i in arr) {
            arr[i].value = value[arr[i].name];
        }
        return arr;
    }
    //通过api加载元数据表格
    private setTableData(obj, callback = null) {
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail";
        var type = obj.keyWord == undefined;//false为搜索
        Common.InvokeWebApi(url, "GET", "error", obj, true, (data) => {
            //console.log(data, this, type);
            //根据权限进行元数据筛选 默认&List存在
            this.vm.$data.tableData = [];//data;
            if (data != undefined && data) {
                //记录每列最多有多少按钮
                var buttonCount = 0b0;
                for (var i in data) {
                    var permission = (<any>this).vm.$refs.asideTree.getNode(data[i].metaCategoryId).data.permission;
                        //test
                        permission = (
                            MetadataManage.metadataPermissionEnum.List
                            | MetadataManage.metadataPermissionEnum.Read
                            //| MetadataManage.metadataPermissionEnum.Add
                            | Math.floor(Math.random() * 2) * MetadataManage.metadataPermissionEnum.Edit
                            | Math.floor(Math.random() * 2) * MetadataManage.metadataPermissionEnum.Delete
                    );
                    //元数据可读性（是否显示）
                    if (permission & MetadataManage.metadataPermissionEnum.Read) {
                        data[i].editPermission = permission & MetadataManage.metadataPermissionEnum.Edit ? true : false;
                        data[i].deletePermission = permission & MetadataManage.metadataPermissionEnum.Delete ? true : false;
                        this.vm.$data.tableData.push(data[i]);
                        if (data[i].editPermission) {
                            buttonCount |= 0b1;
                        }
                        if (data[i].deletePermission) {
                            buttonCount |= 0b10;
                        }
                    }
                }
                //根据按钮数调整列宽度
                this.vm.$data.tableButtonWidth = 20 + this.getBitCount(buttonCount) * 38;
            }
            //添加按钮可用性
            this.vm.$data.tableAddPermission = type && (
                ((<any>this).vm.$refs.asideTree.getCurrentNode().permission & MetadataManage.metadataPermissionEnum.Add) != 0
            );
            //删除按钮操作依赖
            this.vm.$data.tableDeleteVisible = Array(this.vm.$data.tableData == undefined ? 0 : this.vm.$data.tableData.length);
            if ((<any>[]).fill) {
                this.vm.$data.tableDeleteVisible.fill(false);
            } else {//fill的兼容
                for (var i in this.vm.$data.tableDeleteVisible) {
                    this.vm.$data.tableDeleteVisible[i] = false;
                }
            }
            if (callback) {
                callback();
            }
        });
    }
    //加载元数据内容
    private initTableData(id = 0) {
        if (id == undefined || id == 0) {
            this.vm.$data.tableData = [];
            return;
        }
        this.setTableData({
            metaCategoryId: id
        });
    }
    //通过api进行元数据的添加/修改操作
    private postTableEdit() {
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail";
        Common.InvokeWebApi(url, "POST", "error", this.vm.$data.tableForm, true, (data) => {
            this.initTableData((<any>this).vm.$refs.asideTree.getCurrentNode().objectId);
        })
    }
    //通过api进行元数据的删除操作
    private postTableDelete(id, callback = null) {
        //var url = this.baseUrl + "/api/MetadataManage/Detail";
        var url = this.vm.$data.baseUrl + "/api/MetadataManage/Detail?id=" + id;
        Common.InvokeWebApi(url, "DELETE", "error", null, true, (data) => {
            //this.initTableData();
            if (callback) {
                callback();
            }
        })
    }
//tree tableform
    private tableFormConfirm() {
        if (this.vm.$data.tableForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Entities) {
            this.vm.$data.tableForm = this.getForm({
                //metaDetailValue: JSON.stringify(this.vm.$data.metaTableData.keyValueMetadata)
                metaDetailValue: this.getDetailJson(this.vm.$data.metaTableData.keyValueMetadata)
            }, this.vm.$data.tableForm);
        }
        this.vm.$data.tableDialogVisible = false;
        this.postTableEdit();
    }
//form validate
    private resetForm(formName) {
        (<any>this).vm.$refs[formName].resetFields();
    }

    private treeEntityCheck = (rule, value, callback) => {
        if (this.vm.$data.treeForm.metaCategoryType != MetadataManage.MetadataProprertyTypeEnum.Entities) {
            callback();
        } else {
            var arr = this.vm.$data.metaTreeData;
            for (var i in arr) {
                if (arr[i].name == "") {
                    callback(new Error("请输入值名称"));
                    return;
                }
            }
            callback();
        }
        
    }
    private tableEntityCheck = (rule, value, callback) => {
        if (this.vm.$data.tableForm.metaCategoryType == MetadataManage.MetadataProprertyTypeEnum.Number) {
            var number = this.vm.$data.tableForm.metaDetailValue;
            if (((/^(-?\d+)(\.\d+)?$/)).test(number)) {
                callback();
            } else {
                callback(new Error("请输入数字值"));
            }
        }else if (this.vm.$data.tableForm.metaCategoryType != MetadataManage.MetadataProprertyTypeEnum.Entities) {
            if (this.vm.$data.tableForm.metaDetailValue === "" || this.vm.$data.tableForm.metaDetailValue===null) {
                callback(new Error("请输入Value项"));
            } else {
                callback();
            }
        } else {
            var arr = this.vm.$data.metaTableData.keyValueMetadata;
            for (var i in arr) {
                if (arr[i].value === undefined || arr[i].value===null ||arr[i].value==="") {
                    callback(new Error("请输入Value项"))
                    return;
                }
            }
            callback();
        }
    }
}

