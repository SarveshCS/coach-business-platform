'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Exercise, WorkoutDay } from '@/types';
import {
  Dumbbell,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Layers,
} from 'lucide-react';

export default function WorkoutBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const { workouts, updateWorkout } = useData();
  const { showToast } = useToast();

  const workout = workouts.find((w) => w.id === workoutId);

  // Local state for editing
  const [title, setTitle] = useState(workout?.title || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [category, setCategory] = useState(workout?.category || 'Hypertrophy');
  const [difficulty, setDifficulty] = useState(workout?.difficulty || 'intermediate');
  const [days, setDays] = useState<WorkoutDay[]>(workout?.days || []);

  if (!workout) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Workout template not found.</p>
          <Link href="/dashboard/workouts">
            <Button variant="primary" size="sm" className="mt-4">
              Return to Workouts
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    updateWorkout(workout.id, {
      title,
      description,
      category,
      difficulty,
      days,
    });
    showToast('Workout Saved', 'Workout plan structure saved successfully.', 'success');
  };

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: `wday_${Date.now()}`,
      dayNumber: days.length + 1,
      title: `Day ${days.length + 1} — Focus Session`,
      sections: [
        {
          id: `wsec_${Date.now()}`,
          name: 'Main Lifts',
          exercises: [],
        },
      ],
    };
    setDays([...days, newDay]);
  };

  const handleDeleteDay = (dayId: string) => {
    setDays(days.filter((d) => d.id !== dayId));
  };

  const handleAddExercise = (dayId: string, sectionId: string) => {
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      name: 'Incline Dumbbell Press',
      category: 'strength',
      targetMuscle: 'Upper Chest',
      sets: [
        { id: `s_${Date.now()}_1`, setNumber: 1, reps: 10, weightKg: 24, restSeconds: 60 },
        { id: `s_${Date.now()}_2`, setNumber: 2, reps: 8, weightKg: 28, restSeconds: 90 },
      ],
    };

    setDays(
      days.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          sections: day.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              exercises: [...sec.exercises, newEx],
            };
          }),
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
            <Link href="/dashboard/workouts">
              <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Workouts
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Workout Builder & Split Editor
              </h1>
              <p className="text-xs text-slate-500">Configure days, exercises, sets, reps, and tempos.</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Workout Plan
          </Button>
        </div>

        {/* Core Metadata Card */}
        <Card className="bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Workout Plan Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Strength">Strength</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Mobility">Mobility</option>
              </Select>
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
          <Textarea
            label="Plan Overview & Guidance"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Card>

        {/* Days & Exercises List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              Training Days ({days.length})
            </h3>
            <Button
              variant="outline"
              size="xs"
              onClick={handleAddDay}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Training Day
            </Button>
          </div>

          {days.map((day, dIdx) => (
            <Card key={day.id} className="relative bg-white border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => {
                    const nextDays = [...days];
                    nextDays[dIdx].title = e.target.value;
                    setDays(nextDays);
                  }}
                  className="bg-transparent text-sm font-bold text-teal-800 focus:outline-none focus:border-b border-teal-700 w-full max-w-md"
                />
                <button
                  onClick={() => handleDeleteDay(day.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                  title="Remove Day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {day.sections.map((sec) => (
                <div key={sec.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {sec.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleAddExercise(day.id, sec.id)}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add Exercise
                    </Button>
                  </div>

                  {sec.exercises.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No exercises in this section. Click "Add Exercise" above.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sec.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-md bg-white border border-slate-200 text-teal-700">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{ex.name}</span>
                              <span className="text-[11px] text-slate-500">
                                Target: {ex.targetMuscle} • {ex.sets.length} Sets
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-slate-700 text-xs">
                            <span>
                              {ex.sets.map((s) => `${s.reps}r @ ${s.weightKg || 0}kg`).join(' | ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
