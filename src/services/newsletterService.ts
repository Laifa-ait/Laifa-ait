import { apiPost } from "../lib/api";

export const subscribeToNewsletter = async (email: string) => {
  try {
    await apiPost<{ success: boolean }>("/api/v1/newsletter/subscribe", { email });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
      const errMsg = (err as { message: string }).message;
      if (errMsg.includes("ALREADY_SUBSCRIBED")) {
        throw new Error("ALREADY_SUBSCRIBED", { cause: err });
      }
    }
    throw err;
  }
};
