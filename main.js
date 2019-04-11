// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;

let allIncidents = null;
let fields = null;
let xAxisLabel, yAxisLabel, zAxisLabel;
let injuryExtent, deathExtent, uninjuredExtent, dateExtent, latExtent, longExtent;
let oWidth, oHeight, dWidth, dHeight;
let overview;

function start() {
	// Specify the width and height of the overview
	oWidth = 800;
	oHeight = 500;
	dWidth = 600;
	dHeight = 500;

    // create svg for the 3 sections
	overview = d3.select("#overview")
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

		// make sure the number values are not read in as strings
        for (let i=0; i<allIncidents.length; ++i) {
            allIncidents[i].Total_Serious_Injuries = Number(allIncidents[i].Total_Serious_Injuries);
            allIncidents[i].Total_Fatal_Injuries = Number(allIncidents[i].Total_Fatal_Injuries);
            allIncidents[i].Total_Uninjured = Number(allIncidents[i].Total_Uninjured);
            allIncidents[i].Event_Date = Number(allIncidents[i].Event_Date);
            allIncidents[i].Latitude = Number(allIncidents[i].Latitude);
            allIncidents[i].Longitude = Number(allIncidents[i].Longitude);
        }

		// create extents to use when making axis for all quantitative data
        injuryExtent = d3.extent(allIncidents, function(row) { return row.Total_Serious_Injuries; });
        deathExtent = d3.extent(allIncidents, function(row) { return row.Total_Fatal_Injuries; });
        uninjuredExtent = d3.extent(allIncidents, function(row) { return row.Total_Uninjured; });
        dateExtent = d3.extent(allIncidents, function(row) { return row.Event_Date; });
        latExtent = d3.extent(allIncidents, function(row) { return row.Latitude; });
        longExtent = d3.extent(allIncidents, function(row) { return row.Longitude; });

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
function visualizeDataCase(dataCase) {
	fields.forEach((field) => {
		let fieldValue = dataCase[field];
		if (fieldValue == null) {
			fieldValue = "Unknown"
		}
		document.getElementById(field).innerHTML = field.replace(new RegExp("_", 'g'), " ") + ": " + fieldValue;
	});

	let mapScheduleSticker = { "SCHD": "commercial", "NSCH": "private", "": "unknown" };
	let mapShouldShowClouds = { "VMC": false, "UNK": false, "IMC": true };
	let mapAccidentPoint = { "APPROACH": 15, "DESCENT": 10, "LANDING": 20, "CRUISE": 0, "TAKEOFF": -20, "CLIMB": -10, "STANDING": 0, "": 0 };


	//clear out old plane
	let planeSpace = d3.select("#temporaryPlaneHolder");
	if (planeSpace) {
		planeSpace.remove();
	}


	d3.select('#planeSpace')
		.append("g")
		.attr("id", "temporaryPlaneHolder");

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
	let xOptions = ["injuries", "deaths", "uninjured"];
	let yOptions = ["deaths",  "injuries", "uninjured"];
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
			createOverview(overview, allIncidents);
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
}

function createOverview(overview, data) {

    //clear out old graph
    let over = d3.select("#overview").selectAll('g');
    if (over) {
        over.remove();
    }

    let extents = {injuries: injuryExtent, deaths: deathExtent, uninjured: uninjuredExtent};
    let possibleAxis = { injuries: "Number of Injuries", deaths: "Number of Deaths", uninjured: "Number of Uninjured"};

    let xScale = d3.scaleLinear().domain(extents[xAxisLabel]).range([50, oWidth - 50]);
    let yScale = d3.scaleLinear().domain(extents[yAxisLabel]).range([oHeight - 50, 50]);

    let xAxis = d3.axisBottom().scale(xScale);
    let yAxis = d3.axisLeft().scale(yScale);

	let graph = overview.append('g');

    // add x axis
    graph.append("g")
        .attr("transform", "translate(0,"+ (oHeight - 50)+ ")")
        .call(xAxis) // call the axis generator
        .append("text")
        .attr("class", "label")
        .attr("x", oWidth / 2.0 + 15)
        .attr("y", 30)
        .style("text-anchor", "end")
        .text(possibleAxis[xAxisLabel])
        .style("fill", "black");

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
        .text(possibleAxis[yAxisLabel])
        .style("fill", "black");

    // add points to graph
    graph.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("circle", true)
        .attr("id",function(d,i) {return "c1" + i;} )
        .attr("stroke", "black")
        .attr("cx", function(d) { return getAxisValue(xScale, d, xAxisLabel);})
        .attr("cy", function(d) { return getAxisValue(yScale, d, yAxisLabel); })
        .attr("r", 5)
        .on("click", function(d){
            // update the detail view here
			visualizeDataCase(d);
        });
}

function getAxisValue(scale, d, label) {
    let values = {injuries: d.Total_Serious_Injuries, deaths: d.Total_Fatal_Injuries, uninjured: d.Total_Uninjured};
    return scale(values[label]);
}

