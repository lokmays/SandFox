
import { Component, OnInit } from '@angular/core';
import { select, format, scaleTime, scaleLinear, axisBottom, axisLeft, timeFormat, event, bisector, line, curveMonotoneX } from 'd3';
import { findIndex, minBy, maxBy, flatten } from 'lodash';
import { HttpClient } from '@angular/common/http';

import { DataManagerService, IData } from '../../../../services/data-manager.service';
import { UIService } from 'src/app/services/ui.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
@Component({
	selector: 'app-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

	// TODO: take this from data manager
	unit = '';
	margin = {
		top: 10,
		right: 60,
		bottom: 30,
		left: 30
	};


	width;
	height = document.documentElement.clientHeight / 2 - this.margin.top - this.margin.bottom -
		this.uiService.rem(2) - this.uiService.rem(11); // 50vh-4rem
	result;
	xAxis;
	yAxis;
	svg;
	constructor(private http: HttpClient, public dataManagerService: DataManagerService,
		public uiService: UIService, private alertMessagesService: AlertMessagesService) {
		// this.dataManager.addBuilding('test/rppm',)
		// let data ;
		this.uiService.sidenavWidth.subscribe(sidenavWidth => {
			this.width = window.innerWidth - sidenavWidth - this.margin.left - this.margin.right;

		});
	}


	async setup() {
		await this.dataManagerService.buildingDatas.subscribe(async (datas: IData) => {
			let minX, minY, maxX, maxY, xScale, yScale;
			try {
				// reset the svg and delete all the children
				this.svg = select('#viewer');
				this.svg.selectAll('*').remove();
				if (!datas || !datas.values.length) {
					return;
				}
				this.svg.append('g')
					.attr('class', 'lines');
				this.svg.append('g')
					.attr('class', 'tooltips');
				this.unit = datas.unit;
				// TODO: Change this shit min is not working 
				const temp: ({ value: number, date: any }[])
					= flatten(await Promise.all(datas.values.map(async data => data.data)));
				minX = minBy(temp, d => d.date).date;
				maxX = maxBy(temp, d => d.date).date;
				minY = datas.min;
				maxY = datas.max;
				xScale = scaleTime()
					.domain([new Date(minX), new Date(maxX)])
					.range([0, this.width]); // width:500 px
				yScale = scaleLinear()
					.domain([minY, maxY])
					.range([this.height, 0]);
				let yAxisFormat;
				if ((maxY - minY) < 10) {
					yAxisFormat = format(".2f");
				} else {
					yAxisFormat = format("d");
				}

				this.xAxis = axisBottom(xScale)
					.tickFormat(timeFormat('%d/%m/%y'))
					.ticks(this.width / 200);
				const axisColor = 'grey';
				this.svg.append('g')
					.attr('class', 'x-axis')
					.attr('transform', `translate(${this.margin.left},${this.height + this.margin.top})`)
					.call(this.xAxis)
					.style('color', axisColor)
					.append('text');

				this.yAxis = axisLeft(yScale)
					.tickFormat(d => {
						return yAxisFormat(d);
					})
					.ticks(this.height / 50);
				const yAxis = this.svg.append('g')
					.call(this.yAxis)
					.attr('class', 'y-axis')
					.style('color', axisColor)
					.attr('transform', `translate(${this.margin.left - 1},${this.margin.top})`);

				yAxis.select(".domain").remove();
				yAxis.append('text')
					.attr('class', 'yTitle')
					.style('fill', axisColor)
					.attr("transform", "rotate(-90)")
					.attr('y', '1rem')
					.style('font-size', '1rem')
					.text(this.unit);

				await this.dataManagerService.choosedBuildings.subscribe(async buildings => {
					await Promise.all(buildings.map((building, i) => {
						const indexInData = findIndex(datas.values, data => data.name === building);
						if (indexInData === -1) {
							return;
						}
						this.createNewLine({ xScale, yScale }, datas.values[indexInData], i);
					}));
					buildings.forEach((b, index) => {
						this.createTooltip(index);
					});
				});
				const mouseLine = this.svg.append('path')
					.attr("class", "mouse-line")
					.style("stroke", "rgba(30,30,30,0.7)")
					.style("stroke-width", "2px")
					.style("opacity", "0");

				const hoverMouse = this.svg.append('rect')
					.style('class', 'mouse-hover-zone')
					.style('width', this.width)
					.style('height', this.height + this.margin.top)
					.style('fill', 'none')
					.attr('x', this.margin.left)
					.attr('y', 1)
					.attr('pointer-events', 'all');

				this.dataManagerService.choosedBuildings.subscribe(buildings => {
					hoverMouse.on('touchmove mousemove', () => {
						// mouse position
						const mx = event.pageX - hoverMouse['_groups'][0][0].getBoundingClientRect().x;
						const my = event.pageY - hoverMouse['_groups'][0][0].getBoundingClientRect().y;

						mouseLine.style('opacity', '1')
							.attr('d', `M${mx + this.margin.left},${this.height + this.margin.top}  ${mx + this.margin.left},0`);
						// Closest x date to mx
						const date = new Date(xScale.invert(mx));
						buildings.forEach((building, index) => {
							const text = this.svg.select('.text-' + index);
							const circle = this.svg.select('.circle-' + index);
							const tooltip = this.svg.select('.tooltip-' + index);

							// TODO:Changed
							const indexInData = findIndex(datas.values, data => data.name === building);
							if (indexInData === -1) {
								return;
							}
							// get closest data index to mouse position
							const f = () => {
								// TODO:Changed
								const i = findIndex(datas.values[indexInData].data, e => new Date(e.date) > date);
								const a = datas.values[indexInData].data[i];
								return a;
							};
							const res = f();
							if (!res || !res.value) {
								text.style("opacity", "0");
								circle.style('opacity', '0');
								tooltip.style('opacity', '0');
								return;
							}
							// show the popup with data inside
							const y = yScale(res.value);
							const x = xScale(new Date(res.date));
							// console.log(res.value)
							if (Math.abs(mx - x) > 20) {
								text.style("opacity", "0");
								circle.style('opacity', '0');
								tooltip.style('opacity', '0');

							} else {
								text.style("opacity", "1")
									.html(yAxisFormat(res.value))
									.attr("x", x + this.margin.left + 12)
									.attr("y", y + this.margin.top + 1);
								circle.style('opacity', '1')
									.attr("cx", x + this.margin.left)
									.attr("cy", y + this.margin.top + 1);
								tooltip.style('opacity', '1')
									.attr("x", x + this.margin.left + 8)
									.attr("y", y + this.margin.top - 10);

							}
						});

					});
					hoverMouse.on('mouseout', () => {
						mouseLine.style('opacity', '0');
						buildings.forEach((building, index) => {
							const text = this.svg.select('.text-' + index);
							const circle = this.svg.select('.circle-' + index);
							const tooltip = this.svg.select('.tooltip-' + index);

							text.style('opacity', '0');
							circle.style('opacity', '0');
							tooltip.style('opacity', '0');

						});
					});
				});
			} catch (err) {
				this.alertMessagesService.pushErrorMessage('Failed to build svg line chart');
			}
		});


		return null;
	}
	createNewLine(scale: ({ xScale: any, yScale: any })
		, data: {
			name: string; // building's name
			data: {
				value: number;
				date: Date;
			}[];
		},
		index) {
		const building = data.name;
		const { xScale, yScale } = scale;
		if (!(xScale && yScale && data)) {
			return;
		} else {

			const l = line<{ date: Date, value: number }>()
				.curve(curveMonotoneX)
				.x(d => {
					return xScale(new Date(d.date));
				})
				.y(d => yScale(d.value));
			this.svg.select('.lines')
				.append('path')
				.datum(data.data)
				.attr("class", "line-" + index)
				.attr("d", l)
				.attr('stroke', this.uiService.colors[index])
				.style('width', this.width)
				.style('height', this.height)
				.style('fill', 'none')
				.style('stroke-width', '2px')
				.style('stroke-linecap', 'round')
				.style('stroke-linejoin', 'round')
				.style('transform', `translate(${this.margin.left}px,${this.margin.top - 2}px)`);
		}
	}
	createTooltip(index) {
		const group = this.svg.select('.tooltips').append('g')
			.attr('class', 'group-' + index);
		group.append('rect')
			.attr('class', 'tooltip-' + index)
			.attr("rx", 5)
			.attr("ry", 6)
			.attr("width", 80)
			.attr("height", 20)
			.style("fill", 'white')
			.style("opacity", '0')
			.style("stroke", this.uiService.colors[index])
			.style("stroke-width", 1);
		group.append("circle")
			.attr("class", "circle-" + index)
			.attr("r", 6)
			.style('stroke', this.uiService.colors[index])
			.style("stroke-width", "1px")
			.style('fill', 'white')
			.style('opacity', '0');
		group.append('g')
			.append('text')
			.attr('class', 'text-' + index)
			.style("opacity", 0)
			.attr("text-anchor", "left")
			.attr("alignment-baseline", "middle")

			.style('fill', this.uiService.colors[index]);
	}

	ngOnInit() {
		this.setup();

	}


}
