import getStripe from './commerce-provider.js';
import {checkoutUrls,parseCatalog} from './commerce-policy.js';
import {createCommerceService} from './commerce-service.js';
import {createCommerceHandlers} from './commerce-http.js';
const catalog=()=>parseCatalog(process.env.COCODING_PRICE_CATALOG);
const urls=()=>checkoutUrls(process.env.COCODING_COMMERCE_BASE_URL);
export const commerce=createCommerceService(getStripe,catalog,urls);
export const commerceHandlers=createCommerceHandlers(commerce,()=>{catalog();},()=>new URL(urls().success).origin);
