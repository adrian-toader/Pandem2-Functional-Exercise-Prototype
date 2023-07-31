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
import { IDailyContactCount, IDailyContactFilter } from '../../interfaces/contacts';
import { ContactModel, NoTracingPolicy } from '../../models/contact';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';
import { extractDatasourcesMetadata, IDataSourceMetadata } from '../dataSources/helpers';

const moment = extendMoment(Moment as any);

interface AggregateDataResult {
  date: Date,
  total: number,
  reached: number,
  reached_within_a_day: number,
  contact_tracing_policy: string
}

export class GroupManager {
  private filter: any = {};
  private queryParams!: IDailyContactFilter;

  constructor(queryParams: IDailyContactFilter) {
    this.queryParams = queryParams;

    this.filter['total_type'] = queryParams.total_type;
    this.filter['location.value'] = queryParams.location;
    this.filter['is_date_total'] = true;

    // retrieve only contacts newer than start_date
    if (queryParams.start_date) {
      this.filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }

    // retrieve only contacts older than end_date
    if (queryParams.end_date) {
      this.filter['date'] = {
        ...(this.filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }

  }

  /**
   * Retrieve DB Data
   */
  private async retrieveData(): Promise<AggregateDataResult[]> {
    // create the group by condition
    const groupBy: any = {
      date: '$date'
    };

    // create the projection
    const projection: any = {
      date: '$_id.date',
      total: '$total',
      reached: '$reached',
      reached_within_a_day: '$reached_within_a_day',
      contact_tracing_policy: '$contact_tracing_policy'
    };
    // retrieve DB data
    return ContactModel.aggregate([
      {
        $match: this.filter
      },
      {
        $group: {
          _id: groupBy,
          total: {
            $sum: '$total'
          },
          reached: {
            $sum: '$reached'
          },
          reached_within_a_day: {
            $sum: '$reached_within_a_day'
          },
          contact_tracing_policy: {
            $first: '$contact_tracing_policy'
          }
        }
      },
      {
        $project: projection
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);
  }

  /**
   * Get data group by day
   */
  async getDailyData() {
    const responseData: { data: IDailyContactCount[], metadata: AnyObject } = { data: [], metadata: {} };
    // get DB data
    const dbData: AggregateDataResult[] = await this.retrieveData();
    if (!dbData.length) {
      return responseData;
    }

    // determine the interval range
    const intervalStart = this.queryParams.start_date ? Moment(this.queryParams.start_date) : Moment(dbData[0].date);
    let intervalEndResult;
    if (this.queryParams.end_date) {
      intervalEndResult = Moment(this.queryParams.end_date);
    } else {
      intervalEndResult = dbData.length > 1 ? Moment(dbData[dbData.length - 1].date) : Moment(dbData[0].date);
    }
    const intervalEnd = intervalEndResult;
    const range = moment.range(intervalStart, intervalEnd);

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as AggregateDataResult[]).push(item);

      return acc;
    }, {});

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IDailyContactCount = {
        date: currentDateFormatted,
        total: 0,
        reached: 0,
        reached_within_a_day: 0,
        contact_tracing_policy: NoTracingPolicy
      };

      // get all contacts for currentDate
      if (!groupedDBData[currentDateFormatted]) {
        // no contacts on current date
        responseData.data.push(currentDateCount);
        continue;
      }

      const currentDateContacts = groupedDBData[currentDateFormatted] as AggregateDataResult[];

      currentDateCount.total = currentDateContacts[0].total;
      currentDateCount.reached = currentDateContacts[0].reached;
      currentDateCount.reached_within_a_day = currentDateContacts[0].reached_within_a_day;
      currentDateCount.contact_tracing_policy = currentDateContacts[0].contact_tracing_policy;

      responseData.data.push(currentDateCount);
    }

    const sourcesMetadata = await this.getSourcesMetadata(responseData.data);
    sourcesMetadata.length && (responseData.metadata.sources = sourcesMetadata);

    return responseData;
  }

  /**
   * Get sources metadata
   * @param data
   */
  async getSourcesMetadata(data: any[]): Promise<IDataSourceMetadata[]> {
    if (!data.length) {
      return [];
    }

    // get sources for retrieved data
    const contactsWithSources = await ContactModel.find(
      this.filter, {
        'import_metadata.sourceId': 1
      }, {
        lean: true
      }
    );

    return extractDatasourcesMetadata(contactsWithSources);
  }
}
