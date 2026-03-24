// Storage utilities for CMS data

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail: string;
  author: string;
  status: 'draft' | 'published';
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  organizer: string;
  location: string;
  locationType: 'offline' | 'online';
  onlineLink?: string;
  startDate: string;
  endDate: string;
  poster: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  motto: string;
  profile: string;
  faculty: string;
  degree: string;
  accreditation: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const NEWS_KEY = 'cms_news';
const EVENTS_KEY = 'cms_events';
const MEDIA_KEY = 'cms_media';
const PROGRAMS_KEY = 'cms_programs';

// Generic storage functions
const getItems = <T>(key: string): T[] => {
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
};

const saveItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// News functions
export const getNews = () => getItems<NewsItem>(NEWS_KEY);

export const saveNews = (news: NewsItem[]) => saveItems(NEWS_KEY, news);

export const addNews = (news: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  const allNews = getNews();
  const newItem: NewsItem = {
    ...news,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allNews.push(newItem);
  saveNews(allNews);
  return newItem;
};

export const updateNews = (id: string, updates: Partial<NewsItem>) => {
  const allNews = getNews();
  const index = allNews.findIndex(n => n.id === id);
  if (index !== -1) {
    allNews[index] = { ...allNews[index], ...updates, updatedAt: new Date().toISOString() };
    saveNews(allNews);
    return allNews[index];
  }
  return null;
};

export const deleteNews = (id: string) => {
  const allNews = getNews();
  const filtered = allNews.filter(n => n.id !== id);
  saveNews(filtered);
  return true;
};

// Events functions
export const getEvents = () => getItems<Event>(EVENTS_KEY);

export const saveEvents = (events: Event[]) => saveItems(EVENTS_KEY, events);

export const addEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  const allEvents = getEvents();
  const newItem: Event = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allEvents.push(newItem);
  saveEvents(allEvents);
  return newItem;
};

export const updateEvent = (id: string, updates: Partial<Event>) => {
  const allEvents = getEvents();
  const index = allEvents.findIndex(e => e.id === id);
  if (index !== -1) {
    allEvents[index] = { ...allEvents[index], ...updates, updatedAt: new Date().toISOString() };
    saveEvents(allEvents);
    return allEvents[index];
  }
  return null;
};

export const deleteEvent = (id: string) => {
  const allEvents = getEvents();
  const filtered = allEvents.filter(e => e.id !== id);
  saveEvents(filtered);
  return true;
};

// Media functions
export const getMedia = () => getItems<Media>(MEDIA_KEY);

export const saveMedia = (media: Media[]) => saveItems(MEDIA_KEY, media);

export const addMedia = (media: Omit<Media, 'id' | 'createdAt'>) => {
  const allMedia = getMedia();
  const newItem: Media = {
    ...media,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  allMedia.push(newItem);
  saveMedia(allMedia);
  return newItem;
};

export const deleteMedia = (id: string) => {
  const allMedia = getMedia();
  const filtered = allMedia.filter(m => m.id !== id);
  saveMedia(filtered);
  return true;
};

// Academic Programs functions
export const getPrograms = () => getItems<AcademicProgram>(PROGRAMS_KEY);

export const savePrograms = (programs: AcademicProgram[]) => saveItems(PROGRAMS_KEY, programs);

export const addProgram = (program: Omit<AcademicProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
  const allPrograms = getPrograms();
  const newItem: AcademicProgram = {
    ...program,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allPrograms.push(newItem);
  savePrograms(allPrograms);
  return newItem;
};

export const updateProgram = (id: string, updates: Partial<AcademicProgram>) => {
  const allPrograms = getPrograms();
  const index = allPrograms.findIndex(p => p.id === id);
  if (index !== -1) {
    allPrograms[index] = { ...allPrograms[index], ...updates, updatedAt: new Date().toISOString() };
    savePrograms(allPrograms);
    return allPrograms[index];
  }
  return null;
};

export const deleteProgram = (id: string) => {
  const allPrograms = getPrograms();
  const filtered = allPrograms.filter(p => p.id !== id);
  savePrograms(filtered);
  return true;
};

// Initialize with sample data
export const initializeStorage = () => {
  if (getNews().length === 0) {
    const sampleNews: NewsItem[] = [
      {
        id: '1',
        title: 'Penerimaan Mahasiswa Baru Tahun Akademik 2026/2027',
        content: '<p>Universitas membuka pendaftaran mahasiswa baru untuk tahun akademik 2026/2027. Pendaftaran dibuka mulai tanggal 1 April 2026.</p>',
        category: 'Akademik',
        tags: ['PMB', 'Pendaftaran', 'Mahasiswa Baru'],
        thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        author: 'Admin',
        status: 'published',
        publishDate: '2026-03-12T10:00:00',
        createdAt: '2026-03-10T10:00:00',
        updatedAt: '2026-03-10T10:00:00',
      },
      {
        id: '2',
        title: 'Seminar Nasional Teknologi Informasi 2026',
        content: '<p>Fakultas Teknik Informatika mengadakan seminar nasional dengan tema "AI untuk Indonesia Maju".</p>',
        category: 'Penelitian',
        tags: ['Seminar', 'AI', 'Teknologi'],
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        author: 'Admin',
        status: 'published',
        publishDate: '2026-03-11T14:00:00',
        createdAt: '2026-03-09T10:00:00',
        updatedAt: '2026-03-09T10:00:00',
      },
      {
        id: '3',
        title: 'Prestasi Mahasiswa di Kompetisi Robotika Internasional',
        content: '<p>Tim robotika universitas meraih juara 1 pada kompetisi internasional di Singapura.</p>',
        category: 'Kemahasiswaan',
        tags: ['Prestasi', 'Robotika', 'Kompetisi'],
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        author: 'Admin',
        status: 'draft',
        publishDate: '2026-03-13T09:00:00',
        createdAt: '2026-03-12T10:00:00',
        updatedAt: '2026-03-12T10:00:00',
      },
    ];
    saveNews(sampleNews);
  }

  if (getEvents().length === 0) {
    const sampleEvents: Event[] = [
      {
        id: '1',
        name: 'Seminar Teknologi AI dan Machine Learning',
        description: 'Seminar nasional tentang perkembangan AI dan Machine Learning di Indonesia',
        organizer: 'Fakultas Teknik Informatika',
        location: 'Auditorium Utama',
        locationType: 'offline',
        startDate: '2026-04-15T09:00:00',
        endDate: '2026-04-15T16:00:00',
        poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        status: 'published',
        createdAt: '2026-03-10T10:00:00',
        updatedAt: '2026-03-10T10:00:00',
      },
      {
        id: '2',
        name: 'Workshop Web Development',
        description: 'Workshop intensif pengembangan web modern dengan React dan Node.js',
        organizer: 'Himpunan Mahasiswa Informatika',
        location: 'https://zoom.us/workshop-webdev',
        locationType: 'online',
        onlineLink: 'https://zoom.us/workshop-webdev',
        startDate: '2026-04-20T13:00:00',
        endDate: '2026-04-20T17:00:00',
        poster: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        status: 'published',
        createdAt: '2026-03-11T10:00:00',
        updatedAt: '2026-03-11T10:00:00',
      },
    ];
    saveEvents(sampleEvents);
  }

  if (getMedia().length === 0) {
    const sampleMedia: Media[] = [
      {
        id: '1',
        name: 'Campus Building.jpg',
        url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        type: 'image',
        size: 2456789,
        uploadedBy: 'Admin',
        createdAt: '2026-03-10T10:00:00',
      },
      {
        id: '2',
        name: 'Graduation Ceremony.jpg',
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        type: 'image',
        size: 3124567,
        uploadedBy: 'Admin',
        createdAt: '2026-03-11T10:00:00',
      },
    ];
    saveMedia(sampleMedia);
  }

  if (getPrograms().length === 0) {
    const samplePrograms: AcademicProgram[] = [
      {
        id: '1',
        name: 'Teknik Informatika',
        motto: 'Mencetak Profesional IT Berkualitas Global',
        profile: 'Lulusan program studi Teknik Informatika diharapkan mampu menjadi software engineer, data scientist, atau IT consultant yang profesional.',
        faculty: 'Fakultas Teknik',
        degree: 'S1',
        accreditation: 'A',
        status: 'active',
        createdAt: '2026-01-01T10:00:00',
        updatedAt: '2026-03-01T10:00:00',
      },
      {
        id: '2',
        name: 'Sistem Informasi',
        motto: 'Bridging Business and Technology',
        profile: 'Lulusan mampu menganalisis dan merancang sistem informasi untuk kebutuhan bisnis modern.',
        faculty: 'Fakultas Teknik',
        degree: 'S1',
        accreditation: 'B',
        status: 'active',
        createdAt: '2026-01-01T10:00:00',
        updatedAt: '2026-03-01T10:00:00',
      },
    ];
    savePrograms(samplePrograms);
  }
};