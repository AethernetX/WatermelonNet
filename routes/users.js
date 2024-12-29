// Create a new router
const express = require("express");
const router = express.Router();
const request = require('request');

router.get("/", (req, res, next) => {
    db.query("SELECT username FROM users ORDER BY purse DESC, melons DESC, land DESC;", (err, result) => {
        if(err){
            next(err);
        }

        res.render("users.ejs", {users: result});
    });
});

router.get("/:username", (req, res, next) => {
    let username = req.params.username;
    req.sanitize(username);    
    db.query("SELECT username, id, purse, melons, land FROM users WHERE username = ?", [username], (err, result) => {
        if(err){
            next(err);
        }

        if(result.length == 0){
            res.send("User does not exist!")
        } else {

            db.query("SELECT * FROM items_users INNER JOIN items ON items_users.item_id = items.id WHERE items_users.user_id = ?", [result[0].id], (item_err, item_result) =>{
                if(item_err){
                    next(err);
                }

                db.query("SELECT * FROM machines_users INNER JOIN machines ON machines_users.machine_id = machines.id WHERE machines_users.user_id = ?", [result[0].id], (machine_err, machine_result) => {
                    if(machine_err){
                        next(err);
                    }

                    request("https://api.fxratesapi.com/latest", (error, response, body) => {
                        if(error){
                            next(error);
                        }

                        let rates = JSON.parse(body).rates.GBP;
                        rates = rates.toFixed(2) * 5;

                        let assets = 0;

                        for(item in item_result){
                            assets += Number(item_result[item].price);
                        }

                        for(machine in machine_result){
                            assets += Number(machine_result[machine].price);
                        }

                        res.render("profile.ejs", {user: result[0], rates: rates, items: item_result, machines: machine_result, assets: assets});
                    });

                });
            }); 
        }
    });
});

module.exports = router;