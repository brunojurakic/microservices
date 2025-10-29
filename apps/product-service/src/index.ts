import "dotenv/config"
import express from "express"
import cors from "cors"
import productRoutes from "./routes/products.js"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "product-service" })
})

app.use("/products", productRoutes)

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Products endpoint: http://localhost:${PORT}/products`)
})
