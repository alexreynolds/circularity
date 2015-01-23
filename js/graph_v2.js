// Set up the graph

// Important variables
var totalWidth = 5000, totalHeight = 500;
var colorBiomass = "#44B44A", colorFossil = "#8F3142", colorOre = "#4B4768", colorMineral = "#78B495";

var margin = {top:20, right:20, bottom:80, left:50},
	width = totalWidth - margin.left - margin.right,
	height = totalHeight - margin.top - margin.bottom;

var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

// var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
          .rangeRound([height, 0]);

var color = d3.scale.ordinal()
				.range([colorBiomass, colorFossil, colorFossil, colorOre]);

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

	console.log(dataset, "initial data");

	var varColumns = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];

	var labelVar = 'country';
	var varNames = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];

  // Nest and sort the data set
  // var data = d3.nest()
  // 				.key(function(d) {return d.region;}).sortKeys(d3.ascending) // Alphabetical region keys
  // 				.entries(dataset);

	// VALIDATE THE NUMERICAL DATA

	// Only map colors to the selected columns
	// color.domain(d3.keys(data).filter(function (key) {
	// 	console.log(key, "the key");
	//     return (selectColumns.indexOf(key) > -1);
	// }));
	color.domain(varNames);

	// Associate data with color bands
	//console.log(data.length, "values");
	// var yMax;

	// for (var z = 0; z < data.length; z++) {
	// 	data[z].values.forEach(function (d) {
	// 	    var y0 = 0;
	// 	    console.log(d, "d is");
	// 	    d.country = d.key;
	// 	    d.resources = color.domain().map(function (name) {
	// 	        return {
	// 	            name: name,
	// 	            y0: y0,
	// 	            y1: y0 += +d.values[name]
	// 	        };
	// 	    });
	// 	    d.total = d.resources[d.resources.length - 1].y1;
	// 	    yMax = (d.total > yMax || yMax === undefined) ? d.total : yMax;
	// 	});
	// }

	// Found on http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs
	dataset.forEach(function (d) {
		var y0 = 0;
		d.mapping = varNames.map(function (name) {
			console.log(d, "d");
			console.log(d['region'], "region");
			console.log(name, "resource");
			console.log(d[name], "value");
			return {
				name: name,
				label: d[labelVar],
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
	    .attr("class", "xaxis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

	svg.append("g")
	    .attr("class", "yaxis")
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
			.attr("class", "countries")
			.attr("transform", function(d) {
				// Moves each region group over by a smidge
				return "translate(" + x(d.country) + ",0)";
		});

	selection.selectAll("rect")
			.data( function(d) { return d.mapping; })
			.enter().append("rect")
			.attr("width", x.rangeBand()) // *** Eventually change this to percentage * set width
			.attr("y", function(d) { console.log(d.y1, "d.y1"); return y(d.y1); })
			.attr("height", function(d) { return y(d.y0) - y(d.y1); })
			.style("fill", function(d) { return color(d.name); });
});