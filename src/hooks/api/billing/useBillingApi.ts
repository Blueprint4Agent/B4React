import { useMemo } from "react";

import * as billingApi from "../../../api/billing/billingApi";
import { extractBillingErrorCode } from "../../../api/billing/billingError";

export type {
    BillingConfig,
    BillingSetup,
    BillingSetupStatus,
    BillingPaymentMethods,
    BillingMethodType,
} from "../../../api/billing/billingApi";

export function useBillingApi() {
    return useMemo(() => ({ ...billingApi, extractBillingErrorCode }), []);
}
