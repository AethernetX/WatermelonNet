const { check, validationResult } = require('express-validator');

// Create a new router
const express = require("express");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const router = express.Router();

// Handle our routes
router.get("/", (req, res, next) => {
    let hasSession = false;
    if(req.session.userId){
        hasSession = true;
    }
    res.render("index.ejs", {hasSession : hasSession});
})

router.get("/register", (req, res, next) => {
    res.render("register.ejs");
});

router.post("/registered",[check("email").isEmail(), check("password").isLength({min : 6}), check("username").isLength({min : 3, max : 14})], (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        res.send("Uh oh! your username is either too long or too short, your password is too small or your email is not valid!");
    } else {
        //sanatise data
        req.sanitize(req.body.username);    
        req.sanitize(req.body.password);    
        req.sanitize(req.body.email);

        //hash
        const plainPassword = req.body.password;
        bcrypt.hash(plainPassword, saltRounds, (err, password) => {
            if(err){
                next(err);
            } else {
                let sqlQuery = "INSERT INTO users (username, password, email) VALUES (?,?,?)";
                let record = [req.body.username, password, req.body.email];

                db.query(sqlQuery, record, (error, result) => {
                    if(error){
                        next(error);
                    } else {
                        res.send("You're all set " + req.body.username + "!");
                    }
                });
            }
        })

    }

});


router.get("/login", (req, res, next) => {
    res.render("login.ejs");
});

router.post("/loggingIn", (req, res, next) => {

    //sanatise
    req.sanitize(req.body.username);
    req.sanitize(req.body.password);

    let usernameQuery = "SELECT * FROM users WHERE username = ?";
    
    db.query(usernameQuery, [req.body.username], (err, result) => {
        if(err) {
            next(err);
        } else if(result.length == 1) {
            bcrypt.compare(req.body.password, result[0].password, (error, result) => {
                if(error) {
                    next(error);
                } else if(result == true) {
                    // Save user session here, when login is successful
                    req.session.userId = req.body.username;
                    res.send("logging in...");
                } else {
                    res.send("wrong password...");
                }
            })
        } else {
            res.send("cannot find username");
        }

        }
    )

});

router.get("/logout", (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/')
        }
            res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
});

//for profile, we'll just redirect them to users and search for their profile
router.get("/profile", (req, res, next) => {
    res.redirect("./users/" + req.session.userId);
});

module.exports = router;