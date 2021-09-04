const rate5 = .006;
const pity5 = 73;

// const rate4 = .051;
// const pity4 = 8;

const simulateButton = document.getElementById("simulatebutton");

function rollUntil5(startingPityCounter) {
    let counter5 = 1 + startingPityCounter,
        requiredRolls;
    while (true) {
        let x = Math.random();
        let prob5 = rate5 + Math.max(0, (counter5 - pity5) * 10 * rate5);

        if (x < prob5) {
            requiredRolls = counter5 - startingPityCounter;
            counter5 = 1;
            break;
        } else {
            counter5 += 1;
        }
    }
    return requiredRolls;
}

function rollUntilLimited5(startingPityCounter, fiftyfifty) {
    let requiredRolls = rollUntil5(startingPityCounter)
    if (fiftyfifty) {
        return requiredRolls;
    }
    x = Math.random()
    if (x < 0.5) {
        requiredRolls += rollUntil5(0)
    }
    return requiredRolls;
}

function addResults(sample) {
    let resultsEl = document.getElementById("results");
    while (resultsEl.firstChild) {
        resultsEl.removeChild(resultsEl.firstChild);
    }

    function appendParagraph(text) {
        let el = document.createElement("p");
        el.innerHTML = text;
        resultsEl.appendChild(el);
    }

    let jstat = jStat(sample);
    let mean = jstat.mean(),
        median = jstat.median(),
        stdev = jstat.stdev(),
        max = jstat.max(),
        quantiles = [.05, .10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90, .95]
        quantilesResults = jstat.quantiles(quantiles);

    function buildOutputString(metricName, metricValue) {
        let dailyGems = 60;
        let s = " days (blessing"
        if (document.getElementById("blessing").checked) {
            dailyGems += 90;
            s += " + commissions"
        }
        s += ")"
        let currentGems = document.getElementById("gems").value + (document.getElementById("fates").value * 160) + document.getElementById("crystal").value;
        let requiredGems = metricValue * 160 - currentGems;
        return metricName + ": " +
            metricValue + " pulls = " +
            requiredGems + " primogems = " +
            Math.ceil(requiredGems / dailyGems) + s
    }
    appendParagraph(buildOutputString("Mean", mean));
    appendParagraph(buildOutputString("Median", median));
    appendParagraph(buildOutputString("Max", max));

    console.clear();
    for (i = 0; i < quantiles.length; i++) {
        console.log(buildOutputString(quantiles[i], quantilesResults[i]));
    }
}

function plot(sample) {
    let histogramEl = document.getElementById("histogram");
    while (histogramEl.firstChild) {
        histogramEl.removeChild(histogramEl.firstChild);
    }
    let boxplotEl = document.getElementById("boxplot");
    while (boxplotEl.firstChild) {
        boxplotEl.removeChild(boxplotEl.firstChild);
    }

    Plotly.newPlot(histogramEl, [{
        x: sample,
        type: "histogram",
        name: ""
    }], {
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)"
    });

    Plotly.newPlot(boxplotEl, [{
        x: sample,
        type: "box",
        name: ""
    }], {
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)"
    });
}

function simulate() {
    let startTime = Date.now();

    let startingPityCounter = parseInt(document.getElementById("pitycounter").value);
    let fiftyfifty = document.getElementById("fiftyfifty").checked;

    let sample = [];
    let sampleSize = document.getElementById("size").value;
    for (i = 0; i < sampleSize; i++) {
        sample.push(rollUntilLimited5(startingPityCounter, fiftyfifty));
    }

    addResults(sample);
    plot(sample);

    let timeNeeded = Date.now() - startTime;
    let timeNeededEl = document.getElementById("timeneeded");
    while (timeNeededEl.firstChild) {
        timeNeededEl.removeChild(timeNeededEl.firstChild);
    }
    timeNeededEl.innerHTML = "<p>Simuation time needed: " + timeNeeded + " ms</p>"
}

simulateButton.addEventListener("click", simulate, false);