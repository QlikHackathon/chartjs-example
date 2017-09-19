// Input your config
var config={
  host:"playground.qlik.com",
  prefix:"/playground/",
  port:"443",
  isSecure:true,
  rejectUnauthorized:false,
  //apiKey:"",
  appname:"5f2ba8ba-3f9b-4ac2-a823-e5c9aea4e18f"
};

var app

function authenticate() {
  Playground.authenticate(config)
}


function main() {
  require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
  })

  /**
   * Load the entry point for the Capabilities API family
   * See full documention: http://help.qlik.com/en-US/sense-developer/Subsystems/APIs/Content/MashupAPI/qlik-interface-interface.htm
   */

  require(['js/qlik'], function (qlik) {
    // We're now connected

    // Suppress Qlik error dialogs and handle errors how you like.
    qlik.setOnError(function (error) {
      console.log(error)
    })

    // Open a dataset on the server.
    console.log("Connecting to appname: " + config.appname)
    app = qlik.openApp(config.appname, config)
    console.log(app)

    // chart-js
    setupChart()
  })
}

window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
}

function setupChart() {
  var hyperCubeDef = {
    qMode: "P", // Pivot table
    qDimensions: [
      { qDef: { qFieldDefs: ["Decade"], qSortCriterias: [{ qSortByNumeric: 1 }] } },
    ],
    qMeasures: [
      { qDef: { qDef: "=Count(id)" } }
    ],
    qInitialDataFetch: [{
      qTop: 0,
      qLeft: 0,
      qHeight: 3333,
      qWidth: 3
    }]
  }

  app.createCube(hyperCubeDef, function (hypercube) {
    console.log("Hypercube", hypercube.qHyperCube)
    // A pivot table
    const pivotTableData = hypercube.qHyperCube.qPivotDataPages
    console.log("Pivot table data", pivotTableData)

    // Take first dimension
    window.allDecades = pivotTableData[0].qLeft.map((d) => d.qText)
    // Extract all measures from that first dimension
    window.fallsPerDecade = pivotTableData[0].qData.map((d) => d[0].qText)

    buildChart()
  })
}

function buildChart() {
  var barChartData = {
    labels: window.allDecades,
    datasets: [{
      label: 'Falls',
      stack: 'falls',
      backgroundColor: window.chartColors.red,
      data: window.fallsPerDecade
    }]
  };
  var ctx = document.getElementById("chart-js").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: barChartData,
    options: {
      title:{
        display:true,
        text:"Chart.js Bar Chart - Stacked"
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }
  });
}
