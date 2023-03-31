const express = require('express');

const app = express();

// to store and use env variables in .env file
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');


const router = require("../routes");

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

// global middlewares
app.use(cors());
app.use(express.json()); // to parse the req.body as json object
app.use(helmet()); 
// app.use(morgan("common")); //logging req



// helmet({ crossOriginResourcePolicy: false, })
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(
//     helmet({
//       crossOriginResourcePolicy: false,
//     })
//   );





app.use('/public',express.static('public')) // for rendering the public folder statically




//routes
app.get('/', (req, res) => {
    // res.send('Hello World');
    res.send({ message: 'Welcome' });
    console.log('ok');
});
app.use('/api', router);

app.listen(3000, ()=>{console.log('Server started at port 3000')});
