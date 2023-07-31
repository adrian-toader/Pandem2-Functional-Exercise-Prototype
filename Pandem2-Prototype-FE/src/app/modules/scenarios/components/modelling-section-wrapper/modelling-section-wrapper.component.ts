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
import { Component, Input, OnInit, ViewContainerRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';

@Component({
  selector: 'app-modelling-section-wrapper',
  template: '<ng-template></ng-template>'
})

export class ModellingSectionWrapperComponent implements OnInit, OnChanges {
  @Input() section: any;
  @Input() sectionId: string;
  @Input() scenarioId: string;
  @Input() rawData: ModellingScenarioWithDayResults;
  @Input() data: Map<string, GraphDatasource> = new Map();
  @Input() comparisonRawData: ModellingScenarioWithDayResults;
  @Input() comparisonData: Map<string, GraphDatasource> = new Map();
  @Input() xAxis = [];
  @Input() isCollapsed = false;
  @Input() isScenarioSaved = false;

  @Output() explorationChangedStatus: EventEmitter<boolean> = new EventEmitter();

  componentRef;

  constructor(public viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.componentRef && changes.isCollapsed) {
      this.componentRef.instance.isCollapsed = changes.isCollapsed.currentValue;
    }
    if (this.componentRef && changes.isScenarioSaved && this.sectionId === 'ModellingExplorationComponent') {
      this.componentRef.instance.isScenarioSaved = changes.isScenarioSaved.currentValue;
    }
  }

  ngOnInit() {
    this.componentRef = this.viewContainerRef.createComponent(this.section);

    if (this.scenarioId) {
      this.componentRef.instance.scenarioId = this.scenarioId;
    }
    else {
      this.componentRef.instance.rawData = this.rawData;
      this.componentRef.instance.data = this.data;
      this.componentRef.instance.comparisonRawData = this.comparisonRawData;
      this.componentRef.instance.comparisonData = this.comparisonData;
      this.componentRef.instance.xAxis = this.xAxis;
      this.componentRef.instance.isCollapsed = this.isCollapsed;
    }

    if (this.sectionId === 'ModellingExplorationComponent') {
      this.componentRef.instance.isScenarioSaved = this.isScenarioSaved;
      this.componentRef.instance.explorationChangedStatus.subscribe(e => {
        this.explorationChangedStatus.emit(e);
      });
    }
  }
}
