import { EventEmitter } from 'events';
import { IOptions, ILRU_Interface, EnumLRUEvents } from '../types';
import { handleOptions } from '../options';

export interface IElement<KeyType, ValueType>
{
	value: ValueType,
	prev: KeyType,
	next: KeyType,
	modified: number,
}

// @ts-ignore
export interface LRUV2<KeyType, ValueType> extends ILRU_Interface<KeyType, ValueType>
{

}

export class LRUV2<KeyType, ValueType> extends EventEmitter
{
	protected _optiopts: IOptions<KeyType, ValueType>

	protected _cache: Map<KeyType, IElement<KeyType, ValueType>>;
	protected _head: KeyType
	protected _tail: KeyType
	protected _length: number
	maxSize: number
	maxAge: number

	constructor(maxSizeOrOpts?: number | IOptions<KeyType, ValueType>)
	{
		let {
			onEviction,
			...options
		} = handleOptions(maxSizeOrOpts);

		super();

		this._optiopts = options;

		this._cache = new Map<KeyType, IElement<KeyType, ValueType>>()
		this._head = this._tail = null
		this._length = 0
		this.maxSize = options.maxSize ?? 1000
		this.maxAge = options.maxAge ?? 0

		if (typeof onEviction !== 'undefined' && typeof onEviction !== null)
		{
			this.on(EnumLRUEvents.evict, (entry => onEviction(entry.key, entry.value, EnumLRUEvents.evict)))
		}
	}

	* keys()
	{
		for (const key of this._cache.keys())
		{
			yield key;
		}
	}

	* values()
	{
		for (const item of this._cache.values())
		{
			yield item.value;
		}
	}

	* [Symbol.iterator]()
	{
		for (const [key, value] of this._cache)
		{
			yield [key, value.value] as [KeyType, ValueType];
		}
	}

	clear()
	{
		this._cache = new Map<KeyType, IElement<KeyType, ValueType>>()
		this._head = this._tail = null
		this._length = 0
	}

	delete(key: KeyType)
	{
		const deleted = this._cache.has(key)
		this.remove(key)
		return deleted
	}

	remove(key: KeyType)
	{
		if (!this._cache.has(key)) return;

		const element = this._cache.get(key)
		this._cache.delete(key)
		this._unlink(key, element.prev, element.next)
		return element?.value
	}

	protected _unlink(key: KeyType, prev: KeyType, next: KeyType)
	{
		this._length--

		if (this._length === 0)
		{
			this._head = this._tail = null
		}
		else
		{
			if (this._head === key)
			{
				this._head = prev

				this._cache.get(this._head).next = null
			}
			else if (this._tail === key)
			{
				this._tail = next
				this._cache.get(this._tail).prev = null
			}
			else
			{
				this._cache.get(prev).next = next
				this._cache.get(next).prev = prev
			}
		}
	}

	peek(key: KeyType)
	{
		if (!this._cache.has(key)) return

		var element = this._cache.get(key)

		if (!this._checkAge(key, element)) return
		return element.value
	}

	set(key: KeyType, value: ValueType)
	{
		var element: IElement<KeyType, ValueType>

		if (this._cache.has(key))
		{
			element = this._cache.get(key)
			element.value = value
			if (this.maxAge) element.modified = Date.now()

			// If it's already the head, there's nothing more to do:
			if (key === this._head) return this
			this._unlink(key, element.prev, element.next)
		}
		else
		{
			element = { value: value, modified: 0, next: null, prev: null }
			if (this.maxAge) element.modified = Date.now()
			this._cache.set(key, element)

			// Eviction is only possible if the key didn't already exist:
			if (this._length === this.maxSize) this.evict()
		}

		this._length++
		element.next = null
		element.prev = this._head

		if (this._head) this._cache.get(this._head).next = key
		this._head = key

		if (!this._tail) this._tail = key

		return this
	}

	protected _checkAge(key: KeyType, element: IElement<KeyType, ValueType>)
	{
		if (this.maxAge && (Date.now() - element.modified) > this.maxAge)
		{
			this.remove(key)
			this.emit(EnumLRUEvents.evict, { key: key, value: element.value })
			return false
		}
		return true
	}

	get(key: KeyType)
	{
		if (!this._cache.has(key)) return

		var element = this._cache.get(key)

		if (!this._checkAge(key, element)) return

		if (this._head !== key)
		{
			if (key === this._tail)
			{
				this._tail = element.next
				this._cache.get(this._tail).prev = null
			}
			else
			{
				// Set prev.next -> element.next:
				this._cache.get(element.prev).next = element.next
			}

			// Set element.next.prev -> element.prev:
			this._cache.get(element.next).prev = element.prev

			// Element is the new head
			this._cache.get(this._head).next = key
			element.prev = this._head
			element.next = null
			this._head = key
		}

		return element.value
	}

	protected evict()
	{
		if (!this._tail) return
		let key = this._tail
		let value = this.remove(this._tail)
		this.emit('evict', { key: key, value: value })
	}

	has(key: KeyType)
	{
		return this._cache.has(key)
	}

	get length()
	{
		return this.size
	}

	get size()
	{
		return this._cache.size
	}

}

export default LRUV2
