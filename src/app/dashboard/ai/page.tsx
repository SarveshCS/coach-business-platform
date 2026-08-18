'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { simulateAiDietGeneration, simulateAiWorkoutGeneration } from '@/utils/aiSimulator';
import { Diet, Workout } from '@/types';
import {
  Brain,
  Apple,
  Dumbbell,
  Coins,
  Loader2,
  CheckCircle2,
  Save,
  ArrowRight,
} from 'lucide-react';

export default function CoachAiStudioPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const {
    memberships,
    users,
    coachAccounts,
    consumeCredits,
    addDiet,
    addWorkout,
    assignDietToMember,
    assignWorkoutToMember,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgMembers = memberships.filter((m) => m.organizationId === orgId && m.role === 'member');
  const activeCoach = coachAccounts.find((c) => c.userId === currentUser?.id) || coachAccounts[0];

  const [activeTab, setActiveTab] = useState<'diet' | 'workout'>('diet');

  // AI Diet Builder Form
  const [dietMemberId, setDietMemberId] = useState(orgMembers[0]?.id || '');
  const [dietGoal, setDietGoal] = useState<'fat_loss' | 'muscle_gain' | 'maintenance' | 'recomp'>('recomp');
  const [dietPref, setDietPref] = useState<'standard' | 'high_protein' | 'keto' | 'vegan' | 'vegetarian' | 'paleo'>('high_protein');
  const [dietCalories, setDietCalories] = useState(2400);
  const [dietAllergies, setDietAllergies] = useState('');

  // AI Workout Builder Form
  const [workoutMemberId, setWorkoutMemberId] = useState(orgMembers[0]?.id || '');
  const [workoutGoal, setWorkoutGoal] = useState<'hypertrophy' | 'strength' | 'fat_loss' | 'mobility' | 'athletic'>('hypertrophy');
  const [workoutExp, setWorkoutExp] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [workoutDays, setWorkoutDays] = useState(4);
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutEquip, setWorkoutEquip] = useState<'full_gym' | 'dumbbells_only' | 'bodyweight' | 'home_gym'>('full_gym');
  const [workoutLimitations, setWorkoutLimitations] = useState('');

  // Generation Simulation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedDiet, setGeneratedDiet] = useState<Diet | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);

  const handleGenerateDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoach || activeCoach.aiBalance < 50) {
      showToast('Insufficient Credits', 'You need at least 50 AI credits to generate a diet plan.', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedDiet(null);

    const memberUser = users.find((u) => u.id === orgMembers.find((m) => m.id === dietMemberId)?.userId);

    // Staged Simulation
    setGenerationStep('Analyzing client metabolic profile...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Optimizing macronutrient split & energy density...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Structuring nutrient-dense meal items...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Finalizing AI nutrition protocol...');
    await new Promise((r) => setTimeout(r, 400));

    const result = await simulateAiDietGeneration({
      organizationId: orgId,
      memberName: memberUser?.name || 'Client',
      goal: dietGoal,
      dietaryPreference: dietPref,
      targetCalories: dietCalories,
      mealFrequency: 3,
      allergies: dietAllergies,
    });

    consumeCredits(
      `aiw_${activeCoach.id}`,
      50,
      `Generated AI Diet Protocol for ${memberUser?.name || 'Client'}`,
      'ai_diet_builder',
      orgId
    );

    setGeneratedDiet(result);
    setIsGenerating(false);
    showToast('AI Diet Generated', '50 credits deducted from Coach Wallet.', 'success');
  };

  const handleGenerateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoach || activeCoach.aiBalance < 50) {
      showToast('Insufficient Credits', 'You need at least 50 AI credits to generate a workout split.', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedWorkout(null);

    const memberUser = users.find((u) => u.id === orgMembers.find((m) => m.id === workoutMemberId)?.userId);

    // Staged Simulation
    setGenerationStep('Evaluating training volume & recovery capacity...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Selecting primary compound lifts & movement patterns...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Balancing exercise order, sets, reps & rest tempos...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep('Finalizing periodized training program...');
    await new Promise((r) => setTimeout(r, 400));

    const result = await simulateAiWorkoutGeneration({
      organizationId: orgId,
      memberName: memberUser?.name || 'Client',
      fitnessGoal: workoutGoal,
      experienceLevel: workoutExp,
      daysPerWeek: workoutDays,
      sessionDurationMinutes: workoutDuration,
      equipment: workoutEquip,
      limitations: workoutLimitations,
    });

    consumeCredits(
      `aiw_${activeCoach.id}`,
      50,
      `Generated AI Workout Routine for ${memberUser?.name || 'Client'}`,
      'ai_workout_builder',
      orgId
    );

    setGeneratedWorkout(result);
    setIsGenerating(false);
    showToast('AI Workout Generated', '50 credits deducted from Coach Wallet.', 'success');
  };

  const handleSaveDiet = (assignToMember: boolean) => {
    if (!generatedDiet) return;
    const created = addDiet(generatedDiet);

    if (assignToMember && dietMemberId) {
      assignDietToMember(created.id, dietMemberId, orgId);
      showToast('Diet Saved & Assigned', 'Assigned directly to client.', 'success');
    } else {
      showToast('Diet Saved', 'Added to your organization Diet library.', 'success');
    }

    router.push('/dashboard/diets');
  };

  const handleSaveWorkout = (assignToMember: boolean) => {
    if (!generatedWorkout) return;
    const created = addWorkout(generatedWorkout);

    if (assignToMember && workoutMemberId) {
      assignWorkoutToMember(created.id, workoutMemberId, orgId);
      showToast('Workout Saved & Assigned', 'Assigned directly to client.', 'success');
    } else {
      showToast('Workout Saved', 'Added to your organization Workout library.', 'success');
    }

    router.push('/dashboard/workouts');
  };

  const tabItems = [
    { id: 'diet', label: 'AI Diet & Nutrition Builder', icon: <Apple className="w-4 h-4" /> },
    { id: 'workout', label: 'AI Workout Split Builder', icon: <Dumbbell className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Coaching Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate scientifically tailored diet plans and periodized workout splits for clients in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/ai/credits">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Coins className="w-4 h-4 text-amber-600" />}
              >
                Coach Wallet: {activeCoach?.aiBalance || 0} pts
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Selector */}
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {/* AI DIET BUILDER SECTION */}
        {activeTab === 'diet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parameters Form */}
            <Card className="flex flex-col justify-between bg-white shadow-2xs">
              <form onSubmit={handleGenerateDiet} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Apple className="w-4 h-4 text-teal-700" />
                  Client Diet Parameters
                </h3>

                <Select
                  label="Select Client"
                  value={dietMemberId}
                  onChange={(e) => setDietMemberId(e.target.value)}
                >
                  {orgMembers.map((m) => {
                    const u = users.find((usr) => usr.id === m.userId);
                    return (
                      <option key={m.id} value={m.id}>
                        {u?.name || m.id}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  label="Fitness / Nutrition Goal"
                  value={dietGoal}
                  onChange={(e) => setDietGoal(e.target.value as any)}
                >
                  <option value="recomp">Body Recomposition</option>
                  <option value="fat_loss">Aggressive Fat Loss</option>
                  <option value="muscle_gain">Lean Muscle Hypertrophy</option>
                  <option value="maintenance">Metabolic Maintenance</option>
                </Select>

                <Select
                  label="Dietary Preference"
                  value={dietPref}
                  onChange={(e) => setDietPref(e.target.value as any)}
                >
                  <option value="high_protein">High Protein (35% P)</option>
                  <option value="standard">Balanced Standard</option>
                  <option value="keto">Keto (High Fat / Low Carb)</option>
                  <option value="vegan">Plant-Based / Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="paleo">Paleo Clean Eating</option>
                </Select>

                <Input
                  label="Target Calories (kcal)"
                  type="number"
                  required
                  min="1200"
                  max="5000"
                  value={dietCalories}
                  onChange={(e) => setDietCalories(parseInt(e.target.value, 10) || 2000)}
                />

                <Input
                  label="Allergies / Restrictions (Optional)"
                  value={dietAllergies}
                  onChange={(e) => setDietAllergies(e.target.value)}
                  placeholder="e.g. Shellfish, lactose intolerance, peanuts"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isGenerating}
                  className="mt-2 w-full"
                  leftIcon={
                    isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 text-white" />
                    )
                  }
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Diet (50 pts)'}
                </Button>
              </form>
            </Card>

            {/* Generated Output Preview */}
            <Card className="lg:col-span-2 flex flex-col justify-between bg-white shadow-2xs">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center my-auto p-12 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 animate-spin">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">AI Engine Active</h4>
                    <p className="text-xs text-teal-700 mt-1 font-mono">{generationStep}</p>
                  </div>
                </div>
              ) : generatedDiet ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="info" size="xs" className="mb-1">
                        Generated Diet Protocol
                      </Badge>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {generatedDiet.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{generatedDiet.description}</p>
                    </div>
                  </div>

                  {/* Macro Pills */}
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Calories</span>
                      <span className="font-bold text-slate-900">{generatedDiet.targetCalories} kcal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Protein</span>
                      <span className="font-bold text-emerald-700">{generatedDiet.targetProteinGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Carbs</span>
                      <span className="font-bold text-teal-700">{generatedDiet.targetCarbsGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Fats</span>
                      <span className="font-bold text-amber-700">{generatedDiet.targetFatGrams}g</span>
                    </div>
                  </div>

                  {/* Meals List */}
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                    {generatedDiet.meals.map((meal) => (
                      <div key={meal.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-teal-800">{meal.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{meal.time}</span>
                        </div>
                        {meal.items.map((it) => (
                          <div key={it.id} className="text-xs flex items-center justify-between text-slate-700 py-1">
                            <span>{it.name} ({it.portion})</span>
                            <span className="font-mono text-[11px] text-slate-500">{it.calories} kcal • {it.proteinGrams}g P</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleSaveDiet(false)}>
                      Save as Template
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveDiet(true)}>
                      Assign to Client
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto p-12 text-xs text-slate-500">
                  Configure client parameters on the left and click "Generate AI Diet" to construct a customized meal plan.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* AI WORKOUT BUILDER SECTION */}
        {activeTab === 'workout' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parameters Form */}
            <Card className="flex flex-col justify-between bg-white shadow-2xs">
              <form onSubmit={handleGenerateWorkout} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-teal-700" />
                  Client Workout Parameters
                </h3>

                <Select
                  label="Select Client"
                  value={workoutMemberId}
                  onChange={(e) => setWorkoutMemberId(e.target.value)}
                >
                  {orgMembers.map((m) => {
                    const u = users.find((usr) => usr.id === m.userId);
                    return (
                      <option key={m.id} value={m.id}>
                        {u?.name || m.id}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  label="Fitness Objective"
                  value={workoutGoal}
                  onChange={(e) => setWorkoutGoal(e.target.value as any)}
                >
                  <option value="hypertrophy">Hypertrophy (Muscle Growth)</option>
                  <option value="strength">Raw Compound Strength</option>
                  <option value="fat_loss">Metabolic Circuit Shred</option>
                  <option value="mobility">Athletic Joint Mobility</option>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Experience"
                    value={workoutExp}
                    onChange={(e) => setWorkoutExp(e.target.value as any)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>

                  <Input
                    label="Days / Week"
                    type="number"
                    min="2"
                    max="6"
                    value={workoutDays}
                    onChange={(e) => setWorkoutDays(parseInt(e.target.value, 10) || 4)}
                  />
                </div>

                <Select
                  label="Available Equipment"
                  value={workoutEquip}
                  onChange={(e) => setWorkoutEquip(e.target.value as any)}
                >
                  <option value="full_gym">Full Commercial Gym</option>
                  <option value="home_gym">Home Gym (Barbell/Rack)</option>
                  <option value="dumbbells_only">Dumbbells & Bench Only</option>
                  <option value="bodyweight">Calisthenics & Bodyweight</option>
                </Select>

                <Input
                  label="Limitations / Injuries (Optional)"
                  value={workoutLimitations}
                  onChange={(e) => setWorkoutLimitations(e.target.value)}
                  placeholder="e.g. Lower back sensitivity, rotator cuff rehab"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isGenerating}
                  className="mt-2 w-full"
                  leftIcon={
                    isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 text-white" />
                    )
                  }
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Workout (50 pts)'}
                </Button>
              </form>
            </Card>

            {/* Generated Workout Preview */}
            <Card className="lg:col-span-2 flex flex-col justify-between bg-white shadow-2xs">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center my-auto p-12 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 animate-spin">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">AI Engine Active</h4>
                    <p className="text-xs text-teal-700 mt-1 font-mono">{generationStep}</p>
                  </div>
                </div>
              ) : generatedWorkout ? (
                <div className="flex flex-col gap-5">
                  <div>
                    <Badge variant="info" size="xs" className="mb-1">
                      Generated Workout Protocol
                    </Badge>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {generatedWorkout.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{generatedWorkout.description}</p>
                  </div>

                  {/* Days split preview */}
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                    {generatedWorkout.days.map((day) => (
                      <div key={day.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                        <h4 className="text-xs font-bold text-teal-800 mb-2">{day.title}</h4>
                        <div className="flex flex-col gap-1.5">
                          {day.sections.flatMap((s) => s.exercises).map((ex) => (
                            <div key={ex.id} className="text-xs flex items-center justify-between text-slate-700">
                              <span>{ex.name}</span>
                              <span className="font-mono text-slate-500">
                                {ex.sets.length} sets × {ex.sets[0]?.reps || 10} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleSaveWorkout(false)}>
                      Save as Template
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveWorkout(true)}>
                      Assign to Client
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto p-12 text-xs text-slate-500">
                  Configure training parameters on the left and click "Generate AI Workout" to build a periodized split.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
