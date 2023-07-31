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
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ModellingModel, ModellingModelParameter, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { MatDialog } from '@angular/material/dialog';
import { ModellingConfigurationComponent } from './modelling-configuration/modelling-configuration.component';
import { NavigationExtras, Router } from '@angular/router';
import { ModellingConfigurationParametersComponent } from './modelling-configuration-parameters/modelling-configuration-parameters.component';
import * as _ from 'lodash';
import { IModellingScenarioDataEntityPayload } from 'src/app/core/entities/modelling-data.entity';
import { UserModel } from 'src/app/core/models/user.model';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import * as Moment from 'moment';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';

@Component({
  selector: 'app-modelling-actions',
  templateUrl: './modelling-actions.component.html',
  styleUrls: ['./modelling-actions.component.less']
})
export class ModellingActionsComponent implements OnInit {
  @Input() isOnResultsPage: boolean = false;
  @Input() baselineScenario: ModellingScenarioWithDayResults;
  @Input() prevScenario: ModellingScenarioWithDayResults;
  @Input() prevModel: ModellingModel;
  @Output() removeClickedEvent: EventEmitter<boolean> = new EventEmitter();

  dialogRef;
  user: UserModel;
  isCreatingComparison = false;

  constructor(
    private authDataService: AuthManagementDataService,
    protected dialog: MatDialog,
    protected router: Router,
    protected modellingService: ModellingDataService
  ) { }

  ngOnInit(): void {
    this.user = this.authDataService.getAuthenticatedUser();
  }

  openConfiguration() {
    this.dialogRef = this.dialog.open(ModellingConfigurationComponent, {
      data: {
        parent: this
      }
    });
    this.isCreatingComparison = false;
  }

  openConfigurationWithComparison() {
    this.dialogRef = this.dialog.open(ModellingConfigurationParametersComponent, {
      data: {
        modelParams: this.createParams(this.prevScenario),
        isComparison: true,
        baselineScenarioName: this.baselineScenario.name,
        prevScenarioName: this.baselineScenario.name !== this.prevScenario.name ? this.prevScenario.name : undefined,
        parent: this
      }
    });
    this.isCreatingComparison = true;
  }

  runConfiguration(data: ModellingScenarioWithDayResults) {
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.isCreatingComparison ? this.baselineScenario : data,
        comparisonData: this.isCreatingComparison ? data : undefined
      }
    };
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(
        ['/scenarios/modelling/' + (
          this.isCreatingComparison && this.baselineScenario && this.baselineScenario.id ? this.baselineScenario.id : 'new_scenario'
        )],
        navigationExtras
      ));
    this.dialogRef.close();
  }

  createParams(selectedScenario: ModellingScenarioWithDayResults) {
    let modelParams = [];
    const modelElem = this.prevModel;
    if (modelElem) {
      // Create a clone of the original parameters
      // and then replace default values if there is a previous configuration selected
      modelParams = _.cloneDeep(modelElem.parameters.filter(e => e.category.toLowerCase() !== 'data'));

      const selectedScenarioElem = selectedScenario;

      const selectedScenarioParams = selectedScenarioElem.parameters;
      modelParams.forEach(param => {
        const selectedScenarioParam = selectedScenarioParams.find(e => e.key === param.key);
        if (selectedScenarioParam) {
          if (param.values.length > 1) {
            param.values.forEach(ageGroup => {
              ageGroup.value = selectedScenarioParam.values.find(e => e.age === ageGroup.age).value;
            });
          }
          else {
            param.values[0].value = selectedScenarioParam.values[0].value;
          }
        }
      });
    }

    return modelParams;
  }

  getBaselineConfiguration() {
    return this.createParams(this.baselineScenario);
  }

  configurationCanceled() {
    this.dialogRef.close();
  }

  configurationSaved(newParams: ModellingModelParameter[], altName: string) {
    // Create a map and then convert it to an array to prevent the same key to appear multiple times
    const params: Map<string, { key: string, values: any[] }> = new Map();
    newParams.forEach(param => {
      params.set(param.key, { key: param.key, values: param.values });
    });
    const payloadParams = Array.from(params.values());

    const payload: IModellingScenarioDataEntityPayload = {
      userId: this.user.id,
      modelId: this.prevModel.id,
      previousConfigScenarioId: this.prevScenario.id,
      comparisonScenarioId: this.baselineScenario.id,
      name: altName,
      date: Moment().format(),
      description: this.baselineScenario.description,
      tags: [...this.baselineScenario.tags, 'Comparison'],
      location: this.baselineScenario.location,
      parameters: payloadParams,
      sections_order: this.prevScenario.sections_order || this.baselineScenario.sections_order
    };

    this.dialogRef.componentInstance.isLoading = true;
    this.dialogRef.disableClose = true;
    this.modellingService.createScenario(payload)
      .subscribe({
        next: (data) => {
          this.dialogRef.componentInstance.isLoading = false;
          this.dialogRef.disableClose = false;
          this.runConfiguration(data);
        },
        error: () => {
          this.dialogRef.componentInstance.isLoading = false;
          this.dialogRef.componentInstance.isError = true;
          this.dialogRef.disableClose = false;
        }
      });
  }

  removeComparison() {
    this.removeClickedEvent.emit(true);
  }
}
