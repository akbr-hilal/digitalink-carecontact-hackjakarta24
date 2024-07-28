const Joi = require('joi');
const dbConnect = require('../database/dbConfig');
const { default: axios } = require('axios');

exports.addReport = async (req, res) => {
    const schema = Joi.object({
        descInput: Joi.string().min(3).required(),
        imageInput: Joi.binary(),
        locationInput: Joi.string().min(3).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(200).send({
            status: "failed",
            error: {
                message: error.details[0].message,
            },
        });
    }

    try {
        const data = {
            createdByInput: req.user.id,
            descInput: req.body.descInput,
            fileNameInput: req?.file?.filename,
            locationInput: req.body.locationInput
        };
        dbConnect.query(
            "SELECT COUNT(*) as count FROM User WHERE id_user = ?",
            [data.createdByInput],
            (err, rows, fields) => {
                if (err) {
                    console.error("Error executing MySQL query count: " + err.stack);
                    return res.status(500).send({
                        status: "failed",
                        error: {
                            message: "Internal Server Error",
                        },
                    });

                }
                if (rows[0].count < 1) {
                    return res.status(200).send({
                        status: "failed",
                        error: {
                            message: "Id User is not found",
                        },
                    });
                } else {
                    dbConnect.query(
                        "INSERT INTO Report (created_by, description, image, location, status) values (?,?,?,?,0)",
                        [data.createdByInput, data.descInput, data.fileNameInput, data.locationInput],
                        (err, rows, fields) => {
                            if (err) {
                                console.error(
                                    "Error executing MySQL query insert: " + err.stack
                                );
                                return res.status(500).send({
                                    status: "failed",
                                    error: {
                                        message: "Internal Server Error",
                                    },
                                });

                            }
                            return res.status(200).send({
                                status: "success",
                                message: "Add product success"
                            })
                        }
                    )
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

exports.getReport = async (req, res) => {
    try {
        dbConnect.query(
            "SELECT  * from Report ",
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

exports.getReportId = async (req, res) => {
    try {
        const { id } = req.params;
        dbConnect.query(
            "SELECT  * from Report where id_report = ?",
            [id],
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

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        dbConnect.query(
            "DELETE FROM  Report where id_report = ?",
            [id],
            (err, rows) => {
                if(err){
                    console.error(
                        "Error executing MySQL query: " + err.stack
                    );
                    return res.status(500).send({
                        status: "failed",
                        error: {
                            message: "Internal Server Error",
                        },
                    });
                }else{
                    return res.status(200).send({
                        status: "success",
                        message: "data has been successfully deleted"
                    })
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

exports.updateReport = async (req, res) =>{
    const schema = Joi.object({
        statusInput: Joi.number().min(1).required(),
        approveInput: Joi.number().min(1).required()
    })

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(200).send({
            status: "failed",
            error: {
                message: error.details[0].message,
            },
        });
    }
    try {
        const { id } = req.params;
        dbConnect.query(
            "SELECT COUNT(*) as count FROM Report WHERE id_report = ?",
            [id],
            (err, rows) => {
                if (err) {
                    console.error("Error executing MySQL query count: " + err.stack);
                    return res.status(500).send({
                        status: "failed",
                        error: {
                            message: "Internal Server Error",
                        },
                    });
                }
                if (rows[0].count < 1) {
                    return res.status(200).send({
                        status: "failed",
                        error: {
                            message: "Report is not found",
                        },
                    });
                } else {
                    const { statusInput, approveInput } = req.body;
                    dbConnect.query(
                        "SELECT COUNT(*) as count FROM User WHERE id_user = ?",
                        [approveInput],
                        (err, rows, fields) => {
                            if (err) {
                                console.error("Error executing MySQL query count: " + err.stack);
                                return res.status(500).send({
                                    status: "failed",
                                    error: {
                                        message: "Internal Server Error",
                                    },
                                });
            
                            }
                            if (rows[0].count < 1) {
                                return res.status(200).send({
                                    status: "failed",
                                    error: {
                                        message: "Id User is not found",
                                    },
                                });
                            } else {
                                const { statusInput, approveInput } = req.body;
                                dbConnect.query(
                                    "UPDATE Report set status = ?, approve_by = ? WHERE id_report = ?",
                                    [statusInput, approveInput, id],
                                    (err, rows, fields) => {
                                        if (err) {
                                            console.error(
                                                "Error executing MySQL query insert: " + err.stack
                                            );
                                            return res.status(500).send({
                                                status: "failed",
                                                error: {
                                                    message: "Internal Server Error",
                                                },
                                            });

                                        }
                                        return res.status(200).send({
                                            status: "success",
                                            message: "update Agency success"
                                        })
                                    }
                                )
                            }
                            
                        }
                    )
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

// exports.generateAI = async (req, res) => {
//     const schema = Joi.object({
//         imageInput: Joi.binary(),
//         descInput: Joi.string().min(3).required(),
//         latitude: Joi.number().required(),
//         longitude: Joi.number().required()
//     })

//     const { error } = schema.validate(req.body);

//     if (error) {
//         return res.status(200).send({
//             status: "failed",
//             error: {
//                 message: error.details[0].message,
//             },
//         });
//     }

//     try {
//         console.log("req.file: ", req.file)
//         const form = new FormData();
//         form.append("file", req?.file);
//         form.append("prompt", req.body.descInput);
//         form.append("latitude", req.body.latitude);
//         form.append("longitude", req.body.longitude);

//         const headers = {
//             'Content-Type': 'multipart/form-data'
//         };
//         const resp = await axios.post("https://1517-103-123-250-164.ngrok-free.app/predict_contact_name", form, { headers: headers });
//         console.log(resp)

//         return res.status(200).json(resp.data);

//     } catch (error) {
//         console.error("Gagal: ", error);
//         return res.status(500).send({
//             status: "failed",
//             error: {
//                 message: "Internal Server Error",
//             },
//         });
//     }
// }
