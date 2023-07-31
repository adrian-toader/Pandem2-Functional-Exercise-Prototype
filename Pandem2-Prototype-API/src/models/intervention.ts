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

const name = 'intervention';

export interface IIntervention {
  pathogenId?: string;
  is_custom: boolean;
  location: ILocation;
  start_date: Date;
  end_date: Date;
  name: string;
  description: string;
  import_metadata: {
    sourceId: {
      type: 'String',
      required: false
    },
    importId: {
      type: 'String',
      required: false
    }
  };
}

const schema: BaseSchema = new BaseSchema(
  {
    pathogenId: {
      type: 'String',
      required: false
    },
    is_custom: {
      type: 'Boolean',
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
    start_date: {
      type: 'Date',
      required: true,
      index: true
    },
    end_date: {
      type: 'Date',
      required: true,
      index: true
    },
    name: {
      type: 'String',
      required: true
    },
    description: {
      type: 'String',
      required: true
    },
    import_metadata: {
      sourceId: {
        type: 'String',
        required: false
      },
      importId: {
        type: 'String',
        required: false
      }
    }
  }, {}
);

schema.index({
  'location.value': 1,
  start_date: 1
});

export const InterventionModel = model<IIntervention>(name, schema);
