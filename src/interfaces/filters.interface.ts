export interface IPriceRange {
  min: number;
  max: number;
}

export interface IRatingFilter {
  value: number;
  checked: boolean;
}

export interface IFilterOption {
  id: string;
  value: string;
  label: string;
  count?: number;
  checked?: boolean;
}

export interface ICatalogFilters {
  search: string;
  genres: IFilterOption[];
  authors: IFilterOption[];
  publishers: IFilterOption[];
  priceRange: IPriceRange;
  ratings: IRatingFilter[];
  sortBy: 'popularity' | 'price-low' | 'price-high' | 'newest' | 'rating';
  onlyDiscounted: boolean;
  hasPreview: boolean;
  hasAudio: boolean;
  page: number;
  perPage: number;
} 