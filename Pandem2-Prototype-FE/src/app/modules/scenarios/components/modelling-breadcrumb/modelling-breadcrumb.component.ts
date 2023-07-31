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
import { IBreadcrumb, ModellingBreadcrumbService } from 'src/app/core/services/helper/modelling-breadcrumb.service';

@Component({
  selector: 'app-modelling-breadcrumb',
  templateUrl: './modelling-breadcrumb.component.html',
  styleUrls: ['./modelling-breadcrumb.component.less']
})
export class ModellingBreadcrumbComponent implements OnInit {
  breadcrumbData: IBreadcrumb[] = [];
  lastBreadcrumb: IBreadcrumb;
  isDisabled: boolean;

  constructor(protected breadcrumbService: ModellingBreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbData = this.breadcrumbService.getData();
    this.lastBreadcrumb = this.breadcrumbData[this.breadcrumbData.length - 1];
    this.breadcrumbService.isDisabled.subscribe(val => {
      this.isDisabled = val;
    });
  }
}
