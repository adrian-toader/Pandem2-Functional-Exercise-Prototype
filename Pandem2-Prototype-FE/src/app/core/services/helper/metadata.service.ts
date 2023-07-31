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
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor() {
  }

  /**
   * Parse metadata and format sources/latest date for display
   * @param metadata - response metadata
   */
  getSourcesAndLatestDate(
    metadata?: {
      sources?: {
        _id: string,
        name: string,
        date: string
      }[]
    }
  ): {
      sources: {
        _id: string,
        name: string,
        date: Moment
      }[],
      lastUpdate: Moment
    } {
    const result = {
      sources: [],
      lastUpdate: null
    };

    if (metadata?.sources?.length) {
      const mappedSources = {};

      metadata.sources.forEach(source => {
        if (!mappedSources[source.name]) {
          mappedSources[source.name] = source;
          mappedSources[source.name].date = moment(source.date);
        } else {
          const sourceDate = moment(source.date);
          if (mappedSources[source.name].date.isBefore(sourceDate)) {
            mappedSources[source.name].date = sourceDate;
          }
        }

        if (!result.lastUpdate || result.lastUpdate.isBefore(mappedSources[source.name].date)) {
          result.lastUpdate = mappedSources[source.name].date;
        }
      });

      result.sources = Object.values(mappedSources);
    }

    if (!result.lastUpdate) {
      result.lastUpdate = moment();
    }

    if (!result.sources.length) {
      result.sources[0] = {
        name: 'Synthesized Data',
        date: result.lastUpdate
      };
    }

    return result;
  }
}
