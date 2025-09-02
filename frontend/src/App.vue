<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏：水平贴合边界 -->
    <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
      <div class="navbar__container">
        <router-link to="/" class="navbar__logo">
          <i class="navbar__logo-icon">📊</i>
          <!-- 实际项目替换为FontAwesome等图标 -->
          <span class="navbar__logo-text">数据库管理</span>
        </router-link>
        <div class="navbar__actions">
          <div class="navbar__auth-btns" v-if="!isAuthenticated">
            <router-link to="/login" class="navbar__btn login-btn"
              >登录</router-link
            >
            <router-link to="/register" class="navbar__btn register-btn"
              >注册</router-link
            >
          </div>
          <div class="navbar__user-info" v-if="isAuthenticated">
            <span class="navbar__welcome">欢迎回来</span>
            <button @click="logout" class="navbar__logout-btn">
              <i class="fa fa-sign-out"></i> 退出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 中间主内容区：水平完全贴合边界 -->
    <main class="main-content">
      <div class="route-container">
        <router-view class="page-transition"></router-view>
      </div>
    </main>

    <!-- 底部页脚：水平贴合边界 -->
    <footer class="app-footer">
      <div class="app-footer__container">
        <p>© 2023 数据库管理系统 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"

const isAuthenticated = ref(!!localStorage.getItem("userInfo"))
const isScrolled = ref(false)
const router = useRouter()
const route = useRoute()

// 同步登录状态
watch(
  route,
  () => {
    isAuthenticated.value = !!localStorage.getItem("userInfo")
  },
  { immediate: true }
)

// 导航栏滚动阴影
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
})

// 退出登录
const logout = () => {
  localStorage.removeItem("userInfo")
  isAuthenticated.value = false
  router.push("/login").catch((err) => console.warn("跳转登录页失败：", err))
}
</script>

<style scoped>
/* 1. 全局容器：水平100%，无留白 */
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw; /* 强制占满屏幕宽度 */
  overflow-y: auto;
  background-color: #f9fafb;
  margin: 0;
  padding: 0; /* 移除全局水平内边距 */
  padding-top: 60px; /* 仅给顶部导航栏留高度，无左右padding */
  box-sizing: border-box;
}

/* 2. 顶部导航栏：水平贴合，无左右留白 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0; /* 左右贴边，占满屏幕宽度 */
  z-index: 999;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.navbar--scrolled {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 导航栏容器：删除max-width和左右padding，水平贴边 */
.navbar__container {
  width: 100%; /* 占满导航栏宽度 */
  margin: 0; /* 移除居中margin */
  padding: 0 1rem; /* 可选：保留内部元素1rem间距（避免内容贴屏幕边缘），若需完全贴边则设为0 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

/* 导航栏Logo/按钮样式（无关键调整，保持原有交互） */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.navbar__logo-icon {
  font-size: 1.5rem;
  color: #2563eb;
  transition: transform 0.2s ease;
}

.navbar__logo:hover .navbar__logo-icon {
  transform: scale(1.1);
}

.navbar__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  transition: color 0.2s ease;
}

.navbar__logo:hover .navbar__logo-text {
  color: #2563eb;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__auth-btns {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__btn {
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.login-btn {
  color: #2563eb;
}

.login-btn:hover {
  color: #1d4ed8;
  background-color: rgba(37, 99, 235, 0.05);
}

.register-btn {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.register-btn:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.navbar__user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar__welcome {
  color: #4b5563;
  white-space: nowrap;
  font-size: 0.95rem;
}

.navbar__logout-btn {
  padding: 0.4rem 0.8rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.95rem;
}

.navbar__logout-btn:hover {
  color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

/* 3. 主内容区：水平完全贴边（核心调整） */
.main-content {
  flex: 1; /* 纵向占满剩余空间 */
  padding: 2rem 0; /* 仅保留上下内边距，删除左右内边距（关键） */
  box-sizing: border-box;
  width: 100%; /* 占满屏幕宽度 */
}

/* 路由容器：删除居中限制，水平贴边 */
.route-container {
  width: 100%; /* 占满主内容区宽度 */
  max-width: none; /* 删除最大宽度限制（关键） */
  margin: 0; /* 移除居中margin（关键） */
  overflow-x: auto; /* 宽内容（如表格）横向滚动，避免溢出屏幕 */
  padding: 0; /* 移除左右padding，完全贴边 */
  box-sizing: border-box;
}

/* 路由页面：水平100%，无留白 */
.page-transition {
  animation: fadeIn 0.3s ease-in-out;
  width: 100%; /* 占满路由容器宽度 */
  box-sizing: border-box;
  padding: 0 1rem; /* 可选：给路由内部内容留1rem间距（避免文字贴屏幕边缘），若需完全贴边则设为0 */
}

/* 处理路由内宽内容（如表格）：确保贴边且不溢出 */
.page-transition > div,
.page-transition form,
.page-transition table,
.page-transition .el-table {
  /* 适配组件库表格 */
  max-width: 100%;
  width: 100%;
  margin: 0;
  overflow-x: auto; /* 宽内容横向滚动 */
  box-sizing: border-box;
}

/* 页面过渡动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 4. 底部页脚：水平贴边 */
.app-footer {
  background-color: #1f2937;
  color: #d1d5db;
  padding: 1.5rem 0; /* 仅上下padding，删除左右padding */
  width: 100%; /* 占满屏幕宽度 */
  box-sizing: border-box;
  margin-top: auto;
}

/* 页脚容器：删除居中限制，水平贴边 */
.app-footer__container {
  width: 100%; /* 占满页脚宽度 */
  max-width: none; /* 删除最大宽度限制 */
  margin: 0; /* 移除居中margin */
  padding: 0 1rem; /* 可选：给页脚文字留1rem间距，若需完全贴边则设为0 */
  text-align: center;
  font-size: 0.9rem;
  box-sizing: border-box;
}

/* 响应式适配：保持水平贴边逻辑 */
@media (max-width: 768px) {
  .navbar__container {
    padding: 0 0.75rem; /* 小屏幕可选保留窄间距，避免内容贴边 */
  }

  .navbar__welcome {
    display: none;
  }

  .navbar__logo-text {
    font-size: 1.1rem;
  }

  .main-content {
    padding: 1.5rem 0; /* 小屏幕减少上下padding */
  }

  .page-transition {
    padding: 0 0.75rem; /* 小屏幕给内部内容留窄间距 */
  }

  .app-footer {
    padding: 1rem 0;
  }

  .app-footer__container {
    padding: 0 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .navbar__actions {
    gap: 0.5rem;
  }

  .navbar__auth-btns {
    gap: 0.75rem;
  }
}
</style>
