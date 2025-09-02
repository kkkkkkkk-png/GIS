import express from "express"
import db from "../db.js"

const router = express.Router()

// 获取所有空气数据
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM `air`")
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 创建新记录
router.post("/", async (req, res) => {
  const {
    "Reaching ID": Reaching_ID,
    Treatment,
    Fertility,
    Time,
    N2O,
    NH3,
    CO2,
    CH4,
    "Site ID": Site_ID,
  } = req.body
  try {
    const [result] = await db.query(
      `INSERT INTO air 
        (\`Reaching ID\`, Treatment, Fertility, \`Time\`, 
        N2O, NH3, CO2, CH4, \`Site ID\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Reaching_ID, Treatment, Fertility, Time, N2O, NH3, CO2, CH4, Site_ID]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// 删除指定记录
router.delete("/:id", async (req, res) => {
  const id = req.params.id

  try {
    // 使用参数化查询防止SQL注入
    const [result] = await db.query("DELETE FROM air WHERE `Data ID` = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" })
    }

    res.json({
      message: "Record deleted successfully",
      affectedRows: result.affectedRows,
    })
  } catch (err) {
    console.error("Database error:", err)
    res.status(500).json({
      error: "Internal server error",
      detail: err.message,
    })
  }
})

// 更新指定记录 (PUT 完整更新)
router.put("/:id", async (req, res) => {
  const id = req.params.id
  const {
    "Reaching ID": Reaching_ID,
    Treatment,
    Fertility,
    Time,
    N2O,
    NH3,
    CO2,
    CH4,
    "Site ID": Site_ID,
  } = req.body

  // 参数验证
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID format" })
  }

  try {
    // 使用参数化查询
    const [result] = await db.query(
      `UPDATE air SET
        \`Reaching ID\` = ?,
        Treatment = ?,
        Fertility = ?,
        \`Time\` = ?,
        N2O = ?,
        NH3 = ?,
        CO2 = ?,
        CH4 = ?,
        \`Site ID\` = ?
       WHERE \`Data ID\` = ?`,
      [Reaching_ID, Treatment, Fertility, Time, N2O, NH3, CO2, CH4, Site_ID, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" })
    }

    res.json({
      message: "Record updated successfully",
      affectedRows: result.affectedRows,
    })
  } catch (err) {
    console.error("Database error:", err)
    res.status(500).json({
      error: "Internal server error",
      detail: err.message,
    })
  }
})

export default router
