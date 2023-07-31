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
import { Component, Inject, OnInit, OnDestroy,  ViewEncapsulation, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { InterventionDataService } from 'src/app/core/services/data/intervention.data.service';
import { throwError, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DateFormatISODate } from 'src/app/shared/constants';
import * as Moment from 'moment';
import { InterventionDataEntity } from 'src/app/core/entities/intervention-data.entity';

@Component({
  selector: 'app-intervention-card-settings-edit-dialog',
  templateUrl: './intervention-card-settings-edit-dialog.component.html',
  styleUrls: ['./intervention-card-settings-edit-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class InterventionCardSettingsEditDialogComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<void> = new Subject();
  uploadReady = false;
  data: InterventionDataEntity;
  userId: string;
  start_date: string;
  end_date: string;
  selectedRegionNutsLevel = 'NUTS00';
  dialogRef;
  currentIntervention: InterventionDataEntity;

  // Used in parent of this component to change location when user loaded saved report
  @ViewChild('locationSelect') locationSelect;

  editForm;

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private authDataService: AuthManagementDataService,
    private interventionDataService: InterventionDataService) {}

  ngOnInit(): void {
    this.currentIntervention = this.injectedData.intervention;
    this.editForm = new UntypedFormGroup({
      location: new UntypedFormControl(this.currentIntervention.location.value),
      sources: new UntypedFormControl('Custom'),
      is_custom: new UntypedFormControl(this.currentIntervention.is_custom),
      interventionName: new UntypedFormControl(this.currentIntervention.name, Validators.required),
      interventionDescription: new UntypedFormControl(this.currentIntervention.description, Validators.required),
      start_date: new UntypedFormControl(this.currentIntervention.start_date, Validators.required),
      end_date: new UntypedFormControl(this.currentIntervention.end_date, Validators.required)
    });
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      this.userId = authUser.id;
      this.uploadReady = true;
    });

  }

  onSubmit() {
    if (this.editForm.invalid) {
      return;
    }
    // Build payload
    const start_date = new Date(this.editForm.get('start_date').value);
    const end_date = new Date(this.editForm.get('end_date').value);
    this.data = this.currentIntervention;
    this.data.description = this.editForm.get('interventionDescription').value;
    this.data.end_date = Moment(end_date).format(DateFormatISODate);
    this.data.start_date = Moment(start_date).format(DateFormatISODate);
    // Create intervention
    this.interventionDataService.updateIntervention(this.currentIntervention, this.currentIntervention._id)
      .pipe(catchError((err) => { return throwError(err); }))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.injectedData.parent.interventionSaved();
        this.injectedData.parent.onEditClick();
      });
  }

  setCustomDate() {
    this.start_date = Moment(this.injectedData.start_date).format(DateFormatISODate);
    this.end_date = Moment(this.injectedData.end_date).format(DateFormatISODate);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
