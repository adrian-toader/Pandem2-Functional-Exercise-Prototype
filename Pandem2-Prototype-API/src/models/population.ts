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

const name = 'population';

export interface IPopulation {
  location: ILocation;
  date: Date;
  total: number;
  is_date_total: boolean;
  age_group?: string;
  import_metadata?: {
    source?: string,
    file?: string
  }
}

const schema: BaseSchema = new BaseSchema({
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
  date: {
    type: 'Date',
    required: true,
    index: true
  },
  total: {
    type: 'Number',
    required: true
  },
  is_date_total: {
    type: 'Boolean',
    default: false
  },
  age_group: {
    type: 'String',
    required: false
  },
  import_metadata: {
    source: {
      type: 'String'
    },
    file: {
      type: 'String'
    }
  }
}, {
  collection: name,
});

schema.index({
  'location.value': 1,
  date: 1
});

export const PopulationModel = model<IPopulation>(name, schema);
