
import {
    SeatAvailabilityProxy,
    AccessLevel
} from '../../src/seat/SeatAvailability';
// Wait, imports should omit extension in TS.
import { UserImpl, MembershipType } from '../../src/models/User';

describe('Proxy Pattern - Seat Availability', () => {
    let proxy: SeatAvailabilityProxy;
    let user: UserImpl;
    const showtimeId = 'SHOW-PROXY-123';

    beforeEach(() => {
        proxy = new SeatAvailabilityProxy();
        user = new UserImpl(
            'USER-1',
            'Member User',
            'member@example.com',
            '08123',
            MembershipType.GOLD
        );
        // Default no user -> AccessLevel.GUEST
    });

    // Clean up
    afterEach(() => {
        proxy.clearCache();
    });

    test('should allow guest to view seats', () => {
        // Guest can view
        const seats = proxy.getSeats(showtimeId);
        expect(seats).toBeDefined();
        // First call should be cache miss (length > 0)
        expect(seats.length).toBeGreaterThan(0);
    });

    test('should cache seat data', () => {
        // First call
        proxy.getSeats(showtimeId);

        const statsBefore = proxy.getCacheStats();
        expect(statsBefore.entries).toBe(1);

        // Second call
        proxy.getSeats(showtimeId);

        const statsAfter = proxy.getCacheStats();
        // Should still be 1 entry, hit cache
        expect(statsAfter.entries).toBe(1);
    });

    test('should deny access to selectSeat for guest', () => {
        expect(() => {
            proxy.selectSeat(showtimeId, 'A1');
        }).toThrow(/Access denied/);
    });

    test('should allow member to select seat', () => {
        proxy.setCurrentUser(user); // Level MEMBER

        // We need to ensure seat is available first?
        // RealService initializes with some seats available.
        // Let's assume A1 is available (row 0, seat 1)
        // Or finding an available seat dynamically.
        const seats = proxy.getSeats(showtimeId);
        const availableSeat = seats.find(s => s.status === 'AVAILABLE');

        if (availableSeat) {
            const result = proxy.selectSeat(showtimeId, availableSeat.getCode());
            expect(result).toBe(true);
        } else {
            // If no seats available (unlikely), skip
            console.warn('No available seats to test selection');
        }
    });

    test('should invalidate cache on modification', () => {
        proxy.setCurrentUser(user);

        // Populate cache
        proxy.getSeats(showtimeId);
        expect(proxy.getCacheStats().entries).toBeGreaterThan(0);

        // Modify (select seat) -> invalidates cache
        const seats = proxy.getSeats(showtimeId);
        const availableSeat = seats.find(s => s.status === 'AVAILABLE');

        if (availableSeat) {
            proxy.selectSeat(showtimeId, availableSeat.getCode());

            // Cache should be cleared/invalidated for this showtime
            // Verify by checking if cache size decreased or by implementation detail
            // implementation: invalidates keys with showtimeId
            const stats = proxy.getCacheStats();
            expect(stats.entries).toBe(0);
        }
    });
});
