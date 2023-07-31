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
import { Component, Input } from '@angular/core';
import { ISource, SourceType } from '../../../core/models/i-source';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Constants } from '../../../core/models/constants';

@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html'
})
export class SourcesComponent {
  // data
  @Input() sourceType: SourceType;
  @Input() sources: ISource[];
  @Input() lastUpdate: Moment;

  // dates
  longCurrentDatetime: string = moment().format(Constants.DEFAULT_LONG_DATE_DISPLAY_FORMAT);
  shortCurrentDatetime: string = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

  // constants
  moment = moment;
  SourceType = SourceType;
}
