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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { SocialMediaAnalysisDataDailyDataResponse } from '../../../../core/models/socialMediaAnalysis-data.model';

@Component({
  selector: 'app-social-media-analysis-sentiment-and-emotion',
  templateUrl: './social-media-analysis-sentiment-and-emotion.component.html',
  styleUrls: ['./social-media-analysis-sentiment-and-emotion.component.less']
})
export class SocialMediaAnalysisSentimentAndEmotionComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  showInfo = false;
  display;
  selectedRegionCode;
  selectedRegionName;
  selectedLanguages;
  selectedSources;
  @Input() topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() startDate: string;
  @Input() endDate: string;


  constructor(
    protected smaInputService: SocialMediaAnalysisInputService
  ) {
  }

  ngOnInit(): void {
    this.smaInputService.currentlySocialMediaAnalysisInput.subscribe((value) => {
      this.selectedRegionCode = value.selectedRegionCode;
      this.selectedRegionName = value.selectedRegionName;
      this.selectedLanguages = value.selectedLanguages.code;
      this.selectedSources = value.selectedSources;

      this.retrieveData();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.smaInputService.resetData();
  }

  public retrieveData(): void {
    this.showLoading();
    this.hideLoading();
  }

  showLoading(): void {
    this.display = false;
  }

  hideLoading(): void {
    this.display = true;
  }

  isLoading(): boolean {
    return !this.display;
  }

  isLoaded(): boolean {
    return this.display;
  }

}
