const { check, validationResult, body } = require('express-validator');
const request = require('request');

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

//happens every 1 hour;
cron.schedule('0 * * * *', () => {
  db.query("UPDATE users SET cycles = cycles + 1 WHERE id > 0", (err) => {
    if(err)
        console.error(err);
    });
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

router.post("/registered",[check("email").isEmail(), check("password").isLength({min : 6}), check("username").isLength({min : 3, max : 14}).isAlphanumeric()], (req, res, next) => {
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
                        if(check_result.length > 5) {
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
                        if(check_result.length > 5) {
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

router.get("/collection", redirectLogin, (req, res, next) => {

    //join user with items_users and items
    let item_query = "SELECT users.id, items_users.user_id, items_users.item_id, items.id, items.price, items.name, items.growth_rate, users.username FROM (( users INNER JOIN items_users ON users.id = items_users.user_id ) INNER JOIN items ON items.id = items_users.item_id ) WHERE username = ?";

    let machine_query = "SELECT users.id, machines_users.user_id, machines_users.machine_id, machines.id, machines.price, machines.farm_rate, machines.fuel, machines.name, users.username FROM (( users INNER JOIN machines_users ON users.id = machines_users.user_id ) INNER JOIN machines ON machines.id = machines_users.machine_id ) WHERE username = ?"

    db.query(item_query, [req.session.userId], (item_err, item_result) => {
        if(item_err){
            next(item_err);
        }

        db.query(machine_query, [req.session.userId], (machine_err, machine_result) => {
            if(machine_err){
                next(machine_err);
            }

            //We need user info
            db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (user_err, user_result) => {
                if(user_err){
                    next(user_err);
                }

                ////how much we can theoretically gain
                //growth rate
                let growth_rate = 1;
                for(let i = 0; i < item_result.length; i++){
                    growth_rate += Number(item_result[i].growth_rate);
                }

                let max_melons = user_result[0].land * 6 * growth_rate;
                
                ////machines take melon for fuel per cycle
                let fuel_cost = 0;
                for(let i = 0; i < machine_result.length; i++){
                    fuel_cost += machine_result[i].fuel;
                }
 
                max_melons -= fuel_cost;

                //pick up yield
                let pickup = 0;
                for(let i = 0; i < machine_result.length; i++){
                    pickup += (10 * machine_result[i].farm_rate);
                } 

                let result = 0;

                if(pickup > max_melons) {
                    result = max_melons 
                } else {
                    result = pickup;
                };

                result *= user_result[0].cycles;
                //set cycles to 0 and add the final result of melons
                db.query("UPDATE users SET cycles = 0, melons = melons + ? WHERE username = ?", [result, req.session.userId], (collect_err) => {
                    if(collect_err){
                        next(err);
                    }
                    res.render("collection.ejs", {collection: result});
                });

            });
        });
    });

});

router.get("/landshop", redirectLogin, (req, res, next) => {
    db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (err, result) => {
        if(err){
            next(err);
        }

        //we'll calculate the price of the next area serverside
        let landPrice = 1.5 * (result[0].land / 100);

        res.render("landshop.ejs", {user: result[0], cost: landPrice});
    });
});

router.post("/buy_land", redirectLogin, (req, res, next) => {
    
    db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (err, result) => {
        if(err){
            next(err);
        }
        //we'll calculate the price of the next area serverside
        let landPrice = 1.5 * (result[0].land / 100);

        db.query("UPDATE users SET land = land + 100, purse = purse - ? WHERE username = ?", [landPrice, req.session.userId], (buy_err) => {
            if(buy_err){
                next(buy_err);
            }

            res.send("successfully purchased more land");
        });

    }); 
});

router.get("/trade", redirectLogin, (req, res, next) => {
    db.query("SELECT * FROM users WHERE username = ?", [req.session.userId], (error, result) => {
        if(error){
            next(error);
        }

        request("https://api.fxratesapi.com/latest", (err, response, body) => {
            if(err){
                next(err);
            }
            let rates = JSON.parse(body).rates.GBP;

            //round to 2 dp
            res.render("trade.ejs", {rate: rates.toFixed(2) * 5, all: result[0].melons});
        });       
    }); 
});

router.post("/exchange",[check("amount").isNumeric()], redirectLogin, (req, res, next) => {
    request("https://api.fxratesapi.com/latest", (err, response, body) => {
            if(err){
                next(err);
            }
            let rates = JSON.parse(body).rates.GBP;
            rates = rates.toFixed(2) * 5;

            let exchangedMoney = rates * req.body.amount;

            db.query("UPDATE users SET purse = purse + ? , melons = melons - ? WHERE username = ?", [exchangedMoney, req.body.amount, req.session.userId], (err) => {
                if(err){
                    next(err);
                }
                res.send("Successfully converted " + req.body.amount + " to " + (rates * req.body.amount));
            });
    });
});

router.get("/user-list", (req, res, next) => {
    db.query("SELECT username, purse, melons, land FROM users", (err, result) => {
        if(err){
            next(err);
            res.json(err);
        }

        res.json(result);
    });
});

router.post("/search-user", (req, res, next) => {
    res.redirect("/users/" + req.body.username);
});

router.get("/sell-items", redirectLogin, (req, res, next) => {
    let query = "SELECT users.username, items_users.*, items.name, items.price FROM ((users INNER JOIN items_users ON users.id = items_users.user_id) INNER JOIN items ON items.id = items_users.item_id) WHERE username = ?";
    db.query(query, [req.session.userId], (err, result) => {
        if(err){
            next(err);
        }
        res.render("sell_items.ejs", {items: result});
    });
});

router.post("/sellingItem", redirectLogin, (req, res, next) => {
    db.query("SELECT * FROM items_users INNER JOIN items ON items_users.item_id = items.id WHERE items_users.id = ?", [req.body.item], (err, result) => {
        if(err){
            next(err);
        }
        //refund user
        db.query("UPDATE users SET purse = purse + ? WHERE username = ?", [result[0].price, req.session.userId], (err) => {
            if(err){
                next(err);
            }
            //delete record
            db.query("DELETE FROM items_users WHERE id = ?", [req.body.item], (err) => {
                if(err){
                    next(err);
                }

                res.send("sold " + result[0].name + " and refunded " + result[0].price);
            })
        })
    })
});

router.get("/sell-machines", redirectLogin, (req, res, next) => {
    let query = "SELECT users.username, machines_users.*, machines.name, machines.price FROM ((users INNER JOIN machines_users ON users.id = machines_users.user_id) INNER JOIN machines ON machines.id = machines_users.machine_id) WHERE username = ?";
    db.query(query, [req.session.userId], (err, result) => {
        if(err){
            next(err);
        }
        res.render("sell_machines.ejs", {machines: result});
    });
});

router.post("/sellingMachine", redirectLogin, (req, res, next) => {
    db.query("SELECT * FROM machines_users INNER JOIN machines ON machines_users.machine_id = machines.id WHERE machines_users.id = ?", [req.body.machine], (err, result) => {
        if(err){
            next(err);
        }
        //refund user
        db.query("UPDATE users SET purse = purse + ? WHERE username = ?", [result[0].price, req.session.userId], (err) => {
            if(err){
                next(err);
            }
            //delete record
            db.query("DELETE FROM machines_users WHERE id = ?", [req.body.machine], (err) => {
                if(err){
                    next(err);
                }

                res.send("sold " + result[0].name + " and refunded " + result[0].price);
            })
        })
    })
});

router.get("/about", (req, res, next) => {
    res.render("about.ejs");
});

module.exports = router;