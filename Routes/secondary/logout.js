const express = require('express');
const { mustBeLogged } = require('../../Services/Middleware/authMiddleware');
const app = express.Router();

app.get("/", mustBeLogged, async (req, res) => {
     req.session.destroy(() => {
          res.status(200)
          res.json({msg:"Session terminated successfully!"})
     })
})

module.exports = app;