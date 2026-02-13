// PROTOTYPE PATTERN - Sistem Template Layout Kursi
//
// PENJELASAN MASALAH:
// Bioskop memiliki banyak studio dengan konfigurasi kursi yang mirip atau sama.
// Membuat layout kursi dari awal untuk setiap studio memerlukan proses yang mahal.
//
// SOLUSI:
// Prototype Pattern memungkinkan pembuatan objek baru dengan meng-clone objek yang sudah ada.
//
// PEMETAAN KE DOMAIN BIOSKOP:
// - Prototype Interface: Clonable
// - Concrete Prototypes: SeatLayout, PromoTemplate
// - Client: SeatLayoutRegistry

import { Seat, SeatImpl, SeatType, SeatStatus } from '../models/Seat';
import { StudioType } from '../models/Cinema';

// Interface Prototype
// Mendefinisikan method clone yang harus diimplementasikan
export interface Clonable<T> {
    clone(): T;
}

// Concrete Prototype: SeatLayout
// Merepresentasikan layout kursi dalam sebuah studio yang dapat di-clone
export class SeatLayout implements Clonable<SeatLayout> {
    private id: string;
    private name: string;
    private studioType: StudioType;
    private rows: number;
    private seatsPerRow: number;
    private seats: Seat[][];
    private basePrice: number;

    constructor(
        id: string,
        name: string,
        studioType: StudioType,
        rows: number,
        seatsPerRow: number,
        basePrice: number
    ) {
        this.id = id;
        this.name = name;
        this.studioType = studioType;
        this.rows = rows;
        this.seatsPerRow = seatsPerRow;
        this.basePrice = basePrice;
        this.seats = this.initializeSeats();
    }

    // Inisialisasi kursi-kursi dalam layout
    private initializeSeats(): Seat[][] {
        const seatMatrix: Seat[][] = [];
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let r = 0; r < this.rows; r++) {
            const row: Seat[] = [];
            for (let s = 1; s <= this.seatsPerRow; s++) {
                const rowLabel = rowLabels[r];
                const seatType = this.determineSeatType(r, s);
                const seatPrice = this.calculateSeatPrice(seatType);

                row.push(new SeatImpl(
                    `${this.id}-${rowLabel}${s}`,
                    rowLabel,
                    s,
                    seatType,
                    SeatStatus.AVAILABLE,
                    seatPrice
                ));
            }
            seatMatrix.push(row);
        }

        return seatMatrix;
    }

    // Menentukan tipe kursi berdasarkan posisi
    private determineSeatType(row: number, seatNumber: number): SeatType {
        // Baris belakang (2 baris terakhir) untuk VIP jika studio Regular
        if (this.studioType === StudioType.REGULAR && row >= this.rows - 2) {
            return SeatType.VIP;
        }

        // Semua kursi VIP jika studio VIP
        if (this.studioType === StudioType.VIP) {
            return SeatType.VIP;
        }

        // Kursi couple di pojok (4 kursi pertama dan terakhir baris terakhir)
        if (row === this.rows - 1) {
            if (seatNumber <= 2 || seatNumber > this.seatsPerRow - 2) {
                return SeatType.COUPLE;
            }
        }

        return SeatType.REGULAR;
    }

    // Menghitung harga kursi berdasarkan tipe
    private calculateSeatPrice(seatType: SeatType): number {
        switch (seatType) {
            case SeatType.VIP:
                return Math.round(this.basePrice * 1.5);
            case SeatType.COUPLE:
                return Math.round(this.basePrice * 2); // Untuk 2 orang
            case SeatType.WHEELCHAIR:
                return this.basePrice; // Harga sama dengan regular
            default:
                return this.basePrice;
        }
    }

    // Implementasi Clone Method (Deep Copy)
    // Membuat salinan independen dari layout ini
    clone(): SeatLayout {
        // Membuat instance baru
        const clonedLayout = new SeatLayout(
            this.generateNewId(),
            `${this.name} (Copy)`,
            this.studioType,
            this.rows,
            this.seatsPerRow,
            this.basePrice
        );

        // Deep clone seats (reset status ke AVAILABLE)
        clonedLayout.seats = this.seats.map(row =>
            row.map(seat => new SeatImpl(
                seat.id.replace(this.id, clonedLayout.getId()),
                seat.row,
                seat.number,
                seat.type,
                SeatStatus.AVAILABLE, // Reset status
                seat.price
            ))
        );

        return clonedLayout;
    }

    // Generate ID baru untuk clone
    private generateNewId(): string {
        const timestamp = Date.now().toString(36);
        return `LAYOUT-${timestamp}`;
    }

    // Getters
    getId(): string { return this.id; }
    getName(): string { return this.name; }
    getStudioType(): StudioType { return this.studioType; }
    getRows(): number { return this.rows; }
    getSeatsPerRow(): number { return this.seatsPerRow; }
    getBasePrice(): number { return this.basePrice; }
    getSeats(): Seat[][] { return this.seats; }

    // Mendapatkan kursi berdasarkan kode (contoh: A1, B5)
    getSeat(code: string): Seat | null {
        const rowLabel = code.charAt(0).toUpperCase();
        const seatNumber = parseInt(code.substring(1));
        const rowIndex = rowLabel.charCodeAt(0) - 'A'.charCodeAt(0);

        if (rowIndex >= 0 && rowIndex < this.rows &&
            seatNumber >= 1 && seatNumber <= this.seatsPerRow) {
            return this.seats[rowIndex][seatNumber - 1];
        }
        return null;
    }

    // Mendapatkan kursi yang tersedia
    getAvailableSeats(): Seat[] {
        return this.seats.flat().filter(seat => seat.status === SeatStatus.AVAILABLE);
    }

    // Menghitung total kapasitas
    getTotalCapacity(): number {
        return this.rows * this.seatsPerRow;
    }

    // Menampilkan layout dalam format visual
    displayLayout(): string {
        let output = `
╔══════════════════════════════════════════════════════════════╗
║ ${this.name.padEnd(60)}║
║ Tipe: ${this.studioType.padEnd(54)}║
║ Kapasitas: ${this.getTotalCapacity().toString().padEnd(49)}║
╠══════════════════════════════════════════════════════════════╣
║                        [ LAYAR ]                             ║
╠══════════════════════════════════════════════════════════════╣
`;

        // Header nomor kursi
        output += '║    ';
        for (let s = 1; s <= this.seatsPerRow; s++) {
            output += s.toString().padStart(3);
        }
        output += '     ║\n';

        // Baris kursi
        for (const row of this.seats) {
            output += `║ ${row[0].row}  `;
            for (const seat of row) {
                let symbol: string;
                switch (seat.status) {
                    case SeatStatus.AVAILABLE:
                        symbol = seat.type === SeatType.VIP ? '[V]' :
                            seat.type === SeatType.COUPLE ? '[C]' : '[O]';
                        break;
                    case SeatStatus.SELECTED:
                        symbol = '[S]';
                        break;
                    case SeatStatus.BOOKED:
                        symbol = '[X]';
                        break;
                    default:
                        symbol = '[-]';
                }
                output += symbol;
            }
            output += `  ${row[0].row} ║\n`;
        }

        output += `╠══════════════════════════════════════════════════════════════╣
║ Keterangan: [O] Regular  [V] VIP  [C] Couple  [X] Terisi     ║
╚══════════════════════════════════════════════════════════════╝`;

        return output;
    }

    // Mengubah nama layout
    setName(name: string): void {
        this.name = name;
    }

    // Mengubah harga dasar
    setBasePrice(price: number): void {
        this.basePrice = price;
        // Update semua harga kursi
        for (const row of this.seats) {
            for (const seat of row) {
                (seat as SeatImpl).price = this.calculateSeatPrice(seat.type);
            }
        }
    }
}

// Concrete Prototype: PromoTemplate
// Template promo yang dapat di-clone untuk berbagai film
export class PromoTemplate implements Clonable<PromoTemplate> {
    private id: string;
    private name: string;
    private description: string;
    private discountPercentage: number;
    private minimumPurchase: number;
    private maxDiscount: number;
    private validFrom: Date;
    private validUntil: Date;
    private termsAndConditions: string[];

    constructor(
        id: string,
        name: string,
        description: string,
        discountPercentage: number,
        minimumPurchase: number,
        maxDiscount: number,
        validDays: number
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.discountPercentage = discountPercentage;
        this.minimumPurchase = minimumPurchase;
        this.maxDiscount = maxDiscount;
        this.validFrom = new Date();
        this.validUntil = new Date();
        this.validUntil.setDate(this.validUntil.getDate() + validDays);
        this.termsAndConditions = [];
    }

    // Clone promo template
    clone(): PromoTemplate {
        const cloned = new PromoTemplate(
            this.generateNewId(),
            `${this.name} (Copy)`,
            this.description,
            this.discountPercentage,
            this.minimumPurchase,
            this.maxDiscount,
            this.getRemainingDays()
        );
        cloned.termsAndConditions = [...this.termsAndConditions];
        return cloned;
    }

    private generateNewId(): string {
        const timestamp = Date.now().toString(36);
        return `PROMO-${timestamp}`.toUpperCase();
    }

    private getRemainingDays(): number {
        const now = new Date();
        const diffTime = this.validUntil.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Getters
    getId(): string { return this.id; }
    getName(): string { return this.name; }
    getDescription(): string { return this.description; }
    getDiscountPercentage(): number { return this.discountPercentage; }

    // Menghitung diskon berdasarkan jumlah pembelian
    calculateDiscount(purchaseAmount: number): number {
        if (purchaseAmount < this.minimumPurchase) {
            return 0;
        }
        const discount = Math.round(purchaseAmount * this.discountPercentage / 100);
        return Math.min(discount, this.maxDiscount);
    }

    // Menambahkan syarat dan ketentuan
    addTermsAndCondition(term: string): void {
        this.termsAndConditions.push(term);
    }

    // Mengubah nama promo
    setName(name: string): void {
        this.name = name;
    }

    // Mengubah deskripsi
    setDescription(description: string): void {
        this.description = description;
    }

    // Menampilkan detail promo
    displayPromo(): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║ PROMO: ${this.name.toUpperCase().padEnd(52)}║
╠══════════════════════════════════════════════════════════════╣
║ ${this.description.padEnd(60)}║
║                                                              ║
║ Diskon         : ${(this.discountPercentage + '%').padEnd(42)}║
║ Min. Pembelian : Rp ${this.minimumPurchase.toLocaleString('id-ID').padEnd(39)}║
║ Maks. Diskon   : Rp ${this.maxDiscount.toLocaleString('id-ID').padEnd(39)}║
║ Berlaku        : ${this.validFrom.toLocaleDateString('id-ID')} - ${this.validUntil.toLocaleDateString('id-ID').padEnd(26)}║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
    }
}

// Registry untuk menyimpan prototype yang sering digunakan
export class SeatLayoutRegistry {
    private static prototypes: Map<string, SeatLayout> = new Map();

    // Mendaftarkan prototype
    static register(key: string, prototype: SeatLayout): void {
        this.prototypes.set(key, prototype);
    }

    // Mendapatkan clone dari prototype
    static getClone(key: string): SeatLayout | null {
        const prototype = this.prototypes.get(key);
        if (prototype) {
            return prototype.clone();
        }
        return null;
    }

    // Menampilkan semua prototype yang terdaftar
    static listPrototypes(): string[] {
        return Array.from(this.prototypes.keys());
    }

    // Inisialisasi dengan prototype default
    static initializeDefaults(): void {
        // Regular Studio Layout (10 baris x 15 kursi)
        this.register('REGULAR_STANDARD', new SeatLayout(
            'LAYOUT-REG-STD',
            'Layout Studio Regular Standar',
            StudioType.REGULAR,
            10,
            15,
            50000
        ));

        // VIP Studio Layout (6 baris x 10 kursi)
        this.register('VIP_STANDARD', new SeatLayout(
            'LAYOUT-VIP-STD',
            'Layout Studio VIP Standar',
            StudioType.VIP,
            6,
            10,
            100000
        ));

        // IMAX Studio Layout (12 baris x 20 kursi)
        this.register('IMAX_STANDARD', new SeatLayout(
            'LAYOUT-IMAX-STD',
            'Layout Studio IMAX Standar',
            StudioType.IMAX,
            12,
            20,
            150000
        ));

        // Small Regular Studio (8 baris x 12 kursi)
        this.register('REGULAR_SMALL', new SeatLayout(
            'LAYOUT-REG-SM',
            'Layout Studio Regular Kecil',
            StudioType.REGULAR,
            8,
            12,
            45000
        ));
    }
}

// Registry untuk promo templates
export class PromoRegistry {
    private static prototypes: Map<string, PromoTemplate> = new Map();

    static register(key: string, prototype: PromoTemplate): void {
        this.prototypes.set(key, prototype);
    }

    static getClone(key: string): PromoTemplate | null {
        const prototype = this.prototypes.get(key);
        if (prototype) {
            return prototype.clone();
        }
        return null;
    }

    static initializeDefaults(): void {
        // Weekend Promo
        const weekendPromo = new PromoTemplate(
            'PROMO-WEEKEND',
            'Weekend Special',
            'Diskon spesial untuk pembelian akhir pekan',
            15,
            100000,
            50000,
            30
        );
        weekendPromo.addTermsAndCondition('Berlaku Sabtu & Minggu');
        weekendPromo.addTermsAndCondition('Tidak dapat digabung dengan promo lain');
        this.register('WEEKEND', weekendPromo);

        // Student Promo
        const studentPromo = new PromoTemplate(
            'PROMO-STUDENT',
            'Student Discount',
            'Diskon khusus pelajar dan mahasiswa',
            20,
            50000,
            30000,
            90
        );
        studentPromo.addTermsAndCondition('Wajib menunjukkan kartu pelajar');
        this.register('STUDENT', studentPromo);

        // Member Promo
        const memberPromo = new PromoTemplate(
            'PROMO-MEMBER',
            'Member Exclusive',
            'Promo eksklusif untuk member',
            25,
            75000,
            75000,
            60
        );
        this.register('MEMBER', memberPromo);
    }
}
