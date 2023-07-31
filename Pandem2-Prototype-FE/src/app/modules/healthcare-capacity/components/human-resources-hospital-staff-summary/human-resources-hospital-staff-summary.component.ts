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
import { Component } from '@angular/core';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import { HumanResourceStaffTypes } from '../../../../core/entities/humanResources-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-human-resources-hospital-staff-summary',
  templateUrl: './human-resources-hospital-staff-summary.component.html',
  styleUrls: ['./human-resources-hospital-staff-summary.component.less']
})
export class HumanResourcesHospitalStaffSummaryComponent extends DashboardComponent {
  numberOfHospitalStaff = 0;
  positiveEvolution = true;
  positiveEvolutionPercentage = 0;
  showInfo = false;
  evolution = 0;
  per100KInhabitants = 0;
  icuStaff = 0;
  emergencyStaff = 0;
  regularStaff = 0;
  // TODO: Calculate source when data is imported
  source = 'Synthesized Data - Last Update: 04.11.2021, 07.52h';
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected humanResourcesDataService: HumanResourcesDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    // reset data
    this.numberOfHospitalStaff = 0;
    this.positiveEvolution = true;
    this.positiveEvolutionPercentage = 0;
    this.evolution = 0;
    this.per100KInhabitants = 0;
    this.icuStaff = 0;
    this.emergencyStaff = 0;
    this.regularStaff = 0;

    this.humanResourcesDataService
      .getDataForSummaryCards(this.selectedRegionCode)
      .subscribe(result => {
        const todayHRDataAbs = result[0].data[0];
        const todayHRData100K = result[1].data[0];
        const pathogenStartHRDataAbs = result[2].data[0];
        if (todayHRDataAbs && todayHRDataAbs.split) {
          todayHRDataAbs.split.forEach(data => {
            if (data.split_value === HumanResourceStaffTypes.ICU) {
              this.icuStaff = data.total;
              this.numberOfHospitalStaff += data.total;
            } else if (data.split_value === HumanResourceStaffTypes.Ward) {
              this.emergencyStaff = data.total;
              this.numberOfHospitalStaff += data.total;
            }
          });
        }
        if (todayHRData100K && todayHRData100K.split) {
          todayHRData100K.split.forEach(data => {
            if ([HumanResourceStaffTypes.ICU, HumanResourceStaffTypes.Ward].includes(data.split_value)) {
              this.per100KInhabitants += data.total;
            }
          });
        }
        if (pathogenStartHRDataAbs && pathogenStartHRDataAbs.split) {
          let pathogenStartHRTotal = 0;
          pathogenStartHRDataAbs.split.forEach(data => {
            if ([HumanResourceStaffTypes.ICU, HumanResourceStaffTypes.Ward].includes(data.split_value)) {
              pathogenStartHRTotal += data.total;
            }
          });

          this.evolution = this.numberOfHospitalStaff - pathogenStartHRTotal;
          this.positiveEvolution = this.evolution > 0;
          this.positiveEvolutionPercentage = this.evolution / pathogenStartHRTotal * 100;
        }
        this.hideLoading();
      });
  }
}
