'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LineChart } from '@/components/ui/SvgChart';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { calculateBmi, calculateBmr, calculateIbw } from '@/utils/calculators';
import {
  User,
  Dumbbell,
  Apple,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Coins,
  Send,
  Plus,
  ArrowLeft,
} from 'lucide-react';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const membershipId = params.id as string;

  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const {
    users,
    memberships,
    workouts,
    workoutAssignments,
    diets,
    dietAssignments,
    coachingSubscriptions,
    coachingPlans,
    payments,
    messages,
    aiTransactions,
    measurements,
    coachAccounts,
    assignWorkoutToMember,
    assignDietToMember,
    allocateCreditsToMember,
    sendMessage,
    addMeasurement,
    updateMemberCommunityStatus,
  } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // Find membership & user
  const membership = memberships.find((m) => m.id === membershipId);
  const user = users.find((u) => u.id === membership?.userId);

  // Active workout assignment
  const memberWorkoutAssign = workoutAssignments.find(
    (w) => w.memberId === membershipId && w.status === 'active'
  );
  const activeWorkout = workouts.find((w) => w.id === memberWorkoutAssign?.workoutId);

  // Active diet assignment
  const memberDietAssign = dietAssignments.find(
    (d) => d.memberId === membershipId && d.status === 'active'
  );
  const activeDiet = diets.find((d) => d.id === memberDietAssign?.dietId);

  // Subscription
  const memberSub = coachingSubscriptions.find((s) => s.memberId === membershipId);
  const activePlan = coachingPlans.find((p) => p.id === memberSub?.planId);

  // Payments
  const memberPayments = payments.filter((p) => p.memberId === membershipId);

  // Measurements
  const memberMeasurements = measurements.filter((m) => m.membershipId === membershipId);
  const latestMeasurement = memberMeasurements[memberMeasurements.length - 1];

  // Messages thread
  const chatMessages = messages.filter(
    (m) =>
      m.organizationId === currentOrganization?.id &&
      ((m.senderUserId === user?.id && m.receiverUserId === currentUser?.id) ||
        (m.senderUserId === currentUser?.id && m.receiverUserId === user?.id))
  );

  // AI Transactions
  const memberAiTx = aiTransactions.filter((t) => t.walletId === `aiw_${membershipId}`);

  // Modals state
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workouts[0]?.id || '');

  const [isAssignDietOpen, setIsAssignDietOpen] = useState(false);
  const [selectedDietId, setSelectedDietId] = useState(diets[0]?.id || '');

  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocateAmount, setAllocateAmount] = useState('500');

  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [measWeight, setMeasWeight] = useState('80');
  const [measBodyFat, setMeasBodyFat] = useState('16.5');
  const [measChest, setMeasChest] = useState('104');
  const [measWaist, setMeasWaist] = useState('85');
  const [measNotes, setMeasNotes] = useState('');

  const [chatInput, setChatInput] = useState('');

  // Coach account
  const activeCoach = coachAccounts.find((c) => c.userId === currentUser?.id) || coachAccounts[0];

  if (!membership || !user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Member not found or membership was removed.</p>
          <Link href="/dashboard/members">
            <Button variant="primary" size="sm" className="mt-4">
              Return to Members
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Weight trend chart
  const weightTrendData = memberMeasurements.map((m) => ({
    label: m.date.slice(5),
    value: m.weightKg,
  }));

  // Health calculations
  const bmi = calculateBmi(latestMeasurement?.weightKg || 78, 178);
  const bmr = calculateBmr(latestMeasurement?.weightKg || 78, 178, 28, user.gender || 'male');
  const ibw = calculateIbw(178, user.gender || 'male');

  const handleAssignWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkoutId) return;

    assignWorkoutToMember(selectedWorkoutId, membershipId, currentOrganization?.id || 'org_1');
    showToast('Workout Protocol Assigned', `Workout routine assigned to ${user.name}.`, 'success');
    setIsAssignWorkoutOpen(false);
  };

  const handleAssignDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDietId) return;

    assignDietToMember(selectedDietId, membershipId, currentOrganization?.id || 'org_1');
    showToast('Diet Plan Assigned', `Nutrition protocol assigned to ${user.name}.`, 'success');
    setIsAssignDietOpen(false);
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(allocateAmount, 10);
    if (!pts || pts <= 0) return;

    const res = allocateCreditsToMember(
      currentUser?.id || 'usr_coach_1',
      membershipId,
      pts,
      currentOrganization?.id || 'org_1'
    );

    if (res.success) {
      showToast('Credits Allocated', `${pts} AI credits transferred to ${user.name}.`, 'success');
      setIsAllocateOpen(false);
    } else {
      showToast('Allocation Failed', res.message, 'error');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;

    sendMessage({
      organizationId: currentOrganization?.id || 'org_1',
      senderUserId: currentUser.id,
      receiverUserId: user.id,
      senderName: currentUser.name,
      content: chatInput.trim(),
    });

    setChatInput('');
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addMeasurement({
      membershipId,
      date: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(measWeight),
      bodyFatPercentage: measBodyFat ? parseFloat(measBodyFat) : undefined,
      chestCm: measChest ? parseFloat(measChest) : undefined,
      waistCm: measWaist ? parseFloat(measWaist) : undefined,
      notes: measNotes,
    });
    showToast('Measurement Logged', 'New body check-in added to client profile.', 'success');
    setIsAddMeasurementOpen(false);
  };

  const handleToggleCommunityStatus = () => {
    const nextStatus = membership.communityStatus === 'active' ? 'banned' : 'active';
    updateMemberCommunityStatus(membership.id, nextStatus);
    showToast(
      `Community Status Updated`,
      `${user.name} is now ${nextStatus === 'banned' ? 'restricted from community posts' : 'active in community'}.`,
      nextStatus === 'banned' ? 'warning' : 'success'
    );
  };

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'workouts', label: 'Workouts', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'diet', label: 'Diet & Macros', icon: <Apple className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress & Logs', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Credits', icon: <Coins className="w-4 h-4" /> },
    { id: 'messages', label: 'Direct Chat', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Top Back & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/members">
              <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Members
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-200 overflow-hidden flex items-center justify-center font-bold text-base text-teal-800 shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <Badge variant={membership.status === 'active' ? 'active' : 'default'} size="xs">
                    {membership.status}
                  </Badge>
                  <Badge
                    variant={membership.communityStatus === 'active' ? 'active' : 'danger'}
                    size="xs"
                  >
                    Community {membership.communityStatus}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user.email} • {user.phone || 'No phone'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Coins className="w-4 h-4 text-amber-600" />}
              onClick={() => setIsAllocateOpen(true)}
            >
              Allocate AI Credits ({membership.aiCreditBalance || 0} pts)
            </Button>
            <Button
              variant={membership.communityStatus === 'active' ? 'outline' : 'danger'}
              size="sm"
              onClick={handleToggleCommunityStatus}
            >
              {membership.communityStatus === 'active' ? 'Restrict Community' : 'Unban Community'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile & Goals Card */}
              <Card className="flex flex-col justify-between bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
                    Client Goals & Info
                  </h3>

                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Goals</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {membership.goals && membership.goals.length > 0 ? (
                          membership.goals.map((g, i) => (
                            <Badge key={i} variant="info" size="xs">
                              {g}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500">No specific goals set</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Coach Notes
                      </span>
                      <p className="text-slate-700 mt-1 leading-relaxed">
                        {membership.notes || 'No coach notes logged.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                  Enrolled since {formatDate(membership.joinedAt)}
                </div>
              </Card>

              {/* Active Workout Preview */}
              <Card className="flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-teal-700" />
                      Assigned Workout
                    </h3>
                    {activeWorkout && <Badge variant="active" size="xs">Active</Badge>}
                  </div>

                  {activeWorkout ? (
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{activeWorkout.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {activeWorkout.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{activeWorkout.daysPerWeek} days / week</span>
                        <span className="font-semibold text-teal-700">
                          {memberWorkoutAssign?.progressPercentage || 0}% completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-teal-700 h-full rounded-full"
                          style={{ width: `${memberWorkoutAssign?.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No workout protocol currently assigned.</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setIsAssignWorkoutOpen(true)}
                >
                  {activeWorkout ? 'Change Assigned Workout' : 'Assign Workout'}
                </Button>
              </Card>

              {/* Active Diet Preview */}
              <Card className="flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Apple className="w-4 h-4 text-emerald-700" />
                      Assigned Diet Plan
                    </h3>
                    {activeDiet && <Badge variant="active" size="xs">Active</Badge>}
                  </div>

                  {activeDiet ? (
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{activeDiet.title}</h4>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Calories</span>
                          <span className="font-bold text-slate-900">{activeDiet.targetCalories}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Protein</span>
                          <span className="font-bold text-emerald-700">{activeDiet.targetProteinGrams}g</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Carbs</span>
                          <span className="font-bold text-teal-700">{activeDiet.targetCarbsGrams}g</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No meal plan currently assigned.</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setIsAssignDietOpen(true)}
                >
                  {activeDiet ? 'Change Assigned Diet' : 'Assign Meal Plan'}
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: WORKOUTS */}
        {activeTab === 'workouts' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Client Workout Protocol</h3>
                <p className="text-xs text-slate-500">Assigned routines and execution progress</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssignWorkoutOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Assign New Workout
              </Button>
            </div>

            {activeWorkout ? (
              <Card className="bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{activeWorkout.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{activeWorkout.description}</p>
                  </div>
                  <Badge variant="info" size="xs">
                    {activeWorkout.difficulty}
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100 mt-4">
                  {activeWorkout.days.map((day) => (
                    <div key={day.id} className="py-3.5">
                      <h5 className="text-xs sm:text-sm font-bold text-teal-700 mb-2">{day.title}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {day.sections.map((sec) => (
                          <div key={sec.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-xs font-bold text-slate-800 block mb-2">{sec.name}</span>
                            <div className="flex flex-col gap-1.5">
                              {sec.exercises.map((ex) => (
                                <div key={ex.id} className="text-xs flex items-center justify-between text-slate-500">
                                  <span className="text-slate-800 font-medium">{ex.name}</span>
                                  <span>{ex.sets.length} sets × {ex.sets[0]?.reps || 10} reps</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-xs text-slate-500 bg-white">
                No active workout assigned. Click "Assign New Workout" above.
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: DIET */}
        {activeTab === 'diet' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assigned Nutrition Plan</h3>
                <p className="text-xs text-slate-500">Daily calorie targets and structured meal guide</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssignDietOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Assign Meal Plan
              </Button>
            </div>

            {activeDiet ? (
              <div className="flex flex-col gap-6">
                {/* Macro Target Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <StatCard title="Daily Calorie Target" value={`${activeDiet.targetCalories} kcal`} />
                  <StatCard title="Target Protein" value={`${activeDiet.targetProteinGrams}g`} />
                  <StatCard title="Target Carbs" value={`${activeDiet.targetCarbsGrams}g`} />
                  <StatCard title="Target Fat" value={`${activeDiet.targetFatGrams}g`} />
                </div>

                {/* Meals Breakdown */}
                <div className="flex flex-col gap-4">
                  {activeDiet.meals.map((meal) => (
                    <Card key={meal.id} className="bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{meal.name}</h4>
                        {meal.time && <Badge variant="default" size="xs">{meal.time}</Badge>}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {meal.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-slate-800">{item.name}</span>
                              <span className="text-slate-500 ml-2">({item.portion})</span>
                            </div>
                            <span className="text-slate-600 font-mono">{item.calories} kcal • {item.proteinGrams}g P</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center text-xs text-slate-500 bg-white">
                No active meal plan assigned. Click "Assign Meal Plan" above.
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: PROGRESS & MEASUREMENTS */}
        {activeTab === 'progress' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Body Metrics & Check-in History</h3>
                <p className="text-xs text-slate-500">Track weight trends, body fat, and circumferences</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddMeasurementOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Log Check-in
              </Button>
            </div>

            {/* Calculators & Bio Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Body Mass Index (BMI)"
                value={bmi.bmi}
                subtitle={`${bmi.category} (178 cm)`}
              />
              <StatCard
                title="Basal Metabolic Rate (BMR)"
                value={`${bmr} kcal`}
                subtitle="Mifflin-St Jeor formula"
              />
              <StatCard
                title="Ideal Body Weight (IBW)"
                value={`${ibw} kg`}
                subtitle="Devine Clinical formula"
              />
            </div>

            {/* Weight Chart */}
            <Card className="bg-white">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">Weight History Trend (kg)</h4>
              <LineChart data={weightTrendData} color="#0f766e" height={150} valueSuffix=" kg" />
            </Card>

            {/* Check-ins Table */}
            <Card className="p-0 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Body Fat</th>
                      <th className="py-3 px-4">Chest / Waist</th>
                      <th className="py-3 px-4">Coach Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberMeasurements.map((m) => (
                      <tr key={m.id}>
                        <td className="py-3 px-4 font-mono text-slate-600">{formatDate(m.date)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{m.weightKg} kg</td>
                        <td className="py-3 px-4 text-emerald-700">{m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{m.chestCm || '—'}cm / {m.waistCm || '—'}cm</td>
                        <td className="py-3 px-4 text-slate-500">{m.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-6">
            <Card className="bg-white">
              <h3 className="text-base font-bold text-slate-900 mb-4">Coaching Subscription Status</h3>
              {memberSub ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Active Coaching Plan</span>
                    <p className="text-base font-bold text-slate-900 mt-1">{activePlan?.name}</p>
                    <p className="text-xs text-teal-700 mt-0.5">{formatCurrency(memberSub.price)} / month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Renewal Date</span>
                    <p className="text-base font-bold text-slate-900 mt-1">{formatDate(memberSub.renewalDate)}</p>
                    <Badge variant={memberSub.status === 'expiring_soon' ? 'warning' : 'active'} size="xs" className="mt-1">
                      {memberSub.status}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Auto-Renewal</span>
                    <p className="text-base font-bold text-emerald-700 mt-1">Enabled (Stripe Mock)</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active coaching subscription record.</p>
              )}
            </Card>

            {/* Payment History */}
            <Card className="p-0 overflow-hidden bg-white">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900">Payment & Billing History</h4>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{p.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-700">{p.description}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4"><Badge variant="active" size="xs">{p.status}</Badge></td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 6: AI CREDITS */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                title="Member AI Credit Balance"
                value={`${membership.aiCreditBalance || 0} pts`}
                icon={<Coins className="w-5 h-5 text-amber-600" />}
                subtitle="Used by client for AI Food Scanner"
              />
              <Card className="flex items-center justify-between bg-white">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Allocate More Credits</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Transfer from your coach balance</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsAllocateOpen(true)}>
                  Allocate Credits
                </Button>
              </Card>
            </div>

            {/* AI Transaction Logs */}
            <Card className="p-0 overflow-hidden bg-white">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900">Client AI Credit Activity</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {memberAiTx.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No credit actions logged yet.</div>
                ) : (
                  memberAiTx.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{tx.description}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(tx.createdAt)}</span>
                      </div>
                      <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 7: DIRECT CHAT */}
        {activeTab === 'messages' && (
          <Card className="flex flex-col h-[500px] p-0 overflow-hidden bg-white shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xs text-teal-800">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active Direct Thread
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 my-auto">
                  No messages yet. Send a direct message to check in with {user.name}.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderUserId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-teal-700 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <Input
                placeholder={`Message ${user.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" size="md" type="submit">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        )}

        {/* Modal: Assign Workout */}
        <Modal
          isOpen={isAssignWorkoutOpen}
          onClose={() => setIsAssignWorkoutOpen(false)}
          title="Assign Workout Protocol"
          description={`Select a workout template to assign to ${user.name}.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAssignWorkout} className="flex flex-col gap-4">
            <Select
              label="Select Workout Plan"
              value={selectedWorkoutId}
              onChange={(e) => setSelectedWorkoutId(e.target.value)}
            >
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title} ({w.daysPerWeek} days/wk)
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAssignWorkoutOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Assign Workout
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Assign Diet */}
        <Modal
          isOpen={isAssignDietOpen}
          onClose={() => setIsAssignDietOpen(false)}
          title="Assign Nutrition Protocol"
          description={`Select a meal plan template to assign to ${user.name}.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAssignDiet} className="flex flex-col gap-4">
            <Select
              label="Select Diet Plan"
              value={selectedDietId}
              onChange={(e) => setSelectedDietId(e.target.value)}
            >
              {diets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.targetCalories} kcal)
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAssignDietOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Assign Diet
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Allocate Credits */}
        <Modal
          isOpen={isAllocateOpen}
          onClose={() => setIsAllocateOpen(false)}
          title="Allocate AI Credits"
          description={`Allocate AI credits from your coach balance (${activeCoach?.aiBalance} pts) to ${user.name}.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAllocate} className="flex flex-col gap-4">
            <Input
              label="Credit Amount"
              type="number"
              required
              min="50"
              step="50"
              value={allocateAmount}
              onChange={(e) => setAllocateAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAllocateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Allocate Credits
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Check-in Measurement */}
        <Modal
          isOpen={isAddMeasurementOpen}
          onClose={() => setIsAddMeasurementOpen(false)}
          title="Log Client Progress Check-in"
          description={`Record body weight, body fat %, and circumferences for ${user.name}.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAddMeasurement} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                required
                value={measWeight}
                onChange={(e) => setMeasWeight(e.target.value)}
              />
              <Input
                label="Body Fat (%)"
                type="number"
                step="0.1"
                value={measBodyFat}
                onChange={(e) => setMeasBodyFat(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Chest (cm)"
                type="number"
                step="0.5"
                value={measChest}
                onChange={(e) => setMeasChest(e.target.value)}
              />
              <Input
                label="Waist (cm)"
                type="number"
                step="0.5"
                value={measWaist}
                onChange={(e) => setMeasWaist(e.target.value)}
              />
            </div>
            <Input
              label="Check-in Notes"
              value={measNotes}
              onChange={(e) => setMeasNotes(e.target.value)}
              placeholder="e.g. Waist down 1.5cm, energy high"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddMeasurementOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Check-in
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
