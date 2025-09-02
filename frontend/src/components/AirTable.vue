<template>
  <div class="container">
    <!-- 切换按钮 -->
    <div class="switch-btn-wrapper">
      <button class="btn-switch" @click="toggleChartView">
        {{ showChart ? "显示表格" : "显示图表" }}
      </button>
    </div>
    <!-- 图表盒子 -->
    <div v-if="showChart" class="echart-wrapper">
      <div ref="mainChart" style="width: 700px; height: 300px"></div>
      <div
        ref="secondChart"
        style="width: 100%; height: 300px; margin-top: 20px"
      ></div>
    </div>
    <div v-else class="table-wrapper">
      <!-- 数据表格 -->
      <div>
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
import * as echarts from "echarts"
// 字段配置中心
const FIELD_CONFIG = [
  {
    key: "Reaching ID",
    label: "监测点ID",
    type: "number",
    inputType: "number",
    required: true,
  },
  {
    key: "Treatment",
    label: "处理方式",
    type: "number",
    inputType: "number",
    required: true,
  },
  {
    key: "Fertility",
    label: "肥力等级",
    type: "string",
    inputType: "text",
    required: true,
  },
  {
    key: "Time",
    label: "记录时间",
    type: "datetime",
    inputType: "datetime-local",
    required: true,
  },
  {
    key: "N2O",
    label: "N₂O浓度",
    type: "number",
    inputType: "number",
    step: "0.0001",
    required: true,
  },
  {
    key: "NH3",
    label: "NH₃浓度",
    type: "number",
    inputType: "number",
    step: "0.0001",
    required: true,
  },
  {
    key: "CO2",
    label: "CO₂浓度",
    type: "number",
    inputType: "number",
    step: "0.01",
    required: true,
  },
  {
    key: "CH4",
    label: "CH₄浓度",
    type: "number",
    inputType: "number",
    step: "0.0001",
    required: true,
  },
  {
    key: "Site ID",
    label: "站点编号",
    type: "number",
    inputType: "number",
    required: true,
  },
]

export default {
  data() {
    return {
      showChart: false,
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
    // 显示图表还是表格
    toggleChartView() {
      this.showChart = !this.showChart
      this.$nextTick(() => {
        setTimeout(() => {
          this.renderCharts()
        }, 50)
      })
    },
    renderCharts() {
      if (!this.items || this.items.length === 0) return

      const gases = ["N2O", "NH3", "CO2", "CH4"]
      const times = this.items.map((item) => {
        const date = new Date(item.Time)
        return `${date.getMonth() + 1}-${date.getDate()}` // 月份从0开始，所以加1
      })
      // 主图表数据：折线图
      const seriesData = gases.map((gas) => ({
        name: gas,
        type: "line",
        data: this.items.map((item) => item[gas]),
        smooth: true,
      }))

      const chart1 = echarts.init(this.$refs.mainChart)
      chart1.setOption({
        title: { text: "气体浓度变化趋势图" },
        tooltip: { trigger: "axis" },
        legend: { data: gases },
        xAxis: {
          type: "category",
          axisLabel: { rotate: 45 },
          data: times,
        },
        yAxis: { type: "value", name: "浓度" },
        series: seriesData,
      })

      // 第二图表：平均值柱状图
      const avgValues = gases.map((gas) => {
        const sum = this.items.reduce((acc, cur) => acc + Number(cur[gas]), 0)
        return (sum / this.items.length).toFixed(4)
      })

      const chart2 = echarts.init(this.$refs.secondChart)
      chart2.setOption({
        title: { text: "各气体平均浓度柱状图" },
        tooltip: { trigger: "item" },
        xAxis: { type: "category", data: gases },
        yAxis: { type: "value", name: "平均浓度" },
        series: [
          {
            name: "平均浓度",
            type: "bar",
            data: avgValues,
            itemStyle: {
              color: "#3398DB",
            },
          },
        ],
      })
    },
    // 格式化显示内容
    formatField(value, type) {
      if (value === null || value === undefined) return "-"
      if (type === "datetime") return new Date(value).toLocaleString()
      return value
    },

    // 获取数据
    async fetchData() {
      try {
        const response = await axios.get("http://localhost:3000/api/air")
        this.items = response.data.map((item) => ({
          ...item,
          Time: item.Time.replace(" ", "T"), // 转换时间格式用于输入框
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
        await axios.delete(`http://localhost:3000/api/air/${id}`)
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
        Time: item.Time.slice(0, 16), // 适配datetime-local格式
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
          ? `http://localhost:3000/api/air/${this.formData["Data ID"]}`
          : "http://localhost:3000/api/air"

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

.switch-btn-wrapper {
  margin-bottom: 15px;
}

.btn-switch {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.echart-wrapper {
  flex: 1;
  background: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  overflow: auto;
  min-height: 600px;
}

.chart-box {
  width: 100%;
  height: 300px;
  min-height: 300px;
}
</style>
