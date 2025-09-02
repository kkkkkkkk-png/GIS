import { createApp } from "vue"
import router from "./router"
import "./style.css"
import App from "./App.vue"

const app = createApp(App)
app.use(router) // 关键步骤：注册路由
app.mount("#app")
