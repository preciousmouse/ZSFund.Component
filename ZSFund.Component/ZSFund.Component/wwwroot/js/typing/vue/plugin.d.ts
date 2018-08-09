type PluginFunction<T> = (vue: typeof Vue, options?: T) => void;

interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}
