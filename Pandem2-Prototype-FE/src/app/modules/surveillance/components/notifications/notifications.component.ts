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
import * as Highcharts from 'highcharts';

import { CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { ChartType } from '../../../../core/models/chart-type';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less']
})
export class NotificationsComponent extends DashboardComponent {
  chartOptions = {
    chart: {
      type: 'line'
    },
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['17/11/2021', '18/11/2021', '19/11/2021', '20/11/2021', '21/11/2021', '22/11/2021', '23/11/2021'],
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of notifications'
      }
    },
    tooltip: {
      headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
        '<td style = "padding:0"><b>{point.y:.1f}k</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
    },
    plotOptions: {
      column: {
        borderWidth: 0
      }
    },
    series: [{
      type: 'column',
      name: 'Contacts',
      data: [300, 765, 302, 1000, 535, 234, 643]
    }, {
      type: 'spline',
      name: '',
      data: [200, 563, 258, 764, 400, 220, 600]
    }
    ]
  };

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];

  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;

  dailySeries: any[];
  weeklySeries: any[];
  cumulativeSeries: any[];
  currentTabIndex = 0;

  chartType = 'column';
  totalType = 'Absolute';
  splitChartOptions: Highcharts.PlotOptions = {
    column: {
      borderWidth: 0,
      pointPadding: 0.11,
      groupPadding: 0.11
    },
    series: {
      stacking: 'normal'
    }
  };
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
        name: 'Notifications',
        data: this.dailyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: '7 day rolling average',
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute7DayAverage(this.dailyChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];

    this.weeklySeries = [
      {
        type: this.chartType,
        name: 'Notifications',
        data: this.weeklyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      }
    ];

    this.cumulativeSeries = [
      {
        type: this.chartType,
        name: 'Notifications',
        data: this.cumulativeChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: '7 day rolling average',
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];
  }

  /**
   * Retrieve data to be displayed in graph
   */
  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.caseDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Notification],
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
   * Update chart type when a new chart type is selected the dropdown
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

  changeNotificationsPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
