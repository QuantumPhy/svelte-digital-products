import type {RequestHandler} from './$types';
import {commerceHandlers} from '#lib/server/commerce.js';
export const GET:RequestHandler=commerceHandlers.subscription.GET;
export const PATCH:RequestHandler=commerceHandlers.subscription.PATCH;
export const DELETE:RequestHandler=commerceHandlers.subscription.DELETE;
export const PUT:RequestHandler=commerceHandlers.subscription.PUT;
