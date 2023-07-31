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
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { HumanResourceStaffTypes } from 'src/app/core/entities/humanResources-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { SourceType, ISource } from '../../../../core/models/i-source';

@Component({
  selector: 'app-human-resources-public-health-staff-summary',
  templateUrl: './human-resources-public-health-staff-summary.component.html',
  styleUrls: ['./human-resources-public-health-staff-summary.component.less']
})
export class HumanResourcesPublicHealthStaffSummaryComponent extends DashboardComponent {
  numberOfPublicHealthStaff = 0;
  positiveEvolution = true;
  positiveEvolutionPercentage = 0;
  showInfo = false;
  evolution = 0;
  per100KInhabitants = 0;
  surveilanceAndResponse = 0;
  pathogenStartNumberOfPublicStaff = 0;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
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
    this.humanResourcesDataService
      .getDataForSummaryCards(this.selectedRegionCode)
      .subscribe(result => {
        const todayHRDataAbs = result[0].data[0];
        const todayHRData100K = result[1].data[0];
        const pathogenStartHRDataAbs = result[2].data[0];
        if (todayHRDataAbs && todayHRDataAbs.split) {
          const todayPublicHRDataAbs = todayHRDataAbs.split.find(x => x.split_value === HumanResourceStaffTypes.Public);
          if (todayPublicHRDataAbs) {
            this.numberOfPublicHealthStaff = todayPublicHRDataAbs.total;
            this.surveilanceAndResponse = todayPublicHRDataAbs.working_surveillance;
          }
        }
        if (todayHRData100K && todayHRData100K.split) {
          const todayPublicHRData100K = todayHRData100K.split.find(x => x.split_value === HumanResourceStaffTypes.Public);
          if (todayPublicHRData100K) {
            this.per100KInhabitants = todayPublicHRData100K.total;
          }
        }
        if (pathogenStartHRDataAbs && pathogenStartHRDataAbs.split) {
          const pathogenStartPublicHRDataAbs = pathogenStartHRDataAbs.split.find(x => x.split_value === HumanResourceStaffTypes.Public);
          if (pathogenStartPublicHRDataAbs) {
            this.pathogenStartNumberOfPublicStaff = pathogenStartPublicHRDataAbs.total;
          }
        }
        this.evolution = this.numberOfPublicHealthStaff - this.pathogenStartNumberOfPublicStaff;
        this.positiveEvolution = this.evolution > 0;
        this.positiveEvolutionPercentage = this.evolution / this.pathogenStartNumberOfPublicStaff * 100;
        this.hideLoading();
      });
  }
}
