import cors from "cors"
import cookieParser from "cookie-parser"
import express, { type Request, type Response } from "express"
import { authRouter } from "./routes/auth.routes"
import { listingRouter } from "./routes/listing.routes"
import { uploadRouter } from "./routes/upload.routes"
import { errorHandler, notFoundHandler } from "./middleware/error.middleware"

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: "5mb" }))
app.set("trust proxy", 1)

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "showhunt-server" })
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/listings", listingRouter)
app.use("/api/v1/uploads", uploadRouter)

app.use(notFoundHandler)
app.use(errorHandler)

const port = process.env.PORT ?? 4000
app.listen(port, () => {
  console.log(`showhunt-server listening on :${port}`)
})
