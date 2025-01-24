function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Navbar
const navLinks = $$(".navbar a");
let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);
currentLink?.classList.add('current');


// Players' Statistics Page

function handlePlayerClick(e, players){
    const playerName = e.target.closest(".player-mini").querySelector("p").textContent;
    renderPlayerStats(findPlayer(players, playerName), playerName);
}

fetch('../data/WNBA.json')
    .then(response => response.json())
    .then(players => {
        // Filter players for the year 2024
        const players2024 = players.filter(player => player.Year === 2024);
        let team = "ALL"; // Default filter

        // Make dropdown for filtering
        const teamFilterContainer = document.querySelector('.filter'); // Target where to insert the label

        // Create the label
        const label = document.createElement('label');
        label.classList.add('color-scheme');
        label.innerHTML = 'Team: ';

        // Create the select dropdown
        const select = document.createElement('select');

        // Create the "All" option
        const allOption = document.createElement('option');
        allOption.textContent = 'ALL';
        allOption.value = 'ALL';
        select.appendChild(allOption);

        // Extract unique teams for the year 2024
        const teams2024 = [...new Set(players.filter(player => player.Year === 2024).map(player => player.Team))];

        // Populate the dropdown with team options
        teams2024.forEach(team => {
            const option = document.createElement('option');
            option.textContent = team;
            option.value = team;
            select.appendChild(option);
        });

        // Add eventListener to select
        select.addEventListener("change", (e)=>{
            team = e.target.value;
            renderPlayers(players, filterPlayers(players2024, team));
        })

        // Append the select to the label
        label.appendChild(select);

        // Append the label to the container
        teamFilterContainer.appendChild(label);


        //const players2024FirstTen = players2024.slice(130,141);
        renderPlayers(players, filterPlayers(players2024, team));
        
    })
    .catch(error => console.error('Error fetching player data:', error));

function filterPlayers(players, team) {
    // Filter players based on the selected team and year 2024
    if (team === "ALL") {
        return players.filter(player => player.Year === 2024);
    } else {
        return players.filter(player => player.Year === 2024 && player.Team === team);
    }
}

// Function to render filtered players
function renderPlayers(players, displayedPlayers) { // Note players contains players across years while displayed players is only 2024
    // Show players on left column
    const playerColumn = document.querySelector('.left-player-column'); // Target the correct section

    // Remove current players
    playerColumn.querySelectorAll(".player-mini").forEach((playerMini)=>{
        playerMini.removeEventListener("click", (e) => handlePlayerClick(e, players));
        playerMini.remove();
    })

    displayedPlayers.forEach(player => {
        // Create player mini card
        const playerMini = document.createElement('div');
        playerMini.classList.add('player-mini');

        // Create image element
        const img = document.createElement('img');
        img.classList.add('player-photo');
        img.src = `images/${player.Player.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_").toLowerCase()}.jpg`;
        img.alt = `${player.Player}`;
        img.onerror = () => (img.src = 'images/placeholder.jpg'); // Fallback image

        // Create description container
        const description = document.createElement('div');
        description.classList.add('player-description');
        description.innerHTML = `<p>${player.Player}</p>`;

        // Append children to mini card
        playerMini.appendChild(img);
        playerMini.appendChild(description);

        // Add the mini card to the left player column
        playerColumn.appendChild(playerMini);
        playerMini.addEventListener("click", (e) => handlePlayerClick(e, players)); // Add event listener for each player
    
        playerColumn.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls to the top of the players
    });
}

function findPlayer(players, playerName){
    return players.filter(player => player.Player === playerName);
}

function renderPlayerStats(dataPlayer, playerName){
    // Generate unique IDs for the charts
    const pointsChartId = `ptsChart-${playerName.replace(/\s+/g, '-').toLowerCase()}`;
    const assistsChartId = `assistsChart-${playerName.replace(/\s+/g, '-').toLowerCase()}`;

    // Check if player stats is already displaying
    if(document.getElementById(pointsChartId)){
        return;
    }

    // Sort dataPlayer by Year in ascending order
    dataPlayer.sort((a, b) => a.Year - b.Year);

    const playerColumn = document.querySelector('.group-player-stats'); // Target the correct section

    removePlayerStats();

    // Create Player stats display
    const playerStats = document.createElement('div');
    playerStats.classList.add('player-stats');
    playerColumn.appendChild(playerStats);
    const playerStatsHeader = document.createElement('div');
    playerStatsHeader.classList.add('player-stats-header');
    playerStats.appendChild(playerStatsHeader);

    const name = document.createElement('p');
    name.textContent = playerName;
    playerStatsHeader.appendChild(name);

    const canvasElement = document.createElement('canvas');
    canvasElement.id = pointsChartId;
    const divElem = document.createElement('div');
    divElem.classList.add('canvas');
    divElem.appendChild(canvasElement);
    playerStats.appendChild(divElem);
    const canvasElement2 = document.createElement('canvas');
    canvasElement2.id = assistsChartId;
    const divElem2 = document.createElement('div');
    divElem2.classList.add('canvas');
    divElem2.appendChild(canvasElement2);
    playerStats.appendChild(divElem2);
    
    const ctx = document.getElementById(pointsChartId).getContext('2d');
    const ptsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dataPlayer.map(d => d.Year),
            datasets: [{
                label: 'Points Per Year',
                data: dataPlayer.map(d => d.PTS),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctx2 = document.getElementById(assistsChartId).getContext('2d');
    const assistsChart = new Chart(ctx2, {
        type: 'bar', // You can use different chart types like 'line', 'bar', etc.
        data: {
            labels: dataPlayer.map(d => d.Year), // X-axis: years
            datasets: [{
                label: 'Assists Per Year',
                data: dataPlayer.map(d => d.AST), // Y-axis: assists
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Lighter color for the area under the curve
                borderColor: 'rgba(75, 192, 192, 1)', // Darker color for the line
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Create close button
    const close = document.createElement('img')
    close.classList.add('close-btn');
    close.src = '../../icons/closeX.png';
    playerStatsHeader.appendChild(close);
    close.addEventListener("click", (e) => removePlayerStats(e));

    // Fix dimensions if there are two players' statistics next to each other
    fixDimensions();
}

function fixDimensions(e){
    const playerColumn = document.querySelector('.group-player-stats'); 
    const allPlayerStats = playerColumn.querySelectorAll(".player-stats");
    if(e && allPlayerStats.length == 2){  // Just pressed an X button when there were two already open
        allPlayerStats.forEach(playerStats => {
            if(playerStats != e.target.closest('.player-stats')){
                console.log("Times 2");
                playerStats.querySelectorAll(".canvas-shrunk").forEach(canvas =>{
                    canvas.classList.add("canvas");
                    canvas.classList.remove("canvas-shrunk");
                    const canvasElem = canvas.getElementsByTagName('canvas')[0]
                    const ctx = canvasElem.getContext("2d");
                    ctx.scale(2,2);
                    const chartInstance = Chart.getChart(canvasElem);
                    chartInstance.resize();
                })
            }
        });
    }
    else if(allPlayerStats.length == 2){    // Just added the second one when there was only one open
        allPlayerStats.forEach(playerStats => {
            console.log("Divide 2");
            playerStats.querySelectorAll(".canvas").forEach(canvas =>{
                canvas.classList.remove("canvas");
                canvas.classList.add("canvas-shrunk");
                const canvasElem = canvas.getElementsByTagName('canvas')[0]
                const ctx = canvasElem.getContext("2d");
                ctx.scale(0.5,0.5);
                const chartInstance = Chart.getChart(canvasElem);
                chartInstance.resize();
            })
        })
    }
}

function removePlayerStats(e){
    if(e){
        fixDimensions(e);
        e.target.removeEventListener("click", (e) => removePlayerStats(e));
        e.target.closest('.player-stats').remove();
    }
    else{
        const playerColumn = document.querySelector('.group-player-stats'); 
        const allPlayerStats = playerColumn.querySelectorAll(".player-stats");
        if(allPlayerStats.length == 2){
            allPlayerStats[0].remove();
        }
    }
}