const puppeteer = require('puppeteer');
 
(async () => {
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.lcfc.com/');
  await page.screenshot({path: 'example.png'});

//   await page.click('.match-abridged__container a')
//     const lastMatch = await page.evaluate(() => {
//         const team = document.querySelector('.teamName');

//         // const localTeam = team.innerHTML;

//         return team;
//     })
//     console.log(lastMatch);
//     await page.waitFor(1000)

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

        const match = `${localTeam} ${localScore} - ${awayScore} ${awayTeam}`

        return match
    })

    console.log(lastMatch)

  await browser.close();
})();


