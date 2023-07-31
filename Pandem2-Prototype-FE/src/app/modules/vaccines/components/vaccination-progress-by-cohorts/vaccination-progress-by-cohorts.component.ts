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
import {
  DoseType,
  DoseTypeName,
  VaccinationSplitType,
  VaccinationTotal
} from 'src/app/core/entities/vaccination-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Moment } from 'moment';
import { throwError } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { catchError } from 'rxjs/operators';
import { MetadataService } from 'src/app/core/services/helper/metadata.service';
import { Constants } from '../../../../core/models/constants';
import { PeriodTypes } from '../../../../shared/constants';
import { ApiQueryBuilder } from '../../../../core/helperClasses/api-query-builder';
import { LabelMappingResource } from '../../../../core/entities/labelMapping-data.entity';
import { LabelMappingDataService } from '../../../../core/services/data/label-mapping.data.service';
import { LabelMappingModel } from '../../../../core/models/labelMapping.model';
import { IntervalOption } from '../../../../shared/components/chart-time-interval/chart-time-interval.component';
import { SplitData } from '../../../../core/helperClasses/split-data';

@Component({
  selector: 'app-vaccination-progress-by-cohorts',
  templateUrl: './vaccination-progress-by-cohorts.component.html'
})
export class VaccinationProgressByCohortsComponent extends DashboardComponent implements OnDestroy {

  // data
  sources: ISource[] = [];
  lastUpdate?: Moment;
  splitType: VaccinationSplitType = VaccinationSplitType.AgeGroup;
  chartToolTip = {
    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> {point.percentage:.0f}%<br/>',
    shared: true
  };
  chartPlotOptions: Highcharts.PlotOptions = {
    bar: {
      grouping: false
    },
    series: {
      stacking: undefined
    }
  };
  yAxis: string[];
  series: {
    name: string,
    data: number[],
    color: string,
    type: 'column' | undefined
  }[];
  labelMappings: LabelMappingModel[] = [];

  // options
  chartsIntervalOptions: IntervalOption[] = [
    { name: 'ALL', value: 'all' },
    { name: '6 MONTHS', value: '6m' },
    { name: '3 MONTHS', value: '3m' },
    { name: '4 WEEKS', value: '4w' },
    { name: '2 WEEKS', value: '2w' }
  ];
  selectedIntervalOption: IntervalOption;

  // constants
  SourceType = SourceType;
  VaccinationSplitType = VaccinationSplitType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationService: VaccinationDataService,
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

  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: IntervalOption }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption;
    this.retrieveData();
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

    if (!this.labelMappings.length) {
      await this.retrieveLabelMappings();
    }

    // requests definitions
    // - since we might have different dose types than default ones we need a way on API to split by both DoseType and Age / Risk / Healthcare..
    // - or determine existing dose types, merge to default ones and make multiple requests...
    const reqDefinitions: {
      doseType: DoseType,
      totalType: VaccinationTotal
    }[] = [
      // Cumulative
      {
        doseType: DoseType.OneDose,
        totalType: VaccinationTotal.Proportion
      }
    ];

    // retrieve data
    this.dataSubscription = forkJoin(
      reqDefinitions.map(
        (def) => {
          let emptyFields = [], splitParam;
          switch (this.splitType) {
            case VaccinationSplitType.AgeGroup: {
              emptyFields = ['population_type', 'gender'];
              splitParam = 'age_group';
              break;
            }
            case VaccinationSplitType.RiskGroup:
            case VaccinationSplitType.HealthcareWorker: {
              emptyFields = ['age_group', 'gender'];
              splitParam = 'population_type';
              break;
            }
          }
          return this.vaccinationService.getDailyVaccinationsWithMetadata(
            this.selectedRegionCode,
            this.startDate,
            this.endDate,
            def.doseType,
            null,
            def.totalType,
            null, null, null,
            splitParam,
            PeriodTypes.Weekly,
            emptyFields
          );
        }
      ))
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
      .subscribe((
        [
          cumulativeOneDose
        ]
      ) => {
        // got response - no need to cancel it
        this.dataSubscription = undefined;

        // process responses
        const oneDoseData = new SplitData(cumulativeOneDose.data);
        const oneDoseUptake = oneDoseData.determineUptakePerSplitType(this.selectedIntervalOption);

        // determine y axis
        this.yAxis = [...new Set([
          ...oneDoseData.getUniqueSplitValues()
        ])].filter((dbSplitType) => {
          const regex = /hcw_.*/g;
          // risk groups and healthcare workers should not overlap
          return !(this.splitType === VaccinationSplitType.RiskGroup &&
            dbSplitType.match(regex) ||
            this.splitType === VaccinationSplitType.HealthcareWorker &&
            !dbSplitType.match(regex));

        }).sort((item1, item2): number => {
          return item1.localeCompare(item2);
        });

        // populate axis data
        const seriesData: {
          [series in DoseType]: number[]
        } = {
          [DoseType.OneDose]: []
        };

        this.yAxis.forEach((splitType) => {
          seriesData[DoseType.OneDose].push((oneDoseUptake[splitType] || 0) * 100);
        });

        if (
          this.splitType === VaccinationSplitType.RiskGroup ||
          this.splitType === VaccinationSplitType.HealthcareWorker
        ) {
          // replace the split value with a db label if we have it
          for (let idx = 0; idx <= this.yAxis.length; idx ++) {
            const dbLabel = this.labelMappings.find((label) => label.code === this.yAxis[idx]);
            if (dbLabel) {
              this.yAxis[idx] = dbLabel.label;
            }
          }
        }

        // initialize axis
        this.series = [
          {
            name: DoseTypeName.OneDose,
            data: seriesData[DoseTypeName.OneDose],
            // IMPORTANT: split item contains color property, but doesn't seem that we import colors, so probably this property never comes with a color
            color: Constants.VACCINATIONS_COLORS.find((c) => c.label === DoseType.OneDose)?.primary,
            type: this.chartPlotOptions.bar.grouping ?
              'column' :
              undefined
          }
        ];

        // hide loading
        this.hideLoading();
      });
  }

  changeGraphType(event) {
    if (event.value === 'proportional') {
      this.chartPlotOptions.bar.grouping = false;
      this.chartPlotOptions.series.stacking = undefined;
    } else {
      this.chartPlotOptions.bar.grouping = true;
      this.chartPlotOptions.series.stacking = undefined;
    }

    // update summary series
    if (this.chartPlotOptions.bar.grouping) {
      this.series.forEach((item) => {
        item.type = 'column';
      });
    } else {
      this.series.forEach((item) => {
        item.type = undefined;
      });
    }

    // force redraw
    this.series = [...this.series];
  }

  retrieveLabelMappings(): Promise<void> {
    return new Promise((resolve) => {
      const qb = new ApiQueryBuilder();
      qb
        .where
        .byEquality('resource', LabelMappingResource.Vaccine)
        .byEquality('type', 'populationType');

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
          resolve();
        });
    });
  }
}
