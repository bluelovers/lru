/// <reference types="node" />
import { EventEmitter } from 'events';
import { IOptions, ILRU_Interface } from '../types';
export interface IElement<KeyType, ValueType> {
    value: ValueType;
    prev: KeyType;
    next: KeyType;
    modified: number;
}
export interface LRUV2<KeyType, ValueType> extends ILRU_Interface<KeyType, ValueType> {
}
export declare class LRUV2<KeyType, ValueType> extends EventEmitter {
    protected _optiopts: IOptions<KeyType, ValueType>;
    cache: Map<KeyType, IElement<KeyType, ValueType>>;
    head: KeyType;
    tail: KeyType;
    _length: number;
    maxSize: number;
    maxAge: number;
    constructor(maxSizeOrOpts?: number | IOptions<KeyType, ValueType>);
    keys(): Generator<KeyType, void, unknown>;
    values(): Generator<ValueType, void, unknown>;
    [Symbol.iterator](): Generator<[KeyType, ValueType], void, unknown>;
    clear(): void;
    delete(key: KeyType): boolean;
    remove(key: KeyType): ValueType;
    protected _unlink(key: KeyType, prev: KeyType, next: KeyType): void;
    peek(key: KeyType): ValueType;
    set(key: KeyType, value: ValueType): this;
    protected _checkAge(key: KeyType, element: IElement<KeyType, ValueType>): boolean;
    get(key: KeyType): ValueType;
    protected evict(): void;
    has(key: KeyType): boolean;
    get length(): number;
    get size(): number;
}
export default LRUV2;
