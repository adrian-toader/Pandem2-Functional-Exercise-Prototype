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
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IReportLocation, ReportCardItem, reportCardItemTypeValues, ReportDataPayload, ReportModellingExplorationItem, ReportModellingSectionItem } from 'src/app/core/entities/report-data.entity';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ReportDataService } from 'src/app/core/services/data/report.data.service';
import { GraphDetail, MapDetail, ReportDescription, ReportModellingExplorationChart, ReportModellingSection, ReportTitle } from 'src/app/core/services/helper/graph-manager.service';
import { DateFormatISODate } from 'src/app/shared/constants';
import * as Moment from 'moment';

@Component({
  selector: 'app-report-card-options-save-dialog',
  templateUrl: './report-card-options-save-dialog.component.html',
  styleUrls: ['./report-card-options-save-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ReportCardOptionsSaveDialogComponent implements OnInit {
  uploadReady = false;
  data: ReportDataPayload;
  userId: string;
  reportCards: (ReportCardItem | ReportModellingSectionItem | ReportModellingExplorationItem)[] = [];
  location: IReportLocation;
  startDate: string;
  endDate: string;

  // Report name is required, custom date can't be saved if there is no custom date set
  // Custom date disabled by default, will be enabled on init if there is custom date data
  saveForm = new UntypedFormGroup({
    reportName: new UntypedFormControl('New Report', Validators.required),
    saveLocation: new UntypedFormControl(false),
    saveCustomDate: new UntypedFormControl({ value: false, disabled: true })
  });

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private authDataService: AuthManagementDataService,
    private reportDataSerivce: ReportDataService) {}

  ngOnInit(): void {
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      this.userId = authUser.id;
      this.uploadReady = true;
    });

    // If at least one of the dates is set, enable the slide for saving
    if (this.injectedData.startDate || this.injectedData.endDate) {
      this.saveForm.controls['saveCustomDate'].enable();
    }
  }

  onFormSubmit() {
    if (this.saveForm.invalid) {
      return;
    }

    // Set the report cards that are going to be saved
    this.setReportCards();

    // Save location only if slide is toggled
    if (this.saveForm.get('saveLocation').value) {
      this.setLocation();
    }

    // Save custom date only if custom date is toggled
    if (this.saveForm.get('saveCustomDate').value) {
      this.setCustomDate();
    }

    // Build payload
    this.data = {
      userId: this.userId,
      name: this.saveForm.get('reportName').value,
      summary: this.injectedData.summary ? this.injectedData.summary : undefined,
      prepared_for: this.injectedData.preparedFor ? this.injectedData.preparedFor : undefined,
      epi_week: this.injectedData.epiWeek ? this.injectedData.epiWeek : undefined,
      report_cards: this.reportCards,
      location: this.location,
      start_date: this.startDate,
      end_date: this.endDate
    };

    // Create report
    this.reportDataSerivce.createReport(this.data)
      .pipe(catchError((err) => { return throwError(err); }))
      .subscribe();

    this.injectedData.parent.reportSaved();
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
    this.startDate = Moment(this.injectedData.startDate).format(DateFormatISODate);
    this.endDate = Moment(this.injectedData.endDate).format(DateFormatISODate);
  }

  // For each report card in the graph list, set the item type and value for DB
  setReportCards() {
    if (this.injectedData.graphList) {
      this.injectedData.graphList.forEach(graph => {
        if (graph instanceof ReportTitle) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.Title,
            value: graph.textValue
          });
        }
        else if (graph instanceof ReportDescription) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.Description,
            value: graph.textValue
          });
        }
        else if (graph instanceof GraphDetail) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.Graph,
            value: graph.graphId
          });
        }
        else if (graph instanceof MapDetail) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.Map,
            value: graph.graphId
          });
        }
        else if (graph instanceof ReportModellingSection) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.ModellingSection,
            section: graph.sectionId,
            scenarioId: graph.scenarioId
          });
        }
        else if (graph instanceof ReportModellingExplorationChart) {
          this.reportCards.push({
            itemType: reportCardItemTypeValues.ModellingExploration,
            graphId: graph.graphId,
            scenarioId: graph.scenarioId,
            chartType: graph.chartType,
            chartPlotType: graph.chartPlotType,
            viewBy: graph.viewBy,
            values: graph.values,
            plotlines: graph.plotlines
          });
        }
      });
    }
  }
}
