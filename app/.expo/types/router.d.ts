/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/home` | `/_sitemap` | `/home`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
