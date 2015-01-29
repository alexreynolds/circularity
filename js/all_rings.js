// Set up the graph

// Important variables
var totalWidth = 2000, totalHeight = 2000;
var colorBiomass = "#bff45b",
	colorFossil = "#8F3142",
	colorOre = "#4B4768",
	colorMineral = "#78B495";

var color = d3.scale.ordinal()
				.range([colorBiomass, colorFossil, colorOre, colorMineral]);

var margin = {top:20, right:20, bottom:20, left:20},
	width = totalWidth - margin.left - margin.right,
	height = totalHeight - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("id", "svg")
			.append("g")
			.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")"); // Move down and over

 
var step = 4; // Step between radii values
//var scaleFactor = 0.000293; // Amount to scale resource use value
var scaleFactor = 0.00035;
var startRadius = 0;
var strokeWidth = 1; // Width of arcs
var radii = regionRadii = [];
var previous = 1;
for (var i = 1; i < 157; i++) {
	radii[i] = previous + step + startRadius;
	previous += step;
}
console.log(radii);

// Function to build an arc from data
var arc = d3.svg.arc()
			.innerRadius(function(d,i) { return d.radius; })
			.outerRadius(function(d,i) { return d.radius + strokeWidth; })
			.startAngle(function(d,i) { return d.start; })
			.endAngle(function(d,i) { return d.start + d.size; });

var rings = svg.append('g')
	.attr("class", "ring");
    //.attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")");
 
rings.selectAll('circle')
    .data(radii)
  	.enter().append('circle')
  	.style("stroke", "#fff")
  	.style("stroke-width", 1)
    .attr('r', function(d) {return d;});



// Load the data
d3.csv("flows_subset_noCh.csv",function(error, dataset) {

	// Variables to look at
	var varNames = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];

	// Colors correspond to the different variables
	color.domain(varNames);

	//console.log(dataset, "initial data");

	// Sort dataset based on total resource usage
	var data = dataset.sort(function (a,b) {
		//return a["TOTAL_RESOURCES"] - b["TOTAL_RESOURCES"];
		return d3.ascending(a["region"], b["region"]) ||
			a["TOTAL_RESOURCES"] - b["TOTAL_RESOURCES"];
	});

	console.log(data, "post processing");

	var region = "";
	var chinaNode, usNode, australiaNode;

	data.forEach(function (d,i) {
		//var start = Math.PI/2;
		var start = 0;
		if (i == 0) { region = d['region']; }
		//var start = (data.length - i)*0.0001 * (2*Math.PI);
		var percentVar = "", radius = 0, total = 0;
		d.mapping = varNames.map(function (name) {

			radius = step * (i + 1) + startRadius; // Radius of circle that the arc is drawn along

			// Note if this is the start of a new region
			if (region != d['region']) {
				console.log("new region");
				// Add this radius to list of new region radii
				regionRadii[] = i;
				region = d['region'];
			}

			circ = 2 * radius * Math.PI; // The circumference of the circle that the arc is drawn along
			arcLength = +d[name] * scaleFactor / circ; // Percentage of circumference that arc will fill
			arcAngle = arcLength * 2 * Math.PI;
			total += +d[name];

			// String to hold the name of the percentage balue
			percentVar = name.replace("TOTAL_","TOTAL_USED_") + "_PERCENT";

			return {
				name: name, // Resource
				country: d['country'],
				region: d['region'],
				start: start, // Starting angle of the arc (radians)
				size: arcAngle,
				end: start += arcAngle, // Should never be more than 6.28
				radius: step * (i + 1),
				percent: d[percentVar], // Percentage of resource used
				color: color(name)
			};
		});
		// d.total = d.mapping[d.mapping.length - 1].end;
		//d.total = total;
		switch(d['country']) {
			case 'China': chinaNode = d; break;
			case 'Australia': australiaNode = d; break;
			case 'United States': usNode = d; break;
		}
	});

	console.log("prepped data", data);

	console.log(chinaNode, "China");

	
	// Add bars to graph for each country
	var selection = svg.selectAll(".countries")
			.data(dataset)
			.enter().append("g")
			.attr("class", function(d) { return "countries " + d.country; });

	// Draws arcs
	selection.selectAll("path")
			.data(function(d) { return d.mapping; })
			.enter().append("svg:path")
			.style("fill", function(d, i){
				return d.color;
			})
			.attr("d", arc)
			;


});