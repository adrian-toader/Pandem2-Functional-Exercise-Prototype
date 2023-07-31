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
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { DeathDataService } from '../../../../core/services/data/death.data.service';
import { DeathSubcategories, DeathSubcategory } from '../../../../core/entities/death-data.entity';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Moment } from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-reported-deaths-and-mortality-rate',
  templateUrl: './reported-deaths-and-mortality-rate.component.html',
  styleUrls: ['./reported-deaths-and-mortality-rate.component.less']
})
export class ReportedDeathsAndMortalityRateComponent extends DashboardComponent {
  DeathSubcategories = DeathSubcategories;
  interval = 'all';
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any[];
  weeklySeries: any[];
  cumulativeSeries: any[];
  chartType = 'column';
  selectedRegionCode;
  currentTabIndex = 0;
  LinearLog: LinearLog = Constants.linear;
  subcategory: DeathSubcategory = DeathSubcategories.Death;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'ALL', value: 'all' },
    { name: '1 YEAR', value: '1y' },
    { name: '6 MONTHS', value: '6m' },
    { name: '3 MONTHS', value: '3m' },
    { name: '4 WEEKS', value: '4w' }
  ];
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  chartOptions: Highcharts.ChartOptions = {
    marginLeft: 60
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected deathDataService: DeathDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string; end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }


  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.deathDataService
      .getDailyDeathsResponse(this.subcategory, this.selectedRegionCode, this.startDate, this.endDate)
      .subscribe((deathData) => {
        const splitCases = new SplitData(deathData.data);
        const displayLabel = this.subcategory === DeathSubcategories.Death ? 'Deaths' : DeathSubcategories.MortalityRate;
        this.dailyChart = splitCases.daily();
        this.dailySeries = [
          {
            type: this.chartType,
            name: displayLabel,
            data: this.dailyChart.total.yAxis[0].data
          },
          {
            type: 'spline',
            name: 'Deaths (7-day average)',
            pointStart: 6,
            pointInterval: 1,
            data: ChartDataUtils.compute7DayAverage(this.dailyChart.total.yAxis[0].data),
            color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR
          }
        ];

        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly();
        this.weeklySeries = [
          {
            type: this.chartType,
            name: displayLabel,
            data: this.weeklyChart.total.yAxis[0].data
          }
        ];

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.cumulativeSeries = [
          {
            type: this.chartType,
            name: displayLabel,
            data: this.cumulativeChart.total.yAxis[0].data
          },
          {
            type: 'spline',
            name: 'Deaths (7-day average)',
            pointStart: 6,
            pointInterval: 1,
            data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.total.yAxis[0].data),
            color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR
          }
        ];

        const mappedSources = this.metadataService.getSourcesAndLatestDate(deathData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;

        this.hideLoading();
      });
  }

  changePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  /**
   * Change the Deaths Report Total Type (Absolute or MortalityRate)
   * @param ev MatButtonToggleChange instance
   */
  changeSubcategory(ev: MatButtonToggleChange): void {
    if (ev.value === DeathSubcategories.Death) {
      this.subcategory = DeathSubcategories.Death;
    } else {
      this.subcategory = ev.value;
    }
    this.retrieveData();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
  }
}
