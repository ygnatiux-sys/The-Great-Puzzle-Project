
export enum TravelStyle {
  RELAX = 'Relax & Chill',
  ADVENTURE = 'Aventura Extrema',
  CULTURAL = 'Historia y Cultura',
  PARTY = 'Vida Nocturna',
  GASTRONOMIC = 'Ruta Foodie',
  BIZARRE = 'Lo Bizarro & Oculto',
  RELIGIOUS = 'Fe & Espiritualidad',
  NEW_AGE = 'New Age & Energía',
  NATURE = 'Biomas & Parques',
  NATIVE = 'Encuentro Nativo'
}

export enum TransportMode {
  FLIGHT = 'Vuelo',
  BUS = 'Autobús',
  CAR = 'Coche',
  BOAT = 'Barco'
}

export interface ItineraryStep {
  title: string;
  description: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Itinerary {
  title: string;
  steps: ItineraryStep[];
  summary: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingLinks?: { uri: string; title: string }[];
}

export interface AudioState {
  isPlaying: boolean;
  currentText: string | null;
}
