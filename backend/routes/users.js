import express from "express"
import db from "../db.js"

const router = express.Router()

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body
    // 检查必要字段
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "请提供完整的注册信息（用户名、密码、邮箱）" })
    }
    // 检查用户是否已存在
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    )
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "用户名或邮箱已被注册" })
    }
    // 存储用户信息（不加密密码）
    const [result] = await db.query(
      "INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())",
      [username, password, email]
    )
    res.status(201).json({
      message: "注册成功",
      userId: result.insertId,
    })
  } catch (err) {
    console.error("注册接口错误详情：", err)
    res.status(500).json({ error: err.message })
  }
})

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    // 检查用户是否存在
    const [users] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    )
    if (users.length === 0) {
      return res.status(401).json({ error: "用户名或密码不正确" })
    }
    // 返回用户信息（不含密码）
    const user = {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      created_at: users[0].created_at,
    }
    res.json({
      message: "登录成功",
      user,
    })
  } catch (err) {
    console.error("注册接口错误详情：", err)
    res.status(500).json({ error: err.message })
  }
})

// 获取用户信息（通过用户名）
router.get("/profile", async (req, res) => {
  try {
    const { username } = req.query
    if (!username) {
      return res.status(400).json({ error: "请提供用户名" })
    }
    // 查询用户信息（不含密码）
    const [users] = await db.query(
      "SELECT id, username, email, created_at FROM users WHERE username = ?",
      [username]
    )
    if (users.length === 0) {
      return res.status(404).json({ error: "用户不存在" })
    }
    res.json(users[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
