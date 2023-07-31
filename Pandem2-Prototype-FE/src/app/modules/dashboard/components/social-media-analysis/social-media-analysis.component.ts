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
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import * as moment from 'moment';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import { SocialMediaAnalysisDataDailyDataResponse, SocialMediaAnalysisInputModel } from 'src/app/core/models/socialMediaAnalysis-data.model';
import * as _ from 'lodash';
import { UserModel } from 'src/app/core/models/user.model';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';

@Component({
  selector: 'app-landing-social-media-analysis',
  templateUrl: 'social-media-analysis.component.html',
  styleUrls: ['./social-media-analysis.component.less']
})
export class SocialMediaAnalysisComponent implements OnInit, OnDestroy {
  @Output() hideCard = new EventEmitter<string>();

  currentUser: UserModel;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  dataSubscription: Subscription;
  selectedRegionCode: string;
  selectedRegionName: string;
  postNumber: number = 0;
  topicsData: SocialMediaAnalysisDataDailyDataResponse[];

  endDate: Date;
  endDateFormatted: string;

  constructor(
    private authService: AuthManagementDataService,
    private smaInputService: SocialMediaAnalysisInputService,
    protected socialMediaAnalysisService: SocialMediaAnalysisDataService,
    private selectedRegion: SelectedRegionService
  ) {

  }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    this.selectedRegion.currentlySelectedRegion
      .subscribe((region: any) => {
        this.selectedRegionName = region.name;
        this.selectedRegionCode = region.code;

        // default to current date if no end date set on user
        const currentUserEndDate = _.get(this.currentUser, 'settings.data_interval.end_date');
        this.endDate = currentUserEndDate ? new Date(currentUserEndDate) : new Date();
        this.endDateFormatted = moment(this.endDate).format(Constants.DEFAULT_DATE_FORMAT);

        const smaInput: SocialMediaAnalysisInputModel = {
          selectedRegionCode: this.selectedRegionCode,
          selectedRegionName: this.selectedRegionName,
          selectedLanguages: [],
          selectedSources: []
        };
        this.smaInputService.changeInput(smaInput);
        this.retrieveTopics();
        this.retrievePostsNumber();
      });
  }

  ngOnDestroy(): void {
    // Cancel any active subscriptions
    this.cancelSubscriptions();
  }

  private cancelSubscriptions(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = undefined;
    }
  }

  hide(): void {
    this.hideCard.emit('social-media-analysis');
  }

  retrievePostsNumber() {
    // Cancel any active subscriptions
    this.cancelSubscriptions();

    this.dataSubscription = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.VolumeCumulative,
        this.selectedRegionCode,
        undefined,
        undefined,
        this.endDateFormatted,
        this.endDateFormatted
      ).subscribe((response: SocialMediaAnalysisDataDailyDataResponse) => {
        this.dataSubscription = undefined;

        const sourcesMap = {};
        if ((response as any).metadata?.sources?.length) {
          (response as any).metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
        this.sources = Object.values(sourcesMap);

        if (response.data && response.data[0]) {
          this.postNumber = response.data[0].total || 0;
        } else {
          this.postNumber = 0;
        }
      });
  }

  retrieveTopics(): void {
    const yesterday = moment(this.endDate).subtract(1, 'd').format(Constants.DEFAULT_DATE_FORMAT);
    const todaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        undefined,
        undefined,
        this.endDateFormatted,
        this.endDateFormatted,
        SocialMediaAnalysisDataSplitType.Topic
      );

    const yesterdaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        undefined,
        undefined,
        yesterday,
        yesterday,
        SocialMediaAnalysisDataSplitType.Topic
      );
    forkJoin([
      todaysData,
      yesterdaysData
    ]).subscribe( results => {
      this.topicsData = results;
    });
  }
}
