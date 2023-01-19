const mustBeLogged = async (req, res, next) => {
  // console.log(req.method);
  if (req.isAuthenticated()) next();
  else {
    if (req.method === "GET") {
      res.status(403);
      res.redirect("/login");
    } else if (req.method === "POST") {
      res.status(400);
      res.json({
        msg: "You are not logged in",
      });
    }
  }
};

const mustNotBeLogged = async (req, res, next) => {
  // console.log(req.method);
  if (req.isAuthenticated()) {
    if (req.method === "GET") {
      res.status(403);
      res.redirect("/");
    } else if (req.method === "POST") {
      res.status(403);
      res.json({
        msg: "You are already logged in",
      });
    }
  } else next();
};

module.exports = { mustBeLogged, mustNotBeLogged };
