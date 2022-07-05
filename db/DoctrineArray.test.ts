import { DoctrineArray } from './DoctrineArray';

test('DoctrineArray can serialize an empty array', () => {
  const doctrine = new DoctrineArray();
  const serialized = doctrine.serialize();
  expect(serialized).toEqual('a:0:{}');
});

test('DoctrineArray can serialize an array with one number', () => {
  const doctrine = new DoctrineArray();
  doctrine.push(33027);
  const serialized = doctrine.serialize();
  expect(serialized).toEqual('a:1:{i:0;i:33027;}');
});

test('DoctrineArray can serialize an array with two numbers', () => {
  const doctrine = new DoctrineArray();
  doctrine.push(...[33027, 5333]);
  const serialized = doctrine.serialize();
  expect(serialized).toEqual('a:2:{i:0;i:33027;i:1;i:5333;}');
});

test('DoctrineArray can deserialize an empty array', () => {
  const doctrine = DoctrineArray.deserialize('a:0:{}');
  expect(doctrine).toHaveLength(0);
});

test('DoctrineArray can deserialize an array with one number', () => {
  const doctrine = DoctrineArray.deserialize('a:1:{i:0;i:33027;}');
  expect(doctrine).toHaveLength(1);
  expect(doctrine[0]).toStrictEqual(33027);
});

test('DoctrineArray can deserialize an array with two numbers', () => {
  const doctrine = DoctrineArray.deserialize('a:2:{i:0;i:33027;i:1;i:5333;}');
  expect(doctrine).toHaveLength(2);
  expect(doctrine[0]).toStrictEqual(33027);
  expect(doctrine[1]).toStrictEqual(5333);
});

test('DoctrineArray can serialize and deserialize an array with many numbers', () => {
  const data = new Array(1000).fill(0).map(() => Math.floor(Math.random() * 1000));
  const doctrine = new DoctrineArray();
  doctrine.push(...data);
  const serialized = doctrine.serialize();
  const result = DoctrineArray.deserialize(serialized);

  expect(result).toHaveLength(data.length);
  for (let i = 0; i < data.length; i++) {
    expect(result[i]).toStrictEqual(data[i]);
  }
});
