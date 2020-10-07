const express = require("express");
const app = express();
const User = require('../models/user');


app.get('/user', (req, res) => {
    res.json("users")
})

app.get('/user/:id', (req, res) => {
    let id = req.params.id
    res.json({
        id
    });
})

app.post('/user', (req,res) => {
    let body = req.body;

    let user = new User({
        email: body.email,
        password: body.password
    });

    user.save((err, userDB) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            user: userDB
        })
    })

})

module.exports = app;