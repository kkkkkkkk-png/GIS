import express from "express"
import db from "../db.js"

const router = express.Router()

// 获取所有处理方式
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM treatment")
    res.json(rows)
  } catch (err) {
    res.status(500).json({
      error: "数据库查询失败",
      detail: err.message,
    })
  }
})

// 创建新记录
router.post("/", async (req, res) => {
  const { Treatment } = req.body

  if (!Treatment) {
    return res.status(400).json({ error: "处理方式不能为空" })
  }

  try {
    const [result] = await db.query(
      "INSERT INTO treatment (Treatment) VALUES (?)",
      [Treatment]
    )
    res.status(201).json({
      id: result.insertId,
      message: "记录创建成功",
    })
  } catch (err) {
    res.status(400).json({
      error: "数据库操作失败",
      detail: err.message,
    })
  }
})

// 更新记录
router.put("/:id", async (req, res) => {
  const id = req.params.id
  const { Treatment } = req.body

  if (!Treatment) {
    return res.status(400).json({ error: "处理方式不能为空" })
  }

  try {
    const [result] = await db.query(
      "UPDATE treatment SET Treatment = ? WHERE `Data ID` = ?",
      [Treatment, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "未找到记录" })
    }

    res.json({
      message: "记录更新成功",
      affectedRows: result.affectedRows,
    })
  } catch (err) {
    res.status(500).json({
      error: "数据库操作失败",
      detail: err.message,
    })
  }
})

// 删除记录
router.delete("/:id", async (req, res) => {
  const id = req.params.id
  try {
    const [result] = await db.query(
      "DELETE FROM treatment WHERE `Data ID` = ?",
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "未找到记录" })
    }
    res.json({
      message: "记录删除成功",
      affectedRows: result.affectedRows,
    })
  } catch (err) {
    res.status(500).json({
      error: "数据库操作失败",
      detail: err.message,
    })
  }
})

export default router
