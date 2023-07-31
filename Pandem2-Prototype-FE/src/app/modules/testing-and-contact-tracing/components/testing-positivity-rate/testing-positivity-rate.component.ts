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
import { Component, QueryList, ViewChildren } from '@angular/core';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { TestingDataService } from '../../../../core/services/data/testing.data.service';
import {
  TestSubcategoryValues,
  TestTotalTypeValues
} from '../../../../core/entities/testing-data.entity';
import { Constants } from '../../../../core/models/constants';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { GraphComponent } from 'src/app/shared/components/graph-wrapper/graph-wrapper.component';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import * as moment from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { CaseSubcategories, CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DateFormatISODate } from '../../../../shared/constants';

@Component({
  selector: 'app-testing-positivity-rate',
  templateUrl: './testing-positivity-rate.component.html',
  styleUrls: ['./testing-positivity-rate.component.less']
})
export class TestingPositivityRateComponent extends DashboardComponent implements GraphComponent {
  @ViewChildren('chart') components: QueryList<HighchartsComponent>;
  data;
  isCollapsed = false;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 MONTHS', value: '6m' },
    { name: '3 MONTHS', value: '3m' },
    { name: '4 WEEKS', value: '4w' },
    { name: '2 WEEKS', value: '2w' }
  ];
  secondYAxis = {
    opposite: true, labels: {
      format: '{value}%'
    },
    title: {
      text: ''
    },
    max: 100,
    min: 0
  };

  chartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    }
  };

  sevenDayMeanDisabled = false;
  sevenDayMean = true;
  totalTestsDisabled = false;
  totalTests = true;
  positiveTestsDisabled = false;
  positiveTests = true;
  currentTabIndex = 0;

  dailyChartPositive: GraphDatasource;
  weeklyChartPositive: GraphDatasource;
  dailyChartTotal: GraphDatasource;
  weeklyChartTotal: GraphDatasource;
  dailySeries;
  weeklySeries;

  // data
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected testingDataService: TestingDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected caseDataService: CaseDataService,
    protected storageService: StorageService,
    protected metadataService: MetadataService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  collapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  updateTabIndex(value) {
    this.currentTabIndex = value;
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    const tests = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      this.startDate,
      this.endDate
    );

    const positiveTests = this.caseDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );

    forkJoin([
      tests,
      positiveTests
    ]).subscribe(results => {
      const sources = (results[0].metadata.sources || []).concat((results[1].metadata.sources || []));
      const mappedSources = this.metadataService.getSourcesAndLatestDate({ sources });
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      const totalTestsData = results[0].data;
      const positiveTestsData = results[1].data;

      // use the same timespan
      const totalTestsDataMapped = totalTestsData.reduce((acc, item) => {
        acc[item.date] = item.total;
        return acc;
      }, {});
      const positiveTestsDataMapped = positiveTestsData.reduce((acc, item) => {
        acc[item.date] = item.total;
        return acc;
      }, {});

      const totalTestsStartDate = moment.utc(totalTestsData[0]?.date);
      const positiveTestsStartDate = moment.utc(positiveTestsData[0]?.date);
      const dataStartDate = totalTestsStartDate.isBefore(positiveTestsStartDate) ?
        totalTestsStartDate :
        positiveTestsStartDate;
      let currentDate = this.startDate ?
        this.startDate :
        dataStartDate;
      currentDate = moment.utc(currentDate);
      const dateEndDate = moment.utc(this.endDate);

      const normalizedTotalTestsData = [];
      const normalizedPositiveTestsData = [];
      while (currentDate.isSameOrBefore(dateEndDate)) {
        const key = currentDate.format(DateFormatISODate);
        if (totalTestsDataMapped[key] === undefined) {
          totalTestsDataMapped[key] = 0;
        }
        normalizedTotalTestsData.push({
          date: key,
          total: totalTestsDataMapped[key]
        });

        if (positiveTestsDataMapped[key] === undefined) {
          positiveTestsDataMapped[key] = 0;
        }
        normalizedPositiveTestsData.push({
          date: key,
          total: positiveTestsDataMapped[key]
        });

        currentDate.add(1, 'day');
      }

      const splitPositiveTests = new SplitData(normalizedPositiveTestsData);
      const splitTotalTests = new SplitData(normalizedTotalTestsData);

      // create daily graph datasource
      this.dailyChartPositive = splitPositiveTests.daily();
      this.weeklyChartPositive = splitPositiveTests.weekly();

      this.dailyChartTotal = splitTotalTests.daily();
      this.weeklyChartTotal = splitTotalTests.weekly();

      this.dailySeries = [];
      this.prepareData(this.dailySeries, this.dailyChartPositive, this.dailyChartTotal);

      this.weeklySeries = [];
      this.prepareData(this.weeklySeries, this.weeklyChartPositive, this.weeklyChartTotal);
      this.hideLoading();
    });
  }

  prepareData(series: any, chartPositive: any, chartTotal: any): any[] {
    // Total Tests
    if (this.totalTests) {
      series.push(
        {
          type: 'column',
          yAxis: 0,
          name: 'Total Tests',
          data: chartTotal.total.yAxis[0].data,
          color: '#0072b2'
        }
      );
    }

    const percentageOfPositiveTests = [];
    for (let i = 0; i < chartTotal.total.yAxis[0].data.length; i++) {
      if (
        !isNaN(chartPositive.total.yAxis[0].data[i]) &&
        chartPositive.total.yAxis[0].data[i] > 0 &&
        !isNaN(chartTotal.total.yAxis[0].data[i]) &&
        chartTotal.total.yAxis[0].data[i] > 0
      ) {
        percentageOfPositiveTests.push(chartPositive.total.yAxis[0].data[i] / chartTotal.total.yAxis[0].data[i] * 100);
      } else {
        percentageOfPositiveTests.push(0);
      }
    }
    // Positive Tests
    if (this.positiveTests) {
      series.push(
        {
          type: 'column',
          name: 'Positive Tests',
          yAxis: 0,
          data: chartPositive.total.yAxis[0].data,
          color: '#e69f00'
        }
      );
    }

    // Percentage of positive tests (7-day mean)
    if (this.sevenDayMean && series !== this.weeklySeries) {
      // Percentage of positive tests (7-day mean)
      series.push(
        {
          type: 'spline',
          name: 'Percentage of positive tests (7-day mean)',
          pointStart: 6,
          pointInterval: 1,
          yAxis: 1,
          data: ChartDataUtils.compute7DayAverage(percentageOfPositiveTests),
          color: '#264c61',
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.1f}%</b></td></tr>', footerFormat: '</table>'
          }
        }
      );
    }

    // Threshold set by WHO
    series.push({
      type: 'spline',
      name: 'Threshold set by WHO',
      yAxis: 1,
      data: new Array(chartPositive.total.xAxis.length).fill(Constants.TESTING_THRESHOLD_WHO),
      color: '#f0e444',
      dashStyle: 'longdash',
      // Do not display it on tooltip
      tooltip: {
        headerformat: '',
        pointFormat: ''
      }
    });

    return series;
  }


  setChartSeries(_$event): void {
    if (!this.sevenDayMean && !this.totalTests) {
      this.positiveTestsDisabled = true;
    } else {
      this.positiveTestsDisabled = false;
    }

    if (!this.sevenDayMean && !this.positiveTests) {
      this.totalTestsDisabled = true;
    } else {
      this.totalTestsDisabled = false;
    }

    if (!this.totalTests && !this.positiveTests) {
      this.sevenDayMeanDisabled = true;
    } else {
      this.sevenDayMeanDisabled = false;
    }

    this.retrieveData();
  }

  tabClick(ev: MatTabChangeEvent): void {
    this.components.toArray()[ev.index].forceUpdate();
  }
}
