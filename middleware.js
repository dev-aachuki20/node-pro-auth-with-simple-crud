function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}


// Middleware to check if the user is already logged in.
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/home');
    }
    next();
};

module.exports = { requireAuth, redirectIfAuthenticated };