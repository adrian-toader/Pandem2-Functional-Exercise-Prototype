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
import { Component, ComponentFactoryResolver, Input, OnInit, Type, ViewChild } from '@angular/core';
import { GraphDetail } from 'src/app/core/services/helper/graph-manager.service';
import { GraphDirective } from '../../directives/graph-manager/graph.directive';

export interface GraphComponent {
  data: any;
}

@Component({
  selector: 'app-graph-wrapper',
  template: `
    <ng-template app-graph-host></ng-template>
    <br>
  `
})
export class GraphWrapperComponent implements OnInit {

  @Input() graph: GraphDetail;
  @ViewChild(GraphDirective, { static: true }) graphHost!: GraphDirective;

  constructor(private resolver: ComponentFactoryResolver) {}

  loadComponent(graph: GraphDetail)
  {
    const viewContainerRef = this.graphHost.viewContainerRef;
    const factory = this.resolver.resolveComponentFactory(this.componentTypeFactory(graph));
    const componentRef = viewContainerRef.createComponent<GraphComponent>(factory);
    this.graph.refComponent = componentRef.instance;
  }
  componentTypeFactory(graph: GraphDetail): Type<GraphComponent>
  {
    return graph.component;
  }
  ngOnInit(): void {
    this.loadComponent(this.graph);
  }
}
