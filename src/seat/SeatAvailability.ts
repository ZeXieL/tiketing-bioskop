/**
 * =============================================================================
 * PROXY PATTERN - Sistem Ketersediaan Kursi dengan Cache dan Kontrol Akses
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Pengecekan ketersediaan kursi bioskop adalah operasi yang sering dilakukan
 * dan membutuhkan akses ke database/server. Tanpa optimasi, setiap request
 * akan membebani server. Selain itu, diperlukan kontrol akses untuk mencegah
 * pengguna tidak terdaftar mengakses sistem.
 * 
 * ALASAN PEMILIHAN:
 * Proxy Pattern dipilih untuk:
 * 1. Virtual Proxy: Lazy loading data kursi
 * 2. Caching Proxy: Menyimpan hasil query ke cache
 * 3. Protection Proxy: Mengontrol akses berdasarkan role user
 * 4. Logging Proxy: Mencatat setiap akses untuk monitoring
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Subject Interface: SeatAvailabilityService
 * - Real Subject: RealSeatAvailabilityService
 * - Proxy: SeatAvailabilityProxy (dengan caching dan access control)
 * =============================================================================
 */

import { Seat, SeatImpl, SeatType, SeatStatus } from '../models/Seat';
import { User, MembershipType } from '../models/User';

/**
 * ═══════════════════════════════════════════════════════════════
 * SUBJECT INTERFACE
 * ═══════════════════════════════════════════════════════════════
 * Interface yang didefinisikan baik untuk real service maupun proxy
 */
export interface SeatAvailabilityService {
    /**
     * Mendapatkan semua kursi untuk showtime tertentu
     */
    getSeats(showtimeId: string): Seat[];

    /**
     * Mendapatkan kursi yang tersedia saja
     */
    getAvailableSeats(showtimeId: string): Seat[];

    /**
     * Mengecek apakah kursi tertentu tersedia
     */
    isSeatAvailable(showtimeId: string, seatCode: string): boolean;

    /**
     * Memesan kursi (mengubah status menjadi SELECTED)
     */
    selectSeat(showtimeId: string, seatCode: string): boolean;

    /**
     * Membatalkan pemilihan kursi
     */
    deselectSeat(showtimeId: string, seatCode: string): boolean;

    /**
     * Mengkonfirmasi booking (mengubah status menjadi BOOKED)
     */
    confirmBooking(showtimeId: string, seatCodes: string[]): boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * REAL SUBJECT
 * ═══════════════════════════════════════════════════════════════
 * Implementasi aktual yang melakukan operasi sebenarnya
 * (simulasi akses ke database)
 */
export class RealSeatAvailabilityService implements SeatAvailabilityService {
    private seatData: Map<string, Seat[][]> = new Map();
    private readonly ARTIFICIAL_DELAY = 100; // Simulasi latency database

    constructor() {
        console.log('[RealService] Service initialized');
    }

    /**
     * Simulasi delay akses database
     */
    private simulateDatabaseAccess(): void {
        const start = Date.now();
        while (Date.now() - start < this.ARTIFICIAL_DELAY) {
            // Blocking delay untuk simulasi
        }
    }

    /**
     * Inisialisasi data kursi untuk showtime (lazy initialization)
     */
    private initializeShowtime(showtimeId: string): void {
        if (this.seatData.has(showtimeId)) return;

        console.log(`[RealService] Initializing seat data for ${showtimeId} (expensive operation)`);
        this.simulateDatabaseAccess();

        const rows = 10;
        const seatsPerRow = 15;
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const seatMatrix: Seat[][] = [];

        for (let r = 0; r < rows; r++) {
            const row: Seat[] = [];
            for (let s = 1; s <= seatsPerRow; s++) {
                const rowLabel = rowLabels[r];
                const seatType = r >= rows - 2 ? SeatType.VIP : SeatType.REGULAR;
                const price = seatType === SeatType.VIP ? 75000 : 50000;

                // Simulasi beberapa kursi sudah terisi
                const isRandomlyBooked = Math.random() < 0.2; // 20% sudah terisi

                row.push(new SeatImpl(
                    `${showtimeId}-${rowLabel}${s}`,
                    rowLabel,
                    s,
                    seatType,
                    isRandomlyBooked ? SeatStatus.BOOKED : SeatStatus.AVAILABLE,
                    price
                ));
            }
            seatMatrix.push(row);
        }

        this.seatData.set(showtimeId, seatMatrix);
        console.log(`[RealService] Seat data initialized with ${rows * seatsPerRow} seats`);
    }

    getSeats(showtimeId: string): Seat[] {
        console.log(`[RealService] Fetching all seats for ${showtimeId}`);
        this.simulateDatabaseAccess();
        this.initializeShowtime(showtimeId);
        return this.seatData.get(showtimeId)?.flat() || [];
    }

    getAvailableSeats(showtimeId: string): Seat[] {
        console.log(`[RealService] Fetching available seats for ${showtimeId}`);
        this.simulateDatabaseAccess();
        this.initializeShowtime(showtimeId);
        const allSeats = this.seatData.get(showtimeId)?.flat() || [];
        return allSeats.filter(seat => seat.status === SeatStatus.AVAILABLE);
    }

    isSeatAvailable(showtimeId: string, seatCode: string): boolean {
        console.log(`[RealService] Checking availability: ${seatCode}`);
        this.simulateDatabaseAccess();
        const seat = this.findSeat(showtimeId, seatCode);
        return seat?.status === SeatStatus.AVAILABLE;
    }

    selectSeat(showtimeId: string, seatCode: string): boolean {
        console.log(`[RealService] Selecting seat: ${seatCode}`);
        this.simulateDatabaseAccess();
        const seat = this.findSeat(showtimeId, seatCode);
        if (seat && seat.status === SeatStatus.AVAILABLE) {
            (seat as SeatImpl).status = SeatStatus.SELECTED;
            return true;
        }
        return false;
    }

    deselectSeat(showtimeId: string, seatCode: string): boolean {
        console.log(`[RealService] Deselecting seat: ${seatCode}`);
        this.simulateDatabaseAccess();
        const seat = this.findSeat(showtimeId, seatCode);
        if (seat && seat.status === SeatStatus.SELECTED) {
            (seat as SeatImpl).status = SeatStatus.AVAILABLE;
            return true;
        }
        return false;
    }

    confirmBooking(showtimeId: string, seatCodes: string[]): boolean {
        console.log(`[RealService] Confirming booking for ${seatCodes.length} seats`);
        this.simulateDatabaseAccess();

        // Verifikasi semua kursi dalam status SELECTED
        for (const code of seatCodes) {
            const seat = this.findSeat(showtimeId, code);
            if (!seat || seat.status !== SeatStatus.SELECTED) {
                console.log(`[RealService] Booking failed: seat ${code} not in SELECTED status`);
                return false;
            }
        }

        // Ubah status semua kursi menjadi BOOKED
        for (const code of seatCodes) {
            const seat = this.findSeat(showtimeId, code);
            if (seat) {
                (seat as SeatImpl).status = SeatStatus.BOOKED;
            }
        }

        console.log(`[RealService] Booking confirmed for ${seatCodes.length} seats`);
        return true;
    }

    private findSeat(showtimeId: string, seatCode: string): Seat | null {
        this.initializeShowtime(showtimeId);
        const rows = this.seatData.get(showtimeId) || [];
        for (const row of rows) {
            for (const seat of row) {
                if (seat.getCode() === seatCode) {
                    return seat;
                }
            }
        }
        return null;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * PROXY
 * ═══════════════════════════════════════════════════════════════
 * Proxy yang menambahkan caching, access control, dan logging
 */

/**
 * Cache entry dengan TTL
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * Access level untuk proteksi
 */
export enum AccessLevel {
    GUEST = 0,
    MEMBER = 1,
    VIP = 2,
    ADMIN = 3
}

export class SeatAvailabilityProxy implements SeatAvailabilityService {
    private realService: RealSeatAvailabilityService | null = null;
    private cache: Map<string, CacheEntry<Seat[]>> = new Map();
    private accessLog: AccessLogEntry[] = [];
    private currentUser: User | null = null;
    private accessLevel: AccessLevel = AccessLevel.GUEST;

    // Configuration
    private readonly CACHE_TTL = 30000; // 30 detik
    private readonly MAX_LOG_ENTRIES = 1000;

    constructor() {
        console.log('[Proxy] Proxy initialized');
    }

    /**
     * Set current user untuk access control
     */
    setCurrentUser(user: User | null): void {
        this.currentUser = user;
        this.accessLevel = this.determineAccessLevel(user);
        console.log(`[Proxy] User set: ${user?.name || 'Guest'} (Level: ${AccessLevel[this.accessLevel]})`);
    }

    private determineAccessLevel(user: User | null): AccessLevel {
        if (!user) return AccessLevel.GUEST;

        switch (user.membership) {
            case MembershipType.PLATINUM:
                return AccessLevel.VIP;
            case MembershipType.GOLD:
            case MembershipType.SILVER:
                return AccessLevel.MEMBER;
            default:
                return AccessLevel.MEMBER;
        }
    }

    /**
     * Lazy initialization of real service
     */
    private getRealService(): RealSeatAvailabilityService {
        if (!this.realService) {
            console.log('[Proxy] Lazy loading real service...');
            this.realService = new RealSeatAvailabilityService();
        }
        return this.realService;
    }

    /**
     * Check cache validity
     */
    private isCacheValid(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        const isValid = Date.now() - entry.timestamp < entry.ttl;
        if (!isValid) {
            this.cache.delete(key);
            console.log(`[Proxy] Cache expired for: ${key}`);
        }
        return isValid;
    }

    /**
     * Log access
     */
    private logAccess(method: string, showtimeId: string, details?: string): void {
        const entry: AccessLogEntry = {
            timestamp: new Date(),
            userId: this.currentUser?.id || 'GUEST',
            method,
            showtimeId,
            details
        };

        this.accessLog.push(entry);

        // Limit log size
        if (this.accessLog.length > this.MAX_LOG_ENTRIES) {
            this.accessLog.shift();
        }

        console.log(`[Proxy] LOG: ${method} - ${showtimeId} by ${entry.userId}`);
    }

    /**
     * Check access permission
     */
    private checkAccess(requiredLevel: AccessLevel, operation: string): void {
        if (this.accessLevel < requiredLevel) {
            const message = `Access denied: ${operation} requires ${AccessLevel[requiredLevel]} level`;
            console.log(`[Proxy] ${message}`);
            throw new Error(message);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INTERFACE IMPLEMENTATION (dengan caching dan access control)
    // ═══════════════════════════════════════════════════════════════

    getSeats(showtimeId: string): Seat[] {
        this.checkAccess(AccessLevel.GUEST, 'view seats');
        this.logAccess('getSeats', showtimeId);

        const cacheKey = `seats-all-${showtimeId}`;

        // Check cache
        if (this.isCacheValid(cacheKey)) {
            console.log(`[Proxy] Cache HIT for ${cacheKey}`);
            return this.cache.get(cacheKey)!.data;
        }

        console.log(`[Proxy] Cache MISS for ${cacheKey}`);
        const seats = this.getRealService().getSeats(showtimeId);

        // Store in cache
        this.cache.set(cacheKey, {
            data: seats,
            timestamp: Date.now(),
            ttl: this.CACHE_TTL
        });

        return seats;
    }

    getAvailableSeats(showtimeId: string): Seat[] {
        this.checkAccess(AccessLevel.GUEST, 'view available seats');
        this.logAccess('getAvailableSeats', showtimeId);

        const cacheKey = `seats-available-${showtimeId}`;

        if (this.isCacheValid(cacheKey)) {
            console.log(`[Proxy] Cache HIT for ${cacheKey}`);
            return this.cache.get(cacheKey)!.data;
        }

        console.log(`[Proxy] Cache MISS for ${cacheKey}`);
        const seats = this.getRealService().getAvailableSeats(showtimeId);

        this.cache.set(cacheKey, {
            data: seats,
            timestamp: Date.now(),
            ttl: this.CACHE_TTL / 2 // Shorter TTL for availability data
        });

        return seats;
    }

    isSeatAvailable(showtimeId: string, seatCode: string): boolean {
        this.checkAccess(AccessLevel.GUEST, 'check seat availability');
        this.logAccess('isSeatAvailable', showtimeId, `seat: ${seatCode}`);

        // Tidak cache single seat check karena bisa berubah cepat
        return this.getRealService().isSeatAvailable(showtimeId, seatCode);
    }

    selectSeat(showtimeId: string, seatCode: string): boolean {
        // Harus login untuk memilih kursi
        this.checkAccess(AccessLevel.MEMBER, 'select seat');
        this.logAccess('selectSeat', showtimeId, `seat: ${seatCode}`);

        // Invalidate cache karena data berubah
        this.invalidateCache(showtimeId);

        return this.getRealService().selectSeat(showtimeId, seatCode);
    }

    deselectSeat(showtimeId: string, seatCode: string): boolean {
        this.checkAccess(AccessLevel.MEMBER, 'deselect seat');
        this.logAccess('deselectSeat', showtimeId, `seat: ${seatCode}`);

        this.invalidateCache(showtimeId);

        return this.getRealService().deselectSeat(showtimeId, seatCode);
    }

    confirmBooking(showtimeId: string, seatCodes: string[]): boolean {
        this.checkAccess(AccessLevel.MEMBER, 'confirm booking');
        this.logAccess('confirmBooking', showtimeId, `seats: ${seatCodes.join(', ')}`);

        this.invalidateCache(showtimeId);

        return this.getRealService().confirmBooking(showtimeId, seatCodes);
    }

    // ═══════════════════════════════════════════════════════════════
    // ADDITIONAL PROXY METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Invalidate cache untuk showtime tertentu
     */
    private invalidateCache(showtimeId: string): void {
        const keysToDelete: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.includes(showtimeId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`[Proxy] Cache invalidated for ${showtimeId}`);
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('[Proxy] All cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats {
        return {
            entries: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Get access log
     */
    getAccessLog(limit: number = 50): AccessLogEntry[] {
        return this.accessLog.slice(-limit);
    }

    /**
     * VIP-only: Preview premium seats
     */
    getVIPSeats(showtimeId: string): Seat[] {
        this.checkAccess(AccessLevel.VIP, 'preview VIP seats');
        this.logAccess('getVIPSeats', showtimeId);

        const allSeats = this.getSeats(showtimeId);
        return allSeats.filter(seat => seat.type === SeatType.VIP);
    }
}

/**
 * Interface untuk log entry
 */
interface AccessLogEntry {
    timestamp: Date;
    userId: string;
    method: string;
    showtimeId: string;
    details?: string;
}

/**
 * Interface untuk cache statistics
 */
interface CacheStats {
    entries: number;
    keys: string[];
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SEAT DISPLAY HELPER
 * ═══════════════════════════════════════════════════════════════
 */
export class SeatDisplayHelper {
    static displayLayout(seats: Seat[], seatsPerRow: number): string {
        if (seats.length === 0) return 'No seats available';

        let output = '\n                    [ LAYAR ]\n\n';

        // Group by row
        const rows = new Map<string, Seat[]>();
        for (const seat of seats) {
            const rowSeats = rows.get(seat.row) || [];
            rowSeats.push(seat);
            rows.set(seat.row, rowSeats);
        }

        // Sort rows
        const sortedRows = Array.from(rows.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        for (const [rowLabel, rowSeats] of sortedRows) {
            output += `  ${rowLabel} `;
            rowSeats.sort((a, b) => a.number - b.number);

            for (const seat of rowSeats) {
                let symbol: string;
                switch (seat.status) {
                    case SeatStatus.AVAILABLE:
                        symbol = seat.type === SeatType.VIP ? '◆' : '○';
                        break;
                    case SeatStatus.SELECTED:
                        symbol = '●';
                        break;
                    case SeatStatus.BOOKED:
                        symbol = '✕';
                        break;
                    default:
                        symbol = '─';
                }
                output += ` ${symbol}`;
            }
            output += `  ${rowLabel}\n`;
        }

        output += '\n  ○ Available  ◆ VIP  ● Selected  ✕ Booked\n';

        return output;
    }
}
