const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Create a new router
const express = require("express");
const bcrypt = require("bcrypt");

const cron = require("node-cron");

const saltRounds = 10;

const router = express.Router();

//happens every x amount of time;
cron.schedule('0 * * * *', () => {
  console.log("cycle has happened");
});

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
                        res.send("You're all set " + req.body.username + "! <a href='./'>click me</a> to go home");
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
                    res.send("logging in... <a href='./'>click me</a> to go home");
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

router.get("/profile", (req, res, next) => {
    res.redirect("./users/" + req.session.userId);
});

router.get("/shop", redirectLogin, (req, res, next) => {
    //I wish there was a more elegant solution in vanilla js

    //get current money
    db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (err, user_result) => {
        if(err) {
            next(err);
        }

        db.query("SELECT * FROM items", (err, item_result) => {
            if(err){
                next(err);
            }
            db.query("SELECT * FROM machines", (err, machines_result) => {
                if(err){
                    next(err);
                }

                //console.log(item_result);
                //console.log(machines_result);

                //for some reason, the type decimal get returned as a string???
                res.render("shop.ejs", {items: item_result, machines: machines_result, purse: Number(user_result[0].purse), id: user_result[0].id});
            })
        });
    });    
});

router.post("/buy", redirectLogin, (req, res, next) => {

    db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (err, user_result) => {
        if(err) {
            next(err);
        }

        if(req.body.item){
            //bought item
            db.query("SELECT * FROM items WHERE id = ?", [req.body.item], (item_error, item_result) => {

                if(item_error){
                    next(item_error);
                }

                //check if user has too many items
                db.query("SELECT * FROM items_users WHERE user_id = ?", [user_result[0].id], (error_result, check_result) => {
                    if(error_result) {
                        next(error_result);
                    } else {
                        if(check_result > 5) {
                            //tell user to sell an item before buying a new one
                            res.send("You have more than 5 items, sell an item before buying new ones!");
                        }

                        //else insert user id and item id into the useritem table
                        db.query("INSERT INTO items_users (user_id, item_id) VALUES (?,?)", [user_result[0].id, req.body.item], (error) => {
                            if(error){
                                next(error);
                            }

                            let updated_purse = user_result[0].purse - item_result[0].price;

                            //deduct money
                            db.query("UPDATE users SET purse = ? WHERE id = ?", [updated_purse, user_result[0].id], (errorcheck) => {
                                if(errorcheck){
                                    next(errorcheck);
                                }
                                
                                res.send("Successfully purchased item!");
                            });

                        })
                    }
                });
            });
        } else {
            //bought machine
            db.query("SELECT * FROM machines WHERE id = ?", [req.body.machine], (machine_error, machine_result) => {

                if(machine_error){
                    next(machine_error);
                }

                //check if user has too many machines
                db.query("SELECT * FROM machines_users WHERE user_id = ?", [user_result[0].id], (error_result, check_result) => {
                    if(error_result) {
                        next(error_result);
                    } else {
                        if(check_result > 5) {
                            //tell user to sell an item before buying a new one
                            res.send("You have more than 5 items, sell an item before buying new ones!");
                        }

                        //else insert user id and item id into the useritem table
                        db.query("INSERT INTO machines_users (user_id, machine_id) VALUES (?,?)", [user_result[0].id, req.body.machine], (error) => {
                            if(error){
                                next(error);
                            }

                            let updated_purse = user_result[0].purse - machine_result[0].price;

                            //deduct money
                            db.query("UPDATE users SET purse = ? WHERE id = ?", [updated_purse, user_result[0].id], (errorcheck) => {
                                if(errorcheck){
                                    next(errorcheck);
                                }
                                
                                res.send("Successfully purchased machine!");
                            });

                        })
                    }
                });
            });
                //tell user to sell a machine before buying a new one
            //else insert user id and the machine id into the usermachine table
        }
    });
 
});

module.exports = router;