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
                placeholder="输入商户名"
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
          <!--表单渲染-->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="570px">
            <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="商户名" prop="merchantNo">
              <el-select v-model="form.merchantNo" @keydown.native="keydown($event)" >
                <el-option
                  v-for="item in ['nextpls','sunray']"
                    :key="item"
                    :label="item"
                    :value="item"
                    />
              </el-select>
            </el-form-item>
            <el-form-item  label="业务类型" prop="paymentTypes">
                <el-select
                    v-model="paymentTypeDatas"
                    style="width: 437px"
                    multiple
                    placeholder="请选择"
                    @remove-tag="deletePaymentTypeData"
                    @change="changePaymentType"
                >
                <el-option
                    v-for="item in paymentTypeList"
                    :key="item.text"
                    :label="item.text"
                    :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="币种" prop="currencies">
                <el-select
                    v-model="currencyDatas"
                    style="width: 437px"
                    multiple
                    placeholder="请选择"
                    @remove-tag="deleteCurrencyData"
                    @change="changeCurrency"
                >
                <el-option
                    v-for="item in currenciesList"
                    :key="item.text"
                    :label="item.text"
                    :value="item.text"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="汇率源" prop="sourcePriceType">
                <el-select v-model="form.sourcePriceType">
                    <el-option 
                        v-for="item in sourcePriceTypList"
                        :key="item.value"
                        :label="item.text"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="汇率加点" prop="gradientRates">
                <el-text v-for="(gradientPrice,index) in form.gradientRates" :key="gradientPrice" style="padding-bottom:10px">
                    <el-select v-model="gradientPrice.type" style="width:20%">
                        <el-option
                            v-for="item in serviceTypeList"
                            :key="item.text"
                            :label="item.text"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input v-model="gradientPrice.fixedAmount" style="width:20%;margin-left:2%;">
                        <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"CNY"}} 
                        </em>
                    </el-input>
                    <span style="margin:0px 1%;">{{","}}</span>
                    <el-select style="width:20%" v-model="gradientPrice.priceType" slot="prepend" placeholder="定价">                  
                        <el-option v-for="(value,key,index) in priceTypeMap" :key="index" :label="value" :value="key"></el-option>
                    </el-select>
                    <el-input v-model="gradientPrice.point" style="width:20%;margin-left:2%;">
                        <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"点"}} 
                        </em>
                    </el-input>
                    <el-button style="width: 8%;" type="danger"  icon="el-icon-delete" circle @click="delGradientPrices(form,index)"></el-button>

                </el-text>
                <el-button type="primary" style="width :100%;margin-top: 10px;" round @click="clickAddGradientPrices(form)">添加</el-button>

            </el-form-item>
            
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
          </el-dialog>
          <!--表格渲染-->
          <el-table ref="table" @filter-change="filterChange" v-loading="crud.loading" :data="crud.data" style="width: 100%; height: 100%" @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <!-- <el-table-column :show-overflow-tooltip="true" prop="id" style="width:10px" label="用户id" /> -->
            <el-table-column :show-overflow-tooltip="true" prop="merchantNo" label="商户名称" />
            <el-table-column prop="paymentTypes" label="业务" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" >
                <template slot-scope="scope">
                    <el-tag v-for="tag in scope.row.paymentTypes" :key="tag">
                        {{paymentTypeMap[tag]}}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="currencies" label="货币" column-key="currenciesFilter" :filters="this.currenciesList">
                <template slot-scope="scope">
                    <el-tag v-for="tag in scope.row.currencies" :key="tag">
                        {{tag}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="sourcePlatform,sourcePriceType" column-key="sourcePriceTypeFilter" :filters="getSourcePriceTypeList()" label="汇率源" >
                <template slot-scope="scope">
                    <el-tag>
                        {{scope.row.sourcePlatform}}{{sourcePriceTypMap[scope.row.sourcePriceType]}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="gradientRates" label="汇率加点">
                <template slot-scope="scope">
                    <el-tag v-for="priceMap in scope.row.gradientRates" :key="priceMap">
                        {{serviceTypeMap[priceMap.type]}} {{priceMap.fixedAmount}} {{","}} {{priceTypeMap[priceMap.priceType]}}{{priceMap.point}} 
                    </el-tag>

                </template>
            </el-table-column>
                
            <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135px" label="创建日期" />
            <el-table-column
              v-if="checkPer(['admin','rate:add','rate:edit','rate:del'])"
              label="操作"
              width="115"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <udOperation
                  :data="scope.row"
                  :permission="permission"
                  :disabled-dle="scope.row.id === user.id"
                />
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
  import crudRate from '@/api/system/rate'
  import { isvalidPhone } from '@/utils/validate'
  import CRUD, { presenter, header, form, crud, params} from '@crud/crud'
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
  const defaultForm = { id: null, merchantNo: 'nextpls', gradientRates:[],paymentTypes: null, currencies: null, sourcePlatform: null,sourcePriceType:null,priceType:null }
  var paymentTypeDatas = []; // 多选时使用
  var currencyDatas = [];
  var paymentTypeMap,priceTypeMap,sourcePriceTypMap = {};

  export default {
    name: 'Rate',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '汇率', url: 'api/rate', crudMethod: { ...crudRate },params:{merchantNo:"nextpls,sunray"}})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    data() {
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        currencyDatas : [], paymentTypeDatas: [], // 多选时使用
        // 缴费类型 0-学费 1-生活费 2-保证金 3-保险 4-房租 5-医疗
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租", 5:"医疗"},
        priceTypeMap : {add:"加",sub:"减",mul:"乘",div:"除"},
        serviceTypeMap : {lessEqual : "<=",greater : ">"},
        sourcePriceTypMap : {spotBuy:"现汇买入",spotSell:"现汇卖出",cashBuy:"现钞买入",cashSell:"现钞卖出",price:"熊猫汇率"},
    
        // 缴费选项
        paymentTypeList : [],
        // 币种选项
        // AUD、CAD、CHF、EUR、GBP、HKD、JPY、KRW、NZD、SGD、SW、USD
        currenciesList : [{text:"USD",value:"USD"},{text:"EUR",value:"EUR"},{text:"GBP",value:"GBP"},
        {text:"AUD",value:"AUD"},{text:"CAD",value:"CAD"},{text:"CHF",value:"CHF"},
        {text:"HKD",value:"HKD"},{text:"JPY",value:"JPY"},{text:"KRW",value:"KRW"},{text:"NZD",value:"NZD"},
        {text:"SGD",value:"SGD"},{text:"SW",value:"SW"},{text:"MYR",value:"MYR"},{text:"THB",value:"THB"}],
        sourcePriceTypList : [],
        permission: {
          add: ['admin', 'rate:add'],
          edit: ['admin', 'rate:edit'],
          del: ['admin', 'rate:del']
        },
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
      this.crud.msg.add = '新增汇率成功'
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
      getSourcePriceTypeList() {
        const list = [];
        for (var key in this.sourcePriceTypMap) {
            list.push({text:this.sourcePriceTypMap[key],value:key});
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
            this.crud.toQuery();
        },
      changePaymentType(value) {
        paymentTypeDatas = []
        value.forEach(function(data, index) {
            paymentTypeDatas.push(data);
        })
      },
      clickAddGradientPrices(form) {
        console.log(form)
        if (!form.gradientRates) {
          form.gradientRates = []
        }
        form.gradientRates.push({
            amount:0,
            currency:"CNY",
            fixedAmount:0,
            type:"",
        })
      },
      changeCurrency(value) {
        currencyDatas = []
        value.forEach(function(data, index) {
            currencyDatas.push(data);
        })
      },
      deletePaymentTypeData(value,list) {
        this.paymentTypeDatas.forEach(function(data, index) {
          if (data.index === value) {
            this.paymentTypeDatas.splice(index, value)
          }
        })
      },
      deleteCurrencyData(value,list) {
        this.currencyDatas.forEach(function(data, index) {
          if (data === value) {
            this.paymentTypeDatas.splice(index, value)
          }
        })
      },
      getServiceTypeList() {
        const list = []
        for (var key in this.serviceTypeMap) {
            list.push({text:this.serviceTypeMap[key],value:key});
        }
        return list;
      },
      delGradientPrices(form,index) {
        form.gradientRates.splice(index,1);
      },
      // 新增与编辑前做的操作
      [CRUD.HOOK.afterToCU](crud, form) {
        this.paymentTypeList = this.getPaymentTypeList()
        this.serviceTypeList = this.getServiceTypeList()
        this.sourcePriceTypList = this.getSourcePriceTypeList()
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd]() {
        this.currencyDatas = []
        this.paymentTypeDatas = []
      },
      // 初始化编辑时候的角色与岗位
      [CRUD.HOOK.beforeToEdit](crud, form) {
        // 先清空
        this.paymentTypeDatas = [];
        this.currencyDatas =[];
        const _this = this
        form.paymentTypes.forEach(function(paymentType, index) {
            _this.paymentTypeDatas.push(paymentType);
        });

        form.currencies.forEach(function(currency, index) {
            _this.currencyDatas.push(currency);
        });

      },
      // 提交前做的操作
      [CRUD.HOOK.afterValidateCU](crud) {
        if (this.paymentTypeDatas.length === 0) {
            this.$message({
            message: '业务类型不能为空',
            type: 'warning'
            })
            return false
        } else if (this.currencyDatas.length == 0) {
            this.$message({
                message: '币种不能为空',
                type: 'warning'
            })
            return false
        }
        this.form.paymentTypes = this.paymentTypeDatas;
        this.form.currencies = this.currencyDatas;
        if (this,form.merchantNo == 'nextpls') {
          this.form.sourcePlatform = 'nextpls';
        } else {
          this.form.sourcePlatform = 'BOC';
        }
        return true
      },
      
      checkboxT(row, rowIndex) {
        return row.id !== this.user.id
      }
    }
  }
  </script>
  
  <style rel="stylesheet/scss" lang="scss" scoped>
    ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
      height: 30px;
      line-height: 30px;
    }
    .el-select .el-input {
        width: 130px;
    }
  </style>
  