import { describe, it, expect } from 'vitest';
import { EngineErrorCode } from '$lib/engine/common/enum';
import { bonoCaracteristicaPrimaria, type CaracteristicaPrimaria } from '$lib/engine/character/primary_characteristics';

describe('bonoCaracteristicaPrimaria', () => {

  // Factory to create clean test objects
  const createAttr = (base: number, temp: number): CaracteristicaPrimaria => ({
    base: 1,
    __final_base: base,
    __final_temporal: temp,
    _bono_base: 0,
    _delta_bono_temporal: 0,
  } as CaracteristicaPrimaria);

  describe('Success Cases', () => {
    it('should calculate bonuses correctly for a standard value (e.g., 10)', () => {
      const attr = createAttr(10, 10);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(warns).toBeNull();
      expect(error).toBeNull();
      expect(result?._bono_base).toBe(15);
      expect(result?._delta_bono_temporal).toBe(0); // 15 (temp) - 15 (base)
    });

    it('should calculate temporal bonus when it differs from base (base 5, temp 10)', () => {
      const attr = createAttr(5, 10);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(warns).toBeNull();
      expect(error).toBeNull();
      // Value 5 -> bonus 0
      // Value 10 -> bonus 15
      expect(result?._bono_base).toBe(0);
      expect(result?._delta_bono_temporal).toBe(15); // 15 - 0
    });

    it('should calculate negative temporal bonus if temporal value is lower than base', () => {
      const attr = createAttr(10, 5);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(warns).toBeNull();
      expect(error).toBeNull();
      // Value 10 -> bonus 15
      // Value 5 -> bonus 0
      expect(result?._bono_base).toBe(15);
      expect(result?._delta_bono_temporal).toBe(-15); // 0 - 15
    });

    it('should handle lower boundary correctly (value 1)', () => {
      const attr = createAttr(1, 1);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);
      expect(warns).toBeNull();
      expect(error).toBeNull();
      expect(result?._bono_base).toBe(-30);
      expect(result?._delta_bono_temporal).toBe(0); // -30 - -30
    });

    it('should handle upper boundary correctly (value 20)', () => {
      const attr = createAttr(20, 20);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);
      expect(warns).toBeNull();
      expect(error).toBeNull();
      expect(result?._bono_base).toBe(45);
      expect(result?._delta_bono_temporal).toBe(0);  // 45 - 45
    });

    it('should truncate decimal values using bitwise OR operator', () => {
      // 10.9 becomes 10, 5.1 becomes 5
      const attr = createAttr(10.9, 5.1);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(warns).toBeNull();
      expect(error).toBeNull();
      expect(result?._bono_base).toBe(15); // Index 10
      expect(result?._delta_bono_temporal).toBe(-15); // Index 5 (0) - Index 10 (15)
    });
  });

  describe('Error Handling', () => {
    it('should return UNDEFINED_ATTRIBUTE error if attr is null', () => {
      const [result, warns, error] = bonoCaracteristicaPrimaria(null as any);
      expect(result).toBeNull();
      expect(warns).toBeNull();
      expect(error?.code).toBe(EngineErrorCode.UNDEFINED_ATTRIBUTE);
    });

    it('should return INVALID_BOUNDS if __final_base is out of range (> 20)', () => {
      const attr = createAttr(21, 10);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(result).toBeNull();
      expect(warns).toBeNull();
      expect(error?.code).toBe(EngineErrorCode.INVALID_BOUNDS);
      expect(error?.message).toContain('__final_base');
    });

    it('should return INVALID_BOUNDS if __final_base is out of range (<= 0)', () => {
      const attr = createAttr(0, 10);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(result).toBeNull();
      expect(warns).toBeNull();
      expect(error?.code).toBe(EngineErrorCode.INVALID_BOUNDS);
    });

    it('should return INVALID_BOUNDS if __final_temporal is out of range', () => {
      const attr = createAttr(10, 25);
      const [result, warns, error] = bonoCaracteristicaPrimaria(attr);

      expect(result).toBeNull();
      expect(warns).toBeNull();
      expect(error?.code).toBe(EngineErrorCode.INVALID_BOUNDS);
      expect(error?.message).toContain('__final_temporal');
    });
  });
});