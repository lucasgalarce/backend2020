const express = require("express");
const puppeteer = require('puppeteer');
const app = express();
const Match = require('../models/match');

// guardar ultimo partido con la info de la pagina
app.post('/lastMatch', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.lcfc.com/');
    // await page.screenshot({path: 'example.png'});
    
        const lastMatch = await page.evaluate(() => {
            const elements = document.querySelectorAll('.match-abridged--slim-hide')
    
            const equipos = [];
            for(let element of elements) {
                equipos.push(element.innerText)
            }
    
            const localTeam = equipos[0];
            const awayTeam = equipos[1];
            const result = document.querySelector('.match-abridged__score').innerText;
            const localScore = result[0];
            const awayScore = result[2];
            const fullString = `${localTeam} ${localScore} - ${awayScore} ${awayTeam}`
    
            let match = {
                localTeam,
                localScore,
                awayTeam,
                awayScore,
                fullString
            };
            return match
        })
    
        console.log(lastMatch)
    
    await browser.close();
    
    const match = new Match({
        localTeam: lastMatch.localTeam,
        localScore: lastMatch.localScore,
        awayTeam: lastMatch.awayTeam,
        awayScore: lastMatch.awayScore,
        fullString: lastMatch.fullString
    })

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

app.get('/lastMatch', (req, res) => {
    res.json({
        msg: 'ultimo partido'
    })
})
app.get('/match', (req, res) => {
    Match.find({})
    .limit(50)
    .exec( (err, matchs) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            matchs
        })
    })
})

app.get('/match/:id', (req, res) => {
    let id = req.params.id
    res.json({
        id
    });
})

// guardar partido a mano
app.post('/match', (req,res) => {
    let body = req.body;
    const fullString = `${body.localTeam} ${body.localScore} - ${body.awayScore} ${body.awayTeam}`

    let match = new Match({
        localTeam,
        localScore,
        awayTeam,
        awayScore,
        fullString
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