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
  selector: 'app-modelling-epidemiological-indicators',
  templateUrl: './modelling-epidemiological-indicators.component.html',
  styleUrls: ['./modelling-epidemiological-indicators.component.less']
})
export class ModellingEpidemiologicalIndicatorsComponent extends ModellingScenarioComponent implements OnInit {
  // Curent scenario
  casesChart = [];
  attackRateChart = [];
  admissionsChart = [];
  deathsChart = [];

  // Comparison Scenario
  compCasesChart = [];
  compAttackRateChart = [];
  compAdmissionsChart = [];
  compDeathsChart = [];

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
    const caseKeys = [
      ModellingScenarioDayResults.ActualCasesA,
      ModellingScenarioDayResults.ActualCasesB,
      ModellingScenarioDayResults.ActualCasesC,
      ModellingScenarioDayResults.ActualCasesD
    ];

    const admissionsKeys = [
      ModellingScenarioDayResults.HospitalAdmissionsA,
      ModellingScenarioDayResults.HospitalAdmissionsB,
      ModellingScenarioDayResults.HospitalAdmissionsC,
      ModellingScenarioDayResults.HospitalAdmissionsD
    ];

    const deathsKeys = [
      ModellingScenarioDayResults.DeathsInHospitalA,
      ModellingScenarioDayResults.DeathsInHospitalB,
      ModellingScenarioDayResults.DeathsInHospitalC,
      ModellingScenarioDayResults.DeathsInHospitalD
    ];

    const attackRateKeys = [
      ModellingScenarioDayResults.AttackRateA,
      ModellingScenarioDayResults.AttackRateB,
      ModellingScenarioDayResults.AttackRateC,
      ModellingScenarioDayResults.AttackRateD
    ];

    if (this.data.size) {
      this.loadChartData(this.casesChart, this.data, caseKeys, ModellingScenarioDayResults.ActualCasesE);
      this.loadChartData(this.attackRateChart, this.data, attackRateKeys, ModellingScenarioDayResults.AttackRateE);
      this.loadChartData(this.admissionsChart, this.data, admissionsKeys);
      this.loadChartData(this.deathsChart, this.data, deathsKeys);
    }

    if (this.comparisonData.size) {
      this.loadChartData(this.compCasesChart, this.comparisonData, caseKeys, ModellingScenarioDayResults.ActualCasesE);
      this.loadChartData(this.compAttackRateChart, this.comparisonData, attackRateKeys, ModellingScenarioDayResults.AttackRateE);
      this.loadChartData(this.compAdmissionsChart, this.comparisonData, admissionsKeys);
      this.loadChartData(this.compDeathsChart, this.comparisonData, deathsKeys);
    }
  }

  private loadChartData(array: object[], map: Map<string, GraphDatasource>, key: string | string[], totalKey?: string): void {
    if (typeof key === 'string') {
      const data = map.get(key).total.yAxis[0].data;

      array.push({
        name: ModellingScenarioDayResultsDataMap.get(key).ageLabel
          ? ModellingScenarioDayResultsDataMap.get(key).label + ' (' + ModellingScenarioDayResultsDataMap.get(key).ageLabel + ')'
          : ModellingScenarioDayResultsDataMap.get(key).label,
        data: data
      });
    }
    else {
      let data = [];
      let name = '';

      // Create a list of all the items
      const list: { name: string, data: any[] }[] = [];
      key.forEach(e => {
        list.push({
          name: ModellingScenarioDayResultsDataMap.get(e).ageLabel
            ? ModellingScenarioDayResultsDataMap.get(e).ageLabel
            : ModellingScenarioDayResultsDataMap.get(e).label,
          data: map.get(e).total.yAxis[0].data
        });
      });

      if (totalKey) {
        data = map.get(totalKey).total.yAxis[0].data;
      }
      else {
        // Get sum array of all keys (Total)
        data = list[0].data.map((_x, idx) => list.reduce((sum, curr) => sum + curr.data[idx], 0));
      }
      name = 'Total';

      // Add total
      array.push({
        name: name,
        data: data.map(e => Math.round(e * 100) / 100)
      });

      // Add data for each key
      list.forEach(e => {
        array.push({
          name: e.name,
          data: e.data
        });
      });
    }
  }
}
