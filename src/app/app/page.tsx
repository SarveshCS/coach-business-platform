'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/ui/SvgChart';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatTime, formatDate } from '@/utils/formatters';
import { VideoPlayerModal } from '@/components/content/VideoPlayerModal';
import { ShortsPlayerModal } from '@/components/content/ShortsPlayerModal';
import { CoachContent } from '@/types';
import { formatDuration } from '@/utils/contentRules';
import {
  Dumbbell,
  Apple,
  Calendar,
  ArrowRight,
  Droplets,
  Video,
  Play,
  Film,
  Camera,
} from 'lucide-react';

export default function ClientHomePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { currentOrganization, currentMembership } = useTenant();
  const {
    workoutAssignments,
    workouts,
    dietAssignments,
    diets,
    classSessions,
    classParticipants,
    communityPosts,
    coachContents,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const memId = currentMembership?.id;

  // Coach Content (Organization-Scoped)
  const publishedCoachContents = coachContents.filter(
    (c) => c.organizationId === orgId && c.status === 'published' && c.visibility === 'members'
  );
  const featuredContent =
    publishedCoachContents.find((c) => c.featured) || publishedCoachContents[0];
  const coachShorts = publishedCoachContents.filter((c) => c.type === 'short');

  // Player Modals State
  const [activeVideo, setActiveVideo] = useState<CoachContent | null>(null);
  const [shortsOpen, setShortsOpen] = useState(false);
  const [activeShortId, setActiveShortId] = useState<string | undefined>(undefined);

  // Water tracking simulation
  const [waterGlasses, setWaterGlasses] = useState(5);

  // Active workout
  const memberWorkoutAssign = workoutAssignments.find(
    (w) => w.memberId === memId && w.status === 'active'
  );
  const activeWorkout = workouts.find((w) => w.id === memberWorkoutAssign?.workoutId);

  // Active diet
  const memberDietAssign = dietAssignments.find(
    (d) => d.memberId === memId && d.status === 'active'
  );
  const activeDiet = diets.find((d) => d.id === memberDietAssign?.dietId);

  // Today's classes
  const todayStr = new Date().toISOString().split('T')[0];
  const myBookings = classParticipants.filter(
    (p) => p.membershipId === memId && p.status === 'booked'
  );
  const myBookedSessionIds = myBookings.map((b) => b.sessionId);
  const todayMySessions = classSessions.filter(
    (s) => s.organizationId === orgId && s.date === todayStr && myBookedSessionIds.includes(s.id)
  );

  // Coach announcement
  const pinnedAnnouncement = communityPosts.find(
    (p) => p.organizationId === orgId && p.isAnnouncement && p.isPinned
  );

  const primaryColor = currentOrganization?.branding.primaryColor || '#0f766e';

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Hey, {currentUser?.name?.split(' ')[0] || 'Athlete'}
            </h1>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-2xs border border-slate-200 text-teal-800 bg-teal-50"
          >
            {currentOrganization?.branding.logo || currentOrganization?.name.charAt(0) || 'C'}
          </div>
        </div>

        {/* Coach Highlight Announcement if exists */}
        {pinnedAnnouncement && (
          <div
            className="p-4 rounded-xl border text-left relative overflow-hidden transition-all shadow-2xs bg-teal-50/70 border-teal-200"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="org" size="xs">
                Coach Announcement
              </Badge>
              <span className="text-[10px] text-slate-500 font-mono">
                {formatDate(pinnedAnnouncement.createdAt)}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-3">
              {pinnedAnnouncement.content}
            </p>
          </div>
        )}

        {/* ================= FROM YOUR COACH SECTION ================= */}
        {publishedCoachContents.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-teal-700" />
                  From Your Coach
                </span>
                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2 py-0.5 rounded-full">
                  {publishedCoachContents.length} New
                </span>
              </div>
              <Link
                href="/app/coach"
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 transition-colors"
              >
                <span>View Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Featured Hero Card */}
            {featuredContent && (
              <Card className="p-0 overflow-hidden border-slate-200 bg-white group shadow-2xs">
                <div
                  className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden"
                  onClick={() => {
                    if (featuredContent.type === 'short') {
                      setActiveShortId(featuredContent.id);
                      setShortsOpen(true);
                    } else {
                      setActiveVideo(featuredContent);
                    }
                  }}
                >
                  {featuredContent.thumbnailUrl ? (
                    <img
                      src={featuredContent.thumbnailUrl}
                      alt={featuredContent.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-teal-700/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-slate-900/80 border border-amber-500/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      FEATURED BY COACH
                    </span>
                    {featuredContent.durationSeconds ? (
                      <span className="text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {formatDuration(featuredContent.durationSeconds)}
                      </span>
                    ) : null}
                  </div>

                  {/* Title at Bottom */}
                  <div className="absolute bottom-3 inset-x-3">
                    <Badge variant="info" size="xs" className="mb-1">
                      {featuredContent.category.toUpperCase()}
                    </Badge>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                      {featuredContent.title}
                    </h3>
                  </div>
                </div>
              </Card>
            )}

            {/* Vertical Shorts Carousel */}
            {coachShorts.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-teal-700" />
                    Quick Coaching Shorts
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {coachShorts.map((short) => (
                    <button
                      key={short.id}
                      onClick={() => {
                        setActiveShortId(short.id);
                        setShortsOpen(true);
                      }}
                      className="relative w-28 h-44 rounded-xl bg-slate-900 overflow-hidden shrink-0 text-left border border-slate-200 hover:border-teal-700 transition-all group shadow-2xs cursor-pointer"
                    >
                      {short.thumbnailUrl && (
                        <img
                          src={short.thumbnailUrl}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <div className="absolute top-2 left-2">
                        <span className="w-5 h-5 rounded-full bg-teal-700/90 text-white flex items-center justify-center text-[10px]">
                          <Play className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      </div>

                      <div className="absolute bottom-2 inset-x-2">
                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                          {short.title}
                        </p>
                        <span className="text-[9px] text-teal-300 font-mono mt-0.5 block">
                          {formatDuration(short.durationSeconds)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Today's Workout Card */}
        <Card className="flex flex-col justify-between bg-white shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-teal-700" />
                Today's Training
              </span>
              <Badge variant="active" size="xs">
                Active Protocol
              </Badge>
            </div>

            {activeWorkout ? (
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {activeWorkout.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {activeWorkout.days[0]?.title || 'Day 1 — Focus Routine'}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-teal-700">{memberWorkoutAssign?.progressPercentage || 45}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-teal-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${memberWorkoutAssign?.progressPercentage || 45}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No workout assigned yet. Check with your coach.</p>
            )}
          </div>

          <Link href="/app/plan?tab=workout" className="mt-4">
            <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Training Routine
            </Button>
          </Link>
        </Card>

        {/* Today's Nutrition & Macro Ring */}
        <Card className="flex flex-col justify-between bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-emerald-700" />
              Daily Nutrition Target
            </span>
            <Link href="/app/ai" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Scan Food
            </Link>
          </div>

          {activeDiet ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {activeDiet.targetCalories}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">kcal target</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-700">{activeDiet.targetProteinGrams}g Protein</span>
                  <span className="text-teal-700">{activeDiet.targetCarbsGrams}g Carbs</span>
                  <span className="text-amber-700">{activeDiet.targetFatGrams}g Fat</span>
                </div>
              </div>

              <DonutChart
                segments={[
                  { label: 'Protein', value: activeDiet.targetProteinGrams * 4, color: '#0f766e' },
                  { label: 'Carbs', value: activeDiet.targetCarbsGrams * 4, color: '#0284c7' },
                  { label: 'Fat', value: activeDiet.targetFatGrams * 9, color: '#d97706' },
                ]}
                size={85}
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500">No meal plan assigned yet.</p>
          )}

          <Link href="/app/plan?tab=diet" className="mt-4">
            <Button variant="outline" size="sm" className="w-full">
              View Full Meal Plan
            </Button>
          </Link>
        </Card>

        {/* Today's Booked Class Sessions */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-700" />
              Today's Schedule
            </span>
            <Link href="/app/schedule" className="text-xs font-semibold text-teal-700">
              Browse Classes →
            </Link>
          </div>

          {todayMySessions.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No classes booked for today.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayMySessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{sess.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {formatTime(sess.startTime)} – {formatTime(sess.endTime)} • Coach {sess.coachName}
                    </p>
                  </div>

                  {sess.isOnline && sess.meetingLink ? (
                    <a
                      href={sess.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Live
                    </a>
                  ) : (
                    <Badge variant="info" size="xs">
                      In-Studio
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Daily Hydration Counter */}
        <Card className="flex items-center justify-between p-4 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Daily Water Intake</h4>
              <p className="text-[11px] text-slate-500">{waterGlasses} of 8 glasses logged (2.0L)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
            >
              -
            </Button>
            <span className="text-xs font-bold font-mono px-1 text-teal-700">{waterGlasses}</span>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setWaterGlasses(waterGlasses + 1);
                showToast('Water Logged', '+1 glass (250ml) added!', 'info');
              }}
            >
              +
            </Button>
          </div>
        </Card>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        content={activeVideo}
        currentUserId={currentUser?.id}
      />

      {/* Shorts Player Modal */}
      <ShortsPlayerModal
        isOpen={shortsOpen}
        onClose={() => setShortsOpen(false)}
        shorts={coachShorts}
        initialShortId={activeShortId}
        currentUserId={currentUser?.id}
      />
    </ClientAppLayout>
  );
}
