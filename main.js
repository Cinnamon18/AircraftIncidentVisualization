// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

let allIncidents = null;
let fields = null;
let xAxisLabel, yAxisLabel, zAxisLabel;

function start() {
	// Specify the width and height of the overview
	let oWidth = 800;
	let oHeight = 500;
    let dWidth = 600;
    let dHeight = 500;

    // create svg for the 3 sections
    let overview = d3.select("#overview")
        .append("svg:svg")
        .attr("width",oWidth)
        .attr("height",oHeight)
        .attr('style', "border: 1px solid #777;");

    overview.append('text')
            .attr('x', oWidth / 2 - 50)
            .attr('y', 20)
            .text('Overview Section');


    let detail = d3.select("#detail")
        .append("svg:svg")
        .attr("width",dWidth )
        .attr("height",dHeight)
        .attr('style', "border: 1px solid #777;");

    detail.append('text')
        .attr('x', dWidth / 2 - 40)
        .attr('y', 20)
        .text('Detail Section');

    let filter = d3.select("#filter");

    createFilters(filter);


	// D3 will grab all the data from "aircraft_incidents.csv" and make it available
	// to us in a callback function. It follows the form:
	d3.csv('aircraft_incidents.csv', function (d) {
		return d;
	}, function (error, data) {

		allIncidents = data;
		fields = Object.keys(allIncidents[0]);





		console.log(allIncidents);
		let column1 = detail.append("g").attr("transform", "translate(20, 300)");
		let column2 = detail.append("g").attr("transform", "translate(" + (20 + dWidth / 2) + ", 300)");
		fields.forEach((key, idx) => {
			let fieldsInCol1 = 10;
			if(idx < fieldsInCol1) {
				column1
					.append("text")
					.attr("id", key)
					.attr("class", "textBody")
					.attr("y", 21 * idx)
					.text("");
			} else {
				column2
					.append("text")
					.attr("id", key)
					.attr("class", "textBody")
					.attr("y", 21 * (idx - fieldsInCol1))
					.text("");
			}
		});
		visualizeDataCase(allIncidents[0]);

	});
}


//dataCase should just be the basic automatically d3 read in object
function visualizeDataCase(dataCase) {
	fields.forEach((field) => {
		let fieldValue = dataCase[field];
		if(fieldValue == null) {
			fieldValue = "Unknown"
		}
		document.getElementById(field).innerHTML = field.replace(new RegExp("_", 'g'), " ") + ": " + fieldValue;
	});
}

//
function createFilters(filter) {
	let xOptions = ["date", "injuries", "deaths"];
	let yOptions = ["date", "injuries", "deaths"];
	let zOptions = ["make", "airline", "phaseOfFlight", "injurySeverity", "aircraftDamage"];

    filter.append('text')
        .attr('x', 20)
        .attr('y', 20)
        .text('Choose x-axis: ');

	let xAxisSelector = filter.append('select')
        .attr('class','select')
		.attr('id', '#xAxisSelector');

    xAxisSelector.selectAll('option')
		.data(xOptions)
		.enter()
		.append('option')
		.text(function (d) { return d; });

    filter.append('text')
        .text('Choose y-axis: ');

    let yAxisSelector = filter.append('select')
        .attr('class','select')
        .attr('id', '#yAxisSelector');

    yAxisSelector.selectAll('option')
        .data(yOptions)
        .enter()
        .append('option')
        .text(function (d) { return d; });

    filter.append('text')
        .text('Choose z-axis: ');

    let zAxisSelector = filter.append('select')
        .attr('class','select')
        .attr('id', '#zAxisSelector');

    zAxisSelector.selectAll('option')
        .data(zOptions)
        .enter()
        .append('option')
        .text(function (d) { return d; });

    filter.append('p')
        .append('button')
        .text('Set Axes')
        .on('click', function() {
			getAxesValues();
        });
}


// set axes values to use in overview graph
function getAxesValues() {
    let x = document.getElementById('#xAxisSelector');
    xAxisLabel= x.options[x.selectedIndex].value;
    let y = document.getElementById('#yAxisSelector');
    yAxisLabel= y.options[y.selectedIndex].value;
    let z = document.getElementById('#zAxisSelector');
    zAxisLabel= z.options[z.selectedIndex].value;
    console.log(xAxisLabel + " " + yAxisLabel + " " + zAxisLabel);
}