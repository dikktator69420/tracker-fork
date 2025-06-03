import { TestBed } from '@angular/core/testing';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageService);

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add messages and persist to sessionStorage', () => {
    service.add('Test message 1');
    service.add('Test message 2');

    expect(service.getMessages()).toEqual(['Test message 1', 'Test message 2']);

    const storedMessages = JSON.parse(
      sessionStorage.getItem('messages') || '[]'
    );
    expect(storedMessages).toEqual(['Test message 1', 'Test message 2']);
  });

  it('should clear messages and update sessionStorage', () => {
    service.add('Test message');
    expect(service.getMessages().length).toBe(1);

    service.clear();

    expect(service.getMessages()).toEqual([]);
    expect(sessionStorage.getItem('messages')).toBe('[]');
  });

  it('should load messages from sessionStorage on init', () => {
    const existingMessages = ['Message 1', 'Message 2'];
    sessionStorage.setItem('messages', JSON.stringify(existingMessages));

    // Create new service instance to test constructor
    const newService = new MessageService();

    expect(newService.getMessages()).toEqual(existingMessages);
  });

  it('should handle empty sessionStorage gracefully', () => {
    // sessionStorage is already clear from beforeEach

    const newService = new MessageService();

    expect(newService.getMessages()).toEqual([]);
  });
});
