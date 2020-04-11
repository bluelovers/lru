import { IOptions } from './types';

export function handleOptions<KeyType, ValueType>(options?: number | IOptions<KeyType, ValueType>)
{
	if (typeof options === 'number')
	{
		options = {
			maxSize: options,
		}
	}

	return {
		...options,
		maxSize: options?.maxSize ?? options?.max ?? 1000,
	} as Required<IOptions<KeyType, ValueType>>
}

export default handleOptions
