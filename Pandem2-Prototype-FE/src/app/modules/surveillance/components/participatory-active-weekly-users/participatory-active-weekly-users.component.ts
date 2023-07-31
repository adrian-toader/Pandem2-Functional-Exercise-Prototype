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
import { Component } from '@angular/core';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import {
  ParticipatorySurveillanceSubcategories
} from '../../../../core/entities/participatorySurveillance-data.entity';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import {
  ParticipatorySurveillanceDailyDataResponse
} from '../../../../core/models/participatorySurveillance-data.model';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { PeriodTypes } from '../../../../shared/constants';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-participatory-active-weekly-users',
  templateUrl: './participatory-active-weekly-users.component.html'
})
export class ParticipatoryActiveWeeklyUsersComponent extends DashboardComponent {
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];
  weeklyActiveUsers: GraphDatasource;
  weeklySeries: any[] = [];
  isCollapsed = false;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  LinearLog: LinearLog = Constants.linear;
  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  constructor(
    protected selectedRegion: SelectedRegionService,
    protected participatorySurveillanceService: ParticipatorySurveillanceDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    ).subscribe((response: ParticipatorySurveillanceDailyDataResponse) => {
      const splitData = new SplitData(response.data);

      this.weeklyActiveUsers = splitData.weekly();

      this.weeklySeries = [
        {
          type: 'spline',
          name: 'Weekly active users',
          data: this.weeklyActiveUsers.total.yAxis[0].data,
          color: '#0072b2'
        }
      ];

      const mappedSources = this.metadataService.getSourcesAndLatestDate(response.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      this.hideLoading();
    });
  }

  changeActiveWeeklyUsersPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

}
