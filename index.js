const puppeteer = require('puppeteer');
const match = require('./server/models/match');
 
(async () => {
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
        let dateFormated = dateLastMatch.split(" ")
        dateFormated = `${year}/${dateFormated[2]}/${dateFormated[1]}`
        datesArray.push(dateFormated)

        dates.forEach((date, index) => {
          if(index >= 49) return;
          let year = dates[index].closest(".matches-list")
          year = year.dataset.competitionMatchesList
          year = year.split(" ")
          year = year[1]
          let dateFormated = date.innerText.split(" ")
          dateFormated = `${year}/${dateFormated[2]}/${dateFormated[1]}`
          datesArray.push(dateFormated)
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

    matchs.forEach((element) => {
        element.date = new Date(element.date)
    });

    console.log(matchs)
    console.log(matchs.length)

  await browser.close();
})();