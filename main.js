// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

let allIncidents = null;
let fields = null;
let xAxisLabel, yAxisLabel, zAxisLabel;
let injuryExtent, deathExtent, uninjuredExtent;
let oWidth, oHeight, dWidth, dHeight;
let overview;
let make, damage;
let x, y;


let colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];
let craftDamageOptions = { "Destroyed": colors[0], "Minor": colors[1], "Substantial": colors[2], "Unknown": colors[3] };
let makeOptions = { "Airbus": colors[0], "Boeing": colors[1], "Bombardier": colors[2], "Embraer": colors[3], "McDonnell Douglas": colors[4] };
let phaseOptions = {
	"APPROACH": colors[0], "CLIMB": colors[1], "CRUISE": colors[2], "DESCENT": colors[3],
	"GO-AROUND": colors[4], "LANDING": colors[5], "MANEUVERING": colors[6], "STANDING": colors[7],
	"TAKEOFF": colors[8], "TAXI": colors[9], "OTHER": colors[10], "UNKNOWN": colors[10], "": colors[10]
};



function start() {
	// Specify the width and height of the different graph elements
	oWidth = 800;
	oHeight = 500;
	dWidth = 600;
	dHeight = 500;

	// create svg for the 3 sections
	overview = d3.select("#overview")
		.append("svg:svg")
		.attr("width", oWidth)
		.attr("height", oHeight)
		.attr("class", "subChart");


	let detail = d3.select("#detail")
		.append("svg:svg")
		.attr("width", dWidth)
		.attr("height", dHeight)
		.attr("class", "subChart");

	let filter = d3.select("#filter");

	createFilters(filter);

	make = ["Airbus", "Boeing", "Bombardier", "Embraer", "McDonnell Douglas"];
	damage = ["Destroyed", "Minor", "Substantial", "Unknown"];

	// D3 will grab all the data from "aircraft_incidents.csv" and make it available
	// to us in a callback function. It follows the form:
	d3.csv('aircraft_incidents.csv', function (d) {
		return d;
	}, function (error, data) {

		allIncidents = data;
		fields = Object.keys(allIncidents[0]);

		// make sure the number values are not read in as strings
		for (let i = 0; i < allIncidents.length; ++i) {
			allIncidents[i].Total_Serious_Injuries = Number(allIncidents[i].Total_Serious_Injuries);
			allIncidents[i].Total_Fatal_Injuries = Number(allIncidents[i].Total_Fatal_Injuries);
			allIncidents[i].Total_Uninjured = Number(allIncidents[i].Total_Uninjured);
			allIncidents[i].Event_Date = Number(allIncidents[i].Event_Date);
			allIncidents[i].Latitude = Number(allIncidents[i].Latitude);
			allIncidents[i].Longitude = Number(allIncidents[i].Longitude);
			allIncidents[i].Make = String(allIncidents[i].Make);
			allIncidents[i].Broad_Phase_of_Flight = String(allIncidents[i].Broad_Phase_of_Flight);
			allIncidents[i].Aircraft_Damage = String(allIncidents[i].Aircraft_Damage);
			allIncidents[i].Schedule = String(allIncidents[i].Schedule);
			allIncidents[i].Injury_Severity = String(allIncidents[i].Injury_Severity);
		}

		// create extents to use when making axis for all quantitative data
		injuryExtent = d3.extent(allIncidents, function (row) { return row.Total_Serious_Injuries; });
		deathExtent = d3.extent(allIncidents, function (row) { return row.Total_Fatal_Injuries; });
		uninjuredExtent = d3.extent(allIncidents, function (row) { return row.Total_Uninjured; });

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
		visualizeDataCase(allIncidents[0]);
		getAxesValues();
		createOverview(overview, allIncidents, injuryExtent, deathExtent);
	});
}


//dataCase should just be the basic automatically d3 read in object
function visualizeDataCase(dataCase, id) {

	d3.selectAll("circle").classed("highlightedDataCase", false);
	d3.select("#c1" + id).classed("highlightedDataCase", true);



	fields.forEach((field) => {
		let fieldValue = dataCase[field];
		if (!fieldValue) {
			fieldValue = "unknown"
		}
		document.getElementById(field).innerHTML = field.replace(new RegExp("_", 'g'), " ") + ": " + fieldValue;
	});

	let mapScheduleSticker = { "SCHD": "commercial", "NSCH": "private", "": "unknown" };
	let mapShouldShowClouds = { "VMC": false, "UNK": false, "IMC": true };
	let mapAccidentPoint = { "APPROACH": 15, "DESCENT": 10, "LANDING": 20, "CRUISE": 0, "TAKEOFF": -20, "CLIMB": -10, "STANDING": 0, "": 0 };
	let mapDamage = {
		"Unknown": [],
		"Minor": [["220", "110"]],
		"Substantial": [["220", "110"], ["145", "135"], ["290", "170"]],
		"Destroyed": [["220", "110"], ["145", "135"], ["290", "170"], ["210", "165"], ["350", "135"], ["275", "110"], ["215", "60"]]
	};

	//clear out old plane
	let planeSpace = d3.select("#temporaryPlaneHolder");
	if (planeSpace) {
		planeSpace.remove();
	}


	d3.select('#planeSpace')
		.append("g")
		.attr("id", "temporaryPlaneHolder");

	d3.select('#temporaryPlaneHolder')
		.append('text')
		.attr('x', dWidth / 2 - 100)
		.attr('y', 0)
		.text("Flight Accident: " + dataCase.Accident_Number);

	d3.select('#temporaryPlaneHolder')
		.append("g")
		.attr("transform", "rotate(" + (27 + mapAccidentPoint[dataCase.Broad_Phase_of_Flight]) + ", 250, 140)")
		.append("image")
		.attr("x", "130")
		.attr("y", "20")
		.attr("width", "240")
		.attr("height", "240")
		.attr("xlink:href", "plane.svg");
	d3.select('#temporaryPlaneHolder')
		.append("g")
		.attr("transform", "rotate(" + (mapAccidentPoint[dataCase.Broad_Phase_of_Flight]) + ", 250, 140)")
		.append("text")
		.attr("x", 230)
		.attr("y", 152)
		.attr("fill", "white")
		.attr("font-size", 19)
		.text(mapScheduleSticker[dataCase.Schedule]);
	mapDamage[dataCase.Aircraft_Damage].forEach((damageItem) => {
		d3.select('#temporaryPlaneHolder')
			.append("g")
			.attr("transform", "rotate(" + (mapAccidentPoint[dataCase.Broad_Phase_of_Flight]) + ", 250, 140)")
			.append("circle")
			.style("fill", "white")
			.attr("cx", damageItem[0])
			.attr("cy", damageItem[1])
			.attr("r", 10)
	})

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

function createFilters(filter) {
	let xAxisOptions = ["Number of Injuries", "Number of Deaths", "Number of Uninjured", "Airplane Make", "Aircraft Damage"];
	let yAxisOptions = ["Number of Injuries", "Number of Deaths", "Number of Uninjured"];
	let zOptions = ["Airplane Make", "Phase of Flight", "Aircraft Damage"];

	filter.append('text')
		.attr('x', 20)
		.attr('y', 20)
		.text('Choose x-axis: ');

	let xAxisSelector = filter.append('select')
		.attr('class', 'select')
		.attr('id', '#xAxisSelector')
		.on('change', function () {
			getAxesValues();
			createOverview(overview, allIncidents);
		});
	xAxisSelector.selectAll('option')
		.data(xAxisOptions)
		.enter()
		.append('option')
		.text(function (d) { return d; });

	filter.append('text')
		.text('Choose y-axis: ');

	let yAxisSelector = filter.append('select')
		.attr('class', 'select')
		.attr('id', '#yAxisSelector')
		.on('change', function () {
			getAxesValues();
			createOverview(overview, allIncidents);
		});
	yAxisSelector.selectAll('option')
		.data(yAxisOptions)
		.enter()
		.append('option')
		.text(function (d) { return d; });

	filter.append('text')
		.text('Choose z-axis: ');

	let zAxisSelector = filter.append('select')
		.attr('class', 'select')
		.attr('id', '#zAxisSelector')
		.on('change', function () {
			getAxesValues();
			createOverview(overview, allIncidents);
		});
	zAxisSelector.selectAll('option')
		.data(zOptions)
		.enter()
		.append('option')
		.text(function (d) { return d; });

	// filter.append('p')
	//     .append('button')
	//     .text('Set Axes')
	//     .on('click', function() {
	// 		getAxesValues();
	// 		createOverview(overview, allIncidents);
	//     });
}

// set axes values to use in overview graph
function getAxesValues() {
	let x = document.getElementById('#xAxisSelector');
	xAxisLabel = x.options[x.selectedIndex].value;
	let y = document.getElementById('#yAxisSelector');
	yAxisLabel = y.options[y.selectedIndex].value;
	let z = document.getElementById('#zAxisSelector');
	zAxisLabel = z.options[z.selectedIndex].value;
}

function createOverview(overview, data) {

	//clear out old graph
	let over = d3.select("#overview").selectAll('g');
	if (over) {
		over.remove();
	}

	let extents = { "Number of Injuries": injuryExtent, "Number of Deaths": deathExtent, "Number of Uninjured": uninjuredExtent };

	// create inner g element and add title
	let graph = overview.append('g');
	graph.append('text')
		.attr('x', oWidth / 2 - 100)
		.attr('y', 20)
		.text(yAxisLabel + " vs. " + xAxisLabel);

	if (xAxisLabel === "Airplane Make" || xAxisLabel === "Aircraft Damage") {
		console.log(xAxisLabel);
		let xScale = d3.scaleBand().rangeRound([50, oWidth - 50]);
		if (xAxisLabel === "Airplane Make") {
			xScale.domain(data.map(function (d) { return d.Make; }));
		} else if (xAxisLabel === "Aircraft Damage") {
			xScale.domain(data.map(function (d) {
				if (d.Aircraft_Damage === "") {
					return "Unknown";
				}
				return d.Aircraft_Damage;
			}));
		}

		let yScale = d3.scalePow().exponent(0.5).domain(extents[yAxisLabel]).range([oHeight - 50, 50]);
		// let yScale = d3.scaleSqrt().domain(extents[yAxisLabel]).range([oHeight - 50, 50]);

		let xAxis = d3.axisBottom(xScale);
		let yAxis = d3.axisLeft(yScale);

		// add x axis
		graph.append("g")
			.attr("transform", "translate(0," + (oHeight - 50) + ")")
			.call(xAxis) // call the axis generator
			.append("text")
			.attr("class", "label")
			.attr("x", oWidth / 2.0 + 15)
			.attr("y", 30)
			.style("text-anchor", "end")
			.text(xAxisLabel)
			.attr("class", "axisLabel");

		// add y axis
		graph.append("g") // create a group node
			.attr("transform", "translate(50, 0)")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr('transform', 'rotate(-90)')
			.attr('x', 0 - oHeight / 2 + 20)
			.attr('y', -32)
			.style("text-anchor", "end")
			.text(yAxisLabel)
			.attr("class", "axisLabel");

		// add points to graph
		graph.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.classed("circle", true)
			.attr("id", function (d, i) { return "c1" + i; })
			.style("fill", function (d) { return calculatePointColor(d); })
			.attr("cx", function (d) { return getAxisValue(xScale, d, xAxisLabel); })
			.attr("cy", function (d) { return getAxisValue(yScale, d, yAxisLabel); })
			.attr("r", 7)
			.on("click", function (d, i) {
				// update the detail view here
				visualizeDataCase(d, i);
			});
	} else {
		// let xScale = d3.scaleLinear().domain(extents[xAxisLabel]).range([50, oWidth - 50]);
		// let yScale = d3.scaleLinear().domain(extents[yAxisLabel]).range([oHeight - 50, 50]);
		let xScale = d3.scalePow().exponent(0.5).domain(extents[xAxisLabel]).range([50, oWidth - 50]);
		let yScale = d3.scalePow().exponent(0.5).domain(extents[yAxisLabel]).range([oHeight - 50, 50]);

		let xAxis = d3.axisBottom().scale(xScale);
		let yAxis = d3.axisLeft().scale(yScale);

		// add x axis
		graph.append("g")
			.attr("transform", "translate(0," + (oHeight - 50) + ")")
			.call(xAxis) // call the axis generator
			.append("text")
			.attr("class", "label")
			.attr("x", oWidth / 2.0 + 15)
			.attr("y", 30)
			.style("text-anchor", "end")
			.text(xAxisLabel)
			.attr("class", "axisLabel");

		// add y axis
		graph.append("g") // create a group node
			.attr("transform", "translate(50, 0)")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr('transform', 'rotate(-90)')
			.attr('x', 0 - oHeight / 2 + 20)
			.attr('y', -32)
			.style("text-anchor", "end")
			.text(yAxisLabel)
			.attr("class", "axisLabel");

		// add points to graph
		graph.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.classed("circle", true)
			.attr("id", function (d, i) { return "c1" + i; })
			.style("fill", function (d) { return calculatePointColor(d); })
			.attr("cx", function (d) { return getAxisValue(xScale, d, xAxisLabel); })
			.attr("cy", function (d) { return getAxisValue(yScale, d, yAxisLabel); })
			.attr("r", 7)
			.on("click", function (d, i) {
				// update the detail view here
				visualizeDataCase(d, i);
			});
	}

	updateLegend();
}

function calculatePointColor(d) {
	let color;
	if (zAxisLabel === "Airplane Make") {
		color = makeOptions[d.Make];
	} else if (zAxisLabel === "Aircraft Damage") {
		color = craftDamageOptions[d.Aircraft_Damage];
	} else if (zAxisLabel === "Phase of Flight") {
		color = phaseOptions[d.Broad_Phase_of_Flight];;
	}
	return color;
}

function getAxisValue(scale, d, label) {
	let values = {
		"Number of Injuries": d.Total_Serious_Injuries, "Number of Deaths": d.Total_Fatal_Injuries,
		"Number of Uninjured": d.Total_Uninjured, "Airplane Make": d.Make, "Aircraft Damage": d.Aircraft_Damage
	};
	let offset = 0;
	if (label === "Airplane Make") {
		offset = (oWidth - 100.0) / (make.length * 2.0);
	} else if (label === "Aircraft Damage") {
		offset = (oWidth - 100.0) / (damage.length * 2.0);
	}
	return scale(values[label]) + offset;
}

function updateLegend() {
	let legend = d3.select("#legend");
	if (legend) {
		legend.remove();
	}

	legend = d3.select("#filter")
		.append("div")
		.attr("id", "legend")
		.append("p")
		.text(zAxisLabel + ": ");

	let options;
	if (zAxisLabel === "Airplane Make") {
		options = makeOptions;
	} else if (zAxisLabel === "Aircraft Damage") {
		options = craftDamageOptions;
	} else if (zAxisLabel === "Phase of Flight") {
		options = phaseOptions;
	}


	Object.keys(options).forEach(function (key) {
		legend.append("span")
			.style("color", options[key])
			.text(key)
			.attr("class", "legend");
	});
}