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
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import * as _ from 'lodash';
import { SocialMediaAnalysisDataDailyDataResponse } from '../../../../core/models/socialMediaAnalysis-data.model';

export class TopicElement {
  id: string;
  name: string;
  volume?: number;
  upwardsTrend?: boolean;
}

@Component({
  selector: 'app-social-media-analysis-suggestion-mining',
  templateUrl: './social-media-analysis-suggestion-mining.component.html',
  styleUrls: ['./social-media-analysis-suggestion-mining.component.less']
})
export class SocialMediaAnalysisSuggestionMiningComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayTopics;
  displaySubtopics;
  displayTopicSuggestions;

  selectedRegionCode;
  selectedRegionName;
  selectedLanguages;
  selectedTopic;
  selectedSubtopic;
  maxNoOfTopics = 10;

  private _topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() set topicsData(topicsData: SocialMediaAnalysisDataDailyDataResponse[]) {
    this._topicsData = topicsData;
    this.retrieveTopicsData();
  }

  get topicsData(): SocialMediaAnalysisDataDailyDataResponse[] {
    return this._topicsData;
  }

  @Input() endDate: string;

  topics: TopicElement[] = [];
  subtopics: TopicElement[] = [];
  topicSuggestions: TopicElement[] = [];
  maxVolumePercentage = 100;
  filtersChanged = false;

  displayedTopicColumns: string[] = ['topic', 'trend'];
  dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
  selectionTopic = new SelectionModel<TopicElement>(false, []);

  displayedSubtopicColumns: string[] = ['subtopic'];
  dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
  selectionSubtopic = new SelectionModel<TopicElement>(false, []);

  displayedTopicSuggestionColumns: string[] = ['suggestion'];
  dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);

  constructor(
    protected smaInputService: SocialMediaAnalysisInputService,
    private socialMediaAnalysisService: SocialMediaAnalysisDataService
  ) {
  }

  ngOnInit(): void {
    this.smaInputService.currentlySocialMediaAnalysisInput.subscribe((value) => {
      this.filtersChanged = true;
      this.selectedRegionCode = value.selectedRegionCode;
      this.selectedRegionName = value.selectedRegionName;
      this.selectedLanguages = value.selectedLanguages;

      this.retrieveTopicsData();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.smaInputService.resetData();
  }

  public retrieveTopicsData(): void {
    if (!this.filtersChanged || !this.topicsData?.length) {
      return;
    }
    this.showLoadingTopics();
    // reset topic selection
    this.selectedTopic = undefined;
    // reset subtopics
    this.subtopics = [];
    this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
    // reset subtopic selection
    this.selectedSubtopic = undefined;
    // reset topic suggestions
    this.topicSuggestions = [];
    this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);

    if (this.topicsData[0].data.length > 0) {
      const responseData = this.topicsData[0].data[0];
      const yesterdayResponseData = this.topicsData[1].data[0];
      const totalPostsCount = responseData.total;
      const topicsData = _.orderBy(responseData.split, 'total', 'desc').slice(0, this.maxNoOfTopics);

      this.topics = [];
      for (const topicData of topicsData) {
        const topic = this.topicsData[0].metadata.topics.find(t => t._id === topicData.split_value);
        const yesterdayTopicData = yesterdayResponseData?.split.find(t => t.split_value === topicData.split_value);

        const topicElem: TopicElement = {
          id: topicData.split_value,
          name: topic.name,
          volume: Math.round(topicData.total / totalPostsCount * 100),
          upwardsTrend: (yesterdayTopicData?.total ?? 0) < topicData.total
        };

        this.topics.push(topicElem);
      }

      this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
      this.maxVolumePercentage = this.topics[0].volume;
    } else {
      this.topics = [];
      this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
      this.maxVolumePercentage = 0;
    }

    this.hideLoadingTopics();
  }

  public retrieveSubtopicsData(): void {
    this.showLoadingSubtopics();
    // reset subtopic selection
    this.selectedSubtopic = undefined;
    // reset topic suggestions
    this.topicSuggestions = [];
    this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Suggestion,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.endDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Topic
      )
      .subscribe(results => {
        if (results.data.length > 0) {
          const responseData = results.data[0];
          const topicsData = _.orderBy(responseData.split, 'total', 'desc'); // .slice(0, this.maxNoOfTopics);

          this.subtopics = [];
          for (const topicData of topicsData) {
            const topic = results.metadata.topics.find(t => t._id === topicData.split_value);
            if (topic && topic.parent_topicId === this.selectedTopic.id) {
              const subtopicElem: TopicElement = {
                id: topicData.split_value,
                name: topic.name
              };

              this.subtopics.push(subtopicElem);
            }
          }

          this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
        } else {
          this.subtopics = [];
          this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
        }

        this.hideLoadingSubtopics();
      });
  }

  public retrieveTopicSuggestionsData(): void {
    this.showLoadingTopicSuggestions();
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Suggestion,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        this.selectedSubtopic.id,
        this.endDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Suggestion
      )
      .subscribe(results => {
        if (results.data.length > 0) {
          const responseData = results.data[0];
          const suggestionsData = _.orderBy(responseData.split, 'total', 'desc'); // .slice(0, this.maxNoOfTopics);

          this.topicSuggestions = [];
          for (const suggestion of suggestionsData) {
            const topicSuggestionElem: TopicElement = {
              id: suggestion.split_value,
              name: suggestion.split_value
            };

            this.topicSuggestions.push(topicSuggestionElem);
          }

          this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
        } else {
          this.topicSuggestions = [];
          this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
        }

        this.hideLoadingTopicSuggestions();
      });
  }

  selectTopicRow(row) {
    if (this.selectionTopic.isSelected(row)) {
      return;
    }
    this.selectionTopic.toggle(row);

    // change selected topic
    this.selectedTopic = { id: row.id, name: row.name };
    this.retrieveSubtopicsData();
  }

  selectSubtopicRow(row) {
    if (this.selectionSubtopic.isSelected(row)) {
      return;
    }
    this.selectionSubtopic.toggle(row);

    // change selected subtopic
    this.selectedSubtopic = { id: row.id, name: row.name };
    this.retrieveTopicSuggestionsData();
  }

  showLoadingTopics(): void {
    this.displayTopics = false;
  }

  hideLoadingTopics(): void {
    this.displayTopics = true;
  }

  isLoadingTopics(): boolean {
    return !this.displayTopics;
  }

  isLoadedTopics(): boolean {
    return this.displayTopics;
  }

  showLoadingSubtopics(): void {
    this.displaySubtopics = false;
  }

  hideLoadingSubtopics(): void {
    this.displaySubtopics = true;
  }

  isLoadingSubtopics(): boolean {
    return !this.displaySubtopics;
  }

  isLoadedSubtopics(): boolean {
    return this.displaySubtopics;
  }

  showLoadingTopicSuggestions(): void {
    this.displayTopicSuggestions = false;
  }

  hideLoadingTopicSuggestions(): void {
    this.displayTopicSuggestions = true;
  }

  isLoadingTopicSuggestions(): boolean {
    return !this.displayTopicSuggestions;
  }

  isLoadedTopicSuggestions(): boolean {
    return this.displayTopicSuggestions;
  }
}
