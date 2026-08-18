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
import { Diet } from '@/types';
import { Apple, Search, Plus, Trash2, Brain } from 'lucide-react';

export default function CoachDietsPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { diets, memberships, addDiet, deleteDiet, assignDietToMember } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgDiets = diets.filter((d) => d.organizationId === orgId);
  const orgMembers = memberships.filter((m) => m.organizationId === orgId && m.role === 'member');

  const [search, setSearch] = useState('');
  const [prefFilter, setPrefFilter] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCalories, setTargetCalories] = useState(2400);
  const [targetProtein, setTargetProtein] = useState(180);
  const [targetCarbs, setTargetCarbs] = useState(240);
  const [targetFat, setTargetFat] = useState(60);
  const [dietaryPref, setDietaryPref] = useState<'standard' | 'high_protein' | 'keto' | 'vegan' | 'vegetarian' | 'paleo'>('high_protein');

  const [assignDietModal, setAssignDietModal] = useState<Diet | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(orgMembers[0]?.id || '');

  const filteredDiets = useMemo(() => {
    return orgDiets.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase());
      const matchesPref = prefFilter === 'all' || d.dietaryPreference === prefFilter;
      return matchesSearch && matchesPref;
    });
  }, [orgDiets, search, prefFilter]);

  const handleCreateDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const created = addDiet({
      organizationId: orgId,
      title,
      description,
      targetCalories,
      targetProteinGrams: targetProtein,
      targetCarbsGrams: targetCarbs,
      targetFatGrams: targetFat,
      dietaryPreference: dietaryPref,
      isTemplate: true,
      meals: [
        {
          id: `m_${Date.now()}_1`,
          name: 'Breakfast (Power Oats & Eggs)',
          time: '08:00',
          items: [
            { id: 'f1', name: 'Rolled Oats with Almond Milk', portion: '80g', calories: 340, proteinGrams: 12, carbsGrams: 58, fatGrams: 6 },
            { id: 'f2', name: 'Whole Eggs (3)', portion: '3 large', calories: 215, proteinGrams: 18, carbsGrams: 1, fatGrams: 15 },
          ],
        },
      ],
    });

    showToast('Diet Plan Created', `${title} template saved.`, 'success');
    setIsCreateOpen(false);
    router.push(`/dashboard/diets/${created.id}`);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDietModal || !selectedMemberId) return;

    assignDietToMember(assignDietModal.id, selectedMemberId, orgId);
    showToast('Diet Assigned', `Assigned ${assignDietModal.title} to client.`, 'success');
    setAssignDietModal(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nutrition & Diet Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Build custom calorie & macronutrient meal protocols, templates, and assigned meal plans.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/ai">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Brain className="w-4 h-4 text-teal-700" />}
              >
                AI Diet Builder
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Meal Plan
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Search meal plans by title or ingredients..."
                leftIcon={<Search className="w-4 h-4 text-teal-700" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={prefFilter}
                onChange={(e) => setPrefFilter(e.target.value)}
              >
                <option value="all">All Preferences</option>
                <option value="high_protein">High Protein</option>
                <option value="standard">Standard</option>
                <option value="keto">Keto</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Diets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDiets.map((diet) => (
            <Card
              key={diet.id}
              className="flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 transition-all group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 shrink-0">
                    <Apple className="w-5 h-5" />
                  </div>
                  <Badge variant="active" size="xs">
                    {diet.dietaryPreference.replace('_', ' ')}
                  </Badge>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                  {diet.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {diet.description}
                </p>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Calories</span>
                    <span className="font-bold text-slate-900">{diet.targetCalories}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Protein</span>
                    <span className="font-bold text-emerald-700">{diet.targetProteinGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Carbs</span>
                    <span className="font-bold text-teal-700">{diet.targetCarbsGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Fats</span>
                    <span className="font-bold text-amber-700">{diet.targetFatGrams}g</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      deleteDiet(diet.id);
                      showToast('Diet Deleted', 'Removed from library', 'info');
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
                    onClick={() => setAssignDietModal(diet)}
                  >
                    Assign
                  </Button>
                  <Link href={`/dashboard/diets/${diet.id}`}>
                    <Button variant="primary" size="xs">
                      Edit Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Nutrition Protocol"
          description="Configure target calories, macros, and dietary preference."
          maxWidth="md"
        >
          <form onSubmit={handleCreateDiet} className="flex flex-col gap-4">
            <Input
              label="Plan Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lean Recomp 2,500 kcal"
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meal timing strategy, hydration notes..."
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Calories (kcal)"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value, 10))}
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
                <option value="paleo">Paleo</option>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                label="Fats (g)"
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create & Open Planner
              </Button>
            </div>
          </form>
        </Modal>

        {/* Assign Modal */}
        <Modal
          isOpen={!!assignDietModal}
          onClose={() => setAssignDietModal(null)}
          title={`Assign "${assignDietModal?.title}"`}
          description="Select an enrolled client to assign this meal plan."
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
              <Button variant="ghost" size="sm" type="button" onClick={() => setAssignDietModal(null)}>
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
