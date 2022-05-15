const fs = require('fs');
const path = require('path');
const config = require('config');
const { randomString } = require('../shared/generator');
const FileType = require('file-type');
const FileAttachment = require('./FileAttachment');
const Sequelize = require('sequelize');

const { uploadDir, profileDir, attachmentDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }
  if (!fs.existsSync(attachmentFolder)) {
    fs.mkdirSync(attachmentFolder);
  }
};

const saveProfileImage = async (base64File) => {
  const filename = randomString(32);
  const filePath = path.join(profileFolder, filename);
  await fs.promises.writeFile(filePath, base64File, 'base64');
  return filename;
};

const deleteProfileImage = async (filename) => {
  const filePath = path.join(profileFolder, filename);
  await fs.promises.unlink(filePath);
};

const isLessThan2MB = (buffer) => {
  return buffer.length < 2 * 1024 * 1024;
};

const isSupportedFiletype = async (buffer) => {
  const type = await FileType.fromBuffer(buffer);
  return !type ? false : type.mime === 'image/png' || type.mime === 'image/jpeg';
};

const saveAttachment = async (file) => {
  const type = await FileType.fromBuffer(file.buffer);
  let fileType;
  let filename = randomString(32);
  if (type) {
    fileType = type.mime;
    filename += `.${type.ext}`;
  }
  await fs.promises.writeFile(path.join(attachmentFolder, filename), file.buffer);
  const savedAttacment = await FileAttachment.create({
    filename,
    uploadDate: new Date(),
    fileType: fileType,
  });
  return {
    id: savedAttacment.id,
  };
};

const associateFileToHoax = async (attachmentId, hoaxId) => {
  const attachment = await FileAttachment.findOne({ where: { id: attachmentId } });
  if (!attachment) {
    return;
  }
  if (attachment.hoaxId) {
    return;
  }
  attachment.hoaxId = hoaxId;
  await attachment.save();
};

const removeUnusedAttachments = () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    const oneDayOld = new Date(Date.now() - ONE_DAY);
    const attachments = await FileAttachment.findAll({
      where: {
        uploadDate: {
          [Sequelize.Op.lt]: oneDayOld,
        },
        hoaxId: {
          [Sequelize.Op.is]: null,
        },
      },
    });
    for (let attachment of attachments) {
      const { filename } = attachment.get({ plain: true });
      await fs.promises.unlink(path.join(attachmentFolder, filename));
      await attachment.destroy();
    }
  }, ONE_DAY);
};

module.exports = {
  createFolders,
  saveProfileImage,
  deleteProfileImage,
  isLessThan2MB,
  isSupportedFiletype,
  saveAttachment,
  associateFileToHoax,
  removeUnusedAttachments,
};
