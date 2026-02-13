
import {
    BookingNotifier,
    EmailNotificationObserver,
    SMSNotificationObserver,
    InventoryObserver,
    AnalyticsObserver,
    BookingEvent,
    BookingEventType
} from '../../src/notification/NotificationService';

describe('Observer Pattern - Notification System', () => {
    let notifier: BookingNotifier;
    let event: BookingEvent;

    beforeEach(() => {
        notifier = new BookingNotifier();

        event = {
            eventType: BookingEventType.BOOKING_CREATED,
            bookingId: 'BKG-12345',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '08123456789',
            movieTitle: 'Spider-Man',
            cinemaName: 'XXI',
            showtime: '19:00',
            seats: ['A1', 'A2'],
            totalAmount: 100000,
            timestamp: new Date()
        };
    });

    test('should attach and notify email observer', () => {
        const observer = new EmailNotificationObserver();
        const spy = jest.spyOn(observer, 'update');

        notifier.attach(observer);
        notifier.notify(event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    test('should NOT notify if observer not subscribed', () => {
        const observer = new SMSNotificationObserver();
        const spy = jest.spyOn(observer, 'update');

        notifier.attach(observer);

        // SMS only subscribes to specific events (like PAYMENT_SUCCESS)
        // BOOKING_CREATED should not trigger SMS
        notifier.notify(event);

        expect(spy).not.toHaveBeenCalled();
    });

    test('should handle multiple observers reacting to same event', () => {
        const email = new EmailNotificationObserver();
        const analytics = new AnalyticsObserver();

        const spyEmail = jest.spyOn(email, 'update');
        const spyAnalytics = jest.spyOn(analytics, 'update');

        notifier.attach(email);
        notifier.attach(analytics);

        notifier.notify(event);

        expect(spyEmail).toHaveBeenCalled(); // Email subscribes to CREATED
        expect(spyAnalytics).toHaveBeenCalled(); // Analytics subscribes to ALL
    });

    test('should detach observer correctly', () => {
        const observer = new EmailNotificationObserver();
        const spy = jest.spyOn(observer, 'update');

        notifier.attach(observer);
        notifier.detach(observer);

        notifier.notify(event);

        expect(spy).not.toHaveBeenCalled();
    });

    test('should log events internally', () => {
        const observer = new AnalyticsObserver();
        notifier.attach(observer);

        notifier.notify(event);

        const logs = notifier.getEventLog();
        expect(logs.length).toBe(1);
        expect(logs[0].bookingId).toBe('BKG-12345');
    });
});
