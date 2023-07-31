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
import { IModellingScenarioWithDayResults } from '../../interfaces/modelling';
import {
  IModellingModel,
  IModellingModelParameterValue,
  ModellingModel,
  ModellingModelParameterCategories,
  ModellingModelParameterValueAgeType,
  ModellingModelParameterValueAgeTypes
} from '../../models/modellingModel';
import { IModellingScenario, IModellingScenarioParameterValue, ModellingScenario } from '../../models/modellingScenario';
import axios from 'axios';
import { App } from '../../app';
import { IModellingScenarioDayResult, ModellingScenarioDayResult } from '../../models/modellingScenarioDayResult';
import _ from 'lodash';

//Get modelling url; strip last "/" if given
const modellingConfig = App.serviceConfig.modelling as { url: string };
const modellingURL = modellingConfig.url.lastIndexOf('/') === modellingConfig.url.length - 1 ?
  modellingConfig.url.substring(0, modellingConfig.url.length - 1) :
  modellingConfig.url;

//Enum of model parameters that have 'Data' as category
const ModellingModelDataParameterKeys  = {
  PopulationSize: 'Inputs_Data.Population_size',
  WardBedsPer1K: 'Inputs_Data.ward_beds_per_1K',
  ICUBedsPer100K: 'Inputs_Data.ICU_beds_per_100K',
  WardNursesPer1K: 'Inputs_Data.ward_nurses_per_1K',
  ICUNursesPer100K: 'Inputs_Data.ICU_nurses_per_100K',
  PhysiciansPer100K: 'Inputs_Data.physicians_per_100K',
  VentilatorsPer100K: 'Inputs_Data.ventilators_per_100K',
  MorgueCapacity: 'Inputs_Data.morgue_capacity',
  TargetPPEStock: 'Inputs_Hospital_resource_params.target_PPE_stock',
  AgeSpecificContactRates: 'Inputs_Data.Age_specific_contact_rates'
};

//Mapping of all properties from ModellingScenarioDayResult
const ModellingScenarioDayResultPropertyMap: {[key: string]: { name: string, age?: ModellingModelParameterValueAgeType } } = {
  actual_cases_a: { name: 'Actual_cases', age: ModellingModelParameterValueAgeTypes.A },
  actual_cases_b: { name: 'Actual_cases', age: ModellingModelParameterValueAgeTypes.B },
  actual_cases_c: { name: 'Actual_cases', age: ModellingModelParameterValueAgeTypes.C },
  actual_cases_d: { name: 'Actual_cases', age: ModellingModelParameterValueAgeTypes.D },
  actual_cases_e: { name: 'Actual_cases', age: ModellingModelParameterValueAgeTypes.E },
  total_in_hospital_a: { name: 'total_in_hospital', age: ModellingModelParameterValueAgeTypes.A },
  total_in_hospital_b: { name: 'total_in_hospital', age: ModellingModelParameterValueAgeTypes.B },
  total_in_hospital_c: { name: 'total_in_hospital', age: ModellingModelParameterValueAgeTypes.C },
  total_in_hospital_d: { name: 'total_in_hospital', age: ModellingModelParameterValueAgeTypes.D },
  hospital_admissions_a: { name: 'hospital_admissions', age: ModellingModelParameterValueAgeTypes.A },
  hospital_admissions_b: { name: 'hospital_admissions', age: ModellingModelParameterValueAgeTypes.B },
  hospital_admissions_c: { name: 'hospital_admissions', age: ModellingModelParameterValueAgeTypes.C },
  hospital_admissions_d: { name: 'hospital_admissions', age: ModellingModelParameterValueAgeTypes.D },
  hospital_discharges_a: { name: 'hospital_discharges', age: ModellingModelParameterValueAgeTypes.A },
  hospital_discharges_b: { name: 'hospital_discharges', age: ModellingModelParameterValueAgeTypes.B },
  hospital_discharges_c: { name: 'hospital_discharges', age: ModellingModelParameterValueAgeTypes.C },
  hospital_discharges_d: { name: 'hospital_discharges', age: ModellingModelParameterValueAgeTypes.D },
  icu_admissions_a: { name: 'ICU_admissions', age: ModellingModelParameterValueAgeTypes.A },
  icu_admissions_b: { name: 'ICU_admissions', age: ModellingModelParameterValueAgeTypes.B },
  icu_admissions_c: { name: 'ICU_admissions', age: ModellingModelParameterValueAgeTypes.C },
  icu_admissions_d: { name: 'ICU_admissions', age: ModellingModelParameterValueAgeTypes.D },
  icu_discharges_a: { name: 'ICU_discharges', age: ModellingModelParameterValueAgeTypes.A },
  icu_discharges_b: { name: 'ICU_discharges', age: ModellingModelParameterValueAgeTypes.B },
  icu_discharges_c: { name: 'ICU_discharges', age: ModellingModelParameterValueAgeTypes.C },
  icu_discharges_d: { name: 'ICU_discharges', age: ModellingModelParameterValueAgeTypes.D },
  deaths_in_hospital_a: { name: 'deaths_in_hospital', age: ModellingModelParameterValueAgeTypes.A },
  deaths_in_hospital_b: { name: 'deaths_in_hospital', age: ModellingModelParameterValueAgeTypes.B },
  deaths_in_hospital_c: { name: 'deaths_in_hospital', age: ModellingModelParameterValueAgeTypes.C },
  deaths_in_hospital_d: { name: 'deaths_in_hospital', age: ModellingModelParameterValueAgeTypes.D },
  beds: { name: 'Beds' },
  occupied_ward_beds: { name: 'occupied_ward_beds' },
  physical_ward_beds_available: { name: 'physical_ward_beds_available' },
  expected_beds_freed: { name: 'expected_beds_freed' },
  patients_waiting_for_ward_bed_a: { name: 'Patients_Waiting_for_Ward_Bed', age: ModellingModelParameterValueAgeTypes.A },
  patients_waiting_for_ward_bed_b: { name: 'Patients_Waiting_for_Ward_Bed', age: ModellingModelParameterValueAgeTypes.B },
  patients_waiting_for_ward_bed_c: { name: 'Patients_Waiting_for_Ward_Bed', age: ModellingModelParameterValueAgeTypes.C },
  patients_waiting_for_ward_bed_d: { name: 'Patients_Waiting_for_Ward_Bed', age: ModellingModelParameterValueAgeTypes.D },
  in_ward_overflow_a: { name: 'In_Ward_Overflow', age: ModellingModelParameterValueAgeTypes.A },
  in_ward_overflow_b: { name: 'In_Ward_Overflow', age: ModellingModelParameterValueAgeTypes.B },
  in_ward_overflow_c: { name: 'In_Ward_Overflow', age: ModellingModelParameterValueAgeTypes.C },
  in_ward_overflow_d: { name: 'In_Ward_Overflow', age: ModellingModelParameterValueAgeTypes.D },
  physical_ward_beds_needed: { name: 'physical_ward_beds_needed' },
  physical_ward_beds_gap: { name: 'physical_ward_beds_gap' },
  max_available_nurses: { name: 'max_available_nurses' },
  absent_nurses: { name: 'absent_nurses' },
  nurses_at_work: { name: 'nurses_at_work' },
  occupied_nurses: { name: 'occupied_nurses' },
  available_nurses: { name: 'available_nurses' },
  expected_nurses_freed: { name: 'expected_nurses_freed' },
  total_nurses_needed_for_incoming_patients: { name: 'total_nurses_needed_for_incoming_patients' },
  nurses_gap: { name: 'nurses_gap' },
  extra_staff_needed_for_overflow_patients: { name: 'extra_staff_needed_for_overflow_patients' },
  staffed_ward_beds_available: { name: 'staffed_ward_beds_available' },
  staffed_ward_beds_needed: { name: 'staffed_ward_beds_needed' },
  staffed_ward_beds_gap: { name: 'staffed_ward_beds_gap' },
  ward_admissions_a: { name: 'ward_admissions', age: ModellingModelParameterValueAgeTypes.A },
  ward_admissions_b: { name: 'ward_admissions', age: ModellingModelParameterValueAgeTypes.B },
  ward_admissions_c: { name: 'ward_admissions', age: ModellingModelParameterValueAgeTypes.C },
  ward_admissions_d: { name: 'ward_admissions', age: ModellingModelParameterValueAgeTypes.D },
  moving_to_ward_overflow_a: { name: 'moving_to_ward_overflow', age: ModellingModelParameterValueAgeTypes.A },
  moving_to_ward_overflow_b: { name: 'moving_to_ward_overflow', age: ModellingModelParameterValueAgeTypes.B },
  moving_to_ward_overflow_c: { name: 'moving_to_ward_overflow', age: ModellingModelParameterValueAgeTypes.C },
  moving_to_ward_overflow_d: { name: 'moving_to_ward_overflow', age: ModellingModelParameterValueAgeTypes.D },
  icu_beds: { name: 'ICU_Beds' },
  occupied_icu_beds: { name: 'occupied_ICU_beds' },
  physical_icu_beds_available: { name: 'physical_ICU_beds_available' },
  expected_icu_beds_freed: { name: 'expected_ICU_beds_freed' },
  patients_waiting_for_icu_a: { name: 'Patients_Waiting_for_ICU', age: ModellingModelParameterValueAgeTypes.A },
  patients_waiting_for_icu_b: { name: 'Patients_Waiting_for_ICU', age: ModellingModelParameterValueAgeTypes.B },
  patients_waiting_for_icu_c: { name: 'Patients_Waiting_for_ICU', age: ModellingModelParameterValueAgeTypes.C },
  patients_waiting_for_icu_d: { name: 'Patients_Waiting_for_ICU', age: ModellingModelParameterValueAgeTypes.D },
  in_icu_overflow_a: { name: 'In_ICU_Overflow', age: ModellingModelParameterValueAgeTypes.A },
  in_icu_overflow_b: { name: 'In_ICU_Overflow', age: ModellingModelParameterValueAgeTypes.B },
  in_icu_overflow_c: { name: 'In_ICU_Overflow', age: ModellingModelParameterValueAgeTypes.C },
  in_icu_overflow_d: { name: 'In_ICU_Overflow', age: ModellingModelParameterValueAgeTypes.D },
  physical_icu_beds_needed: { name: 'physical_ICU_beds_needed' },
  physical_icu_beds_gap: { name: 'physical_ICU_beds_gap' },
  max_available_icu_nurses: { name: 'max_available_ICU_nurses' },
  absent_icu_nurses: { name: 'absent_ICU_nurses' },
  icu_nurses_at_work: { name: 'ICU_Nurses_at_work' },
  occupied_icu_nurses: { name: 'occupied_ICU_nurses' },
  available_icu_nurses: { name: 'available_ICU_nurses' },
  expected_icu_nurses_freed: { name: 'expected_ICU_nurses_freed' },
  total_icu_nurses_needed_for_incoming_patients: { name: 'total_ICU_nurses_needed_for_incoming_patients' },
  icu_nurses_gap: { name: 'ICU_nurses_gap' },
  staffed_equipped_icu_beds_available: { name: 'staffed_equipped_ICU_beds_available' },
  staffed_equipped_icu_beds_needed: { name: 'staffed_equipped_ICU_beds_needed' },
  staffed_equipped_icu_beds_gap: { name: 'staffed_equipped_ICU_beds_gap' },
  moving_to_icu_overflow_a: { name: 'moving_to_ICU_overflow', age: ModellingModelParameterValueAgeTypes.A },
  moving_to_icu_overflow_b: { name: 'moving_to_ICU_overflow', age: ModellingModelParameterValueAgeTypes.B },
  moving_to_icu_overflow_c: { name: 'moving_to_ICU_overflow', age: ModellingModelParameterValueAgeTypes.C },
  moving_to_icu_overflow_d: { name: 'moving_to_ICU_overflow', age: ModellingModelParameterValueAgeTypes.D },
  at_risk_of_dying_from_lack_of_icu_a: { name: 'at_risk_of_dying_from_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.A },
  at_risk_of_dying_from_lack_of_icu_b: { name: 'at_risk_of_dying_from_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.B },
  at_risk_of_dying_from_lack_of_icu_c: { name: 'at_risk_of_dying_from_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.C },
  at_risk_of_dying_from_lack_of_icu_d: { name: 'at_risk_of_dying_from_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.D },
  ventilators_in_stock: { name: 'ventilators_in_stock' },
  ventilators_in_use: { name: 'ventilators_in_use' },
  ventilators_available: { name: 'ventilators_available' },
  expected_ventilators_freed: { name: 'expected_ventilators_freed' },
  ventilators_needed_for_incoming_icu_patients: { name: 'ventilators_needed_for_incoming_ICU_patients' },
  gap_in_ventilators: { name: 'gap_in_ventilators' },
  pandemic_ppe_stock: { name: 'Pandemic_PPE_Stock' },
  ppe_needed: { name: 'PPE_needed' },
  ppe_gap: { name: 'PPE_gap' },
  total_ppe_used: { name: 'total_PPE_used' },
  interrupted_ppe_supply: { name: 'interrupted_PPE_supply' },
  total_needed_icu_a: { name: 'Total_needed_ICU', age: ModellingModelParameterValueAgeTypes.A },
  total_needed_icu_b: { name: 'Total_needed_ICU', age: ModellingModelParameterValueAgeTypes.B },
  total_needed_icu_c: { name: 'Total_needed_ICU', age: ModellingModelParameterValueAgeTypes.C },
  total_needed_icu_d: { name: 'Total_needed_ICU', age: ModellingModelParameterValueAgeTypes.D },
  total_icu_admissions_a: { name: 'Total_ICU_admissions', age: ModellingModelParameterValueAgeTypes.A },
  total_icu_admissions_b: { name: 'Total_ICU_admissions', age: ModellingModelParameterValueAgeTypes.B },
  total_icu_admissions_c: { name: 'Total_ICU_admissions', age: ModellingModelParameterValueAgeTypes.C },
  total_icu_admissions_d: { name: 'Total_ICU_admissions', age: ModellingModelParameterValueAgeTypes.D },
  total_needed_ward_bed_a: { name: 'Total_needed_Ward_Bed', age: ModellingModelParameterValueAgeTypes.A },
  total_needed_ward_bed_b: { name: 'Total_needed_Ward_Bed', age: ModellingModelParameterValueAgeTypes.B },
  total_needed_ward_bed_c: { name: 'Total_needed_Ward_Bed', age: ModellingModelParameterValueAgeTypes.C },
  total_needed_ward_bed_d: { name: 'Total_needed_Ward_Bed', age: ModellingModelParameterValueAgeTypes.D },
  total_ward_admissions_a: { name: 'Total_Ward_admissions', age: ModellingModelParameterValueAgeTypes.A },
  total_ward_admissions_b: { name: 'Total_Ward_admissions', age: ModellingModelParameterValueAgeTypes.B },
  total_ward_admissions_c: { name: 'Total_Ward_admissions', age: ModellingModelParameterValueAgeTypes.C },
  total_ward_admissions_d: { name: 'Total_Ward_admissions', age: ModellingModelParameterValueAgeTypes.D },
  potential_deaths_due_to_lack_of_icu_a: { name: 'Potential_deaths_due_to_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.A },
  potential_deaths_due_to_lack_of_icu_b: { name: 'Potential_deaths_due_to_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.B },
  potential_deaths_due_to_lack_of_icu_c: { name: 'Potential_deaths_due_to_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.C },
  potential_deaths_due_to_lack_of_icu_d: { name: 'Potential_deaths_due_to_lack_of_ICU', age: ModellingModelParameterValueAgeTypes.D },
  total_deaths_a: { name: 'total_deaths', age: ModellingModelParameterValueAgeTypes.A },
  total_deaths_b: { name: 'total_deaths', age: ModellingModelParameterValueAgeTypes.B },
  total_deaths_c: { name: 'total_deaths', age: ModellingModelParameterValueAgeTypes.C },
  total_deaths_d: { name: 'total_deaths', age: ModellingModelParameterValueAgeTypes.D },
  peak_icu_demand: { name: 'peak_ICU_demand' },
  peak_demand_icu_beds: { name: 'peak_demand_ICU_beds' },
  peak_demand_icu_nurses: { name: 'peak_demand_ICU_nurses' },
  peak_demand_ventilators: { name: 'peak_demand_ventilators' },
  peak_ward_demand: { name: 'peak_ward_demand' },
  peak_demand_ward_beds: { name: 'peak_demand_ward_beds' },
  peak_demand_nurses: { name: 'peak_demand_nurses' },
  peak_demand_ppe: { name: 'peak_demand_PPE' },
  activate_surge_strategy_1: { name: 'activate_surge_strategy_1' },
  activate_surge_strategy_2: { name: 'activate_surge_strategy_2' },
  activate_surge_strategy_3: { name: 'activate_surge_strategy_3' },
  activate_surge_strategy_4: { name: 'activate_surge_strategy_4' },
  attack_rate_a: { name: 'Attack_rate', age: ModellingModelParameterValueAgeTypes.A },
  attack_rate_b: { name: 'Attack_rate', age: ModellingModelParameterValueAgeTypes.B },
  attack_rate_c: { name: 'Attack_rate', age: ModellingModelParameterValueAgeTypes.C },
  attack_rate_d: { name: 'Attack_rate', age: ModellingModelParameterValueAgeTypes.D },
  attack_rate_e: { name: 'Attack_rate', age: ModellingModelParameterValueAgeTypes.E },
  vaccination_capacity: { name: 'Vaccination_capacity' },
  contact_tracing_capacity: { name: 'Contact_tracing_capacity' },
  testing_capacity: { name: 'Testing_capacity' },
  mobility_index: { name: 'Mobility_index' },
  deaths_in_icu_a: { name: 'deaths_in_ICU', age: ModellingModelParameterValueAgeTypes.A },
  deaths_in_icu_b: { name: 'deaths_in_ICU', age: ModellingModelParameterValueAgeTypes.B },
  deaths_in_icu_c: { name: 'deaths_in_ICU', age: ModellingModelParameterValueAgeTypes.C },
  deaths_in_icu_d: { name: 'deaths_in_ICU', age: ModellingModelParameterValueAgeTypes.D },
  confirmed_cases_a: { name: 'Confirmed_cases', age: ModellingModelParameterValueAgeTypes.A },
  confirmed_cases_b: { name: 'Confirmed_cases', age: ModellingModelParameterValueAgeTypes.B },
  confirmed_cases_c: { name: 'Confirmed_cases', age: ModellingModelParameterValueAgeTypes.C },
  confirmed_cases_d: { name: 'Confirmed_cases', age: ModellingModelParameterValueAgeTypes.D },
  confirmed_cases_e: { name: 'Confirmed_cases', age: ModellingModelParameterValueAgeTypes.E },
  pandemic_ward_demand_factor: { name: 'pandemic_ward_demand_factor' },
  pandemic_icu_demand_factor: { name: 'pandemic_ICU_demand_factor' },
  stress_code: { name: 'stress_code' },
  total_initial_ward_bed_capacity: { name: 'total_initial_ward_bed_capacity' },
  initial_pandemic_ward_bed_capacity: { name: 'initial_pandemic_ward_bed_capacity' },
  total_initial_icu_bed_capacity: { name: 'total_initial_ICU_bed_capacity' },
  initial_pandemic_icu_bed_capacity: { name: 'initial_pandemic_ICU_bed_capacity' },
  deceased_moved_to_morgue: { name: 'deceased_moved_to_morgue' },
  deceased_moved_to_temporary_morgues: { name: 'deceased_moved_to_temporary_morgues' },
  max_available_physicians: { name: 'max_available_physicians' },
  absent_physicians: { name: 'absent_physicians' },
  physicians_at_work: { name: 'physicians_at_work' },
  in_morgues: { name: 'In_morgues' },
  in_temporary_morgues: { name: 'In_temporary_morgues' },
  antivirals_administered_a: { name: 'Antivirals_administered', age: ModellingModelParameterValueAgeTypes.A },
  antivirals_administered_b: { name: 'Antivirals_administered', age: ModellingModelParameterValueAgeTypes.B },
  antivirals_administered_c: { name: 'Antivirals_administered', age: ModellingModelParameterValueAgeTypes.C },
  antivirals_administered_d: { name: 'Antivirals_administered', age: ModellingModelParameterValueAgeTypes.D },
  previous_vaccines_administered_a: { name: 'Previous_vaccines_administered', age: ModellingModelParameterValueAgeTypes.A },
  previous_vaccines_administered_b: { name: 'Previous_vaccines_administered', age: ModellingModelParameterValueAgeTypes.B },
  previous_vaccines_administered_c: { name: 'Previous_vaccines_administered', age: ModellingModelParameterValueAgeTypes.C },
  previous_vaccines_administered_d: { name: 'Previous_vaccines_administered', age: ModellingModelParameterValueAgeTypes.D },
  cumulative_cases_a: { name: 'Cumulative_cases', age: ModellingModelParameterValueAgeTypes.A },
  cumulative_cases_b: { name: 'Cumulative_cases', age: ModellingModelParameterValueAgeTypes.B },
  cumulative_cases_c: { name: 'Cumulative_cases', age: ModellingModelParameterValueAgeTypes.C },
  cumulative_cases_d: { name: 'Cumulative_cases', age: ModellingModelParameterValueAgeTypes.D },
  cumulative_cases_e: { name: 'Cumulative_cases', age: ModellingModelParameterValueAgeTypes.E },
  total_admissions_a: { name: 'Total_Admissions', age: ModellingModelParameterValueAgeTypes.A },
  total_admissions_b: { name: 'Total_Admissions', age: ModellingModelParameterValueAgeTypes.B },
  total_admissions_c: { name: 'Total_Admissions', age: ModellingModelParameterValueAgeTypes.C },
  total_admissions_d: { name: 'Total_Admissions', age: ModellingModelParameterValueAgeTypes.D },
  peak_ward_demand_factor: { name: 'peak_ward_demand_factor' },
  peak_icu_demand_factor: { name: 'peak_ICU_demand_factor' },
  cumulative_confirmed_cases_a: { name: 'Cumulative_confirmed_cases', age: ModellingModelParameterValueAgeTypes.A },
  cumulative_confirmed_cases_b: { name: 'Cumulative_confirmed_cases', age: ModellingModelParameterValueAgeTypes.B },
  cumulative_confirmed_cases_c: { name: 'Cumulative_confirmed_cases', age: ModellingModelParameterValueAgeTypes.C },
  cumulative_confirmed_cases_d: { name: 'Cumulative_confirmed_cases', age: ModellingModelParameterValueAgeTypes.D },
  cumulative_confirmed_cases_e: { name: 'Cumulative_confirmed_cases', age: ModellingModelParameterValueAgeTypes.E },
  need_icu_a: { name: 'need_ICU', age: ModellingModelParameterValueAgeTypes.A },
  need_icu_b: { name: 'need_ICU', age: ModellingModelParameterValueAgeTypes.B },
  need_icu_c: { name: 'need_ICU', age: ModellingModelParameterValueAgeTypes.C },
  need_icu_d: { name: 'need_ICU', age: ModellingModelParameterValueAgeTypes.D },
  need_ward_bed_a: { name: 'need_ward_bed', age: ModellingModelParameterValueAgeTypes.A },
  need_ward_bed_b: { name: 'need_ward_bed', age: ModellingModelParameterValueAgeTypes.B },
  need_ward_bed_c: { name: 'need_ward_bed', age: ModellingModelParameterValueAgeTypes.C },
  need_ward_bed_d: { name: 'need_ward_bed', age: ModellingModelParameterValueAgeTypes.D },
  total_expected_deaths: { name: 'total_expected_deaths' },
  ward_nurse_absenteeism_rate: { name: 'ward_nurse_absenteeism_rate' },
  icu_nurse_absenteeism_rate: { name: 'ICU_nurse_absenteeism_rate' },
  all_nurses_absenteeism_rate: { name: 'all_nurses_absenteeism_rate' },
  total_unable_to_access_ward_bed: { name: 'total_unable_to_access_ward_bed' },
  total_unable_to_access_icu: { name: 'total_unable_to_access_ICU' },
  vaccination_a: { name: 'Vaccination', age: ModellingModelParameterValueAgeTypes.A },
  vaccination_b: { name: 'Vaccination', age: ModellingModelParameterValueAgeTypes.B },
  vaccination_c: { name: 'Vaccination', age: ModellingModelParameterValueAgeTypes.C },
  vaccination_d: { name: 'Vaccination', age: ModellingModelParameterValueAgeTypes.D },
  vaccination_e: { name: 'Vaccination', age: ModellingModelParameterValueAgeTypes.E },
  cumulative_vaccination_a: { name: 'Cumulative_vaccination', age: ModellingModelParameterValueAgeTypes.A },
  cumulative_vaccination_b: { name: 'Cumulative_vaccination', age: ModellingModelParameterValueAgeTypes.B },
  cumulative_vaccination_c: { name: 'Cumulative_vaccination', age: ModellingModelParameterValueAgeTypes.C },
  cumulative_vaccination_d: { name: 'Cumulative_vaccination', age: ModellingModelParameterValueAgeTypes.D },
  cumulative_vaccination_e: { name: 'Cumulative_vaccination', age: ModellingModelParameterValueAgeTypes.E },
  patients_in_icu_bed_a: { name: 'Patients_In_ICU_Bed', age: ModellingModelParameterValueAgeTypes.A },
  patients_in_icu_bed_b: { name: 'Patients_In_ICU_Bed', age: ModellingModelParameterValueAgeTypes.B },
  patients_in_icu_bed_c: { name: 'Patients_In_ICU_Bed', age: ModellingModelParameterValueAgeTypes.C },
  patients_in_icu_bed_d: { name: 'Patients_In_ICU_Bed', age: ModellingModelParameterValueAgeTypes.D },
  oxygen_consumption_per_day_in_icu: { name: 'oxygen_consumption_per_day_in_ICU' },
  oxygen_consumption_per_day_in_wards: { name: 'oxygen_consumption_per_day_in_wards' },
  total_daily_oxygen_consumption: { name: 'total_daily_oxygen_consumption' },
  total_oxygen_used: { name: 'Total_oxygen_used' },
  pandemic_morgue_capacity: { name: 'pandemic_morgue_capacity' },
};

const ModellingRegionPopulation: Map<string, IModellingModelParameterValue[]> = new Map([
  ['DE', [
    {
      value: 11477800,
      age: 'a'
    },
    {
      value: 8427265,
      age: 'b'
    },
    {
      value: 44978330,
      age: 'c'
    },
    {
      value: 18271636,
      age: 'd'
    }
  ]],
  ['NL', [
    {
      value: 2711731,
      age: 'a'
    },
    {
      value: 2139221,
      age: 'b'
    },
    {
      value: 9166928,
      age: 'c'
    },
    {
      value: 3457535,
      age: 'd'
    }
  ]]
]);

const ModellingRegionDefaults: Map<string, {key: string, value: number}[]> = new Map([
  ['DE', [
    {
      key: ModellingModelDataParameterKeys.WardBedsPer1K,
      value: 2
    },
    {
      key: ModellingModelDataParameterKeys.ICUBedsPer100K,
      value: 5.2
    },
    {
      key: ModellingModelDataParameterKeys.WardNursesPer1K,
      value: 5
    },
    {
      key: ModellingModelDataParameterKeys.ICUNursesPer100K,
      value: 23.4
    },
    {
      key: ModellingModelDataParameterKeys.PhysiciansPer100K,
      value: 313.6
    },
    {
      key: ModellingModelDataParameterKeys.VentilatorsPer100K,
      value: 6
    },
    {
      key: ModellingModelDataParameterKeys.MorgueCapacity,
      value: 6000
    },
    {
      key: ModellingModelDataParameterKeys.TargetPPEStock,
      value: 4000000
    },
  ]],
  ['NL', [
    {
      key: ModellingModelDataParameterKeys.WardBedsPer1K,
      value: 2
    },
    {
      key: ModellingModelDataParameterKeys.ICUBedsPer100K,
      value: 5.2
    },
    {
      key: ModellingModelDataParameterKeys.WardNursesPer1K,
      value: 5
    },
    {
      key: ModellingModelDataParameterKeys.ICUNursesPer100K,
      value: 23.4
    },
    {
      key: ModellingModelDataParameterKeys.PhysiciansPer100K,
      value: 313.6
    },
    {
      key: ModellingModelDataParameterKeys.VentilatorsPer100K,
      value: 6
    },
    {
      key: ModellingModelDataParameterKeys.MorgueCapacity,
      value: 1260
    },
    {
      key: ModellingModelDataParameterKeys.TargetPPEStock,
      value: 840000
    },
  ]]
]);

export class GroupManager {
  private async getSimulateModelAPIRequestBody(model: IModellingModel, scenario: IModellingScenario): Promise<{[key: string]: number}> {
    const apiInput: {[key: string]: number} = {};
    
    //TODO Get & use population from DB
    const population = ModellingRegionPopulation.get(scenario.location) || undefined;
    const dataParams = ModellingRegionDefaults.get(scenario.location) || undefined;

    //Get contact rates for scenario location
    const contactRates = await axios({
      method: 'get',
      url: modellingURL + '/contacts',
      timeout: 30000,
      params: {
        country_code: scenario.location,
        pop_a: population?.find(e => e.age === ModellingModelParameterValueAgeTypes.A)?.value ?? 25,
        pop_b: population?.find(e => e.age === ModellingModelParameterValueAgeTypes.B)?.value ?? 20,
        pop_c: population?.find(e => e.age === ModellingModelParameterValueAgeTypes.C)?.value ?? 90,
        pop_d: population?.find(e => e.age === ModellingModelParameterValueAgeTypes.D)?.value ?? 30,
      }
    });

    for (const modelParam of model.parameters) {
      if (modelParam.category == ModellingModelParameterCategories.Data) {
        //If category of parameter is Data get the values from database
        for (const modelValue of modelParam.values) {
          if (modelValue.ageContact) {
            //Set default value
            let dbValue = modelValue.value;

            if (modelParam.key == ModellingModelDataParameterKeys.AgeSpecificContactRates) { 
              //Load contact rates
              dbValue = contactRates.data[modelValue.ageContact];
            } 

            const inputValue: number = typeof dbValue === 'boolean' ? +dbValue : (dbValue ?? 0);
            apiInput[modelParam.key + '[' + modelValue.ageContact + ']'] = inputValue;
          }
          else if (modelValue.age) {
            //Set default value
            let dbValue = modelValue.value;

            if (modelParam.key == ModellingModelDataParameterKeys.PopulationSize) { 
              //TODO get value from db
              dbValue = population?.find(e => e.age === modelValue.age)?.value ?? 0;
            }

            const inputValue: number = typeof dbValue === 'boolean' ? +dbValue : (dbValue ?? 0);
            apiInput[modelParam.key + '[' + modelValue.age + ']'] = inputValue;
          }
          else {
            //Set default value
            let dbValue = modelValue.value;

            //TODO get values from db
            switch(modelParam.key) {
              case ModellingModelDataParameterKeys.WardBedsPer1K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.WardBedsPer1K)?.value ?? 6;
                break;
              }
              case ModellingModelDataParameterKeys.ICUBedsPer100K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.ICUBedsPer100K)?.value ?? 33.2;
                break;
              }
              case ModellingModelDataParameterKeys.WardNursesPer1K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.WardNursesPer1K)?.value ?? 5;
                break;
              }
              case ModellingModelDataParameterKeys.ICUNursesPer100K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.ICUNursesPer100K)?.value ?? 41.4;
                break;
              }
              case ModellingModelDataParameterKeys.PhysiciansPer100K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.PhysiciansPer100K)?.value ?? 234;
                break;
              }
              case ModellingModelDataParameterKeys.VentilatorsPer100K: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.VentilatorsPer100K)?.value ?? 30;
                break;
              }
              case ModellingModelDataParameterKeys.MorgueCapacity: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.MorgueCapacity)?.value ?? 6000;
                break;
              }
              case ModellingModelDataParameterKeys.TargetPPEStock: {
                dbValue = dataParams?.find(e => e.key === ModellingModelDataParameterKeys.TargetPPEStock)?.value ?? 4000000;
                break;
              }
              default: {
                break;
              }
            }

            const inputValue: number = typeof dbValue === 'boolean' ? +dbValue : (dbValue ?? 0);
            apiInput[modelParam.key] = inputValue;
          }
        }

        // Add Data parameters to saved scenario
        const savedParam = scenario.parameters.find(e => e.key === modelParam.key);
        if (!savedParam) {
          const apiInputValues: IModellingScenarioParameterValue[] = [];
          modelParam.values.forEach(value => {
            let apiInputKey = modelParam.key;
            if (value.age) {
              apiInputKey += '[' + value.age + ']';
            }
            if (value.ageContact) {
              apiInputKey += '[' + value.ageContact + ']';
            }

            apiInputValues.push({
              value: apiInput[apiInputKey] || 0,
              age: value.age || undefined,
              ageContact: value.ageContact || undefined
            });
          });

          scenario.parameters.push({
            key: modelParam.key,
            values: apiInputValues
          });
        }
      }
      else {
        //Get values from scenario parameters
        const scenarioParam = scenario.parameters.find(p => p.key == modelParam.key);
        if (scenarioParam) {
          for (const modelValue of modelParam.values) {
            if (modelValue.ageContact) {
              const scenarioParamValue = scenarioParam.values.find(v => v.ageContact == modelValue.ageContact);
              const paramValue = (scenarioParamValue?.value ?? modelValue.value) ?? 0;
              const inputValue: number = typeof paramValue === 'boolean' ? +paramValue : (paramValue ?? 0);
              apiInput[modelParam.key + '[' + modelValue.ageContact + ']'] = inputValue;
            }
            else if (modelValue.age) {
              const scenarioParamValue = scenarioParam.values.find(v => v.age == modelValue.age);
              const paramValue = (scenarioParamValue?.value ?? modelValue.value) ?? 0;
              const inputValue: number = typeof paramValue === 'boolean' ? +paramValue : (paramValue ?? 0);
              apiInput[modelParam.key + '[' + modelValue.age + ']'] = inputValue;
            }
            else {
              const scenarioParamValue = scenarioParam.values[0];
              const paramValue = (scenarioParamValue?.value ?? modelValue.value) ?? 0;
              const inputValue: number = typeof paramValue === 'boolean' ? +paramValue : (paramValue ?? 0);
              apiInput[modelParam.key] = inputValue;
            }
          }
        }
        else {
          //Get default value if scenario doesn't contain the parameter
          for (const modelValue of modelParam.values) {
            const defaultValue: number = typeof modelValue.value === 'boolean' ? +modelValue.value : (modelValue.value ?? 0);
            if (modelValue.ageContact) {
              apiInput[modelParam.key + '[' + modelValue.ageContact + ']'] = defaultValue;
            }
            else if (modelValue.age) {
              apiInput[modelParam.key + '[' + modelValue.age + ']'] = defaultValue;
            }
            else {
              apiInput[modelParam.key] = defaultValue;
            }
          }
        }
      }
    }
    
    return apiInput;
  }

  public async createScenario(inputScenario: IModellingScenario): Promise<IModellingScenarioWithDayResults> {
    const model = await ModellingModel.findById(inputScenario.modelId);
    if (!model) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
    
    //Create scenario
    const createdScenario = inputScenario;

    //Get request body for simulate API
    const requestBody: {[key: string]: number} = await this.getSimulateModelAPIRequestBody(model, createdScenario);

    //Call simulate API
    const response = await axios({
      method: 'post',
      url: modellingURL + '/sim/' + model.key,
      timeout: 30000,
      data: requestBody
    });

    const responseData = response.data as {
      category: string,
      name: string,
      array: boolean,
      dimensions?: {
        [key: string]: string[]
      },
      sim_results: {
        Days: number,
        name: string,
        value: number,
        Age?: ModellingModelParameterValueAgeType
        Age_out?: ModellingModelParameterValueAgeType
      }[]
    }[];

    //Get properties that need to be populated
    const dayResultProperties: string[] = Object.keys(ModellingScenarioDayResultPropertyMap);
    //Get days that have response data
    const days: number[] = _.uniq(responseData.flatMap(d => d.sim_results).map(r => r.Days));
    //Get last day that has response data
    const lastDay = _.max(days);
    //Initialize day results list
    const dayResults: IModellingScenarioDayResult[] = [];

    //For each day and property try to retrieve value from response data
    for (const day of days) {
      const dayResult: {
        day: number,
        [key: string]: any
      } = {
        day: day
      };

      for (const dayResultProperty of dayResultProperties) {
        const propertyMap = ModellingScenarioDayResultPropertyMap[dayResultProperty];

        const resultProperty = responseData.find(d => d.name == propertyMap.name);
        if (resultProperty) {
          dayResult[dayResultProperty] = resultProperty
            ?.sim_results.find(r => r.name == propertyMap.name && r.Days == day && (r.Age == propertyMap.age || r.Age_out == propertyMap.age))
            ?.value;
        }
      }

      dayResults.push(dayResult);
    }

    //Populate result summary with values from last day
    const lastDayResults = dayResults.find(r => r.day == lastDay);
    const resultSummary = {
      total_needed_icu_a: lastDayResults?.total_needed_icu_a,
      total_needed_icu_b: lastDayResults?.total_needed_icu_b,
      total_needed_icu_c: lastDayResults?.total_needed_icu_c,
      total_icu_admissions_a: lastDayResults?.total_icu_admissions_a,
      total_icu_admissions_b: lastDayResults?.total_icu_admissions_b,
      total_icu_admissions_c: lastDayResults?.total_icu_admissions_c,
      total_needed_ward_bed_a: lastDayResults?.total_needed_ward_bed_a,
      total_needed_ward_bed_b: lastDayResults?.total_needed_ward_bed_b,
      total_needed_ward_bed_c: lastDayResults?.total_needed_ward_bed_c,
      total_ward_admissions_a: lastDayResults?.total_ward_admissions_a,
      total_ward_admissions_b: lastDayResults?.total_ward_admissions_b,
      total_ward_admissions_c: lastDayResults?.total_ward_admissions_c,
      potential_deaths_due_to_lack_of_icu_a: lastDayResults?.potential_deaths_due_to_lack_of_icu_a,
      potential_deaths_due_to_lack_of_icu_b: lastDayResults?.potential_deaths_due_to_lack_of_icu_b,
      potential_deaths_due_to_lack_of_icu_c: lastDayResults?.potential_deaths_due_to_lack_of_icu_c,
      total_deaths_a: lastDayResults?.total_deaths_a,
      total_deaths_b: lastDayResults?.total_deaths_b,
      total_deaths_c: lastDayResults?.total_deaths_c,

      peak_icu_demand: lastDayResults?.peak_icu_demand,
      peak_demand_icu_beds: lastDayResults?.peak_demand_icu_beds,
      peak_demand_icu_nurses: lastDayResults?.peak_demand_icu_nurses,
      peak_demand_ventilators: lastDayResults?.peak_demand_ventilators,
      peak_ward_demand: lastDayResults?.peak_ward_demand,
      peak_demand_ward_beds: lastDayResults?.peak_demand_ward_beds,
      peak_demand_nurses: lastDayResults?.peak_demand_nurses,
      peak_demand_ppe: lastDayResults?.peak_demand_ppe
    };

    //Create response object
    const result: IModellingScenarioWithDayResults = {
      userId: createdScenario.userId,
      modelId: createdScenario.modelId,
      previousConfigScenarioId: createdScenario.previousConfigScenarioId,
      comparisonScenarioId: createdScenario.comparisonScenarioId,
      comparisonScenarioName: createdScenario.comparisonScenarioName,
      name: createdScenario.name,
      date: createdScenario.date,
      description: createdScenario.description,
      tags: createdScenario.tags,
      location: createdScenario.location,
      parameters: createdScenario.parameters,
      result_summary: resultSummary,
      sections_order: createdScenario.sections_order,
      day_results: dayResults,
      exploration: createdScenario.exploration,
      is_visible: createdScenario.is_visible
    };

    return result;
  }

  public async saveScenario(inputScenario: IModellingScenarioWithDayResults): Promise<IModellingScenario> {
    //Save scenario into database
    const createdScenario = await ModellingScenario.create(inputScenario);

    //Process results
    const processedDayResults: any[] = [];
    if(inputScenario.processed_results){
      //Get number of days
      let days = 270;
      //Try to get number of days from an output parameter
      const parameterKey = Object.keys(inputScenario.processed_results)[0];
      if(inputScenario.processed_results[parameterKey]){
        days = inputScenario.processed_results[parameterKey].length;
      }
      //Create entry for each day
      for(let i = 0; i < days; i++){
        processedDayResults.push({
          scenarioId: createdScenario.id,
          day: i,
        });
      }
      //Update entry for each day
      processedDayResults.forEach(elem => {
        Object.keys(inputScenario.processed_results!).forEach(key => {
          elem[key] = inputScenario.processed_results![key][elem.day];
        });
      });
    }

    //Initialize day results list
    const dayResults: IModellingScenarioDayResult[] = processedDayResults;

    //Save day results into database
    while (dayResults.length) {
      const batch = dayResults.splice(0, 100);
      await ModellingScenarioDayResult.create(batch);
    }

    return createdScenario;
  }

  public async getScenarioById(scenarioId: string): Promise<IModellingScenarioWithDayResults> {
    const scenario = await ModellingScenario.findById(scenarioId);
    if (!scenario) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    const dayResults: IModellingScenarioDayResult[] = await ModellingScenarioDayResult.find({
      scenarioId: scenario._id.toString()
    }, null, {
      lean: true,
      sort: {
        day: 1
      }
    });

    const result: IModellingScenarioWithDayResults = {
      id: scenario._id.toString(),
      userId: scenario.userId,
      modelId: scenario.modelId,
      previousConfigScenarioId: scenario.previousConfigScenarioId,
      comparisonScenarioId: scenario.comparisonScenarioId,
      comparisonScenarioName: scenario.comparisonScenarioName,
      name: scenario.name,
      date: scenario.date,
      description: scenario.description,
      tags: scenario.tags,
      location: scenario.location,
      parameters: scenario.parameters,
      result_summary: scenario.result_summary,
      sections_order: scenario.sections_order,
      day_results: dayResults,
      exploration: scenario.exploration,
      is_visible: scenario.is_visible
    };

    return result;
  }
}
