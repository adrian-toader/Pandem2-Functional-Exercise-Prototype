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
import { model } from 'mongoose';
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';

// model's database name
const name = 'modellingModel';

export const ModellingModelParameterValueAgeTypes = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e'
};
type modellingModelParameterValueAgeTypeValues = typeof ModellingModelParameterValueAgeTypes;
export type ModellingModelParameterValueAgeType = modellingModelParameterValueAgeTypeValues[keyof modellingModelParameterValueAgeTypeValues];

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
  Data: 'Data',
  PublicHealthPolicies: 'Public health policies',
  DiseaseSeverity: 'Disease severity',
  HospitalResources: 'Hospital resources',
  HospitalSurgeStrategies: 'Hospital surge strategies',
  ModellingOptions: 'Modelling options'
};
type modelParameterCategory = typeof ModellingModelParameterCategories;
export type ModellingModelParameterCategory = modelParameterCategory[keyof modelParameterCategory];

export const ModellingModelParameterSubcategories = {
  //Public health policies
  Vaccination: 'Vaccination',
  Mobility: 'Mobility',
  TestingIsolation: 'Testing & isolation',
  ContactTracing: 'Contact tracing',
  MaskWearing: 'Mask wearing',
  //DiseaseSeverity
  HospitalisaitonParameters: 'Hospitalisation parameters',
  LOSInDays: 'Length of stay (LOS) in days',
  FatalityRates: 'Fatality rates',
  EffectOfTherapeuticInterventions: 'Effect of therapeutic interventions (fraction reductions)',
  //Hospital Resources
  PandemicResourceAllocation: 'Pandemic resource allocation',
  ResourceUsageRates: 'Resource usage rates',
  Oxygen: 'Oxygen',
  PPE: 'PPE',
  TherapeuticCapacity: 'Therapeutic capacity (proportion of patients that can be treated, 0 to 1)',
  Morgue: 'Morgue',
  //Hospital Surge Strategies
  Strategy1: 'Strategy 1: activate when ICU nurse capacity is low',
  Strategy2: 'Strategy 2: activate when ward nurse capacity is low',
  Strategy3: 'Strategy 3: activate when PPE supplies run low',
  Strategy4: 'Strategy 4: activate when physical ward bed capacity is low'
};
type modelParameterSubcategory = typeof ModellingModelParameterSubcategories;
export type ModellingModelParameterSubcategory = modelParameterSubcategory[keyof modelParameterSubcategory];

export const ModellingModelParameterTypes  = {
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
  readonly: boolean;
  values: IModellingModelParameterValue[];
}

export interface IModellingModelDescriptionSection {
  title: string;
  paragraphs: string[];
}

export interface IModellingModel {
  name: string;
  key: string;
  pathogen: string;
  short_description?: string;
  description?: IModellingModelDescriptionSection[];
  model_structure_image?: string;
  parameters: IModellingModelParameter[];
}

const schema: BaseSchema = new BaseSchema(
  {
    name: {
      type: 'String',
      required: true
    },
    key: {
      type: 'String',
      required: true
    },
    pathogen: {
      type: 'String',
      required: true
    },
    short_description: {
      type: 'String',
      required: false
    },
    description: {
      type: ['Object'],
      required: false
    },
    model_structure_image: {
      type: 'String',
      required: false
    },
    parameters: {
      type: ['Object'],
      required: true
    }
  },
  {}
);

export const ModellingModel = model<IModellingModel>(name, schema);
