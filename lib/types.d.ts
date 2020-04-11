/// <reference types="node" />
import QuickLRU, { Options as IQuickLRUOptions } from 'quick-lru';
import EventEmitter = NodeJS.EventEmitter;
export interface IOptions<KeyType = unknown, ValueType = unknown> extends Partial<IQuickLRUOptions> {
    max?: number;
    maxAge?: number;
    /**
     * @deprecated
     */
    onEviction?: <K = KeyType, V = ValueType, T = any>(key: K, value: V, event?: ILRUEvents) => T | void;
}
export declare type IEntry<KeyType, ValueType> = {
    key: KeyType;
    value: ValueType;
};
export declare type IEntryEvent<KeyType, ValueType, EventType extends ILRUEvents> = IEntry<KeyType, ValueType> & {
    event: EventType;
};
export declare const enum EnumLRUEvents {
    evict = "evict"
}
export declare type ILRUEvents = EnumLRUEvents | string | symbol;
export declare type IFunction = (...args: any[]) => any;
export interface ILRU_Interface<KeyType, ValueType> extends EventEmitter, QuickLRU<KeyType, ValueType> {
    addListener(event: EnumLRUEvents.evict, listener: <T>(entry: IEntryEvent<KeyType, ValueType, EnumLRUEvents.evict>) => T): this;
    on(event: EnumLRUEvents.evict, listener: <T>(entry: IEntryEvent<KeyType, ValueType, EnumLRUEvents.evict>) => T): this;
    once(event: EnumLRUEvents.evict, listener: <T>(entry: IEntryEvent<KeyType, ValueType, EnumLRUEvents.evict>) => T): this;
    emit(event: EnumLRUEvents.evict, entry: IEntryEvent<KeyType, ValueType, EnumLRUEvents.evict>): boolean;
    addListener(event: ILRUEvents, listener: IFunction): this;
    on(event: ILRUEvents, listener: IFunction): this;
    once(event: ILRUEvents, listener: IFunction): this;
    emit(event: ILRUEvents, ...args: any[]): boolean;
    removeListener(event: ILRUEvents, listener: IFunction): this;
    off(event: ILRUEvents, listener: IFunction): this;
    eventNames(): ILRUEvents[];
}
