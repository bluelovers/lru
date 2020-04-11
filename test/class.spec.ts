/**
 * Created by user on 2020/4/11.
 */

import LRU from '../index';
import { EventEmitter } from "events";
import QuickLRU from 'quick-lru';

describe('inherits', () =>
{
	describe('EventEmitter', () =>
	{

		Object.getOwnPropertyNames(EventEmitter.prototype)
			.forEach(prop =>
			{

				if (typeof EventEmitter.prototype[prop] !== 'function')
				{
					return
				}

				it(prop, () =>
				{

					expect(LRU.prototype).toHaveProperty(prop)
					expect(typeof LRU.prototype[prop]).toStrictEqual(typeof EventEmitter.prototype[prop])

				});

			})
		;

	});

	describe('QuickLRU', () =>
	{

		Object.getOwnPropertyNames(QuickLRU.prototype)
			.forEach(prop =>
			{

				if (prop === 'size') return;

				it(prop, () =>
				{

					expect(LRU.prototype).toHaveProperty(prop)
					expect(typeof LRU.prototype[prop]).toStrictEqual(typeof QuickLRU.prototype[prop])

				});

			})
		;

	});

	describe('Instance', () =>
	{
		const lru = new LRU();

		([
			['size', 'number'],
			['length', 'number'],
		] as ([keyof LRU<any, any>, string])[])
			.forEach(([prop, type]) =>
			{
				it(prop, () =>
				{
					expect(lru).toHaveProperty(prop)
					expect(typeof lru[prop]).toStrictEqual(type)
				})
			})
		;

		it.skip('toMatchSnapshot', () => {
			expect(lru).toMatchSnapshot();
		})

	});

	it.skip('toMatchSnapshot', () => {
		expect(LRU).toMatchSnapshot();
		expect(LRU.prototype).toMatchSnapshot();
		expect(Object.getOwnPropertyNames(LRU.prototype)).toMatchSnapshot();
		expect(Object.getOwnPropertyNames(QuickLRU.prototype)).toMatchSnapshot();
		expect(Object.getOwnPropertyNames(EventEmitter.prototype)).toMatchSnapshot();
	})

});
