import { createRouter, createWebHistory } from "vue-router"
import AirTable from "../components/AirTable.vue"
import ClimacticTable from "../components/ClimacticTable.vue"
import LiquidTable from "../components/LiquidTable.vue"
import SoilTable from "../components/SoilTable.vue"
import Treatment from "../components/TreatmentTable.vue"

import Home from "../components/Home.vue"
import Register from "../components/Register.vue"
import Login from "../components/Login.vue"

// 路由规则
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true, // 需要登录才能访问
    },
    // 二级路由配置
    children: [
      {
        path: "air-table",
        name: "AirTable",
        component: AirTable,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "climactic-table",
        name: "ClimacticTable",
        component: ClimacticTable,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "liquid-table",
        name: "LiquidTable",
        component: LiquidTable,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "soil-table",
        name: "SoilTable",
        component: SoilTable,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "treatment-table",
        name: "Treatment",
        component: Treatment,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false, // 不需要登录就能访问
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      requiresAuth: false, // 不需要登录就能访问
    },
  },
  // 404页面
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫 - 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  const isAuthenticated = localStorage.getItem("userInfo") !== null

  // 需要登录的页面，但用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login")
  }
  // 已登录用户访问登录/注册页，重定向到首页
  else if (
    !to.meta.requiresAuth &&
    isAuthenticated &&
    (to.name === "Login" || to.name === "Register")
  ) {
    next("/")
  }
  // 其他情况正常访问
  else {
    next()
  }
})

export default router
