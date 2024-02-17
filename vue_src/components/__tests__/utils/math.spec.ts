import { describe, it, expect } from 'vitest'

import {clamp} from "../../../utils/math";

describe('clamp', () => {
    it('returns value if between', () => {
        expect(clamp(5, 0, 10)).toBe(5)
    });

    it('returns mine if value below', () => {
        expect(clamp(-5, 0, 10)).toBe(0)
    });

    it('returns max if value above', () => {
        expect(clamp(15, 0, 10)).toBe(10)
    });
});