enum DoctrineArrayParseState {
  None,
  ExpectingType,
  ExpectingSeparator,
  ExpectingArrayLengthOrSeparator,
  ExpectingArrayLength,
  ExpectingArrayStart,
  ExpectingArrayEnd,
  ExpectingArrayIndexOrSeparator,
  ExpectingArrayIndex,
  ExpectingArrayIntOrSeparator,
  ExpectingArrayInt,
}

export interface PHPDeserializationOptions {
  /**
   * Whether or not to fail when attempting to deserialize an array that
   * has not been reindexed after modification. Defaults to `false`.
   *
   * References:
   * https://www.php.net/manual/en/language.types.array.php#language.types.array.useful-funcs
   */
  allowDirtyArrays?: boolean;
}

type GetOption<
  T extends PHPDeserializationOptions = PHPDeserializationOptions,
  K extends keyof T = keyof T
> = (k: K) => NonNullable<T[K]>;

const defaultOptions: Required<PHPDeserializationOptions> = {
  allowDirtyArrays: false,
};

class ArrayWithEnd<T> extends Array<T> {
  public end() {
    return this[this.length - 1];
  }
}

export class PHPObject extends ArrayWithEnd<any> {
  public constructor(..._errorProne: never) {
    super();
  }

  public serialize(): string {
    const fragments = [`a:${this.length}:{`];
    for (let i = 0; i < this.length; i++) {
      if (typeof this[i] === 'number') {
        fragments.push(`i:${i};i:${this[i]};`);
      } else {
        throw new Error('Unknown array element type.');
      }
    }
    fragments.push('}');
    return fragments.join('');
  }

  public static deserialize(data: string, options?: PHPDeserializationOptions): PHPObject {
    const getOption: GetOption = (k) => {
      return (options && options[k]) ?? defaultOptions[k];
    };

    // Preconditions
    if (data.length === 0) {
      throw new Error('Input string was empty.');
    }

    if (data[0] !== 'a') {
      throw new Error('Input string was not a Doctrine array.');
    }

    // Create state
    let containers = new ArrayWithEnd<ArrayWithEnd<any>>();
    let lengths = new ArrayWithEnd<number>();
    let indices = new ArrayWithEnd<number>();

    let ptr = 0;
    let digits = new ArrayWithEnd<string>();
    const states = [DoctrineArrayParseState.ExpectingType];

    // Iterate over data
    while (ptr < data.length) {
      const state = states.pop();
      switch (state) {
        case DoctrineArrayParseState.ExpectingType:
          const nextType = data[ptr];
          if (nextType !== 'a' && nextType !== 'i') {
            throw new Error(`Expected valid Doctrine type specifier; got ${nextType}.`);
          }

          if (nextType === 'a') {
            containers.push(new PHPObject());
            states.push(
              DoctrineArrayParseState.ExpectingArrayEnd,
              DoctrineArrayParseState.ExpectingArrayStart,
              DoctrineArrayParseState.ExpectingArrayLength
            );
          } else if (indices.length === containers.length) {
            states.push(DoctrineArrayParseState.ExpectingArrayInt);
          } else {
            states.push(DoctrineArrayParseState.ExpectingArrayIndex);
          }

          states.push(DoctrineArrayParseState.ExpectingSeparator);
          break;
        case DoctrineArrayParseState.ExpectingSeparator:
          if (data[ptr] !== ':') {
            throw new Error(`Expected separator; got ${data[ptr]}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayLengthOrSeparator:
          const nextData1 = data[ptr];
          if (isInt(nextData1)) {
            digits.push(nextData1);
            states.push(DoctrineArrayParseState.ExpectingArrayLengthOrSeparator);
          } else if (nextData1 === ':') {
            lengths.push(parseDigits(digits));
            digits = new ArrayWithEnd();
          } else {
            throw new Error(`Expected length or separator; got ${nextData1}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayLength:
          const nextData2 = data[ptr];
          if (isInt(nextData2)) {
            digits.push(nextData2);
            states.push(DoctrineArrayParseState.ExpectingArrayLengthOrSeparator);
          } else {
            throw new Error(`Expected length; got ${nextData2}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayStart:
          if (data[ptr] !== '{') {
            throw new Error(`Expected array start; got ${data[ptr]}.`);
          }
          for (let el = 0; el < lengths.end(); el++) {
            states.push(DoctrineArrayParseState.ExpectingType);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayEnd:
          if (data[ptr] !== '}') {
            throw new Error(`Expected array end; got ${data[ptr]}.`);
          }
          if (!getOption('allowDirtyArrays') && containers.end().length !== lengths.end()) {
            throw new Error(`Expected ${lengths.end()} elements; got ${containers.end().length}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayIndexOrSeparator:
          const nextData3 = data[ptr];
          if (isInt(nextData3)) {
            digits.push(nextData3);
            states.push(DoctrineArrayParseState.ExpectingArrayIndexOrSeparator);
          } else if (nextData3 === ';') {
            indices.push(parseDigits(digits));
            digits = new ArrayWithEnd();
            states.push(DoctrineArrayParseState.ExpectingType);
          } else {
            throw new Error(`Expected index or separator; got ${nextData3}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayIndex:
          const nextData4 = data[ptr];
          if (isInt(nextData4)) {
            digits.push(nextData4);
            states.push(DoctrineArrayParseState.ExpectingArrayIndexOrSeparator);
          } else {
            throw new Error(`Expected index; got ${nextData4}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayIntOrSeparator:
          const nextData5 = data[ptr];
          if (isInt(nextData5)) {
            digits.push(nextData5);
            states.push(DoctrineArrayParseState.ExpectingArrayIntOrSeparator);
          } else if (nextData5 === ';') {
            const nextIdx = indices.pop()!;
            containers.end()[nextIdx] = parseDigits(digits);
            digits = new ArrayWithEnd();
          } else {
            throw new Error(`Expected integer or separator; got ${nextData5}.`);
          }
          break;
        case DoctrineArrayParseState.ExpectingArrayInt:
          const nextData6 = data[ptr];
          if (isInt(nextData6)) {
            digits.push(nextData6);
            states.push(DoctrineArrayParseState.ExpectingArrayIntOrSeparator);
          } else {
            throw new Error(`Expected integer; got ${nextData6}.`);
          }
          break;
      }

      ptr++;
    }

    return containers[0] as PHPObject;
  }

  public static fromArray(arr: any[]): PHPObject {
    const php = new PHPObject();
    php.push(...arr);
    return php;
  }
}

function isInt(x: string) {
  return !isNaN(parseInt(x));
}

function parseDigits(digits: string[]): number {
  return parseInt(digits.join(''));
}
