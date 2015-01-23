// Set up the graph
console.log("Setting up graph.");

// Important variables
var totalWidth = 1500, totalHeight = 500;
var colorBiomass = "#44B44A", colorFossil = "#8F3142", colorOre = "#4B4768", colorMineral = "#78B495";

var margin = {top:20, right:20, bottom:30, left:50},
	width = totalWidth - margin.left - margin.right,
	height = totalHeight - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
			.range([height, 0]);

var color = d3.scale.ordinal()
				.range([colorBiomass, colorFossil, colorFossil, colorOre]);

var xAxis = d3.svg.axis()
				.scale(x0)
				.orient("bottom");

var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickFormat(d3.format(".2s")); // Formats tickmarks with a unit suffix (ex. 9M = 9 million)


var svg = d3.select("#chart").append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Move down and over


// Load the data
d3.csv("flows.csv",function(error, dataset) {

	// The keys to be used in the graph
	var selectKeys = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS", "TOTAL_BIOMASS_PERCENT", "TOTAL_FOSSILS_PERCENT", "TOTAL_ORES_PERCENT", "TOTAL_MINERALS_PERCENT"];

  // Nest and sort the data set
  var data = d3.nest()
  				.key(function(d) {return d.region;}).sortKeys(d3.ascending) // L0 - alphabetical regions
  				.key(function(d) {return d.country;}).sortKeys(d3.ascending) // L1 - alphabetical countries
  				.rollup(function(leaves) { return { "TOTAL_BIOMASS": leaves[0].TOTAL_BIOMASS,
  													"TOTAL_FOSSILS": leaves[0].TOTAL_FOSSILS,
  													"TOTAL_ORES": leaves[0].TOTAL_ORES,
  													"TOTAL_MINERALS": leaves[0].TOTAL_MINERALS } })
  				.entries(dataset);

  // CHECK THE DATA
  console.log(data, "the data");

	// VALIDATE THE NUMERICAL DATA

	// The keys to which colors should be mapped
	var selectColumns = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];

	// Only map colors to the selected columns
	// color.domain(d3.keys(data).filter(function (key) {
	// 	console.log(key, "the key");
	//     return (selectColumns.indexOf(key) > -1);
	// }));
	color.domain(selectColumns);

	// Associate data with color bands
	//console.log(data.length, "values");
	var yMax;

	for (var z = 0; z < data.length; z++) {
		data[z].values.forEach(function (d) {
		    var y0 = 0;
		    console.log(d, "d is");
		    d.country = d.key;
		    d.resources = color.domain().map(function (name) {
		        return {
		            name: name,
		            y0: y0,
		            y1: y0 += +d.values[name]
		        };
		    });
		    d.total = d.resources[d.resources.length - 1].y1;
		    yMax = (d.total > yMax || yMax === undefined) ? d.total : yMax;
		});
	}

	// Found on http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs
	data.forEach(function (d) {
		var y0 = 0;
		d.mapping = selectColumns.map(function (name) {
			console.log(d);
			console.log(d.values[name], "country");
			return {
				name: name,
				label: d['country'],
				y0: y0,
				y1: y0 +=d[name]
			};
		});
		d.total = d.mapping[d.mapping.length - 1].y1;
	});

	// Set up axes

	// X0 domain is the set of REGIONS (to group the countries together)
	x0.domain(data.map(function(d) {
		return d.key;
	}));

	// X1 domain is the set of COUNTRIES
	//x1.domain(selectColumns).rangeRoundBands([0, x0.rangeBand()]);
	console.log(data[0].values, "KEYZ");
	x1.domain(data.map(function(d) {
		for (var a = 0; a < d.values.length; a++) {
			console.log(d.values[a].key, "country");
			return d.values[a].key;
		}
		//return d.country;
	}))


	// Finds the maximum value given an array of column names and a dataset
	function selectedMax(columns, dataset) {
		var max;
		columns.forEach(function(element, index, array) {
			var tempMax = d3.max(dataset, function(d) {
				console.log(d);
				return +d[element];
			});
			max = (tempMax > max || max === undefined) ? tempMax : max;
		});
		return max;
	}

	// // Y domain is 0 to max value of the different resource amounts
	// y.domain([0, selectedMax(selectColumns, data)]);
	console.log(yMax, "maximum?");
	// y.domain([0, d3.max(data, function(d) { return d.total; })]);
	y.domain([0, yMax]);


	// Append the axes to the graph
	svg.append("g")
	    .attr("class", "xaxis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

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
	var region = svg.selectAll(".region")
			.data(data)
			.enter().append("g")
			.attr("class", "g")
			.attr("transform", function(d) {
				// Moves each region group over by a smidge
				return "translate(" + x0(d.key) + ",0)";
		});

	region.selectAll("rect")
			.data(
				// Should return a series of countries with resources...
				function(d) {
					var resources = d.values.map(function(element) {
						console.log(element.resources);
						return element.resources;
					});
					console.log(resources);
			})
			.enter().append("rect")
			.attr("width", x.rangeBand()) // *** Eventually change this to percentage * set width
			.attr("y", function(d) { return (d.y1); })
			.attr("height", function(d) { return y(d.y0) - y(d.y1); })
			.style("fill", function(d) { return color(d.name); });
});