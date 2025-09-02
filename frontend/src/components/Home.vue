<template>
  <div class="app-container">
    <!-- 左侧导航栏：保持功能不变，确保不挤压右侧空间 -->
    <nav class="navbar">
      <div class="nav-title">黄淮海北部农区氮素数据库</div>
      <div class="nav-links">
        <router-link to="air-table">空气数据</router-link>
        <router-link to="climactic-table">气候数据</router-link>
        <router-link to="liquid-table">液体数据</router-link>
        <router-link to="soil-table">土壤理化数据</router-link>
        <router-link to="treatment-table">处理方式</router-link>
      </div>
    </nav>

    <!-- 右侧内容显示：核心优化区域，确保最大化且可滚动 -->
    <div class="main-content">
      <router-view />
      <!-- 路由页面会自动填充此区域 -->
    </div>
  </div>
</template>

<style scoped>
/* 父容器：确保全屏布局，flex分配空间 */
.app-container {
  display: flex;
  height: 100vh; /* 占满整个屏幕高度 */
  width: 100vw; /* 占满整个屏幕宽度（避免横向留白） */
  overflow: hidden; /* 防止整体布局溢出 */
  margin: 0;
  padding: 0;
}

/* 左侧导航栏：固定宽度，不挤压右侧 */
.navbar {
  flex: 0 0 180px; /* 固定宽度180px，不伸缩 */
  background: linear-gradient(135deg, #3d7e4a, #66b2a1);
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.nav-title {
  margin-top: 1.5rem;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  line-height: 1.5;
  padding: 0 0.8rem 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  box-sizing: border-box; /* 确保padding不撑大宽度 */
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 2rem;
  width: 100%;
  align-items: center;
  padding-bottom: 2rem; /* 底部留空，避免链接贴底 */
}

.nav-links a {
  text-decoration: none;
  color: #34495e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
  background: linear-gradient(45deg, #3d7e4a, #66b2a1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 80%;
  text-align: center;
  box-sizing: border-box;
}

.nav-links a:hover {
  background: linear-gradient(45deg, #66b2a1, #3d7e4a);
  color: white;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* 右侧主内容区：核心优化，实现“最大化” */
.main-content {
  flex: 1; /* 占据父容器剩余的全部空间（关键） */
  height: 100%; /* 继承父容器高度，避免额外拉伸 */
  overflow: auto; /* 内容超出时可滚动（避免内容被截断） */
  padding: 1.5rem; /* 内边距，防止内容贴边（可选，提升美观） */
  box-sizing: border-box; /* 确保padding不挤压内容宽度 */
  background-color: #f8f9fa; /* 浅背景，区分内容区（可选） */
}
</style>

<script>
export default {
  name: "App",
}
</script>
