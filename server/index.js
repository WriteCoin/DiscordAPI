import { config } from "dotenv";
import express from "express";
import { router } from "./routes/index.js";

config()

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use("/", router)

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
