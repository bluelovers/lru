//import LRU from '../';
import QuickLRU from 'quick-lru';
import LRU from '../lib/lru/v2';

it('clear() sets the cache to its initial state', () =>
{

	var lru = new LRU(2)

	var json1 = JSON.stringify(lru)

	lru.set('foo', 'bar')
	lru.clear()
	var json2 = JSON.stringify(lru)

	expect(json2).toEqual(json1)

});

it('setting keys doesn\'t grow past max size', () =>
{

	var lru = new LRU(3)
	expect(0).toEqual(lru.length)
	lru.set('foo1', 'bar1')
	expect(1).toEqual(lru.length)
	lru.set('foo2', 'bar2')
	expect(2).toEqual(lru.length)
	lru.set('foo3', 'bar3')
	expect(3).toEqual(lru.length)

	lru.set('foo4', 'bar4')
	expect(3).toEqual(lru.length)

});

it.skip('setting keys returns the value', () =>
{

	var lru = new LRU(2)
	expect('bar1').toEqual(lru.set('foo1', 'bar1'))
	expect('bar2').toEqual(lru.set('foo2', 'bar2'))
	expect('bar3').toEqual(lru.set('foo3', 'bar3'))
	expect('bar2').toEqual(lru.get('foo2'))
	expect(undefined).toEqual(lru.get('foo1'))
	expect('bar1').toEqual(lru.set('foo1', 'bar1'))

});

it('lru invariant is maintained for set()', () =>
{

	var lru = new LRU(2)

	lru.set('foo1', 'bar1')
	lru.set('foo2', 'bar2')

	console.log([...lru.values()])

	lru.set('foo3', 'bar3')
	console.log([...lru.values()])
	lru.set('foo4', 'bar4')

	console.log([...lru.values()])

	expect([...lru.keys()]).toEqual(['foo3', 'foo4'])

});

it('ovrewriting a key updates the value', () =>
{

	var lru = new LRU(2)
	lru.set('foo1', 'bar1')
	expect('bar1').toEqual(lru.get('foo1'))
	lru.set('foo1', 'bar2')
	expect('bar2').toEqual(lru.get('foo1'))

});

it('get() returns item value', () =>
{

	var lru = new LRU(2)

	expect(lru.set('foo', 'bar').get('foo')).toEqual('bar')

});

test('.get() - limit', () =>
{
	const lru = new QuickLRU({ maxSize: 2 });
	lru.set('1', 1);
	lru.set('2', 2);
	expect(lru.get('1')).toEqual(1);
	expect(lru.get('3')).not.toBeDefined();
	lru.set('3', 3);
	expect(lru.get('2')).not.toBeDefined();
	lru.get('1');
	lru.set('4', 4);
	expect(lru.get('3')).not.toBeDefined();
	lru.get('1');
	lru.set('5', 5);
	expect(lru.has('1')).toBeTruthy();
});

it('peek() returns item value without changing the order', () =>
{

	var lru = new LRU(2)
	lru.set('foo', 'bar')
	lru.set('bar', 'baz')
	// @ts-ignore
	expect(lru.maxSize).toEqual(2)
	expect(lru.length).toEqual(2)
	expect(lru.peek('foo')).toEqual('bar')

	console.log(1, lru.get('foo'))
	console.log(2, lru.get('bar'))

	lru.set('baz', 'foo')

	console.log(3, lru.get('foo'))
	console.log(4, lru.get('bar'))

	lru.set('baz1', 'foo')

	expect(lru.get('foo')).not.toBeDefined()

});

describe('peek respects max age', async () =>
{
	var lru = new LRU({ maxAge: 5 })

	it('the entry is removed if age > max_age', async function ()
	{
		lru.set('foo', 'bar')
		expect(lru.get('foo')).toEqual('bar')

		await delay(100)

		expect(lru.peek('foo')).not.toBeDefined()

	})

});

describe('lru invariant is maintained', () =>
{

	it('for get()', () =>
	{

		var lru = new LRU(2)

		lru.set('foo1', 'bar1')
		lru.set('foo2', 'bar2')

		lru.get('foo1') // now foo2 should be deleted instead of foo1

		lru.set('foo3', 'bar3')

		expect([...lru.keys()]).toEqual(['foo1', 'foo3'])

	});

	it('after set(), get() and remove()', () =>
	{

		var lru = new LRU(2)
		lru.set('a', 1)
		lru.set('b', 2)
		expect(lru.get('a')).toEqual(1)
		lru.remove('a')
		lru.set('c', 1)
		lru.set('d', 1)
		expect([...lru.keys()]).toEqual(['c', 'd'])

	});

	it('in the corner case size == 1', () =>
	{

		var lru = new LRU(1)

		lru.set('foo1', 'bar1')
		lru.set('foo2', 'bar2')

		lru.get('foo2') // now foo2 should be deleted instead of foo1

		lru.set('foo3', 'bar3')

		expect([...lru.keys()]).toEqual(['foo3'])

	});

});

describe('evicting items', () =>
{

	it('by age', async () =>
	{
		var lru = new LRU({ maxAge: 5 })

		lru.set('foo', 'bar')
		expect(lru.get('foo')).toEqual('bar')

		await delay(100);

		expect(lru.get('foo')).not.toBeDefined()

	});

	it('by age (2)', async () =>
	{
		var lru = new LRU({ maxAge: 100000 })
		lru.set('foo', 'bar')
		expect(lru.get('foo')).toEqual('bar')

		await delay(100)

		expect(lru.get('foo')).toEqual('bar')
	});

});

describe('idempotent changes', () =>
{

	it('set() and remove() on empty LRU is idempotent', () =>
	{
		var lru = new LRU()
		var json1 = JSON.stringify(lru)

		lru.set('foo1', 'bar1')
		lru.remove('foo1')
		var json2 = JSON.stringify(lru)

		expect(json2).toEqual(json1)
	});

	it('2 set()s and 2 remove()s on empty LRU is idempotent', () =>
	{
		var lru = new LRU()
		var json1 = JSON.stringify(lru)

		lru.set('foo1', 'bar1')
		lru.set('foo2', 'bar2')
		lru.remove('foo1')
		lru.remove('foo2')
		var json2 = JSON.stringify(lru)

		expect(json2).toEqual(json1)
	});

	it('2 set()s and 2 remove()s (in opposite order) on empty LRU is idempotent', () =>
	{
		var lru = new LRU()
		var json1 = JSON.stringify(lru)

		lru.set('foo1', 'bar1')
		lru.set('foo2', 'bar2')
		lru.remove('foo2')
		lru.remove('foo1')
		var json2 = JSON.stringify(lru)

		expect(json2).toEqual(json1)
	});

	it('after setting one key, get() is idempotent', () =>
	{
		var lru = new LRU(2)
		lru.set('a', 'a')
		var json1 = JSON.stringify(lru)

		lru.get('a')
		var json2 = JSON.stringify(lru)

		expect(json2).toEqual(json1)
	});

	it('after setting two keys, get() on last-set key is idempotent', () =>
	{
		var lru = new LRU(2)
		lru.set('a', 'a')
		lru.set('b', 'b')
		var json1 = JSON.stringify(lru)

		lru.get('b')
		var json2 = JSON.stringify(lru)

		expect(json2).toEqual(json1)
	});

});

describe('evict event', () =>
{

	it('\'evict\' event is fired when evicting old keys', () =>
	{
		var lru = new LRU(2)
		var events = []
		lru.on('evict', function (element) { events.push(element) })

		lru.set('foo1', 'bar1')
		lru.set('foo2', 'bar2')
		lru.set('foo3', 'bar3')
		lru.set('foo4', 'bar4')

		var expected = [{ key: 'foo1', value: 'bar1' }, { key: 'foo2', value: 'bar2' }]
		expect(events).toEqual(expected)
	});

});

function delay(timeout: number)
{
	return new Promise((resolve, reject) => setTimeout(resolve, timeout))
}
