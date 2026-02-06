/**
 * =============================================================================
 * BUILDER PATTERN - Sistem Pembuatan Booking Kompleks
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Pemesanan tiket bioskop melibatkan banyak komponen opsional: pilihan kursi,
 * tambahan snack, asuransi tiket, voucher diskon, dan lainnya. Objek Booking
 * dapat memiliki berbagai konfigurasi. Tanpa design pattern, constructor
 * akan memiliki banyak parameter atau memerlukan banyak setter methods
 * yang membuat kode sulit dibaca dan rentan error.
 * 
 * ALASAN PEMILIHAN:
 * Builder Pattern dipilih karena memungkinkan konstruksi objek kompleks
 * secara bertahap menggunakan method chaining. Pattern ini memisahkan
 * konstruksi objek dari representasinya, memungkinkan berbagai konfigurasi
 * booking dengan kode yang readable.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Product: Booking
 * - Builder Interface: BookingBuilder
 * - Concrete Builder: ConcreteBookingBuilder
 * - Director: BookingDirector (untuk konfigurasi umum)
 * =============================================================================
 */

import { Movie, MovieImpl } from '../models/Movie';
import { Cinema, Studio, StudioType, CinemaImpl, StudioImpl } from '../models/Cinema';
import { User, UserImpl, MembershipType } from '../models/User';
import { Seat, SeatImpl, SeatType, SeatStatus } from '../models/Seat';
import { Showtime, ShowtimeImpl } from '../models/Showtime';
import { Ticket, TicketType, TicketFactoryProvider } from '../ticket/TicketFactory';

/**
 * Enum status booking
 */
export enum BookingStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PAID = 'PAID',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

/**
 * Interface untuk add-on booking
 */
export interface BookingAddon {
    name: string;
    price: number;
    quantity: number;
}

/**
 * Product: Booking
 * Objek kompleks yang dibangun oleh Builder
 */
export class Booking {
    // Properti wajib
    public id: string = '';
    public user: User | null = null;
    public showtime: Showtime | null = null;
    public tickets: Ticket[] = [];
    public status: BookingStatus = BookingStatus.DRAFT;

    // Properti opsional
    public addons: BookingAddon[] = [];
    public voucherCode: string | null = null;
    public discountAmount: number = 0;
    public insuranceIncluded: boolean = false;
    public notes: string = '';

    // Metadata
    public createdAt: Date = new Date();
    public updatedAt: Date = new Date();

    /**
     * Menghitung subtotal tiket
     */
    getTicketsSubtotal(): number {
        return this.tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);
    }

    /**
     * Menghitung subtotal addon
     */
    getAddonsSubtotal(): number {
        return this.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    }

    /**
     * Menghitung biaya asuransi (2% dari subtotal tiket)
     */
    getInsuranceFee(): number {
        if (!this.insuranceIncluded) return 0;
        return Math.round(this.getTicketsSubtotal() * 0.02);
    }

    /**
     * Menghitung total sebelum diskon
     */
    getSubtotal(): number {
        return this.getTicketsSubtotal() + this.getAddonsSubtotal() + this.getInsuranceFee();
    }

    /**
     * Mendapatkan persentase diskon dari membership user
     */
    getMembershipDiscount(): number {
        if (!this.user) return 0;
        const discountPercentage = (this.user as UserImpl).getDiscountPercentage();
        return Math.round(this.getSubtotal() * discountPercentage / 100);
    }

    /**
     * Menghitung total akhir
     */
    getTotalPrice(): number {
        return this.getSubtotal() - this.discountAmount - this.getMembershipDiscount();
    }

    /**
     * Menampilkan ringkasan booking
     */
    displaySummary(): string {
        if (!this.showtime || !this.user) {
            return 'Booking belum lengkap';
        }

        let summary = `
╔══════════════════════════════════════════════════════════════╗
║                     RINGKASAN BOOKING                        ║
╠══════════════════════════════════════════════════════════════╣
║ Booking ID    : ${this.id.padEnd(43)}║
║ Status        : ${this.status.padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║ INFORMASI PEMESAN                                            ║
║ Nama          : ${this.user.name.padEnd(43)}║
║ Email         : ${this.user.email.padEnd(43)}║
║ Membership    : ${this.user.membership.padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║ INFORMASI FILM                                               ║
║ Film          : ${this.showtime.movie.title.padEnd(43)}║
║ Bioskop       : ${this.showtime.cinema.name.padEnd(43)}║
║ Studio        : ${this.showtime.studio.name.padEnd(43)}║
║ Tanggal       : ${this.showtime.date.toLocaleDateString('id-ID').padEnd(43)}║
║ Jam           : ${this.showtime.startTime.padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║ TIKET (${this.tickets.length} tiket)                                              ║`;

        this.tickets.forEach(ticket => {
            summary += `
║   ${ticket.seat.getCode()} - ${ticket.getDescription().substring(0, 35).padEnd(45)}║
║        Rp ${ticket.getPrice().toLocaleString('id-ID').padEnd(49)}║`;
        });

        if (this.addons.length > 0) {
            summary += `
╠══════════════════════════════════════════════════════════════╣
║ ADD-ONS                                                      ║`;
            this.addons.forEach(addon => {
                const addonTotal = addon.price * addon.quantity;
                summary += `
║   ${addon.name} x${addon.quantity} = Rp ${addonTotal.toLocaleString('id-ID').padEnd(35)}║`;
            });
        }

        summary += `
╠══════════════════════════════════════════════════════════════╣
║ RINCIAN HARGA                                                ║
║ Subtotal Tiket     : Rp ${this.getTicketsSubtotal().toLocaleString('id-ID').padEnd(35)}║
║ Subtotal Add-ons   : Rp ${this.getAddonsSubtotal().toLocaleString('id-ID').padEnd(35)}║`;

        if (this.insuranceIncluded) {
            summary += `
║ Asuransi Tiket     : Rp ${this.getInsuranceFee().toLocaleString('id-ID').padEnd(35)}║`;
        }

        if (this.discountAmount > 0) {
            summary += `
║ Diskon Voucher     : -Rp ${this.discountAmount.toLocaleString('id-ID').padEnd(34)}║`;
        }

        if (this.getMembershipDiscount() > 0) {
            summary += `
║ Diskon Member      : -Rp ${this.getMembershipDiscount().toLocaleString('id-ID').padEnd(34)}║`;
        }

        summary += `
╠══════════════════════════════════════════════════════════════╣
║ TOTAL              : Rp ${this.getTotalPrice().toLocaleString('id-ID').padEnd(35)}║
╚══════════════════════════════════════════════════════════════╝`;

        return summary;
    }
}

/**
 * Builder Interface: BookingBuilder
 * Mendefinisikan langkah-langkah untuk membangun Booking
 */
export interface BookingBuilder {
    reset(): BookingBuilder;
    setUser(user: User): BookingBuilder;
    setShowtime(showtime: Showtime): BookingBuilder;
    addSeat(seat: Seat, ticketType: TicketType): BookingBuilder;
    addAddon(name: string, price: number, quantity: number): BookingBuilder;
    applyVoucher(code: string, discountAmount: number): BookingBuilder;
    includeInsurance(): BookingBuilder;
    setNotes(notes: string): BookingBuilder;
    build(): Booking;
}

/**
 * Concrete Builder: ConcreteBookingBuilder
 * Implementasi konkret dari BookingBuilder
 */
export class ConcreteBookingBuilder implements BookingBuilder {
    private booking: Booking;

    constructor() {
        this.booking = new Booking();
        this.reset();
    }

    /**
     * Reset builder ke state awal
     */
    reset(): BookingBuilder {
        this.booking = new Booking();
        this.booking.id = this.generateBookingId();
        this.booking.status = BookingStatus.DRAFT;
        this.booking.createdAt = new Date();
        return this;
    }

    /**
     * Set user yang melakukan booking
     */
    setUser(user: User): BookingBuilder {
        this.booking.user = user;
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Set showtime (jadwal tayang)
     */
    setShowtime(showtime: Showtime): BookingBuilder {
        this.booking.showtime = showtime;
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Menambahkan kursi dan membuat tiket
     */
    addSeat(seat: Seat, ticketType: TicketType): BookingBuilder {
        if (!this.booking.showtime) {
            throw new Error('Showtime harus diset terlebih dahulu');
        }

        const factory = TicketFactoryProvider.getFactory(ticketType);
        const ticket = factory.createTicket(this.booking.showtime, seat);
        this.booking.tickets.push(ticket);
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Menambahkan addon (snack, merchandise, dll)
     */
    addAddon(name: string, price: number, quantity: number): BookingBuilder {
        this.booking.addons.push({ name, price, quantity });
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Mengaplikasikan voucher diskon
     */
    applyVoucher(code: string, discountAmount: number): BookingBuilder {
        this.booking.voucherCode = code;
        this.booking.discountAmount = discountAmount;
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Menambahkan asuransi tiket
     */
    includeInsurance(): BookingBuilder {
        this.booking.insuranceIncluded = true;
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Menambahkan catatan
     */
    setNotes(notes: string): BookingBuilder {
        this.booking.notes = notes;
        this.booking.updatedAt = new Date();
        return this;
    }

    /**
     * Membangun dan mengembalikan objek Booking
     */
    build(): Booking {
        // Validasi booking
        if (!this.booking.user) {
            throw new Error('User harus diset');
        }
        if (!this.booking.showtime) {
            throw new Error('Showtime harus diset');
        }
        if (this.booking.tickets.length === 0) {
            throw new Error('Minimal harus ada 1 tiket');
        }

        this.booking.status = BookingStatus.PENDING;
        this.booking.updatedAt = new Date();

        const result = this.booking;
        this.reset(); // Reset untuk booking berikutnya
        return result;
    }

    /**
     * Generate unique booking ID
     */
    private generateBookingId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `BKG-${timestamp}-${random}`.toUpperCase();
    }
}

/**
 * Director: BookingDirector
 * Menyediakan konfigurasi booking yang sering digunakan
 */
export class BookingDirector {
    private builder: BookingBuilder;

    constructor(builder: BookingBuilder) {
        this.builder = builder;
    }

    setBuilder(builder: BookingBuilder): void {
        this.builder = builder;
    }

    /**
     * Membuat booking standar (tiket saja)
     */
    buildBasicBooking(user: User, showtime: Showtime, seat: Seat): Booking {
        return this.builder
            .reset()
            .setUser(user)
            .setShowtime(showtime)
            .addSeat(seat, TicketType.REGULAR)
            .build();
    }

    /**
     * Membuat booking VIP dengan asuransi
     */
    buildVIPBooking(user: User, showtime: Showtime, seat: Seat): Booking {
        return this.builder
            .reset()
            .setUser(user)
            .setShowtime(showtime)
            .addSeat(seat, TicketType.VIP)
            .includeInsurance()
            .build();
    }

    /**
     * Membuat booking lengkap dengan snack combo
     */
    buildComboBooking(
        user: User,
        showtime: Showtime,
        seat: Seat,
        ticketType: TicketType
    ): Booking {
        return this.builder
            .reset()
            .setUser(user)
            .setShowtime(showtime)
            .addSeat(seat, ticketType)
            .addAddon('Popcorn Large', 35000, 1)
            .addAddon('Coca-Cola Large', 20000, 2)
            .includeInsurance()
            .build();
    }

    /**
     * Membuat booking keluarga (4 tiket + snack)
     */
    buildFamilyBooking(
        user: User,
        showtime: Showtime,
        seats: Seat[]
    ): Booking {
        if (seats.length !== 4) {
            throw new Error('Family booking memerlukan tepat 4 kursi');
        }

        let builderChain = this.builder
            .reset()
            .setUser(user)
            .setShowtime(showtime);

        seats.forEach(seat => {
            builderChain = builderChain.addSeat(seat, TicketType.REGULAR);
        });

        return builderChain
            .addAddon('Family Popcorn Bucket', 75000, 1)
            .addAddon('Coca-Cola Large', 20000, 4)
            .applyVoucher('FAMILY20', 20000)
            .build();
    }
}

// Export helper untuk membuat sample data
export function createSampleShowtime(): Showtime {
    const movie = new MovieImpl(
        'MOV-001',
        'Avengers: Endgame',
        'Action/Sci-Fi',
        181,
        'PG-13',
        'Film superhero epic dari Marvel',
        '/posters/avengers.jpg',
        new Date('2023-04-26')
    );

    const studio = new StudioImpl(
        'STD-001',
        'Studio 1',
        StudioType.REGULAR,
        150,
        10,
        15
    );

    const cinema = new CinemaImpl(
        'CIN-001',
        'Cinema XXI Grand Indonesia',
        'Grand Indonesia',
        'Jl. MH Thamrin No.1',
        'Jakarta'
    );
    cinema.addStudio(studio);

    return new ShowtimeImpl(
        'SHW-001',
        movie,
        cinema,
        studio,
        new Date(),
        '19:00',
        '22:00',
        50000
    );
}

export function createSampleUser(): User {
    return new UserImpl(
        'USR-001',
        'John Doe',
        'john@email.com',
        '08123456789',
        MembershipType.GOLD
    );
}

export function createSampleSeat(row: string, number: number): Seat {
    return new SeatImpl(
        `SEAT-${row}${number}`,
        row,
        number,
        SeatType.REGULAR,
        SeatStatus.AVAILABLE,
        50000
    );
}
