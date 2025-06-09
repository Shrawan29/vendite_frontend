import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import "./aggregation/billsSummary.aggreagtion.js"; // ⏰ Starts the cron job automatically


const app=express()

app.get('/', (req, res) => {
    res.send('Server is up');
  });

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//route import

import userRouter from "./routes/user.routes.js"

import productRouter from "./routes/product.routes.js"

import categoryRouter from "./routes/category.routes.js"

import billRouter from "./routes/bill.routes.js"

import salesSummaryRouter from './routes/salesSummary.routes.js'

import yearlySalesRouter from './routes/yearlySales.routes.js'

//route decleration
app.use("/api/v2/users",userRouter)

app.use("/api/v2/products",productRouter)

app.use("/api/v2/categories",categoryRouter)

app.use("/api/v2/bills",billRouter)

app.use("/api/v2/sales-summary",salesSummaryRouter)

app.use("/api/v2/yearly-sales-summary",yearlySalesRouter)

export {app}