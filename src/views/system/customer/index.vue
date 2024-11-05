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
                placeholder="输入名称或者邮箱搜索"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="crud.toQuery"
              />
              <date-range-picker v-model="query.createTime" class="date-item" />
              <el-select
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
              </el-select>
              <rrOperation />
            </div>
            <!-- 增删改查用户 -->
            <!-- <crudOperation show="" :permission="permission" /> -->
          </div>
          <!--表单渲染-->
          <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="570px">
            <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
              <el-form-item label="用户名" prop="name">
                <el-input v-model="form.name" @keydown.native="keydown($event)" />
              </el-form-item>
              <el-form-item label="电话" prop="phone">
                <el-input v-model.number="form.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="crud.cancelCU">取消</el-button>
              <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
            </div>
          </el-dialog>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="id" style="width:10px" label="用户id" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="用户名" />
            <el-table-column :show-overflow-tooltip="true" prop="phone" width="100" label="电话" />
            <el-table-column :show-overflow-tooltip="true" width="135" prop="email" label="邮箱" />
            <el-table-column :show-overflow-tooltip="true" prop="createdAt" width="135px" label="创建日期" />
            <el-table-column
              v-if="checkPer(['admin','user:edit','user:del'])"
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
  import crudCustomer from '@/api/system/customer'
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
  const defaultForm = { id: null, gender: '男', email: null, enabled: 'false', phone: null }
  export default {
    name: 'Customer',
    components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
    cruds() {
      return CRUD({ title: '客户', url: 'api/customers', crudMethod: { ...crudCustomer }})
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],
    // 数据字典
    dicts: ['user_status'],
    data() {
      // 自定义验证
      const validPhone = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入电话号码'))
        } else if (!isvalidPhone(value)) {
          callback(new Error('请输入正确的11位手机号码'))
        } else {
          callback()
        }
      }
      return {
        height: document.documentElement.clientHeight - 180 + 'px;',
        deptName: '', depts: [], deptDatas: [], jobs: [], level: 3, roles: [],
        jobDatas: [], roleDatas: [], // 多选时使用
        defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
        permission: {
          add: ['admin', 'user:add'],
          edit: ['admin', 'user:edit'],
          del: ['admin', 'user:del']
        },
        enabledTypeOptions: [
          { key: 'true', display_name: '激活' },
          { key: 'false', display_name: '锁定' }
        ],
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
    created() {
      this.crud.msg.add = '新增成功，默认密码：123456'
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
      getJobs() {
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
  </style>
  