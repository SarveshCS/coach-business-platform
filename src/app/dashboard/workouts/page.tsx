'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Workout } from '@/types';
import {
  Dumbbell,
  Search,
  Plus,
  Copy,
  Trash2,
  Brain,
} from 'lucide-react';

export default function CoachWorkoutsPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { workouts, memberships, addWorkout, deleteWorkout, assignWorkoutToMember } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgWorkouts = workouts.filter((w) => w.organizationId === orgId);
  const orgMembers = memberships.filter((m) => m.organizationId === orgId && m.role === 'member');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Hypertrophy');
  const [newDifficulty, setNewDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newDays, setNewDays] = useState(4);

  const [assignModalWorkout, setAssignModalWorkout] = useState<Workout | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(orgMembers[0]?.id || '');

  const filteredWorkouts = useMemo(() => {
    return orgWorkouts.filter((w) => {
      const matchesSearch =
        w.title.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || w.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [orgWorkouts, search, categoryFilter]);

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created = addWorkout({
      organizationId: orgId,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      durationWeeks: 8,
      daysPerWeek: newDays,
      isTemplate: true,
      days: [
        {
          id: `day_${Date.now()}_1`,
          dayNumber: 1,
          title: 'Day 1 — Primary Compounds',
          sections: [
            {
              id: `sec_${Date.now()}_1`,
              name: 'Main Lifts',
              exercises: [
                {
                  id: `ex_${Date.now()}_1`,
                  name: 'Barbell Bench Press',
                  category: 'strength',
                  targetMuscle: 'Chest',
                  sets: [
                    { id: 's1', setNumber: 1, reps: 10, weightKg: 60, restSeconds: 90 },
                    { id: 's2', setNumber: 2, reps: 8, weightKg: 70, restSeconds: 90 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    showToast('Workout Created', `${newTitle} template saved.`, 'success');
    setIsCreateModalOpen(false);
    router.push(`/dashboard/workouts/${created.id}`);
  };

  const handleDuplicate = (w: Workout) => {
    addWorkout({
      ...w,
      title: `${w.title} (Copy)`,
    });
    showToast('Workout Duplicated', `Created copy of ${w.title}`, 'info');
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalWorkout || !selectedMemberId) return;

    assignWorkoutToMember(assignModalWorkout.id, selectedMemberId, orgId);
    showToast('Workout Assigned', `Assigned ${assignModalWorkout.title} to client.`, 'success');
    setAssignModalWorkout(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workout Library & Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create periodized workout splits, manage exercise templates, and assign protocols to trainees.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/ai">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Brain className="w-4 h-4 text-teal-700" />}
              >
                AI Generator
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Workout
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Search workouts by name or description..."
                leftIcon={<Search className="w-4 h-4 text-teal-700" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Strength">Strength</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Mobility">Mobility</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Workout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 transition-all group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <Badge variant="info" size="xs">
                    {workout.difficulty}
                  </Badge>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                  {workout.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {workout.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Schedule</span>
                    <span className="font-bold text-slate-900">{workout.daysPerWeek} days / week</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Category</span>
                    <span className="font-semibold text-teal-700">{workout.category}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(workout)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Duplicate Template"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteWorkout(workout.id);
                      showToast('Workout Deleted', 'Removed from library', 'info');
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setAssignModalWorkout(workout)}
                  >
                    Assign
                  </Button>
                  <Link href={`/dashboard/workouts/${workout.id}`}>
                    <Button variant="primary" size="xs">
                      Edit Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal: Create Workout */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Workout Split"
          description="Define the foundation and structure for your training program."
          maxWidth="md"
        >
          <form onSubmit={handleCreateWorkout} className="flex flex-col gap-4">
            <Input
              label="Workout Title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Upper / Lower Power & Hypertrophy"
            />
            <Input
              label="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Focus areas, tempo instructions, target level..."
            />

            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Strength">Strength</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Mobility">Mobility</option>
              </Select>

              <Select
                label="Difficulty"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>

              <Input
                label="Days / Week"
                type="number"
                min="1"
                max="7"
                value={newDays}
                onChange={(e) => setNewDays(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create & Open Builder
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Assign Workout */}
        <Modal
          isOpen={!!assignModalWorkout}
          onClose={() => setAssignModalWorkout(null)}
          title={`Assign "${assignModalWorkout?.title}"`}
          description="Select an enrolled client to assign this workout protocol."
          maxWidth="sm"
        >
          <form onSubmit={handleAssign} className="flex flex-col gap-4">
            <Select
              label="Select Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {orgMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  Member ID: {m.id}
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setAssignModalWorkout(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Assign to Client
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
