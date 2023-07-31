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
import { Component, Input, OnInit } from '@angular/core';
import { IModellingExplorationChart, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingCardManagerDialogComponent } from '../modelling-card-manager/modelling-card-manager-dialog/modelling-card-manager-dialog.component';
import { GRAPH_FILTER_BUTTONS } from '../../../../core/models/constants';

@Component({
  selector: 'app-modelling-exploration-chart',
  templateUrl: './modelling-exploration-chart.component.html',
  styleUrls: ['./modelling-exploration-chart.component.less']
})

export class ModellingExplorationChartComponent extends ModellingScenarioComponent implements OnInit {
  @Input() chart: IModellingExplorationChart;
  @Input() isCollapsed = false;

  outputs = ModellingScenarioDayResultsDataMap;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.initializeChart();
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeChart();
    }
  }

  initializeChart() {
    if (this.data.size) {
      this.chart.series = this.createSeries(this.chart.values, this.data);
      this.chart.plotlineData = { type: this.chart.chartPlotType, plotLines: [] };
      this.chart.plotlineData.plotLines = this.createPlotlines(this.chart.plotlines, this.data);
    }

    if (this.comparisonData.size) {
      this.chart.comparisonSeries = this.createSeries(this.chart.values, this.comparisonData);
      this.chart.comparisonPlotlineData = { type: this.chart.chartPlotType, plotLines: [] };
      this.chart.comparisonPlotlineData.plotLines = this.createPlotlines(this.chart.plotlines, this.comparisonData);
      // If there is comparison data, also create indicators view
      this.chart.indicators = this.createIndicators(this.chart.values);
    }
    else {
      if (this.chart.viewBy === 'indicator') {
        this.chart.viewBy = 'scenario';
      }
    }
  }

  changeChartType(event: any) {
    this.chart.chartType = event.value;
  }

  changePlotType(event: any) {
    this.chart.chartPlotType = event.value;
    this.chart.plotlineData.type = event.value;
    if (this.chart.comparisonPlotlineData) {
      this.chart.comparisonPlotlineData.type = event.value;
    }
    // Redraw graph fixes missing 0 and negative values when swithing back from logarithmic
    this.redrawGraph();
  }

  changeViewBy(event: any) {
    this.chart.viewBy = event.value;
  }

  redrawGraph() {
    const aux = this.chart;
    this.chart = undefined;
    setTimeout(() => {
      this.chart = aux;
    });
  }

  createSeries(values: string[], data: Map<string, GraphDatasource>) {
    const array = [];
    values.forEach(key => {
      array.push({
        name: ModellingScenarioDayResultsDataMap.get(key).ageLabel
          ? ModellingScenarioDayResultsDataMap.get(key).label + ' ' + ModellingScenarioDayResultsDataMap.get(key).ageLabel
          : ModellingScenarioDayResultsDataMap.get(key).label,
        data: data.get(key).total.yAxis[0].data
      });
    });
    return array;
  }

  createPlotlines(values: string[], data: Map<string, GraphDatasource>) {
    const array = [];
    values.forEach(key => {
      // Get min value if max is 0 (gaps are represented with negative numbers)
      const value = Math.max(...data.get(key).total.yAxis[0].data) > 0
        ? Math.max(...data.get(key).total.yAxis[0].data)
        : Math.min(...data.get(key).total.yAxis[0].data);
      array.push({
        value: value,
        color: '#ff0000',
        dashStyle: 'longdash',
        width: 1,
        zIndex: 5,
        label: {
          text: ModellingScenarioDayResultsDataMap.get(key).ageLabel
            ? ModellingScenarioDayResultsDataMap.get(key).label + ' ' + ModellingScenarioDayResultsDataMap.get(key).ageLabel
            : ModellingScenarioDayResultsDataMap.get(key).label
        }
      });
    });
    return array;
  }

  createIndicators(values: string[]) {
    if (!this.comparisonRawData) {
      this.chart.viewBy = 'scenario';
      return;
    }
    const array = [];
    values.forEach(key => {
      array.push({
        title: ModellingScenarioDayResultsDataMap.get(key).ageLabel
          ? ModellingScenarioDayResultsDataMap.get(key).label + ' ' + ModellingScenarioDayResultsDataMap.get(key).ageLabel
          : ModellingScenarioDayResultsDataMap.get(key).label,
        series: [
          {
            name: 'Baseline scenario: ' + this.rawData.name,
            data: this.data.get(key).total.yAxis[0].data
          },
          {
            name: 'Alternative scenario: ' + this.comparisonRawData.name,
            data: this.comparisonData.get(key).total.yAxis[0].data
          }
        ]
      });
    });

    return array;
  }

  openModifyGraph() {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this,
        data: this.data,
        chartIndex: 0,
        values: this.chart.values,
        plotlines: this.chart.plotlines
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  dialogChartModified(_index: number, values: string[], plotlines: string[]) {
    this.chart.values = values;
    this.chart.plotlines = plotlines;
    this.chart.series = this.createSeries(values, this.data);
    this.chart.plotlineData.plotLines = this.createPlotlines(plotlines, this.data);
    this.chart.comparisonSeries = this.comparisonData.size
      ? this.createSeries(values, this.comparisonData)
      : undefined;
    if (this.chart.comparisonPlotlineData) {
      this.chart.comparisonPlotlineData.plotLines = this.comparisonData.size
        ? this.createPlotlines(plotlines, this.comparisonData)
        : undefined;
    }

    if (this.chart.viewBy === 'indicator') {
      this.chart.indicators = this.createIndicators(this.chart.values);
    }

    this.redrawGraph();
  }

  removeValue(value: string) {
    const valueIndex = this.chart.values.findIndex(e => e === value);
    if (valueIndex !== -1 && this.chart.values.length > 1) {
      // Remove from values
      this.chart.values.splice(valueIndex, 1);

      // Remake series
      this.chart.series = this.createSeries(this.chart.values, this.data);
      this.chart.comparisonSeries = this.comparisonData.size
        ? this.createSeries(this.chart.values, this.comparisonData)
        : undefined;

      if (this.chart.viewBy === 'indicator') {
        this.chart.indicators = this.createIndicators(this.chart.values);
      }

      this.redrawGraph();
    }
  }

  removePlotline(value: string) {
    const plotlineIndex = this.chart.plotlines.findIndex(e => e === value);
    if (plotlineIndex !== -1) {
      // Remove from values
      this.chart.plotlines.splice(plotlineIndex, 1);

      // Remake plotlines
      this.chart.plotlineData.plotLines = this.createPlotlines(this.chart.plotlines, this.data);
      if (this.chart.comparisonPlotlineData) {
        this.chart.comparisonPlotlineData.plotLines = this.comparisonData.size
          ? this.createPlotlines(this.chart.plotlines, this.comparisonData)
          : undefined;
      }

      this.redrawGraph();
    }
  }
}
