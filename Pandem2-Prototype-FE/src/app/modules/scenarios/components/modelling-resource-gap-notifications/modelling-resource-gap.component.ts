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
import { MatDialog } from '@angular/material/dialog';
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';

@Component({
  selector: 'app-modelling-resource-gap',
  templateUrl: './modelling-resource-gap.component.html',
  styleUrls: ['./modelling-resource-gap.component.less']
})
export class ModellingResourceGapComponent extends ModellingScenarioComponent implements OnInit {
  isWardExpanded = false;
  isICUExpanded = false;

  // Curent scenario
  staffedWardBedsAvailable = [];
  physicalWardBeds = [];
  wardNurses = [];
  staffedWardBedsWarning = -1;
  physicalWardBedsWarning = -1;
  wardNursesWarning = -1;

  staffedEquippedICUBeds = [];
  physicalICUBeds = [];
  ICUNurses = [];
  ventilators = [];
  staffedEquippedICUBedsWarning = -1;
  physicalICUBedsWarning = -1;
  ICUNursesWarning = -1;
  ventilatorsWarning = -1;

  // Comparison Scenario
  compStaffedWardBedsAvailable = [];
  compPhysicalWardBeds = [];
  compWardNurses = [];
  compStaffedWardBedsWarning = -1;
  compPhysicalWardBedsWarning = -1;
  compWardNursesWarning = -1;

  compStaffedEquippedICUBeds = [];
  compPhysicalICUBeds = [];
  compICUNurses = [];
  compVentilators = [];
  compStaffedEquippedICUBedsWarning = -1;
  compPhysicalICUBedsWarning = -1;
  compICUNursesWarning = -1;
  compVentilatorsWarning = -1;

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService
  ) {
    super(dialog, modellingDataService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.initializeData();
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeData();
    }
  }

  initializeData() {
    if (this.data.size) {
      // Card 1
      this.loadData(this.staffedWardBedsAvailable, this.data, ModellingScenarioDayResults.StaffedWardBedsAvailable);
      this.loadData(this.staffedWardBedsAvailable, this.data, ModellingScenarioDayResults.StaffedWardBedsNeeded);
      this.loadData(this.staffedWardBedsAvailable, this.data, ModellingScenarioDayResults.StaffedWardBedsGap);
      this.loadData(this.staffedWardBedsAvailable, this.data, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.physicalWardBeds, this.data, ModellingScenarioDayResults.PhysicalWardBedsAvailable);
      this.loadData(this.physicalWardBeds, this.data, ModellingScenarioDayResults.PhysicalWardBedsNeeded);
      this.loadData(this.physicalWardBeds, this.data, ModellingScenarioDayResults.PhysicalWardBedsGap);
      this.loadData(this.physicalWardBeds, this.data, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.wardNurses, this.data, ModellingScenarioDayResults.AvailableNurses);
      this.loadData(this.wardNurses, this.data, ModellingScenarioDayResults.TotalNursesNeededForIncomingPatients);
      this.loadData(this.wardNurses, this.data, ModellingScenarioDayResults.NursesGap);
      this.loadData(this.wardNurses, this.data, ModellingScenarioDayResults.ExpectedNursesFreed);
      // Card 2
      this.loadData(this.staffedEquippedICUBeds, this.data, ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable);
      this.loadData(this.staffedEquippedICUBeds, this.data, ModellingScenarioDayResults.StaffedEquippedICUBedsNeeded);
      this.loadData(this.staffedEquippedICUBeds, this.data, ModellingScenarioDayResults.StaffedEquippedICUBedsGap);
      this.loadData(this.staffedEquippedICUBeds, this.data, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.physicalICUBeds, this.data, ModellingScenarioDayResults.PhysicalICUBedsAvailable);
      this.loadData(this.physicalICUBeds, this.data, ModellingScenarioDayResults.PhysicalICUBedsNeeded);
      this.loadData(this.physicalICUBeds, this.data, ModellingScenarioDayResults.PhysicalICUBedsGap);
      this.loadData(this.physicalICUBeds, this.data, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.ICUNurses, this.data, ModellingScenarioDayResults.AvailableICUNurses);
      this.loadData(this.ICUNurses, this.data, ModellingScenarioDayResults.TotalICUNursesNeededForIncomingPatients);
      this.loadData(this.ICUNurses, this.data, ModellingScenarioDayResults.ICUNursesGap);
      this.loadData(this.ICUNurses, this.data, ModellingScenarioDayResults.ExpectedICUNursesFreed);
      this.loadData(this.ventilators, this.data, ModellingScenarioDayResults.VentilatorsAvailable);
      this.loadData(this.ventilators, this.data, ModellingScenarioDayResults.VentilatorsNeededForIncomingICUPatients);
      this.loadData(this.ventilators, this.data, ModellingScenarioDayResults.GapInVentilators);
      this.loadData(this.ventilators, this.data, ModellingScenarioDayResults.ExpectedVentilatorsFreed);
    }

    if (this.comparisonData.size) {
      // Card 1
      this.loadData(this.compStaffedWardBedsAvailable, this.comparisonData, ModellingScenarioDayResults.StaffedWardBedsAvailable);
      this.loadData(this.compStaffedWardBedsAvailable, this.comparisonData, ModellingScenarioDayResults.StaffedWardBedsNeeded);
      this.loadData(this.compStaffedWardBedsAvailable, this.comparisonData, ModellingScenarioDayResults.StaffedWardBedsGap);
      this.loadData(this.compStaffedWardBedsAvailable, this.comparisonData, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.compPhysicalWardBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalWardBedsAvailable);
      this.loadData(this.compPhysicalWardBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalWardBedsNeeded);
      this.loadData(this.compPhysicalWardBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalWardBedsGap);
      this.loadData(this.compPhysicalWardBeds, this.comparisonData, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.compWardNurses, this.comparisonData, ModellingScenarioDayResults.AvailableNurses);
      this.loadData(this.compWardNurses, this.comparisonData, ModellingScenarioDayResults.TotalNursesNeededForIncomingPatients);
      this.loadData(this.compWardNurses, this.comparisonData, ModellingScenarioDayResults.NursesGap);
      this.loadData(this.compWardNurses, this.comparisonData, ModellingScenarioDayResults.ExpectedNursesFreed);
      // Card 2
      this.loadData(this.compStaffedEquippedICUBeds, this.comparisonData, ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable);
      this.loadData(this.compStaffedEquippedICUBeds, this.comparisonData, ModellingScenarioDayResults.StaffedEquippedICUBedsNeeded);
      this.loadData(this.compStaffedEquippedICUBeds, this.comparisonData, ModellingScenarioDayResults.StaffedEquippedICUBedsGap);
      this.loadData(this.compStaffedEquippedICUBeds, this.comparisonData, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.compPhysicalICUBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalICUBedsAvailable);
      this.loadData(this.compPhysicalICUBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalICUBedsNeeded);
      this.loadData(this.compPhysicalICUBeds, this.comparisonData, ModellingScenarioDayResults.PhysicalICUBedsGap);
      this.loadData(this.compPhysicalICUBeds, this.comparisonData, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.compICUNurses, this.comparisonData, ModellingScenarioDayResults.AvailableICUNurses);
      this.loadData(this.compICUNurses, this.comparisonData, ModellingScenarioDayResults.TotalICUNursesNeededForIncomingPatients);
      this.loadData(this.compICUNurses, this.comparisonData, ModellingScenarioDayResults.ICUNursesGap);
      this.loadData(this.compICUNurses, this.comparisonData, ModellingScenarioDayResults.ExpectedICUNursesFreed);
      this.loadData(this.compVentilators, this.comparisonData, ModellingScenarioDayResults.VentilatorsAvailable);
      this.loadData(this.compVentilators, this.comparisonData, ModellingScenarioDayResults.VentilatorsNeededForIncomingICUPatients);
      this.loadData(this.compVentilators, this.comparisonData, ModellingScenarioDayResults.GapInVentilators);
      this.loadData(this.compVentilators, this.comparisonData, ModellingScenarioDayResults.ExpectedVentilatorsFreed);
    }

    // Warnings
    if (this.data.size) {
      // Ward
      const staffedWardBedsData = this.data.get(ModellingScenarioDayResults.StaffedWardBedsGap).total.yAxis[0].data;
      this.staffedWardBedsWarning = staffedWardBedsData.findIndex(elem => elem < 0);

      const physicalWardBedsData = this.data.get(ModellingScenarioDayResults.PhysicalWardBedsGap).total.yAxis[0].data;
      this.physicalWardBedsWarning = physicalWardBedsData.findIndex(elem => elem < 0);

      const wardNursesData = this.data.get(ModellingScenarioDayResults.NursesGap).total.yAxis[0].data;
      this.wardNursesWarning = wardNursesData.findIndex(elem => elem < 0);

      // ICU
      const staffedEquippedICUBedsData = this.data.get(ModellingScenarioDayResults.StaffedEquippedICUBedsGap).total.yAxis[0].data;
      this.staffedEquippedICUBedsWarning = staffedEquippedICUBedsData.findIndex(elem => elem < 0);

      const physicalICUBedsData = this.data.get(ModellingScenarioDayResults.PhysicalICUBedsGap).total.yAxis[0].data;
      this.physicalICUBedsWarning = physicalICUBedsData.findIndex(elem => elem < 0);

      const ICUNursesData = this.data.get(ModellingScenarioDayResults.ICUNursesGap).total.yAxis[0].data;
      this.ICUNursesWarning = ICUNursesData.findIndex(elem => elem < 0);

      const ventilatorsData = this.data.get(ModellingScenarioDayResults.GapInVentilators).total.yAxis[0].data;
      this.ventilatorsWarning = ventilatorsData.findIndex(elem => elem < 0);
    }

    if (this.comparisonData.size) {
      // Ward
      const staffedWardBedsData = this.comparisonData.get(ModellingScenarioDayResults.StaffedWardBedsGap).total.yAxis[0].data;
      this.compStaffedWardBedsWarning = staffedWardBedsData.findIndex(elem => elem < 0);

      const physicalWardBedsData = this.comparisonData.get(ModellingScenarioDayResults.PhysicalWardBedsGap).total.yAxis[0].data;
      this.compPhysicalWardBedsWarning = physicalWardBedsData.findIndex(elem => elem < 0);

      const wardNursesData = this.comparisonData.get(ModellingScenarioDayResults.NursesGap).total.yAxis[0].data;
      this.compWardNursesWarning = wardNursesData.findIndex(elem => elem < 0);

      // ICU
      const ICUBedsData = this.comparisonData.get(ModellingScenarioDayResults.StaffedEquippedICUBedsGap).total.yAxis[0].data;
      this.compStaffedEquippedICUBedsWarning = ICUBedsData.findIndex(elem => elem < 0);

      const physicalICUBedsData = this.comparisonData.get(ModellingScenarioDayResults.PhysicalICUBedsGap).total.yAxis[0].data;
      this.compPhysicalICUBedsWarning = physicalICUBedsData.findIndex(elem => elem < 0);

      const ICUNursesData = this.comparisonData.get(ModellingScenarioDayResults.ICUNursesGap).total.yAxis[0].data;
      this.compICUNursesWarning = ICUNursesData.findIndex(elem => elem < 0);

      const ventilatorsData = this.comparisonData.get(ModellingScenarioDayResults.GapInVentilators).total.yAxis[0].data;
      this.compVentilatorsWarning = ventilatorsData.findIndex(elem => elem < 0);
    }
  }

  loadData(array: object[], map: Map<string, GraphDatasource>, key: string) {
    array.push({
      name: ModellingScenarioDayResultsDataMap.get(key).label,
      data: map.get(key).total.yAxis[0].data
    });
  }

  expandWard() {
    this.isWardExpanded = !this.isWardExpanded;
  }

  expandICU() {
    this.isICUExpanded = !this.isICUExpanded;
  }
}
