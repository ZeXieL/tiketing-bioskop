# Sistem Pemesanan Tiket Bioskop Online

Implementasi **12 GoF Design Patterns** dalam sistem pemesanan tiket bioskop online menggunakan TypeScript dengan pendekatan Object-Oriented Programming (OOP).

## Deskripsi Proyek

Proyek ini merupakan implementasi sistem booking tiket bioskop yang mendemonstrasikan penggunaan **12 Design Patterns** dari Gang of Four (GoF):

### Creational Patterns (4 patterns)
| Pattern | Implementasi | File |
|---------|--------------|------|
| **Factory Method** | Pembuatan tiket berbagai tipe (Regular, VIP, IMAX) | `src/ticket/TicketFactory.ts` |
| **Abstract Factory** | Pembuatan paket bioskop (Regular & Premium) | `src/cinema-package/PackageFactory.ts` |
| **Builder** | Konstruksi booking kompleks bertahap | `src/booking/BookingBuilder.ts` |
| **Prototype** | Cloning seat layout & promo templates | `src/seat/SeatLayout.ts` |

### Structural Patterns (4 patterns)
| Pattern | Implementasi | File |
|---------|--------------|------|
| **Adapter** | Integrasi payment gateway (GoPay, OVO, Bank Transfer) | `src/payment/PaymentGateway.ts` |
| **Decorator** | Add-on tiket (snack, insurance, parking) | `src/ticket/TicketAddons.ts` |
| **Facade** | Simplified booking interface | `src/services/CinemaBookingService.ts` |
| **Proxy** | Seat availability dengan caching & access control | `src/seat/SeatAvailability.ts` |

### Behavioral Patterns (4 patterns)
| Pattern | Implementasi | File |
|---------|--------------|------|
| **State** | Lifecycle status booking (Draft->Pending->Paid->Confirmed->Completed) | `src/booking/BookingStatus.ts` |
| **Observer** | Notification system (Email, SMS, Push) | `src/notification/NotificationService.ts` |
| **Strategy** | Metode pembayaran (Credit Card, E-Wallet, QRIS) | `src/payment/PaymentMethod.ts` |
| **Command** | Seat selection dengan undo/redo | `src/seat/SeatSelection.ts` |

## Struktur Proyek

```
Tugas Besar/
├── src/
│   ├── models/           # Domain models
│   ├── ticket/           # Factory Method & Decorator
│   ├── cinema-package/   # Abstract Factory
│   ├── booking/          # Builder & State
│   ├── seat/             # Prototype, Proxy & Command
│   ├── payment/          # Adapter & Strategy
│   ├── notification/     # Observer
│   ├── services/         # Facade
│   └── demo.ts           # Demo all patterns
│
├── tests/                # Unit Tests
│   ├── creational/       # Tests for Creational Patterns
│   ├── structural/       # Tests for Structural Patterns
│   └── behavioral/       # Tests for Behavioral Patterns
│
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Cara Menjalankan

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd "Tugas Besar"

# Install dependencies
npm install

# Jalankan demo
npm run demo
# atau
npx ts-node src/demo.ts
```

### Menjalankan Test

```bash
# Menjalankan semua test
npm test tests
```

### Build

```bash
# Compile TypeScript
npm run build

# Hasil ada di folder dist/
```

## Contoh Penggunaan

### Factory Method - Pembuatan Tiket
```typescript
import { TicketFactoryProvider, TicketType } from './ticket/TicketFactory';

const factory = TicketFactoryProvider.getFactory(TicketType.VIP);
const ticket = factory.createTicket(showtime, seat);
console.log(ticket.printTicket());
```

### Builder - Pembuatan Booking
```typescript
import { ConcreteBookingBuilder, BookingDirector } from './booking/BookingBuilder';

const builder = new ConcreteBookingBuilder();
const director = new BookingDirector(builder);
const booking = director.buildVIPBooking(user, showtime, seat);
```

### Decorator - Add-on Tiket
```typescript
import { BasicTicket, SnackComboDecorator, InsuranceDecorator } from './ticket/TicketAddons';

let ticket = new BasicTicket('Avengers', '14:00', 'A1', 75000);
ticket = new SnackComboDecorator(ticket, SnackSize.LARGE);
ticket = new InsuranceDecorator(ticket);
console.log(TicketDisplay.print(ticket));
```

### Command - Seat Selection dengan Undo/Redo
```typescript
import { SeatSelectionController } from './seat/SeatSelection';

const controller = new SeatSelectionController();
controller.initializeForShowtime('SHOW-001');
controller.selectSeat('A1');
controller.selectSeat('A2');
controller.undo(); // Batalkan A2
controller.redo(); // Pilih kembali A2
```

## Diagram

Setiap pattern dilengkapi dengan:
- Class Diagram
- Sequence Diagram (untuk behavioral patterns)

Lihat folder `diagrams/` untuk UML diagrams.

## Catatan Akademik

Setiap implementasi pattern mencakup:
1. **Penjelasan Masalah** - Mengapa pattern diperlukan
2. **Alasan Pemilihan** - Mengapa pattern ini sesuai
3. **Pemetaan ke Domain** - Bagaimana pattern diterapkan ke konteks bioskop
4. **Kelebihan** - Manfaat dari penggunaan pattern
5. **Kode yang Terdokumentasi** - Dengan komentar

## Teknologi

- **TypeScript** - Static typing & OOP support
- **Node.js** - Runtime environment
- **ts-node** - TypeScript execution
- **Jest** - Testing framework

## Kontributor

- 

## Lisensi

Proyek ini dibuat untuk keperluan tugas besar mata kuliah.

---

<<<<<<< HEAD
*Dibuat dengan cinta untuk pembelajaran Design Patterns*
=======
*Dibuat untuk pembelajaran Design Patterns*
>>>>>>> 2f6dd62cbffe9083a7526a341401f4f8b8bdf2fc
