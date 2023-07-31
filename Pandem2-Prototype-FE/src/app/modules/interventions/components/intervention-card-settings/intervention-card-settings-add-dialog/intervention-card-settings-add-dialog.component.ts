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
import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { IInterventionRegion, InterventionDataPayload } from 'src/app/core/entities/intervention-data.entity';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { InterventionDataService } from 'src/app/core/services/data/intervention.data.service';
import { throwError, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DateFormatISODate } from 'src/app/shared/constants';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ValidationService } from '../../../../../core/services/helper/validation.service';

interface InterventionFormErrors {
  location: string;
  interventionName: string;
  interventionDescription: string;
  start_date: string;
  end_date: string
}

@Component({
  selector: 'app-intervention-card-settings-add-dialog',
  templateUrl: './intervention-card-settings-add-dialog.component.html',
  styleUrls: ['./intervention-card-settings-add-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class InterventionCardSettingsAddDialogComponent implements OnInit, OnDestroy  {
  private destroyed$: Subject<void> = new Subject();
  uploadReady = false;
  data: InterventionDataPayload;
  userId: string;
  nutsLevel = 0;
  location: IInterventionRegion;
  start_date: string;
  end_date: string;
  selectedRegionName;
  selectedRegionCode;
  selectedRegionNutsLevel = 'NUTS00';
  dialogRef;
  allRegions = [];
  countryControl = new UntypedFormControl();

  // Used in parent of this component to change location when user loaded saved report
  @ViewChild('locationSelect') locationSelect;

  // Report name is required, custom date can't be saved if there is no custom date set
  // Custom date disabled by default, will be enabled on init if there is custom date data
  addForm = new UntypedFormGroup({
    location: new UntypedFormControl(null, Validators.required),
    sources: new UntypedFormControl('Custom'),
    interventionName: new UntypedFormControl(null, Validators.required),
    interventionDescription: new UntypedFormControl(null, Validators.required),
    start_date: new UntypedFormControl(null, Validators.required),
    end_date: new UntypedFormControl(null, Validators.required)
  });

  formErrors: InterventionFormErrors;

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    protected nutsData: NutsDataService,
    private selectedRegion: SelectedRegionService,
    private authDataService: AuthManagementDataService,
    private interventionDataService: InterventionDataService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      this.userId = authUser.id;
      this.uploadReady = true;
    });
    this.selectedRegion.currentRegionAndNutsLevel
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.selectedRegionNutsLevel = 'NUTS0' + (value.currentNutsLevel - 1));
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.allRegions =  _.orderBy(data, ['name'], ['asc']);
      });

    this.formErrors = new class implements InterventionFormErrors {
      location: '';
      interventionName: '';
      interventionDescription: '';
      start_date: '';
      end_date: '';
    };
  }

  changed(): void {
    if (this.countryControl.value ) {
      this.addForm.get('location').setValue(this.countryControl.value);
    }
  }

  onSubmit() {
    if (this.addForm.invalid) {
      this.formErrors = this.validationService.setValidationErrors(this.addForm, this.formErrors);
      return;
    }
    // Build payload
    this.location = {
      reference: this.selectedRegionNutsLevel,
      value: this.selectedRegionCode
    };
    const start_date = new Date(this.addForm.get('start_date').value);
    const end_date = new Date(this.addForm.get('end_date').value);
    this.data = {
      pathogenId: 'COVID-19',
      is_custom: true,
      name: this.addForm.get('interventionName').value,
      description: this.addForm.get('interventionDescription').value,
      location: { value: this.addForm.get('location').value.code, reference: 'NUTS0' },
      start_date: moment(start_date).format(DateFormatISODate),
      end_date: moment(end_date).format(DateFormatISODate)
    };
    // Create intervention
    this.interventionDataService.createIntervention(this.data)
      .pipe(catchError((err) => { return throwError(err); }))
      .subscribe(() => {
        this.injectedData.parent.interventionSaved();
      });
  }

  setLocation() {
    if (this.injectedData.locationCode && this.injectedData.locationNuts) {
      this.location = {
        value: this.injectedData.locationCode,
        reference: this.injectedData.locationNuts
      };
    }
  }

  setCustomDate() {
    this.start_date = moment(this.injectedData.start_date).format(DateFormatISODate);
    this.end_date = moment(this.injectedData.end_date).format(DateFormatISODate);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
