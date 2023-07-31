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
import { ContactTotalTypeValues } from 'src/app/core/entities/contact-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import {
  GraphDatasource,
  SplitData
} from 'src/app/core/helperClasses/split-data';
import { ContactModel, DailyContactModel } from 'src/app/core/models/contact-data.model';
import { DailyDataModel } from 'src/app/core/models/generic-graph-data.model';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { ContactDataService } from '../../../../core/services/data/contact.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import * as moment from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';

@Component({
  selector: 'app-contact-tracing-total-of-contact-identified',
  templateUrl: './contact-tracing-total-of-contact-identified.component.html',
  styleUrls: ['./contact-tracing-total-of-contact-identified.component.less']
})
export class ContactTracingTotalOfContactIdentifiedComponent extends DashboardComponent {
  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '4 Weeks', value: '4w' },
    { name: '2 Weeks', value: '2w' }
  ];

  chartType = ChartType.STACKED;
  chartTypes = [
    { value: ChartType.LINE, label: 'Line Chart' },
    { value: ChartType.STACKED, label: 'Stacked Bar Chart' },
    { value: ChartType.GROUPED, label: 'Grouped Bar Chart' }
  ];

  chartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    }
  };

  isIdentifiedContactsDisabled = false;
  isIdentifiedContactsChecked = true;
  isReachedContactsDisabled = false;
  isReachedContactsChecked = true;
  isReachedInADayDisabled = false;
  isReachedInADayChecked = true;

  weeklyChartIdentifiedContacts: GraphDatasource;
  weeklyChartReachedContacts: GraphDatasource;
  weeklyChartReachedInADayContacts: GraphDatasource;
  weeklySeries: any[] = [];

  isCollapsed = false;
  lastDate?: moment.Moment;
  sources = [];

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected contactDataService: ContactDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  changeTimeInterval(value: { start_date: string; end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  changeChartType(value: string): void {
    this.chartType = value as ChartType;

    // grouping only for Grouped Bar Chart
    this.chartPlotOptions.column.grouping = value === ChartType.GROUPED;

    // show only the averages for Line Chart
    this.weeklySeries = this.weeklySeries.map((item) => {
      if (value === ChartType.LINE && item.type !== 'spline') {
        item.visible = false;
        item.showInLegend = false;
      } else {
        item.visible = true;
        item.showInLegend = true;
      }

      return item;
    });
    this.weeklySeries = [];
    this.prepareData(
      this.weeklySeries,
      this.weeklyChartIdentifiedContacts,
      this.weeklyChartReachedContacts,
      this.weeklyChartReachedInADayContacts
    );
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

    this.contactDataService
      .getDailyContacts(
        ContactTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.startDate,
        this.endDate
      )
      .subscribe((contactResponse: ContactModel) => {
        const contactData: DailyContactModel[] = contactResponse.data;
        const identifiedContacts: DailyDataModel[] = contactData.map((c) => ({
          date: c.date,
          total: c.total,
          split: c.split
        }));
        const reachedContacts: DailyDataModel[] = contactData.map((c) => ({
          date: c.date,
          total: c.reached,
          split: c.split
        }));
        const reachedInADayContacts: DailyDataModel[] = contactData.map(
          (c) => ({
            date: c.date,
            total: c.reached_within_a_day,
            split: c.split
          })
        );

        this.sources = [];
        if (contactResponse.metadata && contactResponse.metadata.sources?.length) {
          this.sources.push(...contactResponse.metadata.sources);
          this.sources.forEach(source => {
            if (!this.lastDate) {
              this.lastDate = moment(source.date);
            } else if (source.date && moment(source.date).isAfter(this.lastDate)) {
              this.lastDate = moment(source.date);
            }
          });
        }

        const splitIdentifiedContacts = new SplitData(identifiedContacts);
        const splitReachedContacts = new SplitData(reachedContacts);
        const splitReachedInADayContacts = new SplitData(reachedInADayContacts);

        this.weeklyChartIdentifiedContacts = splitIdentifiedContacts.weekly();
        this.weeklyChartReachedContacts = splitReachedContacts.weekly();
        this.weeklyChartReachedInADayContacts =
          splitReachedInADayContacts.weekly();

        this.weeklySeries = [];
        this.prepareData(
          this.weeklySeries,
          this.weeklyChartIdentifiedContacts,
          this.weeklyChartReachedContacts,
          this.weeklyChartReachedInADayContacts
        );
        this.hideLoading();
      });
  }

  prepareData(
    series: any,
    chartSplitIdentifiedContacts: any,
    chartSplitReachedContacts: any,
    chartSplitReachedInADayContacts: any
  ): any[] {
    // Identified contacts
    if (this.isIdentifiedContactsChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: 'Identified Contacts',
        data: chartSplitIdentifiedContacts.total.yAxis[0].data,
        color: '#009e73'
      });
    }

    // Reached contacts
    if (this.isReachedContactsChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: 'Reached Contacts',
        data: chartSplitReachedContacts.total.yAxis[0].data,
        color: '#0072b2'
      });
    }

    // Reached in a day contacts
    if (this.isReachedInADayChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: 'Reached within day Contacts',
        data: chartSplitReachedInADayContacts.total.yAxis[0].data,
        color: '#56b4e9'
      });
    }
    return series;
  }

  setContactTracingType(_$event): void {
    this.isReachedInADayDisabled = !this.isIdentifiedContactsChecked && !this.isReachedContactsChecked;

    this.isReachedContactsDisabled = !this.isIdentifiedContactsChecked && !this.isReachedInADayChecked;

    this.isIdentifiedContactsDisabled = !this.isReachedContactsChecked && !this.isReachedInADayChecked;

    this.retrieveData();
  }
}
