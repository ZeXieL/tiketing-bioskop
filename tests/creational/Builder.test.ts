
import {
    BookingBuilder,
    ConcreteBookingBuilder,
    BookingDirector
} from '../../src/booking/BookingBuilder';
import { UserImpl, MembershipType } from '../../src/models/User';
import { ShowtimeImpl } from '../../src/models/Showtime';
import { SeatImpl, SeatType, SeatStatus } from '../../src/models/Seat';
import { MovieImpl } from '../../src/models/Movie';
import { CinemaImpl, StudioImpl, StudioType } from '../../src/models/Cinema';
import { TicketType } from '../../src/ticket/TicketFactory';

describe('Builder Pattern - Booking Construction', () => {
    let user: UserImpl;
    let showtime: any;
    let seat: SeatImpl;

    beforeEach(() => {
        user = new UserImpl('USR-1', 'John', 'john@example.com', '081', MembershipType.REGULAR);
        const movie = new MovieImpl('MOV-1', 'Test Movie', 'Action', 120, 'PG-13', 'Desc', 'poster.jpg', new Date());
        const cinema = new CinemaImpl('CIN-1', 'Test Cinema', 'Loc', 'Addr', 'City');
        const studio = new StudioImpl('STD-1', 'Studio 1', StudioType.REGULAR, 100, 10, 10);
        showtime = new ShowtimeImpl('SHW-1', movie, cinema, studio, new Date(), '10:00', '12:00', 50000);
        seat = new SeatImpl('SEAT-1', 'A', 1, SeatType.REGULAR, SeatStatus.AVAILABLE, 50000);
    });

    test('should build basic booking using Builder', () => {
        const builder = new ConcreteBookingBuilder();

        const booking = builder
            .reset()
            .setUser(user)
            .setShowtime(showtime)
            .addSeat(seat, TicketType.REGULAR)
            .build();

        expect(booking.user?.id).toBe('USR-1');
        expect(booking.tickets.length).toBe(1);
        expect(booking.tickets[0].type).toBe(TicketType.REGULAR);
    });

    test('should construct detailed booking using Director', () => {
        const builder = new ConcreteBookingBuilder();
        const director = new BookingDirector(builder);

        const booking = director.buildVIPBooking(user, showtime, seat);

        expect(booking.tickets[0].type).toBe(TicketType.VIP);
        expect(booking.insuranceIncluded).toBe(true);
    });

    test('should add addons correctly', () => {
        const builder = new ConcreteBookingBuilder();
        const booking = builder
            .reset()
            .setUser(user)
            .setShowtime(showtime)
            .addSeat(seat, TicketType.REGULAR)
            .addAddon('Popcorn', 20000, 1)
            .build();

        expect(booking.addons.length).toBe(1);
        expect(booking.getAddonsSubtotal()).toBe(20000);
    });

    test('should fail if user or showtime not set', () => {
        const builder = new ConcreteBookingBuilder();
        expect(() => {
            builder.build();
        }).toThrow();
    });
});
