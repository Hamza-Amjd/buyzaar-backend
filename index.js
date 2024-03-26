const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
const bodyParser = require("body-parser");

connectToMongo();
const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/shop', require('./routes/shop'))


app.listen(port, () => {
  console.log(`Shop app listening at http://localhost:${port}`)
})