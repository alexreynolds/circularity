// Set up the graph

// Important variables
var totalWidth = 3000, totalHeight = 3000;
var colorBiomass = "#44B44A",
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
			.append("g")
			.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")"); // Move down and over


// Convert degrees to radians
function deg2Rad(degrees) {
	return degrees * (Math.PI/180);
}
 
//radii = [1, 24, 32, 48, 60, 80, 120, 1125];
var step = 6; // Step between radii values
var scaleFactor = 0.000293; // Amount to scale resource use value
var strokeWidth = 2; // Width of arcs
var radii = [];
var previous = 1;
for (var i = 1; i < 216; i++) {
	radii[i] = previous + step;
	previous += step;
}
console.log(radii);

var simple_data = [
        {start: 0, size: 1, radius: 25, color: "red"},
        {start: 1, size: 1, radius: 25, color: "white"},
        {start: 2, size: 1, radius: 25, color: "yellow"},
        {start: 3, size: 1, radius: 25, color: "orange"},

        {start: Math.PI, size: Math.PI/2, radius: 31, color: "green"},
        {start: 0, size: 3, radius: 37, color: "blue"},
        ];

// Function to build an arc from data
var arc = d3.svg.arc()
			.innerRadius(function(d,i) { console.log(d.radius, "inner radius"); return d.radius; })
			.outerRadius(function(d,i) { return d.radius + strokeWidth; })
			.startAngle(function(d,i) { console.log(d.start, "start"); return d.start; })
			.endAngle(function(d,i) { return d.start + d.size; });

// Draws arcs
// svg.selectAll("path")
// 		.data(simple_data)
// 		.enter().append("svg:path")
// 		.style("fill", function(d, i){
// 			return d.color;
// 		})
// 		.attr("d", arc)
// 		;



// Load the data
d3.csv("flows.csv",function(error, dataset) {

	// Variables to look at
	var varNames = ["TOTAL_BIOMASS", "TOTAL_FOSSILS", "TOTAL_ORES", "TOTAL_MINERALS"];

	// Colors correspond to the different variables
	color.domain(varNames);

	console.log(dataset, "initial data");

	// NEED TO SORT DATA BASED ON TOTAL RESOURCE USAGE
	var data = dataset.sort(function (a,b) {
		console.log(a["TOTAL_RESOURCES"]);
		return a["TOTAL_RESOURCES"] - b["TOTAL_RESOURCES"];
	})

	// dataset.forEach(function (d,i) {
	// 	var total = 0;
	// 	varNames.map(function (name) {
	// 		total += +d[name];
	// 	});
	// 	// d.total = d.mapping[d.mapping.length - 1].end;
	// 	d.total = total;
	// 	//console.log(d.total, "tota");
	// });

	console.log(dataset, "post totaling");

	data.forEach(function (d,i) {
		var start = 0, percentVar = "", radius = 0, total = 0;
		d.mapping = varNames.map(function (name) {

			radius = step * (i + 1); // Radius of circle that the arc is drawn along
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
	});

	console.log("prepped data", data);

	
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