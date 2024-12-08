// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get("/", function(req, res, next){
    res.render("index.ejs");
})

router.get("/register", function(req, res, next){
    res.render("register.ejs");
});

module.exports = router;