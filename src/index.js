const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');

const router = require("../routes/index.js");

//Connecting to db
mongoose.set('strictQuery', false);
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

const database = mongoose.connection;

database.on('error', (error)=>{
    console.log(error);
})

database.once('connected', ()=> {
    console.log('Database Connected')
})

//global middlewares
app.use(express.json()); // to access the req.body as json
app.use(helmet()); 
// app.use(morgan("common")); //logging req


//routes
app.get('/', (req, res) => {
    // res.send('Hello World');
    res.send({ message: 'Hello World' });
    console.log('ok');
});
app.use('/api', router);

app.listen(3000, ()=>{console.log('Server started at port 3000')});
