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
  templateUrl: './modelling-nurse-absenteeism.component.html',
  styleUrls: ['./modelling-nurse-absenteeism.component.less']
})
export class ModellingNurseAbsenteeismComponent extends ModellingScenarioComponent implements OnInit {
  Math = Math;

  // Curent scenario
  wardNursesChart = [];
  ICUNursesChart = [];
  allNursesChart = [];

  // Comparison Scenario
  compWardNursesChart = [];
  compICUNursesChart = [];
  compAllNursesChart = [];

  percentageTooltip = {
    headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
      '<td style = "padding:0"><b>{point.y}%</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
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
      this.loadChartData(this.wardNursesChart, this.data, ModellingScenarioDayResults.WardNurseAbsenteeismRate);
      this.loadChartData(this.ICUNursesChart, this.data, ModellingScenarioDayResults.ICUNurseAbsenteeismRate);
      this.loadChartData(this.allNursesChart, this.data, ModellingScenarioDayResults.AllNursesAbsenteeismRate);
    }

    if (this.comparisonData.size) {
      this.loadChartData(this.compWardNursesChart, this.comparisonData, ModellingScenarioDayResults.WardNurseAbsenteeismRate);
      this.loadChartData(this.compICUNursesChart, this.comparisonData, ModellingScenarioDayResults.ICUNurseAbsenteeismRate);
      this.loadChartData(this.compAllNursesChart, this.comparisonData, ModellingScenarioDayResults.AllNursesAbsenteeismRate);
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
}
