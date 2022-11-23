const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.Port || 5000;

//middleware
app.use(cors());
app.use(express.json());


app.use('/', (req, res) => {
    res.send('assignment11');
})

app.listen(port, () => {
    console.log(`server is running ${port}`);
})