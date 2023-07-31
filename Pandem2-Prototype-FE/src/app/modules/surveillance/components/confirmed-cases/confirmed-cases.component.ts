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
import { CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { ChartType } from '../../../../core/models/chart-type';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-confirmed-cases',
  templateUrl: './confirmed-cases.component.html',
  styleUrls: ['./confirmed-cases.component.less']
})
export class ConfirmedCasesComponent extends DashboardComponent {
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any[];
  weeklySeries: any[];
  cumultativeSeries: any[];
  selectedRegionCode;
  chartType = 'column';
  totalType = 'Absolute';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];
  currentTabIndex = 0;
  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  constructor(
    protected caseDataService: CaseDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public setSeriesData() {
    this.dailySeries = [
      {
        type: this.chartType,
        name: 'Confirmed cases',
        data: this.dailyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: '7 day rolling average',
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute14DayAverage(this.dailyChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];

    this.weeklySeries = [
      {
        type: this.chartType,
        name: 'Confirmed cases',
        data: this.weeklyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      }
    ];

    this.cumultativeSeries = [
      {
        type: this.chartType,
        name: 'Confirmed cases',
        data: this.cumulativeChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: '7 day rolling average',
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute14DayAverage(this.cumulativeChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];
  }

  /**
   * Retrieve data to be displayed in graph
   * @param startDate - interval starting date
   * @param endDate - interval ending date
   */
  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.caseDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Confirmed],
        this.totalType,
        this.selectedRegionCode,
        this.startDate,
        this.endDate
      )
      .subscribe((casesData) => {
        const splitCases = new SplitData(casesData.data);

        // create daily graph datasource
        this.dailyChart = splitCases.daily();

        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly();

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.setSeriesData();
        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;

        this.hideLoading();
      });
  }

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  /**
   * Update chart type when a new chart type is selected in the dropdown
   * @param value - chart type
   */
  changeChartType(value: string): void {
    this.chartType = value;
    this.setSeriesData();
  }

  changeTotalType(ev: any): void {
    this.totalType = ev.value;
    if (this.totalType) {
      this.retrieveData();
    }
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
  }

  changeConfirmedCasesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

}
