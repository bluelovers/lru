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

	cache: Map<KeyType, IElement<KeyType, ValueType>>;
	head: KeyType
	tail: KeyType
	_length: number
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

		this.cache = new Map<KeyType, IElement<KeyType, ValueType>>()
		this.head = this.tail = null
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
		for (const key of this.cache.keys())
		{
			yield key;
		}
	}

	* values()
	{
		for (const item of this.cache.values())
		{
			yield item.value;
		}
	}

	* [Symbol.iterator]()
	{
		for (const [key, value] of this.cache)
		{
			yield [key, value.value] as [KeyType, ValueType];
		}
	}

	clear()
	{
		this.cache = new Map<KeyType, IElement<KeyType, ValueType>>()
		this.head = this.tail = null
		this._length = 0
	}

	delete(key: KeyType)
	{
		const deleted = this.cache.has(key)
		this.remove(key)
		return deleted
	}

	remove(key: KeyType)
	{
		if (!this.cache.has(key)) return;

		const element = this.cache.get(key)
		this.cache.delete(key)
		this._unlink(key, element.prev, element.next)
		return element?.value
	}

	protected _unlink(key: KeyType, prev: KeyType, next: KeyType)
	{
		this._length--

		if (this._length === 0)
		{
			this.head = this.tail = null
		}
		else
		{
			if (this.head === key)
			{
				this.head = prev

				this.cache.get(this.head).next = null
			}
			else if (this.tail === key)
			{
				this.tail = next
				this.cache.get(this.tail).prev = null
			}
			else
			{
				this.cache.get(prev).next = next
				this.cache.get(next).prev = prev
			}
		}
	}

	peek(key: KeyType)
	{
		if (!this.cache.has(key)) return

		var element = this.cache.get(key)

		if (!this._checkAge(key, element)) return
		return element.value
	}

	set(key: KeyType, value: ValueType)
	{
		var element: IElement<KeyType, ValueType>

		if (this.cache.has(key))
		{
			element = this.cache.get(key)
			element.value = value
			if (this.maxAge) element.modified = Date.now()

			// If it's already the head, there's nothing more to do:
			if (key === this.head) return this
			this._unlink(key, element.prev, element.next)
		}
		else
		{
			element = { value: value, modified: 0, next: null, prev: null }
			if (this.maxAge) element.modified = Date.now()
			this.cache.set(key, element)

			// Eviction is only possible if the key didn't already exist:
			if (this._length === this.maxSize) this.evict()
		}

		this._length++
		element.next = null
		element.prev = this.head

		if (this.head) this.cache.get(this.head).next = key
		this.head = key

		if (!this.tail) this.tail = key

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
		if (!this.cache.has(key)) return

		var element = this.cache.get(key)

		if (!this._checkAge(key, element)) return

		if (this.head !== key)
		{
			if (key === this.tail)
			{
				this.tail = element.next
				this.cache.get(this.tail).prev = null
			}
			else
			{
				// Set prev.next -> element.next:
				this.cache.get(element.prev).next = element.next
			}

			// Set element.next.prev -> element.prev:
			this.cache.get(element.next).prev = element.prev

			// Element is the new head
			this.cache.get(this.head).next = key
			element.prev = this.head
			element.next = null
			this.head = key
		}

		return element.value
	}

	protected evict()
	{
		if (!this.tail) return
		let key = this.tail
		let value = this.remove(this.tail)
		this.emit('evict', { key: key, value: value })
	}

	has(key: KeyType)
	{
		return this.cache.has(key)
	}

	get length()
	{
		return this.size
	}

	get size()
	{
		return this.cache.size
	}

}

export default LRUV2
