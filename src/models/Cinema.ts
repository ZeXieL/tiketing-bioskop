// Model Bioskop dan Studio
// Merepresentasikan data bioskop beserta studio-studionya

// Tipe studio yang tersedia
export enum StudioType {
    REGULAR = 'REGULAR',
    VIP = 'VIP',
    IMAX = 'IMAX',
    DOLBY_ATMOS = 'DOLBY_ATMOS'
}

// Interface Studio
export interface Studio {
    id: string;
    name: string;
    type: StudioType;
    capacity: number;
    rowCount: number;
    seatsPerRow: number;
}

// Interface Cinema (Bioskop)
export interface Cinema {
    id: string;
    name: string;
    location: string;
    address: string;
    city: string;
    studios: Studio[];
}

// Implementasi konkret Studio
export class StudioImpl implements Studio {
    constructor(
        public id: string,
        public name: string,
        public type: StudioType,
        public capacity: number,
        public rowCount: number,
        public seatsPerRow: number
    ) { }

    // Mendapatkan deskripsi studio
    getDescription(): string {
        return `${this.name} (${this.type}) - Kapasitas: ${this.capacity} kursi`;
    }
}

// Implementasi konkret Cinema
export class CinemaImpl implements Cinema {
    constructor(
        public id: string,
        public name: string,
        public location: string,
        public address: string,
        public city: string,
        public studios: Studio[] = []
    ) { }

    // Menambahkan studio ke bioskop
    addStudio(studio: Studio): void {
        this.studios.push(studio);
    }

    // Mendapatkan studio berdasarkan tipe
    getStudiosByType(type: StudioType): Studio[] {
        return this.studios.filter(studio => studio.type === type);
    }
}
