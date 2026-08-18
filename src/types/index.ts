// Domain models and types for Coach Business Platform

export type GlobalRole = 'super_admin' | 'coach' | 'member';
export type MembershipRole = 'owner' | 'coach' | 'member';
export type MembershipStatus = 'active' | 'inactive' | 'pending';
export type CommunityStatus = 'active' | 'restricted' | 'banned';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  globalRole: GlobalRole;
  createdAt: string;
}

export interface CoachAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialty?: string;
  bio?: string;
  status: 'active' | 'suspended' | 'pending';
  platformSubscriptionPlanId: string;
  aiBalance: number;
  organizationIds: string[];
  createdAt: string;
}

export interface OrganizationBranding {
  logo?: string;
  primaryColor: string; // Hex color e.g. #0284c7
  secondaryColor: string; // Hex color e.g. #0f172a
  welcomeMessage?: string;
  bannerImage?: string;
}

export interface OrganizationSettings {
  allowMemberCommunityPosts: boolean;
  enableAiFeatures: boolean;
  enableClassBooking: boolean;
  enablePublicRegistration: boolean;
  currency: string;
  timezone: string;
}

export interface OrganizationEntitlements {
  maxMembers: number;
  aiEnabled: boolean;
  communityEnabled: boolean;
  classesEnabled: boolean;
  advancedReportsEnabled: boolean;
  customBrandingEnabled: boolean;
  storageLimitBytes?: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerCoachId: string;
  branding: OrganizationBranding;
  settings: OrganizationSettings;
  entitlements: OrganizationEntitlements;
  status: 'active' | 'suspended' | 'inactive';
  description?: string;
  storageUsedBytes?: number;
  storageLimitBytes?: number;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  communityStatus: CommunityStatus;
  joinedAt: string;
  goals?: string[];
  notes?: string;
  currentCoachingPlanId?: string;
  aiCreditBalance: number;
}

export interface PlatformSubscriptionPlan {
  id: string;
  name: string;
  tier: 'starter' | 'professional' | 'business';
  priceMonthly: number;
  priceAnnual: number;
  clientLimit: number;
  aiCreditsIncluded: number;
  features: string[];
  recommended?: boolean;
}

export interface PlatformSubscription {
  id: string;
  coachAccountId: string;
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Workout Types
export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg?: number;
  durationSeconds?: number;
  restSeconds?: number;
  isCompleted?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'mobility' | 'core' | 'bodyweight';
  targetMuscle: string;
  sets: ExerciseSet[];
  notes?: string;
  videoUrl?: string;
  equipment?: string;
}

export interface WorkoutSection {
  id: string;
  name: string; // e.g. "Warmup", "Main Compound", "Accessory", "Cool Down"
  exercises: Exercise[];
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  title: string; // e.g. "Push Day (Chest & Triceps)"
  sections: WorkoutSection[];
}

export interface Workout {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  daysPerWeek: number;
  category: string;
  days: WorkoutDay[];
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutAssignment {
  id: string;
  workoutId: string;
  memberId: string; // Membership ID
  organizationId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  progressPercentage: number;
  assignedAt: string;
}

// Diet & Nutrition Types
export interface FoodItem {
  id: string;
  name: string;
  portion: string; // e.g. "150g" or "2 large eggs"
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string; // "Breakfast", "Mid-Morning", "Lunch", "Pre-Workout", "Dinner"
  time?: string;
  items: FoodItem[];
  notes?: string;
}

export interface Diet {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  dietaryPreference: 'standard' | 'high_protein' | 'keto' | 'vegan' | 'vegetarian' | 'paleo';
  meals: Meal[];
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DietAssignment {
  id: string;
  dietId: string;
  memberId: string;
  organizationId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  assignedAt: string;
}

// Class & Scheduling Types
export interface ClassType {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: 'HIIT' | 'Yoga' | 'Strength' | 'Zumba' | 'Mobility' | 'Boxing' | 'Cardio';
  defaultDurationMinutes: number;
  defaultCapacity: number;
  color: string;
  isOnline: boolean;
}

export interface ClassSession {
  id: string;
  organizationId: string;
  classTypeId: string;
  title: string;
  coachId: string; // User ID or Coach Account ID
  coachName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour e.g. "09:00")
  endTime: string; // HH:MM e.g. "10:00"
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  isOnline: boolean;
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cancellationReason?: string;
  recurringSeriesId?: string;
  createdAt: string;
}

export interface ClassParticipant {
  id: string;
  sessionId: string;
  membershipId: string;
  userId: string;
  bookedAt: string;
  status: 'booked' | 'cancelled' | 'waitlist';
  attendanceStatus: 'pending' | 'present' | 'absent' | 'late';
  attendedAt?: string;
}

// Services & Subscriptions
export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  status: 'active' | 'inactive';
}

export interface CoachingSubscriptionPlan {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  durationMonths: number;
  includedServices: string[];
  status: 'active' | 'archived';
}

export interface CoachingSubscription {
  id: string;
  organizationId: string;
  memberId: string; // Membership ID
  planId: string;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'cancelled';
  price: number;
  autoRenew: boolean;
}

export interface Payment {
  id: string;
  organizationId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  description: string;
  invoiceNumber: string;
  paymentMethod: string;
  createdAt: string;
}

// Community & Messaging Types
export interface CommunityComment {
  id: string;
  postId: string;
  authorUserId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  organizationId: string;
  authorUserId: string;
  authorName: string;
  authorRole: MembershipRole;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  isAnnouncement?: boolean;
  isPinned?: boolean;
  likesCount: number;
  likedByUserIds: string[];
  comments: CommunityComment[];
  isReported?: boolean;
  reportReason?: string;
  coachContentId?: string; // Reference to original CoachContent if shared
  isFromCoachContent?: boolean;
  createdAt: string;
}

// Coach Content & Media Ecosystem Types
export type CoachContentType = 'video' | 'short' | 'image' | 'post' | 'achievement' | 'announcement';

export type CoachContentCategory =
  | 'workout'
  | 'technique'
  | 'nutrition'
  | 'education'
  | 'motivation'
  | 'transformation'
  | 'achievement'
  | 'general';

export type CoachContentStatus = 'draft' | 'published' | 'archived';
export type CoachContentVisibility = 'members' | 'coach_only';

export interface CoachContent {
  id: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: CoachContentType;
  title: string;
  description: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  category: CoachContentCategory;
  tags: string[];
  status: CoachContentStatus;
  visibility: CoachContentVisibility;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  storageSizeBytes: number;
  communityShared?: boolean;
  communityPostId?: string;
  viewsCount: number;
  likesCount: number;
  likedByUserIds: string[];
  bookmarksCount: number;
  bookmarkedByUserIds: string[];
}

export interface OrganizationStorage {
  usedBytes: number;
  limitBytes: number;
  breakdown: {
    videosBytes: number;
    shortsBytes: number;
    imagesBytes: number;
    otherBytes: number;
  };
}

export interface Message {
  id: string;
  organizationId: string;
  senderUserId: string;
  receiverUserId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  organizationId: string;
  participantUserIds: string[];
  lastMessage?: Message;
  unreadCount: number;
}

// AI Wallet & Credit System
export interface AiWallet {
  id: string;
  ownerType: 'coach' | 'member';
  ownerId: string; // CoachAccount ID or Membership ID
  balance: number;
  totalPurchasedOrAllocated: number;
  totalConsumed: number;
  updatedAt: string;
}

export interface AiTransaction {
  id: string;
  organizationId?: string;
  walletId: string;
  type: 'purchase' | 'coach_deduction' | 'allocation_out' | 'allocation_in' | 'member_deduction';
  amount: number;
  description: string;
  featureUsed?: 'ai_diet_builder' | 'ai_workout_builder' | 'ai_food_scanner';
  targetMemberName?: string;
  createdAt: string;
}

export interface AiScanResult {
  id: string;
  imageUrl: string;
  dishName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  portionEstimate: string;
  confidence: number;
  observations: string[];
  healthScore: number;
  createdAt: string;
}

// Progress & Metrics Types
export interface BodyMeasurement {
  id: string;
  membershipId: string;
  date: string;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bodyFatPercentage?: number;
  photoUrl?: string;
  notes?: string;
}

// Notification System
export interface AppNotification {
  id: string;
  userId: string;
  organizationId?: string;
  title: string;
  message: string;
  category: 'workout' | 'diet' | 'class' | 'ai' | 'billing' | 'community' | 'message' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Audit & Activity Logs
export interface ActivityLog {
  id: string;
  organizationId?: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'workout' | 'diet' | 'class' | 'billing' | 'ai' | 'community' | 'admin';
  details: string;
  createdAt: string;
}
