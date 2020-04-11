/**
 * Created by user on 2020/4/11.
 */

import LRU from '../lib/lru/v2';

test.skip('.get() - limit v2', () => {
	const lru = new  LRU({maxSize: 2});
	// @ts-ignore
	console.log(lru._size)
	lru.set('1', 1);
	// @ts-ignore
	console.log(lru._size)
	lru.set('2', 2);
	// @ts-ignore
	console.log(lru._size)
	console.dir([...lru.values()])
	// @ts-ignore
	console.log(lru._size)

	expect(lru.peek('1')).toEqual(1);
	expect(lru.peek('3')).not.toBeDefined();
	// @ts-ignore
	console.log(lru._size)
	console.log([...lru.values()])
	lru.set('3', 3);
	// @ts-ignore
	console.log(lru._size)
	console.log([...lru.values()])

	expect(lru.peek('1')).not.toBeDefined();
	expect(lru.peek('2')).toBeDefined();

	lru.get('1');
	lru.set('4', 4);
	// @ts-ignore
	console.log(lru._size)
	console.log([...lru.values()])
	expect(lru.get('3')).not.toBeDefined();
	lru.get('1');
	lru.set('5', 5);
	console.log([...lru.values()])
	expect(lru.has('4')).toBeTruthy();
});

