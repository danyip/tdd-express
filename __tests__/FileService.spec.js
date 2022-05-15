const FileService = require('../src/file/FileService');
const FileAttachment = require('../src/file/FileAttachment');
const Hoax = require('../src/hoax/Hoax');
const User = require('../src/user/User');
const fs = require('fs');
const path = require('path');
const config = require('config');

const { uploadDir, profileDir, attachmentDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const attachementFolder = path.join('.', uploadDir, attachmentDir);

describe('createFolders', () => {
  it('creates upload folder', () => {
    FileService.createFolders();
    expect(fs.existsSync(uploadDir)).toBe(true);
  });
  it('creates profile folder under upload folder', () => {
    FileService.createFolders();
    expect(fs.existsSync(profileFolder)).toBe(true);
  });
  it('creates attachemnts folder under upload folder', () => {
    FileService.createFolders();
    expect(fs.existsSync(attachementFolder)).toBe(true);
  });
});
describe.skip('Scheduled unused file clean up', () => {
  const filename = 'test-file' + Date.now();
  const testFile = path.join('.', '__tests__', 'resources', 'test-png.png');
  const targetPath = path.join(attachementFolder, filename);

  beforeEach(async () => {
    await FileAttachment.destroy({ truncate: true });
    await User.destroy({ truncate: { cascade: true } });
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  });

  const addHoax = async () => {
    const user = await User.create({
      username: `user1`,
      email: `user1@mail.com`,
    });
    const hoax = await Hoax.create({
      content: `hoax content 1`,
      timestamp: Date.now(),
      userId: user.id,
    });
    return hoax.id;
  };

  it('removes 24hr old files with attachment entry if not used in a hoax', async () => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - 24 * 60 * 60 * 1000 - 1);
    const attachment = await FileAttachment.create({
      filename: filename,
      uploadDate: uploadDate,
    });
    FileService.removeUnusedAttachments();
    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 5000);
    jest.useRealTimers();

    setTimeout(async () => {
      const attachmentAfterRemove = await FileAttachment.findOne({ where: { id: attachment.id } });
      expect(attachmentAfterRemove).toBeNull();
      expect(fs.existsSync(targetPath)).toBe(false);
    }, 1000);
  });
  it('keeps files younger then 24hrs and their database entry even if not connected with a hoax', async () => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - 23 * 60 * 60 * 1000);
    const attachment = await FileAttachment.create({
      filename: filename,
      uploadDate: uploadDate,
    });
    FileService.removeUnusedAttachments();
    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 5000);
    jest.useRealTimers();

    setTimeout(async () => {
      const attachmentAfterRemove = await FileAttachment.findOne({ where: { id: attachment.id } });
      expect(attachmentAfterRemove).toBeTruthy();
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });
  it('keeps files older then 24hrs and their database entry even if associated with a hoax', async () => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const id = await addHoax();
    const uploadDate = new Date(Date.now() - 23 * 60 * 60 * 1000);
    const attachment = await FileAttachment.create({
      filename: filename,
      uploadDate: uploadDate,
      hoaxId: id,
    });
    console.log(attachment);
    FileService.removeUnusedAttachments();
    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 5000);
    jest.useRealTimers();
    setTimeout(async () => {
      const attachmentAfterRemove = await FileAttachment.findOne({ where: { id: attachment.id } });
      expect(attachmentAfterRemove).toBeTruthy();
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });
});
