import express from "express"
import cors from "cors"
import air from "./routes/air.js"
import climacticRouter from "./routes/climactic.js"
import liquidRouter from "./routes/liquid.js"
import soilRouter from "./routes/soil.js"
import treatmentRouter from "./routes/treatment.js"
import usersRouter from "./routes/users.js"

const app = express()
app.use(cors())
app.use(express.json())

// 挂载路由
app.use("/api/air", air)
app.use("/api/climactic", climacticRouter)
app.use("/api/liquid", liquidRouter)
app.use("/api/soil", soilRouter)
app.use("/api/treatment", treatmentRouter)
app.use("/api/auth", usersRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
})
