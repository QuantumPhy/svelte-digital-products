import type {RequestHandler} from './$types';
import {commerceHandlers} from '#lib/server/commerce.js';
export const POST:RequestHandler=commerceHandlers.intent.POST;
export const GET:RequestHandler=commerceHandlers.intent.GET;
