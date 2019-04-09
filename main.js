// Your browser will call the onload() function when the document
// has finished loading. In this case, onload() points to the
// start() method we defined below. Because of something called
// function hoisting, the start() method is callable on line 6
// even though it is defined on line 8.
window.onload = start;



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
        .attr("width",oWidth)
        .attr("height",oHeight)
        .attr('style', "border: 1px solid #777;");

    overview.append('text')
            .attr('x', oWidth / 2 - 50)
            .attr('y', 20)
            .text('Overview Section');


    var detail = d3.select("#detail")
        .append("svg:svg")
        .attr("width",dWidth )
        .attr("height",dHeight)
        .attr('style', "border: 1px solid #777;");

    detail.append('text')
        .attr('x', dWidth / 2 - 40)
        .attr('y', 20)
        .text('Detail Section');

    var filter = d3.select("#filter")
        .append("svg:svg")
        .attr("width",fWidth)
        .attr("height",fHeight)
        .attr('style', "border: 1px solid #777;");

    filter.append('text')
        .attr('x', 20)
        .attr('y', 20)
        .text('Filter Section');


	// Our bar chart is going to encode the letter frequency as bar width.
	// This means that the length of the x axis depends on the length of the bars.
	// The y axis should contain A-Z in the alphabet (ordinal data).
	var xScale = d3.scaleLinear().range([0, width]);
	var yScale = d3.scaleBand().rangeRound([0, height], 0.3);

	// Tell D3 to create a y-axis scale for us, and orient it to the left.
	// That means the labels are on the left, and tick marks on the right.
	var yAxis = d3.axisLeft(yScale);


	// D3 will grab all the data from "aircraft_incidents.csv" and make it available
	// to us in a callback function. It follows the form:
	d3.csv('aircraft_incidents.csv', function (d) {
		return d;
	}, function (error, data) {
		// We now have the "massaged" CSV data in the 'data' variable.

		// We set the domain of the xScale. The domain includes 0 up to
		// // the maximum frequency in the dataset. This is because
		// xScale.domain([0, d3.max(data, function (d) {
		// 	return d.frequency;
		// })]);

		// We set the domain of the yScale. The scale is ordinal, and
		// contains every letter in the alphabet (the letter attribute
		// in our data array). We can use the map function to iterate
		// through each value in our data array, and make a new array
		// that contains just letters.
		// yScale.domain(data.map(function (d) {
		// 	return d.letter;
		// }));

		// Append the y-axis to the graph. the translate(20, 0) stuff
		// shifts the axis 20 pixels from the left. This just helps us
		// position stuff to where we want it to be.
		bars.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(20, 0)')
			// Call is a special method that lets us invoke a function
			// (called 'yAxis' in this case) which creates the actual
			// yAxis using D3.
			.call(yAxis);

		// Create the bars in the graph. First, select all '.bars' that
		// currently exist, then load the data into them. enter() selects
		// all the pieces of data and lets us operate on them.
		bars.append('g')
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', 30)
			.attr('y', function (d) {
				return yScale(d.letter);
			})
			.attr('width', function (d) {
				// xScale will map any number and return a number
				// within the output range we specified earlier.
				return xScale(d.frequency);
			})
			.attr('height', function (d) {
				// Remember how we set the yScale to be an ordinal scale
				// with bands from 0 to height? And then we set the domain 
				// to contain all the letters in the alphabet? 
				return yScale.bandwidth() * .8;
			});
	});
}
