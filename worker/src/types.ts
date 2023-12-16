export type TWIEntry = {
    degrees: number;
    light?: [number, number | null];
    medium?: [number, number | null];
    heavy?: [number, number | null];
    severe?: [number, number | null];
};

export type TWIResult = 'none' | 'light' | 'medium' | 'heavy' | 'severe';
