import { Type } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsNumber,
  validateOrReject,
  Validate,
  IsInt,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  TriggerFilter,
  TriggerMapper,
  TriggerReducer,
  Comparison,
  UserAlertTrigger,
  UserAlert,
} from '../types/universalis/user';

@ValidatorConstraint({ name: 'isTriggerFilter', async: false })
export class IsTriggerFilter implements ValidatorConstraintInterface {
  validate(value: any) {
    const filterMaybe: TriggerFilter = value;
    switch (filterMaybe) {
      case 'hq':
        return true;
      default:
        // Ensure all cases have been handled
        (((x) => x) as (x: never) => never)(filterMaybe);
        return false;
    }
  }

  defaultMessage() {
    return '$property is not a valid trigger filter.';
  }
}

@ValidatorConstraint({ name: 'isTriggerMapper', async: false })
export class IsTriggerMapper implements ValidatorConstraintInterface {
  validate(value: any) {
    const mapperMaybe: TriggerMapper = value;
    switch (mapperMaybe) {
      case 'pricePerUnit':
        return true;
      default:
        // Ensure all cases have been handled
        (((x) => x) as (x: never) => never)(mapperMaybe);
        return false;
    }
  }

  defaultMessage() {
    return '$property is not a valid trigger mapper.';
  }
}

@ValidatorConstraint({ name: 'isTriggerReducer', async: false })
export class IsTriggerReducer implements ValidatorConstraintInterface {
  validate(value: any) {
    const reducerMaybe: TriggerReducer = value;
    switch (reducerMaybe) {
      case 'min':
      case 'max':
      case 'mean':
        return true;
      default:
        // Ensure all cases have been handled
        (((x) => x) as (x: never) => never)(reducerMaybe);
        return false;
    }
  }

  defaultMessage() {
    return '$property is not a valid trigger reducer.';
  }
}

class ComparisonTargetDTO {
  @IsNumber()
  target!: number;
}

async function booleanPromise(promise: Promise<any>): Promise<boolean> {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
}

function keyCount(o: any): number {
  return Object.keys(o).length;
}

@ValidatorConstraint({ name: 'isComparison', async: true })
export class IsComparison implements ValidatorConstraintInterface {
  validate(value: any) {
    const comparisonMaybe: Comparison = value;
    if ('lt' in comparisonMaybe) {
      const comparison = new ComparisonTargetDTO();
      comparison.target = comparisonMaybe.lt.target;
      return keyCount(comparisonMaybe.lt) === 1 && booleanPromise(validateOrReject(comparison));
    } else if ('gt' in comparisonMaybe) {
      const comparison = new ComparisonTargetDTO();
      comparison.target = comparisonMaybe.gt.target;
      return keyCount(comparisonMaybe.gt) === 1 && booleanPromise(validateOrReject(comparison));
    } else {
      // Ensure all cases have been handled
      (((x) => x) as (x: never) => never)(comparisonMaybe);
      return false;
    }
  }

  defaultMessage() {
    return '$property is not a valid comparison.';
  }
}

class AlertTriggerDTO implements UserAlertTrigger {
  @Validate(IsTriggerFilter, { each: true })
  filters!: TriggerFilter[];

  @Validate(IsTriggerMapper)
  mapper!: TriggerMapper;

  @Validate(IsTriggerReducer)
  reducer!: TriggerReducer;

  @Validate(IsComparison)
  comparison!: Comparison;
}

export class AlertDTO implements Omit<UserAlert, 'id' | 'userId'> {
  @IsInt()
  itemId!: number;

  @IsInt()
  worldId!: number;

  @MaxLength(200, { message: 'Discord webhook must be less than or equal to 200 characters.' })
  @IsUrl(undefined, { message: 'Discord webhook must be a URL.' })
  discordWebhook!: string;

  @IsInt()
  triggerVersion!: number;

  @Type(() => AlertTriggerDTO)
  @ValidateNested()
  trigger!: AlertTriggerDTO;
}
