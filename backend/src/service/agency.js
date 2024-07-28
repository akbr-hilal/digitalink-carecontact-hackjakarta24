const Joi = require('joi');
const dbConnect = require('../database/dbConfig')

exports.addAgency = async (req, res) => {
    const schema = Joi.object({
        idUserInput: Joi.number().min(1).required(),
        agencyNameInput: Joi.string().min(3).required(),
        addressInput: Joi.string().min(5).required(),
        telpInput: Joi.string().min(10).required(),
        latitudeInput: Joi.number().required(),
        longtitudeInput: Joi.number().required()
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
        const { idUserInput, agencyNameInput, addressInput, telpInput, latitudeInput, longtitudeInput } = req.body;
        console.log(latitudeInput, longtitudeInput)
        dbConnect.query(
            "SELECT COUNT(*) as count FROM User WHERE id_user = ?",
            [idUserInput],
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
                        "SELECT COUNT(*) AS count FROM Agency a join User u on a.id_user = u.id_user WHERE a.agency_name = ? AND a.address = ? and a.id_user = ?",
                        [agencyNameInput, addressInput, idUserInput],
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
                            if (rows[0].count > 0) {
                                return res.status(200).send({
                                    status: "failed",
                                    error: {
                                        message: "Agency Name or Address Already",
                                    },
                                });
                            } else {
                                dbConnect.query(
                                    "INSERT INTO Agency (id_user, agency_name, address, telephone, latitude, longtitude) values (?,?,?,?,?,?)",
                                    [idUserInput, agencyNameInput, addressInput, telpInput, latitudeInput, longtitudeInput],
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
                                        dbConnect.query(
                                            "SELECT id_agency FROM Agency WHERE agency_name = ? and address = ? and id_user = ?",
                                            [agencyNameInput, addressInput, idUserInput],
                                            (err, rows, fields) => {
                                                if (err) {
                                                    console.error(
                                                        "Error executing MySQL query select: " +
                                                        err.stack
                                                    );
                                                    return res.status(500).send({
                                                        status: "failed",
                                                        error: {
                                                            message:
                                                                "Internal Server Error",
                                                        },
                                                    });

                                                } else {
                                                    const { name } = rows[0];
                                                    return res.status(200).send({
                                                        status: "success",
                                                        data: {
                                                            name: name,
                                                            message: "Register Success"
                                                        },
                                                    });
                                                }
                                            }
                                        )
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

exports.updateAgency = async (req, res) => {
    const schema = Joi.object({
        addressInput: Joi.string().min(5).required(),
        telpInput: Joi.string().min(10).required()
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
            "SELECT COUNT(*) as count FROM Agency WHERE id_agency = ?",
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
                            message: "Agency is not found",
                        },
                    });
                } else {
                    const { addressInput, telpInput } = req.body;
                    dbConnect.query(
                        "UPDATE Agency set address = ?, telephone = ? WHERE id_agency = ?",
                        [addressInput, telpInput, id],
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

exports.deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;
        dbConnect.query(
            "DELETE FROM Agency WHERE id_agency = ?",
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

exports.getAgency = async (req, res) => {
    try {
        dbConnect.query(
            "SELECT * FROM Agency",
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

exports.getAgencyId = async (req, res) => {
    try {
        const { id } = req.params;
        dbConnect.query(
            "SELECT * FROM Agency WHERE id_agency = ?",
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
                    } else {
                        return res.status(200).send({
                            status: "failed",
                            error: {
                                message: "id agency not found",
                            },
                        });
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