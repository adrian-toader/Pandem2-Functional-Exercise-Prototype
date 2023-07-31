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
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SplitData } from 'src/app/core/helperClasses/split-data';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import {
  ParticipatorySurveillanceSubcategories
} from '../../../../core/entities/participatorySurveillance-data.entity';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';

@Component({
  selector: 'app-participatory-covid-incidence',
  templateUrl: './participatory-covid-incidence.component.html'
})
export class ParticipatoryCovidIncidenceComponent extends DashboardComponent {
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];
  weeklyChartIncidenceILI: any;
  weeklyChartIncidenceCovid: any;
  series: any[] = [];
  isCollapsed = false;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;

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

    // ILI incidence is only per week
    const incidenceILI = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ILIIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    );

    const incidenceCovid = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.CovidIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    );

    forkJoin([
      incidenceILI,
      incidenceCovid
    ]).subscribe(results => {
      const incidenceILIResults = results[0].data; // .filter(item => item.total);
      const incidenceCovidResults = results[1].data; // .filter(item => iliResultsMap[item.date]);

      const splitIncidenceILI = new SplitData(incidenceILIResults);
      const splitIncidenceCovid = new SplitData(incidenceCovidResults);

      // create weekly graph datasource
      this.weeklyChartIncidenceILI = splitIncidenceILI.weeklyIncidence();
      this.weeklyChartIncidenceCovid = splitIncidenceCovid.weeklyIncidence();

      this.series = [
        {
          type: 'spline',
          name: 'Incidence (Avian Influenza/per 1000)',
          data: this.weeklyChartIncidenceILI.total.yAxis[0].data,
          color: '#D55E00'
        },
        {
          type: 'arearange',
          name: 'Incidence Confidence',
          data: this.weeklyChartIncidenceILI.confluenceData,
          color: '#D55E00',
          fillOpacity: 0.3,
          lineWidth: 0,
          marker: {
            enabled: false
          },
          showInLegend: true,
          enableMouseTracking: false
        },
        {
          type: 'spline',
          name: 'Avian Influenza (Avian Influenza/per 1000)',
          data: this.weeklyChartIncidenceCovid.total.yAxis[0].data,
          color: '#009E73'
        },
        {
          type: 'arearange',
          name: 'Avian Influenza Confidence',
          data: this.weeklyChartIncidenceCovid.confluenceData,
          color: '#009E73',
          fillOpacity: 0.3,
          lineWidth: 0,
          marker: {
            enabled: false
          },
          showInLegend: true,
          enableMouseTracking: false
        }
      ];

      const mappedSources = this.metadataService.getSourcesAndLatestDate(
        Object.assign({}, results[0].metadata, results[1].metadata)
      );
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      this.hideLoading();
    });
  }
}
