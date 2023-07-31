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
import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { Constants } from '../../../../core/models/constants';
import { ModellingScenario } from 'src/app/core/models/modelling-data.model';
import { DialogService } from 'src/app/core/services/helper/dialog.service';
import { DialogAnswer, DialogAnswerButton } from 'src/app/shared/components';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModellingScenarioSummaryShareDialogComponent } from './modelling-scenario-summary-share-dialog/modelling-scenario-summary-share-dialog.component';
import { Router } from '@angular/router';
import { ModellingInfoDialogComponent } from '../modelling-info-dialog/modelling-info-dialog.component';

@Component({
  selector: 'app-modelling-scenario-summary',
  templateUrl: './modelling-scenario-summary.component.html',
  styleUrls: ['./modelling-scenario-summary.component.less']
})
export class ModellingScenarioSummaryComponent implements OnInit, OnChanges {

  currentUser: UserModel;
  Constants = Constants;
  moment = moment;
  dialogRef;

  @Input() scenario: ModellingScenario;
  @Input() comparisonScenario: ModellingScenario;
  @Input() isOnResultsPage: boolean = false;
  @Input() updateEnabled: boolean;
  @Input() isScenarioSaved: boolean;
  @Input() isLatest: boolean;
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();

  saveClicked = false;

  constructor(
    private authService: AuthManagementDataService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router,
    protected modellingDataService: ModellingDataService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If there is any change to exploration or save status, set saveClicked to false (reactivate saving)
    if (changes.updateEnabled || changes.isScenarioSaved) {
      this.saveClicked = false;
    }
  }

  onDeleteClick(): void {
    // Get other scenarios that compare to current one
    this.modellingDataService
      .getScenarioList(this.currentUser.id)
      .subscribe(response => {
        // Reverse scenarios to get the most recent as first & filter
        response.reverse();
        const scenarios = response.filter(scenario => scenario.comparisonScenarioId === this.scenario.id);

        // Create custom message string
        let dependingScenariosString = '';
        let dependingScenariosCount = 0;
        scenarios.forEach(scenario => {
          dependingScenariosCount++;
          if (dependingScenariosCount <= 5) {
            dependingScenariosString += '\'' + scenario.name + '\'<br>';
          }
        });
        if (dependingScenariosCount > 5) {
          dependingScenariosString += 'And ' + (dependingScenariosCount - 5) + ' other scenarios...';
        }

        // show confirm dialog to confirm the action
        this.dialogService.showConfirm(
          !scenarios.length
            ? 'Are you sure you want to delete this scenario: \'' + this.scenario.name + '\'?'
            : 'Are you sure you want to delete this scenario: \'' + this.scenario.name + '\'?<br>The following comparison scenarios depend on it and will be modified<br>' + dependingScenariosString
        ).subscribe((answer: DialogAnswer) => {
          if (answer.button === DialogAnswerButton.Yes) {
            // delete the scenario
            this.modellingDataService
              .deleteScenario(this.scenario.id)
              .pipe(
                catchError((err) => {
                  return throwError(err);
                })
              )
              .subscribe(() => {
                this.delete.emit();
              });
          }
        });
      });
  }

  onShareClick(): void {
    this.dialogRef = this.dialog.open(ModellingScenarioSummaryShareDialogComponent, {
      data: { scenario: this.scenario },
      autoFocus: false,
      restoreFocus: false
    });
  }

  onLoadClick(): void {
    this.router.navigate(['/scenarios/modelling', this.scenario.id]);
  }

  onSaveClick(): void {
    this.saveClicked = true;
    this.save.emit();
  }

  onInfoClick(): void {
    this.dialogRef = this.dialog.open(ModellingInfoDialogComponent, {
      data: {
        parent: this,
        modelId: this.scenario.modelId,
        scenarioName: this.scenario.name,
        comparisonScenarioId: !this.isOnResultsPage ? this.scenario.comparisonScenarioId : undefined,
        scenarioRegionCode: this.scenario.location,
        run1: this.scenario.parameters,
        run2: this.comparisonScenario ? this.comparisonScenario.parameters : undefined
      },
      autoFocus: false,
      restoreFocus: false
    });
  }
}
