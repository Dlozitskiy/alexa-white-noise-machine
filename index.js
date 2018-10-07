const alexa = require('ask-sdk');

const sounds =
{ [process.env.skill1_id]: process.env.skill1_file,
  [process.env.skill2_id]: process.env.skill2_file,
  [process.env.skill3_id]: process.env.skill3_file
};

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  async handle(handlerInput) {
    const {
      requestEnvelope,
      responseBuilder
    } = handlerInput;
    const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
    console.log(requestEnvelope.request);
    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        {
          break;
        }
      case 'PlaybackFinished':
        {
          break;
        }
      case 'PlaybackNearlyFinished':
        {
          const url = getToken(handlerInput);
          const playBehavior = 'ENQUEUE';
          const expectedPreviousToken = getToken(handlerInput);
          responseBuilder
            .addAudioPlayerPlayDirective(playBehavior,url,url,null,expectedPreviousToken);
          break;
        }
      case 'PlaybackFailed':
        console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
        return;
      default:
        throw new Error('Should never reach here!');
    }
    return responseBuilder.getResponse();
  },
};

const StartPlaybackHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return controller.play(handlerInput);
  },
};

const StopPlaybackHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    return controller.stop(handlerInput);
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const controller = {
  async play(handlerInput) {

    const {
      responseBuilder
    } = handlerInput;

    const sound = sounds[`${handlerInput.requestEnvelope.context.System.application.applicationId}`];
    const playBehavior = 'REPLACE_ALL';
    const url = `https://${process.env.base_url}/${sound}`;

    responseBuilder
      .addAudioPlayerPlayDirective(playBehavior, url, url, null, 0)
      .withShouldEndSession(true);

    return responseBuilder.getResponse();
  },
  stop(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
};

function getToken(handlerInput) {
  return handlerInput.requestEnvelope.request.token;
}

const skillBuilder = alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    StartPlaybackHandler,
    StopPlaybackHandler,
    AudioPlayerEventHandler,
    SessionEndedRequestHandler
  )
  .lambda();
