const express = require('express');
const database = require("./config/database");
require("dotenv").config();
const cors = require('cors');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');

const routeApiV1 = require("./api/v1/routes/client/index.route");
const routeAdminApiV1 = require("./api/v1/routes/admin/index.route");

const app = express()
const port = process.env.PORT;

app.use(cors());

app.use(cookieParser());

database.connect();

// parse application/json
app.use(bodyParser.json())

routeApiV1(app);
routeAdminApiV1(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})