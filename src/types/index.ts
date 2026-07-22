export interface Game {
    id: number | string;
    genreId: number;
    genre?: Genre;
    title: string;
    developer: string;
    releaseYear: number;
    description: string;
    image: string;
    rating: number;
    reviewCount: number;
    tags: string[];
}

export interface Genre {
    id: number;
    genreName: string;
}

export interface Review {
    id: number | string;
    gameId: number;
    author: string;
    rating: number;
    content: string;
    playTime: number;
    createdAt: string;
}