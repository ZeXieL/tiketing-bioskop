/**
 * =============================================================================
 * COMMAND PATTERN - Sistem Pemilihan Kursi dengan Undo/Redo
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Proses pemilihan kursi bioskop memungkinkan pengguna untuk:
 * - Memilih dan membatalkan pilihan kursi berkali-kali
 * - Melakukan undo (membatalkan pilihan terakhir)
 * - Melakukan redo (mengulangi pilihan yang dibatalkan)
 * 
 * Tanpa design pattern, implementasi undo/redo akan memerlukan tracking
 * state manual yang kompleks dan mudah error.
 * 
 * ALASAN PEMILIHAN:
 * Command Pattern dipilih untuk mengenkapsulasi setiap aksi pemilihan kursi
 * sebagai objek command. Setiap command menyimpan informasi yang diperlukan
 * untuk execute dan undo. History command memungkinkan implementasi
 * undo/redo yang clean.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Command Interface: SeatCommand
 * - Concrete Commands: SelectSeatCommand, DeselectSeatCommand, 
 *                      SelectMultipleSeatsCommand
 * - Receiver: SeatManager
 * - Invoker: SeatSelectionInvoker
 * =============================================================================
 */

import { Seat, SeatImpl, SeatType, SeatStatus } from '../models/Seat';

/**
 * ═══════════════════════════════════════════════════════════════
 * COMMAND INTERFACE
 * ═══════════════════════════════════════════════════════════════
 */
export interface SeatCommand {
    /**
     * Menjalankan command
     */
    execute(): boolean;

    /**
     * Membatalkan command (undo)
     */
    undo(): boolean;

    /**
     * Mendapatkan deskripsi command untuk logging
     */
    getDescription(): string;

    /**
     * Mendapatkan timestamp eksekusi
     */
    getTimestamp(): Date | null;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * RECEIVER: SeatManager
 * ═══════════════════════════════════════════════════════════════
 * Class yang melakukan operasi sebenarnya pada kursi
 */
export class SeatManager {
    private seats: Map<string, Seat> = new Map();
    private selectedSeats: Set<string> = new Set();

    constructor() {
        console.log('[SeatManager] Initialized');
    }

    /**
     * Inisialisasi kursi untuk showtime tertentu
     */
    initializeSeats(showtimeId: string, rows: number, seatsPerRow: number, basePrice: number): void {
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let r = 0; r < rows; r++) {
            for (let s = 1; s <= seatsPerRow; s++) {
                const rowLabel = rowLabels[r];
                const seatCode = `${rowLabel}${s}`;
                const seatId = `${showtimeId}-${seatCode}`;
                const seatType = r >= rows - 2 ? SeatType.VIP : SeatType.REGULAR;
                const price = seatType === SeatType.VIP ? basePrice * 1.5 : basePrice;

                // Simulasi kursi sudah terisi random
                const isBooked = Math.random() < 0.15; // 15% already booked

                this.seats.set(seatCode, new SeatImpl(
                    seatId,
                    rowLabel,
                    s,
                    seatType,
                    isBooked ? SeatStatus.BOOKED : SeatStatus.AVAILABLE,
                    price
                ));
            }
        }

        console.log(`[SeatManager] Initialized ${rows * seatsPerRow} seats`);
    }

    /**
     * Mendapatkan kursi berdasarkan kode
     */
    getSeat(seatCode: string): Seat | undefined {
        return this.seats.get(seatCode);
    }

    /**
     * Memilih kursi
     */
    selectSeat(seatCode: string): boolean {
        const seat = this.seats.get(seatCode);
        if (!seat) {
            console.log(`[SeatManager] Seat ${seatCode} not found`);
            return false;
        }

        if (seat.status !== SeatStatus.AVAILABLE) {
            console.log(`[SeatManager] Seat ${seatCode} is not available (status: ${seat.status})`);
            return false;
        }

        (seat as SeatImpl).status = SeatStatus.SELECTED;
        this.selectedSeats.add(seatCode);
        console.log(`[SeatManager] Seat ${seatCode} SELECTED`);
        return true;
    }

    /**
     * Membatalkan pilihan kursi
     */
    deselectSeat(seatCode: string): boolean {
        const seat = this.seats.get(seatCode);
        if (!seat) {
            console.log(`[SeatManager] Seat ${seatCode} not found`);
            return false;
        }

        if (seat.status !== SeatStatus.SELECTED) {
            console.log(`[SeatManager] Seat ${seatCode} is not selected`);
            return false;
        }

        (seat as SeatImpl).status = SeatStatus.AVAILABLE;
        this.selectedSeats.delete(seatCode);
        console.log(`[SeatManager] Seat ${seatCode} DESELECTED`);
        return true;
    }

    /**
     * Mendapatkan kursi yang dipilih
     */
    getSelectedSeats(): Seat[] {
        const selected: Seat[] = [];
        for (const code of this.selectedSeats) {
            const seat = this.seats.get(code);
            if (seat) selected.push(seat);
        }
        return selected;
    }

    /**
     * Mendapatkan total harga kursi yang dipilih
     */
    getSelectedSeatsTotal(): number {
        return this.getSelectedSeats().reduce((sum, seat) => sum + seat.price, 0);
    }

    /**
     * Mendapatkan semua kursi
     */
    getAllSeats(): Seat[] {
        return Array.from(this.seats.values());
    }

    /**
     * Mendapatkan kursi yang tersedia
     */
    getAvailableSeats(): Seat[] {
        return this.getAllSeats().filter(seat => seat.status === SeatStatus.AVAILABLE);
    }

    /**
     * Mengkonfirmasi booking (mengubah SELECTED menjadi BOOKED)
     */
    confirmBooking(): boolean {
        if (this.selectedSeats.size === 0) {
            console.log('[SeatManager] No seats to confirm');
            return false;
        }

        for (const code of this.selectedSeats) {
            const seat = this.seats.get(code);
            if (seat) {
                (seat as SeatImpl).status = SeatStatus.BOOKED;
            }
        }

        const count = this.selectedSeats.size;
        this.selectedSeats.clear();
        console.log(`[SeatManager] ${count} seats BOOKED`);
        return true;
    }

    /**
     * Menampilkan layout kursi
     */
    displayLayout(): string {
        if (this.seats.size === 0) return 'No seats initialized';

        const seatsByRow = new Map<string, Seat[]>();
        for (const seat of this.seats.values()) {
            const rowSeats = seatsByRow.get(seat.row) || [];
            rowSeats.push(seat);
            seatsByRow.set(seat.row, rowSeats);
        }

        let output = `
╔══════════════════════════════════════════════════════════════╗
║                         [ LAYAR ]                            ║
╠══════════════════════════════════════════════════════════════╣
`;

        const sortedRows = Array.from(seatsByRow.entries())
            .sort((a, b) => a[0].localeCompare(b[0]));

        for (const [rowLabel, rowSeats] of sortedRows) {
            rowSeats.sort((a, b) => a.number - b.number);

            output += `║  ${rowLabel}  `;
            for (const seat of rowSeats) {
                let symbol: string;
                switch (seat.status) {
                    case SeatStatus.AVAILABLE:
                        symbol = seat.type === SeatType.VIP ? '◇' : '○';
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
            output += `   ${rowLabel}  ║\n`;
        }

        const selectedCount = this.selectedSeats.size;
        const total = this.getSelectedSeatsTotal();

        output += `╠══════════════════════════════════════════════════════════════╣
║  ○ Available  ◇ VIP  ● Selected  ✕ Booked                    ║
╠══════════════════════════════════════════════════════════════╣
║  Selected: ${selectedCount.toString().padEnd(3)} seats    Total: Rp ${total.toLocaleString('id-ID').padEnd(20)}║
╚══════════════════════════════════════════════════════════════╝`;

        return output;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE COMMAND 1: SelectSeatCommand
 * ═══════════════════════════════════════════════════════════════
 */
export class SelectSeatCommand implements SeatCommand {
    private seatManager: SeatManager;
    private seatCode: string;
    private executed: boolean = false;
    private timestamp: Date | null = null;

    constructor(seatManager: SeatManager, seatCode: string) {
        this.seatManager = seatManager;
        this.seatCode = seatCode;
    }

    execute(): boolean {
        if (this.executed) {
            console.log(`[SelectSeatCommand] Already executed for ${this.seatCode}`);
            return false;
        }

        const success = this.seatManager.selectSeat(this.seatCode);
        if (success) {
            this.executed = true;
            this.timestamp = new Date();
        }
        return success;
    }

    undo(): boolean {
        if (!this.executed) {
            console.log(`[SelectSeatCommand] Cannot undo - not executed`);
            return false;
        }

        const success = this.seatManager.deselectSeat(this.seatCode);
        if (success) {
            this.executed = false;
        }
        return success;
    }

    getDescription(): string {
        return `Select seat ${this.seatCode}`;
    }

    getTimestamp(): Date | null {
        return this.timestamp;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE COMMAND 2: DeselectSeatCommand
 * ═══════════════════════════════════════════════════════════════
 */
export class DeselectSeatCommand implements SeatCommand {
    private seatManager: SeatManager;
    private seatCode: string;
    private executed: boolean = false;
    private timestamp: Date | null = null;

    constructor(seatManager: SeatManager, seatCode: string) {
        this.seatManager = seatManager;
        this.seatCode = seatCode;
    }

    execute(): boolean {
        if (this.executed) {
            console.log(`[DeselectSeatCommand] Already executed for ${this.seatCode}`);
            return false;
        }

        const success = this.seatManager.deselectSeat(this.seatCode);
        if (success) {
            this.executed = true;
            this.timestamp = new Date();
        }
        return success;
    }

    undo(): boolean {
        if (!this.executed) {
            console.log(`[DeselectSeatCommand] Cannot undo - not executed`);
            return false;
        }

        const success = this.seatManager.selectSeat(this.seatCode);
        if (success) {
            this.executed = false;
        }
        return success;
    }

    getDescription(): string {
        return `Deselect seat ${this.seatCode}`;
    }

    getTimestamp(): Date | null {
        return this.timestamp;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE COMMAND 3: SelectMultipleSeatsCommand
 * ═══════════════════════════════════════════════════════════════
 * Composite command untuk memilih beberapa kursi sekaligus
 */
export class SelectMultipleSeatsCommand implements SeatCommand {
    private seatManager: SeatManager;
    private seatCodes: string[];
    private successfullyCodes: string[] = [];
    private executed: boolean = false;
    private timestamp: Date | null = null;

    constructor(seatManager: SeatManager, seatCodes: string[]) {
        this.seatManager = seatManager;
        this.seatCodes = seatCodes;
    }

    execute(): boolean {
        if (this.executed) {
            console.log(`[SelectMultipleSeatsCommand] Already executed`);
            return false;
        }

        console.log(`[SelectMultipleSeatsCommand] Selecting ${this.seatCodes.length} seats...`);

        this.successfullyCodes = [];
        for (const code of this.seatCodes) {
            if (this.seatManager.selectSeat(code)) {
                this.successfullyCodes.push(code);
            }
        }

        this.executed = true;
        this.timestamp = new Date();

        const success = this.successfullyCodes.length === this.seatCodes.length;
        console.log(`[SelectMultipleSeatsCommand] ${this.successfullyCodes.length}/${this.seatCodes.length} seats selected`);

        return success;
    }

    undo(): boolean {
        if (!this.executed) {
            console.log(`[SelectMultipleSeatsCommand] Cannot undo - not executed`);
            return false;
        }

        console.log(`[SelectMultipleSeatsCommand] Undoing selection of ${this.successfullyCodes.length} seats...`);

        // Undo in reverse order
        for (let i = this.successfullyCodes.length - 1; i >= 0; i--) {
            this.seatManager.deselectSeat(this.successfullyCodes[i]);
        }

        this.successfullyCodes = [];
        this.executed = false;
        return true;
    }

    getDescription(): string {
        return `Select multiple seats: ${this.seatCodes.join(', ')}`;
    }

    getTimestamp(): Date | null {
        return this.timestamp;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * INVOKER: SeatSelectionInvoker
 * ═══════════════════════════════════════════════════════════════
 * Mengelola eksekusi command dan history untuk undo/redo
 */
export class SeatSelectionInvoker {
    private undoStack: SeatCommand[] = [];
    private redoStack: SeatCommand[] = [];
    private maxHistorySize: number;

    constructor(maxHistorySize: number = 50) {
        this.maxHistorySize = maxHistorySize;
        console.log('[SeatSelectionInvoker] Initialized');
    }

    /**
     * Menjalankan command
     */
    executeCommand(command: SeatCommand): boolean {
        const success = command.execute();

        if (success) {
            this.undoStack.push(command);
            this.redoStack = []; // Clear redo stack after new command

            // Limit history size
            if (this.undoStack.length > this.maxHistorySize) {
                this.undoStack.shift();
            }
        }

        return success;
    }

    /**
     * Undo command terakhir
     */
    undo(): boolean {
        if (this.undoStack.length === 0) {
            console.log('[Invoker] Nothing to undo');
            return false;
        }

        const command = this.undoStack.pop()!;
        console.log(`[Invoker] Undoing: ${command.getDescription()}`);

        const success = command.undo();
        if (success) {
            this.redoStack.push(command);
        }

        return success;
    }

    /**
     * Redo command terakhir yang di-undo
     */
    redo(): boolean {
        if (this.redoStack.length === 0) {
            console.log('[Invoker] Nothing to redo');
            return false;
        }

        const command = this.redoStack.pop()!;
        console.log(`[Invoker] Redoing: ${command.getDescription()}`);

        const success = command.execute();
        if (success) {
            this.undoStack.push(command);
        }

        return success;
    }

    /**
     * Mengecek apakah undo tersedia
     */
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /**
     * Mengecek apakah redo tersedia
     */
    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /**
     * Mendapatkan jumlah command di undo stack
     */
    getUndoCount(): number {
        return this.undoStack.length;
    }

    /**
     * Mendapatkan jumlah command di redo stack
     */
    getRedoCount(): number {
        return this.redoStack.length;
    }

    /**
     * Mendapatkan history command
     */
    getHistory(): string[] {
        return this.undoStack.map(cmd => {
            const ts = cmd.getTimestamp();
            const time = ts ? ts.toLocaleTimeString('id-ID') : '??:??:??';
            return `[${time}] ${cmd.getDescription()}`;
        });
    }

    /**
     * Clear semua history
     */
    clearHistory(): void {
        this.undoStack = [];
        this.redoStack = [];
        console.log('[Invoker] History cleared');
    }

    /**
     * Menampilkan status undo/redo
     */
    displayStatus(): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║                    SEAT SELECTION HISTORY                    ║
╠══════════════════════════════════════════════════════════════╣
║ Undo available: ${this.canUndo() ? 'Yes' : 'No '}  (${this.getUndoCount()} commands)                        ║
║ Redo available: ${this.canRedo() ? 'Yes' : 'No '}  (${this.getRedoCount()} commands)                        ║
╠══════════════════════════════════════════════════════════════╣
║ Recent Commands:                                             ║
${this.getHistory().slice(-5).map(h => `║   ${h.padEnd(58)}║`).join('\n') || '║   (no history)                                               ║'}
╚══════════════════════════════════════════════════════════════╝`;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SEAT SELECTION CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * Facade yang menggabungkan semua komponen
 */
export class SeatSelectionController {
    private seatManager: SeatManager;
    private invoker: SeatSelectionInvoker;

    constructor() {
        this.seatManager = new SeatManager();
        this.invoker = new SeatSelectionInvoker();
    }

    /**
     * Inisialisasi untuk showtime
     */
    initializeForShowtime(showtimeId: string, rows: number = 10, seatsPerRow: number = 15, basePrice: number = 50000): void {
        this.seatManager.initializeSeats(showtimeId, rows, seatsPerRow, basePrice);
        this.invoker.clearHistory();
    }

    /**
     * Pilih kursi
     */
    selectSeat(seatCode: string): boolean {
        const command = new SelectSeatCommand(this.seatManager, seatCode);
        return this.invoker.executeCommand(command);
    }

    /**
     * Batalkan pilihan kursi
     */
    deselectSeat(seatCode: string): boolean {
        const command = new DeselectSeatCommand(this.seatManager, seatCode);
        return this.invoker.executeCommand(command);
    }

    /**
     * Pilih beberapa kursi sekaligus
     */
    selectMultipleSeats(seatCodes: string[]): boolean {
        const command = new SelectMultipleSeatsCommand(this.seatManager, seatCodes);
        return this.invoker.executeCommand(command);
    }

    /**
     * Undo
     */
    undo(): boolean {
        return this.invoker.undo();
    }

    /**
     * Redo
     */
    redo(): boolean {
        return this.invoker.redo();
    }

    /**
     * Konfirmasi booking
     */
    confirmBooking(): boolean {
        return this.seatManager.confirmBooking();
    }

    /**
     * Mendapatkan kursi yang dipilih
     */
    getSelectedSeats(): Seat[] {
        return this.seatManager.getSelectedSeats();
    }

    /**
     * Mendapatkan total harga
     */
    getTotal(): number {
        return this.seatManager.getSelectedSeatsTotal();
    }

    /**
     * Tampilkan layout
     */
    displayLayout(): string {
        return this.seatManager.displayLayout();
    }

    /**
     * Tampilkan status undo/redo
     */
    displayHistory(): string {
        return this.invoker.displayStatus();
    }

    /**
     * Check undo availability
     */
    canUndo(): boolean {
        return this.invoker.canUndo();
    }

    /**
     * Check redo availability
     */
    canRedo(): boolean {
        return this.invoker.canRedo();
    }
}
