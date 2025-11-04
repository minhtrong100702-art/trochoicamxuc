
export type Emotion = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'stressed';

export type Screen = 'home' | 'emotion-data' | 'challenges' | 'zen-room' | 'events';

export type ModuleType = 'smart-break' | 'zen-room' | 'emotion-map' | 'mission-5' | 'happy-week' | 'statistics';

export type AppDataActivityType = 'smart-break' | 'zen-room' | 'emotion' | 'emotion_record' | 'mission' | 'happy-week' | 'student_login';

export interface AppDataItem {
    id: number;
    timestamp: string;
    userName: string;
    type: AppDataActivityType;
    content?: string;
    emotion?: Emotion;
}