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
import { Component, OnDestroy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import {
  DoseType,
  DoseTypeName,
  Population,
  VaccinationSplitType,
  VaccinationTotal
} from 'src/app/core/entities/vaccination-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SourceType } from 'src/app/core/models/i-source';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Constants } from '../../../../core/models/constants';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SplitDataV2 } from '../../../../core/helperClasses/split-data-v2';
import { DailyVaccinationsModel } from '../../../../core/models/vaccination-data.model';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { LabelMappingDataService } from '../../../../core/services/data/label-mapping.data.service';
import { ApiQueryBuilder } from '../../../../core/helperClasses/api-query-builder';
import { LabelMappingResource } from '../../../../core/entities/labelMapping-data.entity';
import { LabelMappingModel } from '../../../../core/models/labelMapping.model';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-vaccination-coverage',
  templateUrl: './vaccination-coverage.component.html',
  styleUrls: ['./vaccination-coverage.component.less']
})
export class VaccinationCoverageComponent extends DashboardComponent implements OnDestroy {

  // data
  data: SplitDataV2<DailyVaccinationsModel, DoseType>;
  population: Population = Population.AllPopulation;
  populationLabel: string = '';
  labelMappings: LabelMappingModel[] = [];

  // vaccination uptake
  summarySeries: {
    key: string,
    name: string,
    data: number[],
    color: string,
    type: 'column' | undefined
  }[] = [];
  chartPlotOptions: Highcharts.PlotOptions = {
    bar: {
      grouping: false
    },
    series: {
      stacking: undefined
    }
  };
  chartToolTip = {
    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> %<br/>',
    shared: true
  };
  barChartOptions: Highcharts.ChartOptions = {
    type: 'bar',
    height: 150
  };
  chartOptions: Highcharts.ChartOptions = {
    marginLeft: 60
  };

  // vaccination uptake - over time
  overTimeSeries: {
    name: string,
    zIndex: number,
    data: number[],
    color: string,
    type: 'column' | 'spline' | undefined,
    pointStart: number | undefined,
    pointInterval: number | undefined,
    stacking: string | undefined,
  }[];
  casesChartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    },
    series: {
      stacking: undefined
    },
    bar: {
      groupPadding: 0,
      pointPadding: 0
    }
  };

  // options
  chartsIntervalOptions: {
    name: string,
    value: string
  }[] = [
      { name: 'ALL', value: 'all' },
      { name: '6 MONTHS', value: '6m' },
      { name: '3 MONTHS', value: '3m' },
      { name: '4 WEEKS', value: '4w' },
      { name: '2 WEEKS', value: '2w' }
    ];

  // constants
  SourceType = SourceType;
  Population = Population;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationDataService: VaccinationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected metadataService: MetadataService,
    protected labelMappingService: LabelMappingDataService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  /**
   * Component destroyed
   */
  ngOnDestroy(): void {
    // release this.destroyed$
    super.ngOnDestroy();
  }

  changeSubcategory(ev: MatButtonToggleChange): void {
    this.population = ev.value;
    this.updateLabels();
    this.retrieveData();
  }

  changeTimeInterval(value: { start_date: string; end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  /**
   * Update / Append series item
   */
  private updateSeries(
    doseType: DoseType,
    percentage: number
  ): void {
    // search for series - keep order
    const sumSeries = this.summarySeries.find((ss) => ss.key === (DoseTypeName[doseType] ? DoseTypeName[doseType] : doseType));
    if (sumSeries) {
      // update series
      sumSeries.name = `${sumSeries.key}`;
      sumSeries.data = [percentage];
    } else {
      // if not found, append to the end since we need to keep the specified order, and we could also have new dose types
      this.summarySeries.push({
        key: DoseTypeName[doseType] ? DoseTypeName[doseType] : doseType,
        name: `${DoseTypeName[doseType] ? DoseTypeName[doseType] : doseType}%`,
        data: [percentage],
        // IMPORTANT: split item contains color property, but doesn't seem that we import colors, so probably this property never comes with a color
        color: Constants.VACCINATIONS_COLORS.find((c) => c.label === doseType)?.primary,
        type: this.chartPlotOptions.bar.grouping ?
          'column' :
          undefined
      });
    }
  }

  async retrieveData(startDate?: string, endDate?: string): Promise<void> {
    // cancel any active subscriptions
    this.cancelSubscriptions();

    // display loading spinner
    this.showLoading();

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    // reset chart data
    // should we start with zeroed values for default dose_types, while new ones will be appended to the end ?
    this.summarySeries = [
      {
        key: DoseTypeName.OneDose,
        name: `${DoseTypeName.OneDose}`,
        data: [0],
        color: Constants.VACCINATIONS_COLORS.find((c) => c.label === DoseType.OneDose)?.primary,
        type: this.chartPlotOptions.bar.grouping ?
          'column' :
          undefined
      }
    ];

    // retrieve mapping only once
    if (!this.labelMappings.length) {
      await this.retrieveLabelMappings();
    }

    // retrieve data
    // - we should have just one Cumulative data for a combination of location, date, dose type (so grouping should be ignored on be)
    // - must exclude dose types for which we already retrieved data ?
    //    - API doesn't allow "not in" filters..., so we can use parallel request since we don't need to do "not in"
    const emptyFields = ['age_group', 'gender'];
    if (this.population === Population.AllPopulation) {
      emptyFields.push('population_type');
    }

    this.dataSubscription = this.vaccinationDataService
      .getDailyVaccinationsWithMetadata(
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        undefined,
        this.population === Population.AllPopulation ? undefined : this.population,
        VaccinationTotal.Proportion,
        undefined,
        undefined,
        undefined,
        VaccinationSplitType.DoseType,
        undefined,
        emptyFields
      )
      .pipe(
        catchError((err) => {
          // don't stop loading...since we got an error
          // we don't have a way to handle error now (like display a dialog with an error message...)

          // got response - no need to cancel it
          this.dataSubscription = undefined;

          // send the error down the road
          return throwError(err);
        })
      )
      .subscribe((cumulativeResponse) => {
        // got response - no need to cancel it
        this.dataSubscription = undefined;

        // process response
        this.data = new SplitDataV2(
          this.metadataService,
          cumulativeResponse,
          undefined,
          (item1, item2): number => {
            // Partially, Fully, Booster, ...
            if (item1 === DoseType.OneDose) {
              return -1;
            } else if (item2 === DoseType.OneDose) {
              return 1;
            }
            // equal...just keep order as it is
            // - or we could sort it by name - natural sort
            return 0;
          },
          this.startDate,
          this.endDate
        );

        // reset chart values
        this.overTimeSeries = [];

        // do we have anything to display ?
        if (!this.data.splitTypes?.length) {
          // hide loading
          this.hideLoading();

          // finished
          return;
        }

        // update series using the last values that we have
        // add series
        const val: number[] = [];
        this.data.axisData[DoseType.OneDose].forEach(element => {
          val.push(element * 100);
        });

        // update / append series summary
        this.updateSeries(
          DoseType.OneDose,
          this.data.getProgressValue(DoseType.OneDose) * 100
        );

        this.overTimeSeries.push({
          type: 'spline',
          name: `14 day rolling average - ${DoseTypeName[DoseType.OneDose] ? DoseTypeName[DoseType.OneDose] : DoseType.OneDose}`,
          data: ChartDataUtils.compute14DayAverage(this.data.axisData[DoseType.OneDose] ? val : []),
          pointStart: 14,
          pointInterval: 1,
          zIndex: 2,
          stacking: 'normal',
          color: Constants.VACCINATIONS_COLORS.find((c) => c.label === DoseType.OneDose)?.bold
        });

        this.overTimeSeries.push({
          pointInterval: 1,
          pointStart: undefined,
          zIndex: 1,
          stacking: 'normal',
          name: DoseTypeName[DoseType.OneDose] ? DoseTypeName[DoseType.OneDose] : DoseType.OneDose,
          data: this.data.axisData[DoseType.OneDose] ?
            val :
            [],
          // IMPORTANT: split item contains color property, but doesn't seem that we import colors, so probably this property never comes with a color
          color: Constants.VACCINATIONS_COLORS.find((c) => c.label === DoseType.OneDose)?.primary,
          type: 'column'
        });

        // no data for summaries ?
        if (!this.data.hasData) {
          this.summarySeries = [];
        }

        // hide loading
        this.hideLoading();
      });
  }

  changeGraphType(event) {
    if (event.value === 'proportional') {
      this.chartPlotOptions.bar.grouping = false;
      this.chartPlotOptions.series.stacking = undefined;
      this.casesChartPlotOptions.column.grouping = false;
    } else {
      this.chartPlotOptions.bar.grouping = true;
      this.chartPlotOptions.series.stacking = undefined;
      this.casesChartPlotOptions.column.grouping = true;
    }

    // update summary series
    if (this.chartPlotOptions.bar.grouping) {
      this.summarySeries.forEach((item) => {
        item.type = 'column';
      });
    } else {
      this.summarySeries.forEach((item) => {
        item.type = undefined;
      });
    }

    // force redraw
    this.summarySeries = [...this.summarySeries];
  }

  /**
   * Determine the progress between the first and last days of the interval
   * @param xAxisValues
   */
  getUptakeProgress(xAxisValues: number[]): number {
    if (xAxisValues.length <= 2) {
      return 0;
    }

    const firstValue = xAxisValues[0];
    const lastValue = xAxisValues[xAxisValues.length - 1];

    return lastValue - firstValue;
  }

  retrieveLabelMappings(): Promise<void> {
    return new Promise((resolve) => {
      const qb = new ApiQueryBuilder();
      qb
        .where
        .byEquality('resource', LabelMappingResource.Vaccine)
        .byEquality('type', 'populationType')
        .byEquality('code', 'recommended_population');

      this.labelMappingService
        .getLabelMappingList(qb)
        .pipe(
          catchError((err) => {
            // exist function
            resolve();

            // send the error down the road
            return throwError(err);
          })
        )
        .subscribe((labelMappings) => {
          this.labelMappings = labelMappings;
          this.updateLabels();
          resolve();
        });
    });
  }

  updateLabels(): void {
    const currentPopulationLabelMapping = this.labelMappings.find((label) => label.code === this.population);
    if (currentPopulationLabelMapping) {
      this.populationLabel = currentPopulationLabelMapping.label;
    } else {
      // no label found, use the population type as label
      this.populationLabel = this.population;
    }
  }
}
