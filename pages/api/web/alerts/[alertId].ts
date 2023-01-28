import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { Body, createHandler, Put, Query, Req, Res, ValidationPipe } from 'next-api-decorators';
import {
  Comparison,
  TriggerFilter,
  TriggerMapper,
  TriggerReducer,
  UserAlert,
  UserAlertTrigger,
} from '../../../../types/universalis/user';
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
  IsUUID,
  IsString,
} from 'class-validator';

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

class UpdateAlertDTO implements Omit<UserAlert, 'id' | 'userId'> {
  @IsInt()
  itemId!: number;

  @IsInt()
  worldId!: number;

  @IsUrl()
  @MaxLength(200)
  discordWebhook!: string | null;

  @IsInt()
  triggerVersion!: number;

  @Type(() => AlertTriggerDTO)
  @ValidateNested()
  trigger!: AlertTriggerDTO;
}

class UpdateAlertQueryDTO {
  @IsString()
  alertId!: string;
}

class AlertsHandler {
  @Put()
  async updateAlert(
    @Body(ValidationPipe) body: UpdateAlertDTO,
    @Query(ValidationPipe) query: UpdateAlertQueryDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { alertId } = query;
    try {
      await Database.updateUserAlert({ id: alertId, userId: session.user.id, ...body });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json({
      message: 'Success',
    });
  }
}

export default createHandler(AlertsHandler);
