/**
 * =============================================================================
 * STATE PATTERN - Sistem Status Booking Bioskop
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Booking tiket bioskop memiliki berbagai status (Draft, Pending, Confirmed,
 * Paid, Completed, Cancelled) dengan behavior berbeda di setiap status.
 * Misalnya, booking hanya bisa dibayar jika statusnya Pending, dan hanya
 * bisa di-cancel jika belum Completed. Tanpa design pattern, kode akan
 * penuh dengan if-else untuk mengecek status sebelum setiap operasi.
 * 
 * ALASAN PEMILIHAN:
 * State Pattern dipilih karena memungkinkan objek mengubah behavior-nya
 * ketika internal state berubah. Setiap state dienkapsulasi dalam class
 * terpisah, sehingga transisi antar state menjadi jelas dan maintainable.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Context: BookingContext
 * - State Interface: BookingState
 * - Concrete States: DraftState, PendingState, ConfirmedState, PaidState,
 *                    CompletedState, CancelledState
 * =============================================================================
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * STATE INTERFACE
 * ═══════════════════════════════════════════════════════════════
 * Interface yang mendefinisikan semua operasi yang dapat dilakukan
 * pada booking dan perilaku berbeda di setiap state
 */
export interface BookingState {
    /**
     * Mendapatkan nama state
     */
    getName(): string;

    /**
     * Menambahkan kursi ke booking
     */
    addSeat(context: BookingContext): void;

    /**
     * Melanjutkan ke proses pembayaran
     */
    proceedToPayment(context: BookingContext): void;

    /**
     * Melakukan pembayaran
     */
    pay(context: BookingContext, amount: number): void;

    /**
     * Mengkonfirmasi booking setelah pembayaran
     */
    confirm(context: BookingContext): void;

    /**
     * Menyelesaikan booking (setelah film ditonton)
     */
    complete(context: BookingContext): void;

    /**
     * Membatalkan booking
     */
    cancel(context: BookingContext): void;

    /**
     * Meminta refund
     */
    refund(context: BookingContext): void;

    /**
     * Mengecek apakah operasi tertentu diperbolehkan
     */
    canModify(): boolean;
    canPay(): boolean;
    canCancel(): boolean;
    canRefund(): boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONTEXT
 * ═══════════════════════════════════════════════════════════════
 * Context menyimpan reference ke state saat ini dan mendelegasikan
 * operasi ke state tersebut
 */
export class BookingContext {
    private state: BookingState;
    private bookingId: string;
    private customerName: string;
    private movieTitle: string;
    private seats: string[];
    private totalAmount: number;
    private paidAmount: number;
    private transactionId: string | null;
    private stateHistory: StateHistoryEntry[];
    private createdAt: Date;
    private updatedAt: Date;

    constructor(
        customerName: string,
        movieTitle: string,
        bookingId?: string
    ) {
        this.bookingId = bookingId || this.generateBookingId();
        this.customerName = customerName;
        this.movieTitle = movieTitle;
        this.seats = [];
        this.totalAmount = 0;
        this.paidAmount = 0;
        this.transactionId = null;
        this.stateHistory = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();

        // Initial state
        this.state = new DraftState();
        this.logStateChange('Initial');
    }

    private generateBookingId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6);
        return `BKG-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Mengubah state booking
     */
    setState(state: BookingState): void {
        const previousState = this.state.getName();
        this.state = state;
        this.updatedAt = new Date();
        this.logStateChange(previousState);

        console.log(`[Booking ${this.bookingId}] State changed: ${previousState} → ${state.getName()}`);
    }

    private logStateChange(previousState: string): void {
        this.stateHistory.push({
            fromState: previousState,
            toState: this.state.getName(),
            timestamp: new Date()
        });
    }

    // State delegation methods
    addSeat(seatCode: string, price: number): void {
        this.state.addSeat(this);
        if (this.state.canModify()) {
            this.seats.push(seatCode);
            this.totalAmount += price;
            console.log(`[Booking ${this.bookingId}] Seat ${seatCode} added. Total: Rp ${this.totalAmount.toLocaleString()}`);
        }
    }

    proceedToPayment(): void {
        this.state.proceedToPayment(this);
    }

    pay(amount: number): void {
        this.state.pay(this, amount);
    }

    confirm(): void {
        this.state.confirm(this);
    }

    complete(): void {
        this.state.complete(this);
    }

    cancel(): void {
        this.state.cancel(this);
    }

    refund(): void {
        this.state.refund(this);
    }

    // Getters
    getState(): BookingState { return this.state; }
    getStateName(): string { return this.state.getName(); }
    getBookingId(): string { return this.bookingId; }
    getCustomerName(): string { return this.customerName; }
    getMovieTitle(): string { return this.movieTitle; }
    getSeats(): string[] { return [...this.seats]; }
    getTotalAmount(): number { return this.totalAmount; }
    getPaidAmount(): number { return this.paidAmount; }
    getTransactionId(): string | null { return this.transactionId; }
    getStateHistory(): StateHistoryEntry[] { return [...this.stateHistory]; }

    // Setters (digunakan oleh state)
    setPaidAmount(amount: number): void {
        this.paidAmount = amount;
        this.updatedAt = new Date();
    }

    setTransactionId(id: string): void {
        this.transactionId = id;
        this.updatedAt = new Date();
    }

    /**
     * Menampilkan detail booking
     */
    displayDetails(): string {
        const stateIndicators: Record<string, string> = {
            'Draft': '📝',
            'Pending': '⏳',
            'Confirmed': '✅',
            'Paid': '💰',
            'Completed': '🎬',
            'Cancelled': '❌'
        };

        const indicator = stateIndicators[this.state.getName()] || '•';

        return `
╔══════════════════════════════════════════════════════════════╗
║ ${indicator} BOOKING DETAILS                                         ║
╠══════════════════════════════════════════════════════════════╣
║ Booking ID    : ${this.bookingId.padEnd(43)}║
║ Status        : ${this.state.getName().toUpperCase().padEnd(43)}║
║ Customer      : ${this.customerName.padEnd(43)}║
║ Movie         : ${this.movieTitle.padEnd(43)}║
║ Seats         : ${this.seats.join(', ').padEnd(43)}║
║ Total Amount  : Rp ${this.totalAmount.toLocaleString('id-ID').padEnd(40)}║
║ Paid Amount   : Rp ${this.paidAmount.toLocaleString('id-ID').padEnd(40)}║
╠══════════════════════════════════════════════════════════════╣
║ Can Modify: ${this.state.canModify() ? 'Yes' : 'No'}  │ Can Pay: ${this.state.canPay() ? 'Yes' : 'No'}  │ Can Cancel: ${this.state.canCancel() ? 'Yes' : 'No'}      ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
    }

    /**
     * Menampilkan history state
     */
    displayStateHistory(): string {
        let output = '\n═══ STATE HISTORY ═══\n';
        for (const entry of this.stateHistory) {
            const time = entry.timestamp.toLocaleTimeString('id-ID');
            output += `${time}: ${entry.fromState} → ${entry.toState}\n`;
        }
        return output;
    }
}

interface StateHistoryEntry {
    fromState: string;
    toState: string;
    timestamp: Date;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: DraftState
 * ═══════════════════════════════════════════════════════════════
 * State awal ketika booking baru dibuat
 */
export class DraftState implements BookingState {
    getName(): string { return 'Draft'; }

    addSeat(context: BookingContext): void {
        console.log('[Draft] Adding seat to booking...');
        // Allowed in Draft state
    }

    proceedToPayment(context: BookingContext): void {
        if (context.getSeats().length === 0) {
            console.log('[Draft] Cannot proceed: No seats selected');
            return;
        }
        console.log('[Draft] Proceeding to payment...');
        context.setState(new PendingState());
    }

    pay(context: BookingContext, amount: number): void {
        console.log('[Draft] Cannot pay yet. Please proceed to payment first.');
    }

    confirm(context: BookingContext): void {
        console.log('[Draft] Cannot confirm. Booking is still in draft.');
    }

    complete(context: BookingContext): void {
        console.log('[Draft] Cannot complete. Booking is still in draft.');
    }

    cancel(context: BookingContext): void {
        console.log('[Draft] Cancelling draft booking...');
        context.setState(new CancelledState());
    }

    refund(context: BookingContext): void {
        console.log('[Draft] Cannot refund. No payment made.');
    }

    canModify(): boolean { return true; }
    canPay(): boolean { return false; }
    canCancel(): boolean { return true; }
    canRefund(): boolean { return false; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: PendingState
 * ═══════════════════════════════════════════════════════════════
 * Booking menunggu pembayaran
 */
export class PendingState implements BookingState {
    getName(): string { return 'Pending'; }

    addSeat(context: BookingContext): void {
        console.log('[Pending] Cannot add seat. Booking is pending payment.');
    }

    proceedToPayment(context: BookingContext): void {
        console.log('[Pending] Already in payment stage.');
    }

    pay(context: BookingContext, amount: number): void {
        const required = context.getTotalAmount();

        if (amount < required) {
            console.log(`[Pending] Payment insufficient. Required: Rp ${required.toLocaleString()}, Received: Rp ${amount.toLocaleString()}`);
            return;
        }

        console.log(`[Pending] Payment received: Rp ${amount.toLocaleString()}`);
        context.setPaidAmount(amount);
        context.setTransactionId(`TXN-${Date.now().toString(36).toUpperCase()}`);
        context.setState(new PaidState());
    }

    confirm(context: BookingContext): void {
        console.log('[Pending] Cannot confirm. Payment required first.');
    }

    complete(context: BookingContext): void {
        console.log('[Pending] Cannot complete. Payment required first.');
    }

    cancel(context: BookingContext): void {
        console.log('[Pending] Cancelling pending booking...');
        context.setState(new CancelledState());
    }

    refund(context: BookingContext): void {
        console.log('[Pending] Cannot refund. No payment made yet.');
    }

    canModify(): boolean { return false; }
    canPay(): boolean { return true; }
    canCancel(): boolean { return true; }
    canRefund(): boolean { return false; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: PaidState
 * ═══════════════════════════════════════════════════════════════
 * Pembayaran sudah diterima
 */
export class PaidState implements BookingState {
    getName(): string { return 'Paid'; }

    addSeat(context: BookingContext): void {
        console.log('[Paid] Cannot add seat. Booking already paid.');
    }

    proceedToPayment(context: BookingContext): void {
        console.log('[Paid] Already paid.');
    }

    pay(context: BookingContext, amount: number): void {
        console.log('[Paid] Already paid.');
    }

    confirm(context: BookingContext): void {
        console.log('[Paid] Confirming booking...');
        console.log('[Paid] Sending e-ticket to customer...');
        context.setState(new ConfirmedState());
    }

    complete(context: BookingContext): void {
        console.log('[Paid] Cannot complete. Please confirm first.');
    }

    cancel(context: BookingContext): void {
        console.log('[Paid] Cannot cancel after payment. Please request refund.');
    }

    refund(context: BookingContext): void {
        console.log('[Paid] Processing refund...');
        console.log(`[Paid] Refunding Rp ${context.getPaidAmount().toLocaleString()} to customer...`);
        context.setState(new CancelledState());
    }

    canModify(): boolean { return false; }
    canPay(): boolean { return false; }
    canCancel(): boolean { return false; }
    canRefund(): boolean { return true; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: ConfirmedState
 * ═══════════════════════════════════════════════════════════════
 * Booking sudah dikonfirmasi, e-ticket terbit
 */
export class ConfirmedState implements BookingState {
    getName(): string { return 'Confirmed'; }

    addSeat(context: BookingContext): void {
        console.log('[Confirmed] Cannot add seat. Booking already confirmed.');
    }

    proceedToPayment(context: BookingContext): void {
        console.log('[Confirmed] Already confirmed.');
    }

    pay(context: BookingContext, amount: number): void {
        console.log('[Confirmed] Already paid.');
    }

    confirm(context: BookingContext): void {
        console.log('[Confirmed] Already confirmed.');
    }

    complete(context: BookingContext): void {
        console.log('[Confirmed] Completing booking (customer watched the movie)...');
        context.setState(new CompletedState());
    }

    cancel(context: BookingContext): void {
        console.log('[Confirmed] Booking confirmed. Request refund if needed (subject to policy).');
    }

    refund(context: BookingContext): void {
        console.log('[Confirmed] Processing refund (partial refund may apply)...');
        const refundAmount = Math.round(context.getPaidAmount() * 0.8); // 80% refund
        console.log(`[Confirmed] Refunding Rp ${refundAmount.toLocaleString()} (80% of payment)...`);
        context.setState(new CancelledState());
    }

    canModify(): boolean { return false; }
    canPay(): boolean { return false; }
    canCancel(): boolean { return false; }
    canRefund(): boolean { return true; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: CompletedState
 * ═══════════════════════════════════════════════════════════════
 * Booking selesai (customer sudah menonton)
 */
export class CompletedState implements BookingState {
    getName(): string { return 'Completed'; }

    addSeat(context: BookingContext): void {
        console.log('[Completed] Booking completed. No changes allowed.');
    }

    proceedToPayment(context: BookingContext): void {
        console.log('[Completed] Booking completed.');
    }

    pay(context: BookingContext, amount: number): void {
        console.log('[Completed] Booking completed.');
    }

    confirm(context: BookingContext): void {
        console.log('[Completed] Booking completed.');
    }

    complete(context: BookingContext): void {
        console.log('[Completed] Already completed.');
    }

    cancel(context: BookingContext): void {
        console.log('[Completed] Cannot cancel completed booking.');
    }

    refund(context: BookingContext): void {
        console.log('[Completed] Cannot refund completed booking.');
    }

    canModify(): boolean { return false; }
    canPay(): boolean { return false; }
    canCancel(): boolean { return false; }
    canRefund(): boolean { return false; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STATE: CancelledState
 * ═══════════════════════════════════════════════════════════════
 * Booking dibatalkan
 */
export class CancelledState implements BookingState {
    getName(): string { return 'Cancelled'; }

    addSeat(context: BookingContext): void {
        console.log('[Cancelled] Booking cancelled. No changes allowed.');
    }

    proceedToPayment(context: BookingContext): void {
        console.log('[Cancelled] Booking cancelled.');
    }

    pay(context: BookingContext, amount: number): void {
        console.log('[Cancelled] Booking cancelled.');
    }

    confirm(context: BookingContext): void {
        console.log('[Cancelled] Booking cancelled.');
    }

    complete(context: BookingContext): void {
        console.log('[Cancelled] Booking cancelled.');
    }

    cancel(context: BookingContext): void {
        console.log('[Cancelled] Already cancelled.');
    }

    refund(context: BookingContext): void {
        console.log('[Cancelled] Already cancelled/refunded.');
    }

    canModify(): boolean { return false; }
    canPay(): boolean { return false; }
    canCancel(): boolean { return false; }
    canRefund(): boolean { return false; }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * STATE MACHINE DIAGRAM (untuk dokumentasi)
 * ═══════════════════════════════════════════════════════════════
 * 
 *  ┌─────────┐
 *  │  DRAFT  │ ───────────────────────────────────────┐
 *  └────┬────┘                                        │
 *       │ proceedToPayment()                          │ cancel()
 *       ▼                                             ▼
 *  ┌─────────┐                                   ┌───────────┐
 *  │ PENDING │ ──────────────────────────────────│ CANCELLED │
 *  └────┬────┘ cancel()                          └───────────┘
 *       │ pay()                                       ▲
 *       ▼                                             │
 *  ┌─────────┐                                        │
 *  │  PAID   │ ───────────────────────────────────────┤ refund()
 *  └────┬────┘                                        │
 *       │ confirm()                                   │
 *       ▼                                             │
 *  ┌───────────┐                                      │
 *  │ CONFIRMED │ ─────────────────────────────────────┘ refund()
 *  └─────┬─────┘
 *        │ complete()
 *        ▼
 *  ┌───────────┐
 *  │ COMPLETED │
 *  └───────────┘
 * 
 */
