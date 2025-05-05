import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IBook, IBookPreview, IAudioSample } from '../interfaces/book.interface';
import type { ICatalogFilters, IFilterOption } from '../interfaces/filters.interface';
import { useStorage } from '@vueuse/core';

export const useCatalogStore = defineStore('catalog', () => {
  const books = ref<IBook[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const booksCache = useStorage<Map<string, {data: IBook, timestamp: number}>>(
    'bookstore-books-cache',
    new Map()
  );
  const previewCache = useStorage<Map<string, {data: IBookPreview, timestamp: number}>>(
    'bookstore-preview-cache',
    new Map()
  );
  const audioSampleCache = useStorage<Map<string, {data: IAudioSample, timestamp: number}>>(
    'bookstore-audio-cache',
    new Map()
  );
  const searchResultsCache = useStorage<Map<string, {books: string[], total: number, timestamp: number}>>(
    'bookstore-search-cache',
    new Map()
  );
  
  const filters = ref<ICatalogFilters>({
    search: '',
    genres: [],
    authors: [],
    publishers: [],
    priceRange: { min: 0, max: 5000 },
    ratings: [
      { value: 5, checked: false },
      { value: 4, checked: false },
      { value: 3, checked: false },
      { value: 2, checked: false },
      { value: 1, checked: false }
    ],
    sortBy: 'popularity',
    onlyDiscounted: false,
    hasPreview: false,
    hasAudio: false,
    page: 1,
    perPage: 12
  });

  const totalBooks = ref(0);
  const totalPages = computed(() => Math.ceil(totalBooks.value / filters.value.perPage));
  const pendingRequests = ref<Map<string, AbortController>>(new Map());

  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  function getCacheKey(filterParams: Partial<ICatalogFilters> = {}) {
    const cacheParams = {
      search: filters.value.search,
      genres: filters.value.genres.map(g => g.value).join(','),
      authors: filters.value.authors.map(a => a.value).join(','),
      publishers: filters.value.publishers.map(p => p.value).join(','),
      priceRange: `${filters.value.priceRange.min}-${filters.value.priceRange.max}`,
      ratings: filters.value.ratings.filter(r => r.checked).map(r => r.value).join(','),
      page: filters.value.page,
      perPage: filters.value.perPage,
      sortBy: filters.value.sortBy,
      onlyDiscounted: filters.value.onlyDiscounted,
      hasPreview: filters.value.hasPreview,
      hasAudio: filters.value.hasAudio,
      ...filterParams
    };
    return JSON.stringify(cacheParams);
  }

  function isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  async function fetchBooks() {
    const cacheKey = getCacheKey();
    isLoading.value = true;
    error.value = null;
    
    // Cancel any pending request with the same cache key
    if (pendingRequests.value.has(cacheKey)) {
      pendingRequests.value.get(cacheKey)?.abort();
    }
    
    const controller = new AbortController();
    pendingRequests.value.set(cacheKey, controller);
    
    try {
      // Check if we have cached search results that match our current filters
      const cachedResults = searchResultsCache.value.get(cacheKey);
      if (cachedResults && isCacheValid(cachedResults.timestamp)) {
        totalBooks.value = cachedResults.total;
        
        // Get books from cache
        const cachedBooks = cachedResults.books.map(id => {
          const cachedBook = booksCache.value.get(id);
          return cachedBook ? cachedBook.data : null;
        }).filter(Boolean) as IBook[];
        
        if (cachedBooks.length > 0) {
          books.value = cachedBooks;
          isLoading.value = false;
          return;
        }
      }
      
      // Generate static book data since we're facing CORS issues with the API
      const bookData = generateMockBooks();
      
      // Apply client-side filtering that would normally happen after API call
      let filteredBooks = applyFilters(bookData);
      
      // Apply pagination
      const startIndex = (filters.value.page - 1) * filters.value.perPage;
      const endIndex = startIndex + filters.value.perPage;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
      
      // Cache the results
      searchResultsCache.value.set(cacheKey, {
        books: paginatedBooks.map(book => book.id),
        total: filteredBooks.length,
        timestamp: Date.now()
      });
      
      // Update the state
      totalBooks.value = filteredBooks.length;
      books.value = paginatedBooks;
    } catch (err) {
      if (!controller.signal.aborted) {
        error.value = 'Ошибка при загрузке книг. Пожалуйста, попробуйте позже.';
        console.error(err);
        books.value = [];
      }
    } finally {
      if (pendingRequests.value.get(cacheKey) === controller) {
        pendingRequests.value.delete(cacheKey);
      }
      isLoading.value = false;
    }
  }

  // Function to generate static book data
  function generateMockBooks(): IBook[] {
    // List of Russian authors
    const russianAuthors = [
      'Лев Толстой',
      'Фёдор Достоевский',
      'Александр Пушкин',
      'Николай Гоголь',
      'Антон Чехов',
      'Михаил Булгаков',
      'Иван Тургенев',
      'Максим Горький',
      'Борис Пастернак',
      'Анна Ахматова'
    ];
    
    // Book titles by author
    const bookTitles: {[key: string]: string[]} = {
      'Лев Толстой': [
        'Война и мир', 'Анна Каренина', 'Воскресение', 'Севастопольские рассказы', 
        'Казаки', 'Детство', 'Отрочество', 'Юность', 'Крейцерова соната',
        'Смерть Ивана Ильича', 'Хаджи-Мурат', 'Власть тьмы', 'Плоды просвещения',
        'Живой труп', 'После бала', 'Исповедь'
      ],
      'Фёдор Достоевский': [
        'Преступление и наказание', 'Братья Карамазовы', 'Идиот', 'Бесы', 
        'Подросток', 'Униженные и оскорбленные', 'Игрок', 'Белые ночи',
        'Записки из подполья', 'Записки из мертвого дома', 'Бедные люди',
        'Двойник', 'Вечный муж', 'Кроткая', 'Село Степанчиково и его обитатели'
      ],
      'Александр Пушкин': [
        'Евгений Онегин', 'Капитанская дочка', 'Пиковая дама', 'Борис Годунов',
        'Руслан и Людмила', 'Дубровский', 'Повести Белкина', 'Медный всадник',
        'Сказка о царе Салтане', 'Сказка о рыбаке и рыбке', 'Сказка о мертвой царевне',
        'Бахчисарайский фонтан', 'Маленькие трагедии', 'Полтава', 'Арап Петра Великого'
      ],
      'Николай Гоголь': [
        'Мертвые души', 'Ревизор', 'Тарас Бульба', 'Вечера на хуторе близ Диканьки',
        'Миргород', 'Нос', 'Шинель', 'Портрет', 'Невский проспект', 
        'Вий', 'Записки сумасшедшего', 'Женитьба', 'Игроки', 'Петербургские повести'
      ],
      'Антон Чехов': [
        'Вишневый сад', 'Чайка', 'Три сестры', 'Дядя Ваня', 'Палата №6',
        'Человек в футляре', 'Дама с собачкой', 'Ионыч', 'Хамелеон', 
        'Толстый и тонкий', 'Смерть чиновника', 'Каштанка', 'Степь',
        'Скучная история', 'Попрыгунья', 'Остров Сахалин'
      ],
      'Михаил Булгаков': [
        'Мастер и Маргарита', 'Собачье сердце', 'Белая гвардия', 'Дни Турбиных',
        'Бег', 'Роковые яйца', 'Дьяволиада', 'Записки юного врача', 
        'Зойкина квартира', 'Театральный роман', 'Жизнь господина де Мольера', 'Иван Васильевич'
      ],
      'Иван Тургенев': [
        'Отцы и дети', 'Дворянское гнездо', 'Рудин', 'Накануне', 'Записки охотника',
        'Ася', 'Вешние воды', 'Дым', 'Новь', 'Первая любовь', 
        'Месяц в деревне', 'Муму', 'Песнь торжествующей любви', 'Стихотворения в прозе'
      ],
      'Максим Горький': [
        'На дне', 'Мать', 'Детство', 'В людях', 'Мои университеты',
        'Старуха Изергиль', 'Челкаш', 'Фома Гордеев', 'Жизнь Клима Самгина',
        'Макар Чудра', 'Песня о Соколе', 'Песня о Буревестнике', 'Егор Булычов и другие',
        'Васса Железнова', 'Дачники'
      ],
      'Борис Пастернак': [
        'Доктор Живаго', 'Сестра моя – жизнь', 'Второе рождение', 'Поверх барьеров',
        'Охранная грамота', 'Детство Люверс', 'Воздушные пути', 'Избранные стихотворения',
        'Близнец в тучах', 'Высокая болезнь', 'Девятьсот пятый год', 'Лейтенант Шмидт'
      ],
      'Анна Ахматова': [
        'Реквием', 'Вечер', 'Четки', 'Белая стая', 'Подорожник', 
        'Anno Domini', 'Тростник', 'Поэма без героя', 'Бег времени',
        'У самого моря', 'Путем всея земли', 'Из шести книг', 'Седьмая книга',
        'Ветер войны', 'Северные элегии'
      ]
    };
    
    const coverImages = [
      'https://covers.openlibrary.org/b/id/8091016-M.jpg',
      'https://covers.openlibrary.org/b/id/7395361-M.jpg',
      'https://covers.openlibrary.org/b/id/6424911-M.jpg',
      'https://covers.openlibrary.org/b/id/8025123-M.jpg',
      'https://covers.openlibrary.org/b/id/7886519-M.jpg',
      'https://covers.openlibrary.org/b/id/8155423-M.jpg',
      'https://covers.openlibrary.org/b/id/7897138-M.jpg',
      'https://covers.openlibrary.org/b/id/12547271-M.jpg',
      'https://covers.openlibrary.org/b/id/12499202-M.jpg',
      'https://covers.openlibrary.org/b/id/12705555-M.jpg'
    ];
    
    const books: IBook[] = [];
    
    // Generate books for each author
    for (const author of russianAuthors) {
      const authorTitles = bookTitles[author];
      const bookCountForAuthor = author === 'Лев Толстой' || author === 'Фёдор Достоевский' || author === 'Александр Пушкин' 
        ? 20 // More books for major authors
        : 14; // Fewer for others
      
      for (let i = 0; i < bookCountForAuthor && i < authorTitles.length; i++) {
        const title = authorTitles[i];
        const id = `${author.replace(/\s+/g, '-')}-${title.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}`;
        
        // Generate random book details
        const randomYear = 1800 + Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 1000) + 500;
        const discountPercentage = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : undefined;
        const rating = Math.min(5, Math.max(3, 3.5 + Math.random() * 1.5));
        
        // Select genres appropriate for this author's work
        let genres = ['Русская литература'];
        
        if (author === 'Лев Толстой' || author === 'Фёдор Достоевский') {
          genres.push('Классика', 'Философия');
        } else if (author === 'Александр Пушкин' || author === 'Анна Ахматова') {
          genres.push('Поэзия', 'Классика');
        } else if (author === 'Михаил Булгаков') {
          genres.push('Фантастика', 'Философия');
        } else if (author === 'Николай Гоголь') {
          genres.push('Сатира', 'Классика');
        } else if (author === 'Антон Чехов') {
          genres.push('Драма', 'Художественная литература');
        } else {
          genres.push('Художественная литература');
          
          // Add one more random genre
          const additionalGenres = ['Классика', 'Драма', 'Историческая проза', 'Романтика', 'Приключения'];
          genres.push(additionalGenres[Math.floor(Math.random() * additionalGenres.length)]);
        }
        
        // Create book object
        const book: IBook = {
          id,
          title,
          author,
          description: getBookDescription(),
          price,
          discountPercentage,
          coverImage: coverImages[Math.floor(Math.random() * coverImages.length)],
          rating,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          genres,
          publicationDate: `${randomYear}-01-01`,
          pages: Math.floor(Math.random() * 300) + 100,
          language: 'Русский',
          isbn: `978-5-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 10)}`,
          publisher: ['Эксмо', 'АСТ', 'Азбука', 'Росмэн', 'Альфа-книга', 'МИФ', 'Академический проект'][Math.floor(Math.random() * 7)],
          hasPreview: true,
          hasAudioSample: Math.random() > 0.3
        };
        
        books.push(book);
        
        // Cache the book
        booksCache.value.set(id, {
          data: book,
          timestamp: Date.now()
        });
      }
    }
    
    return books;
  }
  
  function applyFilters(booksToFilter: IBook[]): IBook[] {
    let filteredBooks = [...booksToFilter];
    
    // Apply search filter
    if (filters.value.search) {
      const searchQuery = filters.value.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => {
        return book.title.toLowerCase().includes(searchQuery) || 
               book.author.toLowerCase().includes(searchQuery) ||
               book.description.toLowerCase().includes(searchQuery) ||
               book.genres.some(genre => genre.toLowerCase().includes(searchQuery));
      });
    }
    
    // Apply price range filter
    if (filters.value.priceRange.min > 0 || filters.value.priceRange.max < 5000) {
      filteredBooks = filteredBooks.filter(book => {
        const finalPrice = book.discountPercentage 
          ? book.price - (book.price * book.discountPercentage / 100) 
          : book.price;
        return finalPrice >= filters.value.priceRange.min && finalPrice <= filters.value.priceRange.max;
      });
    }
    
    // Apply rating filter
    const selectedRatings = filters.value.ratings.filter(r => r.checked).map(r => r.value);
    if (selectedRatings.length > 0) {
      filteredBooks = filteredBooks.filter(book => {
        const roundedRating = Math.round(book.rating);
        return selectedRatings.includes(roundedRating);
      });
    }
    
    // Apply genre filter
    if (filters.value.genres.length > 0) {
      filteredBooks = filteredBooks.filter(book => {
        return filters.value.genres.some(genreOption => {
          const genreValue = genreOption.value.toLowerCase();
          
          // Check for exact matches first
          for (const bookGenre of book.genres) {
            if (bookGenre.toLowerCase() === genreValue) {
              return true;
            }
          }
          
          // Then check for partial matches
          for (const bookGenre of book.genres) {
            const lowercaseBookGenre = bookGenre.toLowerCase();
            if (lowercaseBookGenre.includes(genreValue) || genreValue.includes(lowercaseBookGenre)) {
              return true;
            }
          }
          
          return false;
        });
      });
    }
    
    // Apply author filter
    if (filters.value.authors.length > 0) {
      filteredBooks = filteredBooks.filter(book => {
        const bookAuthor = book.author.toLowerCase();
        
        return filters.value.authors.some(authorOption => {
          const authorValue = authorOption.value.toLowerCase();
          
          // Check for exact match
          if (bookAuthor === authorValue) {
            return true;
          }
          
          // Check for partial match
          if (bookAuthor.includes(authorValue) || authorValue.includes(bookAuthor)) {
            return true;
          }
          
          // Match last names
          const bookAuthorParts = bookAuthor.split(' ');
          const filterAuthorParts = authorValue.split(' ');
          
          if (bookAuthorParts.length > 0 && filterAuthorParts.length > 0) {
            const bookLastName = bookAuthorParts[bookAuthorParts.length - 1];
            const filterLastName = filterAuthorParts[filterAuthorParts.length - 1];
            
            if (bookLastName === filterLastName) {
              return true;
            }
          }
          
          return false;
        });
      });
    }
    
    // Apply publisher filter
    if (filters.value.publishers.length > 0) {
      filteredBooks = filteredBooks.filter(book => {
        const bookPublisher = book.publisher.toLowerCase();
        
        return filters.value.publishers.some(publisherOption => {
          const publisherValue = publisherOption.value.toLowerCase();
          return bookPublisher === publisherValue || 
                 bookPublisher.includes(publisherValue) || 
                 publisherValue.includes(bookPublisher);
        });
      });
    }
    
    // Apply discount filter
    if (filters.value.onlyDiscounted) {
      filteredBooks = filteredBooks.filter(book => book.discountPercentage !== undefined);
    }
    
    // Apply features filters
    if (filters.value.hasPreview) {
      filteredBooks = filteredBooks.filter(book => book.hasPreview);
    }
    
    if (filters.value.hasAudio) {
      filteredBooks = filteredBooks.filter(book => book.hasAudioSample);
    }
    
    // Apply sorting
    switch (filters.value.sortBy) {
      case 'price-low':
        filteredBooks.sort((a, b) => {
          const priceA = a.discountPercentage 
            ? a.price - (a.price * a.discountPercentage / 100) 
            : a.price;
          const priceB = b.discountPercentage 
            ? b.price - (b.price * b.discountPercentage / 100) 
            : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filteredBooks.sort((a, b) => {
          const priceA = a.discountPercentage 
            ? a.price - (a.price * a.discountPercentage / 100) 
            : a.price;
          const priceB = b.discountPercentage 
            ? b.price - (b.price * b.discountPercentage / 100) 
            : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filteredBooks.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredBooks.sort((a, b) => {
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        });
        break;
      default: // popularity - based on review count
        filteredBooks.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    
    return filteredBooks;
  }

  async function fetchBookById(id: string): Promise<IBook | null> {
    const cachedBook = booksCache.value.get(id);
    if (cachedBook && isCacheValid(cachedBook.timestamp)) {
      return cachedBook.data;
    }

    // Since we can't use the API directly due to CORS issues,
    // find the book in our generated collection
    const allBooks = generateMockBooks();
    const book = allBooks.find(b => b.id === id);
    
    if (book) {
      booksCache.value.set(id, {
        data: book,
        timestamp: Date.now()
      });
      return book;
    }
    
    // If book not found, create a placeholder
    const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
    const newBook: IBook = {
      ...randomBook,
      id,
      title: `Книга ${id.substring(0, 8)}`,
    };
    
    booksCache.value.set(id, {
      data: newBook,
      timestamp: Date.now()
    });
    
    return newBook;
  }

  async function fetchBookPreview(id: string): Promise<IBookPreview | null> {
    const cachedPreview = previewCache.value.get(id);
    if (cachedPreview && isCacheValid(cachedPreview.timestamp)) {
      return cachedPreview.data;
    }

    // Find the book in cache or generate mock data
    const book = await fetchBookById(id);
    
    if (!book) return null;
    
    const preview: IBookPreview = {
      id,
      title: book.title,
      author: book.author,
      previewText: getFullBookPreviewText(book.title, book.author, book.description),
      previewImageUrl: book.coverImage
    };
    
    previewCache.value.set(id, {
      data: preview,
      timestamp: Date.now()
    });
    
    return preview;
  }

  function getFullBookPreviewText(title: string, author: string, description: string): string {
    // Generate more authentic preview text based on the book's title, author and description
    const bookIntro = `«${title}» — одно из знаменитых произведений ${author}. ${description}`;
    
    // Add some fictional content that feels like part of the actual book
    const chapterIntro = `\n\nГлава 1\n\n`;
    
    const contentText = `Этот день должен был стать особенным. ${title.split(' ')[0]} знал это с самого утра, когда первые лучи солнца коснулись его лица. За окном шелестели листья, и где-то вдалеке слышался шум реки. Мир казался таким обычным, но внутри него всё изменилось.\n\n"Иногда самые значительные перемены начинаются с малого," — подумал он, вспоминая слова, которые часто повторял его отец. Эта мысль стала для него путеводной звездой в тот момент, когда всё остальное казалось неопределённым.\n\nСобытия прошедших месяцев оставили свой след, но сейчас, стоя на пороге новой жизни, он чувствовал, что готов двигаться дальше. Будущее, сотканное из неизвестности, уже не пугало его так, как раньше.`;
    
    return `${bookIntro}${chapterIntro}${contentText}`;
  }

  async function fetchAudioSample(id: string): Promise<IAudioSample | null> {
    const cachedAudio = audioSampleCache.value.get(id);
    if (cachedAudio && isCacheValid(cachedAudio.timestamp)) {
      return cachedAudio.data;
    }

    // Find the book or get mock data
    const book = await fetchBookById(id);
    
    if (!book) return null;
    
    // Create a sample focused on text-to-speech
    const audioSample: IAudioSample = {
      id: `${id}-audio`,
      bookId: id,
      title: book.title,
      duration: 94, // 1:34 as specified
      url: '', // Empty URL since we're using speech synthesis
      useSpeechSynthesis: true,
      textToRead: `${book.title} автора ${book.author}. ${book.description.substring(0, 250)}`
    };
    
    audioSampleCache.value.set(id, {
      data: audioSample,
      timestamp: Date.now()
    });
    
    return audioSample;
  }

  async function fetchGenres(): Promise<IFilterOption[]> {
    // Return static genres since we can't access the API due to CORS
    return getDefaultGenres();
  }
  
  function getDefaultGenres(): IFilterOption[] {
    return [
      { id: 'russian', value: 'Русская литература', label: 'Русская литература', count: 150 },
      { id: 'fiction', value: 'Художественная литература', label: 'Художественная литература', count: 35 },
      { id: 'classics', value: 'Классика', label: 'Классика', count: 28 },
      { id: 'romance', value: 'Романтика', label: 'Романтика', count: 18 },
      { id: 'poetry', value: 'Поэзия', label: 'Поэзия', count: 24 },
      { id: 'adventure', value: 'Приключения', label: 'Приключения', count: 15 },
      { id: 'history', value: 'Историческая проза', label: 'Историческая проза', count: 12 },
      { id: 'philosophy', value: 'Философия', label: 'Философия', count: 10 },
      { id: 'drama', value: 'Драма', label: 'Драма', count: 8 },
      { id: 'satire', value: 'Сатира', label: 'Сатира', count: 6 }
    ];
  }

  async function fetchAuthors(): Promise<IFilterOption[]> {
    // Return static authors since we can't access the API due to CORS
    return getDefaultAuthors();
  }
  
  function getDefaultAuthors(): IFilterOption[] {
    return [
      { id: '1', value: 'Лев Толстой', label: 'Лев Толстой', count: 18 },
      { id: '2', value: 'Фёдор Достоевский', label: 'Фёдор Достоевский', count: 16 },
      { id: '3', value: 'Александр Пушкин', label: 'Александр Пушкин', count: 20 },
      { id: '4', value: 'Николай Гоголь', label: 'Николай Гоголь', count: 14 },
      { id: '5', value: 'Антон Чехов', label: 'Антон Чехов', count: 17 },
      { id: '6', value: 'Михаил Булгаков', label: 'Михаил Булгаков', count: 9 },
      { id: '7', value: 'Иван Тургенев', label: 'Иван Тургенев', count: 12 },
      { id: '8', value: 'Максим Горький', label: 'Максим Горький', count: 15 },
      { id: '9', value: 'Борис Пастернак', label: 'Борис Пастернак', count: 10 },
      { id: '10', value: 'Анна Ахматова', label: 'Анна Ахматова', count: 19 }
    ];
  }
  
  function getBookDescription(): string {
    const defaultDescriptions = [
      'Это классическое произведение русской литературы, исследующее глубины человеческой души и моральные дилеммы общества.',
      'Роман отражает реалии русской жизни, раскрывая сложные характеры героев на фоне исторических и социальных перемен.',
      'Автор мастерски переплетает судьбы героев, создавая многогранное повествование о жизни, любви и поиске смысла.',
      'Эта книга — яркий образец русской литературной традиции, сочетающий в себе глубокий психологизм и философские размышления.',
      'Произведение погружает читателя в атмосферу русской культуры и истории, затрагивая вечные вопросы человеческого бытия.',
      'В этом романе раскрывается богатство русской души, противоречия человеческой природы и красота русского языка.',
      'Книга представляет собой глубокое исследование русского национального характера и исторической судьбы России.',
      'Автор виртуозно описывает быт и нравы русского общества, создавая живую панораму эпохи.',
      'Это произведение — неотъемлемая часть золотого фонда русской классической литературы, покоряющая своей глубиной и многогранностью.',
      'Роман сочетает в себе психологическую глубину, социальный анализ и философское осмысление действительности в лучших традициях русской литературы.'
    ];
    
    return defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];
  }

  function updateFilters(newFilters: Partial<ICatalogFilters>) {
    filters.value = { ...filters.value, ...newFilters };
    if (newFilters.page === undefined) {
      filters.value.page = 1;
    }
    fetchBooks();
  }

  function resetFilters() {
    filters.value = {
      search: '',
      genres: [],
      authors: [],
      publishers: [],
      priceRange: { min: 0, max: 5000 },
      ratings: [
        { value: 5, checked: false },
        { value: 4, checked: false },
        { value: 3, checked: false },
        { value: 2, checked: false },
        { value: 1, checked: false }
      ],
      sortBy: 'popularity',
      onlyDiscounted: false,
      hasPreview: false,
      hasAudio: false,
      page: 1,
      perPage: 12
    };
    fetchBooks();
  }

  function setPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    filters.value.page = page;
    fetchBooks();
  }

  function clearCache() {
    booksCache.value.clear();
    previewCache.value.clear();
    audioSampleCache.value.clear();
    searchResultsCache.value.clear();
  }

  async function getRecommendedBooks(bookId: string, author: string, genres: string[]): Promise<IBook[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get all books
    const allBooks = generateMockBooks();
    
    // Filter out the current book
    const filteredBooks = allBooks.filter(book => book.id !== bookId);
    
    // Get books by the same author
    const booksByAuthor = filteredBooks.filter(book => book.author === author);
    
    // Get books in the same genre
    const booksByGenre = filteredBooks.filter(book => 
      book.author !== author && book.genres.some(genre => genres.includes(genre))
    );
    
    // Get some popular books (different author, different genres)
    const popularBooks = filteredBooks
      .filter(book => 
        book.author !== author && 
        !book.genres.some(genre => genres.includes(genre))
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    
    // Combine results, taking a limited number from each category
    const recommendations = [
      ...booksByAuthor.slice(0, 2),
      ...booksByGenre.slice(0, 4),
      ...popularBooks.slice(0, 2)
    ];
    
    // Shuffle the array to mix different types
    return shuffleArray(recommendations).slice(0, 8);
  }
  
  // Helper function to shuffle array
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  async function fetchPublishers(): Promise<IFilterOption[]> {
    // Return static publishers since we can't access the API due to CORS
    return getDefaultPublishers();
  }
  
  function getDefaultPublishers(): IFilterOption[] {
    return [
      { id: 'eksmo', value: 'Эксмо', label: 'Эксмо', count: 35 },
      { id: 'ast', value: 'АСТ', label: 'АСТ', count: 42 },
      { id: 'azbuka', value: 'Азбука', label: 'Азбука', count: 28 },
      { id: 'rosmen', value: 'Росмэн', label: 'Росмэн', count: 15 },
      { id: 'alfa', value: 'Альфа-книга', label: 'Альфа-книга', count: 22 },
      { id: 'mif', value: 'МИФ', label: 'МИФ', count: 18 },
      { id: 'academic', value: 'Академический проект', label: 'Академический проект', count: 10 }
    ];
  }

  return {
    books,
    isLoading,
    error,
    filters,
    totalBooks,
    totalPages,
    fetchBooks,
    fetchBookById,
    fetchBookPreview,
    fetchAudioSample,
    fetchGenres,
    fetchAuthors,
    getRecommendedBooks,
    updateFilters,
    resetFilters,
    setPage,
    clearCache,
    fetchPublishers
  };
}); 