
import {
    PaymentProcessor,
    CreditCardStrategy,
    EWalletStrategy,
    BankTransferStrategy,
    QRISStrategy,
    EWalletType
} from '../../src/payment/PaymentMethod';
import { PaymentData } from '../../src/payment/PaymentMethod';

describe('Strategy Pattern - Payment Processing System', () => {
    let processor: PaymentProcessor;
    let paymentData: PaymentData;
    const AMOUNT = 100000;

    beforeEach(() => {
        // Default Strategy
        processor = new PaymentProcessor(new CreditCardStrategy());
        paymentData = {
            cardNumber: '1234567890123456',
            cardHolder: 'John Doe',
            expiryDate: '12/30',
            cvv: '123'
        };
    });

    test('should process payment using initial strategy (Credit Card)', () => {
        const result = processor.processPayment(AMOUNT, paymentData);

        expect(result.success).toBe(true);
        expect(result.method).toBe('Credit Card');
        expect(result.fee).toBeGreaterThan(0); // CC has fee
    });

    test('should switch strategy effectively', () => {
        // Switch to E-Wallet
        const strategy = new EWalletStrategy(EWalletType.GOPAY);
        processor.setStrategy(strategy);

        // Update payment data for E-Wallet
        paymentData = {
            phoneNumber: '081234567891'
        };

        const result = processor.processPayment(AMOUNT, paymentData);

        expect(result.success).toBe(true);
        expect(result.method).toContain('GoPay');
        expect(result.fee).toBe(1500); // Fixed fee for GoPay
    });

    test('should validate payment data using strategy logic', () => {
        // Invalid CC data
        paymentData.cardNumber = '123'; // Too short

        const result = processor.processPayment(AMOUNT, paymentData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation failed');
    });

    test('should calculate fee preview without processing', () => {
        const preview = processor.previewFee(AMOUNT);
        expect(preview.total).toBeGreaterThan(AMOUNT);
    });

    test('should correctly handle QRIS strategy', () => {
        const strategy = new QRISStrategy();
        processor.setStrategy(strategy);

        const result = processor.processPayment(AMOUNT, {});

        expect(result.success).toBe(true);
        expect(result.method).toBe('QRIS');
        expect(result.additionalInfo?.qrCodeData).toBeDefined();
    });
});
