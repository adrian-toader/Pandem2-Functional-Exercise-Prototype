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
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModellingModelParameterValueAgeTypeLabels, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import * as _ from 'lodash';

@Component({
  selector: 'app-modelling-card-manager-dialog',
  templateUrl: './modelling-card-manager-dialog.component.html',
  styleUrls: ['./modelling-card-manager-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingCardManagerDialogComponent implements OnInit {

  outputs = _.cloneDeep(ModellingScenarioDayResultsDataMap);
  outputsFormGroup = new UntypedFormGroup({});
  plotlinesFormGroup = new UntypedFormGroup({});
  outputsDisplay = [];
  selectedOutputs = [];

  showWarning = false;

  ageGroups = new Set();
  allAgeGroups = [];
  allAgeGroupAbreviations = [];

  outputDisplayColumns = [['General indicators', 'ICU', 'Surge strategies activated'], ['Hospital indicators', 'Ward', 'Morgue', 'Physicians'], ['Vaccinations', 'Therapeutics', 'PPE', 'Ventilators', 'Oxygen', 'Hospital peaks', 'Hospital totals', 'Stress indicators']];

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private dialogRef: MatDialogRef<ModellingCardManagerDialogComponent>) {}

  ngOnInit(): void {
    // Set age groups
    Object.keys(ModellingModelParameterValueAgeTypeLabels).forEach(key => {
      this.allAgeGroups.push(ModellingModelParameterValueAgeTypeLabels[key]);
      this.allAgeGroupAbreviations.push('_' + key);
    });

    // Remove outputs that don't have results
    const keys = Array.from(this.outputs.keys());
    keys.forEach(key => {
      if (!this.injectedData.data.has(key)) {
        this.outputs.delete(key);
      }
    });

    // Create form controls
    this.outputs.forEach((_value, key) => {
      let valueChecked = false;
      let plotlineChecked = false;
      if (this.injectedData.values && this.injectedData.values.find(e => e === key)) {
        valueChecked = true;
      }
      if (this.injectedData.plotlines && this.injectedData.plotlines.find(e => e === key)) {
        plotlineChecked = true;
      }
      this.outputsFormGroup.addControl(key, new UntypedFormControl(valueChecked));
      this.plotlinesFormGroup.addControl(key, new UntypedFormControl(plotlineChecked));
    });

    // Create display array
    this.outputs.forEach((elem, key) => {
      let categoryIndex = this.outputsDisplay.findIndex(e => e.category === elem.category);
      if (categoryIndex === -1) {
        this.outputsDisplay.push({ category: elem.category, subcategories: [] });
      }

      // Get updated category index
      categoryIndex = this.outputsDisplay.findIndex(e => e.category === elem.category);
      let subcategoryIndex = this.outputsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === elem.subcategory);
      if (subcategoryIndex === -1) {
        this.outputsDisplay[categoryIndex].subcategories.push({ subcategory: elem.subcategory, keys: [] });
      }

      // Get updated subcategory index
      subcategoryIndex = this.outputsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === elem.subcategory);

      // Create group if the output has age groups
      let groupFound = false;
      const originalKey = key;
      if (this.allAgeGroupAbreviations.includes(key.slice(key.length - 2))) {
        this.ageGroups.add(ModellingModelParameterValueAgeTypeLabels[key.slice(key.length - 1)]);
        const slicedKey = key.slice(0, key.length - 2);
        const keyIndex = this.outputsDisplay[categoryIndex].subcategories[subcategoryIndex].keys.findIndex(e => e.key === slicedKey);
        if (keyIndex !== -1) {
          this.outputsDisplay[categoryIndex].subcategories[subcategoryIndex].keys[keyIndex].keyGroup.push(key);
          groupFound = true;
        }
        else{
          // If group not already found, create new set with only current age
          this.ageGroups = new Set([ModellingModelParameterValueAgeTypeLabels[key.slice(key.length - 1)]]);
          key = slicedKey;
        }
      }

      if (!groupFound) {
        this.outputsDisplay[categoryIndex].subcategories[subcategoryIndex].keys.push({
          key: key,
          keyGroup: [originalKey],
          label: this.outputs.get(originalKey).label,
          ageGroups: key !== originalKey ? this.ageGroups : undefined
        });
      }
    });

    this.reorderOutputsDisplay();

    this.loadSelectedOutputs();
  }

  reorderOutputsDisplay() {
    // Create columns & reorder
    this.outputDisplayColumns.reverse();
    this.outputDisplayColumns.forEach(column => {
      column.reverse();
      this.outputsDisplay.unshift([]);
      column.forEach(category => {
        const categoryIndex = this.outputsDisplay.findIndex(e => e.category === category);
        if (categoryIndex !== -1) {
          this.outputsDisplay[0].unshift(this.outputsDisplay[categoryIndex]);
          this.outputsDisplay.splice(categoryIndex, 1);
        }
      });
    });
  }

  outputCheckboxChanged() {
    this.loadSelectedOutputs();
    this.showWarning = false;
  }

  loadSelectedOutputs() {
    this.selectedOutputs = [];
    Object.keys(this.outputsFormGroup.controls).forEach(key => {
      if (this.outputsFormGroup.controls[key].value === true) {
        this.selectedOutputs.push(key);
      }
    });
    Object.keys(this.plotlinesFormGroup.controls).forEach(key => {
      if (this.plotlinesFormGroup.controls[key].value === true) {
        if (!this.selectedOutputs.includes(key)) {
          this.selectedOutputs.push(key);
        }
      }
    });
  }

  acceptChanges() {
    const values = [];
    const plotlines = [];

    // Get outputs
    Object.keys(this.outputsFormGroup.controls).forEach(key => {
      if (this.outputsFormGroup.controls[key].value === true) {
        values.push(key);
      }
    });

    // Get plotlines
    Object.keys(this.plotlinesFormGroup.controls).forEach(key => {
      if (this.plotlinesFormGroup.controls[key].value === true) {
        plotlines.push(key);
      }
    });

    if (values.length === 0) {
      this.showWarning = true;
      return;
    }

    // If there is no chartIndex, a chart is being added (else modified)
    if (this.injectedData.chartIndex === undefined) {
      const index = this.injectedData.addToIndex ? this.injectedData.addToIndex : 0;
      this.injectedData.chartPage.dialogChartAdded(index, values, plotlines);
    }
    else{
      const index = this.injectedData.chartIndex ? this.injectedData.chartIndex : 0;
      this.injectedData.chartPage.dialogChartModified(index, values, plotlines);
    }

    this.dialogRef.close();
  }
}
