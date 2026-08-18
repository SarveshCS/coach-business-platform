'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/ui/SvgChart';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import {
  Dumbbell,
  Apple,
  Check,
  Camera,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function ClientPlanPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'diet' ? 'diet' : 'workout';

  const { currentMembership, currentOrganization } = useTenant();
  const { workoutAssignments, workouts, dietAssignments, diets } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'diet' || tab === 'workout') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const memId = currentMembership?.id;

  // Active workout assignment
  const workoutAssignment = workoutAssignments.find(
    (w) => w.memberId === memId && w.status === 'active'
  );
  const workout = workouts.find((w) => w.id === workoutAssignment?.workoutId);

  // Active diet assignment
  const dietAssignment = dietAssignments.find(
    (d) => d.memberId === memId && d.status === 'active'
  );
  const diet = diets.find((d) => d.id === dietAssignment?.dietId);

  // Workout state
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
  });

  // Diet state
  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({
    meal_1: true,
  });

  const activeDay = workout?.days[selectedDayIdx];

  const handleToggleSet = (setId: string, exName: string, setNum: number) => {
    const nextState = !completedSets[setId];
    setCompletedSets((prev) => ({ ...prev, [setId]: nextState }));
    if (nextState) {
      showToast('Set Logged', `${exName} — Set ${setNum} completed. Take 60s rest!`, 'success');
    }
  };

  const handleToggleMeal = (mealId: string, mealName: string) => {
    const next = !checkedMeals[mealId];
    setCheckedMeals((prev) => ({ ...prev, [mealId]: next }));
    if (next) {
      showToast('Meal Logged', `Checked off ${mealName}!`, 'success');
    }
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-4 pb-8">
        {/* Top Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              {currentOrganization?.name || 'Personal Coaching'}
            </span>
            <Badge variant="active" size="xs">
              Active Program
            </Badge>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            My Coaching Plan
          </h1>
          <p className="text-xs text-slate-500">
            Personalized training routines and daily nutrition protocol prescribed by your coach.
          </p>
        </div>

        {/* Unified Plan Switcher with Live Protocol Summary */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 border border-slate-300/70 gap-1.5 shadow-2xs">
          {/* Segment 1: Workouts Split */}
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'workout'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'workout'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-300/60 text-slate-600'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">Workouts</span>
                {workout && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                    {workout.days.length}d/wk
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {workout ? workout.title : 'Awaiting coach routine'}
              </p>
            </div>
          </button>

          {/* Segment 2: Nutrition & Diet */}
          <button
            type="button"
            onClick={() => setActiveTab('diet')}
            className={`p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'diet'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'diet'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-300/60 text-slate-600'
              }`}
            >
              <Apple className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">Nutrition</span>
                {diet && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                    {diet.targetCalories} kcal
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {diet ? `${diet.meals.length} meals • ${diet.targetProteinGrams}g pro` : 'Awaiting nutrition targets'}
              </p>
            </div>
          </button>
        </div>

        {/* ----------------- TAB 1: WORKOUT PROTOCOL ----------------- */}
        {activeTab === 'workout' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {workout ? (
              <>
                {/* Workout Card & Day Selector */}
                <Card className="p-4 bg-white border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="info" size="xs" className="mb-1">
                        {workout.difficulty} • {workout.category}
                      </Badge>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">{workout.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{workout.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Day Selector Pill Tabs */}
                  <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                    {workout.days.map((day, idx) => (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedDayIdx === idx
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Day {day.dayNumber}: {day.title}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Selected Day Exercises */}
                {activeDay ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{activeDay.title}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {activeDay.sections.flatMap((s) => s.exercises).length} Exercises
                      </span>
                    </div>

                    {activeDay.sections.map((sec) => (
                      <div key={sec.id} className="flex flex-col gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {sec.name}
                        </span>

                        {sec.exercises.map((ex) => (
                          <Card key={ex.id} className="p-4 bg-white border-slate-200 shadow-2xs">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                                <span className="text-[11px] text-slate-500">
                                  Target: {ex.targetMuscle}
                                </span>
                              </div>
                              <Badge variant="info" size="xs">
                                {ex.sets.length} Sets
                              </Badge>
                            </div>

                            {ex.notes && (
                              <p className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-lg mb-3 border border-teal-200 leading-relaxed">
                                <span className="font-semibold">Coach Note:</span> {ex.notes}
                              </p>
                            )}

                            {/* Interactive Sets Checklist */}
                            <div className="flex flex-col gap-2">
                              {ex.sets.map((set) => {
                                const isDone = !!completedSets[set.id];
                                return (
                                  <div
                                    key={set.id}
                                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                                      isDone
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold font-mono">Set {set.setNumber}</span>

                                    <div className="flex items-center gap-3 font-mono">
                                      <span>{set.reps} reps</span>
                                      {set.weightKg && <span>@ {set.weightKg} kg</span>}
                                    </div>

                                    <button
                                      onClick={() => handleToggleSet(set.id, ex.name, set.setNumber)}
                                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                        isDone
                                          ? 'bg-emerald-700 text-white'
                                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                      }`}
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ))}

                    <Button
                      variant="primary"
                      size="lg"
                      className="mt-2 w-full cursor-pointer"
                      onClick={() => {
                        showToast('Workout Completed', 'Great job! Workout marked as complete for today.', 'success');
                      }}
                    >
                      Finish Today&apos;s Workout
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <Card className="p-8 text-center bg-white flex flex-col items-center justify-center gap-3 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Workout Routine Assigned</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Your coach has not assigned an active workout split to your profile yet.
                </p>
                <Link href="/app/messages">
                  <Button variant="secondary" size="sm" className="mt-2">
                    Message Coach
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: NUTRITION & DIET ----------------- */}
        {activeTab === 'diet' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {diet ? (
              <>
                {/* Macro Summary Header Card */}
                <Card className="p-4 flex items-center justify-between gap-4 bg-white shadow-2xs">
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">
                        {diet.targetCalories}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">kcal / day</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        P: <strong className="font-mono">{diet.targetProteinGrams}g</strong>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
                        C: <strong className="font-mono">{diet.targetCarbsGrams}g</strong>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        F: <strong className="font-mono">{diet.targetFatGrams}g</strong>
                      </span>
                    </div>
                  </div>

                  <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                    <DonutChart
                      segments={[
                        { label: 'Protein', value: diet.targetProteinGrams * 4, color: '#10b981' },
                        { label: 'Carbs', value: diet.targetCarbsGrams * 4, color: '#0f766e' },
                        { label: 'Fat', value: diet.targetFatGrams * 9, color: '#d97706' },
                      ]}
                      size={80}
                    />
                  </div>
                </Card>

                {/* 1-Tap AI Scanner Banner */}
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-900">AI Food Scanner Ready</h4>
                      <p className="text-[10px] text-teal-700">Take a photo of any meal for instant calorie & macro estimation</p>
                    </div>
                  </div>
                  <Link href="/app/ai">
                    <Button variant="primary" size="xs" className="shrink-0 cursor-pointer">
                      Scan Meal
                    </Button>
                  </Link>
                </div>

                {/* Daily Meal Schedule Checklist */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Today&apos;s Meal Schedule</h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {diet.meals.length} Prescribed Meals
                    </span>
                  </div>

                  {diet.meals.map((meal) => {
                    const isDone = !!checkedMeals[meal.id];
                    const mealCalories = meal.items.reduce((sum, it) => sum + (it.calories || 0), 0);
                    const mealProtein = meal.items.reduce((sum, it) => sum + (it.proteinGrams || 0), 0);

                    return (
                      <Card
                        key={meal.id}
                        className={`p-4 transition-all bg-white shadow-2xs border ${
                          isDone ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{meal.name}</h4>
                              {meal.time && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {meal.time}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono font-semibold">
                              {mealCalories > 0 ? `${mealCalories} kcal` : `${diet.targetCalories / diet.meals.length} kcal`} • {mealProtein > 0 ? `${mealProtein}g Protein` : 'Balanced'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleMeal(meal.id, meal.name)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Food Items Breakdown */}
                        <div className="divide-y divide-slate-100 text-xs mt-3 pt-2 border-t border-slate-100">
                          {meal.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-1.5 flex items-center justify-between text-slate-600"
                            >
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                                <span>{item.portion}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-700">{item.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center bg-white flex flex-col items-center justify-center gap-3 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Apple className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Diet Protocol Assigned</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Your coach has not assigned a personalized nutrition protocol yet.
                </p>
                <Link href="/app/messages">
                  <Button variant="secondary" size="sm" className="mt-2">
                    Message Coach
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>
    </ClientAppLayout>
  );
}
