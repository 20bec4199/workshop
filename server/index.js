const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');
const connectDatabase = require('./config/database');
dotenv.config({path:path.join(__dirname,"config/config.env")});

console.log(process.env.PORT);
connectDatabase();
app.listen(process.env.PORT,()=>{
    console.log(`server is running at the port of ${process.env.PORT}`);
});