import express from "express"
import bodyParser from "body-parser"
import mysql from "mysql"
import cors from "cors"

const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Luiza-1234",
  database: "clinica_consultas",
  connectionLimit: 10,
})

export default pool

app.post("/pacientes", (req, res) => {
  const { nome, telefone } = req.body
  pool.query(
    "INSERT INTO pacientes (nome, telefone) VALUES (?, ?)",
    [nome, telefone],
    (err, results) => {
      if (err) {
        console.error("Erro ao cadastrar paciente:", err)
        res.status(500).json({ error: "Erro ao cadastrar paciente" })
      } else {
        res.status(201).json({ message: "Paciente cadastrado com sucesso!" })
      }
    }
  )
})

app.get("/pacientes", (req, res) => {
  pool.query("SELECT * FROM pacientes", (err, results) => {
    if (err) {
      console.error("Erro ao obter pacientes:", err)
      res.status(500).json({ error: "Erro ao obter pacientes" })
    } else {
      res.json(results)
    }
  })
})

app.post("/consultas", (req, res) => {
  const { paciente_id, data, hora, especialidade } = req.body

  console.log("Dados recebidos na rota /consultas:", {
    paciente_id,
    data,
    hora,
    especialidade,
  })

  if (!paciente_id || !data || !hora || !especialidade) {
    console.error("Dados faltantes ou inválidos:")
    if (!paciente_id) console.error("paciente_id faltando ou inválido")
    if (!data) console.error("data faltando ou inválida")
    if (!hora) console.error("hora faltando ou inválida")
    if (!especialidade) console.error("especialidade faltando ou inválida")
    return res.status(400).json({ error: "Dados faltantes ou inválidos" })
  }

  const partesData = data.split("-")
  if (partesData.length !== 3) {
    console.error("Formato de data inválido. Use YYYY-MM-DD")
    return res
      .status(400)
      .json({ error: "Formato de data inválido. Use YYYY-MM-DD" })
  }

  const [ano, mes, dia] = partesData
  const dataFormatada = `${ano}-${mes}-${dia}`

  console.log(`data recebida ${data}`)
  console.log(`data formatada ${dataFormatada}`)

  pool.query(
    "INSERT INTO consultas (paciente_id, data, hora, especialidade) VALUES (?, ?, ?, ?)",
    [paciente_id, dataFormatada, hora, especialidade],
    (err, results) => {
      if (err) {
        console.error("Erro ao marcar consulta:", err)
        return res.status(500).json({ error: "Erro ao marcar consulta" })
      } else {
        return res
          .status(201)
          .json({ message: "Consulta marcada com sucesso!" })
      }
    }
  )
})

app.get("/consultas", (req, res) => {
  pool.query("SELECT * FROM consultas", (err, results) => {
    if (err) {
      console.error("Erro ao obter consultas:", err)
      res.status(500).json({ error: "Erro ao obter consultas" })
    } else {
      res.json(results)
    }
  })
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})

app.delete("/pacientes", (req, res) => {
  pool.query(
    "DELETE FROM pacientes",
    (err, results) => {
      if (err) {
        console.error("Erro ao remover paciente:", err)
        res.status(500).json({ error: "Erro ao remover paciente" })
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Paciente não encontrado" })
      } else {
        res.status(200).json({ message: "Paciente removido com sucesso!" })
      }
    }
  )
})

