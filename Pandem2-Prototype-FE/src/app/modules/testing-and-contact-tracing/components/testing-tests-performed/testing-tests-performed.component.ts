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
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { TestingDataService } from 'src/app/core/services/data/testing.data.service';
import { TestSubcategoryValues, TestSplitTypeValues } from '../../../../core/entities/testing-data.entity';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { GraphComponent } from 'src/app/shared/components/graph-wrapper/graph-wrapper.component';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';

@Component({
  selector: 'app-testing-tests-performed',
  templateUrl: './testing-tests-performed.component.html',
  styleUrls: ['./testing-tests-performed.component.less']
})
export class TestingTestsPerformedComponent extends DashboardComponent implements GraphComponent {
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
  LinearLog: LinearLog = Constants.linear;
  totalType = 'Absolute';
  chartType = 'column';

  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;

  dailySeries: any[];
  weeklySeries: any[];
  cumulativeSeries: any[];

  currentTabIndex = 0;

  testColors = [
    {
      name: 'NAATs',
      primary: '#004ca3',
      bold: '#0072b2'
    },
    {
      name: 'Antigen',
      primary: '#69afff',
      bold: '#8f5575'
    },
    {
      name: 'Unknown',
      primary: '#979fa8',
      bold: '#a47a5a'
    }
  ];
  plotOptions: Highcharts.PlotOptions = {
    series: {
      stacking: 'normal'
    }
  };

  // data
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected testingService: TestingDataService,
    protected customDateInterval: CustomDateIntervalService,
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

  changeAdmissionPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  updateTabIndex(value) {
    this.currentTabIndex = value;
  }

  changeTotalType(ev: MatButtonToggleChange): void {
    this.totalType = ev.value;
    this.retrieveData();
  }

  collapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    const testData = this.testingService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      this.totalType,
      TestSubcategoryValues.TestsPerformed,
      this.startDate,
      this.endDate,
      TestSplitTypeValues.TestType
    );

    forkJoin([
      testData
    ]).subscribe(results => {
      const testDataResult = results[0].data;

      const mappedSources = this.metadataService.getSourcesAndLatestDate(results[0].metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      // create daily graph datasource
      const splitTests = new SplitData(testDataResult);
      this.dailyChart = splitTests.daily();
      this.dailySeries = this.prepareData(this.dailyChart, true);
      this.weeklyChart = splitTests.weekly();
      this.weeklySeries = this.prepareData(this.weeklyChart, true);
      this.cumulativeChart = splitTests.cumulative();
      this.cumulativeSeries = this.prepareData(this.cumulativeChart, true);

      this.hideLoading();
    });
  }

  prepareData(chart: GraphDatasource, average?: boolean) {
    const series: any[] = [];

    if (!chart.split) {
      return [...series];
    }

    for (const elem of chart.split) {
      series.push(
        {
          type: this.chartType,
          name: elem.name,
          data: elem.data,
          color: this.testColors.find(item => item.name === elem.name)?.primary
        }
      );
    }
    if (average && chart !== this.weeklyChart) {
      series.push(
        {
          type: 'spline',
          name: 'Tests (7-day average)',
          pointStart: 6,
          pointInterval: 1,
          data: ChartDataUtils.compute7DayAverage(chart.total.yAxis[0].data),
          color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR
        }
      );
    }

    return [...series];
  }

  tabClick(ev: MatTabChangeEvent): void {
    this.components.toArray()[ev.index].forceUpdate();
  }

}
