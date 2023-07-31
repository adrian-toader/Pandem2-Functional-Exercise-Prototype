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
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import {
  ActiveAndRecoveredCasesComponent
} from '../../components/active-and-recovered-cases/active-and-recovered-cases.component';
import { ConfirmedCasesByComponent } from '../../components/confirmed-cases-by/confirmed-cases-by.component';
import { ConfirmedCasesComponent } from '../../components/confirmed-cases/confirmed-cases.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { ReproductionNumberComponent } from '../../components/reproduction-number/reproduction-number.component';
import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.less']
})
export class CasesComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.SURVEILLANCE_CASES_FILTERS;
  public regions;
  isEurope: boolean;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(ConfirmedCasesComponent, 'app-confirmed-cases'),
    new GraphDetail(ConfirmedCasesByComponent, 'app-confirmed-cases-by'),
    new GraphDetail(ActiveAndRecoveredCasesComponent, 'app-active-and-recovered-cases'),
    new GraphDetail(NotificationsComponent, 'app-notifications'),
    new GraphDetail(ReproductionNumberComponent, 'app-reproduction-number')
  ];
  graphListCopy = [...this.graphList];
  selectedRegionName;
  introJS = introJs();

  constructor(
    private selectedRegion: SelectedRegionService,
    private graphManager: GraphMananger
  ) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=dfVt9iLwKd0" target="_blank">https://www.youtube.com/watch?v=dfVt9iLwKd0</a>'
        }
      ]
    });
  }

  ngOnInit(): void {
    this.selectedRegion.currentlySelectedRegion.subscribe(value => {
      this.selectedRegionName = value.name;
      this.isEurope = this.selectedRegionName === 'Europe';
      this.graphList = this.isEurope ? [] : this.graphListCopy;
    });
    this.graphManager.graphList = this.isEurope ? [] : this.graphList;
  }
  showHelpInfo(): void {
    this.introJS.start();
  }
}
