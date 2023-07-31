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
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';

@Component({
  selector: 'app-modelling-stress-indicators',
  templateUrl: './modelling-stress-indicators.component.html',
  styleUrls: ['./modelling-stress-indicators.component.less']
})
export class ModellingStressIndicatorsComponent extends ModellingScenarioComponent implements OnInit {
  Math = Math;

  // Curent scenario
  wardDemandChart = [];
  ICUDemandChart = [];
  stressCodeChart = [];

  wardDemandWarning = 0;
  ICUDemandWarning = 0;

  totalExpectedDeaths = 0;
  potentialDeaths = 0;
  totalDeaths = 0;

  // Comparison Scenario
  compWardDemandChart = [];
  compICUDemandChart = [];
  compStressCodeChart = [];

  compWardDemandWarning = 0;
  compICUDemandWarning = 0;

  compTotalExpectedDeaths = 0;
  compPotentialDeaths = 0;
  compTotalDeaths = 0;

  stressCodePlotOptions = {
    series: {
      grouping: true,
      pointWidth: 4,
      pointPadding: 0,
      groupPadding: 0,
      borderWidth: 0,
      threshold: 0
    }
  };

  stressCodeLegendOptions = {
    enabled: true,
    itemStyle: {
      textOverflow: null
    }
  };

  stressCodeProperties: Map<number, { color: string, description: string }> = new Map([
    [1, { color: '#F0E442', description: 'Some routine services postponed' }],
    [2, { color: '#D55E00', description: 'Only most critical services available, with reduced quality of care' }],
    [3, { color: '#000000', description: 'No more planned work can be delayed. Life or death protocols invoked for critical patients' }]
  ]);

  stressCodeTooltip = {
    shared: true,
    useHTML: true,
    formatter() {
      let y = 0;
      this.points.forEach(e => {
        if (e.y !== 0) {
          y = e.y;
        }
      });

      return `<span style = "font-size:10px">${this.x}</span>
        <table><tr>
          <td style="padding: 0">Stress code:</td>
          <td style="padding: 0 4px"><b>${y}</b></td>
        </tr></table>`;
    }
  };

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService
  ) {
    super(dialog, modellingDataService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.initializeData();
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeData();
    }
  }

  private initializeData(): void {
    if (this.data.size) {
      this.loadChartData(this.wardDemandChart, this.data, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.loadChartData(this.ICUDemandChart, this.data, ModellingScenarioDayResults.PandemicICUDemandFactor);
      this.loadStressCodeData(this.stressCodeChart, this.data, ModellingScenarioDayResults.StressCode);

      this.wardDemandWarning = this.getMax(this.data, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.ICUDemandWarning = this.getMax(this.data, ModellingScenarioDayResults.PandemicICUDemandFactor);

      this.totalExpectedDeaths = this.getMax(this.data, ModellingScenarioDayResults.TotalExpectedDeaths);
      this.potentialDeaths = this.getMax(this.data, [
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUA,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUB,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUC,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUD
      ]);
      this.totalDeaths = this.totalExpectedDeaths + this.potentialDeaths;
    }

    if (this.comparisonData.size) {
      this.loadChartData(this.compWardDemandChart, this.comparisonData, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.loadChartData(this.compICUDemandChart, this.comparisonData, ModellingScenarioDayResults.PandemicICUDemandFactor);
      this.loadStressCodeData(this.compStressCodeChart, this.comparisonData, ModellingScenarioDayResults.StressCode);

      this.compWardDemandWarning = this.getMax(this.comparisonData, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.compICUDemandWarning = this.getMax(this.comparisonData, ModellingScenarioDayResults.PandemicICUDemandFactor);

      this.compTotalExpectedDeaths = this.getMax(this.comparisonData, ModellingScenarioDayResults.TotalExpectedDeaths);
      this.compPotentialDeaths = this.getMax(this.comparisonData, [
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUA,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUB,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUC,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUD
      ]);
      this.compTotalDeaths = this.compTotalExpectedDeaths + this.compPotentialDeaths;
    }
  }

  private loadChartData(array: object[], map: Map<string, GraphDatasource>, key: string): void {
    const data = map.get(key).total.yAxis[0].data;

    array.push({
      name: ModellingScenarioDayResultsDataMap.get(key).ageLabel
        ? ModellingScenarioDayResultsDataMap.get(key).label + ' (' + ModellingScenarioDayResultsDataMap.get(key).ageLabel + ')'
        : ModellingScenarioDayResultsDataMap.get(key).label,
      data: data
    });
  }

  private loadStressCodeData(array: object[], map: Map<string, GraphDatasource>, key: string): void {
    const data = map.get(key).total.yAxis[0].data;
    const stressCodeLevels = [1, 2, 3];

    stressCodeLevels.forEach(value => {
      array.push({
        name: this.stressCodeProperties.get(value)?.description,
        color: this.stressCodeProperties.get(value)?.color,
        data: data.map(e => e === value ? e : 0)
      });
    });
  }

  private getMax(map: Map<string, GraphDatasource>, key: string | string[]) {
    if (typeof key === 'string') {
      return Math.max(...map.get(key).total.yAxis[0].data);
    }
    else {
      const maxes = [];
      key.forEach(indicator => {
        maxes.push(Math.max(...map.get(indicator).total.yAxis[0].data));
      });
      return maxes.reduce((sum, curr) => sum + curr, 0);
    }
  }
}
