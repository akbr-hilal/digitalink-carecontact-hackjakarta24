require('dotenv').config();
const express = require('express');
const cors = require('cors');
const router = require('./src/route');
const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/v1/dglserver", router);
app.use("/uploads", express.static('uploads'))
app.get("/", (req, res) => {
    res.status(200).send("Running")
});

app.get("/api/v1/dlglobalinv", (req, res) => {
    res.status(200).send("Running")
});

app.listen(port);