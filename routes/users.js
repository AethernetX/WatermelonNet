// Create a new router
const express = require("express");
const router = express.Router();

router.get("/:username", (req, res, next) => {
    let username = req.params.username;
    req.sanitize(username);    
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
        if(err){
            next(err);
        }

        if(result.length == 0){
            res.send("User does not exist!")
        } else {
            res.render("profile.ejs", {user: result[0]});
        }
    });
});

module.exports = router;