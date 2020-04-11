import QuickLRU from 'quick-lru';
import { IOptions, ILRU_Interface } from '../types';
export interface LRUV1<KeyType, ValueType> extends QuickLRU<KeyType, ValueType>, ILRU_Interface<KeyType, ValueType> {
}
export declare class LRUV1<KeyType, ValueType> extends QuickLRU<KeyType, ValueType> {
    protected maxSize: number;
    protected cache: Map<KeyType, ValueType>;
    protected oldCache: Map<KeyType, ValueType>;
    protected _size: number;
    protected readonly onEviction?: IOptions<KeyType, ValueType>["onEviction"];
    constructor(maxSizeOrOpts?: number | IOptions<KeyType, ValueType>);
    remove(key: KeyType): boolean;
    get length(): number;
    keysArray(): KeyType[];
}
export default LRUV1;
