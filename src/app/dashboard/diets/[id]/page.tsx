'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DonutChart } from '@/components/ui/SvgChart';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Meal, FoodItem } from '@/types';
import { Apple, ArrowLeft, Plus, Trash2, Save, Clock } from 'lucide-react';

export default function DietBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const dietId = params.id as string;

  const { diets, updateDiet } = useData();
  const { showToast } = useToast();

  const diet = diets.find((d) => d.id === dietId);

  const [title, setTitle] = useState(diet?.title || '');
  const [description, setDescription] = useState(diet?.description || '');
  const [targetCalories, setTargetCalories] = useState(diet?.targetCalories || 2400);
  const [targetProtein, setTargetProtein] = useState(diet?.targetProteinGrams || 180);
  const [targetCarbs, setTargetCarbs] = useState(diet?.targetCarbsGrams || 240);
  const [targetFat, setTargetFat] = useState(diet?.targetFatGrams || 60);
  const [dietaryPref, setDietaryPref] = useState(diet?.dietaryPreference || 'high_protein');
  const [meals, setMeals] = useState<Meal[]>(diet?.meals || []);

  if (!diet) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Diet plan not found.</p>
          <Link href="/dashboard/diets">
            <Button variant="primary" size="sm" className="mt-4">
              Return to Diets
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate actual total macros from meal items
  const actualCalories = meals.reduce(
    (acc, m) => acc + m.items.reduce((mAcc, fi) => mAcc + fi.calories, 0),
    0
  );
  const actualProtein = meals.reduce(
    (acc, m) => acc + m.items.reduce((mAcc, fi) => mAcc + fi.proteinGrams, 0),
    0
  );
  const actualCarbs = meals.reduce(
    (acc, m) => acc + m.items.reduce((mAcc, fi) => mAcc + fi.carbsGrams, 0),
    0
  );
  const actualFat = meals.reduce(
    (acc, m) => acc + m.items.reduce((mAcc, fi) => mAcc + fi.fatGrams, 0),
    0
  );

  const handleSave = () => {
    updateDiet(diet.id, {
      title,
      description,
      targetCalories,
      targetProteinGrams: targetProtein,
      targetCarbsGrams: targetCarbs,
      targetFatGrams: targetFat,
      dietaryPreference: dietaryPref,
      meals,
    });
    showToast('Diet Plan Saved', 'Meal plan structure saved successfully.', 'success');
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: `m_${Date.now()}`,
      name: `Meal ${meals.length + 1}`,
      time: '12:00',
      items: [],
    };
    setMeals([...meals, newMeal]);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals(meals.filter((m) => m.id !== mealId));
  };

  const handleAddFoodItem = (mealId: string) => {
    const newItem: FoodItem = {
      id: `fi_${Date.now()}`,
      name: 'Grilled Chicken Breast',
      portion: '150g',
      calories: 250,
      proteinGrams: 45,
      carbsGrams: 0,
      fatGrams: 5,
    };

    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: [...m.items, newItem],
        };
      })
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/diets">
              <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Diets
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Meal Plan Builder & Macro Editor
              </h1>
              <p className="text-xs text-slate-500">Configure calories, macro ratios, and meal timings.</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Meal Plan
          </Button>
        </div>

        {/* Macro Target vs Actual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Diet Plan Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Select
                label="Dietary Preference"
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value as any)}
              >
                <option value="high_protein">High Protein</option>
                <option value="standard">Standard</option>
                <option value="keto">Keto</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Input
                label="Target Calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value, 10))}
              />
              <Input
                label="Protein (g)"
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(parseInt(e.target.value, 10))}
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(parseInt(e.target.value, 10))}
              />
              <Input
                label="Fat (g)"
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value, 10))}
              />
            </div>
          </Card>

          {/* Macro Breakdown Donut */}
          <Card className="flex flex-col items-center justify-center text-center bg-white">
            <DonutChart
              segments={[
                { label: 'Protein', value: actualProtein * 4, color: '#0f766e' },
                { label: 'Carbs', value: actualCarbs * 4, color: '#0284c7' },
                { label: 'Fat', value: actualFat * 9, color: '#d97706' },
              ]}
              size={130}
              centerText={`${actualCalories}`}
              centerSubtext="Total kcal"
            />
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
              <span className="text-teal-700">{actualProtein}g P</span>
              <span className="text-sky-700">{actualCarbs}g C</span>
              <span className="text-amber-700">{actualFat}g F</span>
            </div>
          </Card>
        </div>

        {/* Meals List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-700" />
              Daily Meals ({meals.length})
            </h3>
            <Button
              variant="outline"
              size="xs"
              onClick={handleAddMeal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Meal
            </Button>
          </div>

          {meals.map((meal, mIdx) => (
            <Card key={meal.id} className="bg-white border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => {
                      const nextMeals = [...meals];
                      nextMeals[mIdx].name = e.target.value;
                      setMeals(nextMeals);
                    }}
                    className="bg-transparent text-sm font-bold text-emerald-800 focus:outline-none focus:border-b border-emerald-700"
                  />
                  {meal.time && (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {meal.time}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleAddFoodItem(meal.id)}
                    leftIcon={<Plus className="w-3 h-3" />}
                  >
                    Add Food Item
                  </Button>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                    title="Remove Meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {meal.items.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No food items in this meal. Click "Add Food Item" above.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {meal.items.map((fi) => (
                    <div
                      key={fi.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{fi.name}</span>
                        <span className="text-slate-500 ml-2 font-mono">({fi.portion})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-slate-900">{fi.calories} kcal</span>
                        <span className="text-emerald-700">{fi.proteinGrams}g P</span>
                        <span className="text-sky-700">{fi.carbsGrams}g C</span>
                        <span className="text-amber-700">{fi.fatGrams}g F</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
