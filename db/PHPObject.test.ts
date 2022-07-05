import { PHPObject } from './PHPObject';

test('PHPArray can serialize an empty array', () => {
  const php = new PHPObject();
  const serialized = php.serialize();
  expect(serialized).toEqual('a:0:{}');
});

test('PHPArray can serialize an array with one number', () => {
  const php = new PHPObject();
  php.push(33027);
  const serialized = php.serialize();
  expect(serialized).toEqual('a:1:{i:0;i:33027;}');
});

test('PHPArray can serialize an array with two numbers', () => {
  const php = new PHPObject();
  php.push(...[33027, 5333]);
  const serialized = php.serialize();
  expect(serialized).toEqual('a:2:{i:0;i:33027;i:1;i:5333;}');
});

test('PHPArray can deserialize an empty array', () => {
  const php = PHPObject.deserialize('a:0:{}');
  expect(php).toHaveLength(0);
});

test('PHPArray can deserialize an array with one number', () => {
  const php = PHPObject.deserialize('a:1:{i:0;i:33027;}');
  expect(php).toHaveLength(1);
  expect(php[0]).toStrictEqual(33027);
});

test('PHPArray can deserialize an array with two numbers', () => {
  const php = PHPObject.deserialize('a:2:{i:0;i:33027;i:1;i:5333;}');
  expect(php).toHaveLength(2);
  expect(php[0]).toStrictEqual(33027);
  expect(php[1]).toStrictEqual(5333);
});

test('PHPArray can serialize and deserialize an array with many numbers', () => {
  const data = new Array(1000).fill(0).map(() => Math.floor(Math.random() * 1000));
  const php = new PHPObject();
  php.push(...data);
  const serialized = php.serialize();
  const result = PHPObject.deserialize(serialized);

  expect(result).toHaveLength(data.length);
  for (let i = 0; i < data.length; i++) {
    expect(result[i]).toStrictEqual(data[i]);
  }
});

test('PHPArray fails to deserialize arrays that have had elements removed without being reindexed', () => {
  expect(async () =>
    PHPObject.deserialize(
      'a:15:{i:0;i:36904;i:1;i:36906;i:2;i:36005;i:3;i:36003;i:4;i:33684;i:5;i:33674;i:6;i:33145;i:7;i:32846;i:8;i:30861;i:10;i:30862;i:11;i:30865;i:12;i:28125;i:13;i:28917;i:14;i:23023;i:15;i:16564;}'
    )
  ).rejects.toThrow();
});

test('PHPArray can optionally deserialize arrays that have had elements removed without being reindexed', () => {
  // It is impossible to know which element has been removed; instead, we just assume it was the last element.
  const php = PHPObject.deserialize(
    'a:15:{i:0;i:36904;i:1;i:36906;i:2;i:36005;i:3;i:36003;i:4;i:33684;i:5;i:33674;i:6;i:33145;i:7;i:32846;i:8;i:30861;i:10;i:30862;i:11;i:30865;i:12;i:28125;i:13;i:28917;i:14;i:23023;i:15;i:16564;}',
    { allowDirtyArrays: true }
  );

  // The result should not have lost any data.
  expect(php).toHaveLength(16);
});
