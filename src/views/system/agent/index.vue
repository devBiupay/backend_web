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
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="1020px">
            <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="20%">
            <div v-if="form.agentId != form.id" style="margin-bottom: 20px;">
              <el-descriptions title="代理人配置" bordered></el-descriptions>
              <el-tag>{{priceTypeMap[form?.agentRate?.priceType]}}</el-tag>
              <el-tag>{{form?.agentRate?.point }}</el-tag>
              <div style="display:flex">
              <el-descriptions style="width: 50%; margin-top: 20px;">
                <el-descriptions-item label="足额到账费">{{form?.agentFee?.fullFee}}</el-descriptions-item>
                <el-descriptions-item label="电汇费">{{form?.agentFee?.spotFee}}</el-descriptions-item>
              </el-descriptions>
              <el-form-item label="平台服务费" style="width: 50%;">
                <el-text v-for="(gradientPrice,index) in form?.agentFee?.gradientPrices" :key="gradientPrice" style="width: 50%;">
                    <el-select disabled v-model="gradientPrice.type" style="width:20%">
                        <el-option
                            v-for="item in serviceTypeList"
                            :key="item.text"
                            :label="item.text"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input disabled v-model="gradientPrice.fixedAmount" style="width:25%;margin-left:2%;">
                        <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"CNY"}} 
                        </em>
                    </el-input>
                    <span style="margin:0px 1%;">{{","}}</span>
                    <el-input disabled v-model="gradientPrice.amount" style="width:15%">
                        <!-- <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{"CNY"}} 
                        </em> -->
                    </el-input>
                    <el-select disabled v-model="gradientPrice.currency" style="width:20%">
                        <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                            {{gradientType}} 
                        </em>
                    </el-select>
                    
                  </el-text>
                </el-form-item>
              </div>

            </div>
            <el-descriptions title="商户配置" bordered></el-descriptions>
            <div style="display: flex;">
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

            </div>
            <div style="display: flex; width: 100%;">
              <el-form-item style="width:50%" label="币种" prop="currencies">
                <el-select
                    v-model="currencyDatas"
                    style="width: 100%"
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
              <el-form-item v-if="form.id != form.agentId" style="width:50%" label="国内机构" prop="organization" >
                  <el-select v-model.organization="form.organization" :allow-create="true" @visible-change="getOrganization" filterable clearable>
                      <el-option 
                          v-for="item in organizations"
                          :key="item"
                          :label="item"
                          :value="item"
                      />
                  </el-select>
              </el-form-item>
            </div>
            <el-descriptions v-if="form.id==form.agentId" title="手续费配置" bordered></el-descriptions>
            <el-descriptions v-else title="手续费配置（基于中介）" bordered></el-descriptions>
            <div style="display: flex;">
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
            </div>
            <div style="display: flex; width: 50%;">
            <el-form-item label="平台服务费" prop="gradientPrices">
                <el-text v-for="(gradientPrice,index) in form.gradientPrices" :key="gradientPrice" style="padding-bottom:10px">
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
                    <span style="margin:0px 1%;">{{","}}</span>
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
                    <el-button style="width: 8%;" type="danger"  icon="el-icon-delete" circle @click="delGradientPrices(form,index)"></el-button>
                    
                  </el-text>
                <el-button type="primary" style="width :100%;margin-top: 10px;" round @click="clickAddGradientPrices(form)">添加</el-button>
            </el-form-item>
            </div>

            <el-descriptions v-if="form.id == form.agentId"  title="汇率配置" bordered></el-descriptions>
            <el-descriptions v-else title="汇率配置（基于中介）" bordered></el-descriptions>

            <!-- <div v-if="form.agentId == form.id" style="display: flex;">
              <el-form-item label="汇率源" prop="sourcePriceType">
                  <el-select v-model.sourcePriceType="form.sourcePriceType">
                      <el-option 
                          v-for="item in sourcePriceTypList"
                          :key="item.value"
                          :label="item.text"
                          :value="item.value"
                      />
                  </el-select>
              </el-form-item>
              <el-input placeholder="请输入内容" v-model="form.point" class="input-with-select">
                  <el-select style="width:100px" v-model="form.priceType" slot="prepend" placeholder="定价">                  
                      <el-option v-for="(value,key,index) in priceTypeMap" :key="index" :label="value" :value="key"></el-option>
                  </el-select>
              </el-input>
            </div> -->
            <div style="display: flex; width: 50%;">
              <el-input placeholder="请输入内容" v-model="form.point" class="input-with-select">
                  <el-select style="width:100px" v-model="form.priceType" slot="prepend" placeholder="定价">                  
                      <el-option v-for="(value,key,index) in priceTypeMap" :key="index" :label="value" :value="key"></el-option>
                  </el-select>
              </el-input>
            </div>

            <el-descriptions style="margin-top: 30px;" title="分佣配置" bordered></el-descriptions>
            <div style="display: flex;">
              <el-form-item label="固定手续费返佣" prop="fixCommissionAmount">
                  <el-input v-model.fixCommissionAmount="form.fixCommissionAmount">
                  <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                      {{"CNY"}} 
                  </em>
                  </el-input>
              </el-form-item>
              <el-form-item label="动态汇率返佣" prop="rateCommissionPoint">
                <el-input placeholder="" v-model="form.rateCommissionPoint" class="input-with-select">
                  <el-select style="width:100px" v-model="form.rateCommissionType" slot="prepend" placeholder="定价">                  
                      <el-option v-for="(value,key,index) in priceTypeMap" :key="index" :label="value" :value="key"></el-option>
                  </el-select>
                </el-input>
              </el-form-item>
            </div>
            <div v-if="form.id == form.agentId" style="display: flex; width: 50%;">
              <el-form-item label="汇差利润分配比率" prop="profitRate">
                  <el-input v-model.profitRate="form.profitRate">
                  <em slot="suffix" style="margin:20px 10px 20px 16px; padding-left:10px;border-left:1px solid #C4C4C4">
                      {{"%"}} 
                  </em>
                  </el-input>
              </el-form-item>
            </div>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="submitLoading" type="primary" @click="submit(form)">确认</el-button>
        </div>
          </el-dialog>
          <!--表格渲染--> 
          <el-table
              ref="table"
              v-loading="crud.loading"
              lazy
              :load="crudMerchantNoList"
              :data="crud.data"
              :tree-props="treeProps"
              row-key="id"
              @select="crud.selectChange"
              @select-all="crud.selectAllChange"
              @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <!-- <el-table-column type="expand">
                  <template slot-scope="props">
                    <el-table
                      lazy
                      ref="table"
                      v-loading="merchantListLoading"
                      :load="crudMerchantNoList(props.row.id)"
                      :data="merchantList[props.row.id]"
                      style="width: 100%"
                      class="child-table"
                      row-key="guid"
                    >
                      <el-table-column :show-overflow-tooltip="true" prop="" label="" />
                      <el-table-column :show-overflow-tooltip="true" prop="merchantNo" label="商户名称" />
                      <el-table-column prop="fee.paymentTypes" label="业务" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" >
                          <template slot-scope="scope">
                              <el-tag v-for="tag in scope.row.fee.paymentTypes" :key="tag">
                                  {{paymentTypeMap[tag]}}
                              </el-tag>
                          </template>
                      </el-table-column>
                      <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135px" label="创建日期" />
                      <el-table-column
                        v-if="checkPer(['admin','agent:edit','agent:del'])"
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
                  </template>
            </el-table-column> -->
            <el-table-column :show-overflow-tooltip="true" prop="merchantNo" label="代理人名称" />
            <el-table-column prop="fee.paymentTypes" label="业务" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" >
                <template slot-scope="scope">
                    <el-tag v-for="tag in scope.row.fee.paymentTypes" :key="tag">
                        {{paymentTypeMap[tag]}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135px" label="创建日期" />
            <el-table-column
              v-if="checkPer(['admin','agent:edit','agent:del'])"
              label="操作"
              width="115"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <udOperation
                  :data="scope.row"
                  :permission="permission"
                  :disabled-dle="scope.row.id === scope.row.agentId"
                />
                <el-button v-if="scope.row.id === scope.row.agentId" size="mini" type="text" icon="el-icon-add" @click="crud.toAddWithData(initMerchantData(scope.row))"
                >新增商户</el-button>
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
  import crudAgent from '@/api/system/agent'
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
  const defaultForm = { id: null, agentId:null,merchantNo: '', paymentTypes: null, spotFee: 0, fullFee: 0,gradientPrices:null,
          point:null,priceType:null,sourcePriceType:null ,fixCommissionAmount :null,rateCommissionPoint : null, rateCommissionType: null,
          profitRate : null ,organization:null,rate:{},fee:{},commission:{}}
  var paymentTypeDatas = []; // 多选时使用
  var paymentTypeMap = {};

  export default {
    name: 'Fee',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '商户', url: 'api/merchant', crudMethod: { ...crudAgent }})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    data() {
      return {
        submitLoading : false,
        merchantList : {},
        merchantListLoading : true,
        height: document.documentElement.clientHeight - 180 + 'px;',
        currencyDatas : [], serviceTypeDatas: [], // 多选时使用
        paymentTypeDatas: [],
        paymentTypeList : [],
        organizations:[],

        sourcePriceTypList :[],
        gradientType :["CNY","%"],
        // 缴费类型 0-学费 1-生活费 2-保证金 3-保险 4-房租 5-医疗
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租", 5 :"医疗", 6:"旅游"},
        serviceTypeMap : {lessEqual : "<=",greater : ">"},
        currenciesList : [{text:"USD",value:"USD"},{text:"EUR",value:"EUR"},{text:"GBP",value:"GBP"},
                    {text:"AUD",value:"AUD"},{text:"CAD",value:"CAD"},{text:"CHF",value:"CHF"},
                    {text:"HKD",value:"HKD"},{text:"JPY",value:"JPY"},{text:"KRW",value:"KRW"},{text:"NZD",value:"NZD"},
                    {text:"SGD",value:"SGD"},{text:"SW",value:"SW"},{text:"MYR",value:"MYR"}],
        priceTypeMap : {add:"加",sub:"减",mul:"乘",div:"除"},
        sourcePriceTypMap : {spotBuy:"现汇买入",spotSell:"现汇卖出",cashBuy:"现钞买入",cashSell:"现钞卖出"},
        treeProps:{
          children:'children',
          hasChildren:'hasChildren'
        },

        permission: {
          add: ['admin', 'agent:add'],
          edit: ['admin', 'agent:edit'],
          del: ['admin', 'agent:del']
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
      this.crud.msg.add = '新增代理人成功'
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
      deleteCurrencyData(value,list) {
        this.currencyDatas.forEach(function(data, index) {
          if (data === value) {
            this.paymentTypeDatas.splice(index, value)
          }
        })
      },
      changeCurrency(value) {
        const currencyDatas = []
        value.forEach(function(data, index) {
            currencyDatas.push(data);
        })
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
      getOrganization() {
        if (!this.organizations.length) {
          crudAgent.getOrganization().then(res => {
            this.organizations = res;
          })
        }
      },
      // 监听筛选项的变化
      filterChange(filterObj) {
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
      delGradientPrices(form,index) {
        form.gradientPrices.splice(index,1);
      },
      // 初始化商户信息
      initMerchantData(form) {
        const data = {
          id : "",
          agentId : form.id,
          agentRate : form.rate,
          agentFee : form.fee,
          agentCommision:form.commission
        }
        return data
      },
      // 新增与编辑前做的操作
      [CRUD.HOOK.afterToCU](crud, form) {
        this.paymentTypeList = this.getPaymentTypeList()
        this.serviceTypeList = this.getServiceTypeList()
        this.sourcePriceTypList = this.getSourcePriceTypeList()
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd](crud,form) {
        console.log(form)
      },
      [CRUD.HOOK.afterSubmit] (crud,form) {
        this.merchantList[form.id] = form;
      },
      [CRUD.HOOK.afterEditCancel] (crud,form) {
      },
      [CRUD.HOOK.afterRefresh] (crud) {
        // console.log('4444')
        // // console.log(this.merchantListLoading)
        // const _this = this
        // crud.data.forEach(function(data,index) {
        //   console.log(data.id);
        //   _this[id] = [];
        //   // _this.merchantListLoading[data.id] = true;
        // });
        // console.log(crud.data[0])

      },
      // 初始化编辑时候的角色与岗位
      [CRUD.HOOK.beforeToEdit](crud, form) {
        // 先清空
        this.paymentTypeDatas = [];
        this.currencyDatas =[];
        const _this = this
        form.rate.paymentTypes.forEach(function(paymentType, index) {
            _this.paymentTypeDatas.push(paymentType);
        });

        form.rate.currencies.forEach(function(currency, index) {
            _this.currencyDatas.push(currency);
        });
        form.point =  form.rate.point;
        form.priceType = form.rate.priceType;
        form.sourcePriceType = form.rate.sourcePriceType;
        form.gradientPrices = form.fee.gradientPrices;
        form.spotFee = form.fee.spotFee;
        form.fullFee = form.fee.fullFee;
        form.fixCommissionAmount = form.commission?.fixCommission?.amount;
        form.rateCommissionPoint = form.commission?.rateCommission?.point;
        form.rateCommissionType = form.commission?.rateCommission?.priceType;
        form.profitRate = form.commission?.profitRate * 100;
      },
      // 提交前做的操作
      [CRUD.HOOK.afterValidateCU](crud) {
        return true
      },
      submit(form) {
        this.submitLoading = true;
        const submitData = {
          id : form.id,
          merchantNo : form.merchantNo,
          agentId : form.agentId,
          organization : form.organization
        }

        submitData.fee = {
          fullFee : this.form.fullFee,
          gradientPrices : this.form.gradientPrices,
          merchantNo : this.form.merchantNo,
          paymentTypes : this.paymentTypeDatas,
          spotFee : this.form.spotFee,
          id : this.form.fee?.id
        }
        submitData.rate = {
          currencies : this.currencyDatas,
          merchantNo : this.form.merchantNo,
          paymentTypes : this.paymentTypeDatas,
          point : this.form.point,
          priceType : this.form.priceType,
          sourcePriceType : this.form.sourcePriceType,
          id : this.form.rate?.id,
        }
        if (form.agentRate !=null) {
          submitData.rate.sourcePriceType = form.agentRate.sourcePriceType;
        }
        submitData.commission = {
          id : this.form.commission?.id,
          fixCommission : {
            amount : this.form.fixCommissionAmount,
            commissionType : "fixed"
          },
          merchantNo : this.form.merchantNo,
          rateCommission : {
            commissionType : "rate",
            priceType : this.form.rateCommissionType,
            point : this.form.rateCommissionPoint
          },
          profitRate : this.form.profitRate /100
        }
        submitData.id = form.id;
        submitData.merchantNo = form.merchantNo;
        this.merchantList[form.id] = form;

        if (form.id == '') {
          crudAgent.add(submitData).then((d) => {
            this.submitLoading = false;
            this.crud.editSuccessNotify()
            this.crud.refresh()
            this.crud.status.add = 0;
          }).catch(err => {
            })
        } else {
          crudAgent.edit(submitData).then((d) => {
            this.submitLoading = false;
            this.crud.editSuccessNotify()
            this.crud.refresh()
            this.crud.status.edit = 0;
          }).catch(err => {
            console.log(err)
            })
        }
      },
      getMerchantNoList(id) {
        return this[id];
      },
      crudMerchantNoList(tree, treeNode, resolve) {
        setTimeout(() => {
          crudAgent.getMerchantList(tree.id).then(res => {
            const resultList = [];
            res.content.forEach(function(data, index) {
              const result = data;
              result.agentRate = tree.rate;
              result.agentFee = tree.fee;
              resultList.push(result);
            })

            resolve(resultList)
          })
        }, 100)
      },
      // crudMerchantNoList(id) {
      //   // console.log(this.merchantListLoading[id])
      //   console.log("获取商户信息")
      //   console.log(id)
      //   crudAgent.getMerchantList(id).then(res => {
      //     this[id] = res.content;
      //     this.merchantList[id] = res.content;
      //     // console.log(this.merchantList)
      //   })
      //   // this.merchantListLoading[id] = false;
      //   this.merchantListLoading = false;
      // },
      
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
  