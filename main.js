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
	// Specify the width and height of the different graph elements
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


    let detail = d3.select("#detail")
        .append("svg:svg")
        .attr("width",dWidth )
        .attr("height",dHeight)
        .attr('style', "border: 1px solid #777;");


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
	let axisOptions = ["Number of Injuries", "Number of Deaths", "Number of Uninjured"];
	let zOptions = ["Airplane Make", "Phase of Flight", "Aircraft Damage"];

    filter.append('text')
        .attr('x', 20)
        .attr('y', 20)
        .text('Choose x-axis: ');

	let xAxisSelector = filter.append('select')
        .attr('class','select')
		.attr('id', '#xAxisSelector');
	xAxisSelector.selectAll('option')
		.data(axisOptions)
		.enter()
		.append('option')
		.text(function (d) { return d; });

    filter.append('text')
        .text('Choose y-axis: ');

    let yAxisSelector = filter.append('select')
        .attr('class','select')
        .attr('id', '#yAxisSelector');
    yAxisSelector.selectAll('option')
        .data(axisOptions)
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

    let extents = {"Number of Injuries": injuryExtent, "Number of Deaths": deathExtent, "Number of Uninjured": uninjuredExtent};

    let xScale = d3.scaleLinear().domain(extents[xAxisLabel]).range([50, oWidth - 50]);
    let yScale = d3.scaleLinear().domain(extents[yAxisLabel]).range([oHeight - 50, 50]);

    let xAxis = d3.axisBottom().scale(xScale);
    let yAxis = d3.axisLeft().scale(yScale);

	let graph = overview.append('g');

    graph.append('text')
        .attr('x', oWidth / 2 - 100)
        .attr('y', 20)
        .text(yAxisLabel + " vs. "+ xAxisLabel);

    // add x axis
    graph.append("g")
        .attr("transform", "translate(0,"+ (oHeight - 50)+ ")")
        .call(xAxis) // call the axis generator
        .append("text")
        .attr("class", "label")
        .attr("x", oWidth / 2.0 + 15)
        .attr("y", 30)
        .style("text-anchor", "end")
        .text(xAxisLabel)
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
        .text(yAxisLabel)
        .style("fill", "black");

    // add points to graph
    graph.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("circle", true)
        .attr("id",function(d,i) {return "c1" + i;} )
        .style("fill", function(d){ return calculatePointColor(d);})
        .attr("cx", function(d) { return getAxisValue(xScale, d, xAxisLabel);})
        .attr("cy", function(d) { return getAxisValue(yScale, d, yAxisLabel); })
        .attr("r", 5)
        .on("click", function(d){
            // update the detail view here
			visualizeDataCase(d);
        });
}

function calculatePointColor(d) {
    let colors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];
    let craftDamageOptions = {"Destroyed" : colors[0], "Minor": colors[1], "Substantial": colors[2], "": colors[3]};
    let makeOptions = {"Airbus" : colors[0], "Boeing": colors[1], "Bombardier": colors[2], "Embraer": colors[3], "McDonnell Douglas": colors[4]};
    let phaseOptions = {"APPROACH" : colors[0], "CLIMB": colors[1], "CRUISE": colors[2], "DESCENT": colors[3],
                        "GO-AROUND": colors[4], "LANDING": colors[5], "MANEUVERING": colors[6], "STANDING": colors[7],
                        "TAKEOFF": colors[8], "TAXI": colors[9], "OTHER": colors[10], "UNKNOWN": colors[10], "": colors[10]};


    if (zAxisLabel === "Airplane Make") {
        return makeOptions[d.Make];
    } else if (zAxisLabel === "Aircraft Damage") {
        return craftDamageOptions[d.Aircraft_Damage];
    } else if (zAxisLabel === "Phase of Flight"){
        return phaseOptions[d.Broad_Phase_of_Flight];;
    }

}

function getAxisValue(scale, d, label) {
    let values = {"Number of Injuries": d.Total_Serious_Injuries, "Number of Deaths": d.Total_Fatal_Injuries, "Number of Uninjured": d.Total_Uninjured};
    return scale(values[label]);
}

