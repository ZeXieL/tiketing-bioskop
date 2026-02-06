/**
 * =============================================================================
 * OBSERVER PATTERN - Sistem Notifikasi Booking Bioskop
 * =============================================================================
 * 
 * PENJELASAN MASALAH:
 * Ketika status booking berubah, berbagai pihak perlu dinotifikasi:
 * - Customer perlu menerima email/SMS konfirmasi
 * - Sistem inventory perlu mengupdate ketersediaan kursi
 * - Sistem analytics perlu mencatat transaksi
 * - Staff bioskop perlu mengetahui booking baru
 * 
 * Tanpa design pattern, setiap perubahan status harus memanggil semua
 * dependent secara manual, menyebabkan tight coupling.
 * 
 * ALASAN PEMILIHAN:
 * Observer Pattern dipilih untuk membangun hubungan one-to-many antara
 * booking (subject) dan berbagai notification channel (observers).
 * Ketika booking berubah, semua observer diberitahu secara otomatis
 * tanpa subject perlu mengetahui detail observer.
 * 
 * PEMETAAN KE DOMAIN BIOSKOP:
 * - Subject Interface: BookingSubject
 * - Concrete Subject: BookingNotifier
 * - Observer Interface: BookingObserver
 * - Concrete Observers: EmailNotification, SMSNotification, PushNotification,
 *                       InventoryObserver, AnalyticsObserver
 * =============================================================================
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * EVENT DATA
 * ═══════════════════════════════════════════════════════════════
 * Data yang dikirim ke observer ketika event terjadi
 */
export interface BookingEvent {
    eventType: BookingEventType;
    bookingId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    movieTitle: string;
    cinemaName: string;
    showtime: string;
    seats: string[];
    totalAmount: number;
    timestamp: Date;
    additionalData?: Record<string, any>;
}

export enum BookingEventType {
    BOOKING_CREATED = 'BOOKING_CREATED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    BOOKING_COMPLETED = 'BOOKING_COMPLETED',
    REMINDER_1_HOUR = 'REMINDER_1_HOUR',
    REMINDER_24_HOUR = 'REMINDER_24_HOUR'
}

/**
 * ═══════════════════════════════════════════════════════════════
 * OBSERVER INTERFACE
 * ═══════════════════════════════════════════════════════════════
 * Interface untuk semua observer
 */
export interface BookingObserver {
    /**
     * Nama unik observer
     */
    getName(): string;

    /**
     * Method yang dipanggil ketika ada event
     */
    update(event: BookingEvent): void;

    /**
     * Event types yang di-subscribe oleh observer ini
     */
    getSubscribedEvents(): BookingEventType[];
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SUBJECT INTERFACE
 * ═══════════════════════════════════════════════════════════════
 * Interface untuk subject yang observable
 */
export interface BookingSubject {
    /**
     * Mendaftarkan observer
     */
    attach(observer: BookingObserver): void;

    /**
     * Menghapus observer
     */
    detach(observer: BookingObserver): void;

    /**
     * Memberitahu semua observer
     */
    notify(event: BookingEvent): void;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE SUBJECT: BookingNotifier
 * ═══════════════════════════════════════════════════════════════
 * Mengelola daftar observer dan mengirim notifikasi
 */
export class BookingNotifier implements BookingSubject {
    private observers: Map<string, BookingObserver> = new Map();
    private eventLog: BookingEvent[] = [];
    private maxLogSize: number = 1000;

    constructor() {
        console.log('[BookingNotifier] Notification system initialized');
    }

    /**
     * Mendaftarkan observer baru
     */
    attach(observer: BookingObserver): void {
        const name = observer.getName();
        if (this.observers.has(name)) {
            console.log(`[BookingNotifier] Observer ${name} already registered`);
            return;
        }

        this.observers.set(name, observer);
        console.log(`[BookingNotifier] Observer attached: ${name}`);
        console.log(`[BookingNotifier] Subscribes to: ${observer.getSubscribedEvents().join(', ')}`);
    }

    /**
     * Menghapus observer
     */
    detach(observer: BookingObserver): void {
        const name = observer.getName();
        if (this.observers.delete(name)) {
            console.log(`[BookingNotifier] Observer detached: ${name}`);
        }
    }

    /**
     * Mengirim notifikasi ke semua observer yang subscribe ke event type
     */
    notify(event: BookingEvent): void {
        console.log(`\n[BookingNotifier] ═══ Broadcasting: ${event.eventType} ═══`);
        console.log(`[BookingNotifier] Booking: ${event.bookingId}`);

        // Log event
        this.logEvent(event);

        // Kirim ke semua observer yang subscribe
        let notifiedCount = 0;
        for (const observer of this.observers.values()) {
            if (observer.getSubscribedEvents().includes(event.eventType)) {
                try {
                    observer.update(event);
                    notifiedCount++;
                } catch (error) {
                    console.error(`[BookingNotifier] Error notifying ${observer.getName()}:`, error);
                }
            }
        }

        console.log(`[BookingNotifier] Notified ${notifiedCount} observers\n`);
    }

    private logEvent(event: BookingEvent): void {
        this.eventLog.push(event);
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }
    }

    /**
     * Mendapatkan daftar observer
     */
    getObservers(): string[] {
        return Array.from(this.observers.keys());
    }

    /**
     * Mendapatkan log event
     */
    getEventLog(limit: number = 50): BookingEvent[] {
        return this.eventLog.slice(-limit);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE OBSERVER 1: EmailNotificationObserver
 * ═══════════════════════════════════════════════════════════════
 * Mengirim notifikasi via email
 */
export class EmailNotificationObserver implements BookingObserver {
    private smtpConfig: { host: string; port: number };

    constructor(smtpHost: string = 'smtp.bioskop.com', smtpPort: number = 587) {
        this.smtpConfig = { host: smtpHost, port: smtpPort };
    }

    getName(): string {
        return 'EmailNotification';
    }

    getSubscribedEvents(): BookingEventType[] {
        return [
            BookingEventType.BOOKING_CREATED,
            BookingEventType.PAYMENT_SUCCESS,
            BookingEventType.BOOKING_CONFIRMED,
            BookingEventType.BOOKING_CANCELLED,
            BookingEventType.REMINDER_24_HOUR
        ];
    }

    update(event: BookingEvent): void {
        const email = this.composeEmail(event);
        this.sendEmail(event.customerEmail, email);
    }

    private composeEmail(event: BookingEvent): EmailContent {
        const templates: Record<BookingEventType, () => EmailContent> = {
            [BookingEventType.BOOKING_CREATED]: () => ({
                subject: `Booking Dibuat - ${event.bookingId}`,
                body: `
Hai ${event.customerName},

Booking Anda telah dibuat dengan detail:
- ID Booking: ${event.bookingId}
- Film: ${event.movieTitle}
- Bioskop: ${event.cinemaName}
- Jadwal: ${event.showtime}
- Kursi: ${event.seats.join(', ')}
- Total: Rp ${event.totalAmount.toLocaleString('id-ID')}

Silakan selesaikan pembayaran dalam 15 menit.

Salam,
Tim Bioskop
        `
            }),
            [BookingEventType.PAYMENT_SUCCESS]: () => ({
                subject: `Pembayaran Berhasil - ${event.bookingId}`,
                body: `
Hai ${event.customerName},

Pembayaran Anda sebesar Rp ${event.totalAmount.toLocaleString('id-ID')} telah berhasil!

Detail Booking:
- ID Booking: ${event.bookingId}
- Film: ${event.movieTitle}
- Jadwal: ${event.showtime}
- Kursi: ${event.seats.join(', ')}

E-ticket akan segera dikirim.

Terima kasih!
        `
            }),
            [BookingEventType.BOOKING_CONFIRMED]: () => ({
                subject: `E-Ticket Anda - ${event.movieTitle}`,
                body: `
Hai ${event.customerName},

Berikut adalah E-Ticket Anda:

═══════════════════════════════════
   E-TICKET BIOSKOP
═══════════════════════════════════
Booking ID : ${event.bookingId}
Film       : ${event.movieTitle}
Bioskop    : ${event.cinemaName}
Jadwal     : ${event.showtime}
Kursi      : ${event.seats.join(', ')}
═══════════════════════════════════

Tunjukkan e-ticket ini saat masuk studio.
Selamat menonton!
        `
            }),
            [BookingEventType.BOOKING_CANCELLED]: () => ({
                subject: `Booking Dibatalkan - ${event.bookingId}`,
                body: `
Hai ${event.customerName},

Booking Anda dengan ID ${event.bookingId} telah dibatalkan.

Jika ada pembayaran, refund akan diproses dalam 3-5 hari kerja.

Salam,
Tim Bioskop
        `
            }),
            [BookingEventType.REMINDER_24_HOUR]: () => ({
                subject: `Reminder: Film Besok - ${event.movieTitle}`,
                body: `
Hai ${event.customerName},

Jangan lupa! Film ${event.movieTitle} akan tayang besok.

Detail:
- Bioskop: ${event.cinemaName}
- Jadwal: ${event.showtime}
- Kursi: ${event.seats.join(', ')}

Sampai jumpa di bioskop!
        `
            }),
            [BookingEventType.PAYMENT_PENDING]: () => ({ subject: '', body: '' }),
            [BookingEventType.PAYMENT_FAILED]: () => ({ subject: '', body: '' }),
            [BookingEventType.BOOKING_COMPLETED]: () => ({ subject: '', body: '' }),
            [BookingEventType.REMINDER_1_HOUR]: () => ({ subject: '', body: '' })
        };

        const template = templates[event.eventType];
        return template ? template() : { subject: 'Notification', body: 'You have a new notification.' };
    }

    private sendEmail(to: string, email: EmailContent): void {
        console.log(`  📧 [Email] Sending to: ${to}`);
        console.log(`     Subject: ${email.subject}`);
        console.log(`     Status: SENT`);
    }
}

interface EmailContent {
    subject: string;
    body: string;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE OBSERVER 2: SMSNotificationObserver
 * ═══════════════════════════════════════════════════════════════
 * Mengirim notifikasi via SMS
 */
export class SMSNotificationObserver implements BookingObserver {
    private smsGateway: string;

    constructor(gateway: string = 'https://sms.gateway.com') {
        this.smsGateway = gateway;
    }

    getName(): string {
        return 'SMSNotification';
    }

    getSubscribedEvents(): BookingEventType[] {
        return [
            BookingEventType.PAYMENT_SUCCESS,
            BookingEventType.BOOKING_CONFIRMED,
            BookingEventType.REMINDER_1_HOUR
        ];
    }

    update(event: BookingEvent): void {
        const message = this.composeSMS(event);
        this.sendSMS(event.customerPhone, message);
    }

    private composeSMS(event: BookingEvent): string {
        switch (event.eventType) {
            case BookingEventType.PAYMENT_SUCCESS:
                return `[BIOSKOP] Pembayaran Rp ${event.totalAmount.toLocaleString()} berhasil! Booking: ${event.bookingId}`;

            case BookingEventType.BOOKING_CONFIRMED:
                return `[E-TICKET] ${event.movieTitle} - ${event.showtime} - Kursi ${event.seats.join(',')}. Tunjukkan pesan ini di loket.`;

            case BookingEventType.REMINDER_1_HOUR:
                return `[REMINDER] Film ${event.movieTitle} dimulai 1 jam lagi di ${event.cinemaName}!`;

            default:
                return `[BIOSKOP] Booking ${event.bookingId} - ${event.eventType}`;
        }
    }

    private sendSMS(to: string, message: string): void {
        console.log(`  📱 [SMS] Sending to: ${to}`);
        console.log(`     Message: ${message.substring(0, 50)}...`);
        console.log(`     Status: SENT`);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE OBSERVER 3: PushNotificationObserver
 * ═══════════════════════════════════════════════════════════════
 * Mengirim push notification ke mobile app
 */
export class PushNotificationObserver implements BookingObserver {
    private firebaseConfig: { projectId: string };

    constructor(projectId: string = 'bioskop-app') {
        this.firebaseConfig = { projectId };
    }

    getName(): string {
        return 'PushNotification';
    }

    getSubscribedEvents(): BookingEventType[] {
        return [
            BookingEventType.PAYMENT_SUCCESS,
            BookingEventType.BOOKING_CONFIRMED,
            BookingEventType.REMINDER_1_HOUR,
            BookingEventType.REMINDER_24_HOUR
        ];
    }

    update(event: BookingEvent): void {
        const notification = this.composeNotification(event);
        this.sendPush(event.customerEmail, notification); // Using email as user identifier
    }

    private composeNotification(event: BookingEvent): PushNotificationContent {
        switch (event.eventType) {
            case BookingEventType.PAYMENT_SUCCESS:
                return {
                    title: '💰 Pembayaran Berhasil',
                    body: `Booking ${event.bookingId} telah dibayar`,
                    icon: 'payment_success'
                };

            case BookingEventType.BOOKING_CONFIRMED:
                return {
                    title: '🎬 E-Ticket Siap',
                    body: `${event.movieTitle} - Tap untuk lihat e-ticket`,
                    icon: 'ticket'
                };

            case BookingEventType.REMINDER_1_HOUR:
                return {
                    title: '⏰ Film Dimulai 1 Jam Lagi!',
                    body: `${event.movieTitle} di ${event.cinemaName}`,
                    icon: 'reminder'
                };

            case BookingEventType.REMINDER_24_HOUR:
                return {
                    title: '📅 Reminder Film Besok',
                    body: `Jangan lupa ${event.movieTitle} besok!`,
                    icon: 'calendar'
                };

            default:
                return {
                    title: 'Bioskop Notification',
                    body: event.eventType,
                    icon: 'default'
                };
        }
    }

    private sendPush(userId: string, notification: PushNotificationContent): void {
        console.log(`  🔔 [Push] Sending to user: ${userId}`);
        console.log(`     Title: ${notification.title}`);
        console.log(`     Body: ${notification.body}`);
        console.log(`     Status: DELIVERED`);
    }
}

interface PushNotificationContent {
    title: string;
    body: string;
    icon: string;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE OBSERVER 4: InventoryObserver
 * ═══════════════════════════════════════════════════════════════
 * Mengupdate inventory kursi
 */
export class InventoryObserver implements BookingObserver {
    getName(): string {
        return 'InventorySystem';
    }

    getSubscribedEvents(): BookingEventType[] {
        return [
            BookingEventType.BOOKING_CONFIRMED,
            BookingEventType.BOOKING_CANCELLED
        ];
    }

    update(event: BookingEvent): void {
        switch (event.eventType) {
            case BookingEventType.BOOKING_CONFIRMED:
                this.reserveSeats(event);
                break;
            case BookingEventType.BOOKING_CANCELLED:
                this.releaseSeats(event);
                break;
        }
    }

    private reserveSeats(event: BookingEvent): void {
        console.log(`  📦 [Inventory] Reserving seats...`);
        console.log(`     Showtime: ${event.showtime}`);
        console.log(`     Seats: ${event.seats.join(', ')}`);
        console.log(`     Status: RESERVED`);
    }

    private releaseSeats(event: BookingEvent): void {
        console.log(`  📦 [Inventory] Releasing seats...`);
        console.log(`     Showtime: ${event.showtime}`);
        console.log(`     Seats: ${event.seats.join(', ')}`);
        console.log(`     Status: AVAILABLE`);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONCRETE OBSERVER 5: AnalyticsObserver
 * ═══════════════════════════════════════════════════════════════
 * Mencatat data untuk analytics
 */
export class AnalyticsObserver implements BookingObserver {
    private analyticsData: AnalyticsEntry[] = [];

    getName(): string {
        return 'AnalyticsSystem';
    }

    getSubscribedEvents(): BookingEventType[] {
        // Subscribe ke semua event
        return Object.values(BookingEventType);
    }

    update(event: BookingEvent): void {
        const entry: AnalyticsEntry = {
            eventType: event.eventType,
            bookingId: event.bookingId,
            movieTitle: event.movieTitle,
            revenue: event.eventType === BookingEventType.PAYMENT_SUCCESS ? event.totalAmount : 0,
            timestamp: event.timestamp
        };

        this.analyticsData.push(entry);

        console.log(`  📊 [Analytics] Event recorded`);
        console.log(`     Event: ${event.eventType}`);
        console.log(`     Movie: ${event.movieTitle}`);
        if (entry.revenue > 0) {
            console.log(`     Revenue: Rp ${entry.revenue.toLocaleString('id-ID')}`);
        }
    }

    /**
     * Mendapatkan total revenue
     */
    getTotalRevenue(): number {
        return this.analyticsData.reduce((sum, entry) => sum + entry.revenue, 0);
    }

    /**
     * Mendapatkan statistik per film
     */
    getMovieStats(): Map<string, number> {
        const stats = new Map<string, number>();
        for (const entry of this.analyticsData) {
            if (entry.eventType === BookingEventType.BOOKING_CONFIRMED) {
                const count = stats.get(entry.movieTitle) || 0;
                stats.set(entry.movieTitle, count + 1);
            }
        }
        return stats;
    }
}

interface AnalyticsEntry {
    eventType: BookingEventType;
    bookingId: string;
    movieTitle: string;
    revenue: number;
    timestamp: Date;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * NOTIFICATION SERVICE FACADE
 * ═══════════════════════════════════════════════════════════════
 * Facade untuk memudahkan penggunaan notification system
 */
export class NotificationManager {
    private notifier: BookingNotifier;

    constructor() {
        this.notifier = new BookingNotifier();
        this.registerDefaultObservers();
    }

    private registerDefaultObservers(): void {
        this.notifier.attach(new EmailNotificationObserver());
        this.notifier.attach(new SMSNotificationObserver());
        this.notifier.attach(new PushNotificationObserver());
        this.notifier.attach(new InventoryObserver());
        this.notifier.attach(new AnalyticsObserver());
    }

    /**
     * Mengirim notifikasi booking created
     */
    notifyBookingCreated(
        bookingId: string,
        customerName: string,
        customerEmail: string,
        customerPhone: string,
        movieTitle: string,
        cinemaName: string,
        showtime: string,
        seats: string[],
        totalAmount: number
    ): void {
        this.notifier.notify({
            eventType: BookingEventType.BOOKING_CREATED,
            bookingId,
            customerName,
            customerEmail,
            customerPhone,
            movieTitle,
            cinemaName,
            showtime,
            seats,
            totalAmount,
            timestamp: new Date()
        });
    }

    /**
     * Mengirim notifikasi pembayaran berhasil
     */
    notifyPaymentSuccess(event: Omit<BookingEvent, 'eventType' | 'timestamp'>): void {
        this.notifier.notify({
            ...event,
            eventType: BookingEventType.PAYMENT_SUCCESS,
            timestamp: new Date()
        });
    }

    /**
     * Mengirim notifikasi booking confirmed
     */
    notifyBookingConfirmed(event: Omit<BookingEvent, 'eventType' | 'timestamp'>): void {
        this.notifier.notify({
            ...event,
            eventType: BookingEventType.BOOKING_CONFIRMED,
            timestamp: new Date()
        });
    }

    /**
     * Mengirim reminder
     */
    sendReminder(event: Omit<BookingEvent, 'eventType' | 'timestamp'>, hoursBeforeShow: number): void {
        const eventType = hoursBeforeShow <= 1
            ? BookingEventType.REMINDER_1_HOUR
            : BookingEventType.REMINDER_24_HOUR;

        this.notifier.notify({
            ...event,
            eventType,
            timestamp: new Date()
        });
    }

    /**
     * Mendapatkan notifier untuk kustomisasi
     */
    getNotifier(): BookingNotifier {
        return this.notifier;
    }
}
