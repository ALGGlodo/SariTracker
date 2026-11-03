const dotenv = require("dotenv");
const path = require("path");
const {Pool} = require("pg");

require("dotenv").config();

const result = dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

console.log("Environment file loaded:", !result.error);
console.log("Password detected:", Boolean(process.env.DB_PASSWORD));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});
module.exports = pool;