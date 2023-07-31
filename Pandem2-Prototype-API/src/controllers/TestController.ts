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
import { FastifyReply, FastifyRequest } from 'fastify';
import { TestGenerator } from '../generators/TestGenerator';
import { IDailyTestFilter, IRegionsDailyTestsDataFilter, IRegionsTestsDateIntervalFilter } from '../interfaces/tests';
import { GroupManager } from '../components/tests/GroupManager';
import { GroupManagerRegionsTestsDateInterval } from '../components/tests/GroupManagerRegionsCasesDateInterval';
import { TestingPolicy, testingPolicyImportMap, TestModel } from '../models/test';
import { extractDatasourcesMetadata } from '../components/dataSources/helpers';
import { PeriodTypes, TotalTypes } from '../interfaces/common';
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment as any);

/**
 * Generate dummy test data
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: any = request.body;
    const generator = new TestGenerator(payload.pathogen, payload.location, payload.generate_for_sublocations);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for tests');

    throw err;
  }
};

/**
 * Get all daily tests for selected region
 * @param request
 * @param reply
 */
export const getDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IDailyTestFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily tests');

    throw err;
  }
};

/**
 * Get all daily tests by subcategory for selected regions
 * @param request
 * @param reply
 */
export const getLocationsDailyTests = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IRegionsDailyTestsDataFilter);
    const data = await groupManager.getLocationsDaily();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily tests');

    throw err;
  }
};

/**
 * Get testing policy for locations
 * @param request
 * @param reply
 */
export const getLocationTestingPolicy = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const locationCode = (request.params as { locationCode: string }).locationCode;
    const { start_date, end_date } = (request.query as { start_date: string, end_date: string });

    const filter: any = {
      'location.value': locationCode,
      subcategory: TestingPolicy,
      total_type: TotalTypes.Absolute,
      is_date_total: true,
      period_type: PeriodTypes.Daily
    };
    if (start_date) {
      filter['date'] = {
        $gte: Moment.utc(start_date).toDate()
      };
    }
    if (end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: Moment.utc(end_date).endOf('day').toDate()
        }
      };
    }
    // when no filter is given return the policy only for the current date
    if (!filter['date']) {
      filter['date'] = Moment.utc().startOf('day').toDate();
    }
    const data = await TestModel.find(filter, {
      date: 1,
      testing_policy: 1,
      'import_metadata.sourceId': 1,
      total: 1
    }, {
      lean: true,
      sort: {
        date: 1
      }
    });

    const sourcesMetadata = await extractDatasourcesMetadata(data);

    // construct result as for each day there is an entry for each policy
    // use the one with the bigger total or 'No Policy'
    const rangeEnd = end_date ?
      Moment.utc(end_date) :
      Moment.utc().startOf('day');
    const rangeStartWhenNoStartData = data.length ?
      Moment(data[0].date) :
      rangeEnd;
    const rangeStart = start_date ?
      Moment.utc(start_date) :
      rangeStartWhenNoStartData;
    const range = moment.range(rangeStart, rangeEnd);

    const dataMap = data.reduce((acc, item) => {
      const key = Moment(item.date).format('YYYY-MM-DD');
      if (!acc[key]) {
        acc[key] = {
          testing_policy: testingPolicyImportMap.no_testing,
          total: 0,
          date: key
        };
      }

      if (acc[key].total < item.total) {
        acc[key].testing_policy = item.testing_policy!;
        acc[key].total = item.total;
      }

      return acc;
    }, {} as {
      [key: string]: {
        testing_policy: string,
        total: number,
        date: string
      }
    });

    const resData = [];
    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');

      if (dataMap[currentDateFormatted]) {
        resData.push(dataMap[currentDateFormatted]);
      } else {
        resData.push({
          testing_policy: testingPolicyImportMap.no_testing,
          total: 0,
          date: currentDateFormatted
        });
      }
    }

    // send data as response
    return reply.send({
      data: resData,
      metadata: {
        sources: sourcesMetadata
      }
    });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving testing policy');

    throw err;
  }
};

/**
 * Get date interval for tests for locations
 * @param request
 * @param reply
 */
export const getLocationsDateInterval = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManagerRegionsTestsDateInterval(request.query as IRegionsTestsDateIntervalFilter);
    const data = await groupManager.getDateInterval();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving locations tests date interval');

    throw err;
  }
};
