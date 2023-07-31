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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { ModellingModel, ModellingScenario } from 'src/app/core/models/modelling-data.model';
import { UserModel } from 'src/app/core/models/user.model';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { MatChipInputEvent } from '@angular/material/chips';
import { ModellingConfigurationParametersComponent } from '../modelling-configuration-parameters/modelling-configuration-parameters.component';
import { IModellingScenarioDataEntityPayload } from 'src/app/core/entities/modelling-data.entity';
import { Constants } from 'src/app/core/models/constants';

@Component({
  selector: 'app-modelling-configuration',
  templateUrl: './modelling-configuration.component.html',
  styleUrls: ['./modelling-configuration.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingConfigurationComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  Constants = Constants;
  moment = Moment;
  currentDate = Moment();
  user: UserModel;
  models: ModellingModel[];
  userScenarios: ModellingScenario[];
  regions = [
    { code: 'DE', name: 'Deutschland' },
    { code: 'NL', name: 'Nederland' }
  ];

  selectedTabIndex = 0;
  selectedModelName = '';
  modelParams = [];
  modelNotSelectedError = false;
  configurationChanged = true;

  configurationFormGroup = this.formBuilder.group({
    pathogenSelect: ['', Validators.required],
    prevConfigurationSelect: ['_defaultconf_', Validators.required],
    regionSelect: ['DE', Validators.required]
  });
  dataFormGroup = this.formBuilder.group({
    scenarioName: ['', [Validators.required, Validators.maxLength(200)]],
    scenarioDescription: ['', Validators.maxLength(2000)]
  });
  configurationTags = [];

  isLoading = false;
  isError = false;
  noModelsError = false;
  dialogRef;

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private authDataService: AuthManagementDataService,
    private formBuilder: UntypedFormBuilder,
    private modellingService: ModellingDataService,
    private dialog: MatDialog,
    private self: MatDialogRef<ModellingConfigurationComponent>) {}

  ngOnInit(): void {
    this.user = this.authDataService.getAuthenticatedUser();

    this.modellingService.getModelList().subscribe(data => {
      this.models = data;

      if (this.models.length === 0) {
        this.noModelsError = true;
        return;
      }

      // If creating comparison scenario show only the current model
      if (this.injectedData.prevModelId) {
        this.models = this.models.filter(e => e.id === this.injectedData.prevModelId);
      }
      else{
        // Auto-select first model
        this.configurationFormGroup.patchValue({
          pathogenSelect: this.models[0].id
        });
      }
    });

    this.modellingService.getScenarioList(this.user.id, true).subscribe(data => {
      // Show most recent scenarios first
      data.reverse();
      this.userScenarios = data;
    });

    // Select current model if there is a previous model (Comparison)
    if (this.injectedData.prevModelId) {
      this.configurationFormGroup.patchValue({
        pathogenSelect: this.injectedData.prevModelId
      });
      this.configurationFormGroup.get('pathogenSelect').disable();
    }
  }

  checkFirstStep() {
    // Show error message if model is not selected
    if (!this.configurationFormGroup.get('pathogenSelect').value) {
      this.modelNotSelectedError = true;
    }
    else{
      this.modelNotSelectedError = false;
    }
  }

  firstStepSubmit() {
    // Set the name of the scenario based on the model selected
    const modelElem = this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value);
    if (modelElem) {
      this.selectedModelName = modelElem.name;
      const modelName = modelElem.name.replace(/\s/g, '');
      const username = this.user.firstName ? this.user.firstName.concat(this.user.lastName) : 'PANDEM-2';
      const scenarioName =  modelName + '_'
                            + this.currentDate.format('DD-MM-YY') + '_'
                            + username;
      if (this.dataFormGroup.controls['scenarioName'].untouched) {
        this.dataFormGroup.patchValue({
          scenarioName: scenarioName
        });
      }

      // Change configuration (will only run if needed)
      this.changeConfiguration();
    }
  }

  changeConfiguration() {
    const modelElem = this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value);
    if (modelElem && this.configurationChanged) {
      // Create a clone of the original parameters
      // and then replace default values if there is a previous configuration selected
      this.modelParams = _.cloneDeep(modelElem.parameters.filter(e => e.category.toLowerCase() !== 'data'));

      const selectedScenario = this.configurationFormGroup.get('prevConfigurationSelect').value;

      if (selectedScenario && selectedScenario !== '_defaultconf_') {
        const selectedScenarioElem = this.userScenarios.find(e => e.id === selectedScenario);
        if (selectedScenarioElem) {
          const selectedScenarioParams = selectedScenarioElem.parameters;
          this.modelParams.forEach(param => {
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
      }

      // Reset configurationChanged flag
      this.configurationChanged = false;
    }
  }

  clickParameterEdit() {
    this.dialogRef = this.dialog.open(ModellingConfigurationParametersComponent, {
      data: {
        modelParams: this.modelParams,
        parent: this
      }
    });
  }

  configurationCanceled() {
    this.dialogRef.close();
  }

  configurationSaved(params) {
    this.modelParams = params;
    this.dialogRef.close();
  }

  setConfigurationChanged() {
    // Change configuration when model changes or prev. scenario changes
    this.configurationChanged = true;
    this.changeConfiguration();
  }

  runScenario() {
    this.isLoading = true;
    this.self.disableClose = true;

    // Create a map and then convert it to an array to prevent the same key to appear multiple times
    const params: Map<string, { key: string, values: any[] }> = new Map();
    this.modelParams.forEach(param => {
      params.set(param.key, { key: param.key, values: param.values });
    });
    const payloadParams = Array.from(params.values());

    // Add comparison to tags if needed
    if (this.injectedData.comparisonScenarioId) {
      this.configurationTags.unshift('Comparison');
    }

    const payload: IModellingScenarioDataEntityPayload = {
      userId: this.user.id,
      modelId: this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value).id,
      previousConfigScenarioId: this.configurationFormGroup.get('prevConfigurationSelect').value !== '_defaultconf_'
        ? this.configurationFormGroup.get('prevConfigurationSelect').value
        : undefined,
      comparisonScenarioId: this.injectedData.comparisonScenarioId ? this.injectedData.comparisonScenarioId : undefined,
      name: this.dataFormGroup.get('scenarioName').value,
      date: Moment().format(),
      description: this.dataFormGroup.get('scenarioDescription').value
        ? this.dataFormGroup.get('scenarioDescription').value
        : undefined,
      tags: [
        this.configurationFormGroup.get('regionSelect').value,
        this.user.firstName ? this.user.firstName + ' ' + this.user.lastName : 'PANDEM-2',
        ...this.configurationTags
      ],
      location: this.configurationFormGroup.get('regionSelect').value,
      parameters: payloadParams
    };

    this.modellingService.createScenario(payload)
      .subscribe(
        data => {
          this.isLoading = false;
          this.self.disableClose = false;
          this.injectedData.parent.runConfiguration(data);
        },
        _error => {
          this.isLoading = false;
          this.isError = true;
          this.self.disableClose = false;
        }
      );
  }

  setIndex(event) {
    this.selectedTabIndex = event.selectedIndex;
    if (this.selectedTabIndex === 1) {
      this.firstStepSubmit();
    }
  }

  addTag(event: MatChipInputEvent): void {
    let value = (event.value || '').trim();
    value = value.length > 80 ? value.slice(0, 80) + '...' : value;
    if (value && this.configurationTags.length < 200) {
      this.configurationTags.push(value);
    }
    // Clear the input value
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    const index = this.configurationTags.indexOf(tag);
    if (index >= 0) {
      this.configurationTags.splice(index, 1);
    }
  }
}
