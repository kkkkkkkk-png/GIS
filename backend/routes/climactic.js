import express from "express"
import db from "../db.js"

const router = express.Router()

// 获取所有气候数据
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM `climactic`")
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
  const {
    "Site ID": Site_ID,
    "Site name": Site_name,
    Longitude,
    Latitude,
    MAT,
    MAR,
  } = req.body

  // 基本验证
  if (!Site_ID || !Site_name) {
    return res.status(400).json({ error: "站点ID和名称为必填项" })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO climactic 
      (\`Site ID\`, \`Site name\`, Longitude, Latitude, MAT, MAR)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [Site_ID, Site_name, Longitude, Latitude, MAT, MAR]
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
  const { "Site name": Site_name, Longitude, Latitude, MAT, MAR } = req.body

  if (isNaN(id)) {
    return res.status(400).json({ error: "无效的ID格式" })
  }

  try {
    const [result] = await db.query(
      `UPDATE climactic SET
        \`Site name\` = ?,
        Longitude = ?,
        Latitude = ?,
        MAT = ?,
        MAR = ?
       WHERE \`Site ID\` = ?`,
      [Site_name, Longitude, Latitude, MAT, MAR, id]
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
      "DELETE FROM climactic WHERE `Site ID` = ?",
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
