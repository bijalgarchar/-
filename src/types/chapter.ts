export type ModelId = 
  | 'digestive-system'
  | 'tongue-taste'
  | 'beaumont-stomach'
  | 'glucose-drip'
  | 'chewing-teeth'
  | 'balanced-diet'
  | 'custom-importer';

export interface OrganDetail {
  id: string;
  nameGu: string;
  nameEn: string;
  descGu: string;
  descEn: string;
  position: [number, number, number];
  color: string;
  factsGu: string[];
}

export interface TasteZone {
  id: string;
  tasteGu: string;
  tasteEn: string;
  locationGu: string;
  locationEn: string;
  examplesGu: string[];
  color: string;
  position: [number, number, number];
}

export interface FoodTasteItem {
  id: string;
  nameGu: string;
  nameEn: string;
  primaryTaste: string;
  icon: string;
  bookReference: string;
  descriptionGu: string;
}

export interface BeaumontExperimentFood {
  id: string;
  nameGu: string;
  nameEn: string;
  timeStomachGu: string;
  timeStomachHours: number;
  timeBeakerGu: string;
  timeBeakerHours: number;
  notesGu: string;
}

export interface QuizQuestion {
  id: number;
  questionGu: string;
  optionsGu: string[];
  correctIndex: number;
  explanationGu: string;
  modelTarget?: ModelId;
}
