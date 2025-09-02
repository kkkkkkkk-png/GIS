<template>
  <div class="container">
    <!-- 数据表格 -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="header in fieldConfig" :key="header.key">
              {{ header.label }}
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item['Data ID']">
            <td v-for="header in fieldConfig" :key="header.key">
              {{ formatField(item[header.key], header.type) }}
            </td>
            <td>
              <button class="btn-edit" @click="editItem(item)">编辑</button>
              <button
                class="btn-delete"
                @click="confirmDelete(item['Data ID'])"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 数据表单 -->
    <div class="form-container">
      <h3>{{ editing ? "编辑记录" : "新建记录" }}</h3>
      <form @submit.prevent="submitForm">
        <div
          v-for="field in editableFields"
          :key="field.key"
          class="form-group"
        >
          <label :for="field.key">{{ field.label }}</label>
          <input
            :id="field.key"
            v-model="formData[field.key]"
            :type="field.inputType"
            :step="field.step"
            :required="field.required"
            :placeholder="field.placeholder"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">
            {{ editing ? "更新记录" : "创建记录" }}
          </button>
          <button
            v-if="editing"
            type="button"
            class="btn-cancel"
            @click="cancelEdit"
          >
            取消
          </button>
        </div>
      </form>
      <div class="search-box">
        <label for="search-id">请输入监测点ID：</label>
        <input
          type="number"
          id="search-id"
          v-model="searchId"
          class="form-input search-input"
          placeholder="例如：101"
        />
        <div class="search-btns">
          <button class="btn-search" @click="searchByReachingId">查询</button>
          <button class="btn-cancel" @click="resetSearch">重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

// 字段配置中心
const FIELD_CONFIG = [
  {
    key: "Site ID",
    label: "站点ID",
    type: "number",
    inputType: "number",
    required: true,
  },
  {
    key: "Site name",
    label: "站点名称",
    type: "string",
    inputType: "text",
    required: true,
  },
  {
    key: "Longitude",
    label: "经度",
    type: "number",
    inputType: "number",
    step: "0.000001",
    required: true,
  },
  {
    key: "Latitude",
    label: "纬度",
    type: "number",
    inputType: "number",
    step: "0.000001",
    required: true,
  },
  {
    key: "MAT",
    label: "年均温(℃)",
    type: "number",
    inputType: "number",
    step: "0.1",
    required: true,
  },
  {
    key: "MAR",
    label: "年降雨量(mm)",
    type: "number",
    inputType: "number",
    required: true,
  },
]

export default {
  data() {
    return {
      items: [],
      formData: {},
      editing: false,
      fieldConfig: FIELD_CONFIG,
      searchId: "",
      originalItems: [], // 用于保存完整数据列表
    }
  },

  computed: {
    // 可编辑字段（排除Data ID）
    editableFields() {
      return this.fieldConfig.filter((f) => f.key !== "Data ID")
    },
  },

  created() {
    this.fetchData()
  },

  methods: {
    // 格式化显示内容
    formatField(value, type) {
      if (value === null || value === undefined) return "-"
      if (type === "datetime") return new Date(value).toLocaleString()
      return value
    },

    // 获取数据
    async fetchData() {
      try {
        const response = await axios.get("http://localhost:3000/api/climactic")
        this.items = response.data.map((item) => ({
          ...item,
        }))
        this.originalItems = this.items
      } catch (error) {
        this.showError("数据加载失败", error)
      }
    },

    // 删除确认
    confirmDelete(id) {
      if (confirm("确定要删除这条记录吗？")) {
        this.deleteItem(id)
      }
    },

    // 执行删除
    async deleteItem(id) {
      try {
        await axios.delete(`http://localhost:3000/api/climactic/${id}`)
        this.items = this.items.filter((item) => item["Data ID"] !== id)
      } catch (error) {
        this.showError("删除失败", error)
      }
    },

    // 编辑条目
    editItem(item) {
      this.editing = true
      this.formData = {
        ...item,
      }
    },

    // 取消编辑
    cancelEdit() {
      this.editing = false
      this.formData = {}
    },

    // 提交表单
    async submitForm() {
      try {
        const payload = this.preparePayload()
        console.log(payload)
        const url = this.editing
          ? `http://localhost:3000/api/climactic/${this.formData["Data ID"]}`
          : "http://localhost:3000/api/climactic"

        const method = this.editing ? "put" : "post"

        const response = await axios[method](url, payload)

        if (this.editing) {
          this.items = this.items.map((item) =>
            item["Data ID"] === payload["Data ID"] ? payload : item
          )
        } else {
          this.items = [...this.items, response.data]
        }

        this.cancelEdit()
        this.fetchData()
      } catch (error) {
        this.showError("提交失败", error)
      }
    },

    // 准备提交数据
    preparePayload() {
      const payload = { ...this.formData }

      // 转换字段类型
      this.editableFields.forEach((field) => {
        if (field.type === "number") {
          payload[field.key] = Number(payload[field.key])
        }
      })

      // 时间格式处理
      if (payload.Time) {
        payload.Time = payload.Time.replace("T", " ")
      }

      return payload
    },

    // 统一错误处理
    showError(message, error) {
      console.error(`${message}:`, error)
      alert(`${message}: ${error.response?.data?.error || error.message}`)
    },

    searchByReachingId() {
      if (!this.searchId) {
        alert("请输入有效的监测点ID")
        return
      }
      const id = Number(this.searchId)
      this.items = this.items.filter((item) => item["Reaching ID"] === id)
    },

    resetSearch() {
      this.searchId = ""
      this.items = [...this.originalItems]
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

/* 表格容器，控制滚动 */
.table-wrapper {
  flex: 1;
  background: white;
  border-radius: 6px;
  padding: 0.75rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  overflow-x: auto;
  max-height: 100%;
}

/* 表格样式本身 */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

tr:hover {
  background-color: #f9f9f9;
}

/* 按钮样式 */
.btn-edit,
.btn-delete {
  padding: 4px 8px;
  margin: 0 2px;
  font-size: 0.85rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.85;
}

/* 表单样式 */
.form-container {
  flex-shrink: 0;
  width: 400px;
  max-width: 100%;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  gap: 15px;
}

.form-group label {
  flex: 0 0 120px;
  text-align: right;
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  flex: 1;
  max-width: 400px;
}

.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 1rem;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-submit {
  background-color: #2ecc71;
  color: white;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.search-box {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 80%;
  max-width: 280px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.search-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-search {
  padding: 8px 16px;
  background-color: #2980b9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-search:hover {
  opacity: 0.85;
}
</style>
