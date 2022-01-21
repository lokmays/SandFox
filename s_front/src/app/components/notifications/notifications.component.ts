import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
import { IAlarm, AlarmService } from 'src/app/services/alarm.service';
import { NotificationsService } from 'src/app/services/notifications.service';

export interface INotification {
  seen: boolean;
  user_id: string;
  alarm: IAlarm;
  createdAt: Date;
  buildingName: String;
  value: number;
  seuil: string;
  level: string;
}
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: BehaviorSubject<INotification[]>
  popupHidden: BehaviorSubject<boolean> = new BehaviorSubject(true);
  popupAlarm: BehaviorSubject<IAlarm | null> = new BehaviorSubject(null);
  icon: string
  notifStatus: boolean
  notifShowSeen: boolean
  notifAlt: INotification[]

  constructor(private authService: AuthService,
    private alertMessagesService: AlertMessagesService,
    private alarmService: AlarmService,
    private notService: NotificationsService
  ) {
    this.notifications = new BehaviorSubject([])
    this.icon = "↓"
    this.notifShowSeen = false
  }
  private checkSeuil(n: number, a:IAlarm){
  }
  ngOnInit() {
    this.notService.notif.subscribe(notifStatus => this.notifStatus = notifStatus)
    this.notService.changeNotifStatus(false)
    this.authService.get<INotification[]>("/api/notifications").subscribe(notsList => {
      for (let i = 0; i < notsList.length; i++) {
        const n = notsList[i];
        const a = n.alarm
        if (!n.seen) this.notService.changeNotifStatus(true)
        if(a.high_level.seuil_max != null && n.value>a.high_level.seuil_max){
          n.level = "danger"
          n.seuil = "Seuil max"
        } else if(a.high_level.seuil_min != null && n.value<a.high_level.seuil_min ){
          n.level = "danger"
          n.seuil = "Seuil min"
        }if(a.avg_level.seuil_max != null && n.value>a.avg_level.seuil_max){
          n.level = "warning"
          n.seuil = "Seuil max"
        } else if(a.avg_level.seuil_min != null && n.value<a.avg_level.seuil_min ){
          n.level = "warning"
          n.seuil = "Seuil min"
        }if(a.low_level.seuil_max != null && n.value>a.low_level.seuil_max){
          n.level = "success"
          n.seuil = "Seuil max"
        } else if(a.low_level.seuil_min != null && n.value<a.low_level.seuil_min ){
          n.level = "success"
          n.seuil = "Seuil min"
        }
      }
      this.notifications.next(notsList)
      this.onClickSortD()
    }, () => {
      this.alertMessagesService.pushErrorMessage('Echec de récuperation de la liste des notifications')
    })
  }
  public togglePopup() {
    this.popupHidden.next(!this.popupHidden.value);
  }
  // cancel the popup
  public onCancel(): void {
    this.popupAlarm.next(this.alarmService.emptyAlarm);
    this.togglePopup();
  }
  // Click on an alarm from the list --> show the popup
  public async onClick(notification: INotification) {
    let alarm = notification.alarm;
    this.popupAlarm.next(alarm);
    this.popupHidden.next(false);
    if (!notification.seen) {
      notification.seen = true
      const res = await this.authService.put('/api/notification', notification).toPromise();
    }
    this.notService.changeNotifStatus(this.notifications.value.some(n => !n.seen))
  }
  onPopupBackClick(event) {
    if (event.target.id && event.target.id === "background") {
      this.togglePopup();
    }
  }

  /**
   * Sorts by alarm level
   */
  public onClickSortW() {
    let notsList = this.notifications.value
    notsList.sort((a, b) => {
      if (a.level == "danger") return -1
      else if (b.level == "danger") return 1
      if (a.level == "warning") return -1
      else if (b.level == "warning") return 1
      else return -1
    })
    this.notifications.next(notsList)
  }
  public onClickSortD() {
    let notsList = this.notifications.value
    notsList.sort((a, b) => {
      if (a.createdAt > b.createdAt) return -1
      return 1
    })
    this.notifications.next(notsList)
  }

  public onClickToggleS() {
    //this.notificationsSort = this.notifications.value
    if (!this.notifShowSeen) {
      this.notifAlt = this.notifications.value
      this.notifications.next(this.notifications.value.filter(n => !n.seen))
    }
    else {
      this.notifications.next(this.notifAlt)
    }
    this.notifShowSeen = !this.notifShowSeen
  }
  /*public iconChange(num: number) {
    if (this.icon[num] == "↓") this.icon[num] = "↑"
    else this.icon[num] = "↓"
  }*/
}
