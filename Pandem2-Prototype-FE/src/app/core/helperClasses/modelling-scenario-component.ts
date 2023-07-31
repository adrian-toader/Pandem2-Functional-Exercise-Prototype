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
import { Directive, Input, OnDestroy } from '@angular/core';
import { GraphDatasource, SplitData } from './split-data';
import { ModellingScenarioWithDayResults } from '../models/modelling-data.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModellingInfoDialogComponent } from 'src/app/modules/scenarios/components/modelling-info-dialog/modelling-info-dialog.component';
import { ModellingDataService } from '../services/data/modelling.data.service';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class ModellingScenarioComponent implements OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() rawData: ModellingScenarioWithDayResults;
  @Input() data: Map<string, GraphDatasource> = new Map();

  @Input() comparisonRawData: ModellingScenarioWithDayResults;
  @Input() comparisonData: Map<string, GraphDatasource> = new Map();

  @Input() xAxis: string[] = [];
  @Input() isCollapsed: boolean = false;

  // scenarioId is currently used if there is no other data given
  // When scenarioId is given, the components will retrieve data on their own
  @Input() scenarioId: string;

  xAxisLastDay = 270;

  dialogRef: MatDialogRef<any>;

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public openInfoDialog(): void {
    this.dialogRef = this.dialog.open(ModellingInfoDialogComponent, {
      data: {
        parent: this,
        modelId: this.rawData.modelId,
        scenarioName: this.rawData.name,
        comparisonScenarioName: this.comparisonRawData ? this.comparisonRawData.name : undefined,
        scenarioRegionCode: this.rawData.location,
        run1: this.rawData.parameters,
        run2: this.comparisonRawData ? this.comparisonRawData.parameters : undefined
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  public async retrieveScenarioData(id: string): Promise<void> {
    const data = await firstValueFrom(this.modellingDataService.getScenarioById(id).pipe(takeUntil(this.destroyed$)));
    this.rawData = data;

    if (this.rawData.comparisonScenarioId) {
      const compData = await firstValueFrom(this.modellingDataService.getScenarioById(this.rawData.comparisonScenarioId).pipe(takeUntil(this.destroyed$)));
      this.comparisonRawData = compData;
      this.parseData(this.comparisonRawData, this.comparisonData);
    }

    this.parseData(this.rawData, this.data);
  }

  public parseData(
    rawData: ModellingScenarioWithDayResults,
    dataChart: Map<string, GraphDatasource>
  ): void {
    const dataMap: Map<string, []> = new Map();
    rawData.day_results.forEach((dayData, index) => {
      for (const key in dayData) {
        if (key !== '_id' && key !== 'scenarioId' && key !== 'day') {
          if (!dataMap[key]) {
            dataMap[key] = [];
          }

          // If the output is a gap, it has to be changed to a negative value
          const isGap = key.toLowerCase().includes('_gap') || key.toLowerCase().includes('gap_');
          const isRate = key.toLowerCase().includes('_rate')
            || key.toLowerCase().includes('rate_')
            || key.toLowerCase().includes('_factor')
            || key.toLowerCase().includes('factor_');
          let value = !isGap ? dayData[key] : -dayData[key];
          value = !isRate ? Math.round(value) : Math.round(value * 100) / 100;

          dataMap[key].push({
            date: index,
            total: value
          });
        }
      }
    });

    for (const key in dataMap) {
      const splitData = new SplitData(dataMap[key]);
      dataChart.set(key, splitData.daily());

      // Set X Axis to undefined, custom X Axis will be used
      const elem = dataChart.get(key);
      elem.total.xAxis = undefined;
    }
  }

  public createXAxis(): void {
    for (let currentDay = 0; currentDay <= this.xAxisLastDay; currentDay++) {
      this.xAxis.push('Day ' + currentDay);
    }
  }
}
