// Abstract Product: PackageTicket
// Interface untuk tiket dalam paket
export interface PackageTicket {
    getName(): string;
    getPrice(): number;
    getDescription(): string;
}

// Abstract Product: Snack
// Interface untuk snack dalam paket
export interface Snack {
    getName(): string;
    getPrice(): number;
    getSize(): string;
    getCalories(): number;
}

// Abstract Product: Drink
// Interface untuk minuman dalam paket
export interface Drink {
    getName(): string;
    getPrice(): number;
    getSize(): string;
    getVolume(): number; // dalam ml
}

// Abstract Product: Souvenir (khusus paket premium)
export interface Souvenir {
    getName(): string;
    getPrice(): number;
    getDescription(): string;
}

// =============================================================================
// CONCRETE PRODUCTS - REGULAR PACKAGE
// =============================================================================

// Concrete Product: RegularPackageTicket
export class RegularPackageTicket implements PackageTicket {
    getName(): string {
        return 'Tiket Regular';
    }

    getPrice(): number {
        return 50000;
    }

    getDescription(): string {
        return 'Tiket bioskop kursi standar';
    }
}

// Concrete Product: PopcornRegular
export class PopcornRegular implements Snack {
    getName(): string {
        return 'Popcorn Regular';
    }

    getPrice(): number {
        return 25000;
    }

    getSize(): string {
        return 'Regular (45g)';
    }

    getCalories(): number {
        return 250;
    }
}

// Concrete Product: SodaRegular
export class SodaRegular implements Drink {
    getName(): string {
        return 'Coca-Cola Regular';
    }

    getPrice(): number {
        return 15000;
    }

    getSize(): string {
        return 'Regular';
    }

    getVolume(): number {
        return 400;
    }
}

// =============================================================================
// CONCRETE PRODUCTS - PREMIUM PACKAGE
// =============================================================================

// Concrete Product: VIPPackageTicket
export class VIPPackageTicket implements PackageTicket {
    getName(): string {
        return 'Tiket VIP';
    }

    getPrice(): number {
        return 100000;
    }

    getDescription(): string {
        return 'Tiket bioskop kursi premium dengan legrest';
    }
}

// Concrete Product: PopcornLarge
export class PopcornLarge implements Snack {
    getName(): string {
        return 'Caramel Popcorn Large';
    }

    getPrice(): number {
        return 45000;
    }

    getSize(): string {
        return 'Large (90g)';
    }

    getCalories(): number {
        return 480;
    }
}

// Concrete Product: SodaLarge
export class SodaLarge implements Drink {
    getName(): string {
        return 'Premium Soda Float';
    }

    getPrice(): number {
        return 30000;
    }

    getSize(): string {
        return 'Large';
    }

    getVolume(): number {
        return 700;
    }
}

// Concrete Product: MovieSouvenir
export class MovieSouvenir implements Souvenir {
    private movieTitle: string;

    constructor(movieTitle: string = 'Film Terbaru') {
        this.movieTitle = movieTitle;
    }

    getName(): string {
        return `Merchandise ${this.movieTitle}`;
    }

    getPrice(): number {
        return 50000;
    }

    getDescription(): string {
        return `Souvenir eksklusif film ${this.movieTitle}`;
    }
}

// =============================================================================
// ABSTRACT FACTORY
// =============================================================================

// Abstract Factory: CinemaPackageFactory
// Mendefinisikan interface untuk membuat keluarga produk paket bioskop
export interface CinemaPackageFactory {
    createTicket(): PackageTicket;
    createSnack(): Snack;
    createDrink(): Drink;
    createSouvenir?(): Souvenir; // Optional, hanya untuk paket premium
    getPackageName(): string;
    getTotalPrice(): number;
}

// Concrete Factory: RegularPackageFactory
// Membuat paket regular dengan produk-produk standar
export class RegularPackageFactory implements CinemaPackageFactory {
    createTicket(): PackageTicket {
        return new RegularPackageTicket();
    }

    createSnack(): Snack {
        return new PopcornRegular();
    }

    createDrink(): Drink {
        return new SodaRegular();
    }

    getPackageName(): string {
        return 'Paket Hemat Regular';
    }

    getTotalPrice(): number {
        const ticket = this.createTicket();
        const snack = this.createSnack();
        const drink = this.createDrink();

        // Diskon paket 10%
        const subtotal = ticket.getPrice() + snack.getPrice() + drink.getPrice();
        return Math.round(subtotal * 0.9);
    }
}

// Concrete Factory: PremiumPackageFactory
// Membuat paket premium dengan produk-produk eksklusif
export class PremiumPackageFactory implements CinemaPackageFactory {
    private movieTitle: string;

    constructor(movieTitle: string = 'Film Terbaru') {
        this.movieTitle = movieTitle;
    }

    createTicket(): PackageTicket {
        return new VIPPackageTicket();
    }

    createSnack(): Snack {
        return new PopcornLarge();
    }

    createDrink(): Drink {
        return new SodaLarge();
    }

    createSouvenir(): Souvenir {
        return new MovieSouvenir(this.movieTitle);
    }

    getPackageName(): string {
        return 'Paket Premium VIP';
    }

    getTotalPrice(): number {
        const ticket = this.createTicket();
        const snack = this.createSnack();
        const drink = this.createDrink();
        const souvenir = this.createSouvenir();

        // Diskon paket 15%
        const subtotal = ticket.getPrice() + snack.getPrice() +
            drink.getPrice() + souvenir.getPrice();
        return Math.round(subtotal * 0.85);
    }
}

// Enum untuk tipe paket
export enum PackageType {
    REGULAR = 'REGULAR',
    PREMIUM = 'PREMIUM'
}

// Class untuk mengelola dan menampilkan paket
export class CinemaPackage {
    private factory: CinemaPackageFactory;
    private ticket: PackageTicket;
    private snack: Snack;
    private drink: Drink;
    private souvenir?: Souvenir;

    constructor(factory: CinemaPackageFactory) {
        this.factory = factory;
        this.ticket = factory.createTicket();
        this.snack = factory.createSnack();
        this.drink = factory.createDrink();

        // Cek apakah factory mendukung souvenir
        if (factory.createSouvenir) {
            this.souvenir = factory.createSouvenir();
        }
    }

    // Menampilkan detail paket lengkap
    displayPackage(): string {
        let output = `
╔══════════════════════════════════════════════════════════════╗
║                    ${this.factory.getPackageName().padEnd(41)}║
╠══════════════════════════════════════════════════════════════╣
║ TIKET                                                        ║
║   ${this.ticket.getName().padEnd(57)}║
║   ${this.ticket.getDescription().padEnd(57)}║
║   Harga: Rp ${this.ticket.getPrice().toLocaleString('id-ID').padEnd(47)}║
╠══════════════════════════════════════════════════════════════╣
║ SNACK                                                        ║
║   ${this.snack.getName().padEnd(57)}║
║   Ukuran: ${this.snack.getSize().padEnd(49)}║
║   Kalori: ${this.snack.getCalories().toString().padEnd(49)}cal║
║   Harga: Rp ${this.snack.getPrice().toLocaleString('id-ID').padEnd(47)}║
╠══════════════════════════════════════════════════════════════╣
║ MINUMAN                                                      ║
║   ${this.drink.getName().padEnd(57)}║
║   Ukuran: ${this.drink.getSize()} (${this.drink.getVolume()}ml)${' '.repeat(35)}║
║   Harga: Rp ${this.drink.getPrice().toLocaleString('id-ID').padEnd(47)}║`;

        if (this.souvenir) {
            output += `
╠══════════════════════════════════════════════════════════════╣
║ SOUVENIR                                                     ║
║   ${this.souvenir.getName().padEnd(57)}║
║   ${this.souvenir.getDescription().padEnd(57)}║
║   Harga: Rp ${this.souvenir.getPrice().toLocaleString('id-ID').padEnd(47)}║`;
        }

        output += `
╠══════════════════════════════════════════════════════════════╣
║ TOTAL PAKET: Rp ${this.factory.getTotalPrice().toLocaleString('id-ID').padEnd(43)}║
╚══════════════════════════════════════════════════════════════╝`;

        return output;
    }

    getTicket(): PackageTicket {
        return this.ticket;
    }

    getSnack(): Snack {
        return this.snack;
    }

    getDrink(): Drink {
        return this.drink;
    }

    getSouvenir(): Souvenir | undefined {
        return this.souvenir;
    }

    getTotalPrice(): number {
        return this.factory.getTotalPrice();
    }
}

// Provider untuk mendapatkan factory berdasarkan tipe paket
export class PackageFactoryProvider {
    static getFactory(type: PackageType, movieTitle?: string): CinemaPackageFactory {
        switch (type) {
            case PackageType.REGULAR:
                return new RegularPackageFactory();
            case PackageType.PREMIUM:
                return new PremiumPackageFactory(movieTitle);
            default:
                throw new Error(`Tipe paket ${type} tidak dikenal`);
        }
    }
}
