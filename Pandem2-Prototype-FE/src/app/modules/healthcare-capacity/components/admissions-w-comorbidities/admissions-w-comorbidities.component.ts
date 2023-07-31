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
import { PatientAdmissionType, PatientSplitType, PatientTotalType } from 'src/app/core/entities/patient-data.entity';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';

import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PeriodTypes } from '../../../../shared/constants';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-admissions-w-comorbidities',
  templateUrl: './admissions-w-comorbidities.component.html',
  styleUrls: ['./admissions-w-comorbidities.component.less']
})
export class AdmissionsWComorbiditiesComponent extends DashboardComponent {
  interval = 'all';
  admissionType: string = PatientAdmissionType.Hospital;
  split: string = PatientSplitType.HasComorbidities;
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any;
  weeklySeries: any;
  cumulativeSeries: any;
  chartType = 'column';
  selectedRegionCode;
  totalType: string = PatientTotalType.Absolute;
  stackingType: string = 'normal';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '4 Weeks', value: '4w' },
    { name: '2 Weeks', value: '2w' }
  ];

  LinearLog: LinearLog = Constants.linear;

  tabIndexToPeriodType = {
    0: PeriodTypes.Daily,
    1: PeriodTypes.Weekly,
    2: PeriodTypes.Weekly
  };

  currentTabIndex;

  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  graphType: string = 'absoluteNumbers';

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalisationDataService: HospitalizationDataService,
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
    this.retrieveData();
  }

  admissionChanged(): void {
    this.retrieveData(this.startDate, this.endDate);
  }

  changeAdmissionsComorbidities(ev: MatButtonToggleChange) {
    this.LinearLog = ev.value;
    this.retrieveData(this.startDate, this.endDate);
  }

  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    // depending on graph type we may need additional data
    // for proportion we also need total numbers
    const requestsToDo = [
      // admissions with comorbidities
      this.hospitalisationDataService
        .getPatientsHospitalisationResponse(
          this.totalType,
          this.admissionType,
          this.selectedRegionCode,
          this.split,
          this.startDate,
          this.endDate,
          this.currentTabIndex !== undefined ?
            this.tabIndexToPeriodType[this.currentTabIndex] :
            undefined
        )
    ];

    if (this.graphType === 'proportion') {
      // total admissions
      requestsToDo.push(
        this.hospitalisationDataService
          .getPatientsHospitalisationResponse(
            this.totalType,
            this.admissionType,
            this.selectedRegionCode,
            PatientSplitType.AdmissionType,
            this.startDate,
            this.endDate,
            this.currentTabIndex !== undefined ?
              this.tabIndexToPeriodType[this.currentTabIndex] :
              undefined
          )
      );
    }

    forkJoin(requestsToDo)
      .subscribe((results) => {
        let splitPatients;
        if (!results[1]) {
          // absolute numbers
          splitPatients = new SplitData(results[0].data);
        } else {
          // proportion; needs to be calculated
          const totalAdmissionsMap = results[1].data.reduce((acc, item) => {
            acc[item.date] = item.total;
            return acc;
          }, {});

          const admissionsWithComorbidities = results[0].data;
          admissionsWithComorbidities.forEach(item => {
            if (totalAdmissionsMap[item.date]) {
              item.total = item.total * 100 / totalAdmissionsMap[item.date];
            } else {
              item.total = 0;
            }
          });

          splitPatients = new SplitData(admissionsWithComorbidities);
        }

        // initial call
        if (this.currentTabIndex === undefined) {
          const resultPeriodType = results[0].metadata.period_type;
          this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
            index => this.tabIndexToPeriodType[index] === resultPeriodType
          ), 10);
        }

        const mappedSources = this.metadataService.getSourcesAndLatestDate(results[0].metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;

        this.sortSplitData(splitPatients.data);

        this.dailyChart = splitPatients.daily();
        this.weeklyChart = splitPatients.weekly();
        if (!results[1]) {
          this.cumulativeChart = splitPatients.cumulative();
        } else {
          this.cumulativeChart = new SplitData([]).cumulative();
        }

        this.dailySeries = [
          {
            type: this.chartType,
            name: 'With Comorbidities',
            data: this.dailyChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary
          },
          {
            type: 'spline',
            name: '7 day rolling average',
            pointStart: 6,
            pointInterval: 1,
            stacking: this.stackingType,
            data: ChartDataUtils.compute7DayAverage(this.dailyChart.total.yAxis[0].data),
            color: this.colors.find(item => item.name === this.admissionType).bold
          }
        ];

        this.weeklySeries = [
          {
            type: this.chartType,
            name: 'With Comorbidities',
            data: this.weeklyChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary
          }
        ];

        this.cumulativeSeries = [
          {
            type: this.chartType,
            name: 'With Comorbidities',
            data: this.cumulativeChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary
          },
          {
            type: 'spline',
            name: '7 day rolling average',
            pointStart: 6,
            pointInterval: 1,
            stacking: this.stackingType,
            data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.total.yAxis[0].data),
            color: this.colors.find(item => item.name === this.admissionType).bold
          }
        ];

        this.hideLoading();
      });
  }

  public toggleTotalType(event: MatButtonToggleChange): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.graphType = 'proportion';
    } else {
      this.totalType = event.value;
      this.graphType = 'absoluteNumbers';
    }
    this.retrieveData(this.startDate, this.endDate);
  }
}
