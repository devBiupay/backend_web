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
            <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="20%">
            <el-form-item label="商户名" prop="merchantNo" width="100%" >
               <el-input v-model="form.merchantNo" @keydown.native="keydown($event)"/>
            </el-form-item>
            <el-form-item  label="业务类型" prop="paymentTypes">
                <el-select
                    v-model="paymentTypeDatas"
                    multiple
                    style="width: 100%"
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
            <el-form-item label="电汇" prop="spotFee">
                <el-input v-model.spotFee="form.spotFee">
                    <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                        {{"CNY"}} 
                    </em>
                </el-input>
            </el-form-item>
            <el-form-item label="足额到账费" prop="fullFee">
                <el-input v-model.fullFee="form.fullFee">
                <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                    {{"CNY"}} 
                </em>
                </el-input>
            </el-form-item>
            <el-form-item label="平台服务费" prop="gradientPrices">
                <el-text v-for="gradientPrice in form.gradientPrices" :key="gradientPrice" style="padding-bottom:10px">
                    <el-select v-model="gradientPrice.type" style="width:20%">
                        <el-option
                            v-for="item in serviceTypeList"
                            :key="item.text"
                            :label="item.text"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input v-model="gradientPrice.fixedAmount" style="width:25%;margin-left:2%;">
                        <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"CNY"}} 
                        </em>
                    </el-input>
                    <span style="margin:0px 5%;">{{","}}</span>
                    <el-input v-model="gradientPrice.amount" style="width:15%">
                        <!-- <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"CNY"}} 
                        </em> -->
                    </el-input>
                    <el-select v-model="gradientPrice.currency" style="width:20%">
                          <el-option
                              v-for="item in gradientType"
                              :key="item"
                              :label="item"
                              :value="item">
                          </el-option>
                        </el-select>
                </el-text>
                <el-button type="primary" style="width :100%;margin-top: 10px;" round @click="clickAddGradientPrices(form)">添加</el-button>
                <!-- </el-text> -->
                <!-- <el-select
                    v-model="serviceTypeDatas"
                    multiple
                    style="width: 20%"
                    placeholder="请选择"
                    @remove-tag="deletePaymentTypeData"
                    @change="changePaymentType"
                >
                    <el-option
                        v-for="item in serviceTypeList"
                        :key="item.text"
                        :label="item.text"
                        :value="item.value"
                        />
                </el-select> -->

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
            <el-table-column :show-overflow-tooltip="true" prop="spotFee" width="80" label="电汇费" >
                <template slot-scope="scope">
                    {{scope.row.spotFee}}{{"CNY"}}
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="fullFee" width="80" label="足额到账费" >
                <template slot-scope="scope">
                    {{scope.row.fullFee}}{{"CNY"}}
                </template>
            </el-table-column>
            <el-table-column prop="gradientPrices" label="平台服务费">
                <template slot-scope="scope">
                    <el-tag v-for="priceMap in scope.row.gradientPrices" :key="priceMap">
                        {{serviceTypeMap[priceMap.type]}} {{priceMap.fixedAmount}} {{","}} {{priceMap.amount}}{{priceMap.currency}} 
                    </el-tag>

                </template>
            </el-table-column>

            <!-- <el-table-column prop="currencies" label="货币" column-key="currenciesFilter" :filters="this.currenciesList">
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
            <el-table-column :show-overflow-tooltip="true" prop="priceType,point" label="加减点" >
                <template slot-scope="scope">
                    {{priceTypeMap[scope.row.priceType]}} {{scope.row.point}}
                </template>
            </el-table-column>
                
            <el-table-column :show-overflow-tooltip="true" prop="nowPrice" label="当前价格" /> -->
            <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135px" label="创建日期" />
            <el-table-column
              v-if="checkPer(['admin','rate:edit','rate:del'])"
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
  import crudFee from '@/api/system/fee'
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
  var paymentTypeDatas = []; // 多选时使用
  var paymentTypeMap = {};

  export default {
    name: 'Fee',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '汇率', url: 'api/fee', crudMethod: { ...crudFee }})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    data() {
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        currencyDatas : [], serviceTypeDatas: [], // 多选时使用
        paymentTypeDatas: [],
        gradientType :["CNY","%"],
        // 缴费类型 0-学费 1-生活费 2-保证金 3-保险 4-房租 5-医疗
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租", 5 :"医疗"},
        serviceTypeMap : {lessEqual : "<=",greater : ">"},
        permission: {
          add: ['admin', 'fee:add'],
          edit: ['admin', 'fee:edit'],
          del: ['admin', 'fee:del']
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
            this.crud.toQuery();
        },
      changePaymentType(value) {
        console.log(value);
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
        if (!form.gradientPrices) {
          form.gradientPrices = []
        }
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
        this.serviceTypeList = this.getServiceTypeList()
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
        this.form.paymentTypes = this.paymentTypeDatas;
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
  