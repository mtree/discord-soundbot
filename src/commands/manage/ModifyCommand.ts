import { Message } from 'discord.js';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import util from 'util';

import getSecondsFromTime from '~/util/getSecondsFromTime';
import localize from '~/util/i18n/localize';
import { existsSound, getExtensionForSound } from '~/util/SoundUtil';

import Command from '../base/Command';

const rename = util.promisify(fs.rename);

interface FileInfo {
  currentFile: string;
  newFile: string;
}

interface CommandParams {
  usage: string;
  parameters: { max: number; min: number };
}

const MODIFIER_OPTIONS: Dictionary<CommandParams> = {
  clip: {
    parameters: { max: 2, min: 1 },
    usage: 'Usage: !modify <sound> clip 14 18?'
  },
  volume: {
    parameters: { max: 1, min: 1 },
    usage: 'Usage: !modify <sound> volume 1'
  }
};

export class ModifyCommand extends Command {
  public readonly triggers = ['modify', 'change'];

  public async run(message: Message, params: string[]) {
    const [sound, modifier, ...commandParams] = params;
    if (!existsSound(sound)) return;

    const options = MODIFIER_OPTIONS[modifier];
    if (!options) {
      message.channel.send(localize.t('commands.modify.notFound', { modifier }));
      return;
    }

    if (
      commandParams.length < options.parameters.min ||
      commandParams.length > options.parameters.max
    ) {
      message.channel.send(options.usage);
      return;
    }

    const fileInfo = this.getFileNameFor(sound);

    try {
      await this.performModification(fileInfo, modifier, commandParams);
      await this.replace(fileInfo);
      message.channel.send(localize.t('commands.modify.success', { modifier, sound }));
    } catch {
      message.channel.send(localize.t('commands.modify.error', { modifier, sound }));
    }
  }

  // NOTE: We checked for param already before so we can ignore any related errors
  private async performModification(
    file: FileInfo,
    modifier: string,
    params: string[]
  ): Promise<void> {
    switch (modifier) {
      case 'volume':
        return this.modifyVolume(file, ...params);
      case 'clip':
        return this.clipSound(file, ...params);
      default:
        return Promise.reject();
    }
  }

  private modifyVolume({ currentFile, newFile }: FileInfo, ...params: string[]): Promise<void> {
    const [value] = params;
    const ffmpegCommand = ffmpeg(currentFile)
      .audioFilters([{ filter: 'volume', options: value }])
      .output(newFile);

    return new Promise((resolve, reject) =>
      ffmpegCommand.on('end', resolve).on('error', reject).run()
    );
  }

  private clipSound({ currentFile, newFile }: FileInfo, ...params: string[]): Promise<void> {
    const [startTime, endTime] = params;

    // NOTE: We checked params already, so start is definitely here
    const start = getSecondsFromTime(startTime)!;
    const end = getSecondsFromTime(endTime);

    let ffmpegCommand = ffmpeg(currentFile).output(newFile).setStartTime(start);
    if (end) ffmpegCommand = ffmpegCommand.setDuration(end - start);

    return new Promise((resolve, reject) =>
      ffmpegCommand.on('end', resolve).on('error', reject).run()
    );
  }

  private replace({ currentFile, newFile }: FileInfo) {
    return rename(currentFile, newFile);
  }

  private getFileNameFor(sound: string): FileInfo {
    const extension = getExtensionForSound(sound);
    const currentFile = `./sounds/${sound}.${extension}`;

    const timestamp = Date.now();
    const newFile = `./sounds/${sound}-${timestamp}.${extension}`;

    return { currentFile, newFile };
  }
}
