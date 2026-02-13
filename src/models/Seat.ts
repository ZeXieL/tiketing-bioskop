// Model Kursi
// Merepresentasikan kursi dalam studio bioskop

// Status kursi
export enum SeatStatus {
    AVAILABLE = 'AVAILABLE',
    SELECTED = 'SELECTED',
    BOOKED = 'BOOKED',
    UNAVAILABLE = 'UNAVAILABLE'
}

// Tipe kursi
export enum SeatType {
    REGULAR = 'REGULAR',
    VIP = 'VIP',
    COUPLE = 'COUPLE',
    WHEELCHAIR = 'WHEELCHAIR'
}

// Interface Seat
export interface Seat {
    id: string;
    row: string;
    number: number;
    type: SeatType;
    status: SeatStatus;
    price: number;
    getCode(): string;
    isAvailable(): boolean;
}

// Implementasi konkret Seat
export class SeatImpl implements Seat {
    constructor(
        public id: string,
        public row: string,
        public number: number,
        public type: SeatType,
        public status: SeatStatus = SeatStatus.AVAILABLE,
        public price: number = 0
    ) { }

    // Mendapatkan kode kursi (contoh: A1, B5)
    getCode(): string {
        return `${this.row}${this.number}`;
    }

    // Mengecek apakah kursi tersedia
    isAvailable(): boolean {
        return this.status === SeatStatus.AVAILABLE;
    }

    // Memilih kursi
    select(): void {
        if (this.isAvailable()) {
            this.status = SeatStatus.SELECTED;
        }
    }

    // Membatalkan pilihan kursi
    deselect(): void {
        if (this.status === SeatStatus.SELECTED) {
            this.status = SeatStatus.AVAILABLE;
        }
    }

    // Mem-booking kursi
    book(): void {
        if (this.status === SeatStatus.SELECTED) {
            this.status = SeatStatus.BOOKED;
        }
    }
}
