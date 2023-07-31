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
import { IDailyHumanResourceCount, IDailyHumanResourceFilter, ILocationsDailyHumanResourcesCount, ILocationsDailyHumanResourcesFilter, ILocationsHumanResourcesDateIntervalFilter } from '../../interfaces/humanResources';
import { HumanResourceModel, IHumanResource, StaffType } from '../../models/humanResource';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';

const moment = extendMoment(Moment as any);

interface AggregateDataResult {
  date: Date,
  total: number,
  working_surveillance: number,
  staff_type?: StaffType
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManager {
  private async retrieveData(queryParams: IDailyHumanResourceFilter): Promise<AggregateDataResult[]> {
    const filter: any = {};
    filter['total_type'] = queryParams.total_type;
    filter['location.value'] = queryParams.location;
    
    if (queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    // retrieve only humanResources newer than start_date
    if (queryParams.start_date) {
      filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }
    // // retrieve only humanResources older than end_date
    if (queryParams.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }
    // create the group by condition
    const groupBy: any = {
      date: '$date'
    };

    // create the projection
    const projection: any = {
      date: '$_id.date',
      total: '$total',
      working_surveillance: '$working_surveillance'
    };

    if (queryParams.split) {
      groupBy[queryParams.split] = `$${queryParams.split}`;
      projection[queryParams.split] = `$_id.${queryParams.split}`;
    }

    // retrieve DB data
    return HumanResourceModel.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: groupBy,
          total: {
            $sum: '$total'
          },
          working_surveillance: {
            $sum: '$working_surveillance'
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
  async getDailyData(queryParams: IDailyHumanResourceFilter) {
    const responseData: { data: IDailyHumanResourceCount[], metadata: AnyObject } = {data: [], metadata: {}};
    // get DB data
    const dbData: AggregateDataResult[] = await this.retrieveData(queryParams);
    if (!dbData.length) {
      return responseData;
    }
    // determine the interval range
    const intervalStart = queryParams.start_date ? Moment(queryParams.start_date) : Moment(dbData[0].date);
    const dbMoment = (dbData.length > 1 ? Moment(dbData[dbData.length - 1].date) : Moment(dbData[0].date));
    const intervalEnd = queryParams.end_date ? Moment(queryParams.end_date) : dbMoment;
    const range = moment.range(intervalStart, intervalEnd);

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IDailyHumanResourceCount = {
        date: currentDateFormatted,
        total: 0,
        working_surveillance: 0,
        split: []
      };

      // get all humanResources for currentDate
      const currentDateHumanResources: AggregateDataResult[] = dbData.filter(
        (humanResourceCount) => Moment(humanResourceCount.date).format('YYYY-MM-DD') === currentDateFormatted
      );
      if (!currentDateHumanResources.length) {
        // no humanResources on current date
        responseData.data.push(currentDateCount);
        continue;
      }

      // there is no split, we just need to add the total of the only record we retrieved
      if (!queryParams.split) {
        currentDateCount.total = currentDateHumanResources[0].total;
        responseData.data.push(currentDateCount);
        continue;
      }

      // add split data to current date
      currentDateHumanResources.forEach((humanResourceCount) => {
        currentDateCount.split && currentDateCount.split.push({
          total: humanResourceCount.total,
          working_surveillance: humanResourceCount.staff_type == 'Public' ? humanResourceCount.working_surveillance : undefined ,
          split_value: humanResourceCount[queryParams.split!] as any
        });
        currentDateCount.total += humanResourceCount.total;
      });
      responseData.data.push(currentDateCount);
    }
    return responseData;
  }
  
  private async getLocationsDateIntervalData(queryParams: ILocationsHumanResourcesDateIntervalFilter) : Promise<AggregateLocationsDateIntervalDataResult>{
    const filter: any = {};

    filter['total_type'] = queryParams.total_type;
    filter['staff_type'] = queryParams.staff_type;
    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if (queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    const startDate = await HumanResourceModel.findOne(filter, 'date').sort({'date': 1});
    const endDate = await HumanResourceModel.findOne(filter, 'date').sort({'date': -1});

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  private async getLocationDailyData(queryFilters: ILocationsDailyHumanResourcesFilter) :Promise<IHumanResource[]>
  {
    const filter:any ={};
    const projection :any ={
      date: 1, total: 1, location: 1
    };
    filter['total_type'] = queryFilters.total_type;
    if(queryFilters.split)
    {
      filter[queryFilters.split] = {
        $exists: true
      };
      projection[queryFilters.split] = 1;
    }
    if(queryFilters.staff_type)
    {
      filter['staff_type'] = queryFilters.staff_type;
    }
    if (typeof queryFilters.location === 'string') {
      filter['location.value'] = queryFilters.location;
    } else {
      filter['location.value'] = {$in: queryFilters.location};
    }

    // retrieve only hr data newer than start_date
    if (queryFilters.start_date) {
      filter['date'] = {
        $gte: new Date(queryFilters.start_date)
      };
    }

    // retrieve only hr data older than end_date
    if (queryFilters.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryFilters.end_date)
        }
      };
    }
    return HumanResourceModel.find(
      filter,
      projection,
      {lean: true, sort: {date: 1}}
    );
  }

  public async getLocationsDaily(queryParams: ILocationsDailyHumanResourcesFilter){

    const responseData: { data: ILocationsDailyHumanResourcesCount[], metadata: AnyObject } = {data: [], metadata: {}};

    const dbData: IHumanResource[] = await this.getLocationDailyData(queryParams);
    if (!dbData.length) {
      return responseData;
    }

    // determine the interval range
    const intervalStart = queryParams.start_date ? Moment(queryParams.start_date) : Moment(dbData[0].date);
    const intervalEnd = queryParams.end_date ? Moment(queryParams.end_date) : (dbData.length > 1 ? Moment(dbData[dbData.length - 1].date) : Moment(dbData[0].date));
    const range = moment.range(intervalStart, intervalEnd);

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof queryParams.location === 'string' ? [queryParams.location] : queryParams.location;

    for (const currentDate of range.by('day')) {
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: ILocationsDailyHumanResourcesCount = {
        date: currentDateFormatted,
        locations: [],
      };

      const currentDateHumanResourses: IHumanResource[] = dbData.filter(
        (vaccineCount) => Moment(vaccineCount.date).format('YYYY-MM-DD') === currentDateFormatted
      );

      if (!currentDateHumanResourses.length) {
        for (const location of locationsFilter) {
          currentDateCount.locations.push({code: location, total: 0, split: []});
        }
        responseData.data.push(currentDateCount);
        continue;
      }

      if (!queryParams.split)
      {
        for (const entry of currentDateHumanResourses) {
          currentDateCount.locations.push({code: entry.location.value, total: entry.total, split: []});
        }
        for (const location of locationsFilter) {
          if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
            currentDateCount.locations.push({code: location, total: 0, split: []});
          }
        }
      }
      else
      {
        const groupedByLocationDBData = currentDateHumanResourses.reduce((acc: AnyObject, item) => {
          const itemDate = item.location.value;
          !acc[itemDate] && (acc[itemDate] = []);
          (acc[itemDate] as IHumanResource[]).push(item);
          return acc;
        }, {});
        for(const location of locationsFilter)
        {
          const locationDataResult: any ={
            code: location,
            total: 0,
            split: []
          };
          const currentLocationCases = groupedByLocationDBData[location] as IHumanResource[];
          if (!groupedByLocationDBData[location]) {
            currentDateCount.locations.push(locationDataResult);
            continue;
          }
          if (currentLocationCases.length) {
            currentLocationCases.forEach((hrCount) => {
              locationDataResult.split!.push({
                total: hrCount.total,
                split_value: hrCount.staff_type
              });
              locationDataResult.total += hrCount.total;
            });

            currentDateCount.locations.push(locationDataResult);
          }
        }
     
      }
    
      responseData.data.push(currentDateCount);
    }

    return responseData;
  }

  public async getLocationsDateInterval(queryParams: ILocationsHumanResourcesDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }

}