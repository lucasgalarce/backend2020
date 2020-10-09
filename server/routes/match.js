const express = require("express");
const puppeteer = require('puppeteer');
const app = express();
const Match = require('../models/match');
const { verificaToken } = require('../middlewares/autentication');

app.get('/lastMatch', verificaToken, (req, res) => {
    Match.find().sort('-date').limit(1).exec(function(err, match) {
        if(err){
            return res.json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            match
        })
    }); 
})

// Get de partidos, si no trae query parameters(id, date, o from y to) trae los ultimos 50 partidos
// Si tiene el parametro id, busca por id
// Si tiene el parametro date, busca por esa fecha especifica
// Si tiene los parametros from y to, busca en el rango de esas fechas. El formato de la fecha es YYYY/MM/DD
app.get('/match', verificaToken, async (req, res) => {
    let id = req.query.id
    let date = req.query.date 
    let from = req.query.from 
    let to = req.query.to 

    let match;
    if (id || date){
        try {
            if (id)  match = await Match.findById(id)
            if (date) match = await Match.findOne({date: `${date}T03:00:00.000Z`});
            res.json({
                ok: true,
                match
            })
        } catch(err) {
            res.status(400).json({
                msg: 'Match not found',
                err
            })
        }
    } else if (from && to) {
        from = new Date(`${from}T03:00:00.000Z`)
        to = new Date(`${to}T03:00:00.000Z`)
        try{
            matches = await Match.find({date: {$gte: from, $lte: to} })
            res.json({
                ok: true,
                numberOfMatches: matches.length,
                matches
            })
        } catch (err) {
            res.status(400).json({
                msg: 'Match not found',
                err
            })
        }
    }
    else {
        Match.find({})
        .limit(50)
        .exec( (err, matches) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                matches
            })

        })
    }
    
})

// Calcula los puntos del Leicester en un rango de fechas
app.get('/score', verificaToken, async (req, res) => {
    let from = req.query.from 
    let to = req.query.to 
    let score = 0

    if (from && to) {
        // Convierto el valor ingreso a una fecha valida en la db
        from = new Date(`${from}T03:00:00.000Z`)
        to = new Date(`${to}T03:00:00.000Z`)
        try{
            matches = await Match.find({date: {$gte: from, $lte: to} })
            matches.forEach(element => {
                // Verifico si el leicester es el equipo local o visitante, y hago el calculo de puntos
                if(element.localTeam == 'Leicester') {
                    if(element.localScore > element.awayScore) {
                        score += 3
                    }
                } else {
                    if(element.awayScore > element.localScore) {
                        score += 3
                    }
                }
                if(element.awayScore == element.localScore) {
                    score += 1
                }

            });

            res.json({
                ok: true,
                numberOfMatches: matches.length,
                score,
                matches
            })
        } catch (err) {
            res.json({
                ok: false,
                msg: 'Match not found',
                err
            })
        }
    } else {
        return res.json({
            err: 'From and to required'
        })
    }
})

// guardar un partido manualmente
app.post('/match', verificaToken, (req,res) => {
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
app.post('/loadmatches', verificaToken, async (req, res) => {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.lcfc.com/matches/results');
    //Espero que estos selectores esten cargados
    await page.waitForSelector('.match-item__match-container')
    await page.waitForSelector('.highlighted-match__detail')
    // Evaluo la pagina
      const matches = await page.evaluate(() => {
          // Obtengo los elementos que me sirven
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
    
    // Reconvierto los datos de la fecha a tipo Date para despues poder hacer ordenamiento
    matches.forEach((element) => {
        element.date = new Date(element.date)
    });

    // Inserto todos los partidos en la db
    Match.insertMany(matches)
      .then( () => {
        return res.json({
            ok: true,
            msg: 'Matches added'
        })
      }).catch( (err) => {
          res.json({
              err
          })
      })

})

module.exports = app;