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
import { CaseSubcategories, CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';

import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';

@Component({
  selector: 'app-reproduction-number',
  templateUrl: './reproduction-number.component.html',
  styleUrls: ['./reproduction-number.component.less']
})
export class ReproductionNumberComponent
  extends DashboardComponent {
  chartType = 'line';
  highcharts = Highcharts;
  dailyChart: GraphDatasource;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];
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

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string; end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;

    this.retrieveData();
  }

  /**
   * Retrieve data to be displayed in graph
   * @param startDate - interval starting date
   * @param endDate - interval ending date
   */
  public retrieveData(startDate?: string, endDate?: string): void {

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.showLoading();
    this.caseDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.ReproductionNumber],
        CaseTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.startDate,
        this.endDate
      )
      .subscribe((casesData) => {
        const splitCases = new SplitData(casesData.data);

        // create daily graph datasource
        this.dailyChart = splitCases.daily();
        this.dailyChart.total.yAxis[0].name = 'Reproduction number';
        this.dailyChart.total.yAxis[0]['color'] = this.color_palette[0];

        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;

        this.hideLoading();
      });
  }

  changeReproductionPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
