// Health & Fitness Calculators with real mathematical formulas

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
}

/**
 * Calculates BMI = weight (kg) / (height (m) ^ 2)
 */
export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: 'Normal weight', color: 'text-emerald-500' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) return { bmi, category: 'Underweight', color: 'text-amber-500' };
  if (bmi < 25) return { bmi, category: 'Normal weight', color: 'text-emerald-500' };
  if (bmi < 30) return { bmi, category: 'Overweight', color: 'text-orange-500' };
  return { bmi, category: 'Obese', color: 'text-rose-500' };
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation:
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBmr(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: 'male' | 'female' | 'other' = 'male'
): number {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const result = gender === 'female' ? base - 161 : base + 5;
  return Math.round(result);
}

/**
 * Calculates Ideal Body Weight (IBW) using Devine Formula:
 * Men: 50.0 kg + 2.3 kg per inch over 5 feet (60 inches)
 * Women: 45.5 kg + 2.3 kg per inch over 5 feet (60 inches)
 */
export function calculateIbw(heightCm: number, gender: 'male' | 'female' | 'other' = 'male'): number {
  if (heightCm <= 0) return 0;
  const totalInches = heightCm / 2.54;
  const inchesOver5Feet = Math.max(0, totalInches - 60);

  const baseKg = gender === 'female' ? 45.5 : 50.0;
  const ibw = baseKg + 2.3 * inchesOver5Feet;
  return Number(ibw.toFixed(1));
}

/**
 * Calculates Daily Total Energy Expenditure (TDEE) based on activity level
 */
export function calculateTdee(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}
