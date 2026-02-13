

import { Showtime } from '../models/Showtime';
import { Seat, SeatType } from '../models/Seat';

// Tipe tiket yang tersedia di bioskop
export enum TicketType {
    REGULAR = 'REGULAR',
    VIP = 'VIP',
    IMAX = 'IMAX'
}

// Interface Ticket (Product)
// Mendefinisikan kontrak untuk semua jenis tiket
export interface Ticket {
    id: string;
    type: TicketType;
    showtime: Showtime;
    seat: Seat;
    price: number;

    getPrice(): number;
    getDescription(): string;
    getSeatType(): SeatType;
    printTicket(): string;
}

// Base class untuk semua tiket
// Menyediakan implementasi umum yang dapat di-override oleh subclass
abstract class BaseTicket implements Ticket {
    constructor(
        public id: string,
        public type: TicketType,
        public showtime: Showtime,
        public seat: Seat,
        public price: number
    ) { }

    abstract getPrice(): number;
    abstract getDescription(): string;
    abstract getSeatType(): SeatType;

    // Mencetak informasi tiket dalam format standar
    printTicket(): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║                     E-TICKET BIOSKOP                         ║
╠══════════════════════════════════════════════════════════════╣
║ Ticket ID    : ${this.id.padEnd(44)}║
║ Tipe         : ${this.getDescription().padEnd(44)}║
║ Film         : ${this.showtime.movie.title.padEnd(44)}║
║ Bioskop      : ${this.showtime.cinema.name.padEnd(44)}║
║ Studio       : ${this.showtime.studio.name.padEnd(44)}║
║ Tanggal      : ${this.showtime.date.toLocaleDateString('id-ID').padEnd(44)}║
║ Jam          : ${this.showtime.startTime.padEnd(44)}║
║ Kursi        : ${this.seat.getCode().padEnd(44)}║
║ Harga        : Rp ${this.getPrice().toLocaleString('id-ID').padEnd(41)}║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
    }
}

// Concrete Product: RegularTicket
// Tiket biasa dengan harga standar
export class RegularTicket extends BaseTicket {
    constructor(id: string, showtime: Showtime, seat: Seat) {
        super(id, TicketType.REGULAR, showtime, seat, showtime.basePrice);
    }

    getPrice(): number {
        return this.price;
    }

    getDescription(): string {
        return 'Tiket Regular - Kursi Standar';
    }

    getSeatType(): SeatType {
        return SeatType.REGULAR;
    }
}

// Concrete Product: VIPTicket
// Tiket VIP dengan harga premium dan kursi khusus
export class VIPTicket extends BaseTicket {
    private readonly VIP_MULTIPLIER = 1.5;

    constructor(id: string, showtime: Showtime, seat: Seat) {
        super(id, TicketType.VIP, showtime, seat, showtime.basePrice);
    }

    getPrice(): number {
        return Math.round(this.price * this.VIP_MULTIPLIER);
    }

    getDescription(): string {
        return 'Tiket VIP - Kursi Premium & Snack Gratis';
    }

    getSeatType(): SeatType {
        return SeatType.VIP;
    }
}

// Concrete Product: IMAXTicket
// Tiket IMAX dengan pengalaman premium dan harga tertinggi
export class IMAXTicket extends BaseTicket {
    private readonly IMAX_MULTIPLIER = 2.0;

    constructor(id: string, showtime: Showtime, seat: Seat) {
        super(id, TicketType.IMAX, showtime, seat, showtime.basePrice);
    }

    getPrice(): number {
        return Math.round(this.price * this.IMAX_MULTIPLIER);
    }

    getDescription(): string {
        return 'Tiket IMAX - Pengalaman Sinematik Premium';
    }

    getSeatType(): SeatType {
        return SeatType.REGULAR;
    }
}

// Abstract Factory: TicketFactory (Creator)
// Mendefinisikan interface untuk pembuatan tiket, subclass akan menentukan jenis tiket yang dibuat
export abstract class TicketFactory {
    // Factory Method - Method yang akan di-override oleh subclass untuk membuat jenis tiket spesifik
    abstract createTicket(showtime: Showtime, seat: Seat): Ticket;

    // Template method yang menggunakan factory method
    // Mendemonstrasikan bahwa factory method dapat digunakan dalam konteks operasi lain
    orderTicket(showtime: Showtime, seat: Seat): Ticket {
        // Membuat tiket menggunakan factory method
        const ticket = this.createTicket(showtime, seat);

        // Operasi tambahan setelah pembuatan tiket
        console.log(`[INFO] Tiket ${ticket.id} berhasil dibuat`);
        console.log(`[INFO] Tipe: ${ticket.getDescription()}`);
        console.log(`[INFO] Harga: Rp ${ticket.getPrice().toLocaleString('id-ID')}`);

        return ticket;
    }

    // Generate unique ticket ID
    protected generateTicketId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `TKT-${timestamp}-${random}`.toUpperCase();
    }
}

// Concrete Creator: RegularTicketFactory - Factory untuk membuat tiket regular
export class RegularTicketFactory extends TicketFactory {
    createTicket(showtime: Showtime, seat: Seat): Ticket {
        const id = this.generateTicketId();
        return new RegularTicket(id, showtime, seat);
    }
}

// Concrete Creator: VIPTicketFactory - Factory untuk membuat tiket VIP
export class VIPTicketFactory extends TicketFactory {
    createTicket(showtime: Showtime, seat: Seat): Ticket {
        const id = this.generateTicketId();
        return new VIPTicket(id, showtime, seat);
    }
}

// Concrete Creator: IMAXTicketFactory - Factory untuk membuat tiket IMAX
export class IMAXTicketFactory extends TicketFactory {
    createTicket(showtime: Showtime, seat: Seat): Ticket {
        const id = this.generateTicketId();
        return new IMAXTicket(id, showtime, seat);
    }
}

// Simple Factory untuk kemudahan penggunaan
// Memetakan tipe tiket ke factory yang sesuai
export class TicketFactoryProvider {
    private static factories: Map<TicketType, TicketFactory> = new Map([
        [TicketType.REGULAR, new RegularTicketFactory()],
        [TicketType.VIP, new VIPTicketFactory()],
        [TicketType.IMAX, new IMAXTicketFactory()]
    ]);

    // Mendapatkan factory berdasarkan tipe tiket
    static getFactory(type: TicketType): TicketFactory {
        const factory = this.factories.get(type);
        if (!factory) {
            throw new Error(`Factory untuk tipe tiket ${type} tidak ditemukan`);
        }
        return factory;
    }
}
