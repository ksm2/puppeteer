/**
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const utils = require('./utils');
const {waitEvent} = utils;

module.exports.addTests = function({testRunner, expect}) {
  const {describe, xdescribe, fdescribe} = testRunner;
  const {it, fit, xit} = testRunner;
  const {beforeAll, beforeEach, afterAll, afterEach} = testRunner;

  describe('Browser', function() {
    it('should report when a service worker is created and destroyed', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const createdServiceWorker = new Promise(fulfill => context.on('serviceworkercreated', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await createdServiceWorker).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      const destroyedServiceWorker = new Promise(fulfill => context.on('serviceworkerdestroyed', fulfill));
      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));

      expect(await destroyedServiceWorker).toBe(await createdServiceWorker);
    });
  });

  describe('ServiceWorker', function() {
    it('should report the sw.js request', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const createdServiceWorker = new Promise(fulfill => context.on('serviceworkercreated', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');
      const serviceWorker = await createdServiceWorker;

      const firstRequest = new Promise(fulfill => serviceWorker.once('request', fulfill));
      expect((await firstRequest).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('can be stopped', async({page, server}) => {
      await page.goto(server.EMPTY_PAGE);
      const activeServiceWorker = new Promise(fulfill => page.on('serviceworkeractive', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      const serviceWorker = await activeServiceWorker;
      expect(serviceWorker.isRunning()).toBe(true);
      await serviceWorker.stop();
      expect(serviceWorker.isRunning()).toBe(false);

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('should report when a service worker is installing', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const installing = new Promise(fulfill => page.on('serviceworkerinstalling', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await installing).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('should report when a service worker is waiting', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const waiting = new Promise(fulfill => page.on('serviceworkerwaiting', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await waiting).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('should report when a service worker is active', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const active = new Promise(fulfill => page.on('serviceworkeractive', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await active).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
  });

  describe('ServiceWorkerRegistration', function() {
    it('should report when a service worker registration is registered and unregistered', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const registered = new Promise(fulfill => page.on('serviceworkerregistered', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await registered).scope()).toBe(server.PREFIX + '/serviceworkers/empty/');
      expect((await registered).browserContext()).toBe(context);

      const unregistered = new Promise(fulfill => page.on('serviceworkerunregistered', fulfill));
      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
      expect(await unregistered).toBe(await registered);
    });
    it('can enforce to unregister', async({page, server, context}) => {
      await page.goto(server.EMPTY_PAGE);
      const registered = new Promise(fulfill => page.on('serviceworkerregistered', fulfill));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await registered).scope()).toBe(server.PREFIX + '/serviceworkers/empty/');
      expect((await registered).browserContext()).toBe(context);

      const unregistered = new Promise(fulfill => page.on('serviceworkerunregistered', fulfill));
      await (await registered).unregister();
      expect(await unregistered).toBe(await registered);
    });
    it('should report when a service worker is installing', async({page, server}) => {
      await page.goto(server.EMPTY_PAGE);
      const registered = new Promise(fulfill => page.on('serviceworkerregistered', fulfill));
      const installingServiceWorker = registered.then(registration => new Promise(fulfill => registration.once('installing', fulfill)));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await installingServiceWorker).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('should report when a service worker is waiting', async({page, server}) => {
      await page.goto(server.EMPTY_PAGE);
      const registered = new Promise(fulfill => page.on('serviceworkerregistered', fulfill));
      const waitingServiceWorker = registered.then(registration => new Promise(fulfill => registration.once('waiting', fulfill)));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await waitingServiceWorker).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
    it('should report when a service worker is active', async({page, server}) => {
      await page.goto(server.EMPTY_PAGE);
      const registered = new Promise(fulfill => page.on('serviceworkerregistered', fulfill));
      const activeServiceWorker = registered.then(registration => new Promise(fulfill => registration.once('active', fulfill)));

      await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');

      expect((await activeServiceWorker).url()).toBe(server.PREFIX + '/serviceworkers/empty/sw.js');

      await page.evaluate(() => window.registrationPromise.then(registration => registration.unregister()));
    });
  });
};
