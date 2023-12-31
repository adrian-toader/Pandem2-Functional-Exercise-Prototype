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
import { ElementBase } from './element-base';
import { AfterViewInit, Directive, EventEmitter, Host, Inject, Optional, Output, SkipSelf, ViewChild } from '@angular/core';
import { ControlContainer, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgForm, NgModel } from '@angular/forms';
import { ValueAccessorBase } from './value-accessor-base';
import * as _ from 'lodash';

/**
 * Base class to be extended by custom form controls to handle groups of atomic form components
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class GroupValidator<T> extends ElementBase<T> implements AfterViewInit {
  // Group Form
  @ViewChild('groupForm') groupForm: NgForm;

  // handler for when one of the group value has changed
  @Output() groupValidated = new EventEmitter<void>();

  /**
     * Constructor
     */
  protected constructor(
  @Optional() @Host() @SkipSelf() controlContainer: ControlContainer,
    @Optional() @Inject(NG_VALIDATORS) validators: Array<any>,
    @Optional() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<any>
  ) {
    super(controlContainer, validators, asyncValidators);
  }

  /**
     * Check if any of the group children is invalid
     */
  public validateGroup() {
    // check if we have invalid children
    if (this.control) {
      if (
        this.groupForm &&
                this.groupForm.controls
      ) {
        // clear errors
        let valid: boolean = true;
        for (const name in this.groupForm.controls) {
          // right now we don't need to keep children errors since we won't display group errors anywhere
          // since we don't need all children errors we can stop
          if (this.groupForm.controls[name].invalid) {
            // invalid
            valid = false;

            // we can stop since we don't need all errors
            break;
          }
        }

        // so at this point we would add a dummy error & there is no point in continuing to check the rest of the children
        if (valid) {
          this.control.setErrors(null);
        } else {
          this.control.setErrors({ groupInvalid: true });
        }
      } else {
        this.control.setErrors(null);
      }
    }

    // group validate
    this.groupValidated.emit();
  }

  /**
     * Initialize Group
     */
  ngAfterViewInit() {
    // initialize parent
    super.ngAfterViewInit();

    // wait for the Form object to be initialized with form controls,
    // then get the current form control object
    setTimeout(() => {
      // validate group
      this.validateGroup();
    });
  }

  /**
     * Override touch function
     */
  public touch() {
    // touch children
    if (this.controlContainer) {
      const formDirectives = _.get(this.controlContainer, '_directives', []);
      _.forEach(formDirectives, (ngModel: NgModel) => {
        const groupFormDirectives = _.get(ngModel, 'valueAccessor.groupForm._directives', []);
        _.forEach(groupFormDirectives, (groupModel: NgModel) => {
          if (groupModel.valueAccessor) {
            if (groupModel.valueAccessor instanceof ValueAccessorBase) {
              groupModel.valueAccessor.touch();
            }
          }
        });
      });
    }

    // mark group as touched
    if (this.control) {
      this.control.markAsTouched();
    }
  }

  /**
     * Override validate functions
     */
  protected validate(touch: boolean = false) {
    // validate group
    this.validateGroup();

    // call parent
    super.validate();

    // touch list
    if (touch) {
      this.touch();
    }
  }
}
