const mysql = require('mysql');

const isProduction = process.env.NODE_ENV === "production";

let connection;

if (isProduction) {
    connection = mysql.createConnection({
        host: process.env.SERVERDB_HOST,
        database: process.env.SERVERDB_DATABASE,
        user: process.env.SERVERDB_USER,
        password: process.env.SERVERB_PASSWORD
    })
} else {
    connection = mysql.createConnection({
        host: process.env.TMPDB_HOST,
        database: process.env.TMPDB_DATABASE,
        user: process.env.TMPDB_USER,
        password: process.env.TMPDB_PASSWORD
    })
}

connection.connect((err) => {
    if(err) throw err;

    console.log("Database Connected ... ");
})

module.exports = connection;