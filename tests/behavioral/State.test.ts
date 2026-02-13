
import {
    BookingContext,
    DraftState,
    PendingState,
    PaidState,
    ConfirmedState,
    CancelledState
} from '../../src/booking/BookingStatus';

describe('State Pattern - Booking Lifecycle', () => {
    let context: BookingContext;

    beforeEach(() => {
        context = new BookingContext('John Doe', 'Avatar 2');
    });

    test('should start in DraftState', () => {
        expect(context.getStateName()).toBe('Draft');
        expect(context.getState()).toBeInstanceOf(DraftState);
    });

    test('should transition Draft -> Pending when proceeding to payment', () => {
        // Need to add seats first
        context.addSeat('A1', 50000);
        context.proceedToPayment(); // Should transition

        expect(context.getStateName()).toBe('Pending');
        expect(context.getState()).toBeInstanceOf(PendingState);
    });

    test('should transition Pending -> Paid when paying sufficient amount', () => {
        context.addSeat('A1', 50000);
        context.proceedToPayment(); // Pending

        // Insufficient
        context.pay(40000);
        expect(context.getStateName()).toBe('Pending');

        // Sufficient
        context.pay(50000);
        expect(context.getStateName()).toBe('Paid');
        expect(context.getState()).toBeInstanceOf(PaidState);
    });

    test('should transition Paid -> Confirmed when confirming', () => {
        context.addSeat('A1', 50000);
        context.proceedToPayment();
        context.pay(50000);
        context.confirm();

        expect(context.getStateName()).toBe('Confirmed');
        expect(context.getState()).toBeInstanceOf(ConfirmedState);
    });

    test('should support cancellation from Draft/Pending', () => {
        // Draft cancel
        context.cancel();
        expect(context.getStateName()).toBe('Cancelled');

        // Reset
        context = new BookingContext('Jane Doe', 'Titanic');
        context.addSeat('B2', 40000);
        context.proceedToPayment(); // Pending

        context.cancel(); // Cancel pending
        expect(context.getStateName()).toBe('Cancelled');
    });

    test('should NOT allow modification in Paid/Confirmed states', () => {
        context.addSeat('A1', 50000);
        context.proceedToPayment();
        context.pay(50000); // Paid state

        // Try adding seat
        const previousTotal = context.getTotalAmount();
        context.addSeat('A2', 50000);

        expect(context.getTotalAmount()).toBe(previousTotal);
    });
});
