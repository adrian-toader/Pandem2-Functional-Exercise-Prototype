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
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import {
  ContactTracingModel
} from '../../../../core/models/case-data.model';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import * as moment from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';

@Component({
  selector: 'app-contact-tracing-total-of-diagnosed-cases',
  templateUrl: './contact-tracing-total-of-diagnosed-cases.component.html',
  styleUrls: ['../contact-tracing-total-of-contact-identified/contact-tracing-total-of-contact-identified.component.less']
})
export class ContactTracingTotalOfDiagnosedCasesComponent extends DashboardComponent {

  @ViewChildren(HighchartsComponent) chartComponents: QueryList<HighchartsComponent>;
  @ViewChildren(MatSlideToggle) toggleComponents: QueryList<MatSlideToggle>;

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
    { value: ChartType.STACKED, label: 'Stacked Bar Chart' },
    { value: ChartType.GROUPED, label: 'Grouped Bar Chart' }
  ];

  chartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    }
  };

  graphColors = {
    CasesIdentified: {
      primary: '#009e73',
      bold: '#01664b'
    },
    CasesReached: {
      primary: '#0072b2',
      bold: '#014c75'
    },
    CasesReachedWithinDay: {
      primary: '#56b4e9',
      bold: '#1f6f9c'
    }
  };

  isCollapsed = false;
  isIdentifiedCasesDisabled = false;
  isIdentifiedCasesChecked = true;
  isReachedCasesDisabled = false;
  isReachedCasesChecked = true;
  isReachedInADayDisabled = false;
  isReachedInADayChecked = true;

  weeklyChart: GraphDatasource;
  weeklySeries: any[] = [];
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
    this.updateData();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  setContactTracingType(_ev: MatSlideToggleChange): void {
    let checkedCounter = 0;
    for (const toggle of this.toggleComponents) {
      if (toggle.checked) {
        checkedCounter++;
      }
    }

    if (checkedCounter === 1) {
      for (const toggle of this.toggleComponents) {
        if (toggle.checked) {
          toggle.disabled = true;
        }
      }
    } else {
      for (const toggle of this.toggleComponents) {
        toggle.disabled = false;
      }
    }

    this.retrieveData();
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
    ).subscribe((casesData: ContactTracingModel) => {
      const splitCases = new SplitData(casesData.data);
      this.weeklyChart = splitCases.weeklyCaseContacts();

      this.sources = [];
      if (casesData.metadata && casesData.metadata.sources?.length) {
        this.sources.push(...casesData.metadata.sources);
        this.sources.forEach(source => {
          if (!this.lastDate) {
            this.lastDate = moment(source.date);
          } else if (source.date && moment(source.date).isAfter(this.lastDate)) {
            this.lastDate = moment(source.date);
          }
        });
      }

      this.updateData();
    });
  }

  updateData(): void {
    delete this.weeklySeries;
    this.weeklySeries = [];
    this.prepareData(this.weeklySeries, this.weeklyChart);

    for (const component of this.chartComponents.toArray()) {
      component.forceUpdate();
    }

    this.hideLoading();
  }

  prepareData(series: any, _data: any): void {
    if (this.isIdentifiedCasesChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Identified cases').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Identified cases').data,
        color: this.graphColors.CasesIdentified.primary
      });
    }

    if (this.isReachedCasesChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached cases').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached cases').data,
        color: this.graphColors.CasesReached.primary
      });
    }

    if (this.isReachedInADayChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached within a day').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached within a day').data,
        color: this.graphColors.CasesReachedWithinDay.primary
      });
    }
  }
}
