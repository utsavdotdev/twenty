import { Type } from '@sinclair/typebox';

import { ValidationInputType } from '../../validators/types';

import { BasePropertySchema, TPropertyValue } from './common';
import { PropertyType } from './property-type';

export const ObjectProperty = Type.Composite([
  BasePropertySchema,
  TPropertyValue(
    Type.Record(Type.String(), Type.Unknown()),
    PropertyType.OBJECT,
  ),
]);

export type ObjectProperty<R extends boolean> = BasePropertySchema &
  TPropertyValue<
    Record<string, unknown>,
    PropertyType.OBJECT,
    ValidationInputType.OBJECT,
    R
  >;
