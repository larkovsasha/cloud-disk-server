const mongoose = require('mongoose')
const express = require('express')
const config = require('config')
const authRouter = require('./routes/auth.routes')
const fileRouter = require('./routes/file.routes')
const corsMiddleware = require('./middleware/cors.middleware')
const filePathMiddleware = require('./middleware/filepath.middleware')
const path = require('path')
const app = express()
const PORT = config.get('serverPORT')

app.use(corsMiddleware)
app.use(filePathMiddleware(path.resolve(__dirname)))
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)

const start = async () => {
    try{
       await mongoose.connect(config.get('dbUrl'), { useNewUrlParser: true, useUnifiedTopology: true })

        app.listen(PORT, () => {
            console.log('server',PORT)
        })
    }catch (e){

    }
}
start()

