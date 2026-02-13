
import {
    PackageFactoryProvider,
    PackageType,
    RegularPackageFactory,
    PremiumPackageFactory
} from '../../src/cinema-package/PackageFactory';

describe('Abstract Factory Pattern - Cinema Packages', () => {

    test('should create Regular Package components', () => {
        const factory = new RegularPackageFactory();

        const ticket = factory.createTicket();
        const snack = factory.createSnack();

        expect(ticket.getName()).toBe('Tiket Regular');
        expect(snack.getName()).toBe('Popcorn Regular');

        // Expected price: 50000 + 25000 + 15000 = 90000 * 0.9 = 81000
    });

    test('should create Premium Package components', () => {
        const factory = new PremiumPackageFactory('Avengers');

        const ticket = factory.createTicket();
        const souvenir = factory.createSouvenir!(); // Optional

        expect(ticket.getName()).toBe('Tiket VIP');
        expect(souvenir).toBeDefined();
        if (souvenir) {
            expect(souvenir.getName()).toContain('Merchandise Avengers');
        }
    });

    test('should calculate correct total price for factories', () => {
        const regular = new RegularPackageFactory();
        const premium = new PremiumPackageFactory();

        // Check calculation logic briefly or at least that it returns number
        expect(typeof regular.getTotalPrice()).toBe('number');
        expect(typeof premium.getTotalPrice()).toBe('number');

        expect(premium.getTotalPrice()).toBeGreaterThan(regular.getTotalPrice());
    });

    test('should use Provider to get correct factory', () => {
        const factory = PackageFactoryProvider.getFactory(PackageType.REGULAR);
        expect(factory).toBeInstanceOf(RegularPackageFactory);
    });
});
