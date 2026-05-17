// Dogpamine — session expiry shared logic.
// Loaded as <script> in popup.html and via importScripts() in background.js.
// `self` resolves to window in popup, ServiceWorkerGlobalScope in SW.

(function (scope) {
  'use strict';

  const ONE_HOUR_MS = 60 * 60 * 1000;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

  // 한국 시간 다음 자정의 epoch ms 반환.
  // `now` 의 시스템 timezone 과 무관하게 KST 기준 자정으로 계산.
  function kstNextMidnightMs(now) {
    const kstNow = now + KST_OFFSET_MS;
    const kstNextMidnight = Math.floor(kstNow / ONE_DAY_MS + 1) * ONE_DAY_MS;
    return kstNextMidnight - KST_OFFSET_MS;
  }

  // 세션 모드에 따른 만료 epoch ms. `tab` 모드는 popup/SW 가 직접 만료 안 함 → null.
  function expiryMs(sessionMode, sessionStart, now) {
    now = now || Date.now();
    switch (sessionMode) {
      case 'today':   return kstNextMidnightMs(now);
      case 'oneHour': return (sessionStart || now) + ONE_HOUR_MS;
      case 'tab':     return null;
      default:        return null;
    }
  }

  function isExpired(sessionMode, sessionStart, now) {
    now = now || Date.now();
    const e = expiryMs(sessionMode, sessionStart, now);
    return e !== null && now >= e;
  }

  // alarm 등록용 delay (분 단위, Chrome alarms 최소 0.5 — 부족하면 즉시 0.5).
  function delayMinutesUntil(expiry, now) {
    now = now || Date.now();
    if (expiry === null || expiry <= now) return null;
    return Math.max(0.5, (expiry - now) / 60000);
  }

  scope.DogpamineSession = {
    kstNextMidnightMs,
    expiryMs,
    isExpired,
    delayMinutesUntil,
    ONE_HOUR_MS,
    ONE_DAY_MS,
  };
})(typeof self !== 'undefined' ? self : globalThis);
