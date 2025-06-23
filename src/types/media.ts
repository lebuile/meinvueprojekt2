export type MediaType = 'MOVIE' | 'SERIES'

export interface Media {
  id?: number
  title: string
  genre: string
  type: MediaType
  watched: boolean
}
