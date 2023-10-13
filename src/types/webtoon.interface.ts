export interface SelectOption {
    genreUpCount?: number,
    genreDownCount?: number,
    updateDay?: string,
    category?: string,
    service?: string,
    fanCount?: number,
    descriptionLength?: number;
}

export interface CrawlOption {
    title?: boolean;
    author?: boolean;
    episodeLength?: boolean;
    thumbnail?: boolean;
    updateDay?: boolean;
    category?: boolean;
    genres?: boolean;
    genreCount?: boolean;
    description?: boolean;
    fanCount?: boolean;
}

export interface CrawledWebtoon {
    webtoonId: string;
    title?: string;
    author?: string;
    episodeLength?: number;
    thumbnail?: string;
    service: string;
    updateDay?: string;
    category?: string;
    genres?: string;
    genreCount?: number;
    description?: string;
    fanCount?: number;
}
    