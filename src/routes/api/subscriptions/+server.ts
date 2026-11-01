import type {RequestHandler} from './$types';
import {commerceHandlers} from '#lib/server/commerce.js';
export const POST:RequestHandler=commerceHandlers.subscriptions.POST;
export const GET:RequestHandler=commerceHandlers.subscriptions.GET;
