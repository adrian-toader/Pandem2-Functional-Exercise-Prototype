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
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ReportCardOptionsLoadDialogComponent
} from './report-card-options-load-dialog/report-card-options-load-dialog.component';
import {
  ReportCardOptionsSaveDialogComponent
} from './report-card-options-save-dialog/report-card-options-save-dialog.component';

@Component({
  selector: 'app-report-card-options',
  templateUrl: './report-card-options.component.html',
  styleUrls: ['./report-card-options.component.less']
})

export class ReportCardOptionsComponent implements OnInit {
  selectedRegionName;
  selectedRegionCode;
  selectedRegionNutsLevel;

  @Output() dateChangedEvent: EventEmitter<any> = new EventEmitter();
  @Output() graphsLoadedEvent: EventEmitter<any> = new EventEmitter();

  @Input() parent;

  // Used in parent of this component to change location when user loaded saved report
  @ViewChild('locationSelect') locationSelect;

  // Form date range
  range = new UntypedFormGroup({
    start: new UntypedFormControl(null),
    end: new UntypedFormControl(null)
  });
  isRangeChanged = false;

  dialogRef;

  constructor(
    private selectedRegion: SelectedRegionService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // If there is a custom date stored, patch the input values
    if (this.parent.graphManager.reportCardDates.start || this.parent.graphManager.reportCardDates.end) {
      this.range.patchValue({
        start: this.parent.graphManager.reportCardDates.start,
        end: this.parent.graphManager.reportCardDates.end
      });
      this.isRangeChanged = true;
    }

    this.selectedRegion.currentlySelectedRegion.subscribe(value => {
      this.selectedRegionName = value.name;
      this.selectedRegionCode = value.code;
    });
    this.selectedRegion.currentRegionAndNutsLevel.subscribe(value => this.selectedRegionNutsLevel = 'NUTS0' + (value.currentNutsLevel - 1));

    // Change to custom date when value changes
    // Check if form is touched. Loading reports will mark the forms as unotuched
    // If new report with custom date is loaded (form untouched), don't emit event
    this.range.valueChanges.subscribe(range => {
      if (this.range.touched) {
        this.dateChangedEvent.emit(range);
        this.isRangeChanged = true;
      }
    });
  }

  onPrintClick(): void {
    window.print();
  }

  onSaveClick(): void {
    this.dialogRef = this.dialog.open(ReportCardOptionsSaveDialogComponent, {
      data: {
        summary: this.parent.summaryText,
        preparedFor: this.parent.reportDetailsForm.get('preparedFor').value,
        epiWeek: this.parent.reportDetailsForm.get('epiWeek').value,
        graphList: this.parent.graphList,
        startDate: this.isRangeChanged ? this.range.get('start').value : undefined,
        endDate: this.isRangeChanged ? this.range.get('end').value : undefined,
        locationCode: this.selectedRegionCode,
        locationNuts: this.selectedRegionNutsLevel,
        parent: this
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  onLoadClick(): void {
    this.dialogRef = this.dialog.open(ReportCardOptionsLoadDialogComponent, {
      data: { parent: this },
      autoFocus: false,
      restoreFocus: false
    });
  }

  loadGraphSelected(reportData): void {
    this.dialogRef.close();
    this.graphsLoadedEvent.emit(reportData);
  }

  reportSaved(): void {
    this.dialogRef.close();
  }
}
