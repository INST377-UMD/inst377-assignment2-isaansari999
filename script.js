/*document.getElementById("dogButton").onclick = function () {
    location.href= "dogs.html";
}

document.getElementById("stockButton").onclick = function () {
    location.href= "stocks.html";
    console.log("Working!")
}*/


window.addEventListener('DOMContentLoaded', async () => {
    const quoteP = document.getElementById("quote");
    if (quoteP) {
        try {
            const res = await fetch('https://zenquotes.io/api/random/[key]')
            const data = await res.json();
            quoteP.innerHTML = `<blockquote>"${data[0].q}" - ${data[0].a}</blockquote>`
        }
        catch {
            quoteP.innerHTML = "Something went wrong and the quote died :("
        }
    }
});

function startVoice() {
    if (annyang) {
      const commands = {
        'hello': () => alert('Hello World'),
        'change the color to *color': color => document.body.style.backgroundColor = color,
        'navigate to *page': page => {
          const lowerPage = page.toLowerCase();
          if (lowerPage === 'home') window.location.href = 'home.html';
          else if (lowerPage === 'stocks') window.location.href = 'stocks.html';
          else if (lowerPage === 'dogs') window.location.href = 'dogs.html';
        }
      };
      annyang.addCommands(commands);
      annyang.start();
    }
  }

  function stopVoice() {
    if (annyang) annyang.abort();
  }

  async function getDogs() {
    const carousel = document.getElementById("dogCarousel")
    const res = await fetch("https://dog.ceo/api/breeds/image/random/10");
    const data = await res.json();
    console.log(data)
    carousel.innerHTML = data.message.map(url => `<img src="${url}" class="dog-slide-img">`).join('');
    console.log("this works")
    
    
    simpleslider.getSlider();   
  

}

async function loadBreeds() {
    const breeds = document.getElementById("breeds")
    const res = await fetch("https://dogapi.dog/api/v2/breeds")
    const data = await res.json();

    indexedBreeds = data.data;

    data.data.forEach(breed => {
      const btn = document.createElement("button");
      btn.className = "button-29";
      btn.textContent = breed.attributes.name;
      btn.onclick = () => breedData(breed.attributes);
      breeds.appendChild(btn);
    });
}

async function breedData (dog){ 

    const hiddendiv = document.getElementById("dogExpand")
    hiddendiv.style.display = 'block'
    hiddendiv.innerHTML = `
      <h3>${dog.name}</h3>
      <p><strong>Description:</strong> ${dog.description}</p>
      <p><strong>Lifespan:</strong> ${dog.life.min} - ${dog.life.max} years</p>`;
}

if (window.location.href.includes("dogs.html")) {
    getDogs();
    loadBreeds();

    if (annyang) {
        annyang.addCommands({
            'load dog breed *breed': name => {
                const match = indexedBreeds.find(p => 
                    p.attributes.name.toLowerCase() === name.toLowerCase()
                );
                if (match) breedData(match.attributes);
            }
        })
    }
}

async function redditStocks() {
    try {
        const res = await fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
      const data = await res.json();
      const top5 = data.slice(0, 5);
      const body = document.querySelector('#redditStocks tbody')

      top5.forEach(stock => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
          <td>${stock.no_of_comments}</td>
          <td>
          <img 
            src="${stock.sentiment === 'Bullish' ? 'https://static.thenounproject.com/png/3328202-200.png' : 'https://cdn.iconscout.com/icon/free/png-256/free-bearish-icon-download-in-svg-png-gif-file-formats--downtrend-animal-stocks-finance-investment-pack-business-icons-1570417.png'}" 
            alt="${stock.sentiment}" 
            
        
          />
        </td>
        `

        body.appendChild(newRow)
      })
    }
    catch {
        console.log("something wrong man")
    }

}

let stockChartInstance;

async function lookupStock() {
    const ticker = document.getElementById('ticker').value.toUpperCase();
    console.log(ticker);
    const days = parseInt(document.getElementById('days').value);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const format = d => d.toISOString().split('T')[0];
    const from = format(start);
    const to = format(end);

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=QfqAFgY_XEu55NEcVIS5unARA_cNcFxG`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        alert('No data found for this ticker.');
        return;
      }

      const labels = data.results.map(r => new Date(r.t).toLocaleDateString());
      const prices = data.results.map(r => r.c);
      console.log(ticker)
      const ctx = document.getElementById('stockChart').getContext('2d');
      document.getElementById('stockChart').style.display = 'block';




      if (stockChartInstance) {
        stockChartInstance.destroy();
      }

      stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${ticker} Closing Prices`,
            data: prices,
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          },
          scales: {
            x: { ticks: { color: 'white' } },
            y: { ticks: { color: 'white' } }
          }
        }
      });
    } catch (err) {
      alert('Error fetching stock data.');
      console.error(err);
    }
  }

if (window.location.href.includes("stocks.html")) {
    redditStocks();

    if (annyang) {
        annyang.addCommands({
            'look up *ticker': name => {
                document.getElementById('ticker').value = name
                lookupStock();
            }
        })
    }
}