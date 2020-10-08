const express = require("express");
const puppeteer = require('puppeteer');
const app = express();
const Match = require('../models/match');

app.get('/lastMatch', (req, res) => {
    Match.find().sort('-date').limit(1).exec(function(err, match) {
        if(err){
            return res.json({
                ok: false,
                err
            })
        }

        return res.json({
            match
        })
    }); 
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

// guardar un partido manualmente
app.post('/match', (req,res) => {
    let body = req.body;
    const fullString = `${body.localTeam} ${body.localScore} - ${body.awayScore} ${body.awayTeam}`

    let match = new Match({
        localTeam: body.localTeam,
        localScore: body.localScore,
        awayTeam: body.awayTeam,
        awayScore: body.awayScore,
        date: body.date,
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
          let year = dates[0].closest(".matches-list")
          year = year.dataset.competitionMatchesList
          year = year.split(" ")
          year = year[1]
          datesArray.push(`${dateLastMatch} ${year}`)
  
          dates.forEach((date, index) => {
            let year = dates[index].closest(".matches-list")
            year = year.dataset.competitionMatchesList
            year = year.split(" ")
            year = year[1]
            datesArray.push(`${date.innerText} ${year}`)
          });
  
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
          for(let i = 0; i <= results.length; i++){
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
    matchs.forEach((element) => {
        element.date = new Date(element.date)
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