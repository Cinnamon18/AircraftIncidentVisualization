// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

let allIncidents = null;


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
		.attr('x', dWidth / 2 - 40)
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

		detail
			.append("g")
			.attr("transform", "translate(0," + (dWidth - 30) + ")")
			.append("text")
			.attr("class", "textBody")
			.attr("x", dWidth - 16)
			.attr("y", -6)
			// .style("text-anchor", "end")
			.text("SATM");

	});
}
