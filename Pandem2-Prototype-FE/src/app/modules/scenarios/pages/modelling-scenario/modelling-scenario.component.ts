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
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ModellingBreadcrumbService } from 'src/app/core/services/helper/modelling-breadcrumb.service';
import { ModellingModel, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { ModellingExplorationComponent } from '../../components/modelling-exploration/modelling-exploration.component';
import { IModellingScenarioDataEntityPayload, IModellingScenarioWithDayResultsDataEntityPayload, ModellingModelKeys } from 'src/app/core/entities/modelling-data.entity';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { GraphMananger, ReportModellingSection } from 'src/app/core/services/helper/graph-manager.service';
import { ModellingEpidemiologicalIndicatorsComponent } from 'src/app/modules/scenarios/components/modelling-epidemiological-indicators/modelling-epidemiological-indicators.component';
import { ModellingResourceGapComponent } from '../../components/modelling-resource-gap-notifications/modelling-resource-gap.component';
import { ModellingPeakDemandComponent } from '../../components/modelling-peak-demand/modelling-peak-demand.component';
import { ModellingAnalysisComponent } from '../../components/modelling-analysis/modelling-analysis.component';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';
import { ModellingStressIndicatorsComponent } from '../../components/modelling-stress-indicators/modelling-stress-indicators.component';
import { ModellingNurseAbsenteeismComponent } from '../../components/modelling-nurse-absenteeism/modelling-nurse-absenteeism.component';

@Component({
  selector: 'app-modelling-scenario',
  templateUrl: './modelling-scenario.component.html',
  styleUrls: ['./modelling-scenario.component.less']
})
export class ModellingScenarioComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('explorationElement') explorationElement;

  currentUser: UserModel;
  modellingKeys = ModellingModelKeys;

  modellingSections: Map<string, { section: any, id: string, isCollapsed: boolean, isCopiedToReport: boolean }[]> = new Map([
    [ModellingModelKeys.Model05, [
      {
        section: ModellingEpidemiologicalIndicatorsComponent,
        id: 'ModellingEpidemiologicalIndicatorsComponent',
        isCollapsed: false,
        isCopiedToReport: false
      },
      {
        section: ModellingResourceGapComponent,
        id: 'ModellingResourceGapComponent',
        isCollapsed: false,
        isCopiedToReport: false
      },
      {
        section: ModellingPeakDemandComponent,
        id: 'ModellingPeakDemandComponent',
        isCollapsed: false,
        isCopiedToReport: false
      },
      {
        section: ModellingAnalysisComponent,
        id: 'ModellingAnalysisComponent',
        isCollapsed: false,
        isCopiedToReport: false
      },
      {
        section: ModellingStressIndicatorsComponent,
        id: 'ModellingStressIndicatorsComponent',
        isCollapsed: false,
        isCopiedToReport: false
      },
      {
        section: ModellingNurseAbsenteeismComponent,
        id: 'ModellingNurseAbsenteeismComponent',
        isCollapsed: true,
        isCopiedToReport: false
      },
      {
        section: ModellingExplorationComponent,
        id: 'ModellingExplorationComponent',
        isCollapsed: false,
        isCopiedToReport: false
      }
    ]]
  ]);

  // Scenario model
  model: ModellingModel;
  modelKey: string;

  // Current Scenario
  scenarioId: string;
  rawData: ModellingScenarioWithDayResults;
  dataMap: Map<string, []> = new Map();
  dataChart: Map<string, GraphDatasource> = new Map();

  // Comparison Scenario
  comparisonScenarioId: string;
  comparisonRawData: ModellingScenarioWithDayResults;
  comparisonDataMap: Map<string, []> = new Map();
  comparisonDataChart: Map<string, GraphDatasource> = new Map();

  // Axis used for scenario days
  xAxis = [];
  xAxisLastDay = 270;

  // Save button status
  updateEnabled = false;
  isScenarioSaved = true;

  // Flag used to trigger re-render
  showData = true;

  constructor(
    private authService: AuthManagementDataService,
    private route: ActivatedRoute,
    private router: Router,
    protected modellingDataService: ModellingDataService,
    protected breadcrumbService: ModellingBreadcrumbService,
    private graphManager: GraphMananger
  ) {
    // If scenario is not saved, data will come from navigation extras
    const navigation = this.router.getCurrentNavigation();
    if (navigation.extras.state) {
      const state = navigation.extras.state as {
        data: ModellingScenarioWithDayResults,
        comparisonData: ModellingScenarioWithDayResults
      };

      // Set scenario saved flag to false when loading scenario from navigation extras
      if (!state.data.id) {
        this.isScenarioSaved = false;
      }

      this.rawData = state.data;
      this.scenarioId = this.rawData.id;

      // Get comparison scenario from navigation extras if existent
      if (state.comparisonData) {
        this.comparisonRawData = state.comparisonData;

        // If there is a new comparison scenario, enable update
        this.updateEnabled = true;

        this.parseData(this.comparisonRawData, this.comparisonDataMap, this.comparisonDataChart);
      }

      // Get comparison scenario if existent & not already provided in navigation extras
      if (!state.comparisonData && this.rawData.comparisonScenarioId) {
        this.comparisonScenarioId = this.rawData.comparisonScenarioId;
        this.retrieveComparisonData();
      }

      this.modellingDataService.getModelList()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(list => {
          this.model = list.find(e => e.id === state.data.modelId);
          this.modelKey = this.model?.key;

          // After loading model key check if sections are copied to report & reorder
          this.checkReport();
          this.reoderSections();
        });

      this.parseData(this.rawData, this.dataMap, this.dataChart);
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.scenarioId = params.get('scenarioId');
    });

    // Get user
    this.currentUser = this.authService.getAuthenticatedUser();

    // Create series [Day 0 -> Day 270]
    this.createDaySeries();

    // If there is no data from navigation extras then retrieve data from db
    // ScenarioId always has length 24
    if (!this.rawData && this.scenarioId.length === 24) {
      this.retrieveData();
    }

    // If user refreshed on unsaved scenario, redirect to modelling home page
    if (!this.rawData && this.scenarioId.length !== 24) {
      this.router.navigate(['/scenarios/modelling/']);
    }

    this.breadcrumbService.setCurrentPage('Scenario Results');
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  retrieveData() {
    this.modellingDataService
      .getScenarioById(this.scenarioId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        // Get scenario model key
        this.modellingDataService.getModelList()
          .pipe(takeUntil(this.destroyed$))
          .subscribe(list => {
            this.model = list.find(e => e.id === data.modelId);
            this.modelKey = this.model?.key;

            // After loading model key check if sections are copied to report & reorder
            this.checkReport();
            this.reoderSections();
          });

        this.rawData = data;

        if (this.rawData.userId !== this.currentUser.id) {
          this.isScenarioSaved = false;
        }

        if (this.rawData.comparisonScenarioId) {
          this.comparisonScenarioId = this.rawData.comparisonScenarioId;
          this.retrieveComparisonData();
        }

        this.parseData(this.rawData, this.dataMap, this.dataChart);
      });
  }

  retrieveComparisonData() {
    this.modellingDataService
      .getScenarioById(this.comparisonScenarioId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.comparisonRawData = data;
        this.parseData(this.comparisonRawData, this.comparisonDataMap, this.comparisonDataChart);
      });
  }

  parseData(
    rawData: ModellingScenarioWithDayResults,
    dataMap: Map<string, []>,
    dataChart: Map<string, GraphDatasource>
  ) {
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

  createDaySeries() {
    for (let currentDay = 0; currentDay <= this.xAxisLastDay; currentDay++) {
      this.xAxis.push('Day ' + currentDay);
    }
  }

  scenarioDeleted() {
    this.router.navigate(['/scenarios/modelling/']);
  }

  async saveClicked() {
    this.breadcrumbService.setIsDisabled(true);

    // If scenario is already saved, update the scenario
    if (this.isScenarioSaved) {
      let comparisonScenarioId: string = this.comparisonRawData ? this.comparisonRawData.id : undefined;
      const comparisonScenarioName: string = this.comparisonRawData ? this.comparisonRawData.name : undefined;

      // Delete old comparisson if available
      if (this.rawData.comparisonScenarioId !== comparisonScenarioId) {
        this.modellingDataService.deleteScenario(this.rawData.comparisonScenarioId).pipe(takeUntil(this.destroyed$)).subscribe();
      }

      // If there is a comparison scenario, save that one first (to get id)
      if (this.comparisonRawData && !this.comparisonRawData.id) {
        const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
          userId: this.currentUser.id,
          modelId: this.comparisonRawData.modelId,
          previousConfigScenarioId: this.comparisonRawData.previousConfigScenarioId,
          name: this.comparisonRawData.name,
          date: moment(this.comparisonRawData.date).format(),
          description: this.comparisonRawData.description,
          tags: this.comparisonRawData.tags,
          location: this.comparisonRawData.location,
          parameters: this.comparisonRawData.parameters,
          result_summary: this.comparisonRawData.result_summary,
          sections_order: this.modellingSections.get(this.modelKey).map(e => e.id),
          day_results: this.comparisonRawData.day_results,
          is_visible: false
        };

        const savedComparison = await firstValueFrom(this.modellingDataService.saveScenario(payload).pipe(takeUntil(this.destroyed$)));

        comparisonScenarioId = savedComparison.id;
        this.comparisonRawData.id = comparisonScenarioId;
      }

      this.rawData.comparisonScenarioId = comparisonScenarioId;
      this.rawData.comparisonScenarioName = comparisonScenarioName;
      this.rawData.tags = comparisonScenarioId ? this.addComparisonTag(this.rawData.tags) : this.rawData.tags;

      const payload: IModellingScenarioDataEntityPayload = {
        userId: this.currentUser.id,
        modelId: this.rawData.modelId,
        previousConfigScenarioId: this.rawData.previousConfigScenarioId,
        comparisonScenarioId: this.rawData.comparisonScenarioId,
        comparisonScenarioName: comparisonScenarioName,
        name: this.rawData.name,
        date: moment(this.rawData.date).format(),
        description: this.rawData.description,
        tags: this.rawData.tags,
        location: this.rawData.location,
        parameters: this.rawData.parameters,
        sections_order: this.modellingSections.get(this.modelKey).map(e => e.id),
        exploration: this.explorationElement.componentRef.instance.modellingCharts.map(e => ({
          chart_type: e.chartType,
          chart_plot_type: e.chartPlotType,
          view_by: e.viewBy,
          values: e.values,
          plotlines: e.plotlines
        })),
        is_visible: this.rawData.is_visible
      };

      this.modellingDataService.updateScenario(this.rawData.id, payload)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.updateEnabled = false;
            this.breadcrumbService.setIsDisabled(false);
          },
          error: () => {
            this.breadcrumbService.setIsDisabled(false);
          }
        });
    }
    else {
      let comparisonScenarioId: string = this.comparisonRawData ? this.comparisonRawData.id : undefined;
      const comparisonScenarioName: string = this.comparisonRawData ? this.comparisonRawData.name : undefined;

      // If there is a comparison scenario, save that one first (to get id)
      if ((this.comparisonRawData && !this.comparisonRawData.id) || (this.comparisonRawData && this.comparisonRawData.userId !== this.currentUser.id)) {
        const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
          userId: this.currentUser.id,
          modelId: this.comparisonRawData.modelId,
          previousConfigScenarioId: this.comparisonRawData.previousConfigScenarioId,
          name: this.comparisonRawData.name,
          date: moment(this.comparisonRawData.date).format(),
          description: this.comparisonRawData.description,
          tags: this.comparisonRawData.tags,
          location: this.comparisonRawData.location,
          parameters: this.comparisonRawData.parameters,
          result_summary: this.comparisonRawData.result_summary,
          sections_order: this.modellingSections.get(this.modelKey).map(e => e.id),
          day_results: this.comparisonRawData.day_results,
          is_visible: false
        };

        const savedComparison = await firstValueFrom(this.modellingDataService.saveScenario(payload).pipe(takeUntil(this.destroyed$)));

        comparisonScenarioId = savedComparison.id;
        this.comparisonRawData.id = comparisonScenarioId;
      }

      // Save baseline scenario
      this.rawData.exploration = this.explorationElement.componentRef.instance.modellingCharts.map(e => ({
        chart_type: e.chartType,
        chart_plot_type: e.chartPlotType,
        view_by: e.viewBy,
        values: e.values,
        plotlines: e.plotlines
      }));

      this.rawData.comparisonScenarioId = comparisonScenarioId;
      this.rawData.comparisonScenarioName = comparisonScenarioName;
      this.rawData.tags = comparisonScenarioId ? this.addComparisonTag(this.rawData.tags) : this.rawData.tags;

      const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
        userId: this.currentUser.id,
        modelId: this.rawData.modelId,
        previousConfigScenarioId: this.rawData.previousConfigScenarioId,
        comparisonScenarioId: this.rawData.comparisonScenarioId,
        comparisonScenarioName: comparisonScenarioName,
        name: this.rawData.name,
        date: moment(this.rawData.date).format(),
        description: this.rawData.description,
        tags: this.rawData.tags,
        location: this.rawData.location,
        parameters: this.rawData.parameters,
        result_summary: this.rawData.result_summary,
        sections_order: this.modellingSections.get(this.modelKey).map(e => e.id),
        day_results: this.rawData.day_results,
        exploration: this.rawData.exploration,
        is_visible: true
      };

      this.modellingDataService.saveScenario(payload)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (data) => {
            this.rawData.id = data.id;
            this.rawData.userId = data.userId;
            this.updateEnabled = false;
            this.isScenarioSaved = true;
            this.breadcrumbService.setIsDisabled(false);

            // Change link to the (new) saved scenario id
            this.router.navigate(['/scenarios/modelling/' + this.rawData.id]);
          },
          error: () => {
            this.breadcrumbService.setIsDisabled(false);
          }
        });
    }

    // Update saved exploration charts in exploration component
    this.explorationElement.componentRef.instance.setInitialCharts();
  }

  updateSavingStatus(status: boolean) {
    this.updateEnabled = status;

    // Sync exploration
    this.rawData.exploration = this.explorationElement.componentRef.instance.modellingCharts.map(e => e && ({
      chart_type: e.chartType,
      chart_plot_type: e.chartPlotType,
      view_by: e.viewBy,
      values: e.values,
      plotlines: e.plotlines
    }));
    if (this.comparisonRawData) {
      this.comparisonRawData.exploration = this.rawData.exploration;
    }
  }

  addComparisonTag(tags: string[]) {
    return tags.find(e => e === 'Comparison') ? tags : [...tags, 'Comparison'];
  }

  collapseIndex(index: number) {
    const element = this.modellingSections.get(this.modelKey)[index];
    if (element) {
      element.isCollapsed = !element.isCollapsed;
    }
  }

  moveUpIndex(index: number) {
    const array = this.modellingSections.get(this.modelKey);
    if (array && array.length) {
      const aux = array[index - 1];
      array[index - 1] = array[index];
      array[index] = aux;
      this.updateEnabled = true;

      const order = array.map(e => e.id);
      this.rawData.sections_order = order;
    }
  }

  moveDownIndex(index: number) {
    const array = this.modellingSections.get(this.modelKey);
    if (array && array.length) {
      const aux = array[index + 1];
      array[index + 1] = array[index];
      array[index] = aux;
      this.updateEnabled = true;

      const order = array.map(e => e.id);
      this.rawData.sections_order = order;
    }
  }

  copyToReport(index: number) {
    const element = this.modellingSections.get(this.modelKey)[index];
    if (element) {
      this.graphManager.addToReportCard(new ReportModellingSection(
        this.modellingSections.get(this.modelKey)[index].section,
        this.modellingSections.get(this.modelKey)[index].id,
        this.modellingSections.get(this.modelKey)[index].id + this.scenarioId,
        this.scenarioId
      ));
      this.modellingSections.get(this.modelKey)[index].isCopiedToReport = true;
    }
  }

  checkReport() {
    const array = this.modellingSections.get(this.modelKey);
    if (array && array.length) {
      array.forEach(e => {
        if (this.graphManager.reportCardList.find(
          item => item instanceof ReportModellingSection && item.graphId === (e.id + this.scenarioId)
        )) {
          e.isCopiedToReport = true;
        }
        else {
          e.isCopiedToReport = false;
        }
      });
    }
  }

  reoderSections() {
    if (this.rawData && this.rawData.sections_order) {
      const array = this.modellingSections.get(this.modelKey);
      if (array && array.length) {
        array.sort((a, b) =>
          this.rawData.sections_order.indexOf(a.id) - this.rawData.sections_order.indexOf(b.id)
        );
      }
    }
    else if (this.rawData && !this.rawData.sections_order) {
      const order = this.modellingSections.get(this.modelKey);
      if (order && order.length) {
        const orderIds = order.map(e => e.id);
        this.rawData.sections_order = orderIds;
      }
    }
  }

  removeComparison() {
    this.comparisonScenarioId = undefined;
    this.comparisonRawData = undefined;
    this.comparisonDataMap = new Map();
    this.comparisonDataChart = new Map();
    this.rawData.tags = this.rawData.tags.filter(e => e !== 'Comparison');
    this.rawData.comparisonScenarioName = undefined;
    this.updateEnabled = true;

    // Trigger re-render
    this.showData = false;
    setTimeout(() => {
      this.showData = true;
    }, 0);
  }
}
