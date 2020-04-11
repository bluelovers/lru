import LRU from '..';

declare module '..';
{
	interface LRU<KeyType, ValueType>
	{
		oldCache: Map<KeyType, ValueType>
	}

	class LRU<KeyType, ValueType>
	{
		public oldCache: Map<KeyType, ValueType>
	}
}

export default LRU
