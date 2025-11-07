// Importar dependencias
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require('dotenv').config();

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "notes",
  port: 3306
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
  } else {
    console.log("✅ Conectado a la base de datos 'notes'");
  }
});

// ============================
//         RUTAS CRUD
// ============================

// 📖 READ - obtener todas las notas
app.get("/api/posts", (req, res) => {
  db.query("SELECT * FROM posts ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✍ CREATE - crear nueva nota
app.post("/api/posts", (req, res) => {
  const { title, body } = req.body;
  const query = "INSERT INTO posts (title, body, created_at) VALUES (?, ?, NOW())";
  db.query(query, [title, body], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, title, body });
  });
});

// 🛠 UPDATE - editar una nota
app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const query = "UPDATE posts SET title = ?, body = ? WHERE id = ?";
  db.query(query, [title, body, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Nota actualizada correctamente" });
  });
});

// 🗑 DELETE - eliminar una nota
app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM posts WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Nota eliminada correctamente" });
  });
});

// Servidor en marcha
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});