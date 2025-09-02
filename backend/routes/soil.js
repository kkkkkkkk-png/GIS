import express from "express"
import db from "../db.js"

const router = express.Router()

// 获取所有土壤数据
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM `soil physicochemical`")
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
    "Reaching ID": Reaching_ID,
    Treatment,
    Fertility,
    Time,
    PH,
    EC,
    SM,
    SOM,
    DOC,
    "NH4+": NH4,
    "NO3-": NO3,
    TN,
  } = req.body

  try {
    const [result] = await db.query(
      `INSERT INTO \`soil physicochemical\` 
      (\`Site ID\`, \`Reaching ID\`, Treatment, Fertility, \`Time\`,
       PH, EC, SM, SOM, DOC, \`NH4+\`, \`NO3-\`, TN)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Site_ID,
        Reaching_ID,
        Treatment,
        Fertility,
        Time,
        PH,
        EC,
        SM,
        SOM,
        DOC,
        NH4,
        NO3,
        TN,
      ]
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
  const {
    "Site ID": Site_ID,
    "Reaching ID": Reaching_ID,
    Treatment,
    Fertility,
    Time,
    PH,
    EC,
    SM,
    SOM,
    DOC,
    "NH4+": NH4,
    "NO3-": NO3,
    TN,
  } = req.body

  try {
    const [result] = await db.query(
      `UPDATE \`soil physicochemical\` SET
        \`Site ID\` = ?,
        \`Reaching ID\` = ?,
        Treatment = ?,
        Fertility = ?,
        \`Time\` = ?,
        PH = ?,
        EC = ?,
        SM = ?,
        SOM = ?,
        DOC = ?,
        \`NH4+\` = ?,
        \`NO3-\` = ?,
        TN = ?
       WHERE \`Data ID\` = ?`,
      [
        Site_ID,
        Reaching_ID,
        Treatment,
        Fertility,
        Time,
        PH,
        EC,
        SM,
        SOM,
        DOC,
        NH4,
        NO3,
        TN,
        id,
      ]
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
      "DELETE FROM `soil physicochemical` WHERE `Data ID` = ?",
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
