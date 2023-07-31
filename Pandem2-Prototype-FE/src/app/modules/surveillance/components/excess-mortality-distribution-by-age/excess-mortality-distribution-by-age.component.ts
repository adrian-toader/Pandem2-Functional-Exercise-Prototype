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
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import {
  DeathPeriodTypes,
  DeathSplitType,
  DeathSubcategories,
  DeathSubcategory
} from '../../../../core/entities/death-data.entity';
import { DeathDataService } from '../../../../core/services/data/death.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Moment } from 'moment';
import { ISource, SourceType } from '../../../../core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-excess-mortality-distribution-by-age',
  templateUrl: './excess-mortality-distribution-by-age.component.html',
  styleUrls: ['./excess-mortality-distribution-by-age.component.less']
})
export class ExcessMortalityDistributionByAgeComponent extends DashboardComponent {
  DeathSubcategories = DeathSubcategories;
  interval = 'all';
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  weeklySeries: any[];
  cumulativeSeries: any[];
  selectedRegionCode;
  subcategory: DeathSubcategory = DeathSubcategories.Excess;
  chartType = 'column';
  currentTabIndex = 0;
  LinearLog: LinearLog = Constants.linear;
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

  updateTabIndex(value): void {
    this.currentTabIndex = value;
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.deathDataService
      .getDailyDeathsResponse(
        this.subcategory,
        this.selectedRegionCode,
        this.startDate, this.endDate,
        DeathSplitType.AgeGroup,
        null,
        DeathPeriodTypes.Weekly
      )
      .subscribe((deathData) => {
        const splitCases = new SplitData(deathData.data);
        this.sortSplitData(splitCases.data);
        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly(false);
        this.weeklySeries = [];
        // Sort the age ranges from lowest to highest (e.g.: 0-12, 13-18, etc.)
        this.prepareData(this.weeklyChart, 'weekly');

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.cumulativeSeries = [];
        // Sort the age ranges from lowest to highest (e.g.: 0-12, 13-18, etc.)
        this.prepareData(this.cumulativeChart, 'cumulative');

        const mappedSources = this.metadataService.getSourcesAndLatestDate(deathData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;

        this.hideLoading();
      });
  }

  protected prepareData(data: GraphDatasource, type: string): void {
    let selectedColor;
    let count = 0;
    if (data.split) {
      for (const splitData of data.split) {
        selectedColor = this.legendColors[this.legendColors.length - count++ - 1];

        if (type === 'weekly') {
          this.weeklySeries.push({
            type: this.chartType,
            name: splitData.name,
            data: splitData.data,
            color: selectedColor.primary,
            stacking: 'normal'
          });
        }

        if (type === 'cumulative') {
          this.cumulativeSeries.push({
            type: this.chartType,
            name: splitData.name,
            data: splitData.data,
            color: selectedColor.primary,
            stacking: 'normal'
          });

          // add series
          this.cumulativeSeries.push({
            type: 'spline',
            name: `7 day rolling average - ${splitData.name}`,
            data: ChartDataUtils.compute7DayAverage(splitData.data),
            pointStart: 6,
            pointInterval: 1,
            zIndex: 2,
            stacking: 'normal',
            color: selectedColor.bold
          });
        }
      }
    }
  }

  changeExcessMortalityDistribByAgePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

}
