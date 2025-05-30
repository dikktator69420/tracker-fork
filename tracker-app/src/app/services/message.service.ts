// src/app/services/message.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages: string[] = [];

  constructor() {
    // Load messages from sessionStorage on initialization
    const storedMessages = sessionStorage.getItem('messages');
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
    }
  }

  add(message: string): void {
    this.messages.push(message);
    // Persist to sessionStorage
    this.updateStorage();
  }

  clear(): void {
    this.messages = [];
    // Update sessionStorage
    this.updateStorage();
  }

  getMessages(): string[] {
    return this.messages;
  }

  private updateStorage(): void {
    sessionStorage.setItem('messages', JSON.stringify(this.messages));
  }
}
