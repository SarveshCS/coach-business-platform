'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  CoachAccount,
  Organization,
  Membership,
  PlatformSubscriptionPlan,
  PlatformSubscription,
  Workout,
  WorkoutAssignment,
  Diet,
  DietAssignment,
  ClassType,
  ClassSession,
  ClassParticipant,
  Service,
  CoachingSubscriptionPlan,
  CoachingSubscription,
  Payment,
  CommunityPost,
  Message,
  AiWallet,
  AiTransaction,
  BodyMeasurement,
  AppNotification,
  ActivityLog,
  CommunityStatus,
  MembershipRole,
  CoachContent,
  OrganizationStorage,
} from '@/types';
import * as mock from '@/data/initialMockData';
import { calculateStorageUsage, canShareToCommunity } from '@/utils/contentRules';

interface DataContextType {
  users: User[];
  coachAccounts: CoachAccount[];
  organizations: Organization[];
  memberships: Membership[];
  platformPlans: PlatformSubscriptionPlan[];
  platformSubscriptions: PlatformSubscription[];
  workouts: Workout[];
  workoutAssignments: WorkoutAssignment[];
  diets: Diet[];
  dietAssignments: DietAssignment[];
  classTypes: ClassType[];
  classSessions: ClassSession[];
  classParticipants: ClassParticipant[];
  services: Service[];
  coachingPlans: CoachingSubscriptionPlan[];
  coachingSubscriptions: CoachingSubscription[];
  payments: Payment[];
  communityPosts: CommunityPost[];
  messages: Message[];
  aiWallets: AiWallet[];
  aiTransactions: AiTransaction[];
  measurements: BodyMeasurement[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  coachContents: CoachContent[];

  // Coach Content operations
  addCoachContent: (
    content: Omit<
      CoachContent,
      'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'likesCount' | 'likedByUserIds' | 'bookmarksCount' | 'bookmarkedByUserIds'
    >
  ) => CoachContent;
  updateCoachContent: (id: string, updates: Partial<CoachContent>) => void;
  deleteCoachContent: (id: string) => void;
  toggleFeatureContent: (id: string) => void;
  toggleLikeCoachContent: (id: string, userId: string) => void;
  toggleBookmarkCoachContent: (id: string, userId: string) => void;
  shareContentToCommunity: (
    id: string,
    customMessage?: string
  ) => { success: boolean; communityPostId?: string; message: string };
  getOrganizationStorage: (organizationId: string) => OrganizationStorage;

  // User & Member operations
  createUserAndMembership: (data: {
    name: string;
    email: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    organizationId: string;
    role?: MembershipRole;
    goals?: string[];
    notes?: string;
    currentCoachingPlanId?: string;
  }) => { user: User; membership: Membership; isNewUser: boolean };
  addMembership: (data: Omit<Membership, 'id' | 'joinedAt'>) => Membership;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateMembership: (membershipId: string, updates: Partial<Membership>) => void;
  removeMembership: (membershipId: string) => void;
  updateMemberCommunityStatus: (membershipId: string, status: CommunityStatus) => void;

  // Coach & Organization operations
  updateCoachAccount: (id: string, updates: Partial<CoachAccount>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  updateOrganizationBranding: (
    id: string,
    branding: Partial<Organization['branding']>
  ) => void;

  // Workout operations
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Workout;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  assignWorkoutToMember: (workoutId: string, memberId: string, organizationId: string, notes?: string) => WorkoutAssignment;

  // Diet operations
  addDiet: (diet: Omit<Diet, 'id' | 'createdAt' | 'updatedAt'>) => Diet;
  updateDiet: (id: string, updates: Partial<Diet>) => void;
  deleteDiet: (id: string) => void;
  assignDietToMember: (dietId: string, memberId: string, organizationId: string) => DietAssignment;

  // Class & Scheduling operations
  addClassType: (classType: Omit<ClassType, 'id'>) => ClassType;
  addClassSession: (session: Omit<ClassSession, 'id' | 'bookedCount' | 'createdAt'>) => ClassSession;
  updateClassSession: (id: string, updates: Partial<ClassSession>) => void;
  cancelClassSession: (id: string, reason: string) => void;
  bookClassSession: (sessionId: string, membershipId: string, userId: string) => { success: boolean; message: string };
  cancelClassBooking: (sessionId: string, membershipId: string) => void;
  markAttendance: (participantId: string, status: 'present' | 'absent' | 'late') => void;

  // Services & Coaching Plans
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  addCoachingPlan: (plan: Omit<CoachingSubscriptionPlan, 'id'>) => CoachingSubscriptionPlan;
  updateCoachingPlan: (id: string, updates: Partial<CoachingSubscriptionPlan>) => void;
  assignCoachingSubscription: (data: Omit<CoachingSubscription, 'id'>) => CoachingSubscription;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;

  // Community
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likesCount' | 'likedByUserIds' | 'comments'>) => CommunityPost;
  deleteCommunityPost: (id: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
  addCommunityComment: (postId: string, comment: Omit<CommunityPost['comments'][0], 'id' | 'createdAt'>) => void;
  deleteCommunityComment: (postId: string, commentId: string) => void;
  togglePinPost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;

  // Messaging
  sendMessage: (data: Omit<Message, 'id' | 'createdAt' | 'isRead'>) => Message;
  markMessagesAsRead: (organizationId: string, currentUserId: string, otherUserId: string) => void;

  // AI Wallet & Credits
  purchaseCoachCredits: (coachAccountId: string, amount: number, costUsd: number) => void;
  allocateCreditsToMember: (
    coachAccountId: string,
    membershipId: string,
    amount: number,
    organizationId: string
  ) => { success: boolean; message: string };
  consumeCredits: (
    walletId: string,
    amount: number,
    description: string,
    featureUsed: 'ai_diet_builder' | 'ai_workout_builder' | 'ai_food_scanner',
    organizationId?: string
  ) => boolean;

  // Progress
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => BodyMeasurement;
  deleteMeasurement: (id: string) => void;

  // Notifications
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // Platform Subscriptions
  updatePlatformSubscription: (id: string, updates: Partial<PlatformSubscription>) => void;

  // Reset
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'coach_platform_mock_data_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mock.INITIAL_USERS);
  const [coachAccounts, setCoachAccounts] = useState<CoachAccount[]>(mock.INITIAL_COACH_ACCOUNTS);
  const [organizations, setOrganizations] = useState<Organization[]>(mock.INITIAL_ORGANIZATIONS);
  const [memberships, setMemberships] = useState<Membership[]>(mock.INITIAL_MEMBERSHIPS);
  const [platformPlans, setPlatformPlans] = useState<PlatformSubscriptionPlan[]>(mock.INITIAL_PLATFORM_PLANS);
  const [platformSubscriptions, setPlatformSubscriptions] = useState<PlatformSubscription[]>(mock.INITIAL_PLATFORM_SUBSCRIPTIONS);
  const [workouts, setWorkouts] = useState<Workout[]>(mock.INITIAL_WORKOUTS);
  const [workoutAssignments, setWorkoutAssignments] = useState<WorkoutAssignment[]>(mock.INITIAL_WORKOUT_ASSIGNMENTS);
  const [diets, setDiets] = useState<Diet[]>(mock.INITIAL_DIETS);
  const [dietAssignments, setDietAssignments] = useState<DietAssignment[]>(mock.INITIAL_DIET_ASSIGNMENTS);
  const [classTypes, setClassTypes] = useState<ClassType[]>(mock.INITIAL_CLASS_TYPES);
  const [classSessions, setClassSessions] = useState<ClassSession[]>(mock.INITIAL_CLASS_SESSIONS);
  const [classParticipants, setClassParticipants] = useState<ClassParticipant[]>(mock.INITIAL_CLASS_PARTICIPANTS);
  const [services, setServices] = useState<Service[]>(mock.INITIAL_SERVICES);
  const [coachingPlans, setCoachingPlans] = useState<CoachingSubscriptionPlan[]>(mock.INITIAL_COACHING_PLANS);
  const [coachingSubscriptions, setCoachingSubscriptions] = useState<CoachingSubscription[]>(mock.INITIAL_COACHING_SUBSCRIPTIONS);
  const [payments, setPayments] = useState<Payment[]>(mock.INITIAL_PAYMENTS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(mock.INITIAL_COMMUNITY_POSTS);
  const [messages, setMessages] = useState<Message[]>(mock.INITIAL_MESSAGES);
  const [aiWallets, setAiWallets] = useState<AiWallet[]>(mock.INITIAL_AI_WALLETS);
  const [aiTransactions, setAiTransactions] = useState<AiTransaction[]>(mock.INITIAL_AI_TRANSACTIONS);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(mock.INITIAL_MEASUREMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(mock.INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mock.INITIAL_ACTIVITY_LOGS);
  const [coachContents, setCoachContents] = useState<CoachContent[]>(mock.INITIAL_COACH_CONTENTS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.coachAccounts) setCoachAccounts(parsed.coachAccounts);
        if (parsed.organizations) setOrganizations(parsed.organizations);
        if (parsed.memberships) setMemberships(parsed.memberships);
        if (parsed.platformPlans) setPlatformPlans(parsed.platformPlans);
        if (parsed.platformSubscriptions) setPlatformSubscriptions(parsed.platformSubscriptions);
        if (parsed.workouts) setWorkouts(parsed.workouts);
        if (parsed.workoutAssignments) setWorkoutAssignments(parsed.workoutAssignments);
        if (parsed.diets) setDiets(parsed.diets);
        if (parsed.dietAssignments) setDietAssignments(parsed.dietAssignments);
        if (parsed.classTypes) setClassTypes(parsed.classTypes);
        if (parsed.classSessions) setClassSessions(parsed.classSessions);
        if (parsed.classParticipants) setClassParticipants(parsed.classParticipants);
        if (parsed.services) setServices(parsed.services);
        if (parsed.coachingPlans) setCoachingPlans(parsed.coachingPlans);
        if (parsed.coachingSubscriptions) setCoachingSubscriptions(parsed.coachingSubscriptions);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.communityPosts) setCommunityPosts(parsed.communityPosts);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.aiWallets) setAiWallets(parsed.aiWallets);
        if (parsed.aiTransactions) setAiTransactions(parsed.aiTransactions);
        if (parsed.measurements) setMeasurements(parsed.measurements);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.coachContents) setCoachContents(parsed.coachContents);
      }
    } catch (e) {
      console.warn('Could not load data from localStorage', e);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      const payload = {
        users,
        coachAccounts,
        organizations,
        memberships,
        platformPlans,
        platformSubscriptions,
        workouts,
        workoutAssignments,
        diets,
        dietAssignments,
        classTypes,
        classSessions,
        classParticipants,
        services,
        coachingPlans,
        coachingSubscriptions,
        payments,
        communityPosts,
        messages,
        aiWallets,
        aiTransactions,
        measurements,
        notifications,
        activityLogs,
        coachContents,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save data to localStorage', e);
    }
  }, [
    users,
    coachAccounts,
    organizations,
    memberships,
    platformPlans,
    platformSubscriptions,
    workouts,
    workoutAssignments,
    diets,
    dietAssignments,
    classTypes,
    classSessions,
    classParticipants,
    services,
    coachingPlans,
    coachingSubscriptions,
    payments,
    communityPosts,
    messages,
    aiWallets,
    aiTransactions,
    measurements,
    notifications,
    activityLogs,
    coachContents,
  ]);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(mock.INITIAL_USERS);
    setCoachAccounts(mock.INITIAL_COACH_ACCOUNTS);
    setOrganizations(mock.INITIAL_ORGANIZATIONS);
    setMemberships(mock.INITIAL_MEMBERSHIPS);
    setPlatformPlans(mock.INITIAL_PLATFORM_PLANS);
    setPlatformSubscriptions(mock.INITIAL_PLATFORM_SUBSCRIPTIONS);
    setWorkouts(mock.INITIAL_WORKOUTS);
    setWorkoutAssignments(mock.INITIAL_WORKOUT_ASSIGNMENTS);
    setDiets(mock.INITIAL_DIETS);
    setDietAssignments(mock.INITIAL_DIET_ASSIGNMENTS);
    setClassTypes(mock.INITIAL_CLASS_TYPES);
    setClassSessions(mock.INITIAL_CLASS_SESSIONS);
    setClassParticipants(mock.INITIAL_CLASS_PARTICIPANTS);
    setServices(mock.INITIAL_SERVICES);
    setCoachingPlans(mock.INITIAL_COACHING_PLANS);
    setCoachingSubscriptions(mock.INITIAL_COACHING_SUBSCRIPTIONS);
    setPayments(mock.INITIAL_PAYMENTS);
    setCommunityPosts(mock.INITIAL_COMMUNITY_POSTS);
    setMessages(mock.INITIAL_MESSAGES);
    setAiWallets(mock.INITIAL_AI_WALLETS);
    setAiTransactions(mock.INITIAL_AI_TRANSACTIONS);
    setMeasurements(mock.INITIAL_MEASUREMENTS);
    setNotifications(mock.INITIAL_NOTIFICATIONS);
    setActivityLogs(mock.INITIAL_ACTIVITY_LOGS);
    setCoachContents(mock.INITIAL_COACH_CONTENTS);
  }, []);

  // 1. Create User & Membership (handles global identity reuse rule)
  const createUserAndMembership = useCallback(
    (data: {
      name: string;
      email: string;
      phone?: string;
      gender?: 'male' | 'female' | 'other';
      dateOfBirth?: string;
      organizationId: string;
      role?: MembershipRole;
      goals?: string[];
      notes?: string;
      currentCoachingPlanId?: string;
    }) => {
      const emailClean = data.email.toLowerCase().trim();
      let targetUser = users.find((u) => u.email.toLowerCase() === emailClean);
      let isNewUser = false;

      if (!targetUser) {
        isNewUser = true;
        targetUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          email: emailClean,
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          globalRole: 'member',
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [targetUser!, ...prev]);
      }

      // Create Membership
      const newMembership: Membership = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: targetUser.id,
        organizationId: data.organizationId,
        role: data.role || 'member',
        status: 'active',
        communityStatus: 'active',
        joinedAt: new Date().toISOString(),
        goals: data.goals || [],
        notes: data.notes || '',
        currentCoachingPlanId: data.currentCoachingPlanId,
        aiCreditBalance: 0,
      };

      setMemberships((prev) => [newMembership, ...prev]);

      // Create Member AI Wallet
      const newAiWallet: AiWallet = {
        id: `aiw_${newMembership.id}`,
        ownerType: 'member',
        ownerId: newMembership.id,
        balance: 0,
        totalPurchasedOrAllocated: 0,
        totalConsumed: 0,
        updatedAt: new Date().toISOString(),
      };
      setAiWallets((prev) => [...prev, newAiWallet]);

      // Add Notification
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetUser.id,
        organizationId: data.organizationId,
        title: 'Welcome to your coaching program!',
        message: 'Your membership is active. Check out your schedule and profile.',
        category: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return { user: targetUser, membership: newMembership, isNewUser };
    },
    [users]
  );

  const addMembership = useCallback((data: Omit<Membership, 'id' | 'joinedAt'>) => {
    const newMembership: Membership = {
      ...data,
      id: `mem_${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };
    setMemberships((prev) => [newMembership, ...prev]);
    return newMembership;
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  }, []);

  const updateMembership = useCallback((membershipId: string, updates: Partial<Membership>) => {
    setMemberships((prev) => prev.map((m) => (m.id === membershipId ? { ...m, ...updates } : m)));
  }, []);

  // Remove membership rule: only deletes membership, NEVER global user
  const removeMembership = useCallback((membershipId: string) => {
    setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
  }, []);

  const updateMemberCommunityStatus = useCallback((membershipId: string, status: CommunityStatus) => {
    setMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, communityStatus: status } : m))
    );
  }, []);

  const updateCoachAccount = useCallback((id: string, updates: Partial<CoachAccount>) => {
    setCoachAccounts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const updateOrganization = useCallback((id: string, updates: Partial<Organization>) => {
    setOrganizations((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const updateOrganizationBranding = useCallback(
    (id: string, branding: Partial<Organization['branding']>) => {
      setOrganizations((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, branding: { ...o.branding, ...branding } } : o
        )
      );
    },
    []
  );

  // Workout operations
  const addWorkout = useCallback((workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: `wkt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkouts((prev) => [newWorkout, ...prev]);
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    );
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const assignWorkoutToMember = useCallback(
    (workoutId: string, memberId: string, organizationId: string, notes?: string) => {
      const newAssignment: WorkoutAssignment = {
        id: `wassign_${Date.now()}`,
        workoutId,
        memberId,
        organizationId,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes,
        progressPercentage: 0,
        assignedAt: new Date().toISOString(),
      };
      setWorkoutAssignments((prev) => [newAssignment, ...prev]);

      // Notification
      const mem = memberships.find((m) => m.id === memberId);
      if (mem) {
        const notif: AppNotification = {
          id: `notif_${Date.now()}`,
          userId: mem.userId,
          organizationId,
          title: 'New Workout Plan Assigned',
          message: 'Your coach has assigned a new training protocol to your profile.',
          category: 'workout',
          isRead: false,
          link: '/app/workouts',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      return newAssignment;
    },
    [memberships]
  );

  // Diet operations
  const addDiet = useCallback((dietData: Omit<Diet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDiet: Diet = {
      ...dietData,
      id: `diet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDiets((prev) => [newDiet, ...prev]);
    return newDiet;
  }, []);

  const updateDiet = useCallback((id: string, updates: Partial<Diet>) => {
    setDiets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  }, []);

  const deleteDiet = useCallback((id: string) => {
    setDiets((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const assignDietToMember = useCallback(
    (dietId: string, memberId: string, organizationId: string) => {
      const newAssignment: DietAssignment = {
        id: `dassign_${Date.now()}`,
        dietId,
        memberId,
        organizationId,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        assignedAt: new Date().toISOString(),
      };
      setDietAssignments((prev) => [newAssignment, ...prev]);

      const mem = memberships.find((m) => m.id === memberId);
      if (mem) {
        const notif: AppNotification = {
          id: `notif_${Date.now()}`,
          userId: mem.userId,
          organizationId,
          title: 'New Nutrition Plan Assigned',
          message: 'Your coach has assigned an updated meal protocol.',
          category: 'diet',
          isRead: false,
          link: '/app/diet',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      return newAssignment;
    },
    [memberships]
  );

  // Classes & Scheduling
  const addClassType = useCallback((data: Omit<ClassType, 'id'>) => {
    const newType: ClassType = {
      ...data,
      id: `ctype_${Date.now()}`,
    };
    setClassTypes((prev) => [...prev, newType]);
    return newType;
  }, []);

  const addClassSession = useCallback((data: Omit<ClassSession, 'id' | 'bookedCount' | 'createdAt'>) => {
    const newSession: ClassSession = {
      ...data,
      id: `sess_${Date.now()}`,
      bookedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setClassSessions((prev) => [newSession, ...prev]);
    return newSession;
  }, []);

  const updateClassSession = useCallback((id: string, updates: Partial<ClassSession>) => {
    setClassSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const cancelClassSession = useCallback(
    (id: string, reason: string) => {
      setClassSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: 'cancelled', cancellationReason: reason } : s
        )
      );

      // Notify participants
      const participants = classParticipants.filter((p) => p.sessionId === id && p.status === 'booked');
      const targetSession = classSessions.find((s) => s.id === id);

      participants.forEach((p) => {
        const notif: AppNotification = {
          id: `notif_${Date.now()}_${p.userId}`,
          userId: p.userId,
          organizationId: targetSession?.organizationId,
          title: 'Class Session Cancelled',
          message: `The class "${targetSession?.title || 'Session'}" on ${targetSession?.date} has been cancelled: ${reason}`,
          category: 'class',
          isRead: false,
          link: '/app/schedule',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      });
    },
    [classParticipants, classSessions]
  );

  const bookClassSession = useCallback(
    (sessionId: string, membershipId: string, userId: string) => {
      const session = classSessions.find((s) => s.id === sessionId);
      if (!session) return { success: false, message: 'Class session not found.' };

      if (session.status === 'cancelled') {
        return { success: false, message: 'This class session has been cancelled.' };
      }

      if (session.bookedCount >= session.capacity) {
        return { success: false, message: 'Class is full.' };
      }

      const alreadyBooked = classParticipants.some(
        (p) => p.sessionId === sessionId && p.membershipId === membershipId && p.status === 'booked'
      );
      if (alreadyBooked) {
        return { success: false, message: 'You are already registered for this class.' };
      }

      const newParticipant: ClassParticipant = {
        id: `part_${Date.now()}`,
        sessionId,
        membershipId,
        userId,
        bookedAt: new Date().toISOString(),
        status: 'booked',
        attendanceStatus: 'pending',
      };

      setClassParticipants((prev) => [...prev, newParticipant]);
      setClassSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s))
      );

      return { success: true, message: 'Class booked successfully!' };
    },
    [classSessions, classParticipants]
  );

  const cancelClassBooking = useCallback((sessionId: string, membershipId: string) => {
    setClassParticipants((prev) =>
      prev.filter((p) => !(p.sessionId === sessionId && p.membershipId === membershipId))
    );
    setClassSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s
      )
    );
  }, []);

  const markAttendance = useCallback((participantId: string, status: 'present' | 'absent' | 'late') => {
    setClassParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? { ...p, attendanceStatus: status, attendedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  // Services & Coaching plans
  const addService = useCallback((data: Omit<Service, 'id'>) => {
    const newService: Service = { ...data, id: `srv_${Date.now()}` };
    setServices((prev) => [...prev, newService]);
    return newService;
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const addCoachingPlan = useCallback((data: Omit<CoachingSubscriptionPlan, 'id'>) => {
    const newPlan: CoachingSubscriptionPlan = { ...data, id: `cplan_${Date.now()}` };
    setCoachingPlans((prev) => [...prev, newPlan]);
    return newPlan;
  }, []);

  const updateCoachingPlan = useCallback((id: string, updates: Partial<CoachingSubscriptionPlan>) => {
    setCoachingPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const assignCoachingSubscription = useCallback((data: Omit<CoachingSubscription, 'id'>) => {
    const newSub: CoachingSubscription = { ...data, id: `csub_${Date.now()}` };
    setCoachingSubscriptions((prev) => [newSub, ...prev]);
    return newSub;
  }, []);

  const addPayment = useCallback((data: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPay: Payment = {
      ...data,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [newPay, ...prev]);
    return newPay;
  }, []);

  // Community
  const addCommunityPost = useCallback(
    (data: Omit<CommunityPost, 'id' | 'createdAt' | 'likesCount' | 'likedByUserIds' | 'comments'>) => {
      const newPost: CommunityPost = {
        ...data,
        id: `post_${Date.now()}`,
        likesCount: 0,
        likedByUserIds: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setCommunityPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    []
  );

  const deleteCommunityPost = useCallback((id: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleLikePost = useCallback((postId: string, userId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = p.likedByUserIds.includes(userId);
        const newLikes = hasLiked
          ? p.likedByUserIds.filter((id) => id !== userId)
          : [...p.likedByUserIds, userId];
        return {
          ...p,
          likedByUserIds: newLikes,
          likesCount: newLikes.length,
        };
      })
    );
  }, []);

  const addCommunityComment = useCallback(
    (postId: string, commentData: Omit<CommunityPost['comments'][0], 'id' | 'createdAt'>) => {
      const newComment = {
        ...commentData,
        id: `c_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setCommunityPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        )
      );
    },
    []
  );

  const deleteCommunityComment = useCallback((postId: string, commentId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );
  }, []);

  const togglePinPost = useCallback((postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
    );
  }, []);

  const reportPost = useCallback((postId: string, reason: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isReported: true, reportReason: reason } : p))
    );
  }, []);

  // Coach Content Operations
  const addCoachContent = useCallback(
    (
      content: Omit<
        CoachContent,
        'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'likesCount' | 'likedByUserIds' | 'bookmarksCount' | 'bookmarkedByUserIds'
      >
    ) => {
      const newContent: CoachContent = {
        ...content,
        id: `cc_${Date.now()}`,
        viewsCount: 0,
        likesCount: 0,
        likedByUserIds: [],
        bookmarksCount: 0,
        bookmarkedByUserIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: content.status === 'published' ? (content.publishedAt || new Date().toISOString()) : undefined,
      };
      setCoachContents((prev) => [newContent, ...prev]);

      // If published, generate activity log
      if (newContent.status === 'published') {
        const actLog: ActivityLog = {
          id: `act_${Date.now()}`,
          organizationId: newContent.organizationId,
          userId: newContent.authorId,
          userName: newContent.authorName,
          action: `Published ${newContent.type}`,
          category: 'community',
          details: `Published "${newContent.title}" in ${newContent.category}`,
          createdAt: new Date().toISOString(),
        };
        setActivityLogs((prev) => [actLog, ...prev]);
      }

      return newContent;
    },
    []
  );

  const updateCoachContent = useCallback((id: string, updates: Partial<CoachContent>) => {
    setCoachContents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              updatedAt: new Date().toISOString(),
              publishedAt:
                updates.status === 'published' && !c.publishedAt
                  ? new Date().toISOString()
                  : c.publishedAt,
            }
          : c
      )
    );
  }, []);

  const deleteCoachContent = useCallback((id: string) => {
    setCoachContents((prev) => prev.filter((c) => c.id !== id));
    // Gracefully handle community post referencing this content
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.coachContentId === id
          ? {
              ...p,
              content: `${p.content}\n\n[Note: The linked coach content was removed by the trainer.]`,
              coachContentId: undefined,
            }
          : p
      )
    );
  }, []);

  const toggleFeatureContent = useCallback((id: string) => {
    setCoachContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c))
    );
  }, []);

  const toggleLikeCoachContent = useCallback((id: string, userId: string) => {
    setCoachContents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const hasLiked = c.likedByUserIds.includes(userId);
        const newLikes = hasLiked
          ? c.likedByUserIds.filter((uid) => uid !== userId)
          : [...c.likedByUserIds, userId];
        return {
          ...c,
          likedByUserIds: newLikes,
          likesCount: newLikes.length,
        };
      })
    );
  }, []);

  const toggleBookmarkCoachContent = useCallback((id: string, userId: string) => {
    setCoachContents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const hasBookmarked = c.bookmarkedByUserIds.includes(userId);
        const newBookmarks = hasBookmarked
          ? c.bookmarkedByUserIds.filter((uid) => uid !== userId)
          : [...c.bookmarkedByUserIds, userId];
        return {
          ...c,
          bookmarkedByUserIds: newBookmarks,
          bookmarksCount: newBookmarks.length,
        };
      })
    );
  }, []);

  const shareContentToCommunity = useCallback(
    (id: string, customMessage?: string) => {
      const content = coachContents.find((c) => c.id === id);
      if (!content) {
        return { success: false, message: 'Content not found.' };
      }

      const validation = canShareToCommunity(content);
      if (!validation.canShare) {
        return { success: false, message: validation.reason || 'Cannot share content.' };
      }

      // Check if already shared
      if (content.communityShared && content.communityPostId) {
        return {
          success: true,
          communityPostId: content.communityPostId,
          message: 'Content has already been shared to the community feed.',
        };
      }

      const newPostId = `post_cc_${Date.now()}`;
      const newPost: CommunityPost = {
        id: newPostId,
        organizationId: content.organizationId,
        authorUserId: content.authorId,
        authorName: content.authorName,
        authorRole: 'owner',
        authorAvatar: content.authorAvatar,
        content:
          customMessage ||
          `[From Coach]: ${content.title}\n\n${content.description}`,
        imageUrl: content.thumbnailUrl || content.mediaUrl,
        isAnnouncement: content.type === 'announcement',
        isPinned: content.type === 'announcement',
        coachContentId: content.id,
        isFromCoachContent: true,
        likesCount: 0,
        likedByUserIds: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      setCommunityPosts((prev) => [newPost, ...prev]);

      setCoachContents((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, communityShared: true, communityPostId: newPostId }
            : c
        )
      );

      return {
        success: true,
        communityPostId: newPostId,
        message: 'Shared to organization community feed successfully!',
      };
    },
    [coachContents]
  );

  const getOrganizationStorage = useCallback(
    (organizationId: string) => {
      const org = organizations.find((o) => o.id === organizationId);
      const limitBytes = org?.entitlements?.storageLimitBytes || org?.storageLimitBytes || 50 * 1024 * 1024 * 1024;
      const orgContents = coachContents.filter((c) => c.organizationId === organizationId);
      return calculateStorageUsage(orgContents, limitBytes);
    },
    [organizations, coachContents]
  );

  // Messaging
  const sendMessage = useCallback((data: Omit<Message, 'id' | 'createdAt' | 'isRead'>) => {
    const newMsg: Message = {
      ...data,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    // Send notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: data.receiverUserId,
      organizationId: data.organizationId,
      title: `New message from ${data.senderName}`,
      message: data.content.slice(0, 80) + (data.content.length > 80 ? '...' : ''),
      category: 'message',
      isRead: false,
      link: '/app/messages',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return newMsg;
  }, []);

  const markMessagesAsRead = useCallback(
    (organizationId: string, currentUserId: string, otherUserId: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.organizationId === organizationId &&
          m.receiverUserId === currentUserId &&
          m.senderUserId === otherUserId
            ? { ...m, isRead: true }
            : m
        )
      );
    },
    []
  );

  // AI Wallet & Credits
  const purchaseCoachCredits = useCallback(
    (coachAccountId: string, amount: number, costUsd: number) => {
      const coach = coachAccounts.find((c) => c.id === coachAccountId);
      if (!coach) return;

      const newBalance = coach.aiBalance + amount;
      setCoachAccounts((prev) =>
        prev.map((c) => (c.id === coachAccountId ? { ...c, aiBalance: newBalance } : c))
      );

      // Record AI Transaction
      const tx: AiTransaction = {
        id: `ait_${Date.now()}`,
        walletId: `aiw_${coachAccountId}`,
        type: 'purchase',
        amount,
        description: `Purchased ${amount.toLocaleString()} AI Credits ($${costUsd})`,
        createdAt: new Date().toISOString(),
      };
      setAiTransactions((prev) => [tx, ...prev]);
    },
    [coachAccounts]
  );

  const allocateCreditsToMember = useCallback(
    (coachAccountId: string, membershipId: string, amount: number, organizationId: string) => {
      const coach = coachAccounts.find((c) => c.id === coachAccountId);
      const membership = memberships.find((m) => m.id === membershipId);

      if (!coach || !membership) return { success: false, message: 'Invalid coach or member.' };
      if (coach.aiBalance < amount) {
        return { success: false, message: `Insufficient coach credits (${coach.aiBalance} available).` };
      }

      // Deduct from coach
      setCoachAccounts((prev) =>
        prev.map((c) => (c.id === coachAccountId ? { ...c, aiBalance: c.aiBalance - amount } : c))
      );

      // Add to member membership
      setMemberships((prev) =>
        prev.map((m) =>
          m.id === membershipId ? { ...m, aiCreditBalance: (m.aiCreditBalance || 0) + amount } : m
        )
      );

      // Update Member AI Wallet
      setAiWallets((prev) => {
        const existing = prev.find((w) => w.ownerId === membershipId);
        if (existing) {
          return prev.map((w) =>
            w.ownerId === membershipId
              ? {
                  ...w,
                  balance: w.balance + amount,
                  totalPurchasedOrAllocated: w.totalPurchasedOrAllocated + amount,
                  updatedAt: new Date().toISOString(),
                }
              : w
          );
        } else {
          return [
            ...prev,
            {
              id: `aiw_${membershipId}`,
              ownerType: 'member',
              ownerId: membershipId,
              balance: amount,
              totalPurchasedOrAllocated: amount,
              totalConsumed: 0,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });

      // Target user name for log
      const targetUser = users.find((u) => u.id === membership.userId);

      // Transaction log: Coach deduction
      const txCoach: AiTransaction = {
        id: `ait_${Date.now()}_c`,
        organizationId,
        walletId: `aiw_${coachAccountId}`,
        type: 'allocation_out',
        amount: -amount,
        description: `Allocated ${amount} AI credits to ${targetUser?.name || 'Member'}`,
        targetMemberName: targetUser?.name,
        createdAt: new Date().toISOString(),
      };

      // Transaction log: Member credit
      const txMember: AiTransaction = {
        id: `ait_${Date.now()}_m`,
        organizationId,
        walletId: `aiw_${membershipId}`,
        type: 'allocation_in',
        amount,
        description: `Received ${amount} AI credits from Coach`,
        createdAt: new Date().toISOString(),
      };

      setAiTransactions((prev) => [txCoach, txMember, ...prev]);

      // Notification
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: membership.userId,
        organizationId,
        title: 'AI Credits Allocated',
        message: `Your coach allocated ${amount} AI scanner credits to your account.`,
        category: 'ai',
        isRead: false,
        link: '/app/ai',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      return { success: true, message: `Successfully allocated ${amount} AI credits!` };
    },
    [coachAccounts, memberships, users]
  );

  const consumeCredits = useCallback(
    (
      walletId: string,
      amount: number,
      description: string,
      featureUsed: 'ai_diet_builder' | 'ai_workout_builder' | 'ai_food_scanner',
      organizationId?: string
    ) => {
      // Find wallet
      const wallet = aiWallets.find((w) => w.id === walletId || w.ownerId === walletId);
      if (!wallet || wallet.balance < amount) return false;

      // Update wallet
      setAiWallets((prev) =>
        prev.map((w) =>
          w.id === wallet.id
            ? {
                ...w,
                balance: w.balance - amount,
                totalConsumed: w.totalConsumed + amount,
                updatedAt: new Date().toISOString(),
              }
            : w
        )
      );

      // If it's a member wallet, also update membership.aiCreditBalance
      if (wallet.ownerType === 'member') {
        setMemberships((prev) =>
          prev.map((m) =>
            m.id === wallet.ownerId
              ? { ...m, aiCreditBalance: Math.max(0, (m.aiCreditBalance || 0) - amount) }
              : m
          )
        );
      }

      // If it's coach wallet, update coachAccount.aiBalance
      if (wallet.ownerType === 'coach') {
        setCoachAccounts((prev) =>
          prev.map((c) =>
            c.id === wallet.ownerId
              ? { ...c, aiBalance: Math.max(0, c.aiBalance - amount) }
              : c
          )
        );
      }

      // Log transaction
      const tx: AiTransaction = {
        id: `ait_${Date.now()}`,
        organizationId,
        walletId: wallet.id,
        type: wallet.ownerType === 'coach' ? 'coach_deduction' : 'member_deduction',
        amount: -amount,
        description,
        featureUsed,
        createdAt: new Date().toISOString(),
      };
      setAiTransactions((prev) => [tx, ...prev]);

      return true;
    },
    [aiWallets]
  );

  // Progress
  const addMeasurement = useCallback((data: Omit<BodyMeasurement, 'id'>) => {
    const newMeas: BodyMeasurement = {
      ...data,
      id: `meas_${Date.now()}`,
    };
    setMeasurements((prev) => [newMeas, ...prev]);
    return newMeas;
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Notifications
  const addNotification = useCallback(
    (data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
      const notif: AppNotification = {
        ...data,
        id: `notif_${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)));
  }, []);

  // Platform Subscriptions
  const updatePlatformSubscription = useCallback(
    (id: string, updates: Partial<PlatformSubscription>) => {
      setPlatformSubscriptions((prev) =>
        prev.map((ps) => (ps.id === id ? { ...ps, ...updates } : ps))
      );
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        users,
        coachAccounts,
        organizations,
        memberships,
        platformPlans,
        platformSubscriptions,
        workouts,
        workoutAssignments,
        diets,
        dietAssignments,
        classTypes,
        classSessions,
        classParticipants,
        services,
        coachingPlans,
        coachingSubscriptions,
        payments,
        communityPosts,
        messages,
        aiWallets,
        aiTransactions,
        measurements,
        notifications,
        activityLogs,
        coachContents,

        addCoachContent,
        updateCoachContent,
        deleteCoachContent,
        toggleFeatureContent,
        toggleLikeCoachContent,
        toggleBookmarkCoachContent,
        shareContentToCommunity,
        getOrganizationStorage,

        createUserAndMembership,
        addMembership,
        updateUser,
        updateMembership,
        removeMembership,
        updateMemberCommunityStatus,
        updateCoachAccount,
        updateOrganization,
        updateOrganizationBranding,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        assignWorkoutToMember,
        addDiet,
        updateDiet,
        deleteDiet,
        assignDietToMember,
        addClassType,
        addClassSession,
        updateClassSession,
        cancelClassSession,
        bookClassSession,
        cancelClassBooking,
        markAttendance,
        addService,
        updateService,
        addCoachingPlan,
        updateCoachingPlan,
        assignCoachingSubscription,
        addPayment,
        addCommunityPost,
        deleteCommunityPost,
        toggleLikePost,
        addCommunityComment,
        deleteCommunityComment,
        togglePinPost,
        reportPost,
        sendMessage,
        markMessagesAsRead,
        purchaseCoachCredits,
        allocateCreditsToMember,
        consumeCredits,
        addMeasurement,
        deleteMeasurement,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updatePlatformSubscription,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
