import express from "express"
import { PORT } from "./config/env.js"

const app = express()

app.post("/", (req, res) => {
  res.send("Welcome to subscription tracker api")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})
