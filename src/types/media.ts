export type MediaType = 'MOVIE' | 'SERIES'

export interface Media {
  id: number
  title: string
  genre: string
  type: 'MOVIE' | 'SERIES'
  watched: boolean
  rating: number | null
  comment: string | null
  createdAt: string
  updatedAt: string
  ratingDate: string | null
  tmdbId?: number | null
  trailerUrl?: string | null
}
