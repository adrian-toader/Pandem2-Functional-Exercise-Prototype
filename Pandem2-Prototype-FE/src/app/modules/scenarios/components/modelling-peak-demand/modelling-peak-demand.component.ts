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
import { ModellingScenarioDayResults } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { ModellingScenarioParameterValue } from 'src/app/core/models/modelling-data.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';

@Component({
  selector: 'app-modelling-peak-demand',
  templateUrl: './modelling-peak-demand.component.html',
  styleUrls: ['./modelling-peak-demand.component.less']
})
export class ModellingPeakDemandComponent extends ModellingScenarioComponent implements OnInit {
  chartSeries = [];
  compChartSeries = [];

  chartXAxis = {
    type: 'category',
    accessibility: {
      description: 'Resources'
    }
  };

  // Fix JSON Download
  xAxisData = ['ICU Beds', 'ICU Nurses', 'Ward Beds', 'Nurses', 'Ventilators'];

  chartPlotOptions = {
    series: {
      grouping: false,
      borderWidth: 0
    },
    column: {
      groupPadding: 0.3,
      borderWidth: 1
    }
  };

  chartTooltip = {
    shared: true,
    headerFormat: '<span style="font-size: 15px">{point.point.name}</span><br/>',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} </b><br/>'
  };

  chartTitle = 'Peak Demand vs Resources Available';
  chartSubtitle = 'Comparing total resources available, resources made available for the pandemic, and peak scenario values';

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
    const dataArray = [
      ModellingScenarioDayResults.PhysicalICUBedsAvailable,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.PhysicalWardBedsAvailable,
      ModellingScenarioDayResults.AvailableNurses,
      ModellingScenarioDayResults.VentilatorsAvailable
    ];

    const dataLabels: Map<string, string> = new Map([
      [ModellingScenarioDayResults.PhysicalICUBedsAvailable, 'ICU Beds'],
      [ModellingScenarioDayResults.AvailableICUNurses, 'ICU Nurses'],
      [ModellingScenarioDayResults.PhysicalWardBedsAvailable, 'Ward Beds'],
      [ModellingScenarioDayResults.AvailableNurses, 'Nurses'],
      [ModellingScenarioDayResults.VentilatorsAvailable, 'Ventilators']
    ]);

    if (this.data.size) {
      const proportions = [
        this.rawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ICU_beds_available_for_pandemic'),
        this.rawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ICU_nurses_available_for_pandemic'),
        this.rawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_beds_available_for_pandemic'),
        this.rawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_nurses_available_for_pandemic'),
        this.rawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ventilators_available_for_pandemic')
      ];
      const proportionValues = proportions.map(e => e.values[0]);

      const peakData = [];
      if (this.rawData.result_summary) {
        peakData.push(Math.round(this.rawData.result_summary.peak_demand_icu_beds));
        peakData.push(Math.round(this.rawData.result_summary.peak_demand_icu_nurses));
        peakData.push(Math.round(this.rawData.result_summary.peak_demand_ward_beds));
        peakData.push(Math.round(this.rawData.result_summary.peak_demand_nurses));
        peakData.push(Math.round(this.rawData.result_summary.peak_demand_ventilators));
      }

      const resourceData = dataArray.map(key => ({
        name: dataLabels.get(key),
        value: Math.max(...this.data.get(key).total.yAxis[0].data)
      }));

      const allResources = this.getAllResources(resourceData, proportionValues);

      this.chartSeries = this.loadData(allResources, resourceData, peakData);
    }

    if (this.comparisonData.size) {
      const proportions = [
        this.comparisonRawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ICU_beds_available_for_pandemic'),
        this.comparisonRawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ICU_nurses_available_for_pandemic'),
        this.comparisonRawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_beds_available_for_pandemic'),
        this.comparisonRawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_nurses_available_for_pandemic'),
        this.comparisonRawData.parameters.find(e => e.key === 'Inputs_Hospital_resource_params.proportion_of_ventilators_available_for_pandemic')
      ];
      const proportionValues = proportions.map(e => e.values[0]);

      const peakData = [];
      if (this.comparisonRawData.result_summary) {
        peakData.push(Math.round(this.comparisonRawData.result_summary.peak_demand_icu_beds));
        peakData.push(Math.round(this.comparisonRawData.result_summary.peak_demand_icu_nurses));
        peakData.push(Math.round(this.comparisonRawData.result_summary.peak_demand_ward_beds));
        peakData.push(Math.round(this.comparisonRawData.result_summary.peak_demand_nurses));
        peakData.push(Math.round(this.comparisonRawData.result_summary.peak_demand_ventilators));
      }

      const resourceData = dataArray.map(key => ({
        name: dataLabels.get(key),
        value: Math.max(...this.comparisonData.get(key).total.yAxis[0].data)
      }));

      const allResources = this.getAllResources(resourceData, proportionValues);

      this.compChartSeries = this.loadData(allResources, resourceData, peakData);
    }
  }

  loadData(allResources: any[], resourceData: any[], peakData: any[]) {
    return [
      {
        name: 'Total Available Resources',
        color: 'rgb(158, 159, 163)',
        pointPlacement: -0.2,
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        data: allResources
      },
      {
        name: 'Proportion made available for Pandemic',
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        dataLabels: [
          {
            enabled: true,
            inside: true,
            style: {
              fontSize: '12px'
            }
          }
        ],
        data: resourceData.map(e => e.value)
      },
      {
        name: 'Peak needs during scenario',
        color: 'rgb(160, 0, 0)',
        pointPlacement: 0.33,
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        dataLabels: [
          {
            enabled: true,
            inside: true,
            style: {
              fontSize: '12px'
            }
          }
        ],
        data: peakData
      }
    ];
  }

  getAllResources(resData: Array<{ name: string, value: number }>, proportions: ModellingScenarioParameterValue[]) {
    const allResources = [];

    resData.forEach((elem, index) => {
      const proportion = proportions[index].value as number;
      allResources.push([elem.name, Math.round(elem.value / proportion)]);
    });

    return allResources;
  }
}
