const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing Token' });

        // remove 'Bearer' from token
        token = token.replace('Bearer ', '');
        console.log("Token received: ", token);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log('Token verification error:', err);
                return res.status(401).json({ error: 'Unauthorized - Invalid Token After Verification'});

            }

            req.user = user;
            next();
        });
    };
};

module.exports = authenticate;