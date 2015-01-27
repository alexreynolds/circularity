// Set up the graph

// Important variables
var totalWidth = 3000, totalHeight = 3000;
var colorAnimals = "#7AD44F",
	colorFeed = "#CAE830",
	colorFood = "#CEA11A",
	colorForestry = "#01B465";
	colorOther = "#E0824F";

// Global to hold the data set AFTER it has been sorted
var data;

var color = d3.scale.ordinal()
				.range([colorAnimals, colorFeed, colorFood, colorForestry, colorOther]);

var margin = {top:20, right:20, bottom:20, left:20},
	width = totalWidth - margin.left - margin.right,
	height = totalHeight - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("id", "svg")
			.append("g")
			.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")"); // Move down and over


var step = 6; // Step between radii values
//var scaleFactor = 0.000293; // Amount to scale resource use value
var scaleFactor = 0.0006;
var strokeWidth = 2; // Width of arcs
var radii = [];
var previous = 1;
for (var i = 1; i < 216; i++) {
	radii[i] = previous + step;
	previous += step;
}

// Function to build an arc from data
var arc = d3.svg.arc()
			.innerRadius(function(d,i) { /*console.log(d.radius, "inner radius");*/ return d.radius; })
			.outerRadius(function(d,i) { return d.radius + strokeWidth; })
			.startAngle(function(d,i) { /*console.log(d.start, "start");*/ return d.start; })
			.endAngle(function(d,i) { return d.start + d.size; });


// Load the data
d3.csv("flows.csv",function(error, dataset) {

	// Data to use for graph
	
	// Biomass totals
	var varNames = ["total_biomass_animals", "total_biomass_feed", "total_biomass_food", "total_biomass_forestry", "total_biomass_other"];

	// Colors correspond to the different variables
	color.domain(varNames);

	console.log(dataset, "initial data");

	// Sort dataset based on total resource usage
	var data = dataset.sort(function (a,b) {
		console.log([a["TOTAL_BIOMASS"], b["TOTAL_BIOMASS"]], "total biomass");
		//return +a["TOTAL_BIOMASS"] - +b["TOTAL_TOTAL_BIOMASS"];
		return d3.ascending(a["TOTAL_BIOMASS"], b["TOTAL_BIOMASS"]);
	})

	console.log(data, "post totaling");

	data.forEach(function (d,i) {
		var start =3*Math.PI/2;
		//var start = (data.length - i)*0.0001 * (2*Math.PI);
		var percentVar = "", radius = 0, total = 0;
		d.mapping = varNames.map(function (name) {

			radius = step * (i + 1); // Radius of circle that the arc is drawn along
			circ = 2 * radius * Math.PI; // The circumference of the circle that the arc is drawn along
			arcLength = +d[name] * scaleFactor / circ; // Percentage of circumference that arc will fill
			arcAngle = arcLength * 2 * Math.PI;
			total += +d[name];

			// String to hold the name of the percentage balue
			//percentVar = name.replace("TOTAL_","TOTAL_USED_") + "_PERCENT";

			return {
				name: name, // Resource
				country: d['country'],
				region: d['region'],
				start: start, // Starting angle of the arc (radians)
				size: arcAngle,
				end: start += arcAngle, // Should never be more than 6.28
				radius: step * (i + 1),
				//percent: d[percentVar], // Percentage of resource used
				color: color(name)
			};
		});
		// d.total = d.mapping[d.mapping.length - 1].end;
		//d.total = total;
	});

	//console.log("prepped data", data);

	
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