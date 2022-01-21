import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataManagerService, IData } from 'src/app/services/data-manager.service';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { curveMonotoneX } from 'd3';
import { UIService } from 'src/app/services/ui.service';

interface ILineData {
	name: string;
	series:
	{
		name: any,
		value: number
	}[];
}

@Component({
	selector: 'app-data-viewer2',
	templateUrl: './data-viewer2.component.html',
	styleUrls: ['./data-viewer2.component.scss']
})
export class DataViewer2Component implements OnInit, OnDestroy {
	public data$: BehaviorSubject<ILineData[]> = new BehaviorSubject([]);
	public unit$: BehaviorSubject<string> = new BehaviorSubject(undefined);
	public colors$: BehaviorSubject<{
		name: string,
		value: string
	}[]> = new BehaviorSubject([]);
	public selected$ = of('');
	public width;
	public height;

	public referenceLines = [];

	public curve = curveMonotoneX;
	private uiServiceHidden: Subscription;
	constructor(public dataManagerService: DataManagerService, public uiService: UIService) {
		this.uiService.sidenavWidth.subscribe(sidenavwidth => {
			this.width = uiService.innerWidth - sidenavwidth;
		})
		this.height = uiService.innerHeight / 2 - uiService.rem(6);
	}

	ngOnInit() {
		this.dataManagerService.buildingDatas.subscribe((data: IData) => {
			this.updateData(data);
		});
		// on data$ change ==> update colors array
		this.data$.subscribe(async data => {
			this.colors$.next(await Promise.all(data.map((e, i) =>
				({
					name: e.name,
					value: this.uiService.colors[i]
				})
			)));
		})
		// check if it's hodden
		this.uiServiceHidden = this.uiService._hidden.subscribe(hidden => {
			hidden ? this.hide() : this.show();
		})
	}
	ngOnDestroy() {
	}
	onClick(button) {
		this.selected$.subscribe(selected => {
			if (selected === button) {
				this.selected$ = of("");
				this.hide();
			} else {
				this.selected$ = of(button);
				this.show();
			}
		});
	}
	show() {
		this.uiService.updateHeight();
		this.uiService._hidden = of(false);
	}
	hide() {
		this.uiService.updateHeight(0);
		this.uiService._hidden = of(true);
	}
	async updateData(data: IData) {
		if (data && data.values && data.values.length > 0
			&& !data.values.every(e => e.hidden)) {
			this.data$.next(await Promise.all(data.values.filter(d => !d.hidden).map(data =>
				({
					name: data.name,
					series: data.data.map(d => ({ name: new Date(d.date), value: d.value }))
				})
			)));
			this.unit$.next(data.unit);
		} else {
			this.data$.next([]);
			return;
		}
	}
}
