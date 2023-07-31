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
import { Component, OnDestroy } from '@angular/core';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import * as introJs from 'intro.js/intro.js';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisInputModel,
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisDataLanguageModel
} from 'src/app/core/models/socialMediaAnalysis-data.model';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import * as _ from 'lodash';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import * as moment from 'moment';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-social-media-analysis',
  templateUrl: './social-media-analysis.component.html',
  styleUrls: ['./social-media-analysis.component.less']
})
export class SocialMediaAnalysisComponent extends DashboardComponent implements OnDestroy {
  introJS = introJs();

  pathogen = 'COVID-19';
  placeholderLanguage = 'Select language';
  placeholderSource = 'Select source';
  noLanguageFound = 'No language found';
  noSourceFound = 'No source found';
  languages: any[] = [];
  filteredLanguages: any[] = [];
  selectedLanguages: any[] = [];
  selectedSources: any[] = [];
  sourcesMap = {
    'MediSys': 'Medisys',
    'Twitter datasets': 'Twitter'
  };
  sources = Object.keys(this.sourcesMap);
  filteredSources: any[] = this.sources;
  postNumber: number;
  showSentimentAndEmotions: boolean = true;
  showSuggestionMining: boolean = true;
  showSocialMediaAnalysisInfo: boolean = true;
  topicsData: SocialMediaAnalysisDataDailyDataResponse[];

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected smaInputService: SocialMediaAnalysisInputService,
    protected socialMediaAnalysisService: SocialMediaAnalysisDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
    this.introJS.setOptions({
      steps: [
        {
          intro: 'TBD'
        }
      ]
    });
  }

  ngOnDestroy(): void {
    // Cancel any active subscriptions
    this.cancelSubscriptions();
  }

  showHelpInfo(): void {
    this.introJS.start();
  }

  filterLanguage(searchText): void {
    this.filteredLanguages = this.languages.filter(language => language.name.toLowerCase().includes(searchText));
  }

  filterSource(searchText): void {
    this.filteredSources = this.sources.filter(source => source.toLowerCase().includes(searchText));
  }

  filtersChanged(): void {
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  removeLanguage(languageCode): void {
    this.selectedLanguages = this.selectedLanguages.filter(l => l.code !== languageCode);

    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  removeSource(sourceCode): void {
    this.selectedSources = this.selectedSources.filter(s => s !== sourceCode);
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  retrieveData(): void {
    this.cancelSubscriptions();
    this.retrieveLanguages();
    this.retriveTopics();
  }

  retriveTopics(): void {
    const previousDay = moment(this.endDate).subtract(1, 'd').format('YYYY-MM-DD');
    const todaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.endDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Topic,
        undefined,
        undefined,
        this.selectedSources
      );

    const yesterdaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        previousDay,
        previousDay,
        SocialMediaAnalysisDataSplitType.Topic,
        undefined,
        undefined,
        this.selectedSources
      );
    this.dataSubscription = forkJoin([
      todaysData,
      yesterdaysData
    ]).subscribe( results => {
      this.dataSubscription = undefined;
      this.topicsData = results;
    });
  }

  retrieveLanguages(): void {
    this.socialMediaAnalysisService
      .getSocialMediaAnalysisLanguages(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode
      ).subscribe((languages: SocialMediaAnalysisDataLanguageModel[]) => {
      // reset language select values
        this.languages = [];
        this.filteredLanguages = [];
        this.selectedLanguages = [];
        for (const language of languages) {
          this.languages.push({
            code: language.code,
            name: language.name ? language.name : language.code
          });
        }
        this.filteredLanguages = this.languages;

        const smaInput: SocialMediaAnalysisInputModel = {
          selectedRegionCode: this.selectedRegionCode,
          selectedRegionName: this.selectedRegionName,
          selectedLanguages: this.selectedLanguages,
          selectedSources: this.selectedSources
        };
        this.smaInputService.changeInput(smaInput);

        // get number of posts
        this.retrievePostsNumber();
      });
  }

  retrievePostsNumber(): void {
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.VolumeCumulative,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.endDate,
        this.endDate,
        undefined,
        undefined,
        undefined,
        this.selectedSources
      ).subscribe((response: SocialMediaAnalysisDataDailyDataResponse) => {
        this.postNumber = _.sumBy(response.data, o => o.total);
      });
  }

  toggleSentimentAndEmotions(): void {
    this.showSentimentAndEmotions = !this.showSentimentAndEmotions;
  }

  toggleSuggestionMining(): void {
    this.showSuggestionMining = !this.showSuggestionMining;
  }

  toggleSocialMediaAnalysisInfo(): void {
    this.showSocialMediaAnalysisInfo = !this.showSocialMediaAnalysisInfo;
  }

  getToggleIconByCondition(condition): string {
    return condition ? 'expand_less' : 'expand_more';
  }
}
