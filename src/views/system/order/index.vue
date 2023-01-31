<template>
    <div class="app-container">
      <el-row :gutter="20">
        <!--侧边部门数据-->
        <!-- <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
          <div class="head-container">
            <el-input
              v-model="deptName"
              clearable
              size="small"
              placeholder="输入部门名称搜索"
              prefix-icon="el-icon-search"
              class="filter-item"
              @input="getDeptDatas"
            />
          </div>
          <el-tree
            :data="deptDatas"
            :load="getDeptDatas"
            :props="defaultProps"
            :expand-on-click-node="false"
            lazy
            @node-click="handleNodeClick"
          />
        </el-col> -->
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
                placeholder="输入"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="crud.toQuery"
              />
              <date-range-picker v-model="query.createTime" class="date-item" />
              <!-- <el-select
                v-model="query.enabled"
                clearable
                size="small"
                placeholder="状态"
                class="filter-item"
                style="width: 90px"
                @change="crud.toQuery"
              >
                <el-option
                  v-for="item in enabledTypeOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select> -->
              <rrOperation />
            </div>
            <!-- 增删改查用户 -->
            <crudOperation show="" :permission="permission" />
          </div>
      
          <el-dialog :visible.sync="updateOrderDialog" title="修改订单状态">
            <!-- <el-input placeholder="请输入内容"  class="input-with-select"> -->
                <el-select style="width: 100%;" v-model="updateStatus" placeholder="请输入修改的状态">                  
                    <el-option v-for="(value,key,index) in stausMap" :key="index" :label="value" :value="key"></el-option>
                </el-select>
            <!-- </el-input> -->
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="cancelUpdateOrderStatus()">取消</el-button>
              <el-button type="primary" @click="submitUpdateOrderStatus(dialogInfo)">确认</el-button>
            </div>
          </el-dialog>
          <el-dialog :visible.sync="dialogVisible">
            <button @click="handleDownloadUrl(dialogImageUrl)">下载</button>
            <img width="100%" :src="dialogImageUrl">
          </el-dialog>

          <!--表单渲染-->
          <el-dialog :visible.sync="dialog" title="订单详情" append-to-body width="85%" style="padding: 20px 20px 0px 20px;z-index: 2000;" >
            <div class="lineOfDivision"></div>
            <el-descriptions title="订单基本信息" bordered>
              <el-descriptions-item label="订单编号">{{dialogInfo.id}}</el-descriptions-item>
              <el-descriptions-item label="收款渠道编号">{{dialogInfo.depositId}}</el-descriptions-item>
              <el-descriptions-item label="收款渠道">{{dialogInfo.depositChannel}}</el-descriptions-item>
              <el-descriptions-item label="下发渠道编号">{{dialogInfo.transferId}}</el-descriptions-item>
              <el-descriptions-item label="下发渠道">{{dialogInfo.transferChannel}}</el-descriptions-item>
              <el-descriptions-item label="订单状态">{{stausMap[dialogInfo.status]}}</el-descriptions-item>
              <el-descriptions-item label="汇款金额">{{dialogInfo.amount}} {{dialogInfo.currency}}</el-descriptions-item>
              <el-descriptions-item label="订单截止时间">{{dialogInfo.deadLineDate}}</el-descriptions-item>
              <el-descriptions-item label="订单汇率">{{dialogInfo.rate}}</el-descriptions-item>
              <el-descriptions-item label="电汇费">{{dialogInfo.spotFee}}</el-descriptions-item>
              <el-descriptions-item label="足额到账费">{{dialogInfo.fullFee}}</el-descriptions-item>
              <el-descriptions-item label="手续费">{{dialogInfo.cnyFee}}</el-descriptions-item>
              <el-descriptions-item label="需支付金额">{{dialogInfo.cnyAmount}}{{" CNY"}}</el-descriptions-item>
              <el-descriptions-item label="缴费类型">{{paymentTypeMap[dialogInfo.paymentType]}}</el-descriptions-item>
            </el-descriptions>
            <!-- 分割线 -->
            <div class="lineOfDivision"></div>
            <el-descriptions title="学生基本信息" bordered>
              <el-descriptions-item label="学生姓名">{{dialogInfo.kyc?.lastName}}{{dialogInfo.kyc?.firstName}}</el-descriptions-item>
              <el-descriptions-item label="学生电话">{{dialogInfo.kyc?.phone}}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{dialogInfo.kyc?.idNumber}}</el-descriptions-item>
              <!-- TODO:证件照片 -->
            </el-descriptions>
            <div style="display:flex;flex-flow:row">
              <template  v-for="url in certificateInfo(dialogInfo.kyc?.certificates)">
                <div style="display:flex;flex-flow: column;padding:10px">
                  <iframe ref="ifr" style="width: 100px;height: 100px;" v-if="url.indexOf('.pdf') > -1" :src = "url" />
                  <img style="width: 100px;height: 100px;" v-else :src = "url" />
                  <button style="color:#3d3d3d"  @click="imageVisible(url)">查看图片</button>
                </div>
              </template>
            </div>
            <!-- 分割线 -->
            <div class="lineOfDivision"></div>
            <!-- <el-form ref="dialogInfo" :inline="true" :model="dialogInfo" :rules="rules" size="small" label-width="80px">
              <el-form-item label="实际付款人姓(拼音)">
               <el-input v-model="dialogInfo.kyc?.payerLastNamePinyin" @keydown.native="keydown($event)" />
              </el-form-item>
            </el-form> -->

            <el-descriptions title="汇款人信息" bordered>
              <el-descriptions-item label="实际付款人">{{dialogInfo.kyc?.payerLastName}}{{dialogInfo.kyc?.payerFirstName}}</el-descriptions-item>
              <el-descriptions-item label="汇款人关系">{{this.payerRelationShipMap[dialogInfo.kyc?.payerRelationShip]}}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{dialogInfo.kyc?.payerIdNumber}}</el-descriptions-item>
              <!-- <el-descriptions-item label="实际付款人姓(拼音)">{{dialogInfo.kyc?.payerLastNamePinyin}}</el-descriptions-item>
              <el-descriptions-item label="实际付款人名(拼音)">{{dialogInfo.kyc?.payerFirstNamePinyin}}</el-descriptions-item>
              <el-descriptions-item label="实际付款人生日">{{dialogInfo.kyc?.payerBirthdate}}</el-descriptions-item> -->
              <!-- TODO:证件照片 -->
            </el-descriptions>
            <div v-if="isKyc(dialogInfo) && dialogInfo.paymentType == 1" class="demo-input-suffix" style="display: flex;flex-direction: row;">
              <span style="display: flex;flex-direction: row;">
                实际付款人姓(拼音):
                <el-input
                  v-model="dialogInfo.kyc.payerLastNamePinyin">
                </el-input>
              </span>
              <span style="display: flex;flex-direction: row;">
                实际付款人名(拼音):
                <el-input
                  v-model="dialogInfo.kyc.payerFirstNamePinyin">
                </el-input>
              </span>
              <span style="display: flex;flex-direction: row;">
                实际付款人邮编:
                <el-input
                  v-model="dialogInfo.kyc.payerPostCode">
                </el-input>
              </span>
            </div>
            <div style="display:flex;flex-flow:row">
              <template  v-for="url in certificateInfo(dialogInfo.kyc?.payerCertificates)">
                <div style="display:flex;flex-flow: column;padding:10px">
                  <iframe ref="ifr" style="width: 100px;height: 100px;" v-if="url.indexOf('.pdf') > -1" :src = "url" />
                  <img style="width: 100px;height: 100px;" v-else :src = "url" />
                  <button style="color:#3d3d3d"  @click="imageVisible(url)">查看图片</button>
                </div>
              </template>
            </div>
            <div class="lineOfDivision"></div>
            <el-descriptions title="收款账户信息" bordered>
              <el-descriptions-item label="收款国家">{{dialogInfo.payment?.country}}</el-descriptions-item>
              <el-descriptions-item label="账户名">{{dialogInfo.payment?.accountName}}</el-descriptions-item>
              <el-descriptions-item label="账号">{{dialogInfo.payment?.accountNo}}</el-descriptions-item>
              <el-descriptions-item label="SWIFT">{{dialogInfo.payment?.swift}}</el-descriptions-item>
              <el-descriptions-item label="收款银行">{{dialogInfo.payment?.bankName}}</el-descriptions-item>
              <el-descriptions-item label="银行地址">{{dialogInfo.payment?.bankAddress}}</el-descriptions-item>
              <el-descriptions-item label="附言">{{dialogInfo.reference}}</el-descriptions-item>
              <el-descriptions-item label="下发汇率">{{dialogInfo.transferInfo?.rate}}</el-descriptions-item>
              <el-descriptions-item label="下发币种">{{dialogInfo.transferInfo?.currency}}</el-descriptions-item>
              <el-descriptions-item label="下发外币金额">{{dialogInfo.transferInfo?.amount}}</el-descriptions-item>
              <el-descriptions-item label="下发人民金额">{{dialogInfo.transferInfo?.cnyAmount}}</el-descriptions-item>
              <el-descriptions-item label="下发人民金额">{{preTransferLoading}}</el-descriptions-item>

            </el-descriptions>
            <div style="text-align: right;">
              <el-button :loading="preTransferLoading" type="primary" @click="preTransfer(dialogInfo)">重新预下单</el-button>
              <el-button :loading="editLoading" type="primary" @click="edit(dialogInfo)" el-button>更新订单信息</el-button>
              <el-button :loading="updateStatusLoading" type="primary" @click="updateOrderStatus(dialogInfo.id)" el-button>修改订单状态</el-button>
              <el-button :loading="transferLoading" type="primary" @click="transfer(dialogInfo)" el-button>订单下发</el-button>
            </div>
          </el-dialog>


          <!--表格渲染-->
          <el-table ref="table" @filter-change="filterChange" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="id" style="width:10px" label="订单id" />
            <el-table-column :show-overflow-tooltip="true" style="width:10px" label="学生姓名" > 
                <template slot-scope="scope">
                    {{scope.row.kyc?.lastName}}{{scope.row.kyc?.firstName}}  
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="amount,currency" label="汇款金额(外币)" >
                <template slot-scope="scope">
                    {{scope.row.amount}} {{scope.row.currency}}  
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="rate" label="汇率" />
            <el-table-column :show-overflow-tooltip="true" prop="cnyFee" label="手续费(CNY)" />
            <el-table-column :show-overflow-tooltip="true" prop="cnyAmount" label="支付金额(CNY)" />
            <el-table-column :show-overflow-tooltip="true" column-key="paymentTypeFilter" :filters="getPaymentTypeList()" prop="status" label="缴费类型" >
                <template slot-scope="scope">
                    {{paymentTypeMap[scope.row.paymentType]}}
                </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" column-key="statusFilter" :filters="getStatusList()" prop="status" label="订单状态" >
                <template slot-scope="scope">
                    {{stausMap[scope.row.status]}}
                </template>
            </el-table-column>

            <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135px" label="创建日期" />
            <el-table-column label="查看详情" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="info(scope.row)">查看详情</el-button>
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
  import crudOrder from '@/api/system/order'
  import { isvalidPhone } from '@/utils/validate'
  import CRUD, { presenter, header, form, crud } from '@crud/crud'
  import rrOperation from '@crud/RR.operation'
  import crudOperation from '@crud/CRUD.operation'
  import udOperation from '@crud/UD.operation'
  import pagination from '@crud/Pagination'
  import DateRangePicker from '@/components/DateRangePicker'
  import viewImage from '@/components/ViewImage/index'
  import Treeselect from '@riophae/vue-treeselect'
  import { mapGetters } from 'vuex'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
  let userRoles = []
  let userJobs = []
  
  export default {
    name: 'Order',
    components: { viewImage,Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '订单', url: 'api/orders', sort:['updateTime,desc'], crudMethod: { ...crudOrder }})
    },
    mixins: [presenter(), header(), form({}), crud()],
    data() {
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        dialog : false,
        updateOrderDialog : false,
        updateStatusLoading : false,
        preTransferLoading : false,
        editLoading : false,
        transferLoading : false,
        updateOrderId : '',
        updateStatus : '',
        dialogVisible : false,
        dialogImageUrl : '',
        dialogInfo : {kyc:{},payment:{},preTransferLoading:true},
        deptName: '', depts: [], deptDatas: [], jobs: [], level: 3, roles: [],
        jobDatas: [], roleDatas: [], // 多选时使用
        defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
        permission: {
          add: ['admin', 'order:add'],
          edit: ['admin', 'order:edit'],
          del: ['admin', 'order:del']
        },
        enabledTypeOptions: [
          { key: 'true', display_name: '激活' },
          { key: 'false', display_name: '锁定' }
        ],
        paymentTypeMap : {0 : "学费", 1 : "生活费", 2 : "保证金", 3 : "保险", 4 : "房租"},
        payerRelationShipMap: {
          0 : "父子",
          1 : "母子",
          2 : "本人"
        },
        stausMap : {
            0 : "完善信息",
            1 : "订单已确认",
            2 : "已选择银行",
            3 : "已上传资料",
            4 : "已转账",
            5 : "银行正在确认收款",
            6 : "银行汇款中",
            7 : "订单完成",
            8 : "已取消",
            9 : "退款中",
            10 : "退款完成",
            11 : "订单超时取消",
            12 : "待用户补充金额",
            13 : "待用户补充材料",
        },
        rules: {
        //   username: [
        //     { required: true, message: '请输入用户名', trigger: 'blur' },
        //     { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        //   ],
        //   email: [
        //     { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        //     { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        //   ],
        //   phone: [
        //     { required: true, trigger: 'blur', validator: validPhone }
        //   ]
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
      // 禁止输入空格
      keydown(e) {
        if (e.keyCode === 32) {
          e.returnValue = false
        }
      },
      getJobs() {},

      handleDownloadUrl(url) {
        window.open(url)
      },

      isKyc(dialogInfo) {
        return JSON.stringify(dialogInfo.kyc) != undefined && JSON.stringify(dialogInfo.kyc) !="{}"
      },

      imageVisible(url) {
        if (url.indexOf(".pdf") > -1) {
          this.handleDownloadUrl(url)
        } else {
          this.dialogVisible = true;
          this.dialogImageUrl = url
        }
      },

      certificateInfo(certificates) {
        let urlList = []
        if (!certificates) {
          return urlList;
        }
        certificates.forEach(function(certificate, index) {
    
          if (certificate.fontFileUrl) {
            urlList.push(certificate.fontFileUrl)
          }
          if (certificate.backFileUrl) {
              urlList.push(certificate.backFileUrl)
          }
          if (certificate.handFileUrl) {
              urlList.push(certificate.handFileUrl)
          }
        })
        return urlList;
      },

      getPaymentTypeList() {
        const paymentTypeList = []
        for (var key in this.paymentTypeMap) {
          paymentTypeList.push({text:this.paymentTypeMap[key],value:key})
        } 
        return paymentTypeList;
      },

      getStatusList() {
        const statusList = []
        for (var key in this.stausMap) {
            // console.log(key)
            statusList.push({text:this.stausMap[key],value:key})
        } 
        // this.stausMap.item(function(data,index) {
        //     statusList.push({text:data,value:index})
        // })
        return statusList;
      },
      info(data) {
        this.dialog = true;
        this.dialogInfo = data;
      },
      updateOrderStatus(id) {
        this.updateOrderDialog = true;
        this.updateOrderId = id;
        this.updateStatus = '';
      },
      cancelUpdateOrderStatus() {
        this.updateOrderDialog = false;
        this.updateOrderId = '';
        this.updateStatus = '';
      },
      edit(dialogInfo) {
        this.editLoading = true;
        crudOrder.edit(dialogInfo).then((d) => {
          this.dialogInfo = d;
          this.editLoading = false;
        }).catch(err => {
            this.editLoading = false;
          })
      },
      preTransfer(dialogInfo) {
        this.preTransferLoading = true;
        crudOrder.preTransfer(dialogInfo).then((d) => {
          this.dialogInfo = d;
          this.preTransferLoading = false;
        }).catch(err => {
            this.preTransferLoading = false;
          })

      },
      transfer(dialogInfo) {
        this.transferLoading = true;
        crudOrder.transfer(dialogInfo).then((d) => {
          this.dialogInfo = d;
          this.transferLoading = false;
        }).catch(err => {
            this.transferLoading = false;
          })

      },
      submitUpdateOrderStatus(dialogInfo) {
        this.updateStatusLoading = true;
        let data = dialogInfo;
        data.status = this.updateStatus;
        console.log(1111)
        crudOrder.edit(data).then((d) => {
          dialogInfo = d;
          this.updateStatusLoading = false;
          this.updateOrderDialog = false;
        }).catch(err => {
          this.updateStatusLoading = false;
          this.updateOrderDialog = false;
          })

      },
      // 监听筛选项的变化
        filterChange(filterObj) {
          if (filterObj.statusFilter) {
            this.query.status = filterObj.statusFilter.toString();
          }
          if (filterObj.paymentTypeFilter) {
            this.query.paymentType = filterObj.paymentTypeFilter.toString();
          }
            this.crud.toQuery();
        },
      changeRole(value) {
        userRoles = []
        value.forEach(function(data, index) {
          const role = { id: data }
          userRoles.push(role)
        })
      },
      changeJob(value) {
        userJobs = []
        value.forEach(function(data, index) {
          const job = { id: data }
          userJobs.push(job)
        })
      },
      deleteTag(value) {
        userRoles.forEach(function(data, index) {
          if (data.id === value) {
            userRoles.splice(index, value)
          }
        })
      },
      // 新增与编辑前做的操作
      [CRUD.HOOK.afterToCU](crud, form) {
        form.enabled = form.enabled.toString()
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd]() {
        this.jobDatas = []
        this.roleDatas = []
      },
      // 初始化编辑时候的角色与岗位
      [CRUD.HOOK.beforeToEdit](crud, form) {
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
  
  <style rel="stylesheet/scss" lang="scss" scoped>
    ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
      height: 30px;
      line-height: 30px;
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
  </style>
  