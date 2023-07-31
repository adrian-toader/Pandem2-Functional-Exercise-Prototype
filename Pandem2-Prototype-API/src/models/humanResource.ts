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
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';
import { model } from 'mongoose';
import { ILocation } from '../interfaces/common';

const name = 'humanResource';

export const totalTypeValues = ['Absolute', '100K'];
export type TotalType = typeof totalTypeValues[number];

export const staffTypeValues = ['ICU', 'Ward', 'Public'];
export type StaffType = typeof staffTypeValues[number];
export type PeriodType = 'Daily' | 'Weekly';

export interface IHumanResource {
  pathogen?: string;
  date: Date;
  total: number;
  total_type: TotalType;
  period_type?: PeriodType;
  staff_type: StaffType;
  location: ILocation;
  working_surveillance?: number;
  import_metadata?: {
    source?: string,
    file?: string
  },
  importId?: string
}

const schema: BaseSchema = new BaseSchema(
  {
    pathogen: {
      type: 'String',
      required: false
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    total: {
      type: 'Number',
      required: true
    },
    total_type: {
      type: 'String',
      required: true
    },
    period_type: {
      type: 'String',
      default: 'Daily'
    },
    staff_type: {
      type: 'String',
      required: true
    },
    location: {
      reference: {
        type: 'String',
        required: true
      },
      value: {
        type: 'String',
        required: true,
        index: true
      }
    },
    working_surveillance: {
      type: 'Number',
      required: false
    },
    import_metadata: {
      source: {
        type: 'String',
        required: false
      },
      file: {
        type: 'String',
        required: false
      }
    },
    importId: {
      type: 'String',
      required: false
    }
  }, {}
);

schema.index({
  'location.value': 1,
  staff_type: 1,
  date: 1,
  total_type: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

export const HumanResourceModel = model<IHumanResource>(name, schema);
