import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	STRIPE_WEBHOOK_SECRET: { schema: (value) => value },
	PUBLIC_APP_URL: { public: true, schema: (value) => value },
	GITHUB_CLIENT_ID: { schema: (value) => value },
	GITHUB_CLIENT_SECRET: { schema: (value) => value },
	GITHUB_REDIRECT_URI: { schema: (value) => value },
	GOOGLE_CLIENT_ID: { schema: (value) => value },
	GOOGLE_CLIENT_SECRET: { schema: (value) => value },
	GOOGLE_REDIRECT_URI: { schema: (value) => value },
	PUBLIC_STRIPE_KEY: { public: true, schema: (value) => value }
});
