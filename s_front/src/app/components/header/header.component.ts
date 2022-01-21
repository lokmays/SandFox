import { Component, OnInit } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	_settings: Observable<boolean> = of(false);
	menuToggle: BehaviorSubject<boolean>;
	notifStatus: boolean
	constructor(public uiService: UIService, public authService: AuthService, public notService: NotificationsService) {
		this.menuToggle = new BehaviorSubject(false)

	}

	ngOnInit() {
		this.notService.notif.subscribe(notifStatus => this.notifStatus = notifStatus)
	}

	toggleSettings() {
		this._settings = this._settings.pipe(map(b => !b));
	}
	toggleMenu() {
		this.menuToggle.next(!this.menuToggle.value)
	}

}
