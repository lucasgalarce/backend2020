const puppeteer = require('puppeteer');
 
(async () => {
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.lcfc.com/matches/results');
  // await page.screenshot({path: 'example.png'});

//   await page.click('.match-abridged__container a')
//     const lastMatch = await page.evaluate(() => {
//         const team = document.querySelector('.teamName');

//         // const localTeam = team.innerHTML;

//         return team;
//     })
//     console.log(lastMatch);
//     await page.waitFor(1000)
  await page.waitForSelector('.match-item__match-container')
  
    const matchs = await page.evaluate(() => {
        const localTeams = document.querySelectorAll('.match-item__team-container')
        const fechas = document.querySelectorAll('.match-item__date')
        const results = document.querySelectorAll('.match-item__match-detail')
        // const elements = document.querySelectorAll('.match-item__match-container')
        // const elements = document.querySelectorAll('.match-item__match-container')


        // const fechasArray = [];
        
        // for(let fecha of fechas) {
        //   // const partido = {}
        //   // partido.localTeam = element
        //   fechasArray.push(fecha.innerText)
        // }
        // const teamLocalArray = [];
        // for(let localTeam of localTeams) {
        //   teamLocalArray.push(localTeam.innerText)
        // }

        const localResultsArray = [];
        const awayResultsArray = [];
        
        for(let result of results) {
          localResultsArray.push(result.innerText[0])
        }

        for(let result of results) {
          awayResultsArray.push(result.innerText[2])
        }

        return awayResultsArray
    })

    console.log(matchs)
    console.log(matchs[0])
    console.log(matchs[1])
    console.log(matchs[2])



  await browser.close();
})();


