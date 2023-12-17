/*
 * BSD 3-Clause License
 * Copyright (c) 2023, Ollie Killean
 * 
 * If a copy of the BSD 3-Clause License was not distributed with this file, you
 * may obtain one at: https://github.com/knokbak/ekvg-twi/blob/master/LICENSE.
 */

export type TWIEntry = {
    degrees: number;
    light?: [number, number | null];
    medium?: [number, number | null];
    heavy?: [number, number | null];
    severe?: [number, number | null];
};

export type TWIResult = 'none' | 'light' | 'medium' | 'heavy' | 'severe';
