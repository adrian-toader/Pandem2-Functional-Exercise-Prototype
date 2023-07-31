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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HumanResourceSplitTypes, HumanResourceStaffType, HumanResourceTotalType, HumanResourceTotalTypeValues } from '../../entities/humanResources-data.entity';
import { RegionsHumanResources, HumanResourceModel } from '../../models/humanResources-data.model';
import { ModelHelperService } from '../helper/model-helper.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable({
  providedIn: 'root'
})
export class HumanResourcesDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}human-resources`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  getRegionsHumanResources(
    location: string[],
    totalType: HumanResourceTotalType,
    staffType?: HumanResourceStaffType,
    split?: string,
    startDate?: string,
    endDate?: string
  ): Observable<RegionsHumanResources> {
    const requestParams: any = {
      location,
      total_type: totalType
    };
    if (split)
    {
      requestParams.split = split;
    }
    if (staffType)
    {
      requestParams.staff_type = staffType;
    }
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/get-locations-daily`, {
        params: requestParams
      }),
      RegionsHumanResources
    );
  }

  getDailyHumanResources(
    location: string,
    totalType: HumanResourceTotalType,
    startDate?: string,
    endDate?: string,
    split?: string
  ): Observable<HumanResourceModel> {
    const requestParams: any = { location, total_type: totalType };

    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }

    if (split) {
      requestParams.split = split;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/get-all-daily`, {
        params: requestParams
      }),
      HumanResourceModel
    );
  }

  getDataForSummaryCards(
    location: string
  ): Observable<HumanResourceModel[]> {
    const currentDate = moment().format('YYYY-MM-DD');

    const todayHumanResourceDataAbs = this.getDailyHumanResources(
      location,
      HumanResourceTotalTypeValues.Absolute,
      currentDate,
      currentDate,
      HumanResourceSplitTypes.StaffType
    );
    // TODO: add actual pathogen start date(currently set as one week before, as we don't have that data)
    const pathogenStartDate = moment().subtract(6, 'd').format('YYYY-MM-DD');
    const pathogenStartHumanResourceDataAbs = this.getDailyHumanResources(
      location,
      HumanResourceTotalTypeValues.Absolute,
      pathogenStartDate,
      pathogenStartDate,
      HumanResourceSplitTypes.StaffType
    );

    const todayHumanResourceData100K = this.getDailyHumanResources(
      location,
      HumanResourceTotalTypeValues.per100k,
      currentDate,
      currentDate,
      HumanResourceSplitTypes.StaffType
    );
    return forkJoin([
      todayHumanResourceDataAbs,
      todayHumanResourceData100K,
      pathogenStartHumanResourceDataAbs
    ]
    );
  }
}

