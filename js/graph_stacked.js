// Set up the graph

// Important variables
var totalWidth = 5000, totalHeight = 1200;
var colorBiomass = "#44B44A", colorFossil = "#8F3142", colorOre = "#4B4768", colorMineral = "#78B495";

var margin = {top:20, right:20, bottom:200, left:50},
	width = totalWidth - margin.left - margin.right,
	height = totalHeight - margin.top - margin.bottom;

var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

// var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
          .rangeRound([height, 0]);

// Defining the logarithmic scale to use
var logScale = d3.scale.log()
			.domain([1, 30000000]) // Takes a number from 0 to MAX
			.range([0, height]); // Returns a number between 0 and height

// var y = d3.scale.log()
//     .base(Math.E)
//     .domain([Math.exp(0), Math.exp(17.2)])
//     .range([height, 0]);

// var y = d3.scale.log()
// 		.domain([0,10000])
// 		.range([0, height]);


var color = d3.scale.ordinal()
				.range([colorBiomass, colorFossil, colorOre, colorMineral]);

var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickFormat(d3.format(".2s")); // Formats tickmarks with a unit suffix (ex. 9M = 9 million)
				//.tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });


var svg = d3.select("#chart").append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Move down and over


// Load the data
d3.csv("flows.csv",function(error, dataset) {


	var labelVar = 'country';
	var varNames = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];
	var percentNames = []

	console.log(dataset, "initial data");

	color.domain(varNames);

	dataset.forEach(function (d) {
		var y0 = 0, percentVar = "";
		d.mapping = varNames.map(function (name) {
			// console.log(d, "d");
			// console.log(d['region'], "region");
			// console.log(name, "resource");
			// console.log(d[name], "value");
			percentVar = name.replace("TOTAL_","TOTAL_USED_") + "_PERCENT";
			return {
				name: name, // Resource
				label: d[labelVar], // Country
				percent: d[percentVar], // Percentage of resource used
				region: d['region'],
				y0: y0,
				y1: y0 += +d[name]
			};
		});
		d.total = d.mapping[d.mapping.length - 1].y1;
	});

	console.log("prepped data", dataset);

	// Set up axes

	// X0 domain is the set of REGIONS (to group the countries together)
	x.domain(dataset.map(function(d) { return d.country; }));
	y.domain([0, d3.max(dataset, function(d) { return d.total; })]);
	console.log(d3.max(dataset, function(d) { return d.total; }), "MAX");

	// Append the axes to the graph
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .text("Countries")
	    .call(xAxis)
	    .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-60)" 
                });

	svg.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("x", -100)
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Tonnes");


	// Add bars to graph for each country
	var selection = svg.selectAll(".countries")
			.data(dataset)
			.enter().append("g")
			.attr("class", function(d) { return "countries " + d.country; })
			.attr("transform", function(d) {
				// Moves each region group over by a smidge
				return "translate(" + x(d.country) + ",0)";
		});

	selection.selectAll("rect")
			.data( function(d) { return d.mapping; })
			.enter().append("rect")
			// .attr("width", x.rangeBand()) // *** Eventually change this to percentage * set width
			.attr("width", function(d) {
				return x.rangeBand() * (d.percent/100); // Width is based on percentage of resource used
			})
			.attr("y", function(d) {
							// var y1 = d.y1;
							// if (y1 == 0) { y1 = 1; }
							// console.log(y1, "Y1");
							// console.log(logScale(y1), "log y1");
							//return logScale(y1);
							return y(d.y1);
						})
			.attr("height", function(d) {
								// var y0 = d.y0, y1 = d.y1;
								// if (y0 == 0) { y0 = 1; }
								// if (y1 == 0) { y1 = 1; }
								// console.log(logScale(y0), "log y0");
								// console.log(logScale(y1), "log y1");
								return y(d.y0) - y(d.y1);
								//return Math.abs(logScale(y0) - logScale(y1));
							})
			.attr("class", function(d) { return d.name; })
			.style("fill", function(d) { return color(d.name); })
			.attr("transform", function(d) {
					// Centers rect element after modifying width
					var translationX = (x.rangeBand()/2) - 0.5*(x.rangeBand()*(d.percent/100));
					return "translate(" + translationX + ",0)";
			});

});