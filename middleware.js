const sessio = function(req, res, next) {
    myuser = req.session;
    next();
  };

module.exports = sessio;