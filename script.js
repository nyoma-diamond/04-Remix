Promise.all([
	d3.json("countries-50m.json"),
	d3.csv("data.csv")
]).then(([world, data]) => {
	createMap(world, data)
})


function createMap(world, data) {
	var labels = [
		'Vulnerable',
		'Definitely endangered',
		'Severely endangered',
		'Critically endangered',
		'Extinct'
	]

	var counts = {}
	labels.forEach(function (d) {
		counts[d] = 0
	})

	data.forEach(function (d) {
		counts[d['Degree of endangerment']] += 1
	});

	lockedID = null

	//var land = topojson.feature(world, world.objects.land)
	var countries = topojson.feature(world, world.objects.countries)

	var proj = d3.geoRobinson()
		.translate([550, 300])
		.scale(170)

	var gpath = d3.geoPath()
		.projection(proj);

	var width = 1200,
		height = 600

	var map = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr('id', 'map')

	map.selectAll('path')
		.data(countries.features)
		.enter()
		.append('path')
			.attr('d', d => gpath(d))
			.attr('stroke-width', 1)
			.attr('stroke', '#252525')
			.attr('fill', 'white')

	var color = d3.scaleOrdinal()
		.range([
			'#C8F55F',
			'#FFD000',
			'#EB8C00',
			'#FF4600',
			'#F50033'
		])
		.domain(labels)

	let tooltip = d3.select('body') //ref: http://bl.ocks.org/biovisualize/1016860
		.append('div')
			.style('position', 'absolute')
			.style('visibility', 'hidden')
			.style('border', '1px solid black')
			.style('background-color', 'white');


	map.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
			.attr('r', 4)
			.attr('stroke-width', 1)
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.5)
			.attr('transform', d =>
				"translate(" + proj([
					d.Longitude,
					d.Latitude
				]) + ")"
			)
			.attr('fill', d => color(d['Degree of endangerment']))
			.attr('opacity', 0.5)
			.attr('id', d => d['Degree of endangerment'].replace(/\s/g,'_') )
			.on('mouseover', function (d, i) {
				if (lockedID == null || d3.select(this).attr('id') == lockedID) {
					d3.select(this).attr('opacity', 1);

					let tip = 'Name: ' + i['Name in English'] +
						"<br>Endangerment Status: " + i['Degree of endangerment'] +
						"<br>Speakers: " + i['Number of speakers'] +
						"<br>Countries Spoken: " + i['Countries']

					return tooltip.html(tip).style('visibility', 'visible');
				}
			})
			.on('mousemove', function(d) {
				if (lockedID == null || d3.select(this).attr('id') == lockedID) {
					tooltip.style('top', (d.pageY + 20) + 'px').style('left', (d.pageX - 60) + 'px')
				}
			})
			.on('mouseout', function () {
				if (lockedID == null || d3.select(this).attr('id') == lockedID) {
					tooltip.style('visibility', 'hidden');
					d3.select(this).attr('opacity', 0.5);
				}
			})




	// LEGEND
	map.selectAll('legend_dots')
		.data(labels)
		.enter()
		.append('circle')
			.attr('cx', width - 160)
			.attr('cy', (d, i) => 75 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
			.attr('r', 8)
			.attr('opacity', 0.5)
			.attr('id', d => 'legend_' + d.replace(/\s/g,'_'))
			.style('fill', d => color(d))
			.attr('stroke-width', 1)
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.5)

	map.selectAll('legend_labels')
		.data(labels)
		.enter()
		.append('text')
			.attr('x', width - 145)
			.attr('y', (d, i) => 76.5 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
			.text(d => d)
			.attr('text-anchor', 'left')
			.style('alignment-baseline', 'middle')
			.attr('id', d => 'legend_text_' + d.replace(/\s/g,'_'))





















	//ref: https://bl.ocks.org/d3noob/d805555ee892425cc582dcb245d4fc59

	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 20, bottom: 30, left: 110},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// set the ranges
	var y = d3.scaleBand()
		.range([0, height])
		.domain(labels)
		.padding(0.1);

	var x = d3.scaleLinear()
		.range([0, width])
		.domain([0, d3.max(Object.keys(counts).map(key => counts[key]))])

	// append the svg object to the body of the page
	// append a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", 
				"translate(" + margin.left + "," + margin.top + ")");

	
	function highlight(hover) {
		svg.selectAll("rect")
			.attr('opacity', 0.3)
					
			map.selectAll("circle")
				.attr('opacity', 0)

			hover.attr('opacity', 0.75);
					
			map.selectAll('#' + hover.attr('id'))
				.attr('opacity', 0.5)

			labels.forEach(function(d) {
				map.selectAll('#legend_'+d.replace(/\s/g,'_'))
					.attr('opacity', 0.5)	
			})

			map.selectAll('#legend')
				.attr('opacity', 0.5)
	}


	// append the rectangles for the bar chart
	svg.selectAll("rect")
		.data(Object.keys(counts))
		.enter()
		.append("rect")
			.attr("class", "bar")
			.attr("y", d => y(d) )
			.attr("height", y.bandwidth())
			.attr("width", d => x(counts[d]) )
			.attr('x', 1)
			.attr('fill', d => color(d))
			.attr('opacity', 0.5)
			.attr('stroke-width', 1)
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.5)
			.attr('id', d => d.replace(/\s/g,'_') )
			.on('mouseover', function () {
				if (lockedID == null) {
					highlight(d3.select(this))
				}
			})
			.on('click', function() {
				tID = d3.select(this).attr('id')
				if (lockedID != tID) {
					lockedID = tID
					highlight(d3.select(this))

					d3.select(this)
						.attr('opacity', 1)
				} else {
					lockedID = null
					d3.select(this).attr('opacity', 0.75);
				}
			})
			.on('mouseout', function () {
				if (lockedID == null) {
					svg.selectAll("rect")
						.attr('opacity', 0.5)
					
					map.selectAll('circle')
						.attr('opacity', 0.5)
				}
			})

	// add the x Axis
	svg.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
	  .call(d3.axisLeft(y));
	  
	  
}