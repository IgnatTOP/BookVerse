import axios from 'axios';
import type { IBook } from '../interfaces/book.interface';

export class ApiService {
  private static googleBooksApiKey = 'YOUR_GOOGLE_BOOKS_API_KEY'; // Замените на свой ключ API
  private static openLibraryBaseUrl = 'https://openlibrary.org';
  private static googleBooksBaseUrl = 'https://www.googleapis.com/books/v1';

  // Поиск книг по заголовку через Open Library API
  static async searchBooksByTitle(title: string): Promise<any> {
    try {
      const response = await axios.get(`${this.openLibraryBaseUrl}/search.json`, {
        params: {
          title,
          limit: 10
        }
      });
      return response.data.docs.map(this.mapOpenLibraryBookToInternalFormat);
    } catch (error) {
      console.error('Error searching books by title:', error);
      throw error;
    }
  }

  // Получение обложки книги по ID из Open Library
  static async getBookCoverById(openLibraryId: string, size: 'S' | 'M' | 'L' = 'M'): Promise<string> {
    return `${this.openLibraryBaseUrl}/b/id/${openLibraryId}-${size}.jpg`;
  }

  // Поиск книг через Google Books API
  static async searchGoogleBooks(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.googleBooksBaseUrl}/volumes`, {
        params: {
          q: query,
          maxResults: 20,
          key: this.googleBooksApiKey
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        return response.data.items.map(this.mapGoogleBookToInternalFormat);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching Google Books:', error);
      throw error;
    }
  }

  // Получение деталей книги по ID из Google Books
  static async getBookDetails(googleBookId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.googleBooksBaseUrl}/volumes/${googleBookId}`, {
        params: {
          key: this.googleBooksApiKey
        }
      });
      
      return this.mapGoogleBookToInternalFormat(response.data);
    } catch (error) {
      console.error('Error getting book details:', error);
      throw error;
    }
  }

  // Преобразование книги из Google Books в формат нашего приложения
  static mapGoogleBookToInternalFormat(googleBook: any): Partial<IBook> {
    const volumeInfo = googleBook.volumeInfo || {};
    const saleInfo = googleBook.saleInfo || {};
    
    // Генерация случайной цены и скидки, если нет реальных данных
    const price = saleInfo.retailPrice?.amount || Math.floor(Math.random() * 1000) + 200;
    const discountPercentage = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 5 : undefined;
    
    return {
      id: googleBook.id,
      title: volumeInfo.title || 'Неизвестное название',
      author: volumeInfo.authors?.join(', ') || 'Неизвестный автор',
      description: volumeInfo.description || 'Описание отсутствует',
      price,
      discountPercentage,
      coverImage: volumeInfo.imageLinks?.thumbnail || '/src/assets/fallback-image.svg',
      rating: volumeInfo.averageRating || Number((Math.random() * 4 + 1).toFixed(1)),
      reviewCount: volumeInfo.ratingsCount || Math.floor(Math.random() * 100),
      genres: volumeInfo.categories || ['Неизвестный жанр'],
      publicationDate: volumeInfo.publishedDate || new Date().toISOString(),
      pages: volumeInfo.pageCount || 0,
      language: volumeInfo.language || 'ru',
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || 'Нет данных',
      publisher: volumeInfo.publisher || 'Неизвестное издательство',
      hasPreview: !!volumeInfo.previewLink,
      hasAudioSample: false, // Google Books API не предоставляет информацию об аудио-фрагментах
    };
  }

  // Преобразование книги из Open Library в формат нашего приложения
  static mapOpenLibraryBookToInternalFormat(openLibraryBook: any): Partial<IBook> {
    const id = openLibraryBook.key?.replace('/works/', '') || Math.random().toString(36).substring(2);
    
    // Генерация случайной цены и скидки
    const price = Math.floor(Math.random() * 1000) + 200;
    const discountPercentage = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 5 : undefined;
    
    return {
      id,
      title: openLibraryBook.title || 'Неизвестное название',
      author: openLibraryBook.author_name?.join(', ') || 'Неизвестный автор',
      description: openLibraryBook.description || 'Описание отсутствует',
      price,
      discountPercentage,
      coverImage: openLibraryBook.cover_i 
        ? `${this.openLibraryBaseUrl}/b/id/${openLibraryBook.cover_i}-M.jpg` 
        : '/src/assets/fallback-image.svg',
      rating: Number((Math.random() * 4 + 1).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100),
      genres: openLibraryBook.subject || ['Неизвестный жанр'],
      publicationDate: openLibraryBook.first_publish_year 
        ? `${openLibraryBook.first_publish_year}-01-01` 
        : new Date().toISOString(),
      pages: openLibraryBook.number_of_pages_median || 0,
      language: openLibraryBook.language?.[0] || 'ru',
      isbn: openLibraryBook.isbn?.[0] || 'Нет данных',
      publisher: openLibraryBook.publisher?.[0] || 'Неизвестное издательство',
      hasPreview: true,
      hasAudioSample: Math.random() < 0.3, // Случайным образом устанавливаем наличие аудио-фрагмента
    };
  }

  // Получение рекомендаций по жанру
  static async getBookRecommendations(genres: string[], limit: number = 5): Promise<any> {
    try {
      const genre = encodeURIComponent(genres[0] || 'fiction');
      const response = await axios.get(`${this.openLibraryBaseUrl}/subjects/${genre}.json`, {
        params: {
          limit
        }
      });
      
      return response.data.works.map(this.mapOpenLibraryBookToInternalFormat);
    } catch (error) {
      console.error('Error getting book recommendations:', error);
      // Возвращаем моковые данные в случае ошибки
      return this.getMockRecommendations(limit);
    }
  }

  // Получение моковых рекомендаций
  private static getMockRecommendations(limit: number = 5): Partial<IBook>[] {
    const recommendations: Partial<IBook>[] = [];
    
    for (let i = 0; i < limit; i++) {
      recommendations.push({
        id: `mock-${Math.random().toString(36).substring(2)}`,
        title: `Рекомендуемая книга ${i + 1}`,
        author: 'Известный автор',
        description: 'Описание рекомендуемой книги',
        price: Math.floor(Math.random() * 1000) + 200,
        discountPercentage: Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 5 : undefined,
        coverImage: '/src/assets/fallback-image.svg',
        rating: Number((Math.random() * 4 + 1).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 100),
        genres: ['Художественная литература'],
        publicationDate: new Date().toISOString(),
        pages: Math.floor(Math.random() * 500) + 100,
        language: 'ru',
        isbn: `ISBN-${Math.floor(Math.random() * 1000000000)}`,
        publisher: 'Издательство книг',
        hasPreview: true,
        hasAudioSample: Math.random() < 0.3,
      });
    }
    
    return recommendations;
  }
} 