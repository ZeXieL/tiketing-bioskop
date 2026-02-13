
import {
    TicketFactoryProvider,
    TicketType,
    RegularTicketFactory,
    VIPTicketFactory,
    IMAXTicketFactory
} from '../../src/ticket/TicketFactory';
import { ShowtimeImpl } from '../../src/models/Showtime';
import { SeatImpl, SeatType, SeatStatus } from '../../src/models/Seat';
import { MovieImpl } from '../../src/models/Movie';
import { CinemaImpl, StudioImpl, StudioType } from '../../src/models/Cinema';

describe('Factory Method Pattern - Ticket System', () => {
    let showtime: any;
    let seat: SeatImpl;

    beforeEach(() => {
        // Setup mock data
        const movie = new MovieImpl('MOV-1', 'Test Movie', 'Action', 120, 'PG-13', 'Desc', 'poster.jpg', new Date());
        const cinema = new CinemaImpl('CIN-1', 'Test Cinema', 'Loc', 'Addr', 'City');
        const studio = new StudioImpl('STD-1', 'Studio 1', StudioType.REGULAR, 100, 10, 10);

        showtime = new ShowtimeImpl(
            'SHW-1',
            movie,
            cinema,
            studio,
            new Date(),
            '10:00',
            '12:00',
            50000
        );

        seat = new SeatImpl('SEAT-1', 'A', 1, SeatType.REGULAR, SeatStatus.AVAILABLE, 50000);
    });

    test('should create Regular Ticket using factory', () => {
        const factory = new RegularTicketFactory();
        const ticket = factory.createTicket(showtime, seat);

        expect(ticket.type).toBe(TicketType.REGULAR);
        expect(ticket.getPrice()).toBe(50000); // Base price
        expect(ticket.getDescription()).toContain('Tiket Regular');
    });

    test('should create VIP Ticket using factory', () => {
        const factory = new VIPTicketFactory();
        const ticket = factory.createTicket(showtime, seat);

        expect(ticket.type).toBe(TicketType.VIP);
        expect(ticket.getPrice()).toBe(75000); // 1.5x multiplier
        expect(ticket.getDescription()).toContain('Tiket VIP');
    });

    test('should create IMAX Ticket using factory', () => {
        const factory = new IMAXTicketFactory();
        const ticket = factory.createTicket(showtime, seat);

        expect(ticket.type).toBe(TicketType.IMAX);
        expect(ticket.getPrice()).toBe(100000); // 2.0x multiplier
        expect(ticket.getDescription()).toContain('Tiket IMAX');
    });

    test('should use Provider to get correct factory', () => {
        const factory = TicketFactoryProvider.getFactory(TicketType.REGULAR);
        expect(factory).toBeInstanceOf(RegularTicketFactory);

        const ticket = factory.createTicket(showtime, seat);
        expect(ticket.type).toBe(TicketType.REGULAR);
    });
});
