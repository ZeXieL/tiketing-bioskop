/**
 * =============================================================================
 * STRATEGY PATTERN - Sistem Metode Pembayaran Bioskop
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Sistem bioskop mendukung berbagai metode pembayaran (Credit Card, E-Wallet,
 * Bank Transfer, QRIS) dengan algoritma dan proses validasi yang berbeda.
 * Tanpa design pattern, kode pembayaran akan berisi switch-case besar yang
 * sulit di-maintain dan melanggar Open/Closed Principle.
 * 
 * ALASAN PEMILIHAN:
 * Strategy Pattern dipilih untuk mengenkapsulasi setiap algoritma pembayaran
 * dalam class terpisah. Client dapat memilih strategi pembayaran saat runtime
 * tanpa mengubah kode context. Mudah menambahkan metode pembayaran baru.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Strategy Interface: PaymentStrategy
 * - Concrete Strategies: CreditCardStrategy, EWalletStrategy, 
 *                        BankTransferStrategy, QRISStrategy
 * - Context: PaymentProcessor
 * =============================================================================
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * STRATEGY RESULTS
 * ═══════════════════════════════════════════════════════════════
 */
export interface PaymentResult {
    success: boolean;
    transactionId: string;
    amount: number;
    fee: number;
    totalCharged: number;
    method: string;
    message: string;
    timestamp: Date;
    receiptNumber?: string;
    additionalInfo?: Record<string, any>;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * ═══════════════════════════════════════════════════════════════
 * STRATEGY INTERFACE
 * ═══════════════════════════════════════════════════════════════
 */
export interface PaymentStrategy {
    /**
     * Nama metode pembayaran
     */
    getName(): string;

    /**
     * Mendapatkan deskripsi singkat
     */
    getDescription(): string;

    /**
     * Menghitung biaya admin (fee)
     */
    calculateFee(amount: number): number;

    /**
     * Validasi data pembayaran
     */
    validate(paymentData: PaymentData): ValidationResult;

    /**
     * Proses pembayaran
     */
    processPayment(amount: number, paymentData: PaymentData): PaymentResult;

    /**
     * Mendapatkan icon untuk UI
     */
    getIcon(): string;
}

/**
 * Data pembayaran generik
 */
export interface PaymentData {
    // Credit Card
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;

    // E-Wallet
    phoneNumber?: string;
    walletType?: string;

    // Bank Transfer
    bankCode?: string;
    accountNumber?: string;

    // QRIS
    qrisData?: string;

    // Common
    customerEmail?: string;
    customerName?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STRATEGY 1: CreditCardStrategy
 * ═══════════════════════════════════════════════════════════════
 */
export class CreditCardStrategy implements PaymentStrategy {
    private readonly ADMIN_FEE_PERCENTAGE = 0.025; // 2.5%
    private readonly MIN_FEE = 5000;

    getName(): string {
        return 'Credit Card';
    }

    getDescription(): string {
        return 'Bayar dengan kartu kredit (Visa, Mastercard, JCB)';
    }

    getIcon(): string {
        return '💳';
    }

    calculateFee(amount: number): number {
        const fee = Math.round(amount * this.ADMIN_FEE_PERCENTAGE);
        return Math.max(fee, this.MIN_FEE);
    }

    validate(paymentData: PaymentData): ValidationResult {
        const errors: string[] = [];

        // Validate card number (16 digits)
        if (!paymentData.cardNumber) {
            errors.push('Nomor kartu diperlukan');
        } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
            errors.push('Nomor kartu harus 16 digit');
        }

        // Validate card holder
        if (!paymentData.cardHolder || paymentData.cardHolder.length < 3) {
            errors.push('Nama pemegang kartu diperlukan');
        }

        // Validate expiry (MM/YY)
        if (!paymentData.expiryDate) {
            errors.push('Tanggal kadaluarsa diperlukan');
        } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
            errors.push('Format tanggal kadaluarsa: MM/YY');
        } else {
            const [month, year] = paymentData.expiryDate.split('/').map(Number);
            const now = new Date();
            const expiry = new Date(2000 + year, month - 1);
            if (expiry < now) {
                errors.push('Kartu sudah kadaluarsa');
            }
        }

        // Validate CVV
        if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) {
            errors.push('CVV harus 3-4 digit');
        }

        return { isValid: errors.length === 0, errors };
    }

    processPayment(amount: number, paymentData: PaymentData): PaymentResult {
        console.log(`[CreditCard] Processing payment of Rp ${amount.toLocaleString()}`);

        // Validate first
        const validation = this.validate(paymentData);
        if (!validation.isValid) {
            return {
                success: false,
                transactionId: '',
                amount,
                fee: 0,
                totalCharged: 0,
                method: this.getName(),
                message: `Validation failed: ${validation.errors.join(', ')}`,
                timestamp: new Date()
            };
        }

        // Simulate payment processing
        const fee = this.calculateFee(amount);
        const totalCharged = amount + fee;
        const transactionId = this.generateTransactionId();

        // Simulate card verification (always success for demo)
        const lastFour = paymentData.cardNumber?.slice(-4) || '****';

        console.log(`[CreditCard] Card ending in ${lastFour} charged Rp ${totalCharged.toLocaleString()}`);

        return {
            success: true,
            transactionId,
            amount,
            fee,
            totalCharged,
            method: this.getName(),
            message: `Pembayaran dengan kartu **** ${lastFour} berhasil`,
            timestamp: new Date(),
            receiptNumber: `RCP-CC-${Date.now()}`,
            additionalInfo: {
                cardType: this.detectCardType(paymentData.cardNumber || ''),
                lastFour
            }
        };
    }

    private generateTransactionId(): string {
        return `TXN-CC-${Date.now().toString(36).toUpperCase()}`;
    }

    private detectCardType(cardNumber: string): string {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'Visa';
        if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
        if (/^35/.test(cleaned)) return 'JCB';
        return 'Unknown';
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STRATEGY 2: EWalletStrategy
 * ═══════════════════════════════════════════════════════════════
 */
export enum EWalletType {
    GOPAY = 'GoPay',
    OVO = 'OVO',
    DANA = 'DANA',
    SHOPEEPAY = 'ShopeePay',
    LINKAJA = 'LinkAja'
}

export class EWalletStrategy implements PaymentStrategy {
    private readonly FLAT_FEE = 1500;
    private walletType: EWalletType;

    constructor(walletType: EWalletType = EWalletType.GOPAY) {
        this.walletType = walletType;
    }

    getName(): string {
        return `E-Wallet (${this.walletType})`;
    }

    getDescription(): string {
        return `Bayar dengan ${this.walletType} - Instan & Praktis`;
    }

    getIcon(): string {
        const icons: Record<EWalletType, string> = {
            [EWalletType.GOPAY]: '🟢',
            [EWalletType.OVO]: '🟣',
            [EWalletType.DANA]: '🔵',
            [EWalletType.SHOPEEPAY]: '🟠',
            [EWalletType.LINKAJA]: '🔴'
        };
        return icons[this.walletType];
    }

    calculateFee(amount: number): number {
        return this.FLAT_FEE;
    }

    validate(paymentData: PaymentData): ValidationResult {
        const errors: string[] = [];

        if (!paymentData.phoneNumber) {
            errors.push('Nomor telepon diperlukan');
        } else if (!/^(\+62|62|0)8\d{8,11}$/.test(paymentData.phoneNumber)) {
            errors.push('Format nomor telepon tidak valid');
        }

        return { isValid: errors.length === 0, errors };
    }

    processPayment(amount: number, paymentData: PaymentData): PaymentResult {
        console.log(`[${this.walletType}] Processing payment of Rp ${amount.toLocaleString()}`);

        const validation = this.validate(paymentData);
        if (!validation.isValid) {
            return {
                success: false,
                transactionId: '',
                amount,
                fee: 0,
                totalCharged: 0,
                method: this.getName(),
                message: `Validation failed: ${validation.errors.join(', ')}`,
                timestamp: new Date()
            };
        }

        // Simulate push notification to wallet app
        const fee = this.calculateFee(amount);
        const totalCharged = amount + fee;
        const transactionId = `TXN-${this.walletType.toUpperCase().replace(/\s/g, '')}-${Date.now().toString(36).toUpperCase()}`;

        console.log(`[${this.walletType}] Push notification sent to ${paymentData.phoneNumber}`);
        console.log(`[${this.walletType}] Payment approved`);

        return {
            success: true,
            transactionId,
            amount,
            fee,
            totalCharged,
            method: this.getName(),
            message: `Pembayaran ${this.walletType} berhasil`,
            timestamp: new Date(),
            receiptNumber: `RCP-EWL-${Date.now()}`,
            additionalInfo: {
                walletType: this.walletType,
                phoneNumber: this.maskPhone(paymentData.phoneNumber || '')
            }
        };
    }

    private maskPhone(phone: string): string {
        if (phone.length < 4) return phone;
        return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STRATEGY 3: BankTransferStrategy
 * ═══════════════════════════════════════════════════════════════
 */
export enum BankCode {
    BCA = 'BCA',
    BNI = 'BNI',
    BRI = 'BRI',
    MANDIRI = 'MANDIRI',
    CIMB = 'CIMB',
    PERMATA = 'PERMATA'
}

export class BankTransferStrategy implements PaymentStrategy {
    private readonly ADMIN_FEE = 4000;
    private bankCode: BankCode;

    constructor(bankCode: BankCode = BankCode.BCA) {
        this.bankCode = bankCode;
    }

    getName(): string {
        return `Bank Transfer (${this.bankCode})`;
    }

    getDescription(): string {
        return `Transfer via Virtual Account ${this.bankCode}`;
    }

    getIcon(): string {
        return '🏦';
    }

    calculateFee(amount: number): number {
        return this.ADMIN_FEE;
    }

    validate(paymentData: PaymentData): ValidationResult {
        const errors: string[] = [];

        if (!paymentData.customerName || paymentData.customerName.length < 3) {
            errors.push('Nama customer diperlukan');
        }

        if (!paymentData.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.customerEmail)) {
            errors.push('Email customer tidak valid');
        }

        return { isValid: errors.length === 0, errors };
    }

    processPayment(amount: number, paymentData: PaymentData): PaymentResult {
        console.log(`[${this.bankCode}] Creating virtual account...`);

        const validation = this.validate(paymentData);
        if (!validation.isValid) {
            return {
                success: false,
                transactionId: '',
                amount,
                fee: 0,
                totalCharged: 0,
                method: this.getName(),
                message: `Validation failed: ${validation.errors.join(', ')}`,
                timestamp: new Date()
            };
        }

        const fee = this.calculateFee(amount);
        const totalCharged = amount + fee;
        const vaNumber = this.generateVANumber();
        const transactionId = `TXN-VA-${this.bankCode}-${Date.now().toString(36).toUpperCase()}`;

        // Calculate expiry (24 hours from now)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        console.log(`[${this.bankCode}] Virtual Account: ${vaNumber}`);
        console.log(`[${this.bankCode}] Amount: Rp ${totalCharged.toLocaleString()}`);
        console.log(`[${this.bankCode}] Expires: ${expiry.toLocaleString('id-ID')}`);

        return {
            success: true,
            transactionId,
            amount,
            fee,
            totalCharged,
            method: this.getName(),
            message: `Transfer ke VA ${vaNumber} sebelum ${expiry.toLocaleString('id-ID')}`,
            timestamp: new Date(),
            receiptNumber: `RCP-VA-${Date.now()}`,
            additionalInfo: {
                virtualAccount: vaNumber,
                bank: this.bankCode,
                expiryTime: expiry.toISOString(),
                paymentInstructions: this.getPaymentInstructions(vaNumber, totalCharged)
            }
        };
    }

    private generateVANumber(): string {
        const bankPrefix: Record<BankCode, string> = {
            [BankCode.BCA]: '8888',
            [BankCode.BNI]: '8810',
            [BankCode.BRI]: '8820',
            [BankCode.MANDIRI]: '8830',
            [BankCode.CIMB]: '8840',
            [BankCode.PERMATA]: '8850'
        };
        const prefix = bankPrefix[this.bankCode];
        const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        return prefix + random;
    }

    private getPaymentInstructions(vaNumber: string, amount: number): string[] {
        return [
            `1. Buka aplikasi ${this.bankCode} atau ATM ${this.bankCode}`,
            '2. Pilih menu Transfer > Virtual Account',
            `3. Masukkan nomor VA: ${vaNumber}`,
            `4. Konfirmasi nominal: Rp ${amount.toLocaleString('id-ID')}`,
            '5. Selesaikan pembayaran',
            '6. Simpan bukti pembayaran'
        ];
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE STRATEGY 4: QRISStrategy
 * ═══════════════════════════════════════════════════════════════
 */
export class QRISStrategy implements PaymentStrategy {
    private readonly MDR_FEE_PERCENTAGE = 0.007; // 0.7% MDR

    getName(): string {
        return 'QRIS';
    }

    getDescription(): string {
        return 'Scan QR menggunakan aplikasi e-wallet atau m-banking';
    }

    getIcon(): string {
        return '📱';
    }

    calculateFee(amount: number): number {
        return Math.round(amount * this.MDR_FEE_PERCENTAGE);
    }

    validate(paymentData: PaymentData): ValidationResult {
        // QRIS tidak memerlukan validasi input customer
        return { isValid: true, errors: [] };
    }

    processPayment(amount: number, paymentData: PaymentData): PaymentResult {
        console.log('[QRIS] Generating QR code...');

        const fee = this.calculateFee(amount);
        const totalCharged = amount + fee;
        const qrCode = this.generateQRCode(totalCharged);
        const transactionId = `TXN-QRIS-${Date.now().toString(36).toUpperCase()}`;

        // QR expires in 5 minutes
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);

        console.log('[QRIS] QR Code generated');
        console.log(`[QRIS] Expires in 5 minutes`);

        return {
            success: true,
            transactionId,
            amount,
            fee,
            totalCharged,
            method: this.getName(),
            message: 'Scan QR code untuk membayar',
            timestamp: new Date(),
            receiptNumber: `RCP-QRIS-${Date.now()}`,
            additionalInfo: {
                qrCodeData: qrCode,
                expiryTime: expiry.toISOString(),
                compatibleApps: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja',
                    'BCA Mobile', 'BNI Mobile', 'BRI Mobile', 'Livin Mandiri']
            }
        };
    }

    private generateQRCode(amount: number): string {
        // Simulasi QR code data (dalam implementasi real, ini adalah QRIS string)
        return `00020101021226650013ID.CO.BIOSKOP0108MERCHANT0215BIOSKOP_PAYMENT5204481253033605406${amount}5802ID5913BIOSKOP_CORP6013JAKARTA PUSAT63041234`;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONTEXT: PaymentProcessor
 * ═══════════════════════════════════════════════════════════════
 */
export class PaymentProcessor {
    private strategy: PaymentStrategy;
    private transactionHistory: PaymentResult[] = [];

    constructor(strategy: PaymentStrategy) {
        this.strategy = strategy;
        console.log(`[PaymentProcessor] Initialized with ${strategy.getName()}`);
    }

    /**
     * Mengubah strategi pembayaran
     */
    setStrategy(strategy: PaymentStrategy): void {
        this.strategy = strategy;
        console.log(`[PaymentProcessor] Strategy changed to ${strategy.getName()}`);
    }

    /**
     * Mendapatkan strategi saat ini
     */
    getStrategy(): PaymentStrategy {
        return this.strategy;
    }

    /**
     * Memproses pembayaran dengan strategi yang dipilih
     */
    processPayment(amount: number, paymentData: PaymentData): PaymentResult {
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`PAYMENT PROCESSING`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`Method: ${this.strategy.getIcon()} ${this.strategy.getName()}`);
        console.log(`Amount: Rp ${amount.toLocaleString('id-ID')}`);
        console.log(`Fee: Rp ${this.strategy.calculateFee(amount).toLocaleString('id-ID')}`);
        console.log('───────────────────────────────────────────────────────────────\n');

        const result = this.strategy.processPayment(amount, paymentData);
        this.transactionHistory.push(result);

        console.log('\n───────────────────────────────────────────────────────────────');
        console.log(`Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`Message: ${result.message}`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        return result;
    }

    /**
     * Preview fee sebelum proses
     */
    previewFee(amount: number): { amount: number; fee: number; total: number; method: string } {
        const fee = this.strategy.calculateFee(amount);
        return {
            amount,
            fee,
            total: amount + fee,
            method: this.strategy.getName()
        };
    }

    /**
     * Mendapatkan history transaksi
     */
    getTransactionHistory(): PaymentResult[] {
        return [...this.transactionHistory];
    }

    /**
     * Menampilkan daftar metode pembayaran
     */
    static displayAvailableMethods(): string {
        const strategies: PaymentStrategy[] = [
            new CreditCardStrategy(),
            new EWalletStrategy(EWalletType.GOPAY),
            new EWalletStrategy(EWalletType.OVO),
            new EWalletStrategy(EWalletType.DANA),
            new BankTransferStrategy(BankCode.BCA),
            new BankTransferStrategy(BankCode.BNI),
            new QRISStrategy()
        ];

        let output = `
╔══════════════════════════════════════════════════════════════╗
║                   METODE PEMBAYARAN                          ║
╠══════════════════════════════════════════════════════════════╣`;

        for (const strategy of strategies) {
            output += `
║ ${strategy.getIcon()} ${strategy.getName().padEnd(55)}║
║    ${strategy.getDescription().padEnd(56)}║`;
        }

        output += `
╚══════════════════════════════════════════════════════════════╝`;

        return output;
    }
}
