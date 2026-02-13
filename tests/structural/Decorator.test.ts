
import {
    BasicTicket,
    SnackComboDecorator,
    InsuranceDecorator,
    ParkingDecorator,
    SnackSize,
    ParkingType,
    TicketWithAddonsBuilder,
    SouvenirDecorator,
    SouvenirType,
    PremiumSeatDecorator,
    TicketComponent
} from '../../src/ticket/TicketAddons';

describe('Decorator Pattern - Ticket Addons', () => {
    let ticket: TicketComponent;
    const basePrice = 50000;
    const movieTitle = 'Avengers';
    const showtime = '20:00';
    const seatCode = 'A1';

    beforeEach(() => {
        ticket = new BasicTicket(movieTitle, showtime, seatCode, basePrice);
    });

    test('should calculate base price correctly', () => {
        expect(ticket.getPrice()).toBe(basePrice);
        expect(ticket.getDescription()).toContain('Tiket Avengers');
    });

    test('should add snack combo price', () => {
        const combo = new SnackComboDecorator(ticket, SnackSize.REGULAR);
        const expectedPrice = basePrice + 35000;
        expect(combo.getPrice()).toBe(expectedPrice);
        expect(combo.getDescription()).toContain('Snack Combo (REGULAR)');
    });

    test('should add insurance price', () => {
        const insured = new InsuranceDecorator(ticket);
        // Insurance is 5% of base price, min 5000, max 25000
        // 5% of 50000 = 2500 < 5000, so min applies
        const expectedPrice = basePrice + 5000;
        expect(insured.getPrice()).toBe(expectedPrice);
        expect(insured.getDescription()).toContain('Asuransi Tiket');
    });

    test('should handle multiple decorators', () => {
        // Use Builder for easier chaining
        const builtTicket = new TicketWithAddonsBuilder(movieTitle, showtime, seatCode, basePrice)
            .addSnackCombo(SnackSize.LARGE) // +65000
            .addParking(ParkingType.CAR, 2) // +15000
            .upgradeToPremiumSeat() // +50000
            .build();

        const expected = basePrice + 65000 + 15000 + 50000;
        expect(builtTicket.getPrice()).toBe(expected);
        expect(builtTicket.getDescription()).toContain('Snack Combo (LARGE)');
        expect(builtTicket.getDescription()).toContain('Voucher Parkir Mobil');
        expect(builtTicket.getDescription()).toContain('[PREMIUM SEAT]');
    });

    test('should add souvenir price', () => {
        const souvenir = new SouvenirDecorator(ticket, SouvenirType.KEYCHAIN);
        const expectedPrice = basePrice + 25000;
        expect(souvenir.getPrice()).toBe(expectedPrice);
        expect(souvenir.getDescription()).toContain('Gantungan Kunci Eksklusif');
    });
});
