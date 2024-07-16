import { Type } from '@sinclair/typebox';

import { ValidationInputType } from '../../validators/types';

import { BasePropertySchema, TPropertyValue } from './common';
import { PropertyType } from './property-type';

export const CheckboxProperty = Type.Composite([
  BasePropertySchema,
  TPropertyValue(Type.Boolean(), PropertyType.CHECKBOX),
]);

export type CheckboxProperty<R extends boolean> = BasePropertySchema &
  TPropertyValue<boolean, PropertyType.CHECKBOX, ValidationInputType.ANY, R>;
