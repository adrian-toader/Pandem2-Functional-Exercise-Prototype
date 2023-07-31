/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { LinearLog } from '../models/constants';

export const ModellingModelKeys = {
  Model05: 'model_05'
};
type modelKey = typeof ModellingModelKeys;
export type ModellingModelKey = modelKey[keyof modelKey];

export const ModellingModelParameterValueAgeTypes = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',

  Y: 'y',
  O: 'o'
};
type modelParameterValueAgeType = typeof ModellingModelParameterValueAgeTypes;
export type ModellingModelParameterValueAgeType = modelParameterValueAgeType[keyof modelParameterValueAgeType];

export const ModellingModelParameterValueAgeTypeLabels = {
  'a': '< 15',
  'b': '15-24',
  'c': '25-64',
  'd': '65+',
  'e': 'Total',

  'y': 'Young',
  'o': 'Old'
};

export const ModellingModelParameterValueAgeContactTypes = {
  AA: 'aa',
  AB: 'ab',
  AC: 'ac',
  AD: 'ad',
  BA: 'ba',
  BB: 'bb',
  BC: 'bc',
  BD: 'bd',
  CA: 'ca',
  CB: 'cb',
  CC: 'cc',
  CD: 'cd',
  DA: 'da',
  DB: 'db',
  DC: 'dc',
  DD: 'dd'
};
type modelParameterValueAgeContactType = typeof ModellingModelParameterValueAgeContactTypes;
export type ModellingModelParameterValueAgeContactType = modelParameterValueAgeContactType[keyof modelParameterValueAgeContactType];

export const ModellingModelParameterCategories = {
  PublicHealthPolicies: 'Public health policies',
  DiseaseSeverity: 'Disease severity',
  HospitalResources: 'Hospital resources',
  HospitalSurgeStrategies: 'Hospital surge strategies',
  ModellingOptions: 'Modelling options',
  RegionalData: 'Regional data'
};
type modelParameterCategory = typeof ModellingModelParameterCategories;
export type ModellingModelParameterCategory = modelParameterCategory[keyof modelParameterCategory];

export const ModellingModelParameterSubcategories = {
  // Public health policies
  Vaccination: 'Vaccination',
  Mobility: 'Mobility',
  TestingIsolation: 'Testing & isolation',
  ContactTracing: 'Contact tracing',
  MaskWearing: 'Mask wearing',
  // DiseaseSeverity
  HospitalisationParameters: 'Hospitalisation parameters',
  LOSInDays: 'Length of stay (LOS) in days',
  FatalityRates: 'Fatality rates',
  EffectOfTherapeuticInterventions: 'Effect of therapeutic interventions (fraction reductions)',
  // Hospital Resources
  PandemicResourceAllocation: 'Pandemic resource allocation',
  ResourceUsageRates: 'Resource usage rates',
  Oxygen: 'Oxygen',
  PPE: 'PPE',
  TherapeuticCapacity: 'Therapeutic capacity (proportion of patients that can be treated, 0 to 1)',
  Morgue: 'Morgue',
  // Hospital Surge Strategies
  Strategy1: 'Strategy 1: activate when ICU nurse capacity is low',
  Strategy2: 'Strategy 2: activate when ward nurse capacity is low',
  Strategy3: 'Strategy 3: activate when PPE supplies run low',
  Strategy4: 'Strategy 4: activate when physical ward bed capacity is low',
  // Data
  Population: 'Population',
  ContactRates: 'Contact rates (where a = age < 15, b = age 15 - 24, b = age 25 - 64, d = age 65+)',
  ProbabilityOfInfection: 'Probability of infection',
  ResourceParameters: 'Resource parameters',
  ResourcesCalculatedForThePopulation: 'Resources calculated for the population',
  TotalBedCapacity: 'Total bed capacity',
  PandemicBedCapacity: 'Pandemic bed capacity',
  PandemicPPECapacity: 'Pandemic PPE capacity',
  PandemicMorgueCapacity: 'Pandemic morgue capacity'
};
type modelParameterSubcategory = typeof ModellingModelParameterSubcategories;
export type ModellingModelParameterSubcategory = modelParameterSubcategory[keyof modelParameterSubcategory];

export const ModellingModelDataParameterKeys = {
  PopulationSize: 'Inputs_Data.Population_size',
  AgeSpecificContactRates: 'Inputs_Data.Age_specific_contact_rates',
  ProbabilityOfInfection: 'Inputs_Epi.Probability_of_infection',
  WardBedsPer1K: 'Inputs_Data.ward_beds_per_1K',
  WardNursesPer1K: 'Inputs_Data.ward_nurses_per_1K',
  ICUBedsPer100K: 'Inputs_Data.ICU_beds_per_100K',
  ICUNursesPer100K: 'Inputs_Data.ICU_nurses_per_100K',
  VentilatorsPer100K: 'Inputs_Data.ventilators_per_100K',
  PhysiciansPer100K: 'Inputs_Data.physicians_per_100K',
  MorgueCapacityPer100K: 'Inputs_Data.morgue_capacity_per_100K',
  TargetPPEStockPer1K: 'Inputs_Data.target_PPE_stock_level_per_1K'
};
type modelDataParameterKey = typeof ModellingModelDataParameterKeys;
export type ModellingModelDataParameterKey = modelDataParameterKey[keyof modelDataParameterKey];

export const ModellingModelResourceAllocationKeys = {
  ProportionOfBeds: 'Inputs_Hospital_resource_params.proportion_of_beds_available_for_pandemic',
  ProportionOfICUBeds: 'Inputs_Hospital_resource_params.proportion_of_ICU_beds_available_for_pandemic',
  ProportionOfNurses: 'Inputs_Hospital_resource_params.proportion_of_nurses_available_for_pandemic',
  ProportionOfICUNurses: 'Inputs_Hospital_resource_params.proportion_of_ICU_nurses_available_for_pandemic',
  ProportionOfPhysicians: 'Inputs_Hospital_resource_params.proportion_of_physicians_available_for_pandemic',
  ProportionOfVentilators: 'Inputs_Hospital_resource_params.proportion_of_ventilators_available_for_pandemic',
  ProportionOfMorgueCapacity: 'Inputs_Hospital_resource_params.proportion_of_morgue_capacity_available_for_pandemic',
  NursesPerBed: 'Inputs_Hospital_resource_params.nurses_per_bed',
  ICUNursesPerBed: 'Inputs_Hospital_resource_params.ICU_nurses_per_bed',
  FractionICUPatientsRequiringVentilator: 'Inputs_Hospital_resource_params.fraction_ICU_patients_requiring_ventilator'
};
type modelResourceAllocationKey = typeof ModellingModelResourceAllocationKeys;
export type ModellingModelResourceAllocationKey = modelResourceAllocationKey[keyof modelResourceAllocationKey];

export const ModellingModelParameterTypes = {
  Number: 'Number',
  Boolean: 'Boolean'
};
type modelParameterType = typeof ModellingModelParameterTypes;
export type ModellingModelParameterType = modelParameterType[keyof modelParameterType];

export interface IModellingModelParameterValue {
  value?: number | boolean;
  limits?: {
    min?: number;
    max?: number;
  };
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingModelParameter {
  name: string;
  key: string;
  category: ModellingModelParameterCategory;
  subcategory?: ModellingModelParameterSubcategory;
  description?: string;
  type: ModellingModelParameterType;
  step?: number;
  readonly?: boolean;
  values: IModellingModelParameterValue[];
}

export interface IModellingModelDescriptionSection {
  title: string;
  paragraphs: string[];
}

export interface ModellingModelDataEntity {
  id: string;
  name: string;
  key: string;
  pathogen: string;
  short_description?: string;
  description?: IModellingModelDescriptionSection[];
  model_structure_image?: string;
  parameters: IModellingModelParameter[];
}

export interface IModellingScenarioParameterValue {
  value: number | boolean;
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingScenarioParameter {
  key: string;
  values: IModellingScenarioParameterValue[];
}

export interface IModellingScenarioResultSummary {
  total_needed_icu_a?: number;
  total_needed_icu_b?: number;
  total_needed_icu_c?: number;
  total_icu_admissions_a?: number;
  total_icu_admissions_b?: number;
  total_icu_admissions_c?: number;
  total_needed_ward_bed_a?: number;
  total_needed_ward_bed_b?: number;
  total_needed_ward_bed_c?: number;
  total_ward_admissions_a?: number;
  total_ward_admissions_b?: number;
  total_ward_admissions_c?: number;
  potential_deaths_due_to_lack_of_icu_a?: number;
  potential_deaths_due_to_lack_of_icu_b?: number;
  potential_deaths_due_to_lack_of_icu_c?: number;
  total_deaths_a?: number;
  total_deaths_b?: number;
  total_deaths_c?: number;

  peak_icu_demand?: number;
  peak_demand_icu_beds?: number;
  peak_demand_icu_nurses?: number;
  peak_demand_ventilators?: number;
  peak_ward_demand?: number;
  peak_demand_ward_beds?: number;
  peak_demand_nurses?: number;
  peak_demand_ppe?: number;
}

export interface IModellingScenarioDataEntity {
  id: string;
  userId: string;
  modelId: string;
  previousConfigScenarioId?: string;
  comparisonScenarioId?: string;
  comparisonScenarioName?: string;
  name: string;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  result_summary?: IModellingScenarioResultSummary;
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
}

export interface IModellingScenarioDataEntityPayload {
  userId: string;
  modelId: string;
  previousConfigScenarioId?: string;
  comparisonScenarioId?: string;
  comparisonScenarioName?: string;
  name: string;
  date: string;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  sections_order?: string[];
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
}

export interface IModellingScenarioDayResultDataEntity {
  id: string;
  scenarioId: string;

  day: number;
  // New infections per day by age group. This indicator is the number of new cases that actually occur in the population & differs from confirmed cases
  actual_cases_a?: number;
  actual_cases_b?: number;
  actual_cases_c?: number;
  actual_cases_d?: number;
  actual_cases_e?: number;
  // Total number of patients in hospital in all wards and waiting for wards
  total_in_hospital_a?: number;
  total_in_hospital_b?: number;
  total_in_hospital_c?: number;
  total_in_hospital_d?: number;
  // People being admitted to hospital, a proportion of (both detected and undetected) infected people
  hospital_admissions_a?: number;
  hospital_admissions_b?: number;
  hospital_admissions_c?: number;
  hospital_admissions_d?: number;
  // Patients discharged from hospital, from wards and ward overflows.
  // (Note that patients discharged from ICU will go to wards and later will discharged from there)
  hospital_discharges_a?: number;
  hospital_discharges_b?: number;
  hospital_discharges_c?: number;
  hospital_discharges_d?: number;
  // Patients being admitted to ICU
  icu_admissions_a?: number;
  icu_admissions_b?: number;
  icu_admissions_c?: number;
  icu_admissions_d?: number;
  // Patients being transferred from ICU to ward
  icu_discharges_a?: number;
  icu_discharges_b?: number;
  icu_discharges_c?: number;
  icu_discharges_d?: number;
  // Patient deaths in wards, ICU and ward overflow. It also includes potential deaths in ICU overflow
  deaths_in_hospital_a?: number;
  deaths_in_hospital_b?: number;
  deaths_in_hospital_c?: number;
  deaths_in_hospital_d?: number;
  // Physical ward beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  beds?: number;
  // Total ward beds occupied by patients
  occupied_ward_beds?: number;
  // Physical ward beds currently unoccupied
  physical_ward_beds_available?: number;
  // Average expected staffed beds freed by ward discharges, deaths and transfers to ICU (used in calculation of availability)
  expected_beds_freed?: number;
  // Patients waiting for a ward bed
  patients_waiting_for_ward_bed_a?: number;
  patients_waiting_for_ward_bed_b?: number;
  patients_waiting_for_ward_bed_c?: number;
  patients_waiting_for_ward_bed_d?: number;
  // Patients who could not get a ward bed and are being cared for outside wards, e.g. in emergency department or on trolleys
  in_ward_overflow_a?: number;
  in_ward_overflow_b?: number;
  in_ward_overflow_c?: number;
  in_ward_overflow_d?: number;
  // Number of physical ward beds needed to meet demand at this time - takes into account patients waiting for a bed and in overflow
  physical_ward_beds_needed?: number;
  // Gap in physical hospital beds, comparing beds available plus expected beds freed with beds needed
  // (value greater than zero only when demand exceeds supply)
  physical_ward_beds_gap?: number;
  // Total general ward nurses employed and available for care of pandemic patients, irrespective of absenteeism
  max_available_nurses?: number;
  // Nurses absent due to infection (if staff absenteeism option is set)
  absent_nurses?: number;
  // Nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  nurses_at_work?: number;
  // Total general nurses occupied with caring for patients in wards, calculated on the basis of number of occupied beds and nurse-to-patient ratio
  occupied_nurses?: number;
  // Nurses not occupied with patients nor absent
  available_nurses?: number;
  // Nurses freed as expected staffed beds are freed by ward discharges, deaths and transfers to ICU  (used in calculation of availability)
  expected_nurses_freed?: number;
  // Number of ward nurses needed to meet demand (for patients waiting for ward and in ward overflow) at the normal nurse-to-patient ratio
  total_nurses_needed_for_incoming_patients?: number;
  // Gap in nurses, comparing nurses available plus expected nurses freed with nurses needed (value greater than zero only when demand exceeds supply)
  nurses_gap?: number;
  // Overflow patients have separate unspecified staff (simplifying assumption)
  extra_staff_needed_for_overflow_patients?: number;
  // The number of physical ward beds supported by available nurses
  staffed_ward_beds_available?: number;
  // The number of staffed ward beds needed to meet current demand (includes patients waiting for ward and in ward overflow)
  staffed_ward_beds_needed?: number;
  // The gap in staffed ward beds, comparing available staffed beds plus expected beds freed with patients waiting for a bed plus patients in ward overflow
  staffed_ward_beds_gap?: number;
  // Patients being admitted to ward beds (maximum is staffed wards available plus expected beds freed)
  ward_admissions_a?: number;
  ward_admissions_b?: number;
  ward_admissions_c?: number;
  ward_admissions_d?: number;
  // Patients waiting for a ward bed who cannot get access to one (does not include patients currently in overflow)
  moving_to_ward_overflow_a?: number;
  moving_to_ward_overflow_b?: number;
  moving_to_ward_overflow_c?: number;
  moving_to_ward_overflow_d?: number;
  // Physical ICU beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  icu_beds?: number;
  // Total ICU beds occupied by patients
  occupied_icu_beds?: number;
  // Physical ICU beds currently unoccupied
  physical_icu_beds_available?: number;
  // Average expected staffed ICU beds freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_beds_freed?: number;
  // Patients waiting for an ICU bed
  patients_waiting_for_icu_a?: number;
  patients_waiting_for_icu_b?: number;
  patients_waiting_for_icu_c?: number;
  patients_waiting_for_icu_d?: number;
  // Patients who could not get an ICU bed and are being cared for outside ICU, ideally in an enhanced ward bed with
  // extra equipment or staffing, but may not be possible
  in_icu_overflow_a?: number;
  in_icu_overflow_b?: number;
  in_icu_overflow_c?: number;
  in_icu_overflow_d?: number;
  // Number of physical ICU beds needed to meet demand at this time - takes into account patients waiting
  // for an ICU bed and patients in ICU overflow
  physical_icu_beds_needed?: number;
  // Gap in physical ICU beds, comparing ICU beds available plus expected ICU beds freed with ICU beds
  // needed (value greater than zero only when demand exceeds supply)
  physical_icu_beds_gap?: number;
  // Total ICU nurses employed and available for care of pandemic patients, assuming none are absent
  max_available_icu_nurses?: number;
  // ICU nurses absent due to infection (if staff absenteeism option is set)
  absent_icu_nurses?: number;
  // ICU nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  icu_nurses_at_work?: number;
  // Total ICU nurses occupied with caring for patients in ICU wards, calculated on the basis of number of occupied ICU
  // beds and ICU nurse-to-patient ratio
  occupied_icu_nurses?: number;
  // ICU nurses not occupied with patients nor absent
  available_icu_nurses?: number;
  // ICU nurses freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_nurses_freed?: number;
  // Number of ICU nurses needed to meet demand (for patients waiting for ICU and in ICU overflow) at the normal ICU nurse-to-patient ratio
  total_icu_nurses_needed_for_incoming_patients?: number;
  // Gap in ICU nurses, comparing ICU nurses available plus expected ICU nurses freed with ICU nurses needed
  // (value greater than zero only when demand exceeds supply)
  icu_nurses_gap?: number;
  // The number of ICU ward beds supported by available ICU nurses and ventilators
  staffed_equipped_icu_beds_available?: number;
  // The number of staffed ICU beds needed to meet current demand (includes patients waiting for ICU and in ICU overflow)
  staffed_equipped_icu_beds_needed?: number;
  // The gap in staffed ICU beds, comparing available staffed ICU beds plus expected ICU beds freed with
  // patients waiting for ICU plus patients in ICU overflow
  staffed_equipped_icu_beds_gap?: number;
  // Patients waiting for an ICU bed who cannot get access to one (does not include patients currently in ICU overflow)
  moving_to_icu_overflow_a?: number;
  moving_to_icu_overflow_b?: number;
  moving_to_icu_overflow_c?: number;
  moving_to_icu_overflow_d?: number;
  // Patients at risk of dying because they cannot access an ICU bed
  at_risk_of_dying_from_lack_of_icu_a?: number;
  at_risk_of_dying_from_lack_of_icu_b?: number;
  at_risk_of_dying_from_lack_of_icu_c?: number;
  at_risk_of_dying_from_lack_of_icu_d?: number;
  // Mechanical ventilators in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  ventilators_in_stock?: number;
  // Mechanical ventilators currently in use
  ventilators_in_use?: number;
  // Ventilators not currently in use
  ventilators_available?: number;
  // Ventilators freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_ventilators_freed?: number;
  // Mechanical ventilators needed, according to current demand for ICU (patients requiring ICU and in overflow, not those currently in ICU)
  ventilators_needed_for_incoming_icu_patients?: number;
  // Gap in ventilators, comparing ventilators available plus expected ventilators freed with ventilators needed
  // (value greater than zero only when demand exceeds supply)
  gap_in_ventilators?: number;
  // Personal protective equipment in stock (masks, gloves, aprons etc). Units are PPE sets.
  pandemic_ppe_stock?: number;
  // PPE sets needed by staff caring for patients currently in hospital
  ppe_needed?: number;
  // Gap in PPE (value greater than zero only when demand exceeds supply)
  ppe_gap?: number;
  // Cumulative total of PPE sets used over the simulated time period up to this point in time
  total_ppe_used?: number;
  // Whether PPE supply is interrupted (1 for yes, 0 for no). Occurs between a preset start and end time when option to simulate interrupted supply is set.
  interrupted_ppe_supply?: boolean;

  // Total of all patients who needed ICU during current run (from admissions and transfers from ward and ward overflow)
  total_needed_icu_a?: number;
  total_needed_icu_b?: number;
  total_needed_icu_c?: number;
  total_needed_icu_d?: number;
  // Total number of patients who were admitted to ICU
  total_icu_admissions_a?: number;
  total_icu_admissions_b?: number;
  total_icu_admissions_c?: number;
  total_icu_admissions_d?: number;
  // Total of all patients who needed a ward bed during current run (from admissions and transfers from ICU)
  total_needed_ward_bed_a?: number;
  total_needed_ward_bed_b?: number;
  total_needed_ward_bed_c?: number;
  total_needed_ward_bed_d?: number;
  // Total number of patients who were admitted to wards (from admissions and transfers from ICU)
  total_ward_admissions_a?: number;
  total_ward_admissions_b?: number;
  total_ward_admissions_c?: number;
  total_ward_admissions_d?: number;
  // Total patients at risk of dying from being unable to access an ICU bed
  potential_deaths_due_to_lack_of_icu_a?: number;
  potential_deaths_due_to_lack_of_icu_b?: number;
  potential_deaths_due_to_lack_of_icu_c?: number;
  potential_deaths_due_to_lack_of_icu_d?: number;
  // Total deaths in hospital; includes potential deaths due to lack of ICU
  total_deaths_a?: number;
  total_deaths_b?: number;
  total_deaths_c?: number;
  total_deaths_d?: number;

  // Highest estimated ICU demand in a single day
  peak_icu_demand?: number;
  // Highest estimated number of physical ICU beds required a single day
  peak_demand_icu_beds?: number;
  // Highest estimated number of ICU nurses required in a single day
  peak_demand_icu_nurses?: number;
  // Highest estimated number of ventilators required for ICU patients in a single day
  peak_demand_ventilators?: number;
  // Highest estimated demand for ward beds in a single day
  peak_ward_demand?: number;
  // Highest estimated number of physical ward beds required a single day
  peak_demand_ward_beds?: number;
  // Highest estimated number of ward nurses required a single day
  peak_demand_nurses?: number;
  // Highest estimated number of PPE sets required in a single day by nursing staff (both ward and ICU nurses)
  peak_demand_ppe?: number;

  // Surge strategy 1 is to reduce the ICU nurse-to-patient ratio (for all patients). It will be activated
  // when only 5% of ICU nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_1?: boolean;
  // Surge strategy 2 is to reduce the ward nurse-to-patient ratio (for all patients). It will be activated
  // (value 1) when only 5% of ward nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_2?: boolean;
  // Surge strategy 3 is to reduce the PPE sets used per staff per shift and will be activated (value 1)
  // when PPE stock is down to one day’s supply, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_3?: boolean;
  // Surge strategy 4 is to increase bed capacity. It will be activated (value 1) when only 5% of beds
  // are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_4?: boolean;

  // The percentage of the each group that acquired the disease during an outbreak (the dimension d gives the overall proportion of the population)
  attack_rate_a?: number;
  attack_rate_b?: number;
  attack_rate_c?: number;
  attack_rate_d?: number;
  attack_rate_e?: number;
  // The maximum number of vaccines that the public health system can administer in a day.
  vaccination_capacity?: number;
  // The maximum number of people that can be traced in a day by the public health system.
  contact_tracing_capacity?: number;
  // The maximum number of tests that can be run in a day by the public health system
  testing_capacity?: number;
  // A relative measure of mobility with respect to the mobility level in peace time. In the absence of interventions, this index is equal
  // to one. In the presence of mobility interventions (lockdown, social distancing) this index is less than one.
  mobility_index?: number;

  // Patients in ICU dying per time period
  deaths_in_icu_a?: number;
  deaths_in_icu_b?: number;
  deaths_in_icu_c?: number;
  deaths_in_icu_d?: number;
  // Cases detected by the surveillance system via testing.
  confirmed_cases_a?: number;
  confirmed_cases_b?: number;
  confirmed_cases_c?: number;
  confirmed_cases_d?: number;
  confirmed_cases_e?: number;
  // The pandemic demand for ward beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ward capacity
  pandemic_ward_demand_factor?: number;
  // The pandemic demand for ICU  beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ICU capacity
  pandemic_icu_demand_factor?: number;
  // Overall indicator of stress on hospital care, taking into account additional demand for ward and ICU beds
  stress_code?: number;
  // The total number of staffed ward beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_ward_bed_capacity?: number;
  // The total number of staffed ward beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_ward_bed_capacity?: number;
  // The total number of staffed, equipped ICU beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_icu_bed_capacity?: number;
  // The total number of staffed, equipped ICU beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_icu_bed_capacity?: number;

  // Deceased patients being moved to morgue
  deceased_moved_to_morgue?: number;
  // Where unusually high mortality rates overwhelm regular mortuary services, surplus bodies may be moved to temporary morgues such as refrigerated trucks to prevent bed blocking in hospitals
  deceased_moved_to_temporary_morgues?: number;
  // Total hospital physicians employed and available for care of pandemic patients, assuming none are absent
  max_available_physicians?: number;
  // Hospital physicians absent due to infection (if staff absenteeism option is set) or burnout
  absent_physicians?: number;
  // Hospital physicians at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled, or burnout)
  physicians_at_work?: number;
  // Normal hospital morgue spaces occupied by deceased patients
  in_morgues?: number;
  // Deceased patients in temporary morgues, e.g. mobile refrigerated trailer units
  in_temporary_morgues?: number;
  // Antiviral treatments administered to patients in wards and ward overflows (whole treatments, whether one or more doses)
  antivirals_administered_a?: number;
  antivirals_administered_b?: number;
  antivirals_administered_c?: number;
  antivirals_administered_d?: number;
  // Previous strain vaccines administered to patients in ICU (whole treatments, whether one or more doses)
  previous_vaccines_administered_a?: number;
  previous_vaccines_administered_b?: number;
  previous_vaccines_administered_c?: number;
  previous_vaccines_administered_d?: number;

  // Cumulative number of infected individuals (actual cases)
  cumulative_cases_a?: number;
  cumulative_cases_b?: number;
  cumulative_cases_c?: number;
  cumulative_cases_d?: number;
  cumulative_cases_e?: number;
  // Cumulative total of all patients admitted to hospital
  total_admissions_a?: number;
  total_admissions_b?: number;
  total_admissions_c?: number;
  total_admissions_d?: number;
  // The peak value of the pandemic demand for ward beds, expressed as a multiple of total normal ward capacity.
  peak_ward_demand_factor?: number;
  // The peak value of the pandemic demand for ICU beds, expressed as a multiple of total normal ICU capacity.
  peak_icu_demand_factor?: number;
  // Total number cases confirmed by testing.
  cumulative_confirmed_cases_a?: number;
  cumulative_confirmed_cases_b?: number;
  cumulative_confirmed_cases_c?: number;
  cumulative_confirmed_cases_d?: number;
  cumulative_confirmed_cases_e?: number;
  // All patients who require an ICU bed - on admission and for ward and overflow transfers
  need_icu_a?: number;
  need_icu_b?: number;
  need_icu_c?: number;
  need_icu_d?: number;
  // Patients who need a ward bed (on admission or after a stay in ICU)
  need_ward_bed_a?: number;
  need_ward_bed_b?: number;
  need_ward_bed_c?: number;
  need_ward_bed_d?: number;
  // Total deaths expected according to normal fatality rates, not including additional potential deaths from lack of ICU capacity
  total_expected_deaths?: number;
  // Percentage of ward nurses who are absent through either infection or burnout
  ward_nurse_absenteeism_rate?: number;
  // Percentage of ICU nurses who are absent through either infection or burnout
  icu_nurse_absenteeism_rate?: number;
  // Percentage of all nurses who are absent through either infection or burnout
  all_nurses_absenteeism_rate?: number;
  // Total denied a ward bed in all age groups
  total_unable_to_access_ward_bed?: number;
  // Total denied ICU in all age groups
  total_unable_to_access_icu?: number;

  // Vaccination rate over time
  vaccination_a?: number;
  vaccination_b?: number;
  vaccination_c?: number;
  vaccination_d?: number;
  vaccination_e?: number;
  // Cumulative vaccinations administered
  cumulative_vaccination_a?: number;
  cumulative_vaccination_b?: number;
  cumulative_vaccination_c?: number;
  cumulative_vaccination_d?: number;
  cumulative_vaccination_e?: number;

  // Patients occupying an ICU bed
  patients_in_icu_bed_a?: number;
  patients_in_icu_bed_b?: number;
  patients_in_icu_bed_c?: number;
  patients_in_icu_bed_d?: number;

  // Oxygen consumption per day in ICU, in litres
  oxygen_consumption_per_day_in_icu?: number;
  // Oxygen consumption per day in wards, in litres
  oxygen_consumption_per_day_in_wards?: number;
  // Total daily oxygen consumption in wards and ICU, in litres
  total_daily_oxygen_consumption?: number;
  // Total estimated oxygen needed for both ward and ICU patients during the entire run, in litres
  total_oxygen_used?: number;
  // Number of morgue spaces made available for deceased pandemic patients, based on pre-allocated proportion of normal (peacetime) morgue capacity
  pandemic_morgue_capacity?: number;
}

export interface IModellingExplorationChart {
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: LinearLog;
  viewBy: 'scenario' | 'indicator';
  isCollapsed?: boolean;
  values: string[];
  plotlines: string[];
  series?: any[];
  comparisonSeries?: any[];
  plotlineData?: {
    type: LinearLog;
    plotLines: any[];
  };
  comparisonPlotlineData?: {
    type: LinearLog;
    plotLines: any[];
  };
  indicators?: {
    title: string;
    series: any[];
  }[];
}

export interface IModellingExplorationChartData {
  chart_type: 'spline' | 'column' | 'area';
  chart_plot_type: LinearLog;
  view_by: 'scenario' | 'indicator';
  values: string[];
  plotlines: string[];
}

export interface IModellingScenarioWithDayResultsDataEntity {
  id: string;
  userId: string;
  modelId: string;
  previousConfigScenarioId?: string;
  comparisonScenarioId?: string;
  comparisonScenarioName?: string;
  name: string;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  result_summary?: IModellingScenarioResultSummary;
  sections_order?: string[];
  day_results: IModellingScenarioDayResultDataEntity[];
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
}

export interface IModellingScenarioProcessedDayResult {
  [key: string]: number[];
}

export interface IModellingScenarioWithDayResultsDataEntityPayload {
  userId: string;
  modelId: string;
  previousConfigScenarioId?: string;
  comparisonScenarioId?: string;
  comparisonScenarioName?: string;
  name: string;
  date: string;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  result_summary?: IModellingScenarioResultSummary;
  sections_order?: string[];
  day_results: IModellingScenarioDayResultDataEntity[];
  processed_results?: IModellingScenarioProcessedDayResult;
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
}

export const ModellingScenarioDayResults = {
  ActualCasesA: 'actual_cases_a',
  ActualCasesB: 'actual_cases_b',
  ActualCasesC: 'actual_cases_c',
  ActualCasesD: 'actual_cases_d',
  ActualCasesE: 'actual_cases_e',
  TotalInHospitalA: 'total_in_hospital_a',
  TotalInHospitalB: 'total_in_hospital_b',
  TotalInHospitalC: 'total_in_hospital_c',
  TotalInHospitalD: 'total_in_hospital_d',
  HospitalAdmissionsA: 'hospital_admissions_a',
  HospitalAdmissionsB: 'hospital_admissions_b',
  HospitalAdmissionsC: 'hospital_admissions_c',
  HospitalAdmissionsD: 'hospital_admissions_d',
  HospitalDischargesA: 'hospital_discharges_a',
  HospitalDischargesB: 'hospital_discharges_b',
  HospitalDischargesC: 'hospital_discharges_c',
  HospitalDischargesD: 'hospital_discharges_d',
  ICUAdmissionsA: 'icu_admissions_a',
  ICUAdmissionsB: 'icu_admissions_b',
  ICUAdmissionsC: 'icu_admissions_c',
  ICUAdmissionsD: 'icu_admissions_d',
  ICUDischargesA: 'icu_discharges_a',
  ICUDischargesB: 'icu_discharges_b',
  ICUDischargesC: 'icu_discharges_c',
  ICUDischargesD: 'icu_discharges_d',
  DeathsInHospitalA: 'deaths_in_hospital_a',
  DeathsInHospitalB: 'deaths_in_hospital_b',
  DeathsInHospitalC: 'deaths_in_hospital_c',
  DeathsInHospitalD: 'deaths_in_hospital_d',
  Beds: 'beds',
  OccupiedWardBeds: 'occupied_ward_beds',
  PhysicalWardBedsAvailable: 'physical_ward_beds_available',
  ExpectedBedsFreed: 'expected_beds_freed',
  PatientsWaitingForWardBedA: 'patients_waiting_for_ward_bed_a',
  PatientsWaitingForWardBedB: 'patients_waiting_for_ward_bed_b',
  PatientsWaitingForWardBedC: 'patients_waiting_for_ward_bed_c',
  PatientsWaitingForWardBedD: 'patients_waiting_for_ward_bed_d',
  InWardOverflowA: 'in_ward_overflow_a',
  InWardOverflowB: 'in_ward_overflow_b',
  InWardOverflowC: 'in_ward_overflow_c',
  InWardOverflowD: 'in_ward_overflow_d',
  PhysicalWardBedsNeeded: 'physical_ward_beds_needed',
  PhysicalWardBedsGap: 'physical_ward_beds_gap',
  MaxAvailableNurses: 'max_available_nurses',
  AbsentNurses: 'absent_nurses',
  NursesAtWork: 'nurses_at_work',
  OccupiedNurses: 'occupied_nurses',
  AvailableNurses: 'available_nurses',
  ExpectedNursesFreed: 'expected_nurses_freed',
  TotalNursesNeededForIncomingPatients: 'total_nurses_needed_for_incoming_patients',
  NursesGap: 'nurses_gap',
  ExtraStaffNeededForOverflowPatients: 'extra_staff_needed_for_overflow_patients',
  StaffedWardBedsAvailable: 'staffed_ward_beds_available',
  StaffedWardBedsNeeded: 'staffed_ward_beds_needed',
  StaffedWardBedsGap: 'staffed_ward_beds_gap',
  WardAdmissionsA: 'ward_admissions_a',
  WardAdmissionsB: 'ward_admissions_b',
  WardAdmissionsC: 'ward_admissions_c',
  WardAdmissionsD: 'ward_admissions_d',
  MovingToWardOverflowA: 'moving_to_ward_overflow_a',
  MovingToWardOverflowB: 'moving_to_ward_overflow_b',
  MovingToWardOverflowC: 'moving_to_ward_overflow_c',
  MovingToWardOverflowD: 'moving_to_ward_overflow_d',
  ICUBeds: 'icu_beds',
  OccupiedICUBeds: 'occupied_icu_beds',
  PhysicalICUBedsAvailable: 'physical_icu_beds_available',
  ExpectedICUBedsFreed: 'expected_icu_beds_freed',
  PatientsWaitingForICUA: 'patients_waiting_for_icu_a',
  PatientsWaitingForICUB: 'patients_waiting_for_icu_b',
  PatientsWaitingForICUC: 'patients_waiting_for_icu_c',
  PatientsWaitingForICUD: 'patients_waiting_for_icu_d',
  InICUOverflowA: 'in_icu_overflow_a',
  InICUOverflowB: 'in_icu_overflow_b',
  InICUOverflowC: 'in_icu_overflow_c',
  InICUOverflowD: 'in_icu_overflow_d',
  PhysicalICUBedsNeeded: 'physical_icu_beds_needed',
  PhysicalICUBedsGap: 'physical_icu_beds_gap',
  MaxAvailableICUNurses: 'max_available_icu_nurses',
  AbsentICUNurses: 'absent_icu_nurses',
  ICUNursesAtWork: 'icu_nurses_at_work',
  OccupiedICUNurses: 'occupied_icu_nurses',
  AvailableICUNurses: 'available_icu_nurses',
  ExpectedICUNursesFreed: 'expected_icu_nurses_freed',
  TotalICUNursesNeededForIncomingPatients: 'total_icu_nurses_needed_for_incoming_patients',
  ICUNursesGap: 'icu_nurses_gap',
  StaffedEquippedICUBedsAvailable: 'staffed_equipped_icu_beds_available',
  StaffedEquippedICUBedsNeeded: 'staffed_equipped_icu_beds_needed',
  StaffedEquippedICUBedsGap: 'staffed_equipped_icu_beds_gap',
  MovingToICUOverflowA: 'moving_to_icu_overflow_a',
  MovingToICUOverflowB: 'moving_to_icu_overflow_b',
  MovingToICUOverflowC: 'moving_to_icu_overflow_c',
  MovingToICUOverflowD: 'moving_to_icu_overflow_d',
  AtRiskOfDyingFromLackOfICUA: 'at_risk_of_dying_from_lack_of_icu_a',
  AtRiskOfDyingFromLackOfICUB: 'at_risk_of_dying_from_lack_of_icu_b',
  AtRiskOfDyingFromLackOfICUC: 'at_risk_of_dying_from_lack_of_icu_c',
  AtRiskOfDyingFromLackOfICUD: 'at_risk_of_dying_from_lack_of_icu_d',
  VentilatorsInStock: 'ventilators_in_stock',
  VentilatorsInUse: 'ventilators_in_use',
  VentilatorsAvailable: 'ventilators_available',
  ExpectedVentilatorsFreed: 'expected_ventilators_freed',
  VentilatorsNeededForIncomingICUPatients: 'ventilators_needed_for_incoming_icu_patients',
  GapInVentilators: 'gap_in_ventilators',
  PandemicPPEStock: 'pandemic_ppe_stock',
  PPENeeded: 'ppe_needed',
  PPEGap: 'ppe_gap',
  TotalPPEUsed: 'total_ppe_used',
  InterruptedPPESupply: 'interrupted_ppe_supply',
  TotalNeededICUA: 'total_needed_icu_a',
  TotalNeededICUB: 'total_needed_icu_b',
  TotalNeededICUC: 'total_needed_icu_c',
  TotalNeededICUD: 'total_needed_icu_d',
  TotalICUAdmissionsA: 'total_icu_admissions_a',
  TotalICUAdmissionsB: 'total_icu_admissions_b',
  TotalICUAdmissionsC: 'total_icu_admissions_c',
  TotalICUAdmissionsD: 'total_icu_admissions_d',
  TotalNeededWardBedA: 'total_needed_ward_bed_a',
  TotalNeededWardBedB: 'total_needed_ward_bed_b',
  TotalNeededWardBedC: 'total_needed_ward_bed_c',
  TotalNeededWardBedD: 'total_needed_ward_bed_d',
  TotalWardAdmissionsA: 'total_ward_admissions_a',
  TotalWardAdmissionsB: 'total_ward_admissions_b',
  TotalWardAdmissionsC: 'total_ward_admissions_c',
  TotalWardAdmissionsD: 'total_ward_admissions_d',
  PotentialDeathsDueToLackOfICUA: 'potential_deaths_due_to_lack_of_icu_a',
  PotentialDeathsDueToLackOfICUB: 'potential_deaths_due_to_lack_of_icu_b',
  PotentialDeathsDueToLackOfICUC: 'potential_deaths_due_to_lack_of_icu_c',
  PotentialDeathsDueToLackOfICUD: 'potential_deaths_due_to_lack_of_icu_d',
  TotalDeathsA: 'total_deaths_a',
  TotalDeathsB: 'total_deaths_b',
  TotalDeathsC: 'total_deaths_c',
  TotalDeathsD: 'total_deaths_d',
  PeakICUDemand: 'peak_icu_demand',
  PeakDemandICUBeds: 'peak_demand_icu_beds',
  PeakDemandICUNurses: 'peak_demand_icu_nurses',
  PeakDemandVentilators: 'peak_demand_ventilators',
  PeakWardDemand: 'peak_ward_demand',
  PeakDemandWardBeds: 'peak_demand_ward_beds',
  PeakDemandNurses: 'peak_demand_nurses',
  PeakDemandPPE: 'peak_demand_ppe',
  ActivateSurgeStrategy1: 'activate_surge_strategy_1',
  ActivateSurgeStrategy2: 'activate_surge_strategy_2',
  ActivateSurgeStrategy3: 'activate_surge_strategy_3',
  ActivateSurgeStrategy4: 'activate_surge_strategy_4',
  AttackRateA: 'attack_rate_a',
  AttackRateB: 'attack_rate_b',
  AttackRateC: 'attack_rate_c',
  AttackRateD: 'attack_rate_d',
  AttackRateE: 'attack_rate_e',
  VaccinationCapacity: 'vaccination_capacity',
  ContactTracingCapacity: 'contact_tracing_capacity',
  TestingCapacity: 'testing_capacity',
  MobilityIndex: 'mobility_index',
  DeathsInICUA: 'deaths_in_icu_a',
  DeathsInICUB: 'deaths_in_icu_b',
  DeathsInICUC: 'deaths_in_icu_c',
  DeathsInICUD: 'deaths_in_icu_d',
  ConfirmedCasesA: 'confirmed_cases_a',
  ConfirmedCasesB: 'confirmed_cases_b',
  ConfirmedCasesC: 'confirmed_cases_c',
  ConfirmedCasesD: 'confirmed_cases_d',
  ConfirmedCasesE: 'confirmed_cases_e',
  PandemicWardDemandFactor: 'pandemic_ward_demand_factor',
  PandemicICUDemandFactor: 'pandemic_icu_demand_factor',
  StressCode: 'stress_code',
  TotalInitialWardBedCapacity: 'total_initial_ward_bed_capacity',
  InitialPandemicWardBedCapacity: 'initial_pandemic_ward_bed_capacity',
  TotalInitialICUBedCapacity: 'total_initial_icu_bed_capacity',
  InitialPandemicICUBedCapacity: 'initial_pandemic_icu_bed_capacity',
  DeceasedMovedToMorgue: 'deceased_moved_to_morgue',
  DeceasedMovedToTemporaryMorgues: 'deceased_moved_to_temporary_morgues',
  MaxAvailablePhysicians: 'max_available_physicians',
  AbsentPhysicians: 'absent_physicians',
  PhysiciansAtWork: 'physicians_at_work',
  InMorgues: 'in_morgues',
  InTemporaryMorgues: 'in_temporary_morgues',
  AntiviralsAdministeredA: 'antivirals_administered_a',
  AntiviralsAdministeredB: 'antivirals_administered_b',
  AntiviralsAdministeredC: 'antivirals_administered_c',
  AntiviralsAdministeredD: 'antivirals_administered_d',
  PreviousVaccinesAdministeredA: 'previous_vaccines_administered_a',
  PreviousVaccinesAdministeredB: 'previous_vaccines_administered_b',
  PreviousVaccinesAdministeredC: 'previous_vaccines_administered_c',
  PreviousVaccinesAdministeredD: 'previous_vaccines_administered_d',
  CumulativeCasesA: 'cumulative_cases_a',
  CumulativeCasesB: 'cumulative_cases_b',
  CumulativeCasesC: 'cumulative_cases_c',
  CumulativeCasesD: 'cumulative_cases_d',
  CumulativeCasesE: 'cumulative_cases_e',
  TotalAdmissionsA: 'total_admissions_a',
  TotalAdmissionsB: 'total_admissions_b',
  TotalAdmissionsC: 'total_admissions_c',
  TotalAdmissionsD: 'total_admissions_d',
  PeakWardDemandFactor: 'peak_ward_demand_factor',
  PeakICUDemandFactor: 'peak_icu_demand_factor',
  CumulativeConfirmedCasesA: 'cumulative_confirmed_cases_a',
  CumulativeConfirmedCasesB: 'cumulative_confirmed_cases_b',
  CumulativeConfirmedCasesC: 'cumulative_confirmed_cases_c',
  CumulativeConfirmedCasesD: 'cumulative_confirmed_cases_d',
  CumulativeConfirmedCasesE: 'cumulative_confirmed_cases_e',
  NeedICUA: 'need_icu_a',
  NeedICUB: 'need_icu_b',
  NeedICUC: 'need_icu_c',
  NeedICUD: 'need_icu_d',
  NeedWardBedA: 'need_ward_bed_a',
  NeedWardBedB: 'need_ward_bed_b',
  NeedWardBedC: 'need_ward_bed_c',
  NeedWardBedD: 'need_ward_bed_d',
  TotalExpectedDeaths: 'total_expected_deaths',
  WardNurseAbsenteeismRate: 'ward_nurse_absenteeism_rate',
  ICUNurseAbsenteeismRate: 'icu_nurse_absenteeism_rate',
  AllNursesAbsenteeismRate: 'all_nurses_absenteeism_rate',
  TotalUnableToAccessWardBed: 'total_unable_to_access_ward_bed',
  TotalUnableToAccessICU: 'total_unable_to_access_icu',
  VaccinationA: 'vaccination_a',
  VaccinationB: 'vaccination_b',
  VaccinationC: 'vaccination_c',
  VaccinationD: 'vaccination_d',
  VaccinationE: 'vaccination_e',
  CumulativeVaccinationA: 'cumulative_vaccination_a',
  CumulativeVaccinationB: 'cumulative_vaccination_b',
  CumulativeVaccinationC: 'cumulative_vaccination_c',
  CumulativeVaccinationD: 'cumulative_vaccination_d',
  CumulativeVaccinationE: 'cumulative_vaccination_e',
  PatientsInICUBedA: 'patients_in_icu_bed_a',
  PatientsInICUBedB: 'patients_in_icu_bed_b',
  PatientsInICUBedC: 'patients_in_icu_bed_c',
  PatientsInICUBedD: 'patients_in_icu_bed_d',
  OxygenConsumptionPerDayInICU: 'oxygen_consumption_per_day_in_icu',
  OxygenConsumptionPerDayInWards: 'oxygen_consumption_per_day_in_wards',
  TotalDailyOxygenConsumption: 'total_daily_oxygen_consumption',
  TotalOxygenUsed: 'total_oxygen_used',
  PandemicMorgueCapacity: 'pandemic_morgue_capacity'
};
type scenarioDayResult = typeof ModellingScenarioDayResults;
export type ModellingScenarioDayResult = scenarioDayResult[keyof scenarioDayResult];

interface IModellingScenarioDayResultsData {
  label: string;
  ageLabel?: string;
  category: string;
  subcategory?: string;
}

export const ModellingScenarioDayResultsDataMap: Map<string, IModellingScenarioDayResultsData> = new Map([
  // General indicators
  [ModellingScenarioDayResults.ActualCasesA, {
    label: 'Actual cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ActualCasesB, {
    label: 'Actual cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ActualCasesC, {
    label: 'Actual cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ActualCasesD, {
    label: 'Actual cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ActualCasesE, {
    label: 'Actual cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeCasesA, {
    label: 'Cumulative cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeCasesB, {
    label: 'Cumulative cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeCasesC, {
    label: 'Cumulative cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeCasesD, {
    label: 'Cumulative cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeCasesE, {
    label: 'Cumulative cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ConfirmedCasesA, {
    label: 'Confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ConfirmedCasesB, {
    label: 'Confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ConfirmedCasesC, {
    label: 'Confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ConfirmedCasesD, {
    label: 'Confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ConfirmedCasesE, {
    label: 'Confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesA, {
    label: 'Cumulative confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesB, {
    label: 'Cumulative confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesC, {
    label: 'Cumulative confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesD, {
    label: 'Cumulative confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesE, {
    label: 'Cumulative confirmed cases',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.TestingCapacity, {
    label: 'Testing capacity',
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.ContactTracingCapacity, {
    label: 'Contact tracing capacity',
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.VaccinationCapacity, {
    label: 'Vaccination capacity',
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.AttackRateA, {
    label: 'Attack rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.AttackRateB, {
    label: 'Attack rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.AttackRateC, {
    label: 'Attack rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.AttackRateD, {
    label: 'Attack rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.AttackRateE, {
    label: 'Attack rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'General indicators'
  }],
  [ModellingScenarioDayResults.MobilityIndex, {
    label: 'Mobility index',
    category: 'General indicators'
  }],

  // Vaccinations
  [ModellingScenarioDayResults.VaccinationA, {
    label: 'Vaccination rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.VaccinationB, {
    label: 'Vaccination rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.VaccinationC, {
    label: 'Vaccination rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.VaccinationD, {
    label: 'Vaccination rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.VaccinationE, {
    label: 'Vaccination rate',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationA, {
    label: 'Cumulative vaccinations',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationB, {
    label: 'Cumulative vaccinations',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationC, {
    label: 'Cumulative vaccinations',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationD, {
    label: 'Cumulative vaccinations',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Vaccinations'
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationE, {
    label: 'Cumulative vaccinations',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['e'],
    category: 'Vaccinations'
  }],

  // Therapeutics
  [ModellingScenarioDayResults.AntiviralsAdministeredA, {
    label: 'Antivirals administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredB, {
    label: 'Antivirals administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredC, {
    label: 'Antivirals administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredD, {
    label: 'Antivirals administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredA, {
    label: 'Previous vaccines administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredB, {
    label: 'Previous vaccines administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredC, {
    label: 'Previous vaccines administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Therapeutics'
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredD, {
    label: 'Previous vaccines administered',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Therapeutics'
  }],

  // Hospital indicators
  [ModellingScenarioDayResults.TotalInHospitalA, {
    label: 'Total in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.TotalInHospitalB, {
    label: 'Total in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.TotalInHospitalC, {
    label: 'Total in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.TotalInHospitalD, {
    label: 'Total in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsA, {
    label: 'Hospital admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsB, {
    label: 'Hospital admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsC, {
    label: 'Hospital admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsD, {
    label: 'Hospital admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalDischargesA, {
    label: 'Hospital discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalDischargesB, {
    label: 'Hospital discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalDischargesC, {
    label: 'Hospital discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.HospitalDischargesD, {
    label: 'Hospital discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedICUA, {
    label: 'Need ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedICUB, {
    label: 'Need ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedICUC, {
    label: 'Need ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedICUD, {
    label: 'Need ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedWardBedA, {
    label: 'Need ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedWardBedB, {
    label: 'Need ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedWardBedC, {
    label: 'Need ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.NeedWardBedD, {
    label: 'Need ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.TotalExpectedDeaths, {
    label: 'Total expected deaths',
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.DeathsInHospitalA, {
    label: 'Deaths in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.DeathsInHospitalB, {
    label: 'Deaths in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.DeathsInHospitalC, {
    label: 'Deaths in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital indicators'
  }],
  [ModellingScenarioDayResults.DeathsInHospitalD, {
    label: 'Deaths in hospital',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital indicators'
  }],

  // ICU
  [ModellingScenarioDayResults.MaxAvailableICUNurses, {
    label: 'Max available ICU nurses',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.AbsentICUNurses, {
    label: 'Absent ICU nurses',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ICUNursesAtWork, {
    label: 'ICU nurses at work',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.OccupiedICUNurses, {
    label: 'Occupied ICU nurses',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.AvailableICUNurses, {
    label: 'Available ICU nurses',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ExpectedICUNursesFreed, {
    label: 'Expected ICU nurses freed',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ICUNursesGap, {
    label: 'ICU nurses gap',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.TotalICUNursesNeededForIncomingPatients, {
    label: 'Total ICU nurses needed for incoming patients',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ICUNurseAbsenteeismRate, {
    label: 'ICU nurse absenteeism rate',
    category: 'ICU',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ICUBeds, {
    label: 'ICU beds',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.OccupiedICUBeds, {
    label: 'Occupied ICU beds',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsAvailable, {
    label: 'Physical ICU beds available',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.ExpectedICUBedsFreed, {
    label: 'Expected ICU beds freed',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsNeeded, {
    label: 'Physical ICU beds needed',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsGap, {
    label: 'Physical ICU beds gap',
    category: 'ICU',
    subcategory: 'Physical ICU beds'
  }],
  [ModellingScenarioDayResults.TotalInitialICUBedCapacity, {
    label: 'Total initial ICU bed capacity',
    category: 'ICU',
    subcategory: 'Staffed equipped ICU beds'
  }],
  [ModellingScenarioDayResults.InitialPandemicICUBedCapacity, {
    label: 'Initial pandemic ICU bed capacity',
    category: 'ICU',
    subcategory: 'Staffed equipped ICU beds'
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable, {
    label: 'Staffed equipped ICU beds available',
    category: 'ICU',
    subcategory: 'Staffed equipped ICU beds'
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsNeeded, {
    label: 'Staffed equipped ICU beds needed',
    category: 'ICU',
    subcategory: 'Staffed equipped ICU beds'
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsGap, {
    label: 'Staffed equipped ICU beds gap',
    category: 'ICU',
    subcategory: 'Staffed equipped ICU beds'
  }],
  [ModellingScenarioDayResults.ICUAdmissionsA, {
    label: 'ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUAdmissionsB, {
    label: 'ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUAdmissionsC, {
    label: 'ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUAdmissionsD, {
    label: 'ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUDischargesA, {
    label: 'ICU discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUDischargesB, {
    label: 'ICU discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUDischargesC, {
    label: 'ICU discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ICUDischargesD, {
    label: 'ICU discharges',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InICUOverflowA, {
    label: 'In ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InICUOverflowB, {
    label: 'In ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InICUOverflowC, {
    label: 'In ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InICUOverflowD, {
    label: 'In ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsInICUBedA, {
    label: 'Patients in ICU bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsInICUBedB, {
    label: 'Patients in ICU bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsInICUBedC, {
    label: 'Patients in ICU bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsInICUBedD, {
    label: 'Patients in ICU bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUA, {
    label: 'Patients waiting for ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUB, {
    label: 'Patients waiting for ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUC, {
    label: 'Patients waiting for ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUD, {
    label: 'Patients waiting for ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowA, {
    label: 'Moving to ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowB, {
    label: 'Moving to ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowC, {
    label: 'Moving to ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowD, {
    label: 'Moving to ICU overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUA, {
    label: 'At risk of dying from lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUB, {
    label: 'At risk of dying from lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUC, {
    label: 'At risk of dying from lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUD, {
    label: 'At risk of dying from lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.DeathsInICUA, {
    label: 'Deaths in ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.DeathsInICUB, {
    label: 'Deaths in ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.DeathsInICUC, {
    label: 'Deaths in ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],
  [ModellingScenarioDayResults.DeathsInICUD, {
    label: 'Deaths in ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'ICU',
    subcategory: 'ICU deaths'
  }],

  // Ward
  [ModellingScenarioDayResults.MaxAvailableNurses, {
    label: 'Max available nurses',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.AbsentNurses, {
    label: 'Absent nurses',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.NursesAtWork, {
    label: 'Nurses at work',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.AvailableNurses, {
    label: 'Available nurses',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.ExpectedNursesFreed, {
    label: 'Expected nurses freed',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.OccupiedNurses, {
    label: 'Occupied nurses',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.NursesGap, {
    label: 'Nurses gap',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.TotalNursesNeededForIncomingPatients, {
    label: 'Total nurses needed for incoming patients',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.WardNurseAbsenteeismRate, {
    label: 'Ward nurse absenteeism rate',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.AllNursesAbsenteeismRate, {
    label: 'All nurses absenteeism rate',
    category: 'Ward',
    subcategory: 'Nurses'
  }],
  [ModellingScenarioDayResults.Beds, {
    label: 'Beds',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.OccupiedWardBeds, {
    label: 'Occupied ward beds',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsAvailable, {
    label: 'Physical ward beds available',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.ExpectedBedsFreed, {
    label: 'Expected beds freed',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsNeeded, {
    label: 'Physical ward beds needed',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsGap, {
    label: 'Physical ward beds gap',
    category: 'Ward',
    subcategory: 'Physical beds'
  }],
  [ModellingScenarioDayResults.TotalInitialWardBedCapacity, {
    label: 'Total initial ward bed capacity',
    category: 'Ward',
    subcategory: 'Staffed ward beds'
  }],
  [ModellingScenarioDayResults.InitialPandemicWardBedCapacity, {
    label: 'Initial pandemic ward bed capacity',
    category: 'Ward',
    subcategory: 'Staffed ward beds'
  }],
  [ModellingScenarioDayResults.StaffedWardBedsAvailable, {
    label: 'Staffed ward beds available',
    category: 'Ward',
    subcategory: 'Staffed ward beds'
  }],
  [ModellingScenarioDayResults.StaffedWardBedsNeeded, {
    label: 'Staffed ward beds needed',
    category: 'Ward',
    subcategory: 'Staffed ward beds'
  }],
  [ModellingScenarioDayResults.StaffedWardBedsGap, {
    label: 'Staffed ward beds gap',
    category: 'Ward',
    subcategory: 'Staffed ward beds'
  }],
  [ModellingScenarioDayResults.WardAdmissionsA, {
    label: 'Ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.WardAdmissionsB, {
    label: 'Ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.WardAdmissionsC, {
    label: 'Ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.WardAdmissionsD, {
    label: 'Ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedA, {
    label: 'Patient waiting for ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedB, {
    label: 'Patient waiting for ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedC, {
    label: 'Patient waiting for ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedD, {
    label: 'Patient waiting for ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowA, {
    label: 'Moving to ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowB, {
    label: 'Moving to ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowC, {
    label: 'Moving to ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowD, {
    label: 'Moving to ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InWardOverflowA, {
    label: 'In ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InWardOverflowB, {
    label: 'In ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InWardOverflowC, {
    label: 'In ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.InWardOverflowD, {
    label: 'In ward overflow',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Ward',
    subcategory: 'Patients'
  }],
  [ModellingScenarioDayResults.ExtraStaffNeededForOverflowPatients, {
    label: 'Extra staff needed for overflow patients',
    category: 'Ward',
    subcategory: 'Patients'
  }],

  // PPE
  [ModellingScenarioDayResults.PandemicPPEStock, {
    label: 'Pandemic PPE Stock',
    category: 'PPE'
  }],
  [ModellingScenarioDayResults.PPENeeded, {
    label: 'PPE needed',
    category: 'PPE'
  }],
  [ModellingScenarioDayResults.PPEGap, {
    label: 'PPE gap',
    category: 'PPE'
  }],
  [ModellingScenarioDayResults.TotalPPEUsed, {
    label: 'Total PPE used',
    category: 'PPE'
  }],
  [ModellingScenarioDayResults.InterruptedPPESupply, {
    label: 'Interrupted PPE supply',
    category: 'PPE'
  }],

  // Ventilators
  [ModellingScenarioDayResults.VentilatorsInStock, {
    label: 'Ventilators in stock',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.VentilatorsInUse, {
    label: 'Ventilators in use',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.VentilatorsAvailable, {
    label: 'Ventilators available',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.ExpectedVentilatorsFreed, {
    label: 'Expected ventilators freed',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.VentilatorsNeededForIncomingICUPatients, {
    label: 'Ventilators needed for incoming ICU patients',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.GapInVentilators, {
    label: 'Gap in ventilators',
    category: 'Ventilators'
  }],
  [ModellingScenarioDayResults.OxygenConsumptionPerDayInICU, {
    label: 'Oxygen consumption per day in ICU',
    category: 'Oxygen'
  }],
  [ModellingScenarioDayResults.OxygenConsumptionPerDayInWards, {
    label: 'Oxygen consumption per day in wards',
    category: 'Oxygen'
  }],
  [ModellingScenarioDayResults.TotalDailyOxygenConsumption, {
    label: 'Total daily oxygen consumption',
    category: 'Oxygen'
  }],
  [ModellingScenarioDayResults.TotalOxygenUsed, {
    label: 'Total oxygen used',
    category: 'Oxygen'
  }],

  // Hospital peaks
  [ModellingScenarioDayResults.PeakICUDemand, {
    label: 'Peak ICU demand',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandICUBeds, {
    label: 'Peak demand ICU beds',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandICUNurses, {
    label: 'Peak demand ICU nurses',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandVentilators, {
    label: 'Peak demand ventilators',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakWardDemand, {
    label: 'Peak ward demand',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandWardBeds, {
    label: 'Peak demand ward beds',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandNurses, {
    label: 'Peak demand nurses',
    category: 'Hospital peaks'
  }],
  [ModellingScenarioDayResults.PeakDemandPPE, {
    label: 'Peak demand PPE',
    category: 'Hospital peaks'
  }],

  // Hospital totals
  [ModellingScenarioDayResults.TotalAdmissionsA, {
    label: 'Total admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalAdmissionsB, {
    label: 'Total admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalAdmissionsC, {
    label: 'Total admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalAdmissionsD, {
    label: 'Total admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsA, {
    label: 'Total ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsB, {
    label: 'Total ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsC, {
    label: 'Total ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsD, {
    label: 'Total ward admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsA, {
    label: 'Total ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsB, {
    label: 'Total ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsC, {
    label: 'Total ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsD, {
    label: 'Total ICU admissions',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededICUA, {
    label: 'Total needed ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededICUB, {
    label: 'Total needed ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededICUC, {
    label: 'Total needed ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededICUD, {
    label: 'Total needed ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalDeathsA, {
    label: 'Total deaths',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalDeathsB, {
    label: 'Total deaths',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalDeathsC, {
    label: 'Total deaths',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalDeathsD, {
    label: 'Total deaths',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUA, {
    label: 'Potential deaths due to lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUB, {
    label: 'Potential deaths due to lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUC, {
    label: 'Potential deaths due to lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUD, {
    label: 'Potential deaths due to lack of ICU',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedA, {
    label: 'Total needed ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['a'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedB, {
    label: 'Total needed ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['b'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedC, {
    label: 'Total needed ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['c'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedD, {
    label: 'Total needed ward bed',
    ageLabel: ModellingModelParameterValueAgeTypeLabels['d'],
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalUnableToAccessWardBed, {
    label: 'Total unable to access ward bed',
    category: 'Hospital totals'
  }],
  [ModellingScenarioDayResults.TotalUnableToAccessICU, {
    label: 'Total unable to access ICU',
    category: 'Hospital totals'
  }],

  // Morgue
  [ModellingScenarioDayResults.InMorgues, {
    label: 'In morgues',
    category: 'Morgue'
  }],
  [ModellingScenarioDayResults.PandemicMorgueCapacity, {
    label: 'Pandemic Morgue Capacity',
    category: 'Morgue'
  }],
  [ModellingScenarioDayResults.InTemporaryMorgues, {
    label: 'In temporary morgues',
    category: 'Morgue'
  }],
  [ModellingScenarioDayResults.DeceasedMovedToMorgue, {
    label: 'Deceased moved to morgue',
    category: 'Morgue'
  }],
  [ModellingScenarioDayResults.DeceasedMovedToTemporaryMorgues, {
    label: 'Deceased moved to temporary morgue',
    category: 'Morgue'
  }],

  // Physicians
  [ModellingScenarioDayResults.MaxAvailablePhysicians, {
    label: 'Max available physicians',
    category: 'Physicians'
  }],
  [ModellingScenarioDayResults.AbsentPhysicians, {
    label: 'Absent physicians',
    category: 'Physicians'
  }],
  [ModellingScenarioDayResults.PhysiciansAtWork, {
    label: 'Physicians at work',
    category: 'Physicians'
  }],

  // Stress indicators
  [ModellingScenarioDayResults.PandemicWardDemandFactor, {
    label: 'Pandemic ward demand factor',
    category: 'Stress indicators'
  }],
  [ModellingScenarioDayResults.PeakWardDemandFactor, {
    label: 'Peak ward demand factor',
    category: 'Stress indicators'
  }],
  [ModellingScenarioDayResults.PandemicICUDemandFactor, {
    label: 'Pandemic ICU demand factor',
    category: 'Stress indicators'
  }],
  [ModellingScenarioDayResults.PeakICUDemandFactor, {
    label: 'Peak ICU demand factor',
    category: 'Stress indicators'
  }],
  [ModellingScenarioDayResults.StressCode, {
    label: 'Stress code',
    category: 'Stress indicators'
  }],

  // Surge strategies activated
  [ModellingScenarioDayResults.ActivateSurgeStrategy1, {
    label: 'Activate surge strategy 1',
    category: 'Surge strategies activated'
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy2, {
    label: 'Activate surge strategy 2',
    category: 'Surge strategies activated'
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy3, {
    label: 'Activate surge strategy 3',
    category: 'Surge strategies activated'
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy4, {
    label: 'Activate surge strategy 4',
    category: 'Surge strategies activated'
  }]
]);
