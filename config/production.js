module.exports = {
  database: {
    database: 'hoaxify',
    username: 'my-db-user',
    password: 'db-p4ss',
    dialect: 'sqlite',
    storage: './prod-db.sqlite',
    logging: false,
  },
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'vlhf7l5b4teclhpo@ethereal.email',
      pass: 'yakKpWYnDyBqUJAXeh',
    },
  },
  uploadDir: 'uploads-production',
  profileDir: 'profile',
  attachmentDir: 'attachment',
};
