
import {
    SeatLayout,
    SeatLayoutRegistry,
    PromoRegistry,
    PromoTemplate
} from '../../src/seat/SeatLayout';
import { StudioType } from '../../src/models/Cinema';
import { SeatStatus } from '../../src/models/Seat';

describe('Prototype Pattern - Cloning', () => {

    beforeAll(() => {
        SeatLayoutRegistry.initializeDefaults();
        PromoRegistry.initializeDefaults();
    });

    test('should clone SeatLayout correctly', () => {
        const layout = SeatLayoutRegistry.getClone('REGULAR_STANDARD');
        expect(layout).toBeDefined();

        if (layout) {
            expect(layout.getId()).not.toBe('LAYOUT-REG-STD');
            expect(layout.getName()).toContain('Copy');
            expect(layout.getSeats().length).toBeGreaterThan(0);
        }
    });

    test('should clone independently (modifying clone does not affect original)', () => {
        const original = SeatLayoutRegistry.getClone('VIP_STANDARD');
        const clone = original?.clone();

        if (original && clone) {
            // Select seat in clone
            const seat = clone.getSeat('A1');
            if (seat) {
                // Not typed, but modify status if possible
                // seat.status = SeatStatus.SELECTED; 
                // Wait, need to cast or access public prop
                // Actually SeatImpl has status public. But Seat interface might differ slightly.
                // Assuming SeatImpl is used.
                Object.assign(seat, { status: SeatStatus.SELECTED });

                const originalSeat = original.getSeat('A1');
                expect(originalSeat?.status).toBe(SeatStatus.AVAILABLE);
            }
        }
    });

    test('should clone PromoTemplate correctly', () => {
        const promo = PromoRegistry.getClone('WEEKEND');
        expect(promo).toBeDefined();

        if (promo) {
            expect(promo.getName()).toContain('Weekend Special');
            expect(promo.getDiscountPercentage()).toBe(15);
        }
    });

    test('should support modifying cloned layout name', () => {
        const layout = SeatLayoutRegistry.getClone('IMAX_STANDARD');
        if (layout) {
            const newName = 'Custom IMAX Layout';
            layout.setName(newName);
            expect(layout.getName()).toBe(newName);
        }
    });
});
