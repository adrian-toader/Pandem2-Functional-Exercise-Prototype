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
import { ModellingModelParameterValueAgeContactType, ModellingModelParameterValueAgeType } from './modellingModel';

// model's database name
const name = 'modellingScenario';

export interface IModellingScenarioParameterValue {
  value?: number | boolean;
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

export interface IModellingExplorationChart {
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: 'linear' | 'logarithmic';
  viewBy: 'scenario' | 'indicator';
  values: string[];
  plotlines: string[];
}

export interface IModellingScenario {
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
  sections_order?: string[]
  exploration?: IModellingExplorationChart[];
  is_visible?: boolean;
}

const schema: BaseSchema = new BaseSchema(
  {
    userId: {
      type: 'String',
      required: true,
      index: true
    },
    modelId: {
      type: 'String',
      required: true
    },
    previousConfigScenarioId: {
      type: 'String',
      required: false
    },
    comparisonScenarioId: {
      type: 'String',
      required: false
    },
    comparisonScenarioName: {
      type: 'String',
      required: false
    },
    name: {
      type: 'String',
      required: true
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    description: {
      type: 'String',
      required: false
    },
    tags: {
      type: ['String'],
      required: true
    },
    location: {
      type: 'String',
      required: true
    },
    parameters: {
      type: ['Object'],
      required: true
    },
    result_summary: {
      type: 'Object',
      required: false
    },
    sections_order: {
      type: ['String'],
      required: false
    },
    exploration: {
      type: ['Object'],
      required: false
    },
    is_visible: {
      type: 'Boolean',
      required: false
    }
  },
  {}
);

schema.index({
  userId: 1
});

export const ModellingScenario = model<IModellingScenario>(name, schema);
