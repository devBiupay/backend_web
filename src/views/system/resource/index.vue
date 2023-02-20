<template>
    <div class="app-container">
      <el-row :gutter="20">
        <!--用户数据-->
        <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20" style="width:100%">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input
                v-model="query.blurry"
                clearable
                size="small"
                placeholder="输入机构编号或名字"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="crud.toQuery"
              />
              <date-range-picker v-model="query.createTime" class="date-item" />
              <rrOperation />
            </div>
            <!-- 增删改查用户 -->
            <crudOperation show="" :permission="permission" />
          </div>
          <!--表格渲染-->
          <el-table ref="table" @filter-change="filterChange" v-loading="crud.loading" :data="crud.data" style="width: 100%; height: 100%" @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <!-- <el-table-column :show-overflow-tooltip="true" prop="id" style="width:10px" label="用户id" /> -->
            <el-table-column :show-overflow-tooltip="true" width="55" prop="id" label="机构id" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="机构名" />
            <el-table-column prop="nameEn" label="机构中文名">
              <template slot-scope="scope">
                <input type="text" v-model="scope.row.nameEn" v-show="iseditor(scope.row.id)" />
                <span v-show="!iseditor(scope.row.id)">{{scope.row.nameEn}}</span>
              </template>
            </el-table-column>

            <el-table-column prop="paymentType" label="业务" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" >
              <template slot-scope="scope">
                <el-select v-model="scope.row.paymentType" v-show="iseditor(scope.row.id)">
                    <el-option 
                        v-for="item in paymentTypeList"
                        :key="item.value"
                        :label="item.text"
                        :value="item.value"
                    />
                </el-select>
                <!-- <el-select v-model="scope.row.paymentType"
                          multiple
                          :multiple-limit="paymentTypeMap"
                          >

                </el-select>
                <input type="text" v-model="scope.row.paymentType" v-show="iseditor(scope.row.id)" /> -->
                <span v-show="!iseditor(scope.row.id)">{{paymentTypeMap[scope.row.paymentType]}}</span>
              </template>
            </el-table-column>

            <el-table-column prop="country" label="国家码" column-key="countryFilter" :filters="this.countryList" />
            <el-table-column prop="currency" label="货币" column-key="currencyFilter" :filters="this.currencyList" />
            <el-table-column :show-overflow-tooltip="true" prop="code" label="机构代码" />
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button type="warning" @click="edit(scope.row, scope)">编辑</el-button>
                <el-button type="danger" @click="save(scope.row)">保存</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  import crudResource from '@/api/system/resource'
  import { isvalidPhone } from '@/utils/validate'
  import CRUD, { presenter, header, form, crud } from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'
  import DateRangePicker from '@/components/DateRangePicker'
  import Treeselect from '@riophae/vue-treeselect'
  import { mapGetters } from 'vuex'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
  let userRoles = []
  let userJobs = []

//   {
//     "merchantNo" : "bp",
//     "paymentTypes" : ["0","1"],
//     "currencies" : ["EUR"],
//     "sourcePlatform" : "boc",
//     "sourcePriceType":"spotSell",
//     "priceType":"add",
//     "point":5
// }
  const defaultForm = { id: null, merchantNo: 'biupay', paymentTypes: null, spotFee: null, fullFee: null,gradientPrices:null }

  var paymentTypeMap = {};

  export default {
    name: 'Resource',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '机构表', url: 'api/resource', crudMethod: { ...crudResource }})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    data() {
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        currencyDatas : [], serviceTypeDatas: [], // 多选时使用
        // 缴费类型 0-学费 1-生活费 2-保证金 3-保险 4-房租 5医疗
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租", 5:"医疗"},
        paymentTypeList : [{value:0 ,text: "学费"},{value: 1 ,text: "生活费"},
                    {value: 2 ,text: "保证金"}, {value:3,text : "保险"},{value: 4 ,text : "房租"},{value: 5,text: "医疗"}],

        countryList : [{text:'DE',value:'DE'},{text:'GBR',value:'GBR'},{text:"KO",value:'KO'},{text:"MY",value:"MY"}],
        currencyList : [{text:'EUR',value:'EUR'},{text:'GBP',value:'GBP'},{text:"KRW",value:'KRW'},{text:"AUD",value:'AUD'},{text:"MYR",value:"MYR"}],
        serviceTypeMap : {lessEqual : "<=",greater : ">"},
        permission: {
          add: ['admin', 'fee:add'],
          edit: ['admin', 'fee:edit'],
          del: ['admin', 'fee:del']
        },
        editId: '',
        rules: {
        }
      }
    },
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    created() {
      this.crud.msg.add = '新增机构成功'
    },
    mounted: function() {
      const that = this
      window.onresize = function temp() {
        that.height = document.documentElement.clientHeight - 180 + 'px;'
      }
    },
    methods: {
      // 禁止输入空格
      keydown(e) {
        if (e.keyCode === 32) {
          e.returnValue = false
        }
      },
      edit(row,index) {
        console.log(row);
        this.editId = row.id;
      },
      save(row,index) {
        this.editId = '';
        crudResource.edit(row);
      },
      iseditor(id) {
        return this.editId == id;
      },
      getSourcePriceTypeList() {
        const list = [];
        for (var key in this.sourcePriceTypMap) {
            list.push({text:this.sourcePriceTypMap[key],value:key});
        }
        return list;
      },
      getServiceTypeList() {
        const list = []
        for (var key in this.serviceTypeMap) {
            list.push({text:this.serviceTypeMap[key],value:key});
        }
        return list;
      },
      getPaymentTypeList() {
        const list = []
        for (var key in this.paymentTypeMap) {
            list.push({text:this.paymentTypeMap[key],value:key});
        }
        return list;
      },
      // 监听筛选项的变化
      filterChange(filterObj) {
            console.log(filterObj.currenciesFilter);
            if (filterObj.paymentTypeFilter) {
                this.query.paymentTypes = filterObj.paymentTypeFilter.toString();
            } 
            if (filterObj.currenciesFilter) {
                this.query.currencies = filterObj.currenciesFilter.toString();
            }
            if (filterObj.sourcePriceTypeFilter) {
                this.query.sourcePriceType = filterObj.sourcePriceTypeFilter.toString();
            }
            if (filterObj.countryFilter) {
                this.query.country = filterObj.countryFilter.toString();
            }
            if (filterObj.currencyFilter) {
                this.query.currency = filterObj.currencyFilter.toString();
            }
            this.crud.toQuery();
        },
      changePaymentType(value) {
        paymentTypeDatas = []
        value.forEach(function(data, index) {
            paymentTypeDatas.push(data);
        })
      },
      deletePaymentTypeData(value,list) {
        this.paymentTypeDatas.forEach(function(data, index) {
          if (data.index === value) {
            this.paymentTypeDatas.splice(index, value)
          }
        })
      },
      clickAddGradientPrices(form) {
        console.log(form)
        form.gradientPrices.push({
            amount:0,
            currency:"CNY",
            fixedAmount:0,
            type:"",
        })
      },
      // 新增与编辑前做的操作
      [CRUD.HOOK.afterToCU](crud, form) {
        this.paymentTypeList = this.getPaymentTypeList()
        // this.serviceTypeList = this.getServiceTypeList()
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd]() {
      },
      // 初始化编辑时候的角色与岗位
      [CRUD.HOOK.beforeToEdit](crud, form) {
        // 先清空
        this.paymentTypeDatas = [];
        // this.currencyDatas =[];
        const _this = this
        form.paymentTypes.forEach(function(paymentType, index) {
            _this.paymentTypeDatas.push(paymentType);
        });

        // form.currencies.forEach(function(currency, index) {
        //     _this.currencyDatas.push(currency);
        // });
      },
      // 提交前做的操作
      [CRUD.HOOK.afterValidateCU](crud) {
        return true
      },
      
      checkboxT(row, rowIndex) {
        return row.id !== this.user.id
      }
    }
  }
  </script>
  
  <style rel="stylesheet/scss" lang="scss">
    .el-form-item--small.el-form-item {
        width: 100%;
    }
    .el-form-item{
        .el-form-item {
            width:100%;
        }
        .el-form-item__content {
            width: 80%;
        }
    }
    // .el-select .el-input {
    //     width: 130px;
    // }
  </style>
  