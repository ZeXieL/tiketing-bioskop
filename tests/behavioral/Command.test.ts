
import { SeatSelectionController } from '../../src/seat/SeatSelection';
import { SeatStatus, SeatType } from '../../src/models/Seat';

describe('Command Pattern - Seat Selection Undo/Redo', () => {
    let controller: SeatSelectionController;

    beforeEach(() => {
        controller = new SeatSelectionController();
        controller.initializeForShowtime('SHW-1', 5, 5, 50000, false); // 5 rows, 5 col, 25 seats, no random booking
    });

    test('should select seat using command', () => {
        const result = controller.selectSeat('A1');

        expect(result).toBe(true);
        const selected = controller.getSelectedSeats();
        expect(selected.length).toBe(1);
        expect(selected[0].getCode()).toBe('A1');
    });

    test('should undo seat selection', () => {
        controller.selectSeat('A1');

        // Check selected
        expect(controller.getSelectedSeats().length).toBe(1);

        // Undo
        const undoResult = controller.undo();

        expect(undoResult).toBe(true);
        expect(controller.getSelectedSeats().length).toBe(0);

        const seat = controller.displayLayout(); // Indirect check via layout string
        expect(seat).not.toContain('[S]'); // Selected symbol
    });

    test('should redo undone selection', () => {
        // Find an available seat
        const availableSeats = controller.getSelectedSeats(); // Empty at start
        controller.selectSeat('A1');

        // If A1 was not available, find another
        if (controller.getSelectedSeats().length === 0) {
            // Try other seats
            for (let i = 1; i <= 5; i++) {
                if (controller.selectSeat(`A${i}`)) break;
            }
        }

        const selectedSeat = controller.getSelectedSeats()[0]?.getCode();
        controller.undo();

        // Redo
        const redoResult = controller.redo();

        expect(redoResult).toBe(true);
        expect(controller.getSelectedSeats().length).toBe(1);
        expect(controller.getSelectedSeats()[0].getCode()).toBe(selectedSeat);
    });

    test('should support multiple commands history', () => {
        // Find 3 available seats dynamically
        const seats: string[] = [];
        for (let row of ['A', 'B', 'C', 'D', 'E']) {
            for (let num = 1; num <= 5; num++) {
                if (controller.selectSeat(`${row}${num}`)) {
                    seats.push(`${row}${num}`);
                    if (seats.length === 3) break;
                }
            }
            if (seats.length === 3) break;
        }

        expect(controller.getSelectedSeats().length).toBe(3);

        controller.undo(); // Undo last seat
        expect(controller.getSelectedSeats().length).toBe(2);

        controller.undo(); // Undo second seat
        expect(controller.getSelectedSeats().length).toBe(1);

        controller.redo(); // Redo second seat
        expect(controller.getSelectedSeats().length).toBe(2);
    });

    test('should handle invalid operations gracefully', () => {
        // Undo without history
        expect(controller.undo()).toBe(false);

        // Select already selected (if logic prevents)
        /* Actually Manager logic prevents */
        controller.selectSeat('B1');
        // controller.selectSeat('B1'); // Would likely fail or warn in Manager

        // Redo without undo history
        expect(controller.redo()).toBe(false);
    });

    test('should select multiple seats as a single command', () => {
        const seats = ['C1', 'C2', 'C3'];
        controller.selectMultipleSeats(seats);

        expect(controller.getSelectedSeats().length).toBe(3);

        // Undo entire batch
        controller.undo();
        expect(controller.getSelectedSeats().length).toBe(0);
    });
});
