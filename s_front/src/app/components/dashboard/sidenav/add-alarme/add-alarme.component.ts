import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { UIService } from 'src/app/services/ui.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { AlarmService, IAlarm } from 'src/app/services/alarm.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
import { __assign } from 'tslib';

@Component({
	selector: 'app-add-alarme',
	templateUrl: './add-alarme.component.html',
	styleUrls: ['./add-alarme.component.scss']
})
export class AddAlarmeComponent implements OnInit {
	constructor(public dataManagerService: DataManagerService, public uiService: UIService,
		private alarmService: AlarmService, private alertMessagesService: AlertMessagesService) { }
	public tabIndex = of(0);
	alarmForm = new FormGroup({
		high_seuil_min: new FormControl(''),
		high_seuil_max: new FormControl(''),

		avg_seuil_min: new FormControl(''),
		avg_seuil_max: new FormControl(''),

		low_seuil_min: new FormControl(''),
		low_seuil_max: new FormControl(''),

		sms: new FormControl(),
		email: new FormControl(),
		notification: new FormControl(),
	});
	ngOnInit() {
	}

	cancel() {
		this.uiService.addAlarm = of(false);
	}
	clickHandle(i) {
		this.tabIndex = of(i);
	}
	async onSubmit() {
		const newAlarm: IAlarm = this.alarmService.emptyAlarm;
		Object.assign(newAlarm, this.formToAlarm());
		Object.assign(newAlarm, {
			buildings: this.dataManagerService.choosedBuildings.value,
			type: this.dataManagerService.choosedType.value
		});
		const success = await this.alarmService.addAlarm(newAlarm)
			.catch(err => {
				this.alertMessagesService.pushErrorMessage('Alarme invalide, problemes d\'ajout d\'alarme');
			});
		if (success) {
			this.alarmForm.reset();
			this.cancel();
		}
	}
	formToAlarm() {
		const alarm = {
			high_level: {
				seuil_max: this.alarmForm.value.high_seuil_max,
				seuil_min: this.alarmForm.value.high_seuil_min
			},
			avg_level: {
				seuil_max: this.alarmForm.value.avg_seuil_max,
				seuil_min: this.alarmForm.value.avg_seuil_min
			},
			low_level: {
				seuil_max: this.alarmForm.value._seuil_max,
				seuil_min: this.alarmForm.value.low_seuil_min
			},
			sms: this.alarmForm.value.sms,
			email: this.alarmForm.value.email,
			notification: this.alarmForm.value.notification
		}
		return alarm;
	}
}
