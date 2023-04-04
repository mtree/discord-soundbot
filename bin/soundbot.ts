#!/usr/bin/env node

import Container from '~/util/Container';
import localize from '~/util/i18n/localize';

const { api, config, soundBot: bot } = Container;

localize.setLocale(config.language);
bot.start();
api.start();

console.info(localize.t('url', { clientId: config.clientId }));
