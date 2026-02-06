/**
 * Model Film
 * Merepresentasikan data film yang ditayangkan di bioskop
 */
export interface Movie {
    id: string;
    title: string;
    genre: string;
    duration: number; // dalam menit
    rating: string;
    synopsis: string;
    posterUrl: string;
    releaseDate: Date;
}

/**
 * Implementasi konkret Movie
 */
export class MovieImpl implements Movie {
    constructor(
        public id: string,
        public title: string,
        public genre: string,
        public duration: number,
        public rating: string,
        public synopsis: string,
        public posterUrl: string,
        public releaseDate: Date
    ) { }

    /**
     * Mendapatkan durasi dalam format jam:menit
     */
    getFormattedDuration(): string {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        return `${hours}j ${minutes}m`;
    }
}
