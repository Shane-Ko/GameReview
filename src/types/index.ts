export interface Game {
    id: number;
    genreId: number;
    title: string;
    developer: string;
    releaseYear: number;
    description: string;
    image: string;
    rating: number;
    reviewCount: number;
    tags: string[];
}

export interface Genres {
    id: number;
    genreName: string;
}

export interface Review {
    id: number;
    gameId: number;
    author: string;
    rating: number;
    content: string;
    playTime: number;
    createdAt: string;
}