/**
 * Model Jadwal Tayang
 * Merepresentasikan jadwal tayang film di studio tertentu
 */

import { Movie } from './Movie';
import { Cinema, Studio } from './Cinema';

/**
 * Interface Showtime
 */
export interface Showtime {
    id: string;
    movie: Movie;
    cinema: Cinema;
    studio: Studio;
    date: Date;
    startTime: string;
    endTime: string;
    basePrice: number;
    isPast(): boolean;
}

/**
 * Implementasi konkret Showtime
 */
export class ShowtimeImpl implements Showtime {
    constructor(
        public id: string,
        public movie: Movie,
        public cinema: Cinema,
        public studio: Studio,
        public date: Date,
        public startTime: string,
        public endTime: string,
        public basePrice: number
    ) { }

    /**
     * Mendapatkan informasi jadwal lengkap
     */
    getFullSchedule(): string {
        const dateStr = this.date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `${this.movie.title} - ${dateStr} ${this.startTime}`;
    }

    /**
     * Mengecek apakah jadwal sudah lewat
     */
    isPast(): boolean {
        const now = new Date();
        const showDateTime = new Date(this.date);
        const [hours, minutes] = this.startTime.split(':').map(Number);
        showDateTime.setHours(hours, minutes);
        return showDateTime < now;
    }
}
