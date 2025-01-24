function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Navbar
const navLinks = $$(".navbar a");
let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);
currentLink?.classList.add('current');

// Eras Data

fetch('../data/yearly_stats_with_multiple_eras.json')
    .then(response => response.json())
    .then(data => {
        const ctx = document.getElementById('eraChart').getContext('2d');

        // Function to create chart data
        const createChart = (yAxis, k) => {
            const chartData = data.map(item => ({
                x: item.Year,         // Year for x-axis
                y: item[yAxis],       // Selected stat for y-axis
                era: item[k]          // Selected era for clustering
            }));

            return {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: `WNBA Eras (${yAxis}, ${k})`,
                            data: chartData.map(point => ({
                                x: point.x,
                                y: point.y,
                            })),
                            pointBackgroundColor: chartData.map(point => getEraColor(point.era)),
                            pointBorderColor: chartData.map(point => getEraColor(point.era)),
                            pointRadius: 5,
                            showLine: true,
                            borderColor: 'rgba(75, 192, 192, 1)',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const dataIndex = context.dataIndex;
                                    const pointData = chartData[dataIndex];
                                    return `Year: ${pointData.x}, ${yAxis}: ${pointData.y.toFixed(2)}`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Year' },
                            ticks: { precision: 0 ,
                                    callback: function (value) {
                                        return value.toString(); // Ensure no commas appear
                                    },
                                },
                        },
                        y: {
                            title: { display: true, text: yAxis },
                        },
                    },
                },
            };
        };

        // Initialize the chart
        const yAxisSelector = document.getElementById('yAxisSelector');
        const kSelector = document.getElementById('kSelector');
        let currentYAxis = yAxisSelector.value; // Default selected y-axis
        let currentK = kSelector.value;         // Default selected k (Era)

        let chart = new Chart(ctx, createChart(currentYAxis, currentK));

        // Update chart on dropdown change
        const updateChart = () => {
            currentYAxis = yAxisSelector.value; // Update selected stat
            currentK = kSelector.value;         // Update selected k
            chart.destroy();                    // Destroy current chart
            chart = new Chart(ctx, createChart(currentYAxis, currentK)); // Create new chart
        };

        yAxisSelector.addEventListener('change', updateChart);
        kSelector.addEventListener('change', updateChart);
    });

// Helper function to get color based on Era
function getEraColor(era) {
    const colors = ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,165,0)', 'rgb(128,0,128)'];
    return colors[era % colors.length] || '#000000';
}