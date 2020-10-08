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

app.get('/match/:id', async (req, res) => {
    let id = req.params.id
    let match;
    try {
        match = await Match.findById(id)
    } catch(err) {
        res.json({
            msg: 'Match not found'
        })
    }

    if(match) {
        res.json({
            match
        });
    }
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

// Guardar los ultimos 50 partidos
app.post('/loadmatchs', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.lcfc.com/matches/results');
  
    await page.waitForSelector('.match-item__match-container')
    await page.waitForSelector('.highlighted-match__detail')
    
      const matchs = await page.evaluate(() => {
          const teams = document.querySelectorAll('.match-item__team-container')
          const dates = document.querySelectorAll('.match-item__date')
          const results = document.querySelectorAll('.match-item__match-detail')
          const resLastMatch = document.querySelector('.highlighted-match__detail').innerText
          const dateLastMatch = document.querySelector('.highlighted-match__date').innerText
  
          const datesArray = [];
          const teamsArray = [];
          const localTeamsArray = [];
          const awayTeamsArray = [];
          const localResultsArray = [];
          const awayResultsArray = [];
          
          // Carga de todos los nombres de equipos
          for(let localTeam of teams) {
            teamsArray.push(localTeam.innerText)
          }
  
          //Distingo cuales eran los equipos locales y cuales visitantes
          for(let i = 0; i < teamsArray.length; i++) {
            if (i%2 == 0) {
              localTeamsArray.push(teamsArray[i])
            } else {
              awayTeamsArray.push(teamsArray[i])
            }
          }
  
          // Carga de fechas
          // Cargo la primer fecha manual porque tiene un selector distinto
          datesArray.push(dateLastMatch)
          for(let date of dates) {
            datesArray.push(date.innerText)
          }
          // Carga de resultados, del local y del visitante
          // Hago la carta del resultado del ultimo partido ya que no tiene el mismo selector que los demas
          localResultsArray.push(resLastMatch[0])
          awayResultsArray.push(resLastMatch[2])
          for(let result of results) {
            localResultsArray.push(result.innerText[0])
          }
          for(let result of results) {
            awayResultsArray.push(result.innerText[2])
          }
  
          match = []
          // armo los objetos con los datos del partido
          for(let i = 0; i <= 49; i++){
            match.push({
              localTeam: localTeamsArray[i],
              localScore: localResultsArray[i],
              awayTeam: awayTeamsArray[i],
              awayScore: awayResultsArray[i],
              date: datesArray[i],
              fullString: `${localTeamsArray[i]} ${localResultsArray[i]} - ${awayResultsArray[i]} ${awayTeamsArray[i]}`
            })
          }
          
          return match
      })
  
    await browser.close();
    
    //reconvierto los datos de la fecha a tipo Date para despues poder hacer ordenamiento
    matchs.forEach(element => {
        element.date = new Date(`${element.date} 2020`)
    });

    Match.insertMany(matchs)
      .then( () => {
        return res.json({
            ok: true,
            msg: 'Matchs added'
        })
      }).catch( (err) => {
          res.json({
              err
          })
      })

})

module.exports = app;