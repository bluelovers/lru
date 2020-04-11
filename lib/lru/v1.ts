/**
 * Created by user on 2020/4/11.
 */
import { Mixin, mix } from 'ts-mixer';
import QuickLRU from 'quick-lru';
import { EventEmitter } from 'events';
import { handleOptions } from '../options';
import { ILRUEvents, EnumLRUEvents, IEntry, IOptions, IEntryEvent, ILRU_Interface } from '../types';
import { inherits } from 'util';

export interface LRUV1<KeyType, ValueType> extends  QuickLRU<KeyType, ValueType>, ILRU_Interface<KeyType, ValueType>
{



}

export class LRUV1<KeyType, ValueType> extends QuickLRU<KeyType, ValueType>
{
	protected maxSize: number;
	protected cache: Map<KeyType, ValueType>;
	protected oldCache: Map<KeyType, ValueType>;
	protected _size: number;
	protected readonly onEviction?: IOptions<KeyType, ValueType>["onEviction"]

	constructor(maxSizeOrOpts?: number | IOptions<KeyType, ValueType>)
	{
		let {
			onEviction,
			...options
		} = handleOptions(maxSizeOrOpts);

		super({
			...options,
			onEviction: (key, value) =>
			{
				//console.dir(this)
				// @ts-ignore
				EventEmitter.prototype.emit.call(this, EnumLRUEvents.evict, {
					event: EnumLRUEvents.evict,
					key,
					value,
				})
			},
		} as Required<IOptions<KeyType, ValueType>>);

		// @ts-ignore
		EventEmitter.call(this);

		if (typeof onEviction !== 'undefined' && typeof onEviction !== null)
		{
			// @ts-ignore
			EventEmitter.prototype.on.call(this, EnumLRUEvents.evict, (entry => onEviction(entry.key, entry.value, EnumLRUEvents.evict)))
		}
	}

	remove(key: KeyType)
	{
		return this.delete(key)
	}

	get length()
	{
		return this.size
	}

	keysArray()
	{
		return [...this.keys()]
	}

	/*
	_set(newKey, newValue)
	{
		this.cache.set(newKey, newValue);
		this._size++;

		if (this._size > this.maxSize || (this.cache.size + this.oldCache.size) > this.maxSize)
		{
			this._size = 0;

			if (this.cache.size > this.maxSize)
			{
				let i = this.cache.size - this.maxSize;

				for (const [key, value] of this.cache.entries())
				{
					if (i > 0)
					{
						if (key !== newKey)
						{
							this.cache.delete(key);
							this.oldCache.delete(key);
							this.onEviction(key, value);
							i--;
						}
					}
					else
					{
						break;
					}
				}
			}

			let ls = new Map()

			if (typeof this.onEviction === 'function')
			{
				let i = this.maxSize - this.cache.size;

				if (i > 0)
				{
					i = this.oldCache.size - i;
				}
				else
				{
					i = this.oldCache.size
				}

				for (const [key, value] of this.oldCache.entries())
				{
					if (i > 0)
					{
						this.onEviction(key, value);
						i--;
					}
					else
					{
						ls.set(key, value)
					}
				}
			}

			this.oldCache = new Map([
				...ls.entries(),
				...this.cache.entries(),
			]);
			this.cache = new Map();
		}
	}

	set(key, value)
	{
		if (this.cache.size < this.maxSize && this.cache.has(key))
		{
			this.cache.set(key, value);
		}
		else
		{
			this._set(key, value);
		}

		return this;
	}

	get(key)
	{
		if (this.cache.has(key))
		{

			if (this.cache.size >= this.maxSize)
			{
				const value = this.cache.get(key);
				this.oldCache.delete(key);
				// @ts-ignore
				this._set(key, value);
				return value;
			}

			return this.cache.get(key);
		}

		if (this.cache.size < this.maxSize && this.oldCache.has(key))
		{
			const value = this.oldCache.get(key);
			this.oldCache.delete(key);
			// @ts-ignore
			this._set(key, value);
			return value;
		}
	}
	 */

}

Object.keys(EventEmitter.prototype)
	.forEach(prop =>
	{

		if (!(prop in LRUV1.prototype) && typeof EventEmitter.prototype[prop] === 'function')
		{
			LRUV1.prototype[prop] = EventEmitter.prototype[prop]
		}

	})
;

export default LRUV1
