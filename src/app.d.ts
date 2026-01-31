/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      context?: {
        waitUntil(promise: Promise<unknown>): void;
      };
    }
  }
}

export {};
