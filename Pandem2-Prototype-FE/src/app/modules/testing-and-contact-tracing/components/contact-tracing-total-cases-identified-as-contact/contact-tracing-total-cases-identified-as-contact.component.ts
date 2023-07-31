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
import { CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { ContactTracingModel, DailyContactTracingModel } from 'src/app/core/models/case-data.model';
import { DailyDataModel } from 'src/app/core/models/generic-graph-data.model';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import * as moment from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';


@Component({
  selector: 'app-contact-tracing-total-cases-identified-as-contact',
  templateUrl: './contact-tracing-total-cases-identified-as-contact.component.html'
})
export class ContactTracingTotalCasesIdentifiedAsContactComponent extends DashboardComponent {
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '4 Weeks', value: '4w' },
    { name: '2 Weeks', value: '2w' }
  ];

  chartType = ChartType.STACKED;
  chartTypes = [
    { value: ChartType.LINE, label: 'Line Chart' },
    { value: ChartType.STACKED, label: 'Stacked Bar Chart' }
  ];

  weeklyChartIdentifiedAsContact: GraphDatasource;
  weeklySeries: any[] = [];
  isCollapsed = false;
  lastDate?: moment.Moment;
  sources = [];

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  changeChartType(value: string): void {
    this.chartType = value as ChartType;
    this.prepareData();
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

    this.caseDataService.getDailyCasesContactTracing(
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    ).subscribe((caseResponse: ContactTracingModel) => {
      const caseData: DailyContactTracingModel[] = caseResponse.data;
      const casesIdentifiedAsContacts: DailyDataModel[] = caseData.map((c) => ({
        date: c.date,
        total: c.were_previous_contacts,
        split: c.split
      }));

      this.sources = [];
      if (caseResponse.metadata && caseResponse.metadata.sources?.length) {
        this.sources.push(...caseResponse.metadata.sources);
        this.sources.forEach(source => {
          if (!this.lastDate) {
            this.lastDate = moment(source.date);
          } else if (source.date && moment(source.date).isAfter(this.lastDate)) {
            this.lastDate = moment(source.date);
          }
        });
      }

      const splitCasesIdentifiedAsContact = new SplitData(casesIdentifiedAsContacts);

      this.weeklyChartIdentifiedAsContact = splitCasesIdentifiedAsContact.weekly();
      this.prepareData();
      this.hideLoading();
    });
  }
  prepareData(): void {
    this.weeklySeries = [
      {
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: 'Cases identified as contact',
        data: this.weeklyChartIdentifiedAsContact.total.yAxis[0].data,
        color: '#0072b2'
      }
    ];
  }

}
