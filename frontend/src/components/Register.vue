<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="form-header">
        <h2>创建账号</h2>
        <p>开启您的美好旅程</p>
      </div>
      <!-- 显示错误信息 -->
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

      <form @submit.prevent="handleRegister" class="floating-form">
        <!-- 补充用户名输入框，因为脚本中定义了username但模板中没有 -->
        <div class="input-group">
          <input type="text" id="username" v-model="username" required />
          <label for="username">用户名</label>
          <span class="highlight"></span>
        </div>

        <div class="input-group">
          <input type="email" id="email" v-model="email" required />
          <label for="email">邮箱地址</label>
          <span class="highlight"></span>
        </div>

        <div class="input-group">
          <input
            type="password"
            id="password"
            v-model="password"
            required
            minlength="6"
            maxlength="20"
          />
          <label for="password">密码</label>
          <span class="highlight"></span>
        </div>

        <div class="input-group">
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            minlength="6"
            maxlength="20"
          />
          <label for="confirmPassword">确认密码</label>
          <span class="highlight"></span>
        </div>

        <button type="submit" class="submit-btn">
          <span>立即注册</span>
          <i class="arrow-icon"></i>
        </button>

        <div class="form-footer">
          <span>已有账号？</span>
          <a href="/login">立即登录</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"

// 初始化路由
const router = useRouter()

// 定义响应式变量
const username = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const errorMsg = ref("")
const isLoading = ref(false)
const isFormValid = ref(false)
const touched = reactive({
  username: false,
  email: false,
  password: false,
  confirmPassword: false,
})

// 表单验证信息
const emailError = ref("")
const passwordError = ref("")
const confirmPasswordError = ref("")

// 输入框失焦时标记为已触碰
const markTouched = (field) => {
  touched[field] = true
  validateForm()
}

// 表单验证
const validateForm = () => {
  let isValid = true

  // 邮箱验证
  if (touched.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.value) {
      emailError.value = "邮箱不能为空"
      isValid = false
    } else if (!emailPattern.test(email.value)) {
      emailError.value = "请输入有效的邮箱地址"
      isValid = false
    } else {
      emailError.value = ""
    }
  }

  // 密码验证
  if (touched.password) {
    if (!password.value) {
      passwordError.value = "密码不能为空"
      isValid = false
    } else if (password.value.length < 6) {
      passwordError.value = "密码长度不能少于6位"
      isValid = false
    } else if (password.value.length > 20) {
      passwordError.value = "密码长度不能超过20位"
      isValid = false
    } else {
      passwordError.value = ""
    }
  }

  // 确认密码验证
  if (touched.confirmPassword) {
    if (!confirmPassword.value) {
      confirmPasswordError.value = "请确认密码"
      isValid = false
    } else if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = "两次输入的密码不一致"
      isValid = false
    } else {
      confirmPasswordError.value = ""
    }
  }

  // 检查所有字段是否填写
  if (
    username.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  ) {
    isValid = true
  } else {
    isValid = false
  }

  isFormValid.value = isValid
}

const handleRegister = async () => {
  // 标记所有字段为已触碰
  Object.keys(touched).forEach((key) => {
    touched[key] = true
  })

  // 验证表单
  validateForm()
  if (!isFormValid.value) return

  // 重置错误信息
  errorMsg.value = ""

  try {
    isLoading.value = true

    // 发送注册请求
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "注册失败，请稍后重试")
    }

    // 注册成功，显示提示并跳转到登录页
    errorMsg.value = "注册成功，请登录"
    setTimeout(() => {
      router.push("/login")
    }, 1500)
  } catch (e) {
    errorMsg.value = e.message || "注册失败，请稍后重试"
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* 可以添加错误信息的样式 */
.error-message {
  color: #ff4d4f;
  margin-bottom: 16px;
  padding: 8px;
  text-align: center;
}
</style>
<style scoped>
.register-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.form-header p {
  color: #95a5a6;
  font-size: 16px;
}

.floating-form .input-group {
  position: relative;
  margin-bottom: 30px;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: transparent;
}

.input-group label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 5px;
  color: #95a5a6;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
  border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: 0;
  font-size: 14px;
  color: #3498db;
}

.verification-group {
  display: flex;
  gap: 10px;
}

.verification-group input {
  flex: 1;
}

.send-code-btn {
  padding: 0 20px;
  background: #e8f5fe;
  color: #3498db;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover {
  background: #d0e9fd;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-45deg);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #95a5a6;
}

.form-footer a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-container {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .input-group input {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .register-container {
    max-width: 400px;
    padding: 30px;
  }

  .form-header h2 {
    font-size: 28px;
  }

  .form-header p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 20px;
    margin: 10px;
    max-width: 100%;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .form-header p {
    font-size: 14px;
  }

  .input-group input {
    padding: 12px;
    font-size: 14px;
  }

  .input-group label {
    font-size: 14px;
  }

  .verification-group {
    flex-direction: column;
    gap: 5px;
  }

  .send-code-btn {
    width: 100%;
    padding: 12px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .register-container {
    padding: 15px;
  }

  .form-header h2 {
    font-size: 20px;
  }

  .input-group {
    margin-bottom: 20px;
  }
}
</style>
