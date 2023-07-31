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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IBreadcrumb {
  label: string;
  link?: string;
  icon?: string;
  parent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModellingBreadcrumbService {
  breadcrumbData: IBreadcrumb[] = [];
  isDisabled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // List of breadcrumb elements
  breadcrumbElements: IBreadcrumb[] = [
    {
      label: 'Modelling Home',
      link: '/modelling',
      icon: 'home'
    },
    {
      label: 'Previous Scenarios',
      parent: 'Modelling Home'
    },
    {
      label: 'Scenario Results',
      parent: 'Modelling Home'
    }
  ];

  setCurrentPage(label: string) {
    this.breadcrumbData = [];

    // Recursive function will add current page and parents to breadcrumb
    this.addToBreadcrumb(label);
  }

  addToBreadcrumb(label: string) {
    const elem = this.breadcrumbElements.find(e => e.label === label);
    if (elem) {
      this.breadcrumbData.unshift({ label: elem.label, link: elem.link, icon: elem.icon });

      // If the element has parent, add it to the breadcrumb
      if (elem.parent) {
        this.addToBreadcrumb(elem.parent);
      }
    }
  }

  getData() {
    return this.breadcrumbData;
  }

  setIsDisabled(val: boolean) {
    this.isDisabled.next(val);
  }
}
