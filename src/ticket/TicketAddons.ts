
export interface TicketComponent {
    getDescription(): string;
    getPrice(): number;
    getDetails(): TicketDetails;
}

// Detail tiket untuk tampilan
export interface TicketDetails {
    baseDescription: string;
    addons: AddonDetail[];
    basePrice: number;
    totalPrice: number;
}

export interface AddonDetail {
    name: string;
    price: number;
    description: string;
}

// CONCRETE COMPONENT
// Tiket dasar tanpa dekorasi
export class BasicTicket implements TicketComponent {
    private movieTitle: string;
    private showtime: string;
    private seatCode: string;
    private basePrice: number;

    constructor(
        movieTitle: string,
        showtime: string,
        seatCode: string,
        basePrice: number
    ) {
        this.movieTitle = movieTitle;
        this.showtime = showtime;
        this.seatCode = seatCode;
        this.basePrice = basePrice;
    }

    getDescription(): string {
        return `Tiket ${this.movieTitle} - ${this.showtime} - Kursi ${this.seatCode}`;
    }

    getPrice(): number {
        return this.basePrice;
    }

    getDetails(): TicketDetails {
        return {
            baseDescription: this.getDescription(),
            addons: [],
            basePrice: this.basePrice,
            totalPrice: this.basePrice
        };
    }
}

// ABSTRACT DECORATOR
// Base decorator yang mengimplementasikan interface component dan menyimpan reference ke wrapped component
export abstract class TicketDecorator implements TicketComponent {
    protected wrappedTicket: TicketComponent;

    constructor(ticket: TicketComponent) {
        this.wrappedTicket = ticket;
    }

    // Delegasi ke wrapped component
    getDescription(): string {
        return this.wrappedTicket.getDescription();
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice();
    }

    getDetails(): TicketDetails {
        return this.wrappedTicket.getDetails();
    }

    // Helper untuk menambahkan addon ke details
    protected addAddonToDetails(
        details: TicketDetails,
        addon: AddonDetail
    ): TicketDetails {
        return {
            ...details,
            addons: [...details.addons, addon],
            totalPrice: details.totalPrice + addon.price
        };
    }
}

// CONCRETE DECORATOR 1: SnackComboDecorator
// Menambahkan paket snack (popcorn + minuman) ke tiket
export enum SnackSize {
    REGULAR = 'REGULAR',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE'
}

export class SnackComboDecorator extends TicketDecorator {
    private size: SnackSize;
    private prices: Record<SnackSize, number> = {
        [SnackSize.REGULAR]: 35000,
        [SnackSize.MEDIUM]: 50000,
        [SnackSize.LARGE]: 65000
    };

    constructor(ticket: TicketComponent, size: SnackSize = SnackSize.REGULAR) {
        super(ticket);
        this.size = size;
    }

    getDescription(): string {
        return `${this.wrappedTicket.getDescription()} + Snack Combo (${this.size})`;
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice() + this.prices[this.size];
    }

    getDetails(): TicketDetails {
        const details = this.wrappedTicket.getDetails();
        return this.addAddonToDetails(details, {
            name: `Snack Combo ${this.size}`,
            price: this.prices[this.size],
            description: this.getComboContents()
        });
    }

    private getComboContents(): string {
        switch (this.size) {
            case SnackSize.REGULAR:
                return 'Popcorn Regular + Coca-Cola Regular';
            case SnackSize.MEDIUM:
                return 'Popcorn Medium + Coca-Cola Medium + Nachos';
            case SnackSize.LARGE:
                return 'Popcorn Large + 2x Coca-Cola Large + Nachos + Hotdog';
        }
    }
}

// CONCRETE DECORATOR 2: InsuranceDecorator
// Menambahkan asuransi tiket (refund jika tidak jadi menonton)
export class InsuranceDecorator extends TicketDecorator {
    private static readonly INSURANCE_RATE = 0.05; // 5% dari harga tiket
    private static readonly MIN_INSURANCE = 5000;
    private static readonly MAX_INSURANCE = 25000;

    constructor(ticket: TicketComponent) {
        super(ticket);
    }

    getDescription(): string {
        return `${this.wrappedTicket.getDescription()} + Asuransi Tiket`;
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice() + this.getInsurancePrice();
    }

    getDetails(): TicketDetails {
        const details = this.wrappedTicket.getDetails();
        return this.addAddonToDetails(details, {
            name: 'Asuransi Tiket',
            price: this.getInsurancePrice(),
            description: 'Refund 100% jika tidak dapat hadir (max 2 jam sebelum tayang)'
        });
    }

    private getInsurancePrice(): number {
        const basePrice = this.wrappedTicket.getDetails().basePrice;
        let insurance = Math.round(basePrice * InsuranceDecorator.INSURANCE_RATE);
        insurance = Math.max(insurance, InsuranceDecorator.MIN_INSURANCE);
        insurance = Math.min(insurance, InsuranceDecorator.MAX_INSURANCE);
        return insurance;
    }
}

// CONCRETE DECORATOR 3: ParkingDecorator
// Menambahkan voucher parkir gratis
export enum ParkingType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE'
}

export class ParkingDecorator extends TicketDecorator {
    private parkingType: ParkingType;
    private duration: number; // dalam jam
    private prices: Record<ParkingType, number> = {
        [ParkingType.CAR]: 15000,
        [ParkingType.MOTORCYCLE]: 5000
    };

    constructor(
        ticket: TicketComponent,
        parkingType: ParkingType = ParkingType.CAR,
        duration: number = 4
    ) {
        super(ticket);
        this.parkingType = parkingType;
        this.duration = duration;
    }

    getDescription(): string {
        const vehicleType = this.parkingType === ParkingType.CAR ? 'Mobil' : 'Motor';
        return `${this.wrappedTicket.getDescription()} + Voucher Parkir ${vehicleType}`;
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice() + this.prices[this.parkingType];
    }

    getDetails(): TicketDetails {
        const details = this.wrappedTicket.getDetails();
        const vehicleType = this.parkingType === ParkingType.CAR ? 'Mobil' : 'Motor';
        return this.addAddonToDetails(details, {
            name: `Voucher Parkir ${vehicleType}`,
            price: this.prices[this.parkingType],
            description: `Parkir gratis ${this.duration} jam untuk ${vehicleType.toLowerCase()}`
        });
    }
}

// CONCRETE DECORATOR 4: SouvenirDecorator
// Menambahkan merchandise/souvenir film
export enum SouvenirType {
    KEYCHAIN = 'KEYCHAIN',
    POSTER = 'POSTER',
    TSHIRT = 'TSHIRT',
    FIGURINE = 'FIGURINE'
}

export class SouvenirDecorator extends TicketDecorator {
    private souvenirType: SouvenirType;
    private prices: Record<SouvenirType, number> = {
        [SouvenirType.KEYCHAIN]: 25000,
        [SouvenirType.POSTER]: 35000,
        [SouvenirType.TSHIRT]: 150000,
        [SouvenirType.FIGURINE]: 250000
    };

    constructor(ticket: TicketComponent, souvenirType: SouvenirType) {
        super(ticket);
        this.souvenirType = souvenirType;
    }

    getDescription(): string {
        return `${this.wrappedTicket.getDescription()} + ${this.getSouvenirName()}`;
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice() + this.prices[this.souvenirType];
    }

    getDetails(): TicketDetails {
        const details = this.wrappedTicket.getDetails();
        return this.addAddonToDetails(details, {
            name: this.getSouvenirName(),
            price: this.prices[this.souvenirType],
            description: this.getSouvenirDescription()
        });
    }

    private getSouvenirName(): string {
        const names: Record<SouvenirType, string> = {
            [SouvenirType.KEYCHAIN]: 'Gantungan Kunci Eksklusif',
            [SouvenirType.POSTER]: 'Poster Collector Edition',
            [SouvenirType.TSHIRT]: 'Kaos Official Merchandise',
            [SouvenirType.FIGURINE]: 'Action Figure Limited Edition'
        };
        return names[this.souvenirType];
    }

    private getSouvenirDescription(): string {
        const descriptions: Record<SouvenirType, string> = {
            [SouvenirType.KEYCHAIN]: 'Gantungan kunci akrilik karakter film',
            [SouvenirType.POSTER]: 'Poster A2 dengan tanda tangan cast',
            [SouvenirType.TSHIRT]: 'Kaos cotton combed 30s desain eksklusif',
            [SouvenirType.FIGURINE]: 'Action figure 6" dengan articulated joints'
        };
        return descriptions[this.souvenirType];
    }
}

// CONCRETE DECORATOR 5: PremiumSeatDecorator
// Upgrade kursi ke premium (recliner, blanket, etc)
export class PremiumSeatDecorator extends TicketDecorator {
    private static readonly UPGRADE_FEE = 50000;

    constructor(ticket: TicketComponent) {
        super(ticket);
    }

    getDescription(): string {
        return `${this.wrappedTicket.getDescription()} [PREMIUM SEAT]`;
    }

    getPrice(): number {
        return this.wrappedTicket.getPrice() + PremiumSeatDecorator.UPGRADE_FEE;
    }

    getDetails(): TicketDetails {
        const details = this.wrappedTicket.getDetails();
        return this.addAddonToDetails(details, {
            name: 'Premium Seat Upgrade',
            price: PremiumSeatDecorator.UPGRADE_FEE,
            description: 'Kursi recliner premium dengan selimut dan bantal'
        });
    }
}

// HELPER: Ticket Display
// Class untuk menampilkan tiket yang sudah di-decorate
export class TicketDisplay {
    static print(ticket: TicketComponent): string {
        const details = ticket.getDetails();

        let output = `
╔══════════════════════════════════════════════════════════════╗
║                     DETAIL PEMBELIAN TIKET                   ║
╠══════════════════════════════════════════════════════════════╣
║ ${details.baseDescription.padEnd(60)}║
╠══════════════════════════════════════════════════════════════╣
║ HARGA DASAR                                                  ║
║   Tiket: Rp ${details.basePrice.toLocaleString('id-ID').padEnd(48)}║`;

        if (details.addons.length > 0) {
            output += `
╠══════════════════════════════════════════════════════════════╣
║ ADD-ONS                                                      ║`;

            for (const addon of details.addons) {
                output += `
║   ${addon.name.padEnd(39)} Rp ${addon.price.toLocaleString('id-ID').padEnd(12)}║
║     └─ ${addon.description.substring(0, 50).padEnd(52)}║`;
            }
        }

        output += `
╠══════════════════════════════════════════════════════════════╣
║ TOTAL: Rp ${details.totalPrice.toLocaleString('id-ID').padEnd(50)}║
╚══════════════════════════════════════════════════════════════╝`;

        return output;
    }
}

// BUILDER HELPER: TicketWithAddonsBuilder
// Fluent builder untuk memudahkan pembuatan tiket dengan add-ons
export class TicketWithAddonsBuilder {
    private ticket: TicketComponent;

    constructor(
        movieTitle: string,
        showtime: string,
        seatCode: string,
        basePrice: number
    ) {
        this.ticket = new BasicTicket(movieTitle, showtime, seatCode, basePrice);
    }

    addSnackCombo(size: SnackSize = SnackSize.REGULAR): TicketWithAddonsBuilder {
        this.ticket = new SnackComboDecorator(this.ticket, size);
        return this;
    }

    addInsurance(): TicketWithAddonsBuilder {
        this.ticket = new InsuranceDecorator(this.ticket);
        return this;
    }

    addParking(type: ParkingType = ParkingType.CAR, duration: number = 4): TicketWithAddonsBuilder {
        this.ticket = new ParkingDecorator(this.ticket, type, duration);
        return this;
    }

    addSouvenir(type: SouvenirType): TicketWithAddonsBuilder {
        this.ticket = new SouvenirDecorator(this.ticket, type);
        return this;
    }

    upgradeToPremiumSeat(): TicketWithAddonsBuilder {
        this.ticket = new PremiumSeatDecorator(this.ticket);
        return this;
    }

    build(): TicketComponent {
        return this.ticket;
    }
}
