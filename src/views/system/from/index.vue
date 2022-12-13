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
                placeholder="输入客户编号"
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
          <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="570px">
            <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="优惠码" prop="code">
               <el-input v-model="form.code" @keydown.native="keydown($event)" />
            </el-form-item>
            <el-form-item label="优惠金额" prop="amount">
               <el-input v-model="form.amount" @keydown.native="keydown($event)" />
            </el-form-item>
            <el-form-item label="推广链接" prop="link">
               <el-input v-model="form.link" @keydown.native="keydown($event)" />
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
            <el-table-column :show-overflow-tooltip="true" width="55" prop="id" label="机构id" />
            <el-table-column :show-overflow-tooltip="true" prop="code" label="优惠码" />
            <el-table-column :show-overflow-tooltip="true" prop="amount" label="优惠金额" />
            <el-table-column :show-overflow-tooltip="true" prop="link" label="推广链接" />
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
  import crudFrom from '@/api/system/from'
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
  const defaultForm = {}

  var paymentTypeMap = {};

  export default {
    name: 'Resource',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '客户来源表', url: 'api/from', crudMethod: { ...crudFrom }})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    data() {
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        currencyDatas : [], serviceTypeDatas: [], // 多选时使用
        
        permission: {
          add: ['admin', 'from:add'],
          edit: ['admin', 'from:edit'],
          del: ['admin', 'from:del']
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
      this.crud.msg.add = '新增客户成功'
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
      // 新增与编辑前做的操作
      [CRUD.HOOK.afterToCU](crud, form) {
        console.log(form)
        console.log(crud)
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd]() {
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
  