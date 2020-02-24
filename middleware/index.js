var middlewareObj = {}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "ログインしてください。");
    res.redirect("/login");
}

module.exports = middlewareObj;