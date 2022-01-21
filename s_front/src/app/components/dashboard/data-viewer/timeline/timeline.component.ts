import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { timeParse, timeFormat, scaleThreshold, select, event } from 'd3';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'app-timeline',
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.scss'],
	encapsulation: ViewEncapsulation.None
})


export class TimelineComponent implements OnInit {
	@ViewChild('charts') private spiraleContainer: ElementRef;
	@Input() height: number;
	@Input() width: number;
	radians = 0.0174532925;
	segment_label: string[];
	radial_labels: string[];
	margin: { top: number; right: number; bottom: number; left: number; };
	innerRadius: number;
	radius: number;
	holeRadiusProportion: number; // proportion of radius
	arcsPerCoil: number; // assuming months per year
	coilPadding: number; // no padding
	arcLabel: string; // no labels
	coilLabel: string; // no labels
	startAngle: number; // starts at 12 o'clock

	colour: any;

	that = this;

	datas: BehaviorSubject<{
		year: number,
		month: string,
		value: number,
	}[]> = new BehaviorSubject(new Array());
	// datas: any[] = new Array();

	mockDatas: {
		month: string,
		value: number,
		year: string,
	}[] = new Array();

	colors: string[];
	svg: any;

	configUrl = "../../../../assets/monthTest.json";


	constructor() { }

	ngOnInit() {
		this.init_var();
		this.init_data();
		this.setup();
	}

	init_var() {
		this.segment_label = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
			'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

		this.margin = { top: 0, right: 70, bottom: 40, left: (this.width - this.height / 2) / 2 };

		this.height = this.height - (this.margin.top + this.margin.bottom);
		this.width = this.width - (this.margin.left + this.margin.right);


		this.innerRadius = 100;

		this.radius = this.height / 2;
		this.holeRadiusProportion = 0.3;
		this.arcsPerCoil = 12;
		this.coilPadding = 0;
		this.arcLabel = 'month';
		this.coilLabel = 'year';
		this.startAngle = 0;
	}

	init_data() {
		//console.log(this.datas);
		// console.log(this.datas[0]);

		//for (let i = 0; i < 12; i++) {
		// console.log('res ' + i + energy[i]);
		//}

		//console.log(this.datas);

		this.mockDatas.push({ year: '2008', month: 'jan', value: 0 });
		this.mockDatas.push({ year: '2008', month: 'fev', value: 100 });
		this.mockDatas.push({ year: '2008', month: 'mars', value: 150 });
		this.mockDatas.push({ year: '2008', month: 'avril', value: 200 });
		this.mockDatas.push({ year: '2008', month: 'mai', value: 250 });
		this.mockDatas.push({ year: '2008', month: 'juin', value: 300 });
		this.mockDatas.push({ year: '2008', month: 'juillet', value: 350 });
		this.mockDatas.push({ year: '2008', month: 'aout', value: 400 });
		this.mockDatas.push({ year: '2008', month: 'septembre', value: 238 });
		this.mockDatas.push({ year: '2008', month: 'oct', value: 100 });
		this.mockDatas.push({ year: '2008', month: 'nov', value: 110 });
		this.mockDatas.push({ year: '2008', month: 'dec', value: 120 });
		this.mockDatas.push({ year: '2009', month: 'jan', value: 60 });
		this.mockDatas.push({ year: '2009', month: 'fev', value: 40 });
		this.mockDatas.push({ year: '2009', month: 'mars', value: 3 });
		this.mockDatas.push({ year: '2009', month: 'avril', value: 4 });
		this.mockDatas.push({ year: '2009', month: 'mai', value: 10 });
		this.mockDatas.push({ year: '2009', month: 'juin', value: 6 });
		this.mockDatas.push({ year: '2009', month: 'juillet', value: 100 });
		this.mockDatas.push({ year: '2009', month: 'aout', value: 22 });
		this.mockDatas.push({ year: '2009', month: 'septembre', value: 56 });
		this.mockDatas.push({ year: '2009', month: 'oct', value: 56 });
		this.mockDatas.push({ year: '2009', month: 'nov', value: 11 });
		this.mockDatas.push({ year: '2009', month: 'dec', value: 12 });
	}

	setup() {
		const chartWidth = this.height;
		const chartHeight = this.height
		const chartRadius = chartWidth / 2
		const margin = { "top": this.margin.top, "bottom": this.margin.bottom, "left": this.margin.left, "right": this.margin.right }
		const dateParse = timeParse("%d/%m/%Y");
		const yearFormat = timeFormat("%Y");
		const monthFormat = timeFormat("%b");
		const that = this;

		const element = this.spiraleContainer.nativeElement;

		this.colour = scaleThreshold<number, string>().domain([100, 200, 300, 400])
			.range(['green', 'yellow', 'orange', 'red']);
		//this.colour = scaleSequential(interpolatePlasma);

		//this.chart(this.svg, this);
		// this.datas.subscribe(data => {
		//   if (data.length > 0) {
		//     //console.log(data);
		//     this.colour.domain(extent(
		//       data, function (d) { return d.value; }
		//     ));
		//   }
		// });
		// this.colour.domain(extent(this.mockDatas, function (d) { return d.value; }));

		//set the options for the sprial heatmap
		const heatmap = this.spiralHeatmap();
		heatmap.arcLabel('month');
		heatmap.coilLabel('year');
		heatmap.radius(chartRadius)
		heatmap.holeRadiusProportion(0.2)
		heatmap.arcsPerCoil(12)
		heatmap.coilPadding(0.1)

		//CREATE SVG AND A G PLACED IN THE CENTRE OF THE SVG
		const div = select(element).append("div");

		div.append("p")
		// .text('test heatmap');
		const svg = div.append("svg")
			.attr("width", chartWidth + margin.left + margin.right)
			.attr("height", chartHeight + margin.top + margin.bottom);

		const g = svg.append("g")
			.attr("transform", "translate("
				+ (margin.left + chartRadius)
				+ ","
				+ (margin.top + chartRadius) + ")");

		// g.datum(this.datas.subscribe(data => function (d) {
		//   console.log('datum:' + d.values);
		//   return d.values;
		// }))
		g.datum(this.mockDatas)
			.call(heatmap);




		g.selectAll(".arc").selectAll("path")
			.style("fill", function (d: any) { return that.colour(d.value); })
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseout", mouseout);

		var tooltip = select(element).append("div");
		tooltip
			.attr("class", "_tooltip")
			.style("display", "none");

		function mouseover() {
			tooltip.style("display", "absolute");
		}

		function mousemove(d: any) {
			tooltip
				.text(d.value)
				.style("display", "inline")
				.style("left", (event.pageX - 30) + "px")
				.style("top", (event.pageY - 30) + "px");
		}

		function mouseout() {
			tooltip.style("display", "none");
		}


	}


	spiralHeatmap() {
		// constants
		const radians = 0.0174532925;

		// All options that <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">are accessible to caller
		// Default values
		var radius = 250;
		var holeRadiusProportion = 0.3; // proportion of radius
		var arcsPerCoil = 12; // assuming months per year
		var coilPadding = 0; // no padding
		var arcLabel = ''; // no labels
		var coilLabel = ''; // no labels
		var startAngle = 0; //starts at 12 o'clock

		function chart(selection) {
			selection.each(function (data) {
				const arcAngle = 360 / arcsPerCoil;
				const labelRadius = radius + 20;

				var arcLabelsArray = [];

				for (var i = 0; i < arcsPerCoil; i++) {
					arcLabelsArray.push(i);
				}
				// Create/update the x/y coordinates for the vertices and control points for the paths
				// Stores the x/y coordinates on the data
				updatePathData(data);

				let thisSelection = select(this)
					.append('g')
					.attr('class', 'spiral-heatmap');

				var arcLabelsG = thisSelection
					.selectAll('.arc-label')
					.data(arcLabelsArray)
					.enter()
					.append('g')
					.attr('class', 'arc-label');

				arcLabelsG
					.append('text')
					.text(function (d) {
						return data[d][arcLabel];
					})
					.attr('x', function (d, i) {
						let labelAngle = i * arcAngle + arcAngle / 2;
						return x(labelAngle, labelRadius);
					})
					.attr('y', function (d, i) {
						let labelAngle = i * arcAngle + arcAngle / 2;
						return y(labelAngle, labelRadius);
					})
					.style('text-anchor', function (d, i) {
						return i < arcLabelsArray.length / 2 ? 'start' : 'end';
					});

				arcLabelsG
					.append('line')
					.attr('x2', function (d, i) {
						let lineAngle = i * arcAngle;
						let lineRadius = radius + 10;
						return x(lineAngle, lineRadius);
					})
					.attr('y2', function (d, i) {
						let lineAngle = i * arcAngle;
						let lineRadius = radius + 10;
						return y(lineAngle, lineRadius);
					});

				var arcs = thisSelection
					.selectAll('.arc')
					.data(data)
					.enter()
					.append('g')
					.attr('class', 'arc');

				arcs.append('path').attr('d', function (d: any) {
					// start at vertice 1
					let start = 'M ' + d.x1 + ' ' + d.y1;
					// inner curve to vertice 2
					let side1 =
						' Q ' +
						d.controlPoint1x +
						' ' +
						d.controlPoint1y +
						' ' +
						d.x2 +
						' ' +
						d.y2;
					// straight line to vertice 3
					let side2 = 'L ' + d.x3 + ' ' + d.y3;
					// outer curve vertice 4
					let side3 =
						' Q ' +
						d.controlPoint2x +
						' ' +
						d.controlPoint2y +
						' ' +
						d.x4 +
						' ' +
						d.y4;
					// combine into string, with closure (Z) to vertice 1
					return start + ' ' + side1 + ' ' + side2 + ' ' + side3 + ' Z';
				});

				// create coil labels on the first arc of each coil
				if (coilLabel !== '') {
					const coilLabels = arcs
						.filter(function (d: any) {
							return d.arcNumber === 0;
						})
						.raise();


					coilLabels
						.append('path')
						.attr('id', function (d: any) {
							return 'path-' + d[coilLabel];
						})
						.attr('d', function (d: any) {
							// start at vertice 1
							let start = 'M ' + d.x1 + ' ' + d.y1;
							// inner curve to vertice 2
							let side1 =
								' Q ' +
								d.controlPoint1x +
								' ' +
								d.controlPoint1y +
								' ' +
								d.x2 +
								' ' +
								d.y2;
							return start + side1;
						})
						.style('opacity', 0);


					coilLabels
						.append('text')
						.attr('class', 'coil-label')
						.attr('x', 3)
						.attr('dy', -4)
						.append('textPath')
						.attr('xlink:href', function (d) {
							return `dashboard#path-${d[coilLabel]}`;
						})
						.text(function (d) {
							return d[coilLabel];
						});
				}
			});

			function updatePathData(data) {
				let holeRadius = radius * holeRadiusProportion;
				let arcAngle = 360 / arcsPerCoil;
				let dataLength = data.length;
				let coils = Math.ceil(dataLength / arcsPerCoil); // number of coils, based on data.length / arcsPerCoil
				let coilWidth = radius * (1 - holeRadiusProportion) / (coils + 1); // remaining radius (after holeRadius removed), divided by coils + 1. I add 1 as the end of the coil moves out by 1 each time


				data.forEach(function (d, i) {
					let coil = Math.floor(i / arcsPerCoil);
					let position = i - coil * arcsPerCoil;
					let startAngle = position * arcAngle;
					let endAngle = (position + 1) * arcAngle;
					let startInnerRadius = holeRadius + i / arcsPerCoil * coilWidth;
					let startOuterRadius =
						holeRadius +
						i / arcsPerCoil * coilWidth +
						coilWidth * (1 - coilPadding);
					let endInnerRadius = holeRadius + (i + 1) / arcsPerCoil * coilWidth;
					let endOuterRadius =
						holeRadius +
						(i + 1) / arcsPerCoil * coilWidth +
						coilWidth * (1 - coilPadding);

					// vertices of each arc
					d.x1 = x(startAngle, startInnerRadius);
					d.y1 = y(startAngle, startInnerRadius);
					d.x2 = x(endAngle, endInnerRadius);
					d.y2 = y(endAngle, endInnerRadius);
					d.x3 = x(endAngle, endOuterRadius);
					d.y3 = y(endAngle, endOuterRadius);
					d.x4 = x(startAngle, startOuterRadius);
					d.y4 = y(startAngle, startOuterRadius);

					// CURVE CONTROL POINTS
					let midAngle = startAngle + arcAngle / 2;
					let midInnerRadius =
						holeRadius + (i + 0.5) / arcsPerCoil * coilWidth;
					let midOuterRadius =
						holeRadius +
						(i + 0.5) / arcsPerCoil * coilWidth +
						coilWidth * (1 - coilPadding);

					// MID POINTS, WHERE THE CURVE WILL PASS THRU
					d.mid1x = x(midAngle, midInnerRadius);
					d.mid1y = y(midAngle, midInnerRadius);
					d.mid2x = x(midAngle, midOuterRadius);
					d.mid2y = y(midAngle, midOuterRadius);

					d.controlPoint1x = (d.mid1x - 0.25 * d.x1 - 0.25 * d.x2) / 0.5;
					d.controlPoint1y = (d.mid1y - 0.25 * d.y1 - 0.25 * d.y2) / 0.5;
					d.controlPoint2x = (d.mid2x - 0.25 * d.x3 - 0.25 * d.x4) / 0.5;
					d.controlPoint2y = (d.mid2y - 0.25 * d.y3 - 0.25 * d.y4) / 0.5;

					d.arcNumber = position;
					d.coilNumber = coil;
				});

				return data;
			}

			function x(angle, radius) {
				// change to clockwise
				let a = 360 - angle;
				// start from 12 o'clock
				a = a + 180 - startAngle;
				return radius * Math.sin(a * radians);
			}

			function y(angle, radius) {
				// change to clockwise
				let a = 360 - angle;
				// start from 12 o'clock
				a = a + 180 - startAngle;
				return radius * Math.cos(a * radians);
			}

			function chartWH(r) {
				return r * 2;
			}
		}

		chart.radius = function (value) {
			if (!arguments.length) return radius;
			radius = value;
			return chart;
		};

		chart.holeRadiusProportion = function (value) {
			if (!arguments.length) return holeRadiusProportion;
			holeRadiusProportion = value;
			return chart;
		};

		chart.arcsPerCoil = function (value) {
			if (!arguments.length) return arcsPerCoil;
			arcsPerCoil = value;
			return chart;
		};

		chart.coilPadding = function (value) {
			if (!arguments.length) return coilPadding;
			coilPadding = value;
			return chart;
		};

		chart.arcLabel = function (value) {
			if (!arguments.length) return arcLabel;
			arcLabel = value;
			return chart;
		};

		chart.coilLabel = function (value) {
			if (!arguments.length) return coilLabel;
			coilLabel = value;
			return chart;
		};

		chart.startAngle = function (value) {
			if (!arguments.length) return startAngle;
			startAngle = value;
			return chart;
		};

		return chart;
	}

	// drawLegend() {
	//   //DRAW LEGEND
	//   const legendWidth = this.chartRadius;
	//   const legendHeight = 20;
	//   const legendPadding = 40;

	//   var legendSVG = select("#legend")
	//       .append("svg")
	//       .attr("width", legendWidth + legendPadding + legendPadding)
	//       .attr("height", legendHeight + legendPadding + legendPadding);

	//   var defs = legendSVG.append("defs");

	//   var legendGradient = defs.append("linearGradient")
	//       .attr("id", "linear-gradient")
	//       .attr("x1", "0%")
	//       .attr("y1", "0%")
	//       .attr("x2", "100%")
	//       .attr("y2", "0%");

	//   let noOfSamples = 20;
	//   let dataRange = dataExtent[1] - dataExtent[0];
	//   let stepSize = dataRange / noOfSamples;

	//   for (i = 0; i < noOfSamples; i++) {
	//       legendGradient.append("stop")
	//           .attr("offset", (i / (noOfSamples - 1)))
	//           .attr("stop-color", colour(dataExtent[0] + (i * stepSize)));
	//   }

	//   var legendG = legendSVG.append("g")
	//       .attr("class", "legendLinear")
	//       .attr("transform", "translate(" + legendPadding + "," + legendPadding + ")");

	//   legendG.append("rect")
	//       .attr("x", 0)
	//       .attr("y", 0)
	//       .attr("width", legendWidth)
	//       .attr("height", legendHeight)
	//       .style("fill", "url(#linear-gradient)");

	//   legendG.append("text")
	//       .text("Fewer nights")
	//       .attr("x", 0)
	//       .attr("y", legendHeight - 35)
	//       .style("font-size", "12px");

	//   legendG.append("text")
	//       .text("More nights")
	//       .attr("x", legendWidth)
	//       .attr("y", legendHeight - 35)
	//       .style("text-anchor", "end")
	//       .style("font-size", "12px");
	// }

}
