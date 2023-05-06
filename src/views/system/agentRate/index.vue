<template>
    <div class="app-container">
      <el-row :gutter="20">
        <!--用户数据-->
        <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20" style="width:100%">
          <!--表格渲染--> 
        <crudOperation show="" :permission="permission" />
        <el-table ref="table" @filter-change="filterChange" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
            <el-table-column prop="currency" label="货币" column-key="currencyFilter" :filters="currenciesList" />
            <!-- <el-table-column prop="paymentType" label="业务" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" >
                <template slot-scope="scope">
                        {{paymentTypeMap[scope.row.paymentType]}}
                </template>
            </el-table-column> -->
            <el-table-column prop="rate" label="汇率" />
        </el-table>
          <!--分页组件-->
          <pagination />
        </el-col>
      </el-row>
    </div>
  </template>
  
<script>
  import crudAgentRate from '@/api/system/agentRate'
  import CRUD, { presenter, header, form, crud } from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'
  import DateRangePicker from '@/components/DateRangePicker'
  import Treeselect from '@riophae/vue-treeselect'
  import { mapGetters } from 'vuex'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'


  export default {
    name: 'Fee',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '商户', url: 'api/merchant/rate', crudMethod: { ...crudAgentRate }})
    },
    mixins: [presenter(), header(), form(), crud()],
    data() {
      return {
        submitLoading : false,
        merchantList : {},
        merchantListLoading : true,
        height: document.documentElement.clientHeight - 180 + 'px;',
        gradientType :["CNY","%"],
        // 缴费类型 0-学费 1-生活费 2-保证金 3-保险 4-房租 5-医疗
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租", 5 :"医疗"},
        currenciesList : [{text:"USD",value:"USD"},{text:"EUR",value:"EUR"},{text:"GBP",value:"GBP"},
                    {text:"AUD",value:"AUD"},{text:"CAD",value:"CAD"},{text:"CHF",value:"CHF"},
                    {text:"HKD",value:"HKD"},{text:"JPY",value:"JPY"},{text:"KRW",value:"KRW"},{text:"NZD",value:"NZD"},
                    {text:"SGD",value:"SGD"},{text:"SW",value:"SW"},{text:"MYR",value:"MYR"}],

        permission: {
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
    mounted: function() {
      const that = this
      window.onresize = function temp() {
        that.height = document.documentElement.clientHeight - 180 + 'px;'
      }
    },
    methods: {

        filterChange(filterObj) {
            if (filterObj.paymentTypeFilter) {
              this.query.paymentTypes = filterObj.paymentTypeFilter.toString();
            } else {
              // 默认只展示学费
              this.query.paymentTypes = "0";
            }
            if (filterObj.currencyFilter) {
              this.query.currencies = filterObj.currencyFilter.toString();
            }
            this.crud.toQuery();
        },
        getPaymentTypeList() {
            const list = []
            for (var key in this.paymentTypeMap) {
                list.push({text:this.paymentTypeMap[key],value:key});
            }
            return list;
        },
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
    .lineOfDivision {
      position: relative;
      margin: 10px auto;
      width: 100%;
      height: 1px;
      background-color: #d4d4d4;
      text-align: center;
      font-size: 16px;
      color: rgba(101, 101, 101, 1);
    }
    // .el-select .el-input {
    //     width: 130px;
    // }
    ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
  ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
      height: 30px;
      line-height: 30px;
    }
  </style>
  