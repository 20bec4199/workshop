const express = require('express');
const app = express();
const users = require('./routes/user');
const workshops = require('./routes/workshop');
const bodyParser = require('body-parser');
const errorMiddleware = require('./middlewares/error');
const cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000', // Your frontend's URL
    credentials: true
}));

app.use('/api/workshop',users);
app.use('/api/workshop',workshops);


app.use(errorMiddleware);


module.exports = app;