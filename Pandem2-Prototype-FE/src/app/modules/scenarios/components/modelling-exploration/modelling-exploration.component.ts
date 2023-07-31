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
import { Component, EventEmitter, Output, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IModellingExplorationChart, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingCardManagerDialogComponent } from '../modelling-card-manager/modelling-card-manager-dialog/modelling-card-manager-dialog.component';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { GraphMananger, ReportModellingExplorationChart } from 'src/app/core/services/helper/graph-manager.service';
import { Constants, GRAPH_FILTER_BUTTONS } from '../../../../core/models/constants';

@Component({
  selector: 'app-modelling-exploration',
  templateUrl: './modelling-exploration.component.html',
  styleUrls: ['./modelling-exploration.component.less']
})
export class ModellingExplorationComponent extends ModellingScenarioComponent implements OnInit {
  @Input() isScenarioSaved: boolean = false;
  @Output() explorationChangedStatus: EventEmitter<boolean> = new EventEmitter();

  @ViewChildren('chartContainer') chartContainer: QueryList<any>;

  outputs = ModellingScenarioDayResultsDataMap;

  modellingCharts: (IModellingExplorationChart & { isCopiedToReport?: boolean })[] = [];
  initialModellingCharts: IModellingExplorationChart[] = [];

  explorationChanged = false;

  // constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService,
    private graphManager: GraphMananger
  ) {
    super(dialog, modellingDataService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.initializeModellingCharts();
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeModellingCharts();
    }
  }

  private initializeModellingCharts(): void {
    // Load already existing exploration charts
    if (this.rawData.exploration && this.rawData.exploration.length) {
      this.modellingCharts = this.rawData.exploration.map(e => ({
        chartType: e.chart_type,
        chartPlotType: e.chart_plot_type,
        viewBy: e.view_by,
        values: e.values,
        plotlines: e.plotlines
      }));
    }
    this.loadData();

    // Store initial exploration values
    this.setInitialCharts();

    // Check if chart is already on report page
    this.checkReport();
  }

  loadData() {
    if (this.data.size) {
      this.modellingCharts.forEach(chart => {
        chart.series = this.createSeries(chart.values, this.data);
        chart.plotlineData = { type: chart.chartPlotType, plotLines: [] };
        chart.plotlineData.plotLines = this.createPlotlines(chart.plotlines, this.data);
        if (chart.viewBy === 'indicator') {
          this.createIndicators(chart);
        }
      });
    }

    if (this.comparisonData.size) {
      this.modellingCharts.forEach(chart => {
        chart.comparisonSeries = this.createSeries(chart.values, this.comparisonData);
        chart.comparisonPlotlineData = { type: chart.chartPlotType, plotLines: [] };
        chart.comparisonPlotlineData.plotLines = this.createPlotlines(chart.plotlines, this.comparisonData);
        if (chart.viewBy === 'indicator') {
          this.createIndicators(chart);
        }
      });
    }
  }

  setInitialCharts() {
    this.initialModellingCharts = _.cloneDeep(this.modellingCharts);
    // Simplify object to only contain essential data
    this.initialModellingCharts = this.initialModellingCharts.map(e => ({
      chartType: e.chartType,
      chartPlotType: e.chartPlotType,
      viewBy: e.viewBy,
      values: e.values,
      plotlines: e.plotlines
    }));

    this.explorationChanged = false;
  }

  checkExplorationChange() {
    // Simplify current modelling charts to only contain essential data (like the initial modelling charts)
    const currentCharts = this.modellingCharts.map(e => {
      if (e) {
        return {
          chartType: e.chartType,
          chartPlotType: e.chartPlotType,
          viewBy: e.viewBy,
          values: e.values,
          plotlines: e.plotlines
        };
      }
    });

    // Compare the two arrays to see if exploration charts changed
    if (_.isEqual(this.initialModellingCharts, currentCharts)) {
      this.explorationChanged = false;
    }
    else{
      this.explorationChanged = true;
    }

    this.explorationChangedStatus.emit(this.explorationChanged);
  }

  checkReport() {
    this.modellingCharts.forEach((e) => {
      if (this.graphManager.reportCardList.find(
        item => item instanceof ReportModellingExplorationChart && item.scenarioId === this.rawData.id && _.isEqual(item.values, e.values) && _.isEqual(item.plotlines, e.plotlines)
      )) {
        e.isCopiedToReport = true;
      }
      else {
        e.isCopiedToReport = false;
      }
    });
  }

  createSeries(values: string[], data: Map<string, GraphDatasource>) {
    const array = [];
    values.forEach(key => {
      array.push({
        name: this.outputs.get(key).ageLabel
          ? this.outputs.get(key).label + ' ' + this.outputs.get(key).ageLabel
          : this.outputs.get(key).label,
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
          text: this.outputs.get(key).ageLabel
            ? this.outputs.get(key).label + ' ' + this.outputs.get(key).ageLabel
            : this.outputs.get(key).label
        }
      });
    });
    return array;
  }

  createIndicators(chart: IModellingExplorationChart) {
    if (!this.comparisonRawData) {
      chart.viewBy = 'scenario';
      return;
    }
    chart.indicators = [];
    chart.values.forEach(key => {
      chart.indicators.push({
        title: this.outputs.get(key).ageLabel
          ? this.outputs.get(key).label + ' ' + this.outputs.get(key).ageLabel
          : this.outputs.get(key).label,
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
  }

  dialogChartAdded(index: number, values: string[], plotlines: string[]) {
    const chart: IModellingExplorationChart = {
      chartType: 'spline',
      chartPlotType: Constants.linear,
      viewBy: 'scenario',
      values: values,
      plotlines: plotlines,
      series: this.createSeries(values, this.data),
      comparisonSeries: this.comparisonData.size ? this.createSeries(values, this.comparisonData) : undefined,
      plotlineData: {
        type: Constants.linear,
        plotLines: this.createPlotlines(plotlines, this.data)
      },
      comparisonPlotlineData: {
        type: Constants.linear,
        plotLines: this.comparisonData.size ? this.createPlotlines(plotlines, this.comparisonData) : undefined
      }
    };

    this.modellingCharts.splice(index, 0, chart);
    this.checkExplorationChange();
  }

  dialogChartModified(index: number, values: string[], plotlines: string[]) {
    this.modellingCharts[index].values = values;
    this.modellingCharts[index].plotlines = plotlines;
    this.modellingCharts[index].series = this.createSeries(values, this.data);
    this.modellingCharts[index].plotlineData.plotLines = this.createPlotlines(plotlines, this.data);
    this.modellingCharts[index].comparisonSeries = this.comparisonData.size
      ? this.createSeries(values, this.comparisonData)
      : undefined;
    if (this.modellingCharts[index].comparisonPlotlineData) {
      this.modellingCharts[index].comparisonPlotlineData.plotLines = this.comparisonData.size
        ? this.createPlotlines(plotlines, this.comparisonData)
        : undefined;
    }

    if (this.modellingCharts[index].viewBy === 'indicator') {
      this.createIndicators(this.modellingCharts[index]);
    }

    this.redrawGraph(index);
  }

  redrawGraph(index?: number) {
    if (index === undefined) {
      const aux = this.modellingCharts;
      this.modellingCharts = [];
      setTimeout(() => {
        this.modellingCharts = [...aux];
        this.checkExplorationChange();
        this.checkReport();
      });
    }
    else{
      const aux = this.modellingCharts[index];
      this.modellingCharts[index] = undefined;
      setTimeout(() => {
        this.modellingCharts[index] = aux;
        this.checkExplorationChange();
        this.checkReport();
      });
    }
  }

  openModifyGraph(index: number) {
    this.openDialog(index);
  }

  openDialog(index?: number): void {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this,
        data: this.data,
        chartIndex: index,
        values: this.modellingCharts[index].values,
        plotlines: this.modellingCharts[index].plotlines
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  openAddGraphDialog() {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this,
        data: this.data,
        addToIndex: 0
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  copyToReport(index: number) {
    const uniqueId = uuid();
    this.graphManager.addToReportCard(new ReportModellingExplorationChart(
      uniqueId,
      this.rawData.id,
      this.modellingCharts[index].chartType,
      this.modellingCharts[index].chartPlotType,
      this.modellingCharts[index].viewBy,
      this.modellingCharts[index].values,
      this.modellingCharts[index].plotlines
    ));
    this.modellingCharts[index].isCopiedToReport = true;
  }

  collapseIndex(index: number) {
    this.modellingCharts[index].isCollapsed = !this.modellingCharts[index].isCollapsed;
  }

  moveUpIndex(index: number) {
    const aux = this.modellingCharts[index - 1];
    this.modellingCharts[index - 1] = this.modellingCharts[index];
    this.modellingCharts[index] = aux;
    this.checkExplorationChange();
  }

  moveDownIndex(index: number) {
    const aux = this.modellingCharts[index + 1];
    this.modellingCharts[index + 1] = this.modellingCharts[index];
    this.modellingCharts[index] = aux;
    this.checkExplorationChange();
  }

  removeIndex(index: number) {
    this.modellingCharts.splice(index, 1);
    this.checkExplorationChange();
  }

  removeValue(value: string, index: number) {
    const valueIndex = this.modellingCharts[index].values.findIndex(e => e === value);
    if (valueIndex !== -1 && this.modellingCharts[index].values.length > 1) {
      // Remove from values
      this.modellingCharts[index].values.splice(valueIndex, 1);

      // Remake series
      this.modellingCharts[index].series = this.createSeries(this.modellingCharts[index].values, this.data);
      this.modellingCharts[index].comparisonSeries = this.comparisonData.size
        ? this.createSeries(this.modellingCharts[index].values, this.comparisonData)
        : undefined;

      if (this.modellingCharts[index].viewBy === 'indicator') {
        this.createIndicators(this.modellingCharts[index]);
      }

      this.redrawGraph(index);
    }
  }

  removePlotline(value: string, index: number) {
    const plotlineIndex = this.modellingCharts[index].plotlines.findIndex(e => e === value);
    if (plotlineIndex !== -1) {
      // Remove from values
      this.modellingCharts[index].plotlines.splice(plotlineIndex, 1);

      // Remake plotlines
      this.modellingCharts[index].plotlineData.plotLines = this.createPlotlines(this.modellingCharts[index].plotlines, this.data);
      if (this.modellingCharts[index].comparisonPlotlineData) {
        this.modellingCharts[index].comparisonPlotlineData.plotLines = this.comparisonData.size
          ? this.createPlotlines(this.modellingCharts[index].plotlines, this.comparisonData)
          : undefined;
      }

      this.redrawGraph(index);
    }
  }

  changeChartType(event: any, index: number) {
    this.modellingCharts[index].chartType = event.value;
    this.checkExplorationChange();
  }

  changePlotType(event: any, index: number) {
    this.modellingCharts[index].chartPlotType = event.value;
    this.modellingCharts[index].plotlineData.type = event.value;
    if (this.modellingCharts[index].comparisonPlotlineData) {
      this.modellingCharts[index].comparisonPlotlineData.type = event.value;
    }
    // Redraw graph fixes missing 0 and negative values when swithing back from logarithmic
    this.redrawGraph(index);
    this.checkExplorationChange();
  }

  changeViewBy(event: any, index: number) {
    this.modellingCharts[index].viewBy = event.value;
    if (event.value === 'indicator') {
      this.createIndicators(this.modellingCharts[index]);
    }
    this.checkExplorationChange();
  }
}
