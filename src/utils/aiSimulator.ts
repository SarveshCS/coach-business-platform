import { Diet, Workout, AiScanResult } from '@/types';

export interface GenerateDietParams {
  organizationId: string;
  memberName: string;
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'recomp';
  dietaryPreference: 'standard' | 'high_protein' | 'keto' | 'vegan' | 'vegetarian' | 'paleo';
  targetCalories: number;
  mealFrequency: number;
  allergies?: string;
  cuisinePreference?: string;
}

export interface GenerateWorkoutParams {
  organizationId: string;
  memberName: string;
  fitnessGoal: 'hypertrophy' | 'strength' | 'fat_loss' | 'mobility' | 'athletic';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  sessionDurationMinutes: number;
  equipment: 'full_gym' | 'dumbbells_only' | 'bodyweight' | 'home_gym';
  limitations?: string;
}

export async function simulateAiDietGeneration(params: GenerateDietParams): Promise<Diet> {
  // Realistic deterministic generation based on params
  const proteinRatio = params.dietaryPreference === 'high_protein' ? 0.35 : 0.25;
  const fatRatio = params.dietaryPreference === 'keto' ? 0.65 : 0.25;
  const carbRatio = 1 - proteinRatio - fatRatio;

  const targetProteinGrams = Math.round((params.targetCalories * proteinRatio) / 4);
  const targetFatGrams = Math.round((params.targetCalories * fatRatio) / 9);
  const targetCarbsGrams = Math.round((params.targetCalories * carbRatio) / 4);

  const goalTitle = {
    fat_loss: 'Rapid Fat Incinerator',
    muscle_gain: 'Hypertrophic Lean Mass',
    maintenance: 'Peak Metabolic Balance',
    endurance: 'Athletic High-Stamina Fuel',
    recomp: 'Body Recomposition & Shred',
  }[params.goal];

  const meals = [
    {
      id: `m_${Date.now()}_1`,
      name: 'Breakfast — Energizing Morning Fuel',
      time: '08:00',
      items: [
        {
          id: `fi_${Date.now()}_1`,
          name: params.dietaryPreference === 'vegan' ? 'Tofu Scramble with Spinach & Avocado' : 'Pasture-Raised Eggs (3) with Sourdough & Avocado',
          portion: '1 plate',
          calories: Math.round(params.targetCalories * 0.28),
          proteinGrams: Math.round(targetProteinGrams * 0.25),
          carbsGrams: Math.round(targetCarbsGrams * 0.25),
          fatGrams: Math.round(targetFatGrams * 0.3),
          notes: 'High choline and healthy fats for morning focus.',
        },
        {
          id: `fi_${Date.now()}_2`,
          name: 'Blueberries & Walnuts with Chia Seeds',
          portion: '60g',
          calories: Math.round(params.targetCalories * 0.08),
          proteinGrams: 3,
          carbsGrams: 16,
          fatGrams: 6,
        },
      ],
    },
    {
      id: `m_${Date.now()}_2`,
      name: 'Lunch — Anabolic Repair & Micronutrient Bowl',
      time: '13:00',
      items: [
        {
          id: `fi_${Date.now()}_3`,
          name:
            params.dietaryPreference === 'vegan'
              ? 'Tempeh & Quinoa Power Bowl with Tahini'
              : 'Flame-Grilled Chicken Breast with Quinoa & Steamed Greens',
          portion: '250g serving',
          calories: Math.round(params.targetCalories * 0.35),
          proteinGrams: Math.round(targetProteinGrams * 0.4),
          carbsGrams: Math.round(targetCarbsGrams * 0.4),
          fatGrams: Math.round(targetFatGrams * 0.3),
          notes: 'Packed with leucine for optimal muscle protein synthesis.',
        },
      ],
    },
    {
      id: `m_${Date.now()}_3`,
      name: 'Dinner — Recovery & Restorative Evening Meal',
      time: '19:30',
      items: [
        {
          id: `fi_${Date.now()}_4`,
          name:
            params.dietaryPreference === 'vegan'
              ? 'Lentil Dahl with Roasted Sweet Potato & Steamed Asparagus'
              : 'Wild-Caught Salmon Fillet with Baked Sweet Potato & Asparagus',
          portion: '220g serving',
          calories: Math.round(params.targetCalories * 0.29),
          proteinGrams: Math.round(targetProteinGrams * 0.35),
          carbsGrams: Math.round(targetCarbsGrams * 0.35),
          fatGrams: Math.round(targetFatGrams * 0.4),
          notes: 'Omega-3 fatty acids and complex slow-release carbohydrates.',
        },
      ],
    },
  ];

  return {
    id: `diet_ai_${Date.now()}`,
    organizationId: params.organizationId,
    title: `AI ${goalTitle} (${params.targetCalories} kcal)`,
    description: `AI-customized nutrition protocol created specifically for ${params.memberName || 'Client'} targeting ${params.targetCalories} kcal with ${params.dietaryPreference.replace('_', ' ')} macro split.`,
    targetCalories: params.targetCalories,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
    dietaryPreference: params.dietaryPreference,
    meals,
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function simulateAiWorkoutGeneration(params: GenerateWorkoutParams): Promise<Workout> {
  const goalTitle = {
    hypertrophy: 'Hypertrophy Periodization',
    strength: 'Maximum Power & Strength Output',
    fat_loss: 'High-Density Metabolic Shred',
    mobility: 'Joint Armor & Athletic Mobility',
    athletic: 'Speed, Power & Functional Conditioning',
  }[params.fitnessGoal];

  const days = [];
  const dayTitles = [
    'Upper Body Primary & Horizontal Press/Row',
    'Lower Body Posterior Chain & Quad Drive',
    'Upper Body Vertical Push/Pull & Arms',
    'Lower Body Unilateral & Core Armor',
    'Full Body Functional Capacity & Metabolic Conditioning',
  ];

  for (let i = 0; i < params.daysPerWeek; i++) {
    days.push({
      id: `wday_${Date.now()}_${i + 1}`,
      dayNumber: i + 1,
      title: `Day ${i + 1} — ${dayTitles[i % dayTitles.length]}`,
      sections: [
        {
          id: `wsec_${Date.now()}_${i}_1`,
          name: 'Dynamic Warmup & Joint Priming',
          exercises: [
            {
              id: `wex_${Date.now()}_${i}_1`,
              name: 'World\'s Greatest Stretch & Thoracic Rotations',
              category: 'mobility' as const,
              targetMuscle: 'Hips, Spine & Ankles',
              sets: [
                { id: `s_${Date.now()}_1`, setNumber: 1, reps: 8, restSeconds: 45 },
                { id: `s_${Date.now()}_2`, setNumber: 2, reps: 8, restSeconds: 45 },
              ],
              notes: 'Breathe deeply through belly; expand ribcage.',
            },
          ],
        },
        {
          id: `wsec_${Date.now()}_${i}_2`,
          name: 'Primary Compound Strength',
          exercises: [
            {
              id: `wex_${Date.now()}_${i}_2`,
              name: i % 2 === 0 ? 'Barbell Incline Bench Press' : 'Barbell Back Squat (Low/High Bar)',
              category: 'strength' as const,
              targetMuscle: i % 2 === 0 ? 'Pectorals & Anterior Delts' : 'Quadriceps & Glutes',
              sets: [
                { id: `s_${Date.now()}_3`, setNumber: 1, reps: 10, weightKg: 50, restSeconds: 90 },
                { id: `s_${Date.now()}_4`, setNumber: 2, reps: 8, weightKg: 60, restSeconds: 90 },
                { id: `s_${Date.now()}_5`, setNumber: 3, reps: 6, weightKg: 70, restSeconds: 120 },
              ],
              notes: 'RPE 7.5 to 8. Focus on eccentric speed control.',
            },
            {
              id: `wex_${Date.now()}_${i}_3`,
              name: i % 2 === 0 ? 'Chest Supported T-Bar Row' : 'Romanian Deadlift (Dumbbell/Barbell)',
              category: 'strength' as const,
              targetMuscle: i % 2 === 0 ? 'Rhomboids & Lats' : 'Hamstrings & Erector Spinae',
              sets: [
                { id: `s_${Date.now()}_6`, setNumber: 1, reps: 10, weightKg: 45, restSeconds: 90 },
                { id: `s_${Date.now()}_7`, setNumber: 2, reps: 10, weightKg: 50, restSeconds: 90 },
                { id: `s_${Date.now()}_8`, setNumber: 3, reps: 8, weightKg: 55, restSeconds: 90 },
              ],
              notes: 'Full hinge at the hips without rounding lower back.',
            },
          ],
        },
        {
          id: `wsec_${Date.now()}_${i}_3`,
          name: 'Hypertrophy Accessory Finishers',
          exercises: [
            {
              id: `wex_${Date.now()}_${i}_4`,
              name: i % 2 === 0 ? 'Dumbbell Lateral Raise Drop-set' : 'Walking Lunges with Kettlebells',
              category: 'strength' as const,
              targetMuscle: i % 2 === 0 ? 'Lateral Deltoid' : 'Glute Medius & Quads',
              sets: [
                { id: `s_${Date.now()}_9`, setNumber: 1, reps: 12, weightKg: 10, restSeconds: 60 },
                { id: `s_${Date.now()}_10`, setNumber: 2, reps: 12, weightKg: 10, restSeconds: 60 },
                { id: `s_${Date.now()}_11`, setNumber: 3, reps: 15, weightKg: 8, restSeconds: 60 },
              ],
            },
          ],
        },
      ],
    });
  }

  return {
    id: `wkt_ai_${Date.now()}`,
    organizationId: params.organizationId,
    title: `AI ${goalTitle} (${params.daysPerWeek}-Day)`,
    description: `AI-customized ${params.daysPerWeek}-day periodized training routine tailored for ${params.memberName || 'Client'} (${params.experienceLevel} level, ${params.sessionDurationMinutes} min sessions, ${params.equipment.replace('_', ' ')}).`,
    difficulty: params.experienceLevel,
    durationWeeks: 8,
    daysPerWeek: params.daysPerWeek,
    category: params.fitnessGoal.toUpperCase(),
    days,
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function simulateAiFoodScan(imageUrl: string, customContext?: string): Promise<AiScanResult> {
  const sampleDishes: Omit<AiScanResult, 'id' | 'imageUrl' | 'createdAt'>[] = [
    {
      dishName: 'Grilled Herb Salmon with Roasted Sweet Potatoes & Asparagus',
      calories: 540,
      proteinGrams: 44,
      carbsGrams: 42,
      fatGrams: 22,
      portionEstimate: 'Approx. 340g (Standard Dinner Plate)',
      confidence: 0.94,
      observations: [
        'High biological value protein source with optimal EPA/DHA omega-3 fatty acids.',
        'Complex low-glycemic carbohydrates from roasted sweet potato.',
        'Prebiotic fiber and micronutrients from fresh grilled asparagus spears.',
      ],
      healthScore: 94,
    },
    {
      dishName: 'Chicken Teriyaki Rice Bowl with Steamed Broccoli',
      calories: 620,
      proteinGrams: 52,
      carbsGrams: 75,
      fatGrams: 14,
      portionEstimate: 'Approx. 400g (Medium Bowl)',
      confidence: 0.91,
      observations: [
        'Lean poultry protein provides rich branched-chain amino acids for recovery.',
        'High carbohydrate profile suited for post-workout glycogen replenishment.',
        'Moderate sodium from glaze; drink plenty of water alongside.',
      ],
      healthScore: 88,
    },
    {
      dishName: 'Mediterranean Greek Salad with Grilled Chicken & Feta',
      calories: 460,
      proteinGrams: 38,
      carbsGrams: 18,
      fatGrams: 26,
      portionEstimate: 'Approx. 320g (Large Salad Bowl)',
      confidence: 0.96,
      observations: [
        'Heart-healthy monounsaturated fats from extra virgin olive oil and kalamata olives.',
        'High volume fibrous greens support gut microbiome and satiety.',
        'Ideal low-carb option for cutting and metabolic conditioning phases.',
      ],
      healthScore: 92,
    },
  ];

  // Pick sample based on context or random
  const pick = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];

  return {
    id: `scan_${Date.now()}`,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    dishName: pick.dishName,
    calories: pick.calories,
    proteinGrams: pick.proteinGrams,
    carbsGrams: pick.carbsGrams,
    fatGrams: pick.fatGrams,
    portionEstimate: pick.portionEstimate,
    confidence: pick.confidence,
    observations: pick.observations,
    healthScore: pick.healthScore,
    createdAt: new Date().toISOString(),
  };
}
