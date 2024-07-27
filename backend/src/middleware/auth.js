const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(200).send({
            status: "failed",
            error: {
                message: "Access denied!",
            },
        });
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(200).send({
            status: "failed",
            error: {
                message: "Invalid Token!",
            }
        });
    }
}