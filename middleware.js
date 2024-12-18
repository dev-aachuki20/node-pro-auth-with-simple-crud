const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        // req.session.cookie.expires = new Date(Date.now() + 3600000); // 1 hour from now
        next();
    } else {
        req.toastr.error('You need to log in to access this page.');
        return res.redirect('/login');
    }
}


// Middleware to check if the user is already logged in.
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/home');
    }
    next();
};

module.exports = { requireAuth, redirectIfAuthenticated };