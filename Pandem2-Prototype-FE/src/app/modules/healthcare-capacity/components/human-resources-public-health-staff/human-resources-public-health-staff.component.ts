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
import { Component, ViewChild } from '@angular/core';
import { CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { DailyCasesModel } from '../../../../core/models/case-data.model';
import { DailyHumanResourceModel } from '../../../../core/models/humanResources-data.model';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { HumanResourceSplitTypes, HumanResourceStaffTypes } from 'src/app/core/entities/humanResources-data.entity';
import { DailyDataModel } from '../../../../core/models/generic-graph-data.model';
import * as moment from 'moment';
import { Constants, GRAPH_FILTER_BUTTONS } from '../../../../core/models/constants';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { TooltipSynchronisationService, SyncCharts } from '../../../../core/services/helper/tooltip-synchronisation.service';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-human-resources-public-health-staff',
  templateUrl: './human-resources-public-health-staff.component.html',
  styleUrls: ['./human-resources-public-health-staff.component.less']
})
export class HumanResourcesPublicHealthStaffComponent extends DashboardComponent {
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;
  totalType = 'Absolute';
  proportionIncreaseChart = false;
  dailyCaseChart: GraphDatasource;
  dailyHRChart: GraphDatasource;
  dailyCaseSeries: any[] = [];
  syncCharts = SyncCharts;
  dailyHRSeries: any[] = [];
  chartType = 'column';
  publicHealthStaffYAxisSettings: any = undefined;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '4 Weeks', value: '4w' },
    { name: '2 Weeks', value: '2w' }
  ];

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    protected caseDataService: CaseDataService,
    protected humanResourcesDataService: HumanResourcesDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
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

    const skipDays = this.startDate && this.proportionIncreaseChart ? 1 : 0;
    const queryStartDate = this.startDate && this.proportionIncreaseChart ? moment(this.startDate).subtract(skipDays, 'd').format(Constants.DEFAULT_DATE_FORMAT) : this.startDate;

    const caseChartData = this.caseDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      this.totalType,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );
    const HRChartData = this.humanResourcesDataService.getDailyHumanResources(
      this.selectedRegionCode,
      this.totalType,
      queryStartDate,
      this.endDate,
      HumanResourceSplitTypes.StaffType
    );

    forkJoin([
      caseChartData,
      HRChartData
    ]
    ).subscribe(results => {
      const casesDataWithMetadata: { data: DailyCasesModel[], metadata: any } = results[0];
      const HRData: DailyHumanResourceModel[] = results[1].data;
      const publicHRData: DailyDataModel[] = [];
      HRData.forEach(hrElement => {
        if (hrElement.split) {
          const publicSplit = hrElement.split.find(el => el.split_value === HumanResourceStaffTypes.Public);
          publicHRData.push(new DailyDataModel({
            total: publicSplit ? publicSplit.total : 0,
            date: hrElement.date
          }));
        }
      });
      const splitCases = new SplitData(casesDataWithMetadata.data);
      const splitHR = new SplitData(publicHRData);
      // create daily graph datasource

      this.dailyCaseChart = splitCases.daily();
      this.dailyCaseSeries = [
        {
          type: 'column',
          name: 'Cases',
          data: this.dailyCaseChart.total.yAxis[0].data,
          color: '#0072b2'
        },
        {
          type: 'spline',
          name: '7 day rolling average',
          pointStart: 6,
          color: Constants.FOURTEEN_DAY_AVERAGE_LINE_COLOR,
          pointInterval: 1,
          data: ChartDataUtils.compute7DayAverage(this.dailyCaseChart.total.yAxis[0].data)
        }
      ];

      if (this.proportionIncreaseChart) {
        this.dailyHRChart = splitHR.dailyProportionalIncrease(skipDays);
        const dailyPublicHealthStaffData = this.dailyHRChart.total.yAxis[0].data;
        const minValue = Math.min.apply(null, dailyPublicHealthStaffData);

        this.publicHealthStaffYAxisSettings = {
          min: minValue < 0 ? Math.floor(minValue) - 5 : -10
        };

        const dailyOver100Data = [];
        const dailyIncreaseData = [];
        const dailyDecreaseData = [];

        for (const dailyData of dailyPublicHealthStaffData) {
          if (parseFloat(dailyData) > 100) {
            dailyOver100Data.push(dailyData);
            dailyIncreaseData.push(null);
            dailyDecreaseData.push(null);
          }
          else if (parseFloat(dailyData) >= 0) {
            dailyOver100Data.push(null);
            dailyIncreaseData.push(dailyData);
            dailyDecreaseData.push(null);
          }
          else {
            dailyOver100Data.push(null);
            dailyIncreaseData.push(null);
            dailyDecreaseData.push(dailyData);
          }
        }

        delete this.dailyHRSeries;
        this.dailyHRSeries = [];

        this.dailyHRSeries.push({
          type: 'column',
          name: 'Over 100% increase',
          data: dailyOver100Data,
          stacking: 'normal',
          color: '#012e47'
        });

        this.dailyHRSeries.push({
          type: 'column',
          name: '% Increase',
          data: dailyIncreaseData,
          stacking: 'normal',
          color: '#0072b2'
        });

        this.dailyHRSeries.push({
          type: 'column',
          name: '% Decrease',
          data: dailyDecreaseData,
          stacking: 'normal',
          color: '#e69f00'
        });
      }
      else {
        this.dailyHRChart = splitHR.daily();

        this.publicHealthStaffYAxisSettings = {
          min: 0
        };

        this.dailyHRSeries = [
          {
            type: 'column',
            name: 'Public Health Staff',
            data: this.dailyHRChart.total.yAxis[0].data,
            color: '#0072b2'
          },
          {
            type: 'spline',
            name: '7 day rolling average',
            pointStart: 6,
            color: Constants.FOURTEEN_DAY_AVERAGE_LINE_COLOR,
            pointInterval: 1,
            data: ChartDataUtils.compute7DayAverage(this.dailyHRChart.total.yAxis[0].data)
          }
        ];
      }

      const mappedSources = this.metadataService.getSourcesAndLatestDate(casesDataWithMetadata.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      this.hideLoading();
    });
  }

  changeTimeInterval(value: { start_date: string; end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  changeTotalType(event: any): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.proportionIncreaseChart = true;
    } else {
      this.totalType = event.value;
      this.proportionIncreaseChart = false;
    }
    this.retrieveData();
  }
}
