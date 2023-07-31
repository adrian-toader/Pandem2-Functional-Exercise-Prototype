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
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ReportDataService } from 'src/app/core/services/data/report.data.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-report-card-options-load-dialog',
  templateUrl: './report-card-options-load-dialog.component.html',
  styleUrls: ['./report-card-options-load-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ReportCardOptionsLoadDialogComponent implements OnInit {
  data = [];
  filteredData = [];
  dataLoaded = false;

  searchControl = new UntypedFormControl();
  searchInput = '';

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private authDataService: AuthManagementDataService,
    private reportDataSerivce: ReportDataService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to report search input changes
    this.searchControl.valueChanges.subscribe(val => {
      this.searchInput = val;
      this.updateReportList();
    });

    // Get authenticated user then get the report list for that user
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      const userId = authUser.id;
      this.reportDataSerivce.getReportList(userId)
        .subscribe(data => {
          this.data = data;
          this.filteredData = this.data;
          this.dataLoaded = true;
        });
    });
  }

  updateReportList() {
    this.filteredData = this.data.filter(x => x.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  onButtonClick(id: string) {
    const reportData = this.data.find(elem => elem.id === id);
    this.injectedData.parent.loadGraphSelected(reportData);
  }

  onRemoveClick(id: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete report',
        message: 'Are you sure you want to delete this report?'
      }
    });
    confirmDialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.data = this.data.filter(x => x.id !== id);
        this.updateReportList();
        this.reportDataSerivce.deleteReport(id)
          .pipe(catchError((err) => { return throwError(err); }))
          .subscribe();
      }
    });
  }
}
