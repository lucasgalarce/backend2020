const express = require("express");
const app = express();
const Match = require('../models/match');


app.get('/lastMatch', (req, res) => {
    res.json("lastMatch")
})

app.get('/allMatchs', (req, res) => {
    res.json('matchs');
})

app.get('/match/:id', (req, res) => {
    let id = req.params.id
    res.json({
        id
    });
})

app.post('/match', (req,res) => {
    let body = req.body;

    let match = new Match({
        localTeam: body.localTeam,
        localScore: body.localScore
    });

    match.save((err, matchDB) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            match: matchDB
        })
    })

})

module.exports = app;