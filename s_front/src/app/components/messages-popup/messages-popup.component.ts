import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AlertMessagesService, IMessage } from 'src/app/services/alert-messages.service';
import { DataManagerService } from 'src/app/services/data-manager.service';

@Component({
  selector: 'app-messages-popup',
  templateUrl: './messages-popup.component.html',
  styleUrls: ['./messages-popup.component.scss']
})
export class MessagesPopupComponent implements OnInit {
  public errorMessages: BehaviorSubject<IMessage[]> =
    new BehaviorSubject([]);
  private errorMessagesTimer;
  public successMessages: BehaviorSubject<IMessage[]> =
    new BehaviorSubject([]);
  private successMessagesTimer;
  constructor(private alertMessagesService: AlertMessagesService, public dataManagerService: DataManagerService) {
    this.errorMessagesManager();
    this.successMessagesManager();
  }
  ngOnInit() {
  }
  errorMessagesManager() {
    this.alertMessagesService._errorMessage.subscribe(newMessage => {
      if (newMessage) {
        if (this.errorMessagesTimer) {
          clearTimeout(this.errorMessagesTimer);
        }
        this.errorMessagesTimer = setTimeout(() => this.resetMessages(this.errorMessages), 5000);
        const messages = this.errorMessages.value;
        messages.push(newMessage);
        this.errorMessages.next(messages);
      }
    });
  }
  successMessagesManager() {
    this.alertMessagesService._successMessage.subscribe(newMessage => {
      if (newMessage) {
        if (this.successMessagesTimer) {
          clearTimeout(this.successMessagesTimer);
        }
        this.successMessagesTimer = setTimeout(() => this.resetMessages(this.successMessages), 5000);
        const messages = this.successMessages.value;
        messages.push(newMessage);
        this.successMessages.next(messages);
      }
    });
  }
  resetMessages(messages: BehaviorSubject<IMessage[]>) {
    messages.next([]);
  }
}
