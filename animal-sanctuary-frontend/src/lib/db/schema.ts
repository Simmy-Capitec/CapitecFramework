import { pgTable, serial, varchar, integer, decimal, date, text, boolean, timestamp, jsonb, pgEnum, pgSchema } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the schema
export const animalSanctuary = pgSchema('animal_sanctuary_capstone');

// ===================================================================
// ENUMS
// ===================================================================

export const genderEnum = pgEnum('gender', ['Male', 'Female', 'Unknown']);
export const adoptionStatusEnum = pgEnum('adoption_status', [
  'Available', 
  'Pending', 
  'Adopted', 
  'Not Available', 
  'Medical Hold'
]);
export const habitatTypeEnum = pgEnum('habitat_type', ['indoor', 'outdoor', 'mixed']);
export const applicationStatusEnum = pgEnum('application_status', [
  'Submitted',
  'Under Review', 
  'Interview Scheduled',
  'Approved',
  'Rejected',
  'Withdrawn'
]);
export const actionEnum = pgEnum('action', ['INSERT', 'UPDATE', 'DELETE']);

// ===================================================================
// CORE TABLES
// ===================================================================

export const habitats = animalSanctuary.table('habitats', {
  habitatId: serial('habitat_id').primaryKey(),
  habitatName: varchar('habitat_name', { length: 100 }).notNull(),
  habitatType: habitatTypeEnum('habitat_type').notNull(),
  capacity: integer('capacity').notNull().default(10),
  currentOccupancy: integer('current_occupancy').default(0),
  temperatureRange: varchar('temperature_range', { length: 50 }),
  specialFeatures: text('special_features'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const animals = animalSanctuary.table('animals', {
  animalId: serial('animal_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  species: varchar('species', { length: 50 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  age: integer('age'),
  weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
  gender: genderEnum('gender').default('Unknown'),
  color: varchar('color', { length: 100 }),
  arrivalDate: date('arrival_date').notNull(),
  source: varchar('source', { length: 100 }),
  adoptionStatus: adoptionStatusEnum('adoption_status').default('Available'),
  adoptionFee: decimal('adoption_fee', { precision: 8, scale: 2 }).default('0.00'),
  habitatId: integer('habitat_id').references(() => habitats.habitatId),
  dietaryRequirements: text('dietary_requirements'),
  behavioralNotes: text('behavioral_notes'),
  specialNeeds: text('special_needs'),
  microchipNumber: varchar('microchip_number', { length: 50 }),
  photos: jsonb('photos'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const staff = animalSanctuary.table('staff', {
  staffId: serial('staff_id').primaryKey(),
  employeeId: varchar('employee_id', { length: 20 }).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 30 }).notNull(),
  specialization: varchar('specialization', { length: 100 }),
  hireDate: date('hire_date').notNull(),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  emergencyContact: jsonb('emergency_contact'),
  certifications: jsonb('certifications'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const medicalRecords = animalSanctuary.table('medical_records', {
  recordId: serial('record_id').primaryKey(),
  animalId: integer('animal_id').references(() => animals.animalId).notNull(),
  vetName: varchar('vet_name', { length: 100 }),
  visitDate: date('visit_date').notNull(),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: text('medications'),
  followUpDate: date('follow_up_date'),
  cost: decimal('cost', { precision: 8, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adopters = animalSanctuary.table('adopters', {
  adopterId: serial('adopter_id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  dateOfBirth: date('date_of_birth'),
  occupation: varchar('occupation', { length: 100 }),
  housingType: varchar('housing_type', { length: 50 }),
  housingOwned: boolean('housing_owned'),
  hasYard: boolean('has_yard').default(false),
  yardFenced: boolean('yard_fenced'),
  hasOtherPets: boolean('has_other_pets'),
  otherPetsDetails: text('other_pets_details'),
  previousPetExperience: text('previous_pet_experience'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adoptionApplications = animalSanctuary.table('adoption_applications', {
  applicationId: serial('application_id').primaryKey(),
  adopterId: integer('adopter_id').references(() => adopters.adopterId).notNull(),
  animalId: integer('animal_id').references(() => animals.animalId).notNull(),
  applicationDate: date('application_date').notNull(),
  status: varchar('status', { length: 20 }).default('Submitted'),
  preferredAdoptionDate: date('preferred_adoption_date'),
  reasonForAdoption: text('reason_for_adoption'),
  lifestyleInfo: text('lifestyle_info'),
  workSchedule: text('work_schedule'),
  travelFrequency: text('travel_frequency'),
  planForPetCare: text('plan_for_pet_care'),
  monthlyBudget: decimal('monthly_budget', { precision: 8, scale: 2 }),
  specialRequests: text('special_requests'),
  interviewDate: date('interview_date'),
  interviewerStaffId: integer('interviewer_staff_id').references(() => staff.staffId),
  interviewNotes: text('interview_notes'),
  decisionDate: date('decision_date'),
  decisionReason: text('decision_reason'),
  approvedByStaffId: integer('approved_by_staff_id').references(() => staff.staffId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adoptions = animalSanctuary.table('adoptions', {
  adoptionId: serial('adoption_id').primaryKey(),
  applicationId: integer('application_id').references(() => adoptionApplications.applicationId).notNull(),
  adopterId: integer('adopter_id').references(() => adopters.adopterId).notNull(),
  animalId: integer('animal_id').references(() => animals.animalId).notNull(),
  adoptionDate: date('adoption_date').notNull(),
  adoptionFeePaid: decimal('adoption_fee_paid', { precision: 8, scale: 2 }),
  contractSigned: boolean('contract_signed').default(false),
  microchipTransferred: boolean('microchip_transferred').default(false),
  followUpRequired: boolean('follow_up_required').default(true),
  followUpDate: date('follow_up_date'),
  followUpCompleted: boolean('follow_up_completed').default(false),
  followUpNotes: text('follow_up_notes'),
  returnPolicyExplained: boolean('return_policy_explained').default(false),
  adoptionCounselorId: integer('adoption_counselor_id').references(() => staff.staffId),
  specialConditions: text('special_conditions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const donors = animalSanctuary.table('donors', {
  donorId: serial('donor_id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  isAnonymous: boolean('is_anonymous').default(false),
  preferredContact: varchar('preferred_contact', { length: 20 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const donations = animalSanctuary.table('donations', {
  donationId: serial('donation_id').primaryKey(),
  donorId: integer('donor_id').references(() => donors.donorId),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  donationDate: date('donation_date').notNull(),
  donationType: varchar('donation_type', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 100 }),
  isRecurring: boolean('is_recurring').default(false),
  recurringFrequency: varchar('recurring_frequency', { length: 20 }),
  dedicatedTo: varchar('dedicated_to', { length: 200 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const volunteers = animalSanctuary.table('volunteers', {
  volunteerId: serial('volunteer_id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  dateOfBirth: date('date_of_birth'),
  emergencyContact: varchar('emergency_contact', { length: 100 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  availability: text('availability'),
  skills: text('skills'),
  interests: text('interests'),
  backgroundCheck: boolean('background_check').default(false),
  backgroundCheckDate: date('background_check_date'),
  orientation: boolean('orientation').default(false),
  orientationDate: date('orientation_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const volunteerAssignments = animalSanctuary.table('volunteer_assignments', {
  assignmentId: serial('assignment_id').primaryKey(),
  volunteerId: integer('volunteer_id').references(() => volunteers.volunteerId).notNull(),
  animalId: integer('animal_id').references(() => animals.animalId),
  taskType: varchar('task_type', { length: 20 }).notNull(),
  taskDescription: text('task_description'),
  assignedDate: date('assigned_date').notNull(),
  scheduledDate: timestamp('scheduled_date'),
  estimatedHours: decimal('estimated_hours', { precision: 4, scale: 2 }),
  actualHours: decimal('actual_hours', { precision: 4, scale: 2 }),
  status: varchar('status', { length: 15 }).default('Assigned'),
  completionDate: timestamp('completion_date'),
  assignedByStaffId: integer('assigned_by_staff_id').references(() => staff.staffId),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const systemSettings = animalSanctuary.table('system_settings', {
  settingId: serial('setting_id').primaryKey(),
  settingName: varchar('setting_name', { length: 100 }).notNull(),
  settingValue: text('setting_value'),
  settingType: varchar('setting_type', { length: 50 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const activityLog = animalSanctuary.table('activity_log', {
  logId: serial('log_id').primaryKey(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: integer('record_id').notNull(),
  action: actionEnum('action').notNull(),
  userType: varchar('user_type', { length: 50 }),
  userId: integer('user_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').defaultNow()
});

// Note: Views removed - these don't exist in the actual database
// If needed, these can be implemented as database views later

// ===================================================================
// RELATIONS
// ===================================================================

export const habitatsRelations = relations(habitats, ({ many }) => ({
  animals: many(animals),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  habitat: one(habitats, {
    fields: [animals.habitatId],
    references: [habitats.habitatId],
  }),
  medicalRecords: many(medicalRecords),
  adoptionApplications: many(adoptionApplications),
  volunteerAssignments: many(volunteerAssignments),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  animal: one(animals, {
    fields: [medicalRecords.animalId],
    references: [animals.animalId],
  }),
}));

export const adoptersRelations = relations(adopters, ({ many }) => ({
  adoptionApplications: many(adoptionApplications),
}));

export const adoptionApplicationsRelations = relations(adoptionApplications, ({ one, many }) => ({
  adopter: one(adopters, {
    fields: [adoptionApplications.adopterId],
    references: [adopters.adopterId],
  }),
  animal: one(animals, {
    fields: [adoptionApplications.animalId],
    references: [animals.animalId],
  }),
  adoptions: many(adoptions),
}));

export const adoptionsRelations = relations(adoptions, ({ one }) => ({
  application: one(adoptionApplications, {
    fields: [adoptions.applicationId],
    references: [adoptionApplications.applicationId],
  }),
}));

export const donorsRelations = relations(donors, ({ many }) => ({
  donations: many(donations),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(donors, {
    fields: [donations.donorId],
    references: [donors.donorId],
  }),
}));

export const volunteersRelations = relations(volunteers, ({ many }) => ({
  assignments: many(volunteerAssignments),
}));

export const volunteerAssignmentsRelations = relations(volunteerAssignments, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [volunteerAssignments.volunteerId],
    references: [volunteers.volunteerId],
  }),
  animal: one(animals, {
    fields: [volunteerAssignments.animalId],
    references: [animals.animalId],
  }),
  supervisor: one(staff, {
    fields: [volunteerAssignments.supervisorId],
    references: [staff.staffId],
  }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  volunteerAssignments: many(volunteerAssignments),
}));

// ===================================================================
// TYPES
// ===================================================================

export type Animal = typeof animals.$inferSelect;
export type NewAnimal = typeof animals.$inferInsert;
export type Habitat = typeof habitats.$inferSelect;
export type NewHabitat = typeof habitats.$inferInsert;
export type Adopter = typeof adopters.$inferSelect;
export type NewAdopter = typeof adopters.$inferInsert;
export type AdoptionApplication = typeof adoptionApplications.$inferSelect;
export type NewAdoptionApplication = typeof adoptionApplications.$inferInsert;
export type Volunteer = typeof volunteers.$inferSelect;
export type NewVolunteer = typeof volunteers.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;
export type Donor = typeof donors.$inferSelect;
export type NewDonor = typeof donors.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;