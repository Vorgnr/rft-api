const AWS = require('aws-sdk');
const config = require('../../config');
const { InternalServerError } = require('../static/errors');

AWS.config.update({ region: 'eu-west-2', ...config.mail[process.env.NODE_ENV] });
const frontApp = config.front[process.env.NODE_ENV].url;

const recoverPasswordTemplate = (player) => `<html><body>
  <p> ${player.name}, </p>
  <p>
    Vous avez demandé la réinitialisation de votre mot de passe.
  </p>
  <p>
    <a href="${frontApp}/password-recover/${player.password_recover_request}"> Lien de récupération </a>  
  </p>
  <p> L'equipe RFT. </p>
</body></html>`;

const mailFrom = 'RFT <no-reply@ranking-tekken.fr>';

const getTemplate = (key, arg) => {
  if (key === 'PASSWORD_RECOVER') {
    return {
      subject: 'Récupération de votre mot de passe',
      html: recoverPasswordTemplate(arg),
    };
  }

  throw new InternalServerError(`Unknow mail template ${key}`);
};

const send = (to, templateKey, arg) => {
  const { subject, html } = getTemplate(templateKey, arg);
  const params = {
    Destination: {
      ToAddresses: [
        to,
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: mailFrom,
  };

  return new AWS.SES({ apiVersion: '2010-12-01' })
    .sendEmail(params).promise();
};

module.exports = {
  send,
};
