import { LoggerInstance } from 'winston';
export declare type Environment = 'production' | 'staging' | 'development' | 'local' | 'default';
export declare type Loglevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
export interface ILogSettings {
    level: Loglevel;
    useStackDriver: boolean;
    useConsole: boolean;
    keyFilename?: string;
    projectId?: string;
}
export interface ILogInfo {
    settings?: ILogSettings;
    prefix?: string;
    meta?: any | any[];
}
/**
 * Resets the winstonClient and settingsInUse - useful for tests
 */
export declare function clearLogSettings(): void;
export declare function getCurrentLogSettings(): ILogSettings | undefined;
/**
 * Verifies if the two objects of ILogSettings type are deeply equal
 * @param a First settings object
 * @param b Second settings object
 */
export declare function areSettingsEqual(a: ILogSettings | undefined, b: ILogSettings | undefined): boolean;
/**
 * Returns LogSettings filled with library defaults
 * @param logSettings Incoming settings that will take precedence
 */
export declare function getLogSettings(logSettings?: Partial<ILogSettings>): ILogSettings;
export declare function initLogger(logSettings?: Partial<ILogSettings>): LoggerInstance;
/**
 * Logs an error message. `logError` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export declare function logError(message: string | object, info?: ILogInfo): void;
/**
 * Logs a warning message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export declare function logWarn(message: string | object, info?: ILogInfo): void;
/**
 * Logs an info message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export declare function logInfo(message: string | object, info?: ILogInfo): void;
/**
 * Logs a verbose message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export declare function logVerbose(message: string | object, info?: ILogInfo): void;
/**
 * Logs a debug message. `logDebug` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export declare function logDebug(message: string | object, info?: ILogInfo): void;
