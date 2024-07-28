const Joi = require('joi');
const dbConnect = require('../database/dbConfig')

exports.getRole = async (req, res) => {
    try {
        dbConnect.query(
            "SELECT * FROM Role",
            (err, rows) => {
                if (err) {
                    console.error(
                        "Error executing MySQL query: " + err.stack
                    );
                    return res.status(500).send({
                        status: "failed",
                        error: {
                            message: "Internal Server Error",
                        },
                    });
                } else {
                    if (rows.length > 0) {
                        console.log(rows)

                        return res.status(200).send({
                            status: "success",
                            data: rows
                        })
                    }
                }
            }
        )
    } catch (error) {
        console.error("Gagal: ", error);
            return res.status(500).send({
                status: "failed",
                error: {
                    message: "Internal Server Error",
                },
            });
    }
}