import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-loading',
	templateUrl: './loading.component.html',
	styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
	@Input() show: Observable<boolean>
	constructor() { }

	ngOnInit() {
	}

}
