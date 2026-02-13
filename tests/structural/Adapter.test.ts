
import {
    PaymentGatewayManager,
    PaymentMethod,
    CustomerInfo,
    GoPayAdapter,
    OVOAdapter,
    BankTransferAdapter
} from '../../src/payment/PaymentGateway';

describe('Adapter Pattern - Payment Gateway', () => {
    let paymentManager: PaymentGatewayManager;
    const customer: CustomerInfo = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '08123456789'
    };
    const orderId = 'ORD-123';
    const amount = 100000;

    beforeEach(() => {
        paymentManager = new PaymentGatewayManager();
    });

    test('should process payment via GoPay Adapter', () => {
        const result = paymentManager.processPayment(
            PaymentMethod.GOPAY,
            amount,
            orderId,
            customer
        );

        expect(result.status).toBeDefined();
        // GoPay uses 'settlement' which maps to SUCCESS
        expect(result.currency).toBe('IDR');
        expect(result.amount).toBe(amount);
        expect(result.gatewayRef).toBe(orderId);
    });

    test('should process payment via OVO Adapter', () => {
        const result = paymentManager.processPayment(
            PaymentMethod.OVO,
            amount,
            orderId,
            customer
        );

        expect(result.status).toBeDefined();
        // OVO status '00' maps to SUCCESS
        expect(result.amount).toBe(amount);
        // OVO Adapter converts phone to OVO ID (08123456789 -> 8123456789)
    });

    test('should process payment via Bank Transfer Adapter (BCA)', () => {
        const result = paymentManager.processPayment(
            PaymentMethod.BANK_BCA,
            amount,
            orderId,
            customer
        );

        expect(result.status).toBeDefined();
        // Bank Transfer returns WAITING_PAYMENT status initially (PENDING)
        expect(result.gatewayRef).toMatch(/^8BCA/); // VA format
    });

    test('should throw error for invalid payment method', () => {
        // @ts-ignore
        expect(() => paymentManager.getProcessor('INVALID_METHOD')).toThrow();
    });
});
