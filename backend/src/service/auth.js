const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const dbConnect = require('../database/dbConfig')

exports.register = async (req, res) => {
    const schema = Joi.object({
        idRoleInput: Joi.number().min(1).required(),
        nameInput: Joi.string().min(3).required(),
        usernameInput: Joi.string().min(3).required(),
        emailInput: Joi.string().email().required(),
        passwordInput: Joi.string().min(4).required()
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
        const { idRoleInput, nameInput, usernameInput, emailInput, passwordInput } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordInput, salt);
        dbConnect.query(
            "SELECT COUNT(*) AS count FROM User WHERE  username = ? and email = ?",
            [usernameInput, passwordInput],
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
                            message: "Email or Username Already",
                        },
                    });

                } else {
                    dbConnect.query(
                        "INSERT INTO User (id_role, name, username, email, password) values (?,?,?,?,?)",
                        [idRoleInput, nameInput, usernameInput, emailInput, hashedPassword],
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
                                "SELECT id_user, name FROM User WHERE email = ? and username = ?",
                                [emailInput, usernameInput],
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

exports.login = async (req, res) => {
    const schema = Joi.object({
        usernameInput: Joi.string().min(3).required(),
        passwordInput: Joi.string().min(4).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(200).send({
            status: "failed",
            error: {
                message: error.details[0].message,
            },
        });
    } else {
        try {
            const { usernameInput, passwordInput } = req.body;
            dbConnect.query(
                "SELECT * FROM User WHERE username = ?",
                [usernameInput],
                async (err, rows) => {
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
                            const { id_user, id_role, name, username, email, password } =
                                rows[0];
                            console.log(password)
                            const isValid = await bcrypt.compare(
                                passwordInput,
                                password
                            );
                            console.log(isValid)
                            if (!isValid) {
                                return res.status(200).send({
                                    status: "failed",
                                    error: {
                                        message: "Password wrong!",
                                    },
                                });
                            } else {
                                const token = jwt.sign(
                                    { id: id_user },
                                    process.env.TOKEN_KEY
                                );
                                return res.status(200).send({
                                    status: "success",
                                    message: "Login success",
                                    data: {
                                        name: name,
                                        email: email,
                                        username: username,
                                        token: token
                                    },
                                })
                            }
                        } else {
                            return res.status(200).send({
                                status: "failed",
                                error: {
                                    message: "Username not found",
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
}

exports.checkAuth = async (req, res) => {
    try {
        const id = req.user.id;

        dbConnect.query(
            "SELECT name, username, email FROM User WHERE id_user = ?",
            [id],
            (err, rows) => {
                if (err) {
                    console.error(
                        "Error executing MySQL query: " + err.stack
                    );
                    res.status(500).send({
                        status: "failed",
                        error: {
                            message: "Internal Server Error",
                        },
                    });
                    return;
                } else {

                    if (!rows) {
                        return res.status(200).send({
                            status: 'failed'
                        })
                    } else {
                        const dataUser = JSON.parse(JSON.stringify(rows[0]));

                        return res.status(200).send({
                            status: "success",
                            data: dataUser
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