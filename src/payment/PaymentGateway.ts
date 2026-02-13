// ADAPTER PATTERN - Integrasi Payment Gateway
//
// PENJELASAN MASALAH:
// Sistem bioskop perlu menerima pembayaran dari berbagai payment gateway (GoPay, OVO, Bank Transfer).
// Masing-masing gateway memiliki interface berbeda.
//
// SOLUSI:
// Adapter Pattern mengkonversi interface berbagai payment gateway ke interface standar sistem.
//
// PEMETAAN KE DOMAIN BIOSKOP:
// - Target Interface: PaymentProcessor
// - Adaptees: GoPayAPI, OVOAPI, BankTransferAPI
// - Adapters: GoPayAdapter, OVOAdapter, BankTransferAdapter

// TARGET INTERFACE
// Interface standar yang diharapkan oleh sistem bioskop
// Status transaksi terpadu
export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

// Hasil transaksi terpadu
export interface PaymentResponse {
    transactionId: string;
    status: TransactionStatus;
    amount: number;
    currency: string;
    paidAt?: Date;
    message: string;
    gatewayRef?: string;
}

// Target Interface: PaymentProcessor
// Interface yang digunakan oleh sistem bioskop
export interface PaymentProcessor {
    getName(): string;
    processPayment(amount: number, orderId: string, customerInfo: CustomerInfo): PaymentResponse;
    checkStatus(transactionId: string): PaymentResponse;
    refund(transactionId: string): PaymentResponse;
}

// Info pelanggan untuk pembayaran
export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}

// ADAPTEE 1: GoPayAPI
// API GoPay dengan interface spesifik yang berbeda dari sistem
export class GoPayAPI {
    // Interface GoPay menggunakan format berbeda:
    // - merchantOrderId bukan orderId
    // - userPhone bukan customerInfo
    // - Method createTransaction bukan processPayment
    createTransaction(
        merchantOrderId: string,
        totalAmount: number,
        userPhone: string,
        callbackUrl: string
    ): GoPayTransactionResult {
        console.log(`[GoPayAPI] Creating transaction for ${merchantOrderId}`);

        // Simulasi proses GoPay
        const txId = `GOPAY-${Date.now().toString(36).toUpperCase()}`;

        return {
            transaction_id: txId,
            order_id: merchantOrderId,
            gross_amount: totalAmount,
            payment_type: 'gopay',
            transaction_status: 'settlement', // GoPay uses 'settlement' for success
            transaction_time: new Date().toISOString(),
            callback_url: callbackUrl
        };
    }

    getTransactionStatus(transactionId: string): GoPayTransactionResult {
        // Simulasi cek status
        return {
            transaction_id: transactionId,
            order_id: 'ORD-XXX',
            gross_amount: 0,
            payment_type: 'gopay',
            transaction_status: 'settlement',
            transaction_time: new Date().toISOString()
        };
    }

    cancelTransaction(transactionId: string): GoPayTransactionResult {
        return {
            transaction_id: transactionId,
            order_id: 'ORD-XXX',
            gross_amount: 0,
            payment_type: 'gopay',
            transaction_status: 'cancel',
            transaction_time: new Date().toISOString()
        };
    }
}

interface GoPayTransactionResult {
    transaction_id: string;
    order_id: string;
    gross_amount: number;
    payment_type: string;
    transaction_status: string; // 'pending', 'settlement', 'cancel', 'expire'
    transaction_time: string;
    callback_url?: string;
}

// ADAPTEE 2: OVOAPI
// API OVO dengan interface yang berbeda lagi
export class OVOAPI {
    // OVO menggunakan format berbeda:
    // - pushToPayRequest method
    // - Menggunakan ovoId bukan phone
    pushToPayRequest(
        ovoId: string,
        amountInCents: number, // OVO uses cents!
        referenceNo: string,
        merchantCode: string
    ): OVOPaymentResult {
        console.log(`[OVOAPI] Push to pay request for OVO ID: ${ovoId}`);

        const trxRef = `OVO-${Date.now().toString(36).toUpperCase()}`;

        return {
            trx_ref: trxRef,
            reference_no: referenceNo,
            amount: amountInCents,
            status_code: '00', // OVO uses '00' for success
            status_message: 'SUCCESS',
            ovo_id: ovoId,
            merchant_code: merchantCode,
            timestamp: Date.now()
        };
    }

    inquiryStatus(trxRef: string): OVOPaymentResult {
        return {
            trx_ref: trxRef,
            reference_no: 'REF-XXX',
            amount: 0,
            status_code: '00',
            status_message: 'SUCCESS',
            ovo_id: '',
            merchant_code: '',
            timestamp: Date.now()
        };
    }

    refundPayment(trxRef: string, reasonCode: string): OVOPaymentResult {
        return {
            trx_ref: trxRef,
            reference_no: 'REF-XXX',
            amount: 0,
            status_code: '06', // Refunded
            status_message: 'REFUNDED',
            ovo_id: '',
            merchant_code: '',
            timestamp: Date.now()
        };
    }
}

interface OVOPaymentResult {
    trx_ref: string;
    reference_no: string;
    amount: number;
    status_code: string; // '00' = success, '14' = pending, '06' = refund
    status_message: string;
    ovo_id: string;
    merchant_code: string;
    timestamp: number;
}

// ADAPTEE 3: BankTransferAPI
// API Bank Transfer dengan format yang berbeda
export class BankTransferAPI {
    // Bank Transfer menggunakan virtual account
    createVirtualAccount(
        bankCode: string,
        customerName: string,
        customerEmail: string,
        amount: number,
        expirationMinutes: number
    ): BankTransferResult {
        console.log(`[BankTransferAPI] Creating VA for bank: ${bankCode}`);

        const vaNumber = `8${bankCode}${Date.now().toString().slice(-10)}`;

        return {
            va_number: vaNumber,
            bank_code: bankCode,
            bank_name: this.getBankName(bankCode),
            customer_name: customerName,
            amount: amount,
            status: 'WAITING_PAYMENT',
            expired_at: new Date(Date.now() + expirationMinutes * 60000).toISOString(),
            created_at: new Date().toISOString()
        };
    }

    private getBankName(code: string): string {
        const banks: Record<string, string> = {
            'BCA': 'Bank Central Asia',
            'BNI': 'Bank Negara Indonesia',
            'BRI': 'Bank Rakyat Indonesia',
            'MANDIRI': 'Bank Mandiri'
        };
        return banks[code] || code;
    }

    checkPaymentStatus(vaNumber: string): BankTransferResult {
        return {
            va_number: vaNumber,
            bank_code: 'BCA',
            bank_name: 'Bank Central Asia',
            customer_name: '',
            amount: 0,
            status: 'PAID',
            expired_at: '',
            created_at: '',
            paid_at: new Date().toISOString()
        };
    }

    cancelVirtualAccount(vaNumber: string): BankTransferResult {
        return {
            va_number: vaNumber,
            bank_code: 'BCA',
            bank_name: 'Bank Central Asia',
            customer_name: '',
            amount: 0,
            status: 'CANCELLED',
            expired_at: '',
            created_at: ''
        };
    }
}

interface BankTransferResult {
    va_number: string;
    bank_code: string;
    bank_name: string;
    customer_name: string;
    amount: number;
    status: string; // 'WAITING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED'
    expired_at: string;
    created_at: string;
    paid_at?: string;
}

// ADAPTER 1: GoPayAdapter
// Mengadaptasi GoPayAPI ke interface PaymentProcessor
export class GoPayAdapter implements PaymentProcessor {
    private gopayApi: GoPayAPI;
    private callbackUrl: string;

    constructor(callbackUrl: string = 'https://bioskop.com/callback') {
        this.gopayApi = new GoPayAPI();
        this.callbackUrl = callbackUrl;
    }

    getName(): string {
        return 'GoPay';
    }

    processPayment(amount: number, orderId: string, customerInfo: CustomerInfo): PaymentResponse {
        // Adaptasi: mengkonversi parameter ke format GoPay
        const result = this.gopayApi.createTransaction(
            orderId,           // merchantOrderId
            amount,            // totalAmount
            customerInfo.phone, // userPhone
            this.callbackUrl
        );

        // Adaptasi: mengkonversi response GoPay ke format standar
        return this.adaptResponse(result);
    }

    checkStatus(transactionId: string): PaymentResponse {
        const result = this.gopayApi.getTransactionStatus(transactionId);
        return this.adaptResponse(result);
    }

    refund(transactionId: string): PaymentResponse {
        const result = this.gopayApi.cancelTransaction(transactionId);
        return this.adaptResponse(result);
    }

    // Helper: Mengkonversi GoPayTransactionResult ke PaymentResponse
    private adaptResponse(result: GoPayTransactionResult): PaymentResponse {
        return {
            transactionId: result.transaction_id,
            status: this.mapStatus(result.transaction_status),
            amount: result.gross_amount,
            currency: 'IDR',
            paidAt: result.transaction_status === 'settlement' ? new Date() : undefined,
            message: this.getStatusMessage(result.transaction_status),
            gatewayRef: result.order_id
        };
    }

    private mapStatus(goPayStatus: string): TransactionStatus {
        switch (goPayStatus) {
            case 'settlement':
            case 'capture':
                return TransactionStatus.SUCCESS;
            case 'pending':
                return TransactionStatus.PENDING;
            case 'cancel':
            case 'deny':
            case 'expire':
                return TransactionStatus.CANCELLED;
            default:
                return TransactionStatus.FAILED;
        }
    }

    private getStatusMessage(status: string): string {
        const messages: Record<string, string> = {
            'settlement': 'Pembayaran GoPay berhasil',
            'pending': 'Menunggu pembayaran GoPay',
            'cancel': 'Pembayaran dibatalkan',
            'deny': 'Pembayaran ditolak',
            'expire': 'Pembayaran expired'
        };
        return messages[status] || 'Status tidak dikenal';
    }
}

// ADAPTER 2: OVOAdapter
// Mengadaptasi OVOAPI ke interface PaymentProcessor
export class OVOAdapter implements PaymentProcessor {
    private ovoApi: OVOAPI;
    private merchantCode: string;

    constructor(merchantCode: string = 'BIOSKOP-001') {
        this.ovoApi = new OVOAPI();
        this.merchantCode = merchantCode;
    }

    getName(): string {
        return 'OVO';
    }

    processPayment(amount: number, orderId: string, customerInfo: CustomerInfo): PaymentResponse {
        // Adaptasi: OVO menggunakan cents, jadi kalikan 100
        const amountInCents = amount * 100;

        // Adaptasi: OVO butuh OVO ID (phone tanpa +62)
        const ovoId = this.formatToOvoId(customerInfo.phone);

        const result = this.ovoApi.pushToPayRequest(
            ovoId,
            amountInCents,
            orderId,
            this.merchantCode
        );

        return this.adaptResponse(result);
    }

    checkStatus(transactionId: string): PaymentResponse {
        const result = this.ovoApi.inquiryStatus(transactionId);
        return this.adaptResponse(result);
    }

    refund(transactionId: string): PaymentResponse {
        const result = this.ovoApi.refundPayment(transactionId, 'CUSTOMER_REQUEST');
        return this.adaptResponse(result);
    }

    private formatToOvoId(phone: string): string {
        // Remove +62 or 0 prefix
        return phone.replace(/^(\+62|62|0)/, '');
    }

    private adaptResponse(result: OVOPaymentResult): PaymentResponse {
        return {
            transactionId: result.trx_ref,
            status: this.mapStatus(result.status_code),
            amount: result.amount / 100, // Convert back from cents
            currency: 'IDR',
            paidAt: result.status_code === '00' ? new Date(result.timestamp) : undefined,
            message: result.status_message,
            gatewayRef: result.reference_no
        };
    }

    private mapStatus(statusCode: string): TransactionStatus {
        switch (statusCode) {
            case '00':
                return TransactionStatus.SUCCESS;
            case '14':
                return TransactionStatus.PENDING;
            case '06':
                return TransactionStatus.CANCELLED; // Refunded
            default:
                return TransactionStatus.FAILED;
        }
    }
}

// ADAPTER 3: BankTransferAdapter
// Mengadaptasi BankTransferAPI ke interface PaymentProcessor
export class BankTransferAdapter implements PaymentProcessor {
    private bankApi: BankTransferAPI;
    private bankCode: string;
    private expirationMinutes: number;

    constructor(bankCode: string = 'BCA', expirationMinutes: number = 1440) {
        this.bankApi = new BankTransferAPI();
        this.bankCode = bankCode;
        this.expirationMinutes = expirationMinutes;
    }

    getName(): string {
        return `Bank Transfer (${this.bankCode})`;
    }

    processPayment(amount: number, orderId: string, customerInfo: CustomerInfo): PaymentResponse {
        const result = this.bankApi.createVirtualAccount(
            this.bankCode,
            customerInfo.name,
            customerInfo.email,
            amount,
            this.expirationMinutes
        );

        return this.adaptResponse(result);
    }

    checkStatus(transactionId: string): PaymentResponse {
        const result = this.bankApi.checkPaymentStatus(transactionId);
        return this.adaptResponse(result);
    }

    refund(transactionId: string): PaymentResponse {
        const result = this.bankApi.cancelVirtualAccount(transactionId);
        return this.adaptResponse(result);
    }

    private adaptResponse(result: BankTransferResult): PaymentResponse {
        return {
            transactionId: result.va_number,
            status: this.mapStatus(result.status),
            amount: result.amount,
            currency: 'IDR',
            paidAt: result.paid_at ? new Date(result.paid_at) : undefined,
            message: this.getStatusMessage(result),
            gatewayRef: result.va_number
        };
    }

    private mapStatus(status: string): TransactionStatus {
        switch (status) {
            case 'PAID':
                return TransactionStatus.SUCCESS;
            case 'WAITING_PAYMENT':
                return TransactionStatus.PENDING;
            case 'CANCELLED':
            case 'EXPIRED':
                return TransactionStatus.CANCELLED;
            default:
                return TransactionStatus.FAILED;
        }
    }

    private getStatusMessage(result: BankTransferResult): string {
        if (result.status === 'WAITING_PAYMENT') {
            return `Transfer ke VA ${result.va_number} (${result.bank_name}) sebelum ${result.expired_at}`;
        }
        if (result.status === 'PAID') {
            return 'Pembayaran bank transfer berhasil';
        }
        return `Status: ${result.status}`;
    }
}

// PAYMENT GATEWAY MANAGER
// Class untuk mengelola dan memilih payment gateway
export enum PaymentMethod {
    GOPAY = 'GOPAY',
    OVO = 'OVO',
    BANK_BCA = 'BANK_BCA',
    BANK_BNI = 'BANK_BNI',
    BANK_BRI = 'BANK_BRI',
    BANK_MANDIRI = 'BANK_MANDIRI'
}

export class PaymentGatewayManager {
    private adapters: Map<PaymentMethod, PaymentProcessor> = new Map();

    constructor() {
        // Register semua adapter
        this.adapters.set(PaymentMethod.GOPAY, new GoPayAdapter());
        this.adapters.set(PaymentMethod.OVO, new OVOAdapter());
        this.adapters.set(PaymentMethod.BANK_BCA, new BankTransferAdapter('BCA'));
        this.adapters.set(PaymentMethod.BANK_BNI, new BankTransferAdapter('BNI'));
        this.adapters.set(PaymentMethod.BANK_BRI, new BankTransferAdapter('BRI'));
        this.adapters.set(PaymentMethod.BANK_MANDIRI, new BankTransferAdapter('MANDIRI'));
    }

    // Mendapatkan processor berdasarkan metode pembayaran
    getProcessor(method: PaymentMethod): PaymentProcessor {
        const processor = this.adapters.get(method);
        if (!processor) {
            throw new Error(`Payment method ${method} tidak tersedia`);
        }
        return processor;
    }

    // Mendapatkan daftar metode pembayaran yang tersedia
    getAvailableMethods(): PaymentMethod[] {
        return Array.from(this.adapters.keys());
    }

    // Memproses pembayaran dengan metode tertentu
    processPayment(
        method: PaymentMethod,
        amount: number,
        orderId: string,
        customerInfo: CustomerInfo
    ): PaymentResponse {
        const processor = this.getProcessor(method);
        console.log(`[PaymentGatewayManager] Menggunakan ${processor.getName()}`);
        return processor.processPayment(amount, orderId, customerInfo);
    }
}
