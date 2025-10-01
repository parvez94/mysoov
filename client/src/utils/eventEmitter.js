class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }
}

// Create a global instance
export const globalEventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_ALL_READ: 'notification_all_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  MESSAGE_READ: 'message_read',
  UNREAD_COUNT_UPDATED: 'unread_count_updated',
};
