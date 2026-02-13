
import {
    CinemaBookingService,
    BookingResult
} from '../../src/services/CinemaBookingService';
import {
    User,
    UserImpl,
    MembershipType
} from '../../src/models/User';
import { TicketType } from '../../src/ticket/TicketFactory';
import { PaymentMethod } from '../../src/payment/PaymentGateway';
import { MovieImpl } from '../../src/models/Movie';
import { CinemaImpl, StudioImpl, StudioType } from '../../src/models/Cinema';
import { ShowtimeImpl } from '../../src/models/Showtime';

describe('Facade Pattern - Cinema Booking', () => {
    let service: CinemaBookingService;
    let user: User;
    let showtime: any; // Mocked Showtime
    let showtimeId = 'SHOW-123';
    let seatCodes = ['A1', 'A2'];

    beforeEach(() => {
        service = new CinemaBookingService();

        // Setup common test data
        // Mock data to match what the service expects internally if not using actual instances
        // But CinemaBookingService uses internal MovieService etc which have hardcoded data in constructor
        // We can just rely on getShowtimes from MovieService via Facade if available
        // Or create our own object passing strict checks

        user = new UserImpl(
            'USER-1',
            'Test User',
            'test@example.com',
            '08123456789',
            MembershipType.REGULAR
        );

        // We need a valid showtime object.
        // Let's create one.
        const movie = new MovieImpl(
            'MOV-001',
            'Test Movie',
            'Action',
            120,
            'PG-13',
            'Description',
            'poster.jpg',
            new Date()
        );

        const cinema = new CinemaImpl('CIN-001', 'Test Cinema', 'Jakarta', 'Jl. Test', 'Jakarta');
        const studio = new StudioImpl('STD-001', 'Studio 1', StudioType.REGULAR, 100, 10, 10);

        // Showtime should be in future
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 24);

        // Fix ShowtimeImpl constructor (8 args)
        showtime = new ShowtimeImpl(
            showtimeId,
            movie,
            cinema,
            studio,
            futureDate,
            '20:00',
            '22:00', // endTime
            50000
        );

        // We might need to inject this showtime into the internal MovieService?
        // But CinemaBookingService initializes its own MovieService with hardcoded data.
        // And completeBooking takes showtime as argument.
        // So we can just pass our custom showtime object.
        // However, SeatService inside Facade might need initialization.
        // completeBooking calls seatService.initializeSeatLayout(showtimeId, ...)
        // So passing a new showtimeId works fine.
    });

    // Mock console.log to keep output clean
    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // We can't use restoreMockImpl here, it's restoreAllMocks usually or just spy.mockRestore()
    // Let's use simple spy

    test('should complete booking successfully', () => {
        const result = service.completeBooking(
            user,
            showtimeId,
            showtime,
            seatCodes,
            TicketType.REGULAR,
            PaymentMethod.GOPAY
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain('Booking berhasil');
        expect(result.booking).toBeDefined();
        expect(result.booking?.tickets.length).toBe(2);
        expect(result.paymentResult?.status).toBe('SUCCESS');
    });

    test('should fail booking if seats are unavailable (already booked)', () => {
        // Book same seats first
        service.completeBooking(
            user,
            showtimeId,
            showtime,
            seatCodes,
            TicketType.REGULAR,
            PaymentMethod.GOPAY
        );

        // Try booking again
        const result = service.completeBooking(
            user,
            showtimeId,
            showtime,
            seatCodes,
            TicketType.REGULAR,
            PaymentMethod.GOPAY
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('tidak tersedia');
    });

    test('should search movies', () => {
        const movies = service.searchMovies('Avengers');
        // Based on hardcoded data in MovieService
        expect(movies.length).toBeGreaterThan(0);
        expect(movies[0].title).toContain('Avengers');
    });
});
