import QuickLRU from '../lib/debug';

const lruWithDuplicates = () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('key', 'value');
	lru.set('keyDupe', 1);
	lru.set('keyDupe', 2);
	return lru;
};

test.skip('main', () => {
	expect(() => {
		new QuickLRU(); // eslint-disable-line no-new
	}).toThrowError(/maxSize/);
});

test('.get() / .set()', () => {
	const lru = new QuickLRU({maxSize: 100});
	lru.set('foo', 1);
	lru.set('bar', 2);
	expect(lru.get('foo')).toBe(1);
	expect(lru.size).toBe(2);
});

test('.get() - limit', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	lru.set('2', 2);
	expect(lru.get('1')).toBe(1);
	expect(lru.get('3')).toBe(undefined);
	lru.set('3', 3);
	lru.get('1');
	lru.set('4', 4);
	lru.get('1');
	lru.set('5', 5);
	expect(lru.has('1')).toBe(true);
});

test('.set() - limit', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('foo', 1);
	lru.set('bar', 2);
	expect(lru.get('foo')).toBe(1);
	expect(lru.get('bar')).toBe(2);
	lru.set('baz', 3);
	lru.set('faz', 4);
	expect(lru.has('foo')).toBe(false);
	expect(lru.has('bar')).toBe(false);
	expect(lru.has('baz')).toBe(true);
	expect(lru.has('faz')).toBe(true);
	expect(lru.size).toBe(2);
});

test('.set() - update item', () => {
	const lru = new QuickLRU({maxSize: 100});
	lru.set('foo', 1);
	expect(lru.get('foo')).toBe(1);
	lru.set('foo', 2);
	expect(lru.get('foo')).toBe(2);
	expect(lru.size).toBe(1);
});

test('.has()', () => {
	const lru = new QuickLRU({maxSize: 100});
	lru.set('foo', 1);
	expect(lru.has('foo')).toBe(true);
});

test('.peek()', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	expect(lru.peek('1')).toBe(1);
	lru.set('2', 2);
	expect(lru.peek('1')).toBe(1);
	expect(lru.peek('3')).toBe(undefined);
	lru.set('3', 3);
	lru.set('4', 4);
	expect(lru.has('1')).toBe(false);
});

test('.delete()', () => {
	const lru = new QuickLRU({maxSize: 100});
	lru.set('foo', 1);
	lru.set('bar', 2);
	expect(lru.delete('foo')).toBe(true);
	expect(lru.has('foo')).toBe(false);
	expect(lru.has('bar')).toBe(true);
	expect(lru.delete('foo')).toBe(false);
	expect(lru.size).toBe(1);
});

test('.delete() - limit', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('foo', 1);
	lru.set('bar', 2);
	expect(lru.size).toBe(2);
	expect(lru.delete('foo')).toBe(true);
	expect(lru.has('foo')).toBe(false);
	expect(lru.has('bar')).toBe(true);
	lru.delete('bar');
	expect(lru.size).toBe(0);
});

test('.clear()', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('foo', 1);
	lru.set('bar', 2);
	lru.set('baz', 3);
	lru.clear();
	expect(lru.size).toBe(0);
});

test('.keys()', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	lru.set('2', 2);
	lru.set('3', 3);
	expect([...lru.keys()].sort()).toEqual(['1', '2', '3']);
});

test('.keys() - accounts for duplicates', () => {
	const lru = lruWithDuplicates();
	expect([...lru.keys()].sort()).toEqual(['key', 'keyDupe']);
});

test('.values()', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	lru.set('2', 2);
	lru.set('3', 3);
	expect([...lru.values()].sort()).toEqual([1, 2, 3]);
});

test('.values() - accounts for duplicates', () => {
	const lru = lruWithDuplicates();
	expect([...lru.values()].sort()).toEqual([2, 'value']);
});

test('.[Symbol.iterator]()', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	lru.set('2', 2);
	lru.set('3', 3);
	expect([...lru].sort()).toEqual([['1', 1], ['2', 2], ['3', 3]]);
});

test('.[Symbol.iterator]() - accounts for duplicates', () => {
	const lru = lruWithDuplicates();
	expect([...lru].sort()).toEqual([['key', 'value'], ['keyDupe', 2]]);
});

test('.size', () => {
	const lru = new QuickLRU({maxSize: 100});
	lru.set('1', 1);
	lru.set('2', 2);
	expect(lru.size).toBe(2);
	lru.delete('1');
	expect(lru.size).toBe(1);
	lru.set('3', 3);
	expect(lru.size).toBe(2);
});

test('.size - accounts for duplicates', () => {
	const lru = lruWithDuplicates();
	expect(lru.size).toBe(2);
});

test('max size', () => {
	const lru = new QuickLRU({maxSize: 3});
	lru.set('1', 1);
	lru.set('2', 2);
	lru.set('3', 3);
	lru.set('4', 4);
	expect(lru.size).toBe(3);
});

test.skip('checks total cache size does not exceed `maxSize`', () => {
	const lru = new QuickLRU({maxSize: 2});
	lru.set('1', 1);
	lru.set('2', 2);
	lru.get('1');
	// @ts-ignore
	expect(lru.oldCache.has('1')).toBe(false);
});

test('`onEviction` option method is called after `maxSize` is exceeded', () => {
	const expectKey = '1';
	const expectValue = 1;
	let isCalled = false;
	let actualKey;
	let actualValue;

	const onEviction = (key, value) => {
		actualKey = key;
		actualValue = value;
		isCalled = true;
	};

	const lru = new QuickLRU({maxSize: 1, onEviction});
	lru.set(expectKey, expectValue);
	lru.set('2', 2);
	expect(actualKey).toBe(expectKey);
	expect(actualValue).toBe(expectValue);
	expect(isCalled).toBe(true);
});
