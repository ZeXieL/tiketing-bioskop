/**
 * =============================================================================
 * DEMO - Sistem Booking Bioskop dengan Design Patterns
 * =============================================================================
 * 
 * File ini mendemonstrasikan penggunaan 12 Design Patterns yang
 * diimplementasikan dalam sistem booking bioskop.
 * 
 * CREATIONAL PATTERNS:
 * 1. Factory Method - Pembuatan tiket berbagai tipe
 * 2. Abstract Factory - Paket bioskop dengan produk terkait
 * 3. Builder - Konstruksi booking yang kompleks
 * 4. Prototype - Cloning seat layout dan promo template
 * 
 * STRUCTURAL PATTERNS:
 * 5. Adapter - Integrasi payment gateway
 * 6. Decorator - Add-on tiket
 * 7. Facade - Simplified booking interface
 * 8. Proxy - Seat availability dengan caching
 * 
 * BEHAVIORAL PATTERNS:
 * 9. State - Status booking lifecycle
 * 10. Observer - Notification system
 * 11. Strategy - Metode pembayaran
 * 12. Command - Seat selection dengan undo/redo
 * 
 * =============================================================================
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Models
import { SeatImpl, SeatType, SeatStatus } from './models/Seat';
import { UserImpl, MembershipType } from './models/User';

// Creational Patterns
import {
    TicketFactoryProvider,
    TicketType
} from './ticket/TicketFactory';

import {
    RegularPackageFactory,
    PremiumPackageFactory,
    CinemaPackage
} from './cinema-package/PackageFactory';

import {
    ConcreteBookingBuilder,
    BookingDirector,
    createSampleUser,
    createSampleShowtime,
    createSampleSeat
} from './booking/BookingBuilder';

import {
    SeatLayoutRegistry,
    PromoRegistry
} from './seat/SeatLayout';

// Structural Patterns
import {
    GoPayAdapter,
    OVOAdapter,
    BankTransferAdapter
} from './payment/PaymentGateway';

import {
    BasicTicket,
    SnackComboDecorator,
    InsuranceDecorator,
    ParkingDecorator,
    SnackSize,
    ParkingType,
    TicketWithAddonsBuilder,
    TicketDisplay,
    TicketComponent
} from './ticket/TicketAddons';

import { CinemaBookingService } from './services/CinemaBookingService';

import {
    SeatAvailabilityProxy
} from './seat/SeatAvailability';

// Behavioral Patterns
import {
    BookingContext
} from './booking/BookingStatus';

import {
    BookingNotifier,
    EmailNotificationObserver,
    SMSNotificationObserver,
    PushNotificationObserver,
    InventoryObserver,
    AnalyticsObserver,
    BookingEventType
} from './notification/NotificationService';

import {
    PaymentProcessor,
    CreditCardStrategy,
    EWalletStrategy,
    QRISStrategy,
    EWalletType
} from './payment/PaymentMethod';

import {
    SeatSelectionController
} from './seat/SeatSelection';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function printHeader(title: string): void {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log(`║ ${title.padEnd(62)}║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

function printSubHeader(title: string): void {
    console.log(`\n─── ${title} ───\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Demo 1: Factory Method Pattern
 */
function demoFactoryMethod(): void {
    printHeader('1. FACTORY METHOD PATTERN - Pembuatan Tiket');

    // Create sample data
    const showtime = createSampleShowtime();
    const seat = createSampleSeat('D', 5);

    printSubHeader('Membuat berbagai tipe tiket menggunakan Factory');

    // Get factories for different ticket types
    const regularFactory = TicketFactoryProvider.getFactory(TicketType.REGULAR);
    const vipFactory = TicketFactoryProvider.getFactory(TicketType.VIP);
    const imaxFactory = TicketFactoryProvider.getFactory(TicketType.IMAX);

    // Create tickets
    const regularTicket = regularFactory.createTicket(showtime, seat);
    const vipTicket = vipFactory.createTicket(showtime, seat);
    const imaxTicket = imaxFactory.createTicket(showtime, seat);

    console.log(`\nCreated Tickets:`);
    console.log(`  Regular Ticket: ${regularTicket.id} - Rp ${regularTicket.getPrice().toLocaleString()}`);
    console.log(`  VIP Ticket: ${vipTicket.id} - Rp ${vipTicket.getPrice().toLocaleString()}`);
    console.log(`  IMAX Ticket: ${imaxTicket.id} - Rp ${imaxTicket.getPrice().toLocaleString()}`);

    console.log('\n' + regularTicket.printTicket());
}

/**
 * Demo 2: Abstract Factory Pattern
 */
function demoAbstractFactory(): void {
    printHeader('2. ABSTRACT FACTORY PATTERN - Paket Bioskop');

    printSubHeader('Regular Package');
    const regularFactory = new RegularPackageFactory();
    const regularPackage = new CinemaPackage(regularFactory);
    console.log(regularPackage.displayPackage());

    printSubHeader('Premium Package');
    const premiumFactory = new PremiumPackageFactory();
    const premiumPackage = new CinemaPackage(premiumFactory);
    console.log(premiumPackage.displayPackage());
}

/**
 * Demo 3: Builder Pattern
 */
function demoBuilder(): void {
    printHeader('3. BUILDER PATTERN - Konstruksi Booking');

    const user = createSampleUser();
    const showtime = createSampleShowtime();
    const seat = createSampleSeat('A', 1);

    const builder = new ConcreteBookingBuilder();
    const director = new BookingDirector(builder);

    printSubHeader('Basic Booking');
    const basicBooking = director.buildBasicBooking(user, showtime, seat);
    console.log(`Booking ID: ${basicBooking.id}`);
    console.log(`Tickets: ${basicBooking.tickets.length}`);
    console.log(`Total: Rp ${basicBooking.getTotalPrice().toLocaleString()}`);

    printSubHeader('VIP Booking');
    const seat2 = createSampleSeat('B', 2);
    const vipBooking = director.buildVIPBooking(user, showtime, seat2);
    console.log(`Booking ID: ${vipBooking.id}`);
    console.log(`Tickets: ${vipBooking.tickets.length}`);
    console.log(`Insurance: ${vipBooking.insuranceIncluded}`);
    console.log(`Total: Rp ${vipBooking.getTotalPrice().toLocaleString()}`);

    printSubHeader('Combo Booking');
    const seat3 = createSampleSeat('C', 3);
    const comboBooking = director.buildComboBooking(user, showtime, seat3, TicketType.REGULAR);
    console.log(`Booking ID: ${comboBooking.id}`);
    console.log(`Tickets: ${comboBooking.tickets.length}`);
    console.log(`Addons: ${comboBooking.addons.length}`);
    console.log(`Total: Rp ${comboBooking.getTotalPrice().toLocaleString()}`);
}

/**
 * Demo 4: Prototype Pattern
 */
function demoPrototype(): void {
    printHeader('4. PROTOTYPE PATTERN - Cloning Layout & Promo');

    // Initialize registries
    SeatLayoutRegistry.initializeDefaults();
    PromoRegistry.initializeDefaults();

    printSubHeader('Seat Layout Registry');

    // Get and clone a layout
    const regularLayout = SeatLayoutRegistry.getClone('REGULAR_STANDARD');
    const vipLayout = SeatLayoutRegistry.getClone('VIP_STANDARD');

    if (regularLayout && vipLayout) {
        console.log(`Regular layout: ${regularLayout.getName()} (${regularLayout.getRows()}x${regularLayout.getSeatsPerRow()})`);
        console.log(`VIP layout: ${vipLayout.getName()} (${vipLayout.getRows()}x${vipLayout.getSeatsPerRow()})`);
    }

    printSubHeader('Promo Template Registry');

    // Get and clone promos
    const weekendPromo = PromoRegistry.getClone('WEEKEND');
    const studentPromo = PromoRegistry.getClone('STUDENT');

    if (weekendPromo && studentPromo) {
        console.log(`Weekend Promo: ${weekendPromo.getName()} - ${weekendPromo.getDiscountPercentage()}% off`);
        console.log(`Student Promo: ${studentPromo.getName()} - ${studentPromo.getDiscountPercentage()}% off`);
    }
}

/**
 * Demo 5: Adapter Pattern
 */
function demoAdapter(): void {
    printHeader('5. ADAPTER PATTERN - Payment Gateway Integration');

    const customerInfo = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+6281234567890'
    };

    printSubHeader('GoPay Adapter');
    const gopayAdapter = new GoPayAdapter();
    const gopayResult = gopayAdapter.processPayment(150000, 'ORD-001', customerInfo);
    console.log(`Transaction ID: ${gopayResult.transactionId}`);
    console.log(`Status: ${gopayResult.status}`);
    console.log(`Message: ${gopayResult.message}`);

    printSubHeader('OVO Adapter');
    const ovoAdapter = new OVOAdapter();
    const ovoResult = ovoAdapter.processPayment(150000, 'ORD-002', customerInfo);
    console.log(`Transaction ID: ${ovoResult.transactionId}`);
    console.log(`Status: ${ovoResult.status}`);

    printSubHeader('Bank Transfer Adapter');
    const bankAdapter = new BankTransferAdapter('BCA');
    const bankResult = bankAdapter.processPayment(150000, 'ORD-003', customerInfo);
    console.log(`Transaction ID: ${bankResult.transactionId}`);
    console.log(`Message: ${bankResult.message}`);
}

/**
 * Demo 6: Decorator Pattern
 */
function demoDecorator(): void {
    printHeader('6. DECORATOR PATTERN - Ticket Add-ons');

    printSubHeader('Basic Ticket');
    let ticket: TicketComponent = new BasicTicket('Avengers: Endgame', '14:00', 'D5', 75000);
    console.log(`Description: ${ticket.getDescription()}`);
    console.log(`Price: Rp ${ticket.getPrice().toLocaleString()}`);

    printSubHeader('Adding Decorations');

    // Add snack combo
    ticket = new SnackComboDecorator(ticket, SnackSize.MEDIUM);
    console.log(`+ Snack Combo Medium`);

    // Add insurance
    ticket = new InsuranceDecorator(ticket);
    console.log(`+ Insurance`);

    // Add parking
    ticket = new ParkingDecorator(ticket, ParkingType.CAR);
    console.log(`+ Parking`);

    console.log(TicketDisplay.print(ticket));

    printSubHeader('Using Builder for Decorations');
    const premiumTicket = new TicketWithAddonsBuilder('Dune: Part Two', '19:00', 'A1', 100000)
        .addSnackCombo(SnackSize.LARGE)
        .addInsurance()
        .addParking(ParkingType.CAR)
        .upgradeToPremiumSeat()
        .build();

    console.log(TicketDisplay.print(premiumTicket));
}

/**
 * Demo 7: Facade Pattern
 */
function demoFacade(): void {
    printHeader('7. FACADE PATTERN - Simplified Booking Interface');

    const facade = new CinemaBookingService();

    printSubHeader('Available Movies');
    const movies = facade.getAvailableMovies();
    movies.slice(0, 3).forEach(m => console.log(`  - ${m.title} (${m.duration} min)`));

    printSubHeader('Complete Booking Flow (Simplified by Facade)');
    // Note: The facade simplifies complex subsystem interactions
    console.log('The CinemaBookingService facade provides:');
    console.log('  - getAvailableMovies()');
    console.log('  - completeBooking()');
    console.log('  - All complex subsystem interactions are hidden');
}

/**
 * Demo 8: Proxy Pattern
 */
function demoProxy(): void {
    printHeader('8. PROXY PATTERN - Seat Availability with Caching');

    const proxy = new SeatAvailabilityProxy();

    // Set user for access control
    const user = new UserImpl('USR-001', 'John Doe', 'john@email.com', '+628123456789', MembershipType.GOLD);
    proxy.setCurrentUser(user);

    printSubHeader('First Call (Cache MISS)');
    console.log('Fetching seats...');
    const seats1 = proxy.getSeats('SHOW-001');
    console.log(`Retrieved ${seats1.length} seats`);

    printSubHeader('Second Call (Cache HIT)');
    console.log('Fetching seats again...');
    const seats2 = proxy.getSeats('SHOW-001');
    console.log(`Retrieved ${seats2.length} seats (from cache)`);

    printSubHeader('Cache Statistics');
    const stats = proxy.getCacheStats();
    console.log(`Cache entries: ${stats.entries}`);

    printSubHeader('Access Log');
    const logs = proxy.getAccessLog(3);
    logs.forEach(log => console.log(`  [${log.timestamp.toLocaleTimeString()}] ${log.method}`));
}

/**
 * Demo 9: State Pattern
 */
function demoState(): void {
    printHeader('9. STATE PATTERN - Booking Lifecycle');

    const booking = new BookingContext('John Doe', 'Avengers: Endgame');

    printSubHeader('Initial State: Draft');
    booking.addSeat('A1', 75000);
    booking.addSeat('A2', 75000);

    printSubHeader('Proceed to Payment');
    booking.proceedToPayment();
    console.log(`Current State: ${booking.getStateName()}`);

    printSubHeader('Make Payment');
    booking.pay(150000);
    console.log(`Current State: ${booking.getStateName()}`);

    printSubHeader('Confirm Booking');
    booking.confirm();
    console.log(`Current State: ${booking.getStateName()}`);

    printSubHeader('Complete Booking');
    booking.complete();
    console.log(`Current State: ${booking.getStateName()}`);

    console.log(booking.displayDetails());
    console.log(booking.displayStateHistory());
}

/**
 * Demo 10: Observer Pattern
 */
function demoObserver(): void {
    printHeader('10. OBSERVER PATTERN - Notification System');

    const notifier = new BookingNotifier();

    // Attach observers
    notifier.attach(new EmailNotificationObserver());
    notifier.attach(new SMSNotificationObserver());
    notifier.attach(new PushNotificationObserver());
    notifier.attach(new InventoryObserver());
    notifier.attach(new AnalyticsObserver());

    printSubHeader('Broadcasting: Payment Success Event');
    notifier.notify({
        eventType: BookingEventType.PAYMENT_SUCCESS,
        bookingId: 'BKG-12345',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+6281234567890',
        movieTitle: 'Avengers: Endgame',
        cinemaName: 'XXI Grand Indonesia',
        showtime: '14:00, 25 Dec 2024',
        seats: ['A1', 'A2'],
        totalAmount: 150000,
        timestamp: new Date()
    });

    printSubHeader('Broadcasting: Booking Confirmed Event');
    notifier.notify({
        eventType: BookingEventType.BOOKING_CONFIRMED,
        bookingId: 'BKG-12345',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+6281234567890',
        movieTitle: 'Avengers: Endgame',
        cinemaName: 'XXI Grand Indonesia',
        showtime: '14:00, 25 Dec 2024',
        seats: ['A1', 'A2'],
        totalAmount: 150000,
        timestamp: new Date()
    });
}

/**
 * Demo 11: Strategy Pattern
 */
function demoStrategy(): void {
    printHeader('11. STRATEGY PATTERN - Payment Methods');

    const paymentData = {
        cardNumber: '4111111111111111',
        cardHolder: 'JOHN DOE',
        expiryDate: '12/25',
        cvv: '123',
        phoneNumber: '081234567890',
        customerName: 'John Doe',
        customerEmail: 'john@example.com'
    };

    console.log(PaymentProcessor.displayAvailableMethods());

    printSubHeader('Credit Card Payment');
    const ccProcessor = new PaymentProcessor(new CreditCardStrategy());
    ccProcessor.processPayment(150000, paymentData);

    printSubHeader('E-Wallet Payment (GoPay)');
    ccProcessor.setStrategy(new EWalletStrategy(EWalletType.GOPAY));
    ccProcessor.processPayment(150000, paymentData);

    printSubHeader('QRIS Payment');
    ccProcessor.setStrategy(new QRISStrategy());
    ccProcessor.processPayment(150000, paymentData);
}

/**
 * Demo 12: Command Pattern
 */
function demoCommand(): void {
    printHeader('12. COMMAND PATTERN - Seat Selection with Undo/Redo');

    const controller = new SeatSelectionController();
    controller.initializeForShowtime('SHOW-001', 8, 12, 50000);

    printSubHeader('Initial Layout');
    console.log(controller.displayLayout());

    printSubHeader('Selecting Seats');
    controller.selectSeat('D5');
    controller.selectSeat('D6');
    controller.selectSeat('D7');
    console.log(controller.displayLayout());

    printSubHeader('Undo Last Selection (D7)');
    controller.undo();
    const selected1 = controller.getSelectedSeats();
    console.log(`Selected seats: ${selected1.map(s => `${s.row}${s.number}`).join(', ')}`);

    printSubHeader('Undo Again (D6)');
    controller.undo();
    const selected2 = controller.getSelectedSeats();
    console.log(`Selected seats: ${selected2.map(s => `${s.row}${s.number}`).join(', ')}`);

    printSubHeader('Redo (D6)');
    controller.redo();
    const selected3 = controller.getSelectedSeats();
    console.log(`Selected seats: ${selected3.map(s => `${s.row}${s.number}`).join(', ')}`);

    printSubHeader('Select Multiple Seats');
    controller.selectMultipleSeats(['E8', 'E9', 'E10']);
    console.log(controller.displayLayout());

    console.log(controller.displayHistory());
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function main(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ██████╗ ██╗ ██████╗ ███████╗██╗  ██╗ ██████╗ ██████╗                        ║
║  ██╔══██╗██║██╔═══██╗██╔════╝██║ ██╔╝██╔═══██╗██╔══██╗                       ║
║  ██████╔╝██║██║   ██║███████╗█████╔╝ ██║   ██║██████╔╝                       ║
║  ██╔══██╗██║██║   ██║╚════██║██╔═██╗ ██║   ██║██╔═══╝                        ║
║  ██████╔╝██║╚██████╔╝███████║██║  ██╗╚██████╔╝██║                            ║
║  ╚═════╝ ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝                            ║
║                                                                              ║
║           Sistem Booking Bioskop dengan 12 Design Patterns                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);

    try {
        // Run all demos
        demoFactoryMethod();
        demoAbstractFactory();
        demoBuilder();
        demoPrototype();
        demoAdapter();
        demoDecorator();
        demoFacade();
        demoProxy();
        demoState();
        demoObserver();
        demoStrategy();
        demoCommand();

        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           DEMO COMPLETED                                     ║
║                                                                              ║
║  All 12 Design Patterns have been demonstrated successfully!                ║
║                                                                              ║
║  CREATIONAL PATTERNS:                                                        ║
║    ✓ Factory Method    ✓ Abstract Factory                                    ║
║    ✓ Builder           ✓ Prototype                                           ║
║                                                                              ║
║  STRUCTURAL PATTERNS:                                                        ║
║    ✓ Adapter           ✓ Decorator                                           ║
║    ✓ Facade            ✓ Proxy                                               ║
║                                                                              ║
║  BEHAVIORAL PATTERNS:                                                        ║
║    ✓ State             ✓ Observer                                            ║
║    ✓ Strategy          ✓ Command                                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
    } catch (error) {
        console.error('Error during demo:', error);
    }
}

// Run main
main();
