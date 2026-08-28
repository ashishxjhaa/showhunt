import cors from "cors"
import cookieParser from "cookie-parser"
import express, { type Request, type Response } from "express"
import { authRouter } from "./routes/auth.routes"

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.set("trust proxy", 1)

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "showhunt-server" })
})

app.use("/api/v1/auth", authRouter)

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

const port = process.env.PORT ?? 4000
app.listen(port, () => {
  console.log(`showhunt-server listening on :${port}`)
})
