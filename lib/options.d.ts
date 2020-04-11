import { IOptions } from './types';
export declare function handleOptions<KeyType, ValueType>(options?: number | IOptions<KeyType, ValueType>): Required<IOptions<KeyType, ValueType>>;
export default handleOptions;
