// Create a new router
const express = require("express");
const router = express.Router();
const request = require('request');

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
            request("https://api.fxratesapi.com/latest", (error, response, body) => {
                if(error){
                    next(error);
                }
                let rates = JSON.parse(body).rates.GBP;
                rates = rates.toFixed(2) * 5;

                res.render("profile.ejs", {user: result[0], rates: rates});
            });
        }
    });
});

module.exports = router;