// Create a new router
const express = require("express");
const router = express.Router();

router.get("/:username", (req, res, next) => {

    res.render("profile.ejs", {username: req.params.username, user: req.session.userId});
});

module.exports = router;