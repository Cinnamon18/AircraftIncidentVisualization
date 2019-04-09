// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

let allIncidents = null;
let fields = null;

function start() {
	// Specify the width and height of the overview
	var oWidth = 800;
	var oHeight = 500;
	var dWidth = 600;
	var dHeight = 500;
	var fWidth = 1410;
	var fHeight = 100;

	// create svg for the 3 sections
	var overview = d3.select("#overview")
		.append("svg:svg")
		.attr("width", oWidth)
		.attr("height", oHeight)
		.attr('style', "border: 1px solid #777;");

	overview.append('text')
		.attr('x', oWidth / 2 - 50)
		.attr('y', 20)
		.attr("class", "smallHeading")
		.text('Overview Section');


	var detail = d3.select("#detail")
		.append("svg:svg")
		.attr("width", dWidth)
		.attr("height", dHeight)
		.attr('style', "border: 1px solid #777;");

	detail.append('text')
		.attr('x', dWidth / 2 - 55)
		.attr('y', 20)
		.attr("class", "smallHeading")
		.text('Detail Section');

	var filter = d3.select("#filter")
		.append("svg:svg")
		.attr("width", fWidth)
		.attr("height", fHeight)
		.attr('style', "border: 1px solid #777;");

	filter.append('text')
		.attr('x', 20)
		.attr('y', 20)
		.attr("class", "smallHeading")
		.text('Filter Section');


	var xScale = d3.scaleLinear().range([0, oWidth]);
	var yScale = d3.scaleBand().rangeRound([0, oHeight], 0.3);

	// Tell D3 to create a y-axis scale for us, and orient it to the left.
	// That means the labels are on the left, and tick marks on the right.
	var yAxis = d3.axisLeft(yScale);


	// D3 will grab all the data from "aircraft_incidents.csv" and make it available
	// to us in a callback function. It follows the form:
	d3.csv('aircraft_incidents.csv', function (d) {
		return d;
	}, function (error, data) {

		allIncidents = data;
		fields = Object.keys(allIncidents[0]);





		console.log(allIncidents);
		let planeSpace = detail.append("g").attr("transform", "translate(20, " + (20) + ")").attr("id", "planeSpace");
		let column1 = detail.append("g").attr("transform", "translate(20, 300)");
		let column2 = detail.append("g").attr("transform", "translate(" + (20 + dWidth / 2) + ", 300)");
		fields.forEach((key, idx) => {
			let fieldsInCol1 = 10;
			if (idx < fieldsInCol1) {
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
		visualizeDataCase(allIncidents[1]);
	});
}


//dataCase should just be the basic automatically d3 read in object
function visualizeDataCase(dataCase) {
	fields.forEach((field) => {
		let fieldValue = dataCase[field];
		if (fieldValue == null) {
			fieldValue = "Unknown"
		}
		document.getElementById(field).innerHTML = field.replace(new RegExp("_", 'g'), " ") + ": " + fieldValue;
	});

	let mapScheduleSticker = { "SCHD": "comercial", "NSCH": "private", "": "unknown" };
	let mapShouldShowClouds = { "VMC": false, "UNK": false, "IMC": true };
	let mapAccidentPoint = { "APPROACH": 15, "DESCENT": 10, "LANDING": 20, "CRUISE": 0, "TAKEOFF": -20, "CLIMB": -10, "STANDING": 0, "": 0 };


	//clear out old plane
	let planeSpace = d3.select("#temporaryPlaneHolder");
	if (planeSpace) {
		planeSpace.remove();
	}


	d3.select('#planeSpace')
		.append("g")
		.attr("id", "temporaryPlaneHolder")

	d3.select('#temporaryPlaneHolder')
		.append("g")
		.attr("transform", "rotate(" + (27 + mapAccidentPoint[dataCase.Broad_Phase_of_Flight]) + ", 250, 140)")
		.append("image")
		.attr("x", "130")
		.attr("y", "20")
		.attr("width", "240")
		.attr("height", "240")
		.attr("xlink:href", "plane.svg")
	d3.select('#temporaryPlaneHolder')
		.append("g")
		.attr("transform", "rotate(" + (mapAccidentPoint[dataCase.Broad_Phase_of_Flight]) + ", 250, 140)")
		.append("text")
		.attr("x", 230)
		.attr("y", 152)
		.attr("fill", "white")
		.attr("font-size", 19)
		.text(mapScheduleSticker[dataCase.Schedule]);

	if (mapShouldShowClouds[dataCase.Weather_Condition]) {
		d3.selectAll('#temporaryPlaneHolder')
			.append("image")
			.attr("x", "20")
			.attr("y", "20")
			.attr("width", "90")
			.attr("height", "90")
			.attr("xlink:href", "cloud.svg");
		d3.selectAll('#temporaryPlaneHolder')
			.append("image")
			.attr("x", "100")
			.attr("y", "180")
			.attr("width", "90")
			.attr("height", "90")
			.attr("xlink:href", "cloud.svg");
		d3.selectAll('#temporaryPlaneHolder')
			.append("image")
			.attr("x", "370")
			.attr("y", "50")
			.attr("width", "90")
			.attr("height", "90")
			.attr("xlink:href", "cloud.svg");
		d3.selectAll('#temporaryPlaneHolder')
			.append("image")
			.attr("x", "450")
			.attr("y", "120")
			.attr("width", "90")
			.attr("height", "90")
			.attr("xlink:href", "cloud.svg");
	}
}
