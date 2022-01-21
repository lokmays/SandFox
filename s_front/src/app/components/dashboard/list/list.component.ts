import { Component, OnInit, OnDestroy } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { BehaviorSubject } from 'rxjs';
import { DataManagerService } from 'src/app/services/data-manager.service';
interface IBuilding {
	name: string;
	capterId: string;
	hidden?: boolean;
	checked?: boolean;
}

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
	buildings$: BehaviorSubject<IBuilding[]> = new BehaviorSubject([]);
	constructor(public uiService: UIService, private dataManagerService: DataManagerService) { }

	async ngOnInit() {
		this.dataManagerService.buildings.subscribe(l => {
			this.updateBuildingsList(l);
		})
		const list = this.dataManagerService.choosedBuildings.value;
		let buildings = this.buildings$.value;
		buildings = await Promise.all(buildings.map(b => {
			if (!b.checked) {
				if (list.find(e => e === b.name)) {
					b.checked = true;
				}
			}
			return b;
		}))
		this.buildings$.next(buildings)
	}
	ngOnDestroy() {
	}
	toggleBuilding(building: IBuilding) {
		// toggle the building from the data manager service
		this.dataManagerService.toggleBuilding(building.name)

		const l = this.buildings$.value;
		const i = l.findIndex(e => e === building);
		//console.log(l[i].checked)
		l[i].checked = l[i].checked ? undefined : true;
		//console.log(l[i].checked)
		this.buildings$.next(l);

	}
	updateBuildingsList(list: { name: string, capterId: string }[]) {
		const oldList = this.buildings$.value;
		this.buildings$.next(list.map(b => {
			const e = oldList.find(e => e.name === b.name);
			if (!e) {
				return {
					name: b.name,
					capterId: b.capterId
				}
			}
			return {
				name: b.name,
				capterId: b.capterId,
				hidden: e.hidden,
				checked: e.checked
			}
		}))
	}
	async onSearchChange(query: string) {
		this.buildings$.next(await Promise.all(this.buildings$.value.map(building => {
			if (building.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(building.name.toLowerCase())) {
				building.hidden = false;
			} else {
				building.hidden = true;
			}
			return building
		})))
	}

	public change(evenement) {
		console.log(evenement.target.data)
	}
}
