/**
 * =============================================================================
 * FACADE PATTERN - Layanan Booking Bioskop Terpadu
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Proses pemesanan tiket bioskop melibatkan banyak subsystem yang kompleks:
 * - MovieService: Mengelola data film dan jadwal tayang
 * - SeatService: Mengelola ketersediaan kursi
 * - PaymentService: Memproses pembayaran
 * - NotificationService: Mengirim notifikasi ke pengguna
 * 
 * Client harus berinteraksi dengan banyak objek dan memahami hubungan antar
 * subsystem, yang membuat kode client menjadi kompleks dan tightly coupled.
 * 
 * ALASAN PEMILIHAN:
 * Facade Pattern dipilih untuk menyediakan interface sederhana yang
 * menyembunyikan kompleksitas subsystem. Client cukup memanggil satu method
 * untuk menyelesaikan seluruh proses booking, tanpa perlu memahami detail
 * internal setiap subsystem.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Facade: CinemaBookingService
 * - Subsystems: MovieService, SeatService, PaymentService, NotificationService
 * =============================================================================
 */

import { Movie, MovieImpl } from '../models/Movie';
import { Cinema, Studio, StudioType, CinemaImpl, StudioImpl } from '../models/Cinema';
import { Showtime, ShowtimeImpl } from '../models/Showtime';
import { Seat, SeatImpl, SeatType, SeatStatus } from '../models/Seat';
import { User, UserImpl, MembershipType } from '../models/User';
import { Booking, ConcreteBookingBuilder, BookingStatus as BookingStatusEnum } from '../booking/BookingBuilder';
import { TicketType } from '../ticket/TicketFactory';

// =============================================================================
// SUBSYSTEM 1: MovieService
// =============================================================================

/**
 * Subsystem: MovieService
 * Mengelola data film dan jadwal tayang
 */
export class MovieService {
    private movies: Map<string, Movie> = new Map();
    private showtimes: Map<string, Showtime[]> = new Map();

    constructor() {
        this.initializeSampleData();
    }

    private initializeSampleData(): void {
        // Sample movies
        const movies: Movie[] = [
            new MovieImpl('MOV-001', 'Avengers: Endgame', 'Action', 181, 'PG-13',
                'Film superhero epic', '/posters/avengers.jpg', new Date('2023-04-26')),
            new MovieImpl('MOV-002', 'Spider-Man: No Way Home', 'Action', 148, 'PG-13',
                'Peter Parker berjuang', '/posters/spiderman.jpg', new Date('2023-12-17')),
            new MovieImpl('MOV-003', 'Dune: Part Two', 'Sci-Fi', 166, 'PG-13',
                'Kelanjutan kisah Paul', '/posters/dune.jpg', new Date('2024-03-01')),
        ];

        movies.forEach(movie => {
            this.movies.set(movie.id, movie);
        });
    }

    /**
     * Mendapatkan daftar semua film
     */
    getAllMovies(): Movie[] {
        return Array.from(this.movies.values());
    }

    /**
     * Mendapatkan film berdasarkan ID
     */
    getMovieById(movieId: string): Movie | null {
        return this.movies.get(movieId) || null;
    }

    /**
     * Mencari film berdasarkan judul
     */
    searchMovies(query: string): Movie[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllMovies().filter(movie =>
            movie.title.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Mendapatkan jadwal tayang untuk film tertentu
     */
    getShowtimes(movieId: string): Showtime[] {
        return this.showtimes.get(movieId) || [];
    }

    /**
     * Menambahkan jadwal tayang
     */
    addShowtime(showtime: Showtime): void {
        const movieId = showtime.movie.id;
        const existing = this.showtimes.get(movieId) || [];
        existing.push(showtime);
        this.showtimes.set(movieId, existing);
    }

    /**
     * Log aktivitas
     */
    log(message: string): void {
        console.log(`[MovieService] ${message}`);
    }
}

// =============================================================================
// SUBSYSTEM 2: SeatService
// =============================================================================

/**
 * Subsystem: SeatService
 * Mengelola ketersediaan dan pemilihan kursi
 */
export class SeatService {
    private seatLayouts: Map<string, Seat[][]> = new Map();
    private selectedSeats: Map<string, Set<string>> = new Map(); // showtimeId -> set of seat codes

    /**
     * Inisialisasi layout kursi untuk showtime
     */
    initializeSeatLayout(showtimeId: string, rows: number, seatsPerRow: number): void {
        const layout: Seat[][] = [];
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let r = 0; r < rows; r++) {
            const row: Seat[] = [];
            for (let s = 1; s <= seatsPerRow; s++) {
                const rowLabel = rowLabels[r];
                row.push(new SeatImpl(
                    `${showtimeId}-${rowLabel}${s}`,
                    rowLabel,
                    s,
                    SeatType.REGULAR,
                    SeatStatus.AVAILABLE,
                    50000
                ));
            }
            layout.push(row);
        }

        this.seatLayouts.set(showtimeId, layout);
        this.selectedSeats.set(showtimeId, new Set());
    }

    /**
     * Mendapatkan semua kursi untuk showtime
     */
    getSeats(showtimeId: string): Seat[][] {
        return this.seatLayouts.get(showtimeId) || [];
    }

    /**
     * Mendapatkan kursi yang tersedia
     */
    getAvailableSeats(showtimeId: string): Seat[] {
        const layout = this.seatLayouts.get(showtimeId) || [];
        return layout.flat().filter(seat => seat.status === SeatStatus.AVAILABLE);
    }

    /**
     * Mendapatkan kursi berdasarkan kode
     */
    getSeat(showtimeId: string, seatCode: string): Seat | null {
        const layout = this.seatLayouts.get(showtimeId) || [];
        for (const row of layout) {
            for (const seat of row) {
                if (seat.getCode() === seatCode) {
                    return seat;
                }
            }
        }
        return null;
    }

    /**
     * Memilih kursi
     */
    selectSeat(showtimeId: string, seatCode: string): boolean {
        const seat = this.getSeat(showtimeId, seatCode);
        if (seat && seat.isAvailable()) {
            (seat as SeatImpl).select();
            this.selectedSeats.get(showtimeId)?.add(seatCode);
            this.log(`Kursi ${seatCode} dipilih`);
            return true;
        }
        this.log(`Gagal memilih kursi ${seatCode}`);
        return false;
    }

    /**
     * Membatalkan pilihan kursi
     */
    deselectSeat(showtimeId: string, seatCode: string): boolean {
        const seat = this.getSeat(showtimeId, seatCode);
        if (seat && seat.status === SeatStatus.SELECTED) {
            (seat as SeatImpl).deselect();
            this.selectedSeats.get(showtimeId)?.delete(seatCode);
            this.log(`Kursi ${seatCode} dibatalkan`);
            return true;
        }
        return false;
    }

    /**
     * Mem-booking kursi yang dipilih
     */
    bookSelectedSeats(showtimeId: string): Seat[] {
        const selectedCodes = this.selectedSeats.get(showtimeId) || new Set();
        const bookedSeats: Seat[] = [];

        for (const code of selectedCodes) {
            const seat = this.getSeat(showtimeId, code);
            if (seat) {
                (seat as SeatImpl).book();
                bookedSeats.push(seat);
            }
        }

        this.selectedSeats.set(showtimeId, new Set());
        this.log(`${bookedSeats.length} kursi berhasil di-booking`);
        return bookedSeats;
    }

    /**
     * Log aktivitas
     */
    log(message: string): void {
        console.log(`[SeatService] ${message}`);
    }
}

// =============================================================================
// SUBSYSTEM 3: PaymentService
// =============================================================================

/**
 * Status pembayaran
 */
export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

/**
 * Interface hasil pembayaran
 */
export interface PaymentResult {
    transactionId: string;
    status: PaymentStatus;
    amount: number;
    paidAt?: Date;
    message: string;
}

/**
 * Subsystem: PaymentService
 * Memproses pembayaran
 */
export class PaymentService {
    private transactions: Map<string, PaymentResult> = new Map();

    /**
     * Memproses pembayaran
     */
    processPayment(bookingId: string, amount: number, paymentMethod: string): PaymentResult {
        this.log(`Memproses pembayaran ${bookingId} sebesar Rp ${amount.toLocaleString('id-ID')}`);

        // Simulasi proses pembayaran
        const transactionId = this.generateTransactionId();

        // Simulasi validasi (dalam real case, ini akan memanggil payment gateway)
        const isSuccess = Math.random() > 0.1; // 90% success rate untuk simulasi

        const result: PaymentResult = {
            transactionId,
            status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
            amount,
            paidAt: isSuccess ? new Date() : undefined,
            message: isSuccess
                ? `Pembayaran berhasil via ${paymentMethod}`
                : 'Pembayaran gagal, silakan coba lagi'
        };

        this.transactions.set(transactionId, result);
        this.log(`Transaksi ${transactionId}: ${result.status}`);

        return result;
    }

    /**
     * Mendapatkan detail transaksi
     */
    getTransaction(transactionId: string): PaymentResult | null {
        return this.transactions.get(transactionId) || null;
    }

    /**
     * Memproses refund
     */
    refund(transactionId: string): PaymentResult | null {
        const original = this.transactions.get(transactionId);
        if (original && original.status === PaymentStatus.SUCCESS) {
            original.status = PaymentStatus.REFUNDED;
            original.message = 'Pembayaran telah di-refund';
            this.log(`Transaksi ${transactionId} di-refund`);
            return original;
        }
        return null;
    }

    private generateTransactionId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `TXN-${timestamp}-${random}`.toUpperCase();
    }

    log(message: string): void {
        console.log(`[PaymentService] ${message}`);
    }
}

// =============================================================================
// SUBSYSTEM 4: NotificationService
// =============================================================================

/**
 * Tipe notifikasi
 */
export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH'
}

/**
 * Subsystem: NotificationService
 * Mengirim notifikasi ke pengguna
 */
export class NotificationService {
    /**
     * Mengirim email konfirmasi booking
     */
    sendBookingConfirmation(user: User, booking: Booking): void {
        this.log(`Mengirim email konfirmasi ke ${user.email}`);
        console.log(`
    ══════════════════════════════════════════════════════════════
    📧 EMAIL NOTIFIKASI
    ══════════════════════════════════════════════════════════════
    Kepada: ${user.name} <${user.email}>
    Subjek: Konfirmasi Booking #${booking.id}
    
    Hai ${user.name},
    
    Terima kasih telah melakukan pemesanan tiket bioskop.
    
    Detail Booking:
    - ID Booking: ${booking.id}
    - Film: ${booking.showtime?.movie.title}
    - Tanggal: ${booking.showtime?.date.toLocaleDateString('id-ID')}
    - Jam: ${booking.showtime?.startTime}
    - Jumlah Tiket: ${booking.tickets.length}
    - Total: Rp ${booking.getTotalPrice().toLocaleString('id-ID')}
    
    Silakan tunjukkan e-ticket saat masuk studio.
    
    Salam,
    Tim Bioskop
    ══════════════════════════════════════════════════════════════
    `);
    }

    /**
     * Mengirim SMS reminder
     */
    sendReminder(user: User, booking: Booking, hoursBeforeShow: number): void {
        this.log(`Mengirim SMS ke ${user.phone}`);
        console.log(`
    ══════════════════════════════════════════════════════════════
    📱 SMS NOTIFIKASI
    ══════════════════════════════════════════════════════════════
    To: ${user.phone}
    
    [REMINDER] Film ${booking.showtime?.movie.title} akan dimulai 
    ${hoursBeforeShow} jam lagi di ${booking.showtime?.cinema.name}.
    ══════════════════════════════════════════════════════════════
    `);
    }

    /**
     * Mengirim notifikasi pembayaran berhasil
     */
    sendPaymentSuccess(user: User, booking: Booking, transactionId: string): void {
        this.log(`Mengirim notifikasi pembayaran ke ${user.email}`);
        console.log(`
    ══════════════════════════════════════════════════════════════
    ✅ PEMBAYARAN BERHASIL
    ══════════════════════════════════════════════════════════════
    ID Transaksi: ${transactionId}
    Booking: ${booking.id}
    Total: Rp ${booking.getTotalPrice().toLocaleString('id-ID')}
    ══════════════════════════════════════════════════════════════
    `);
    }

    /**
     * Mengirim notifikasi pembatalan
     */
    sendCancellation(user: User, booking: Booking): void {
        this.log(`Mengirim notifikasi pembatalan ke ${user.email}`);
    }

    log(message: string): void {
        console.log(`[NotificationService] ${message}`);
    }
}

// =============================================================================
// FACADE: CinemaBookingService
// =============================================================================

/**
 * Hasil proses booking lengkap
 */
export interface BookingResult {
    success: boolean;
    booking?: Booking;
    paymentResult?: PaymentResult;
    message: string;
}

/**
 * FACADE: CinemaBookingService
 * Menyediakan interface sederhana untuk keseluruhan proses booking
 */
export class CinemaBookingService {
    private movieService: MovieService;
    private seatService: SeatService;
    private paymentService: PaymentService;
    private notificationService: NotificationService;

    constructor() {
        // Inisialisasi semua subsystem
        this.movieService = new MovieService();
        this.seatService = new SeatService();
        this.paymentService = new PaymentService();
        this.notificationService = new NotificationService();

        console.log('[CinemaBookingService] Facade siap digunakan');
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * FACADE METHOD: completeBooking
     * ═══════════════════════════════════════════════════════════════
     * Method utama yang menyederhanakan seluruh proses booking kompleks
     * menjadi satu panggilan method.
     * 
     * Langkah-langkah internal:
     * 1. Validasi film dan jadwal
     * 2. Cek ketersediaan kursi
     * 3. Pilih kursi
     * 4. Buat booking
     * 5. Proses pembayaran
     * 6. Kirim notifikasi
     */
    completeBooking(
        user: User,
        showtimeId: string,
        showtime: Showtime,
        seatCodes: string[],
        ticketType: TicketType,
        paymentMethod: string
    ): BookingResult {
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('  PROSES BOOKING DIMULAI');
        console.log('═══════════════════════════════════════════════════════════════\n');

        try {
            // Step 1: Validasi film
            this.movieService.log(`Memvalidasi film: ${showtime.movie.title}`);
            if (showtime.isPast()) {
                return {
                    success: false,
                    message: 'Jadwal tayang sudah lewat'
                };
            }

            // Step 2: Inisialisasi dan cek ketersediaan kursi 
            this.seatService.initializeSeatLayout(
                showtimeId,
                showtime.studio.rowCount,
                showtime.studio.seatsPerRow
            );

            const availableSeats = this.seatService.getAvailableSeats(showtimeId);
            this.seatService.log(`Kursi tersedia: ${availableSeats.length}`);

            // Step 3: Pilih kursi
            const selectedSeats: Seat[] = [];
            for (const code of seatCodes) {
                if (this.seatService.selectSeat(showtimeId, code)) {
                    const seat = this.seatService.getSeat(showtimeId, code);
                    if (seat) selectedSeats.push(seat);
                } else {
                    return {
                        success: false,
                        message: `Kursi ${code} tidak tersedia`
                    };
                }
            }

            // Step 4: Buat booking menggunakan Builder
            const builder = new ConcreteBookingBuilder();
            let builderChain = builder
                .reset()
                .setUser(user)
                .setShowtime(showtime);

            for (const seat of selectedSeats) {
                builderChain = builderChain.addSeat(seat, ticketType);
            }

            const booking = builderChain.build();
            console.log(`[CinemaBookingService] Booking ${booking.id} dibuat`);

            // Step 5: Proses pembayaran
            const paymentResult = this.paymentService.processPayment(
                booking.id,
                booking.getTotalPrice(),
                paymentMethod
            );

            if (paymentResult.status !== PaymentStatus.SUCCESS) {
                // Rollback: kembalikan kursi
                for (const code of seatCodes) {
                    this.seatService.deselectSeat(showtimeId, code);
                }
                return {
                    success: false,
                    paymentResult,
                    message: paymentResult.message
                };
            }

            // Step 6: Finalisasi booking
            this.seatService.bookSelectedSeats(showtimeId);
            booking.status = BookingStatusEnum.PAID;

            // Step 7: Kirim notifikasi
            this.notificationService.sendBookingConfirmation(user, booking);
            this.notificationService.sendPaymentSuccess(user, booking, paymentResult.transactionId);

            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('  BOOKING BERHASIL!');
            console.log('═══════════════════════════════════════════════════════════════\n');

            return {
                success: true,
                booking,
                paymentResult,
                message: 'Booking berhasil! E-ticket telah dikirim ke email Anda.'
            };

        } catch (error) {
            console.error('[CinemaBookingService] Error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Terjadi kesalahan'
            };
        }
    }

    /**
     * Method tambahan untuk operasi sederhana
     */

    getAvailableMovies(): Movie[] {
        return this.movieService.getAllMovies();
    }

    searchMovies(query: string): Movie[] {
        return this.movieService.searchMovies(query);
    }

    getShowtimesForMovie(movieId: string): Showtime[] {
        return this.movieService.getShowtimes(movieId);
    }

    getAvailableSeatsForShowtime(showtimeId: string): Seat[] {
        return this.seatService.getAvailableSeats(showtimeId);
    }

    /**
     * Membatalkan booking
     */
    cancelBooking(booking: Booking, transactionId: string): boolean {
        if (booking.user) {
            // Refund pembayaran
            const refundResult = this.paymentService.refund(transactionId);
            if (refundResult) {
                booking.status = BookingStatusEnum.CANCELLED;
                this.notificationService.sendCancellation(booking.user, booking);
                console.log(`[CinemaBookingService] Booking ${booking.id} dibatalkan`);
                return true;
            }
        }
        return false;
    }
}
