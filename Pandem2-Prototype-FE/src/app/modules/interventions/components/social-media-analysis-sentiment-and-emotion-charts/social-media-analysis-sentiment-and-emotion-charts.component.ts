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
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Constants } from '../../../../core/models/constants';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories,
  SocialMediaAnalysisEmotionType,
  SocialMediaAnalysisEmotionTypes,
  SocialMediaAnalysisSentimentType,
  SocialMediaAnalysisSentimentTypes
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { ChartType } from '../../../../core/models/chart-type';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';

@Component({
  selector: 'app-social-media-analysis-sentiment-and-emotion-charts',
  templateUrl: './social-media-analysis-sentiment-and-emotion-charts.component.html',
  styleUrls: ['./social-media-analysis-sentiment-and-emotion-charts.component.less']
})
export class SocialMediaAnalysisSentimentAndEmotionChartsComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // constants
  SourceType = SourceType;

  showInfo = false;
  display;
  sentimentChartType = 'line';
  emotionChartType = 'line';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: 'All', value: 'all' },
    { name: '6 Months', value: '6m' },
    { name: '3 Months', value: '3m' },
    { name: '1 Month', value: '1m' }
  ];
  sentimentChartTypes = [
    {
      value: 'line',
      label: 'Line Chart'
    },
    {
      value: 'column',
      label: 'Stacked Bar Chart'
    }
  ];
  emotionChartTypes = [
    {
      value: 'line',
      label: 'Line Chart'
    },
    {
      value: 'column',
      label: 'Bar Chart'
    }
  ];
  yAxisExtra = {
    min: 0,
    max: 100,
    tickPositions: [0, 15, 30, 45, 60, 75, 90, 100],
    labels: {
      format: '{value}%'
    }
  };
  @Input() selectedRegionCode: string;
  @Input() selectedLanguages: string[];
  @Input() selectedSources: string[];
  @Input() startDate?: string;
  @Input() endDate: string;
  selectedTopic;
  public emotionColorScheme = Constants.SOCIAL_MEDIA_ANALYSIS_EMOTION_COLORS;
  public sentimentColorScheme = Constants.SOCIAL_MEDIA_ANALYSIS_SENTIMENT_COLORS;

  dailyChartSentiment: GraphDatasource;
  dailyChartEmotion: GraphDatasource;
  dailyChartVolume: GraphDatasource;
  dailySeriesSentiment: any[] = [];
  dailySeriesEmotion: any[] = [];
  dailySeriesVolume: any[] = [];

  sentimentSources: ISource[] = [];
  sentimentLastUpdate?: Moment;
  emotionSources: ISource[] = [];
  emotionLastUpdate?: Moment;
  volumeSources: ISource[] = [];
  volumeLastUpdate?: Moment;

  sentimentStartDate;
  emotionStartDate;
  volumeStartDate;

  retrieveSentiment: boolean = false;
  retrieveEmotion: boolean = false;
  retrieveVolume: boolean = false;
  retrieveAll: boolean = true;

  constructor(
    private smaInputService: SocialMediaAnalysisInputService,
    private socialMediaAnalysisService: SocialMediaAnalysisDataService,
    private metadataService: MetadataService
  ) {
  }

  ngOnInit(): void {
    this.sentimentStartDate = this.startDate;
    this.emotionStartDate = this.startDate;
    this.volumeStartDate = this.startDate;

    this.smaInputService.currentlySocialMediaAnalysisSelectedTopic.subscribe((value) => {
      this.selectedTopic = value;
      if (this.selectedTopic) {
        this.retrieveAll = true;
        this.retrieveData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.smaInputService.resetSelectedTopicData();
  }


  public retrieveData(): void {
    const observables = [];

    const sentimentData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Sentiment,
        this.selectedRegionCode,
        this.selectedLanguages,
        this.selectedTopic.id,
        this.sentimentStartDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Sentiment,
        undefined,
        undefined,
        this.selectedSources
      );

    const emotionData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Emotion,
        this.selectedRegionCode,
        this.selectedLanguages,
        this.selectedTopic.id,
        this.emotionStartDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Emotion,
        undefined,
        undefined,
        this.selectedSources
      );

    const volumeData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages,
        this.selectedTopic.id,
        this.volumeStartDate,
        this.endDate,
        undefined,
        undefined,
        undefined,
        this.selectedSources
      );
    const totalVolumeData =  this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages,
        undefined,
        this.volumeStartDate,
        this.endDate,
        undefined,
        undefined,
        undefined,
        this.selectedSources
      );

    if (this.retrieveSentiment) {
      observables.push(sentimentData);
    } else if (this.retrieveEmotion) {
      observables.push(emotionData);
    } else if (this.retrieveVolume) {
      observables.push(volumeData, totalVolumeData);
    } else {
      observables.push(sentimentData, emotionData, volumeData, totalVolumeData);
    }

    forkJoin(observables)
      .subscribe(results => {
        this.parseResultsSentiment(results);

        this.parseResultsEmotion(results);

        this.parseResultsVolume(results);

        this.retrieveSentiment = this.retrieveEmotion = this.retrieveVolume = this.retrieveAll = false;
      });
  }

  private parseResultsSentiment(results: any) {
    // prepare data if retrieveSentiment is true or all flags are false
    if (this.retrieveSentiment || this.retrieveAll) {
      const data = results[0].data;
      const metadata = results[0].metadata;

      // sentiment data
      const splitSentiment = new SplitData(data);
      this.dailyChartSentiment = splitSentiment.daily();
      this.prepareSentimentData();

      // sentiment sources
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.sentimentSources = mappedSources.sources;
      this.sentimentLastUpdate = mappedSources.lastUpdate;
    }
  }

  private parseResultsEmotion(results: any) {
    // prepare data if retrieveEmotion is true or all flags are false
    if (this.retrieveEmotion || this.retrieveAll) {
      const data = this.retrieveEmotion ? results[0].data : results[1].data;
      const metadata = this.retrieveEmotion ? results[0].metadata : results[1].metadata;

      // emotion data
      const splitEmotion = new SplitData(data);
      this.dailyChartEmotion = splitEmotion.daily();
      this.prepareEmotionData();

      // emotion sources
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.emotionSources = mappedSources.sources;
      this.emotionLastUpdate = mappedSources.lastUpdate;
    }
  }

  private parseResultsVolume(results: any) {
    // prepare data if retrieveVolume is true or all flags are false
    if (this.retrieveVolume || this.retrieveAll) {
      const data = this.retrieveVolume ? results[0].data : results[2].data;
      const metadata = this.retrieveVolume ? results[0].metadata : results[2].metadata;
      const totalVolumeData = this.retrieveVolume ? results[1].data : results[3].data;

      // volume data
      const splitVolume = new SplitData(data);
      this.dailyChartVolume = splitVolume.daily();
      this.prepareVolumeData();

      // volume sources
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.volumeSources = mappedSources.sources;
      this.volumeLastUpdate = mappedSources.lastUpdate;

      const percentageVolume = [];
      const totalVolume = [];
      for (const result of totalVolumeData) {
        totalVolume.push(result.total);
      }
      for (let i = 0; i < this.dailyChartVolume.total.yAxis[0].data.length; i++) {
        if (totalVolume[i] !== 0) {
          percentageVolume.push(this.dailyChartVolume.total.yAxis[0].data[i] / totalVolume[i] * 100);
        } else {
          percentageVolume.push(0);
        }
      }
      this.dailySeriesVolume[0].data = percentageVolume;
    }
  }

  public changeSentimentGraphType(): void {
    this.prepareSentimentData();
  }

  public changeEmotionGraphType(): void {
    this.prepareEmotionData();
  }

  private prepareSentimentData(): void {
    this.dailySeriesSentiment = [];
    let stacking: string;
    const sentimentTypes: Array<SocialMediaAnalysisSentimentType> = Object.values(SocialMediaAnalysisSentimentTypes);
    const dailyChartSentimentData = [];
    for (const type of sentimentTypes) {
      if (this.dailyChartSentiment?.split) {
        dailyChartSentimentData.push(this.dailyChartSentiment.split.find(item => item.name.toLowerCase() === type.toLowerCase()));
      }
    }
    if (this.sentimentChartType === 'column') {
      stacking = 'normal';
    } else {
      stacking = null;
    }
    for (const elementDailySentiment of dailyChartSentimentData) {
      if (elementDailySentiment?.name) {
        this.dailySeriesSentiment.push({
          type: 'spline',
          name: `7 day rolling average - ${ ChartDataUtils.formatLabel(elementDailySentiment.name) }`,
          pointStart: 6,
          pointInterval: 1,
          stacking: 'normal',
          color: this.sentimentColorScheme.find(
            (item) => item.value.toLowerCase() === elementDailySentiment.name.toLowerCase()
          ).trendColor,
          data: ChartDataUtils.compute7DayAverage(elementDailySentiment.data),
          visible: this.sentimentChartType !== ChartType.LINE
        });
        this.dailySeriesSentiment.push({
          type: this.sentimentChartType,
          name: ChartDataUtils.formatLabel(elementDailySentiment.name),
          data: elementDailySentiment.data,
          stacking: stacking,
          color: this.sentimentColorScheme.find(
            (item) => item.value.toLowerCase() === elementDailySentiment.name.toLowerCase()
          ).color,
          marker: {
            enabled: false
          }
        });
      }
    }
  }

  private prepareEmotionData(): void {
    this.dailySeriesEmotion = [];
    const emotionTypes: Array<SocialMediaAnalysisEmotionType> = Object.values(SocialMediaAnalysisEmotionTypes);
    const dailyChartEmotionData = [];
    for (const type of emotionTypes) {
      if (this.dailyChartEmotion?.split) {
        dailyChartEmotionData.push(this.dailyChartEmotion.split.find(item => item.name.toLowerCase() === type.toLowerCase()));
      }
    }
    for (const elementDailyEmotion of dailyChartEmotionData) {
      if (elementDailyEmotion?.name) {
        this.dailySeriesEmotion.push({
          type: this.emotionChartType,
          name: ChartDataUtils.formatLabel(elementDailyEmotion.name),
          data: elementDailyEmotion.data,
          color: this.emotionColorScheme.find(
            (item) => item.value.toLowerCase() === elementDailyEmotion.name.toLowerCase()
          ).color,
          marker: {
            enabled: false
          }
        });
        this.dailySeriesEmotion.push({
          type: 'spline',
          name: `7 day rolling average - ${ ChartDataUtils.formatLabel(elementDailyEmotion.name) }`,
          pointStart: 6,
          pointInterval: 1,
          color: this.emotionColorScheme.find(
            (item) => item.value.toLowerCase() === elementDailyEmotion.name.toLowerCase()
          ).trendColor,
          marker: {
            enabled: false
          },
          data: ChartDataUtils.compute7DayAverage(elementDailyEmotion.data),
          visible: this.emotionChartType !== ChartType.LINE
        });
      }
    }
  }

  private prepareVolumeData(): void {
    this.dailySeriesVolume = [
      {
        type: 'spline',
        name: 'Volume',
        data: this.dailyChartVolume.total.yAxis[0].data,
        color: '#6BAED6',
        marker: {
          enabled: false
        }
      }
    ];
  }

  changeTimeIntervalSentiment(value: { start_date: string, end_date?: string }): void {
    this.sentimentStartDate = value.start_date;
    this.retrieveSentiment = true;
    this.retrieveData();
  }

  changeTimeIntervalEmotion(value: { start_date: string, end_date?: string }): void {
    this.emotionStartDate = value.start_date;
    this.retrieveEmotion = true;
    this.retrieveData();
  }

  changeTimeIntervalVolume(value: { start_date: string, end_date?: string }): void {
    this.volumeStartDate = value.start_date;
    this.retrieveVolume = true;
    this.retrieveData();
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
