import { useEffect } from 'preact/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { BoltSDK } from "@boltpay/bolt-js";
import { verifyPendingSession } from '../endpoints';

export function useBoltSessionVerification(isLoggedIn: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const checkPendingSessions = async () => {
      try {
        const pendingSessions = BoltSDK.gaming.getPendingSessions();
        
        if (pendingSessions.length === 0) {
          return;
        }

        if (pendingSessions.length > 5) {
          console.warn(`There are ${pendingSessions.length} pending sessions, consider batching the call to verify them`);
        }
        
        let sessionsResolved = 0;
        
        for (const session of pendingSessions) {
          try {
            const transactionResponse = await verifyPendingSession(session.paymentLinkId);
            BoltSDK.gaming.resolveSession(transactionResponse);
            sessionsResolved++;
          } catch (error) {
            console.log('Error verifying session:', session.paymentLinkId, error);
          }
        }

        if (sessionsResolved > 0) {
          console.log(`Resolved ${sessionsResolved} payment sessions, updating user profile`);
          // Invalidate user profile cache to refresh data
          await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
      } catch (error) {
        console.log('Error checking pending sessions:', error);
      }
    };

    checkPendingSessions();
  }, [isLoggedIn, queryClient]);
}
