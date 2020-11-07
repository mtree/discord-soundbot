import { Message } from 'discord.js';

import * as ignoreList from '~/util/db/IgnoreList';
import localize from '~/util/i18n/localize';

import Command from '../base/Command';
import userHasElevatedRole from '../util/userHasElevatedRole';

export class UnignoreCommand implements Command {
  public readonly TRIGGERS = ['unignore'];
  public readonly USAGE = 'Usage: !unignore <user>';

  public run(message: Message) {
    if (!message.member) return;

    const allowedToRunCommand = userHasElevatedRole(message.member);
    if (!allowedToRunCommand) return;

    const { users } = message.mentions;
    if (users.size < 1) {
      message.channel.send(this.USAGE);
      message.channel.send(localize.t('helpers.userFinder.error'));
      return;
    }

    users.forEach(user => {
      ignoreList.remove(user.id);
      message.channel.send(localize.t('commands.ignore.remove', { user: user.username }));
    });
  }
}