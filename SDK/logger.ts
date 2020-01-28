import { Category, CategoryLogger, CategoryServiceFactory, CategoryConfiguration, LogLevel } from "typescript-logging";

export class logger {
    static InitializeLogger(modulename: string) {
        CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Trace));
        return new Category(modulename);
    }
}
