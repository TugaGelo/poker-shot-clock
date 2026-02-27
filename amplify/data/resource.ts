import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Player: a.model({
    name: a.string().required(),
    totalProfit: a.float(),       
    gamesPlayed: a.integer(),
    status: a.enum(['ACTIVE', 'SITTING_OUT', 'GONE']), 
    lastSeen: a.date()
  }).authorization(allow => [allow.publicApiKey()]) 
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});
