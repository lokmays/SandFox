import { Component, OnInit, OnChanges } from '@angular/core';
import { of } from 'rxjs';

import { UIService } from 'src/app/services/ui.service';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnChanges {
  hidden = true;
  constructor(public uiService: UIService, public dataManagerService: DataManagerService, public alertMessagesService: AlertMessagesService) {

  }
  filterClick(filter, active) {
    if (active == 'active' && filter) {
      this.dataManagerService.toggleType(filter);

    }
  }
  filterIsSelected(filter) {
    return this.dataManagerService.choosedType === filter.type;
  }
  ngOnInit() {
    this.uiService.sidenavWidth.next(this.hidden === true ? this.uiService.rem(3) : this.uiService.rem(17));
  }
  ngOnChanges() {
    // this.uiService.sidenavWidth =parseFloat(getComputedStyle( document.querySelector('app-sidenav .container')).width);
    this.uiService.sidenavWidth.next(parseFloat(getComputedStyle(document.querySelector('app-sidenav .container')).width));

  }
  show() {
    this.hidden = false;
    // 17 rem
    this.uiService.sidenavWidth.next(this.uiService.rem(17));

  }
  hide() {
    this.hidden = true;

    this.uiService.sidenavWidth.next(this.uiService.rem(3));

  }
  addAlarm() {
    this.uiService.addAlarm = of(true);
  }
  exportFile() {
    if (!this.dataManagerService.buildingDatas.value || !this.dataManagerService.buildingDatas.value.values) {
      this.alertMessagesService.pushErrorMessage('Vous devez chois un type et au moins un bâtiment!')
    } else {

      const items: { name: string, value: number, date: Date }[][] = this.dataManagerService.buildingDatas.value.values.map(item => item.data.map((d: any) => {
        d.name = item.name
        return d
      }))
      let res = `Type,${this.dataManagerService.choosedType.value},Unité,${this.dataManagerService.allBuildingsLatestData.value.unit}\n\nDate,`
      // seconde line
      res += items.map(item => {
        return item[0].name;
      }).join(',')
      res += '\n'
      for (let i = 0; i < items[0].length; i++) {

        let line = new Date(items[0][i].date).toLocaleString('fr-FR')
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          line += item[i].value != undefined ? `,${item[i].value}` : ',NA'
        }
        res += line + '\n'
      }

      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(res)
      hiddenElement.target = '_blank';
      hiddenElement.download = `Energy_${this.dataManagerService.choosedType.value}.csv`;
      hiddenElement.click();
      hiddenElement.remove();
    }
  }
}